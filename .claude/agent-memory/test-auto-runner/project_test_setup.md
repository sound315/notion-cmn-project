---
name: project-test-setup
description: 스타터킷 프로젝트의 테스트 환경 구성, 실행 명령어, 주요 패턴 요약
metadata:
  type: project
---

## 테스트 환경 구성

- 언어: Python 3.11
- 프레임워크: pytest + pytest-asyncio
- 테스트 위치: `tests/` 디렉토리
- 설정 파일: `pytest.ini` (asyncio_mode = auto)

## 테스트 실행 명령어

```bash
# 전체 테스트
python -m pytest tests/ -v

# 특정 파일만
python -m pytest tests/test_llm_services.py -v
```

## 필수 패키지 (pip install)

```
pytest pytest-asyncio httpx redis openai anthropic google-generativeai pydantic pydantic-settings fastapi
```

## 테스트 파일 구성

| 파일 | 커버리지 |
|------|---------|
| test_schemas.py | ChatMessage, ChatRequest, ChatResponse, ApiResponse DTO |
| test_config.py | Settings, CORS 파싱, 프로바이더 유효성 |
| test_llm_factory.py | LLMServiceFactory 프로바이더별 생성 |
| test_llm_services.py | GeminiService, AnthropicService, OpenAIService, OllamaService, AzureOpenAIService |
| test_session_repository.py | SessionRepository (Redis Mock) |
| test_api_health.py | GET /health, GET / 엔드포인트 |

## 중요 패턴

### patch() 사용 시 주의사항
서비스 모듈을 `patch()`로 Mock 처리할 때, 해당 모듈을 테스트 파일 최상단에서 반드시 미리 임포트해야 한다. 그렇지 않으면 `AttributeError: module has no attribute` 오류 발생.

```python
# 올바른 패턴 - 파일 상단에서 미리 임포트
import backend.services.llm.openai_service

# 이후 patch 사용
with patch("backend.services.llm.openai_service.AsyncOpenAI"):
    ...
```

### 비동기 테스트
`pytest.ini`에 `asyncio_mode = auto` 설정되어 있어 `@pytest.mark.asyncio` 데코레이터 없이도 async 테스트 가능. 단, 명시적으로 달아도 무방.

### Redis Mock 패턴
SessionRepository는 `_get_client()`를 `patch.object(repo, "_get_client", return_value=mock_redis)`로 가로채서 Redis 연결 없이 단위 테스트.

## 경고 사항

- `google.generativeai` 패키지는 deprecated. 향후 `google.genai`로 마이그레이션 필요.
- GeminiService는 `google-generativeai==0.8.x` 기준으로 작성됨.
