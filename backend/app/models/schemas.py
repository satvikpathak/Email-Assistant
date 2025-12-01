"""Pydantic models for request/response validation."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Base user model."""

    email: EmailStr
    google_id: str


class UserCreate(UserBase):
    """User creation model."""

    refresh_token: str
    access_token: str | None = None
    token_expiry: datetime | None = None


class UserUpdate(BaseModel):
    """User update model."""

    refresh_token: str | None = None
    access_token: str | None = None
    token_expiry: datetime | None = None


class UserInDB(UserBase):
    """User model as stored in database."""

    id: UUID
    refresh_token: str
    access_token: str | None = None
    token_expiry: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserResponse(BaseModel):
    """User response model (without sensitive tokens)."""

    id: UUID
    email: EmailStr
    google_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """OAuth token response."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ChatMessage(BaseModel):
    """Chat message model."""

    role: str  # 'user' or 'assistant'
    content: str
    metadata: dict | None = None  # Optional metadata for context (email_id, etc.)


class ChatRequest(BaseModel):
    """Chat request from frontend."""

    message: str
    conversation_history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    """Chat response to frontend."""

    message: str
    action_taken: str | None = None
    metadata: dict | None = None
