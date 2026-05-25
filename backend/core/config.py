from functools import lru_cache
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

  # 앱 기본 설정
  app_name: str = "LLM Chatbot"
  app_version: str = "1.0.0"
  debug: bool = True
  secret_key: str = "change-me-in-production"

  # LLM 프로바이더 선택
  llm_provider: Literal["azure_openai", "openai", "anthropic", "ollama", "gemini"] = "azure_openai"

  # Azure OpenAI
  azure_openai_api_key: str = ""
  azure_openai_endpoint: str = ""
  azure_openai_api_version: str = "2024-02-01"
  azure_openai_deployment_name: str = "gpt-4o"
  azure_openai_embedding_deployment: str = "text-embedding-3-small"

  # OpenAI
  openai_api_key: str = ""
  openai_model: str = "gpt-4o"

  # Anthropic
  anthropic_api_key: str = ""
  anthropic_model: str = "claude-sonnet-4-6"

  # Ollama
  ollama_base_url: str = "http://localhost:11434"
  ollama_model: str = "llama3.2"

  # Gemini
  gemini_api_key: str = ""
  gemini_model: str = "gemini-2.0-flash"

  # FastAPI
  api_host: str = "0.0.0.0"
  api_port: int = 8000
  api_reload: bool = True

  # CORS / iframe
  cors_origins: str = "*"
  allow_iframe_origins: str = "*"

  # Redis
  redis_url: str = "redis://localhost:6379"
  redis_ttl_seconds: int = 86400

  # Streamlit
  streamlit_port: int = 8501
  api_base_url: str = "http://localhost:8000"

  # LLM 파라미터
  max_tokens: int = 4096
  temperature: float = 0.7

  @property
  def cors_origins_list(self) -> list[str]:
    if self.cors_origins.strip() == "*":
      return ["*"]
    return [o.strip() for o in self.cors_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
  return Settings()
