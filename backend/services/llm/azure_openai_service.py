from typing import AsyncGenerator
from openai import AsyncAzureOpenAI

from backend.core.config import Settings
from backend.schemas.chat import ChatMessage, ChatRequest, ChatResponse
from backend.services.llm.base import BaseLLMService


class AzureOpenAIService(BaseLLMService):

  def __init__(self, settings: Settings):
    self._settings = settings
    self._client = AsyncAzureOpenAI(
      api_key=settings.azure_openai_api_key,
      azure_endpoint=settings.azure_openai_endpoint,
      api_version=settings.azure_openai_api_version,
    )
    self._deployment = settings.azure_openai_deployment_name

  @property
  def provider_name(self) -> str:
    return "azure_openai"

  async def chat(self, request: ChatRequest) -> ChatResponse:
    messages = self._build_messages(request)
    response = await self._client.chat.completions.create(
      model=self._deployment,
      messages=messages,
      max_tokens=request.max_tokens or self._settings.max_tokens,
      temperature=request.temperature or self._settings.temperature,
    )
    content = response.choices[0].message.content or ""
    return ChatResponse(
      content=content,
      model=self._deployment,
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
      model=self._deployment,
      messages=messages,
      max_tokens=request.max_tokens or self._settings.max_tokens,
      temperature=request.temperature or self._settings.temperature,
      stream=True,
    )
    async for chunk in stream:
      if chunk.choices and chunk.choices[0].delta.content:
        yield chunk.choices[0].delta.content

  async def get_available_models(self) -> list[str]:
    return [self._deployment]

  def _build_messages(self, request: ChatRequest) -> list[dict]:
    messages = []
    if request.system_prompt:
      messages.append({"role": "system", "content": request.system_prompt})
    for msg in request.messages:
      messages.append({"role": msg.role, "content": msg.content})
    return messages
