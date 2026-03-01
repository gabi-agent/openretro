from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    tags=["sessions"],
)

@router.post("/sessions", response_model=schemas.SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(session: schemas.SessionCreate, db: DBSession = Depends(get_db)):
    db_session = models.Session(name=session.name)
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.get("/sessions/{session_id}", response_model=schemas.SessionResponse)
def get_session(session_id: str, db: DBSession = Depends(get_db)):
    db_session = db.query(models.Session).filter(models.Session.session_id == session_id).first()
    if db_session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return db_session
