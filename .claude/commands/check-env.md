현재 프로젝트의 환경 설정 상태를 점검해줘.

아래 순서대로 확인해:

1. `.env.example` 과 `.env` 파일을 읽어서 `.env` 에 누락된 키를 찾아줘
   - `.env` 가 없으면 즉시 경고

2. `backend/core/config.py` 를 읽어서 현재 `LLM_PROVIDER` 값을 확인하고, 해당 프로바이더에 필요한 필수 키가 `.env` 에 모두 있는지 검증해
   - azure_openai: AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT_NAME
   - openai: OPENAI_API_KEY
   - anthropic: ANTHROPIC_API_KEY
   - ollama: OLLAMA_BASE_URL

3. FastAPI 서버가 실행 중이면 `GET http://localhost:8000/health` 와 `GET http://localhost:8000/api/v1/chat/provider` 를 호출해서 실제 연결 상태를 확인해줘

4. 결과를 아래 형식으로 요약해줘:
   - 현재 프로바이더
   - 필수 키 상태 (OK / 누락)
   - 누락된 .env 항목 목록
   - 서버 연결 상태 (실행 중 / 미실행)
