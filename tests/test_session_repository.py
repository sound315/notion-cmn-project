"""
SessionRepository 단위 테스트 - Redis Mock을 사용하여 외부 의존성 제거
"""
import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from backend.repositories.session_repository import SessionRepository
from backend.schemas.chat import ChatMessage


@pytest.fixture
def mock_redis():
  """Redis 클라이언트 Mock 픽스처"""
  client = AsyncMock()
  return client


@pytest.fixture
def repo():
  """테스트용 SessionRepository 픽스처"""
  return SessionRepository(redis_url="redis://localhost:6379", ttl_seconds=3600)


class TestSessionRepository:
  """SessionRepository 메서드 단위 테스트"""

  @pytest.mark.asyncio
  async def test_get_messages_returns_empty_when_no_data(self, repo, mock_redis):
    """Redis에 데이터가 없을 때 빈 리스트 반환 검증"""
    mock_redis.get.return_value = None
    with patch.object(repo, "_get_client", return_value=mock_redis):
      result = await repo.get_messages("test-session")
      assert result == []

  @pytest.mark.asyncio
  async def test_get_messages_parses_stored_data(self, repo, mock_redis):
    """Redis에 저장된 메시지 JSON을 ChatMessage 리스트로 파싱 검증"""
    stored = [
      {"role": "user", "content": "안녕"},
      {"role": "assistant", "content": "반갑습니다"},
    ]
    mock_redis.get.return_value = json.dumps(stored)
    with patch.object(repo, "_get_client", return_value=mock_redis):
      result = await repo.get_messages("test-session")
      assert len(result) == 2
      assert isinstance(result[0], ChatMessage)
      assert result[0].role == "user"
      assert result[0].content == "안녕"
      assert result[1].role == "assistant"

  @pytest.mark.asyncio
  async def test_save_messages_calls_redis_set(self, repo, mock_redis):
    """save_messages()가 Redis set을 올바른 키로 호출하는지 검증"""
    messages = [ChatMessage(role="user", content="테스트")]
    with patch.object(repo, "_get_client", return_value=mock_redis):
      await repo.save_messages("test-session", messages)
      # 메시지 저장 호출 확인
      assert mock_redis.set.call_count >= 1
      call_args = mock_redis.set.call_args_list[0]
      assert "session:test-session:messages" in call_args[0]

  @pytest.mark.asyncio
  async def test_append_messages_combines_existing_and_new(self, repo, mock_redis):
    """append_messages()가 기존 메시지와 새 메시지를 합산하는지 검증"""
    existing = [{"role": "user", "content": "기존"}]
    mock_redis.get.return_value = json.dumps(existing)
    mock_redis.set = AsyncMock()

    new_messages = [ChatMessage(role="assistant", content="신규")]
    with patch.object(repo, "_get_client", return_value=mock_redis):
      result = await repo.append_messages("test-session", new_messages)
      assert len(result) == 2
      assert result[0].content == "기존"
      assert result[1].content == "신규"

  @pytest.mark.asyncio
  async def test_delete_session_calls_redis_delete(self, repo, mock_redis):
    """delete_session()이 Redis delete를 호출하는지 검증"""
    with patch.object(repo, "_get_client", return_value=mock_redis):
      await repo.delete_session("test-session")
      mock_redis.delete.assert_called_once_with(
        "session:test-session:messages",
        "session:test-session:updated_at",
      )

  @pytest.mark.asyncio
  async def test_get_session_meta_returns_dict(self, repo, mock_redis):
    """get_session_meta()가 올바른 딕셔너리 구조를 반환하는지 검증"""
    stored = [{"role": "user", "content": "메시지1"}]
    mock_redis.get.side_effect = [json.dumps(stored), "2026-05-25T12:00:00"]
    with patch.object(repo, "_get_client", return_value=mock_redis):
      meta = await repo.get_session_meta("test-session")
      assert meta["session_id"] == "test-session"
      assert meta["message_count"] == 1
      assert "updated_at" in meta
