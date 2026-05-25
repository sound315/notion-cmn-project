새 LLM 프로바이더를 추가해줘. 프로바이더 이름은 $ARGUMENTS야.

아래 순서대로 진행해:

1. `backend/services/llm/base.py` 를 읽고 인터페이스를 파악해
2. `backend/services/llm/{프로바이더명}_service.py` 파일을 생성해
   - `BaseLLMService` 를 상속
   - `chat()`, `stream_chat()`, `get_available_models()`, `provider_name` 구현
   - `__init__`에서 `Settings`를 받아 클라이언트 초기화
3. `backend/services/llm/factory.py` 에 새 프로바이더 분기 추가
4. `backend/core/config.py` 의 `llm_provider` Literal 타입에 새 프로바이더명 추가, 필요한 설정 필드도 추가
5. `.env.example` 에 새 프로바이더 설정 항목 추가
6. `README.md` 의 프로바이더 전환 섹션에 새 프로바이더 사용법 추가
