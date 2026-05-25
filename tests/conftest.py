"""
pytest 공통 픽스처 정의
"""
import pytest
from unittest.mock import AsyncMock, MagicMock
from backend.core.config import Settings


@pytest.fixture
def mock_settings() -> Settings:
  """테스트용 Settings 픽스처 - 실제 외부 서비스 키 불필요"""
  settings = Settings(
    llm_provider="openai",
    openai_api_key="test-key",
    openai_model="gpt-4o",
    anthropic_api_key="test-key",
    anthropic_model="claude-sonnet-4-6",
    gemini_api_key="test-key",
    gemini_model="gemini-2.0-flash",
    azure_openai_api_key="test-key",
    azure_openai_endpoint="https://test.openai.azure.com/",
    ollama_base_url="http://localhost:11434",
    ollama_model="llama3.2",
    redis_url="redis://localhost:6379",
    redis_ttl_seconds=86400,
    max_tokens=4096,
    temperature=0.7,
  )
  return settings
