"""
스키마(DTO) 유효성 검증 테스트
"""
import pytest
from pydantic import ValidationError

from backend.schemas.chat import (
  ChatMessage,
  ChatRequest,
  ChatResponse,
  SessionCreateRequest,
  SessionInfo,
)
from backend.schemas.common import ApiResponse


class TestChatMessage:
  """ChatMessage 스키마 테스트"""

  def test_user_role(self):
    """user 역할 메시지 생성 정상 케이스"""
    msg = ChatMessage(role="user", content="안녕하세요")
    assert msg.role == "user"
    assert msg.content == "안녕하세요"

  def test_assistant_role(self):
    """assistant 역할 메시지 생성 정상 케이스"""
    msg = ChatMessage(role="assistant", content="응답입니다")
    assert msg.role == "assistant"

  def test_system_role(self):
    """system 역할 메시지 생성 정상 케이스"""
    msg = ChatMessage(role="system", content="시스템 프롬프트")
    assert msg.role == "system"

  def test_invalid_role(self):
    """허용되지 않는 역할 값 입력 시 ValidationError 발생"""
    with pytest.raises(ValidationError):
      ChatMessage(role="unknown", content="테스트")


class TestChatRequest:
  """ChatRequest 스키마 테스트"""

  def test_default_session_id_generated(self):
    """session_id 미입력 시 UUID 자동 생성 검증"""
    req = ChatRequest(messages=[ChatMessage(role="user", content="hi")])
    assert req.session_id is not None
    assert len(req.session_id) == 36  # UUID 형식

  def test_custom_session_id(self):
    """사용자 지정 session_id 사용 케이스"""
    req = ChatRequest(
      session_id="my-session-123",
      messages=[ChatMessage(role="user", content="hi")],
    )
    assert req.session_id == "my-session-123"

  def test_optional_fields_default_none(self):
    """선택 필드 기본값 None 검증"""
    req = ChatRequest(messages=[ChatMessage(role="user", content="hi")])
    assert req.system_prompt is None
    assert req.max_tokens is None
    assert req.temperature is None
    assert req.stream is False

  def test_empty_messages_allowed(self):
    """빈 메시지 리스트도 허용됨"""
    req = ChatRequest(messages=[])
    assert req.messages == []


class TestChatResponse:
  """ChatResponse 스키마 테스트"""

  def test_basic_response(self):
    """기본 응답 생성 정상 케이스"""
    resp = ChatResponse(
      content="응답 내용",
      model="gpt-4o",
      provider="openai",
    )
    assert resp.content == "응답 내용"
    assert resp.model == "gpt-4o"
    assert resp.provider == "openai"
    assert resp.usage == {}

  def test_response_with_usage(self):
    """usage 정보 포함 응답 검증"""
    resp = ChatResponse(
      content="응답",
      model="gpt-4o",
      provider="openai",
      usage={"prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30},
    )
    assert resp.usage["total_tokens"] == 30


class TestSessionCreateRequest:
  """SessionCreateRequest 스키마 테스트"""

  def test_default_title(self):
    """기본 타이틀 '새 대화' 검증"""
    req = SessionCreateRequest()
    assert req.title == "새 대화"
    assert req.system_prompt is None

  def test_custom_title(self):
    """사용자 지정 타이틀 검증"""
    req = SessionCreateRequest(title="내 채팅", system_prompt="당신은 도우미입니다.")
    assert req.title == "내 채팅"
    assert req.system_prompt == "당신은 도우미입니다."


class TestApiResponse:
  """ApiResponse 공통 응답 스키마 테스트"""

  def test_ok_response(self):
    """성공 응답 생성 검증"""
    resp = ApiResponse.ok(data={"key": "value"}, message="성공")
    assert resp.success is True
    assert resp.data == {"key": "value"}
    assert resp.message == "성공"
    assert resp.error is None

  def test_fail_response(self):
    """실패 응답 생성 검증"""
    resp = ApiResponse.fail(error="에러 발생", message="실패했습니다")
    assert resp.success is False
    assert resp.error == "에러 발생"
    assert resp.data is None

  def test_ok_with_no_data(self):
    """data 없는 성공 응답 검증"""
    resp = ApiResponse.ok()
    assert resp.success is True
    assert resp.data is None
