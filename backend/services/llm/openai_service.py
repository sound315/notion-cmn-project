from typing import AsyncGenerator
from openai import AsyncOpenAI

from backend.core.config import Settings
from backend.schemas.chat import ChatRequest, ChatResponse
from backend.services.llm.base import BaseLLMService


class OpenAIService(BaseLLMService):

  def __init__(self, settings: Settings):
    self._settings = settings
    self._client = AsyncOpenAI(api_key=settings.openai_api_key)
    self._model = settings.openai_model

  @property
  def provider_name(self) -> str:
    return "openai"

  async def chat(self, request: ChatRequest) -> ChatResponse:
    messages = self._build_messages(request)
    response = await self._client.chat.completions.create(
      model=self._model,
      messages=messages,
      max_tokens=request.max_tokens or self._settings.max_tokens,
      temperature=request.temperature or self._settings.temperature,
    )
    content = response.choices[0].message.content or ""
    return ChatResponse(
      content=content,
      model=self._model,
      provider=self.provider_name,
      usage={
        "prompt_tokens": response.usage.prompt_tokens,
        "completion_tokens": response.usage.completion_tokens,
        "total_tokens": response.usage.total_tokens,
      },
    )

  async def stream_chat(self, request: ChatRequest) -> AsyncGenerator[str, None]:
    messages = self._build_messages(request)
    stream = await self._client.chat.completions.create(
      model=self._model,
      messages=messages,
      max_tokens=request.max_tokens or self._settings.max_tokens,
      temperature=request.temperature or self._settings.temperature,
      stream=True,
    )
    async for chunk in stream:
      if chunk.choices and chunk.choices[0].delta.content:
        yield chunk.choices[0].delta.content

  async def get_available_models(self) -> list[str]:
    models = await self._client.models.list()
    return [m.id for m in models.data if "gpt" in m.id]

  def _build_messages(self, request: ChatRequest) -> list[dict]:
    messages = []
    if request.system_prompt:
      messages.append({"role": "system", "content": request.system_prompt})
    for msg in request.messages:
      messages.append({"role": msg.role, "content": msg.content})
    return messages
