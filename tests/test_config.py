"""
설정(Config) 레이어 테스트
"""
import pytest
from backend.core.config import Settings, get_settings


class TestSettings:
  """Settings 설정 클래스 테스트"""

  def test_default_llm_provider(self):
    """기본 LLM 프로바이더 값 검증"""
    settings = Settings()
    assert settings.llm_provider == "azure_openai"

  def test_valid_providers(self):
    """허용된 프로바이더 값 목록 검증"""
    valid_providers = ["azure_openai", "openai", "anthropic", "ollama", "gemini"]
    for provider in valid_providers:
      settings = Settings(llm_provider=provider)
      assert settings.llm_provider == provider

  def test_invalid_provider_raises(self):
    """허용되지 않는 프로바이더 입력 시 ValidationError 발생"""
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
      Settings(llm_provider="unknown_provider")

  def test_cors_origins_wildcard(self):
    """CORS 와일드카드 설정 시 ['*'] 반환 검증"""
    settings = Settings(cors_origins="*")
    assert settings.cors_origins_list == ["*"]

  def test_cors_origins_list_parsing(self):
    """CORS 다중 오리진 파싱 검증"""
    settings = Settings(cors_origins="http://localhost:3000,http://localhost:8080")
    result = settings.cors_origins_list
    assert "http://localhost:3000" in result
    assert "http://localhost:8080" in result
    assert len(result) == 2

  def test_cors_origins_with_spaces(self):
    """CORS 오리진 값에 공백 포함 시 trim 처리 검증"""
    settings = Settings(cors_origins=" http://localhost:3000 , http://localhost:8080 ")
    result = settings.cors_origins_list
    assert "http://localhost:3000" in result
    assert "http://localhost:8080" in result

  def test_default_api_port(self):
    """기본 API 포트 8000 검증"""
    settings = Settings()
    assert settings.api_port == 8000

  def test_default_max_tokens(self):
    """기본 max_tokens 4096 검증"""
    settings = Settings()
    assert settings.max_tokens == 4096

  def test_gemini_model_default(self):
    """Gemini 기본 모델 이름 검증"""
    settings = Settings()
    assert settings.gemini_model == "gemini-2.0-flash"

  def test_anthropic_model_default(self):
    """Anthropic 기본 모델 이름 검증"""
    settings = Settings()
    assert settings.anthropic_model == "claude-sonnet-4-6"


class TestGetSettings:
  """get_settings 싱글톤 팩토리 테스트"""

  def test_returns_settings_instance(self):
    """Settings 인스턴스 반환 검증"""
    settings = get_settings()
    assert isinstance(settings, Settings)
