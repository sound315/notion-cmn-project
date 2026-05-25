from abc import ABC, abstractmethod
from typing import AsyncGenerator
from backend.schemas.chat import ChatMessage, ChatRequest, ChatResponse


class BaseLLMService(ABC):
  """모든 LLM 프로바이더가 구현해야 하는 인터페이스"""

  @abstractmethod
  async def chat(self, request: ChatRequest) -> ChatResponse:
    """단일 응답 채팅"""
    ...

  @abstractmethod
  async def stream_chat(self, request: ChatRequest) -> AsyncGenerator[str, None]:
    """스트리밍 채팅 - 토큰 단위로 yield"""
    ...

  @abstractmethod
  async def get_available_models(self) -> list[str]:
    """사용 가능한 모델 목록 반환"""
    ...

  @property
  @abstractmethod
  def provider_name(self) -> str:
    """프로바이더 이름"""
    ...
