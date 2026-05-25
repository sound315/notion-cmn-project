from typing import Literal
from pydantic import BaseModel, Field
import uuid


class ChatMessage(BaseModel):
  role: Literal["user", "assistant", "system"]
  content: str


class ChatRequest(BaseModel):
  session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
  messages: list[ChatMessage]
  system_prompt: str | None = None
  max_tokens: int | None = None
  temperature: float | None = None
  stream: bool = False


class ChatResponse(BaseModel):
  content: str
  model: str
  provider: str
  usage: dict = Field(default_factory=dict)


class SessionCreateRequest(BaseModel):
  title: str = "새 대화"
  system_prompt: str | None = None


class SessionInfo(BaseModel):
  session_id: str
  title: str
  message_count: int
  created_at: str
  updated_at: str
