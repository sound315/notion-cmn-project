# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

- PRD 문서: @docs/PRD.md
- 개발 로드맵: @docs/ROADMAP.md

## 프로젝트 개요

LLM Chatbot Starter Kit — FastAPI 백엔드 + Streamlit UI + 임베딩 위젯으로 구성된 멀티 LLM 프로바이더 채팅 스타터킷.

> `docs/PRD.md` 에 Next.js 기반 Notion CMS 블로그 프로젝트 PRD가 있음. 현재 코드베이스는 Python 스타터킷이며 두 프로젝트는 별개.

## 명령어

```powershell
# 의존성 설치
poetry install

# 전체 서버 실행 (Windows)
.\scripts\dev.ps1

# FastAPI만 실행
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# Streamlit만 실행
streamlit run streamlit_app/app.py

# Docker 실행
docker-compose up -d

# 테스트 전체
pytest

# 특정 테스트 파일
pytest tests/test_llm_factory.py

# 특정 테스트 함수
pytest tests/test_llm_factory.py::test_create_azure_openai

# 린트
ruff check .

# 포맷
black .
```

## 아키텍처

### 레이어 구조

```
Controller (api/v1/)  →  Service (services/llm/)  →  Repository (repositories/)
                ↓
         Schema (schemas/)   ←   Core (core/config.py, core/dependencies.py)
```

### LLM 프로바이더 패턴

`BaseLLMService` (추상 클래스) → 각 프로바이더 구현체 → `LLMServiceFactory.create(settings)` 로 인스턴스화.

프로바이더 추가 시: `services/llm/` 에 구현체 작성 → `factory.py` 에 분기 추가 → `core/config.py` 의 `Literal` 타입과 설정 필드 추가.

현재 지원 프로바이더: `azure_openai`, `openai`, `anthropic`, `ollama`, `gemini`

### 세션 관리

대화 이력은 Redis에 `session:{id}:messages` 키로 저장 (TTL: `REDIS_TTL_SECONDS`, 기본 24h). `SessionRepository` 는 lazy connect 방식으로 Redis 클라이언트를 초기화.

### API 응답 형식

`schemas/common.py` 의 공통 DTO 사용. 성공: `{"success": true, "data": ...}`, 실패: `{"success": false, "error": "...", "message": "..."}`.

스트리밍은 SSE (`text/event-stream`) 방식, `POST /api/v1/chat/stream`.

### 임베딩 위젯

`widget/chatbot.js` 가 `<script>` 태그 한 줄로 외부 사이트에 삽입 가능. `embed.html` 은 FastAPI에서 `/embed` 경로로 서빙.

## 환경 변수

`.env.example` 복사 후 `.env` 작성. 최소 필수값:

```env
LLM_PROVIDER=azure_openai   # 또는 openai, anthropic, ollama, gemini
# 선택한 프로바이더의 API 키/엔드포인트 설정
REDIS_URL=redis://localhost:6379
```

## 테스트

`pytest.ini` 기준 `tests/` 디렉토리. `asyncio_mode = auto` 설정으로 `async` 테스트 함수 자동 지원. 테스트는 실제 LLM/Redis 연결 없이 mock 기반으로 작성되어 있음.

---

## blog/ 서브프로젝트 (Next.js Notion CMS 블로그)

`blog/` 디렉토리는 별개의 Next.js 15 프로젝트다. Python FastAPI 스타터킷과 독립적으로 동작한다.

### 기술 스택

- Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- shadcn/ui, Lucide React
- `@notionhq/client` — Notion API 연동
- 배포: Vercel

### 명령어

```powershell
# blog 디렉토리에서 실행
cd blog

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 린트
npm run lint
```

### 환경 변수

`blog/.env.local.example` 복사 후 `blog/.env.local` 작성:

```env
NOTION_API_KEY=your_notion_integration_secret
NOTION_DATABASE_ID=your_database_id
```

### 아키텍처

```
app/page.tsx              # 홈 (글 목록)
app/posts/[slug]/         # 글 상세
app/category/[name]/      # 카테고리 필터
components/               # UI 컴포넌트 (PostCard, Header, Footer, Badge)
lib/notion.ts             # Notion API 클라이언트
types/post.ts             # 타입 정의
```

### Notion 데이터베이스 필드

| 필드명 | 타입 | 설명 |
|--------|------|------|
| Title | title | 글 제목 |
| Category | select | 카테고리 |
| Tags | multi_select | 태그 목록 |
| Published | date | 발행일 |
| Status | select | `초안` / `발행됨` |
