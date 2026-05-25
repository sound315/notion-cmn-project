"""
LLMServiceFactory 단위 테스트 - Mock을 사용한 프로바이더 생성 검증
"""
import pytest
from unittest.mock import patch, MagicMock

from backend.core.config import Settings
from backend.services.llm.factory import LLMServiceFactory
from backend.services.llm.base import BaseLLMService

# patch 대상 경로 고정을 위해 모듈을 미리 임포트
import backend.services.llm.openai_service
import backend.services.llm.anthropic_service
import backend.services.llm.gemini_service
import backend.services.llm.azure_openai_service
import backend.services.llm.ollama_service


class TestLLMServiceFactory:
  """LLMServiceFactory 프로바이더 생성 팩토리 테스트"""

  def test_create_openai_service(self):
    """openai 프로바이더 설정 시 OpenAIService 인스턴스 생성 검증"""
    settings = Settings(llm_provider="openai", openai_api_key="test-key")
    with patch("backend.services.llm.openai_service.AsyncOpenAI"):
      service = LLMServiceFactory.create(settings)
      assert service.provider_name == "openai"

  def test_create_anthropic_service(self):
    """anthropic 프로바이더 설정 시 AnthropicService 인스턴스 생성 검증"""
    settings = Settings(llm_provider="anthropic", anthropic_api_key="test-key")
    with patch("backend.services.llm.anthropic_service.anthropic.AsyncAnthropic"):
      service = LLMServiceFactory.create(settings)
      assert service.provider_name == "anthropic"

  def test_create_gemini_service(self):
    """gemini 프로바이더 설정 시 GeminiService 인스턴스 생성 검증"""
    settings = Settings(llm_provider="gemini", gemini_api_key="test-key")
    with patch("backend.services.llm.gemini_service.genai"):
      service = LLMServiceFactory.create(settings)
      assert service.provider_name == "gemini"

  def test_create_ollama_service(self):
    """ollama 프로바이더 설정 시 OllamaService 인스턴스 생성 검증"""
    settings = Settings(llm_provider="ollama")
    # OllamaService는 외부 패키지 의존성 없이 httpx만 사용하므로 직접 생성 가능
    service = LLMServiceFactory.create(settings)
    assert service.provider_name == "ollama"

  def test_create_azure_openai_service(self):
    """azure_openai 프로바이더 설정 시 AzureOpenAIService 인스턴스 생성 검증"""
    settings = Settings(
      llm_provider="azure_openai",
      azure_openai_api_key="test-key",
      azure_openai_endpoint="https://test.openai.azure.com/",
    )
    with patch("backend.services.llm.azure_openai_service.AsyncAzureOpenAI"):
      service = LLMServiceFactory.create(settings)
      assert service.provider_name == "azure_openai"

  def test_unsupported_provider_raises_value_error(self):
    """지원하지 않는 프로바이더 입력 시 ValueError 발생 검증"""
    # Settings 유효성 검사를 우회하여 factory 내부 로직 직접 테스트
    settings = MagicMock(spec=Settings)
    settings.llm_provider = "unsupported_provider"
    with pytest.raises(ValueError, match="지원하지 않는 LLM 프로바이더"):
      LLMServiceFactory.create(settings)

  def test_service_inherits_base(self):
    """생성된 서비스가 BaseLLMService를 상속하는지 검증"""
    settings = Settings(llm_provider="openai", openai_api_key="test-key")
    with patch("backend.services.llm.openai_service.AsyncOpenAI"):
      service = LLMServiceFactory.create(settings)
      assert isinstance(service, BaseLLMService)
