from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

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
    text: str = Field(..., max_length=2000)

class CardCreate(CardBase):
    pass

class CardUpdate(BaseModel):
    text: Optional[str] = Field(None, max_length=2000)
    position: Optional[int] = None
    column_type: Optional[str] = Field(None, pattern="^(good|better|actions)$")
    status: Optional[str] = Field(None, pattern="^(open|in_progress|resolved)$")

class CardResponse(CardBase):
    card_id: str
    session_id: str
    position: int
    merged_into: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    comments: List["CommentResponse"] = [] # Forward reference
    links: List["CardLinkResponse"] = []

    class Config:
        from_attributes = True

class CardLinkRequest(BaseModel):
    action_card_id: str
    better_card_id: str
    author: str

class CardLinkResponse(BaseModel):
    link_id: str
    action_card_id: str
    better_card_id: str
    created_at: datetime
    created_by: str

    class Config:
        from_attributes = True

class CardStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(open|in_progress|resolved)$")

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
CardLinkResponse.model_rebuild()

# --- Token Usage Schemas ---
class TokenUsageBase(BaseModel):
    project_id: str = Field(..., max_length=100)
    agent: str = Field(..., max_length=50)
    model: str = Field(..., max_length=100)
    input_tokens: int = Field(default=0, ge=0)
    output_tokens: int = Field(default=0, ge=0)
    total_tokens: int = Field(default=0, ge=0)
    cost: float = Field(default=0.0, ge=0.0)
    description: Optional[str] = Field(None, max_length=500)

class TokenUsageCreate(TokenUsageBase):
    pass

class TokenUsageResponse(TokenUsageBase):
    usage_id: str
    timestamp: datetime

    class Config:
        from_attributes = True

# Aggregation response for Token Dashboard
class TokenProjectSummary(BaseModel):
    project_id: str
    total_tokens: int
    total_cost: float
    agent_count: int
    record_count: int

class TokenAgentSummary(BaseModel):
    agent: str
    total_tokens: int
    total_cost: float
    model_count: int

class TokenModelSummary(BaseModel):
    model: str
    total_tokens: int
    total_cost: float

class TokenDashboardResponse(BaseModel):
    project_id: str
    summary: TokenProjectSummary
    by_agent: List[TokenAgentSummary]
    by_model: List[TokenModelSummary]
    by_date: List[dict]  # [{date: "2026-03-03", tokens: 1000, cost: 0.05}]
