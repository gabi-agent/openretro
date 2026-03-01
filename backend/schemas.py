from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- Session Schemas ---
class SessionBase(BaseModel):
    name: str = Field(..., max_length=100)

class SessionCreate(SessionBase):
    pass

class SessionResponse(SessionBase):
    session_id: str
    created_at: datetime
    cards: List["CardResponse"] = [] # Forward reference

    class Config:
        from_attributes = True

# --- Card Schemas ---
class CardBase(BaseModel):
    author: str = Field(..., max_length=100)
    column_type: str = Field(..., pattern="^(good|better|actions)$")
    text: str = Field(..., max_length=500)

class CardCreate(CardBase):
    pass

class CardUpdate(BaseModel):
    text: Optional[str] = Field(None, max_length=500)
    position: Optional[int] = None
    column_type: Optional[str] = Field(None, pattern="^(good|better|actions)$")

class CardResponse(CardBase):
    card_id: str
    session_id: str
    position: int
    merged_into: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    comments: List["CommentResponse"] = [] # Forward reference

    class Config:
        from_attributes = True

class CardMergeRequest(BaseModel):
    into_card_id: str

class CardMergeResponse(BaseModel):
    merged_card_id: str
    into_card_id: str
    merged_text: str

# --- Comment Schemas ---
class CommentBase(BaseModel):
    author: str = Field(..., max_length=100)
    text: str = Field(..., max_length=300)

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    comment_id: str
    card_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Update forward refs
SessionResponse.model_rebuild()
CardResponse.model_rebuild()
