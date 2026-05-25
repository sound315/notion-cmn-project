from typing import AsyncGenerator
import httpx

from backend.core.config import Settings
from backend.schemas.chat import ChatRequest, ChatResponse
from backend.services.llm.base import BaseLLMService


class OllamaService(BaseLLMService):

  def __init__(self, settings: Settings):
    self._settings = settings
    self._base_url = settings.ollama_base_url
    self._model = settings.ollama_model

  @property
  def provider_name(self) -> str:
    return "ollama"

  async def chat(self, request: ChatRequest) -> ChatResponse:
    messages = self._build_messages(request)
    async with httpx.AsyncClient(timeout=120) as client:
      response = await client.post(
        f"{self._base_url}/api/chat",
        json={"model": self._model, "messages": messages, "stream": False},
      )
      response.raise_for_status()
      data = response.json()
    return ChatResponse(
      content=data["message"]["content"],
      model=self._model,
      provider=self.provider_name,
      usage={
        "prompt_tokens": data.get("prompt_eval_count", 0),
        "completion_tokens": data.get("eval_count", 0),
        "total_tokens": data.get("prompt_eval_count", 0) + data.get("eval_count", 0),
      },
    )

  async def stream_chat(self, request: ChatRequest) -> AsyncGenerator[str, None]:
    messages = self._build_messages(request)
    async with httpx.AsyncClient(timeout=120) as client:
      async with client.stream(
        "POST",
        f"{self._base_url}/api/chat",
        json={"model": self._model, "messages": messages, "stream": True},
      ) as response:
        response.raise_for_status()
        async for line in response.aiter_lines():
          if line:
            import json
            data = json.loads(line)
            if not data.get("done") and data.get("message", {}).get("content"):
              yield data["message"]["content"]

  async def get_available_models(self) -> list[str]:
    async with httpx.AsyncClient(timeout=10) as client:
      response = await client.get(f"{self._base_url}/api/tags")
      response.raise_for_status()
      data = response.json()
    return [m["name"] for m in data.get("models", [])]

  def _build_messages(self, request: ChatRequest) -> list[dict]:
    messages = []
    if request.system_prompt:
      messages.append({"role": "system", "content": request.system_prompt})
    for msg in request.messages:
      messages.append({"role": msg.role, "content": msg.content})
    return messages
