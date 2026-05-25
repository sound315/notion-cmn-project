from fastapi import Depends
from functools import lru_cache

from backend.core.config import Settings, get_settings
from backend.services.llm.base import BaseLLMService
from backend.services.llm.factory import LLMServiceFactory
from backend.repositories.session_repository import SessionRepository


@lru_cache
def get_llm_service(settings: Settings = Depends(get_settings)) -> BaseLLMService:
  """LLM 서비스 의존성 주입 - 프로바이더 변경 시 이 함수만 수정"""
  return LLMServiceFactory.create(settings)


def get_session_repository(settings: Settings = Depends(get_settings)) -> SessionRepository:
  return SessionRepository(settings.redis_url, settings.redis_ttl_seconds)
