from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    tags=["comments"],
)

@router.post("/cards/{card_id}/comments", response_model=schemas.CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(
    card_id: str,
    comment: schemas.CommentCreate,
    db: DBSession = Depends(get_db)
):
    db_card = db.query(models.Card).filter(models.Card.card_id == card_id).first()
    if db_card is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    
    db_comment = models.Comment(**comment.dict(), card_id=card_id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment
