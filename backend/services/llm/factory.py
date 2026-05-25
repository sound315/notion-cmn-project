from backend.core.config import Settings
from backend.services.llm.base import BaseLLMService


class LLMServiceFactory:
  """프로바이더 설정에 따라 적절한 LLM 서비스를 생성"""

  @staticmethod
  def create(settings: Settings) -> BaseLLMService:
    provider = settings.llm_provider

    if provider == "azure_openai":
      from backend.services.llm.azure_openai_service import AzureOpenAIService
      return AzureOpenAIService(settings)

    if provider == "openai":
      from backend.services.llm.openai_service import OpenAIService
      return OpenAIService(settings)

    if provider == "anthropic":
      from backend.services.llm.anthropic_service import AnthropicService
      return AnthropicService(settings)

    if provider == "ollama":
      from backend.services.llm.ollama_service import OllamaService
      return OllamaService(settings)

    if provider == "gemini":
      from backend.services.llm.gemini_service import GeminiService
      return GeminiService(settings)

    raise ValueError(f"지원하지 않는 LLM 프로바이더: {provider}")
