from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession
from sqlalchemy.sql import func

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    tags=["cards"],
)

@router.post("/sessions/{session_id}/cards", response_model=schemas.CardResponse, status_code=status.HTTP_201_CREATED)
def create_card(
    session_id: str,
    card: schemas.CardCreate,
    db: DBSession = Depends(get_db)
):
    db_session = db.query(models.Session).filter(models.Session.session_id == session_id).first()
    if db_session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    
    db_card = models.Card(**card.dict(), session_id=session_id)
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card

@router.put("/cards/{card_id}", response_model=schemas.CardResponse)
def update_card(
    card_id: str,
    card: schemas.CardUpdate,
    db: DBSession = Depends(get_db)
):
    db_card = db.query(models.Card).filter(models.Card.card_id == card_id).first()
    if db_card is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    
    for key, value in card.dict(exclude_unset=True).items():
        setattr(db_card, key, value)
    
    db.commit()
    db.refresh(db_card)
    return db_card

@router.delete("/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(card_id: str, db: DBSession = Depends(get_db)):
    db_card = db.query(models.Card).filter(models.Card.card_id == card_id).first()
    if db_card is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    
    db.delete(db_card)
    db.commit()
    return

@router.post("/cards/{card_id}/merge", response_model=schemas.CardMergeResponse)
def merge_cards(
    card_id: str,
    merge_request: schemas.CardMergeRequest,
    db: DBSession = Depends(get_db)
):
    card_to_merge = db.query(models.Card).filter(models.Card.card_id == card_id).first()
    target_card = db.query(models.Card).filter(models.Card.card_id == merge_request.into_card_id).first()

    if card_to_merge is None or target_card is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="One or both cards not found")
    
    if card_to_merge.session_id != target_card.session_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cards must be in the same session to merge")
    
    # Append text of card_to_merge into target_card with separator, stripping extra whitespace
    target_card.text = target_card.text.strip() + "\n------------------\n" + card_to_merge.text.strip()
    target_card.updated_at = func.now() # Update timestamp

    # Move comments from card_to_merge to target_card
    for comment in card_to_merge.comments:
        comment.card_id = target_card.card_id
        db.add(comment) # Re-add to session to ensure update is tracked

    # Mark card_to_merge as merged
    card_to_merge.merged_into = target_card.card_id
    card_to_merge.updated_at = func.now() # Update timestamp

    db.commit()
    db.refresh(target_card)
    # No need to refresh card_to_merge if it will be marked as merged and eventually not displayed
    # db.refresh(card_to_merge)


    return schemas.CardMergeResponse(
        merged_card_id=card_id,
        into_card_id=merge_request.into_card_id,
        merged_text=target_card.text
    )
