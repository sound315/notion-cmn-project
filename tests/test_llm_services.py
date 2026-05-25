"""
LLM 서비스 단위 테스트 - 외부 API 호출 없이 Mock으로 검증
"""
import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, MagicMock, patch

from backend.core.config import Settings
from backend.schemas.chat import ChatMessage, ChatRequest, ChatResponse

# patch 대상 모듈을 미리 임포트하여 경로 해석 가능하도록 준비
import backend.services.llm.openai_service
import backend.services.llm.anthropic_service
import backend.services.llm.gemini_service
import backend.services.llm.azure_openai_service


def make_request(messages=None, system_prompt=None):
  """테스트용 ChatRequest 생성 헬퍼"""
  if messages is None:
    messages = [ChatMessage(role="user", content="안녕하세요")]
  return ChatRequest(messages=messages, system_prompt=system_prompt)


class TestGeminiService:
  """GeminiService 단위 테스트"""

  def _make_service(self, settings: Settings):
    with patch("backend.services.llm.gemini_service.genai") as mock_genai:
      mock_genai.GenerativeModel.return_value = MagicMock()
      from backend.services.llm.gemini_service import GeminiService
      service = GeminiService(settings)
      return service, mock_genai

  def test_provider_name(self):
    """provider_name이 'gemini' 반환 검증"""
    settings = Settings(llm_provider="gemini", gemini_api_key="test-key")
    with patch("backend.services.llm.gemini_service.genai"):
      from backend.services.llm.gemini_service import GeminiService
      service = GeminiService(settings)
      assert service.provider_name == "gemini"

  def test_build_history_no_system_prompt(self):
    """system_prompt 없을 때 history가 비어있는지 검증"""
    settings = Settings(llm_provider="gemini", gemini_api_key="test-key")
    with patch("backend.services.llm.gemini_service.genai"):
      from backend.services.llm.gemini_service import GeminiService
      service = GeminiService(settings)
      request = make_request(
        messages=[
          ChatMessage(role="user", content="첫 번째"),
          ChatMessage(role="assistant", content="응답"),
          ChatMessage(role="user", content="두 번째"),
        ]
      )
      history, last_msg = service._build_history(request)
      # 마지막 메시지는 last_msg로 분리
      assert last_msg == "두 번째"
      # history에는 마지막 메시지 제외한 2개
      assert len(history) == 2

  def test_build_history_with_system_prompt(self):
    """system_prompt가 있을 때 history에 user/model 쌍으로 추가 검증"""
    settings = Settings(llm_provider="gemini", gemini_api_key="test-key")
    with patch("backend.services.llm.gemini_service.genai"):
      from backend.services.llm.gemini_service import GeminiService
      service = GeminiService(settings)
      request = make_request(
        messages=[ChatMessage(role="user", content="질문")],
        system_prompt="당신은 도우미입니다.",
      )
      history, last_msg = service._build_history(request)
      # system_prompt → user/model 교환 2개 추가
      assert len(history) == 2
      assert history[0]["role"] == "user"
      assert history[0]["parts"] == ["당신은 도우미입니다."]
      assert history[1]["role"] == "model"

  def test_build_history_empty_messages(self):
    """빈 메시지 리스트 처리 검증"""
    settings = Settings(llm_provider="gemini", gemini_api_key="test-key")
    with patch("backend.services.llm.gemini_service.genai"):
      from backend.services.llm.gemini_service import GeminiService
      service = GeminiService(settings)
      request = make_request(messages=[])
      history, last_msg = service._build_history(request)
      assert last_msg == ""

  @pytest.mark.asyncio
  async def test_chat_returns_chat_response(self):
    """chat() 메서드가 ChatResponse를 반환하는지 검증"""
    settings = Settings(llm_provider="gemini", gemini_api_key="test-key")
    with patch("backend.services.llm.gemini_service.genai") as mock_genai:
      # Gemini 응답 객체 Mock 구성
      mock_response = MagicMock()
      mock_response.text = "Gemini 응답입니다"
      mock_response.usage_metadata.prompt_token_count = 10
      mock_response.usage_metadata.candidates_token_count = 20
      mock_response.usage_metadata.total_token_count = 30

      mock_chat = MagicMock()
      mock_chat.send_message_async = AsyncMock(return_value=mock_response)

      mock_model = MagicMock()
      mock_model.start_chat.return_value = mock_chat
      mock_genai.GenerativeModel.return_value = mock_model

      from backend.services.llm.gemini_service import GeminiService
      service = GeminiService(settings)
      request = make_request()
      result = await service.chat(request)

      assert isinstance(result, ChatResponse)
      assert result.content == "Gemini 응답입니다"
      assert result.provider == "gemini"
      assert result.usage["total_tokens"] == 30


class TestAnthropicService:
  """AnthropicService 단위 테스트"""

  def test_provider_name(self):
    """provider_name이 'anthropic' 반환 검증"""
    settings = Settings(llm_provider="anthropic", anthropic_api_key="test-key")
    with patch("backend.services.llm.anthropic_service.anthropic.AsyncAnthropic"):
      from backend.services.llm.anthropic_service import AnthropicService
      service = AnthropicService(settings)
      assert service.provider_name == "anthropic"

  def test_get_available_models(self):
    """사용 가능한 모델 목록 반환 검증"""
    settings = Settings(llm_provider="anthropic", anthropic_api_key="test-key")
    with patch("backend.services.llm.anthropic_service.anthropic.AsyncAnthropic"):
      from backend.services.llm.anthropic_service import AnthropicService
      service = AnthropicService(settings)

    async def run():
      models = await service.get_available_models()
      return models

    import asyncio
    models = asyncio.get_event_loop().run_until_complete(run())
    assert isinstance(models, list)
    assert len(models) > 0
    assert "claude-sonnet-4-6" in models

  def test_build_messages(self):
    """_build_messages()가 올바른 포맷으로 변환하는지 검증"""
    settings = Settings(llm_provider="anthropic", anthropic_api_key="test-key")
    with patch("backend.services.llm.anthropic_service.anthropic.AsyncAnthropic"):
      from backend.services.llm.anthropic_service import AnthropicService
      service = AnthropicService(settings)
    request = make_request(
      messages=[
        ChatMessage(role="user", content="질문"),
        ChatMessage(role="assistant", content="답변"),
      ]
    )
    messages = service._build_messages(request)
    assert messages == [
      {"role": "user", "content": "질문"},
      {"role": "assistant", "content": "답변"},
    ]


class TestOpenAIService:
  """OpenAIService 단위 테스트"""

  def test_provider_name(self):
    """provider_name이 'openai' 반환 검증"""
    settings = Settings(llm_provider="openai", openai_api_key="test-key")
    with patch("backend.services.llm.openai_service.AsyncOpenAI"):
      from backend.services.llm.openai_service import OpenAIService
      service = OpenAIService(settings)
      assert service.provider_name == "openai"

  def test_build_messages_with_system_prompt(self):
    """system_prompt 포함 시 messages 앞에 system role 추가 검증"""
    settings = Settings(llm_provider="openai", openai_api_key="test-key")
    with patch("backend.services.llm.openai_service.AsyncOpenAI"):
      from backend.services.llm.openai_service import OpenAIService
      service = OpenAIService(settings)
    request = make_request(
      messages=[ChatMessage(role="user", content="질문")],
      system_prompt="시스템 프롬프트",
    )
    messages = service._build_messages(request)
    assert messages[0]["role"] == "system"
    assert messages[0]["content"] == "시스템 프롬프트"
    assert messages[1]["role"] == "user"

  def test_build_messages_without_system_prompt(self):
    """system_prompt 없을 때 첫 번째 메시지가 user role인지 검증"""
    settings = Settings(llm_provider="openai", openai_api_key="test-key")
    with patch("backend.services.llm.openai_service.AsyncOpenAI"):
      from backend.services.llm.openai_service import OpenAIService
      service = OpenAIService(settings)
    request = make_request()
    messages = service._build_messages(request)
    assert messages[0]["role"] == "user"


class TestOllamaService:
  """OllamaService 단위 테스트"""

  def test_provider_name(self):
    """provider_name이 'ollama' 반환 검증"""
    settings = Settings(llm_provider="ollama")
    from backend.services.llm.ollama_service import OllamaService
    service = OllamaService(settings)
    assert service.provider_name == "ollama"

  def test_build_messages_with_system_prompt(self):
    """system_prompt 포함 시 system role 메시지 추가 검증"""
    settings = Settings(llm_provider="ollama")
    from backend.services.llm.ollama_service import OllamaService
    service = OllamaService(settings)
    request = make_request(
      messages=[ChatMessage(role="user", content="안녕")],
      system_prompt="시스템 안내",
    )
    messages = service._build_messages(request)
    assert messages[0]["role"] == "system"
    assert messages[0]["content"] == "시스템 안내"

  def test_build_messages_without_system_prompt(self):
    """system_prompt 없을 때 user 메시지만 포함 검증"""
    settings = Settings(llm_provider="ollama")
    from backend.services.llm.ollama_service import OllamaService
    service = OllamaService(settings)
    request = make_request()
    messages = service._build_messages(request)
    assert len(messages) == 1
    assert messages[0]["role"] == "user"


class TestAzureOpenAIService:
  """AzureOpenAIService 단위 테스트"""

  def test_provider_name(self):
    """provider_name이 'azure_openai' 반환 검증"""
    settings = Settings(
      llm_provider="azure_openai",
      azure_openai_api_key="test-key",
      azure_openai_endpoint="https://test.openai.azure.com/",
    )
    with patch("backend.services.llm.azure_openai_service.AsyncAzureOpenAI"):
      from backend.services.llm.azure_openai_service import AzureOpenAIService
      service = AzureOpenAIService(settings)
      assert service.provider_name == "azure_openai"

  @pytest.mark.asyncio
  async def test_get_available_models_returns_deployment(self):
    """get_available_models()가 배포 이름을 반환하는지 검증"""
    settings = Settings(
      llm_provider="azure_openai",
      azure_openai_api_key="test-key",
      azure_openai_endpoint="https://test.openai.azure.com/",
      azure_openai_deployment_name="gpt-4o",
    )
    with patch("backend.services.llm.azure_openai_service.AsyncAzureOpenAI"):
      from backend.services.llm.azure_openai_service import AzureOpenAIService
      service = AzureOpenAIService(settings)
      models = await service.get_available_models()
      assert "gpt-4o" in models
