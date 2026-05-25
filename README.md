# LLM Chatbot Starter Kit

멀티 LLM 프로바이더를 지원하는 채팅 스타터킷입니다.  
FastAPI 백엔드 + Streamlit 채팅 UI + 외부 사이트 임베딩 위젯으로 구성됩니다.

---

## 아키텍처

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Streamlit UI   │────▶│   FastAPI API   │────▶│  LLM Provider   │
│  :8501          │     │   :8000         │     │  (선택 가능)    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                  │
                         ┌────────▼────────┐
                         │     Redis       │
                         │  (대화 이력)    │
                         └─────────────────┘

외부 사이트 → widget/chatbot.js → FastAPI /embed
```

## 빠른 시작

### 1. 의존성 설치

```bash
pip install poetry
poetry install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일에서 사용할 프로바이더와 API 키를 설정합니다.

### 3. 서버 실행

**Windows:**
```powershell
.\scripts\dev.ps1
```

**Linux / Mac:**
```bash
bash scripts/dev.sh
```

**수동 실행:**
```bash
# 터미널 1 — FastAPI
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# 터미널 2 — Streamlit
streamlit run streamlit_app/app.py
```

**Docker:**
```bash
docker-compose up -d
```

### 4. 접속

| 서비스 | URL |
|--------|-----|
| Streamlit 채팅 UI | http://localhost:8501 |
| FastAPI Swagger | http://localhost:8000/docs |
| 임베딩 채팅 UI | http://localhost:8000/embed |

---

## LLM 프로바이더

`.env`의 `LLM_PROVIDER` 값만 변경하면 프로바이더를 전환할 수 있습니다.

| 프로바이더 | `LLM_PROVIDER` 값 | 필수 환경 변수 |
|-----------|-------------------|---------------|
| Azure OpenAI (기본값) | `azure_openai` | `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT_NAME` |
| OpenAI | `openai` | `OPENAI_API_KEY` |
| Anthropic Claude | `anthropic` | `ANTHROPIC_API_KEY` |
| Ollama (로컬) | `ollama` | `OLLAMA_BASE_URL`, `OLLAMA_MODEL` |
| Google Gemini | `gemini` | `GEMINI_API_KEY` |

새 프로바이더 추가 방법: `BaseLLMService`를 상속하여 `services/llm/` 에 구현체 작성 후 `factory.py`에 분기 추가.

---

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/v1/chat/sessions` | 세션 생성 |
| `GET` | `/api/v1/chat/sessions/{id}/messages` | 대화 이력 조회 |
| `DELETE` | `/api/v1/chat/sessions/{id}` | 세션 삭제 |
| `POST` | `/api/v1/chat/completions` | 단일 응답 |
| `POST` | `/api/v1/chat/stream` | SSE 스트리밍 응답 |
| `GET` | `/api/v1/chat/models` | 모델 목록 |
| `GET` | `/api/v1/chat/provider` | 현재 프로바이더 확인 |
| `GET` | `/embed` | 임베딩 채팅 UI |
| `GET` | `/widget/chatbot.js` | 위젯 JS 파일 |

---

## 임베딩 위젯

외부 웹사이트 `</body>` 태그 앞에 한 줄 추가:

```html
<script
  src="https://your-server/widget/chatbot.js"
  data-api-url="https://your-api-server"
  data-title="AI 챗봇"
  data-color="#10a37f"
  data-position="bottom-right"
></script>
```

| 속성 | 기본값 | 설명 |
|------|--------|------|
| `data-api-url` | `http://localhost:8000` | FastAPI 서버 주소 |
| `data-title` | `AI 챗봇` | 위젯 헤더 제목 |
| `data-color` | `#10a37f` | 주 색상 (hex) |
| `data-position` | `bottom-right` | 위치 (`bottom-right` \| `bottom-left`) |

---

## 테스트

```bash
# 전체 테스트
pytest

# 특정 파일
pytest tests/test_llm_factory.py

# 특정 함수
pytest tests/test_llm_factory.py::test_create_azure_openai
```
