from typing import AsyncGenerator
import google.generativeai as genai

from backend.core.config import Settings
from backend.schemas.chat import ChatRequest, ChatResponse
from backend.services.llm.base import BaseLLMService


class GeminiService(BaseLLMService):

  def __init__(self, settings: Settings):
    self._settings = settings
    genai.configure(api_key=settings.gemini_api_key)
    self._model_name = settings.gemini_model
    self._client = genai.GenerativeModel(self._model_name)

  @property
  def provider_name(self) -> str:
    return "gemini"

  async def chat(self, request: ChatRequest) -> ChatResponse:
    history, last_message = self._build_history(request)
    chat = self._client.start_chat(history=history)
    response = await chat.send_message_async(last_message)
    content = response.text or ""
    return ChatResponse(
      content=content,
      model=self._model_name,
      provider=self.provider_name,
      usage={
        "prompt_tokens": response.usage_metadata.prompt_token_count,
        "completion_tokens": response.usage_metadata.candidates_token_count,
        "total_tokens": response.usage_metadata.total_token_count,
      },
    )

  async def stream_chat(self, request: ChatRequest) -> AsyncGenerator[str, None]:
    history, last_message = self._build_history(request)
    chat = self._client.start_chat(history=history)
    stream = await chat.send_message_async(last_message, stream=True)
    async for chunk in stream:
      if chunk.text:
        yield chunk.text

  async def get_available_models(self) -> list[str]:
    models = genai.list_models()
    return [m.name for m in models if "generateContent" in m.supported_generation_methods]

  def _build_history(self, request: ChatRequest) -> tuple[list[dict], str]:
    """Gemini 형식의 대화 이력과 마지막 메시지를 분리해서 반환"""
    history = []

    # system_prompt를 첫 번째 user/model 교환으로 처리
    if request.system_prompt:
      history.append({"role": "user", "parts": [request.system_prompt]})
      history.append({"role": "model", "parts": ["알겠습니다."]})

    messages = list(request.messages)
    # 마지막 user 메시지는 send_message로 전달
    for msg in messages[:-1]:
      role = "model" if msg.role == "assistant" else "user"
      history.append({"role": role, "parts": [msg.content]})

    last_message = messages[-1].content if messages else ""
    return history, last_message
