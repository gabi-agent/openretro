from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from .database import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    cards = relationship("Card", back_populates="session", cascade="all, delete-orphan")

class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("sessions.session_id"), nullable=False)
    author = Column(String(100), nullable=False)
    column_type = Column(String(20), nullable=False) # 'good', 'better', 'actions'
    text = Column(String, nullable=False)
    position = Column(Integer, default=0)
    merged_into = Column(String(36), ForeignKey("cards.card_id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    session = relationship("Session", back_populates="cards")
    comments = relationship("Comment", back_populates="card", cascade="all, delete-orphan")
    merged_target = relationship("Card", remote_side=[card_id], uselist=False)

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    card_id = Column(String(36), ForeignKey("cards.card_id"), nullable=False)
    author = Column(String(100), nullable=False)
    text = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    card = relationship("Card", back_populates="comments")
