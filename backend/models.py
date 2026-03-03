from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
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
    status = Column(String(20), default="open")  # 'open', 'in_progress', 'resolved' - Issue #4
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    session = relationship("Session", back_populates="cards")
    comments = relationship("Comment", back_populates="card", cascade="all, delete-orphan")
    merged_target = relationship("Card", remote_side=[card_id], uselist=False)
    
    # Issue #4: Link relationships
    action_links = relationship("CardLink", foreign_keys="CardLink.action_card_id", back_populates="action_card")
    better_links = relationship("CardLink", foreign_keys="CardLink.better_card_id", back_populates="better_card")

class CardLink(Base):
    """Issue #4: Relationship table for Action ↔ Better card links"""
    __tablename__ = "card_links"

    id = Column(Integer, primary_key=True, index=True)
    link_id = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    action_card_id = Column(String(36), ForeignKey("cards.card_id"), nullable=False)
    better_card_id = Column(String(36), ForeignKey("cards.card_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String(100), nullable=False)

    action_card = relationship("Card", foreign_keys=[action_card_id], back_populates="action_links")
    better_card = relationship("Card", foreign_keys=[better_card_id], back_populates="better_links")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    card_id = Column(String(36), ForeignKey("cards.card_id"), nullable=False)
    author = Column(String(100), nullable=False)
    text = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    card = relationship("Card", back_populates="comments")

class TokenUsage(Base):
    """Token Dashboard: Track API token usage per project and agent"""
    __tablename__ = "token_usage"

    id = Column(Integer, primary_key=True, index=True)
    usage_id = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(100), index=True, nullable=False)  # e.g., "openretro", "openclaw", etc.
    agent = Column(String(50), index=True, nullable=False)  # e.g., "vinicius", "veras", "nunes"
    model = Column(String(100), nullable=False)  # e.g., "gpt-4", "gpt-3.5-turbo"
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    cost = Column(Float, default=0.0)  # Changed from Integer to Float for sqlite compatibility
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    description = Column(String(500), nullable=True)  # Optional description of the operation
