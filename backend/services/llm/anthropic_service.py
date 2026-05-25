from typing import AsyncGenerator
import anthropic

from backend.core.config import Settings
from backend.schemas.chat import ChatRequest, ChatResponse
from backend.services.llm.base import BaseLLMService


class AnthropicService(BaseLLMService):

  def __init__(self, settings: Settings):
    self._settings = settings
    self._client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    self._model = settings.anthropic_model

  @property
  def provider_name(self) -> str:
    return "anthropic"

  async def chat(self, request: ChatRequest) -> ChatResponse:
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    response = await self._client.messages.create(
      model=self._model,
      max_tokens=request.max_tokens or self._settings.max_tokens,
      system=request.system_prompt or "",
      messages=messages,
    )
    content = response.content[0].text if response.content else ""
    return ChatResponse(
      content=content,
      model=self._model,
      provider=self.provider_name,
      usage={
        "prompt_tokens": response.usage.input_tokens,
        "completion_tokens": response.usage.output_tokens,
        "total_tokens": response.usage.input_tokens + response.usage.output_tokens,
      },
    )

  async def stream_chat(self, request: ChatRequest) -> AsyncGenerator[str, None]:
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    async with self._client.messages.stream(
      model=self._model,
      max_tokens=request.max_tokens or self._settings.max_tokens,
      system=request.system_prompt or "",
      messages=messages,
    ) as stream:
      async for text in stream.text_stream:
        yield text

  async def get_available_models(self) -> list[str]:
    return ["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"]

  def _build_messages(self, request: ChatRequest) -> list[dict]:
    return [{"role": m.role, "content": m.content} for m in request.messages]
