# Development Guidelines

## Project Overview

- 루트: Python FastAPI + Streamlit LLM Chatbot Starter Kit
- `blog/`: Next.js 15 (App Router) + Notion CMS 블로그 — 완전히 독립된 서브프로젝트
- 두 프로젝트는 의존성·환경변수·명령어가 서로 분리되어 있다

---

## Project Architecture

### 루트 (FastAPI)

```
backend/api/v1/      ← Controller
backend/services/llm/ ← Service (LLM 프로바이더 구현체)
backend/repositories/ ← Repository (Redis 세션)
backend/schemas/      ← DTO
backend/core/         ← 설정·의존성 주입
streamlit_app/        ← Streamlit UI
widget/               ← 임베딩 위젯 (chatbot.js, embed.html)
tests/                ← pytest 테스트
```

### blog/ (Next.js 15)

```
blog/app/page.tsx                  ← 홈 (글 목록)
blog/app/posts/[slug]/page.tsx     ← 글 상세
blog/app/category/[name]/page.tsx  ← 카테고리 필터
blog/components/                   ← UI 컴포넌트
blog/lib/notion.ts                 ← Notion API 클라이언트 (유일한 데이터 접근 지점)
blog/types/post.ts                 ← 타입 정의
```

---

## Code Standards

- 들여쓰기: 2칸
- 네이밍: camelCase (변수·함수), PascalCase (컴포넌트·클래스·타입)
- 주석: 한국어, 비즈니스 로직에만 작성
- TypeScript strict 모드 준수 (`blog/tsconfig.json`)
- Python: ruff lint + black 포맷

---

## blog/ 구현 규칙

### Next.js 15 필수 패턴

- **params는 반드시 `await`**: `const { slug } = await params;` — Promise 타입
- **모든 페이지에 ISR 설정**: `export const revalidate = 60;`
- **동적 경로 페이지에 `generateStaticParams()` 구현** (빌드 시 정적 생성)
- **동적 경로 페이지에 `generateMetadata()` 구현** (SEO)

```typescript
// 올바른 예
interface PageProps {
  params: Promise<{ slug: string }>;
}
export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
}

// 금지: params를 await 없이 사용
// const { slug } = params;  ← 빌드 에러
```

### Notion 데이터 접근

- **모든 Notion 호출은 `blog/lib/notion.ts`에서만** — 페이지에서 직접 Notion SDK 호출 금지
- **Notion 필드명 정확히 사용** (대소문자 구분):

| 필드 | 타입 | 값 |
|------|------|-----|
| `Title` | title | 문자열 |
| `Category` | select | 문자열 |
| `Tags` | multi_select | 문자열[] |
| `Published` | date | ISO 날짜 문자열 |
| `Status` | select | `'초안'` \| `'발행됨'` |

- **슬러그 = 페이지 ID (하이픈 제거)**: `page.id.replace(/-/g, '')`
- **슬러그 → 페이지 ID 복원**: 8-4-4-4-12 형식으로 하이픈 삽입 (`getPostBySlug` 참고)
- **발행됨 필터링**: `getPublishedPosts()`는 `status === '발행됨'`인 글만 반환

### 카테고리 URL 처리

- 카테고리 이름 → URL: `encodeURIComponent(name)` 적용
- URL → 카테고리 이름: `decodeURIComponent(name)` 적용
- `CategoryBadge`의 `linkable` prop으로 현재 카테고리 페이지에서 링크 비활성화

### 타입 수정 시 동시 수정 필요 파일

- `blog/types/post.ts` 수정 → `blog/lib/notion.ts`의 변환 로직도 함께 수정
- `NotionBlock.type` 추가 → `blog/app/posts/[slug]/page.tsx`의 `renderBlock()` switch 케이스도 추가

---

## FastAPI 구현 규칙

### LLM 프로바이더 추가 시 3파일 동시 수정

1. `backend/services/llm/{provider}_service.py` — `BaseLLMService` 상속 구현체 작성
2. `backend/services/llm/factory.py` — `LLMServiceFactory.create()` 분기 추가
3. `backend/core/config.py` — `Literal` 타입과 설정 필드 추가

**3파일 중 하나라도 누락 시 런타임 오류 발생**

### API 응답 형식

- 성공: `{"success": true, "data": ...}` — `schemas/common.py` DTO 사용
- 실패: `{"success": false, "error": "...", "message": "..."}`
- 스트리밍: SSE (`text/event-stream`), `POST /api/v1/chat/stream`

### 세션 관리

- Redis 키: `session:{session_id}:messages`
- TTL: `REDIS_TTL_SECONDS` 환경변수 (기본 24h)
- `SessionRepository`: lazy connect 방식 — 초기화 지점 변경 금지

---

## 환경 변수 관리

| 프로젝트 | 파일 | 필수 키 |
|----------|------|---------|
| 루트 FastAPI | `.env` | `LLM_PROVIDER`, Redis URL, LLM API 키 |
| blog/ Next.js | `blog/.env.local` | `NOTION_API_KEY`, `NOTION_DATABASE_ID` |

- 두 프로젝트의 환경변수 파일을 절대 혼용하지 않는다
- `blog/.env.local.example` 수정 시 `blog/.env.local.example`만 수정 (루트 `.env.example` 별개)

---

## Workflow Standards

### blog/ 개발 흐름

```
Notion 데이터베이스 변경
  → blog/types/post.ts 타입 수정
  → blog/lib/notion.ts 변환 로직 수정
  → 페이지 컴포넌트 수정
  → npm run build (빌드 검증)
```

### FastAPI 개발 흐름

```
새 엔드포인트 추가
  → backend/schemas/ DTO 정의
  → backend/services/ 비즈니스 로직
  → backend/api/v1/ 라우터 등록
  → tests/ 테스트 작성 (mock 기반, 실제 LLM/Redis 연결 불필요)
```

---

## Key File Interaction Standards

| 작업 | 수정 파일 |
|------|-----------|
| 새 Notion 필드 추가 | `types/post.ts` + `lib/notion.ts` |
| 새 블록 타입 렌더링 | `app/posts/[slug]/page.tsx` renderBlock() |
| 새 LLM 프로바이더 | `services/llm/{p}.py` + `factory.py` + `core/config.py` |
| 새 API 엔드포인트 | `schemas/` + `services/` + `api/v1/` |
| 카테고리 페이지 수정 | `lib/notion.ts` getCategories() + `app/category/[name]/page.tsx` |

---

## AI Decision Standards

### 모호한 수정 요청 처리

1. `blog/` 관련이면 Next.js 15 패턴 적용, `backend/` 관련이면 FastAPI 패턴 적용
2. 타입 변경 요청 → 연관 파일 파악 후 동시 수정
3. "새 페이지 추가" → `generateStaticParams()` + `generateMetadata()` + `revalidate = 60` 포함

### 우선순위

1. TypeScript/빌드 오류 없음
2. Notion API 호출 최소화 (캐싱 활용)
3. 서버 컴포넌트 우선 (클라이언트 컴포넌트는 인터랙션 필수 시에만)

---

## Prohibited Actions

- **`blog/`에서 루트 `node_modules` 또는 Python 패키지 참조** — 완전히 별개 프로젝트
- **페이지 컴포넌트에서 직접 Notion SDK import** — 반드시 `lib/notion.ts` 경유
- **`params`를 `await` 없이 사용** (Next.js 15에서 빌드 실패)
- **Notion 필드명 소문자로 작성** (`title`, `category` 등 — 실제 필드명은 대문자 시작)
- **`revalidate` 누락** — ISR 없으면 Notion 변경이 반영되지 않음
- **LLM 프로바이더 추가 시 3파일 중 일부만 수정**
- **API 응답을 `schemas/common.py` DTO 없이 임의 형식으로 반환**
- **`blog/` 명령어를 루트에서 실행** — `cd blog` 후 `npm` 명령어 실행
- **테스트에서 실제 LLM/Redis 연결 사용** — mock 기반으로 작성
