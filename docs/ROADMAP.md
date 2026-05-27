# ROADMAP: 개인 개발 블로그 (Notion CMS 기반)

> PRD 기반 개발 로드맵. 의존성을 고려한 올바른 순서로 단계를 구성했다.

---

## Phase 1 — 프로젝트 초기 설정 (골격 구축)

**왜 먼저 해야 하나**: 환경 설정이 불완전한 상태로 기능을 개발하면 나중에 설정 변경 시 전체 코드를 수정해야 한다. 골격을 먼저 잡아야 이후 작업이 일관성을 유지한다.

**예상 소요 시간**: 2~3시간

### 작업 목록

- [x] Next.js 15 프로젝트 생성 (App Router, TypeScript, Tailwind CSS)
- [x] `@notionhq/client`, `lucide-react` 패키지 설치
- [x] shadcn/ui 초기 설정
- [x] `.env.local.example` 작성 (`NOTION_API_KEY`, `NOTION_DATABASE_ID`)
- [x] 디렉토리 구조 확립 (`app/`, `components/`, `lib/`, `types/`)
- [x] Notion Integration 생성 및 API 키 발급
- [x] Notion 데이터베이스 생성 (Title, Category, Tags, Published, Status 필드)
- [x] `.env.local` 작성 및 Notion 연결 확인

### 완료 기준

- `npm run dev` 실행 시 오류 없이 로컬 서버가 구동된다
- `.env.local`에 실제 키가 입력되어 있고 Notion API 호출이 가능하다
- `npm run build`가 성공한다

---

## Phase 2 — 공통 모듈/컴포넌트 개발

**왜 이 순서인가**: 페이지 개발 전에 공통 컴포넌트와 데이터 계층을 완성해야 한다. 페이지에서 재사용할 빌딩 블록이 없으면 중복 코드가 생기고 나중에 리팩토링 비용이 증가한다.

**예상 소요 시간**: 3~4시간

### 작업 목록

#### 타입 정의 (`types/post.ts`)
- [x] `Post` 인터페이스 (id, slug, title, category, tags, publishedAt, status)
- [x] `PostDetail` 인터페이스 (Post 확장 + blocks)
- [x] `NotionBlock` 인터페이스

#### Notion API 클라이언트 (`lib/notion.ts`)
- [x] Notion 클라이언트 초기화
- [x] `getPublishedPosts()` — Status=발행됨 필터, Published 기준 최신순 정렬
- [x] `getPostBySlug(slug)` — 슬러그로 단일 포스트 조회
- [x] `getPostBlocks(pageId)` — 페이지 블록 콘텐츠 조회
- [x] `getCategories()` — 전체 카테고리 목록 추출

#### UI 컴포넌트
- [x] `components/Header.tsx` — 블로그 제목, 네비게이션
- [x] `components/Footer.tsx` — 저작권 정보
- [x] `components/PostCard.tsx` — 제목, 카테고리, 태그, 발행일 표시
- [x] `components/CategoryBadge.tsx` — 카테고리 뱃지
- [x] `components/TagBadge.tsx` — 태그 뱃지

### 완료 기준

- `getPublishedPosts()`를 호출하면 실제 Notion 데이터가 반환된다
- `PostCard`에 더미 데이터를 주입하면 정상적으로 렌더링된다
- TypeScript 타입 오류가 없다

---

## Phase 3 — 핵심 기능 개발

**왜 이 순서인가**: 공통 모듈이 완성된 이후에 페이지를 조립한다. 데이터 흐름(Notion → lib → page)이 확립된 상태에서 UI를 붙여야 디버깅이 쉽다.

**예상 소요 시간**: 4~6시간

### 작업 목록

#### 홈 페이지 (`app/page.tsx`)
- [x] `getPublishedPosts()` 호출하여 글 목록 렌더링
- [x] `PostCard` 컴포넌트 그리드 레이아웃
- [x] 발행된 글 없을 때 빈 상태(empty state) 처리
- [x] ISR 설정 (`revalidate = 60`)

#### 글 상세 페이지 (`app/posts/[slug]/page.tsx`)
- [x] `getPostBySlug()`로 포스트 메타 조회
- [x] `getPostBlocks()`로 Notion 블록 콘텐츠 렌더링
- [x] 제목, 발행일, 카테고리, 태그 메타 정보 표시
- [x] 이전/다음 글 네비게이션
- [x] 존재하지 않는 slug 접근 시 404 처리
- [x] `generateStaticParams()`로 정적 생성

#### 카테고리 페이지 (`app/category/[name]/page.tsx`)
- [x] 카테고리별 글 목록 필터링
- [x] 전체 카테고리 사이드바 표시
- [x] 현재 카테고리 하이라이트
- [x] `generateStaticParams()`로 정적 생성

#### 검색 기능
- [ ] 클라이언트 사이드 검색 컴포넌트 (`components/SearchBar.tsx`)
- [ ] 제목 및 태그 기반 실시간 필터링

### 완료 기준

- 홈에서 Notion에 발행된 글 목록이 정상 출력된다
- 글 카드 클릭 시 상세 페이지로 이동하고 본문이 렌더링된다
- 카테고리 클릭 시 해당 카테고리 글만 필터링된다
- 검색어 입력 시 실시간으로 결과가 반영된다
- 존재하지 않는 경로 접근 시 404 페이지가 표시된다

---

## Phase 4 — 추가 기능 개발

**왜 이 순서인가**: 핵심 기능이 안정화된 후 UX를 개선한다. 기반이 불안정한 상태에서 추가 기능을 붙이면 디버깅 포인트가 늘어난다.

**예상 소요 시간**: 3~4시간

### 작업 목록

#### SEO
- [x] 각 페이지 `generateMetadata()` 구현
- [ ] Open Graph 태그 설정 (제목, 설명, 이미지)
- [ ] `sitemap.xml` 자동 생성 (`app/sitemap.ts`)
- [ ] `robots.txt` 설정

#### UX 개선
- [ ] 글 상세 페이지 목차(TOC) 컴포넌트
- [ ] 코드 블록 신택스 하이라이팅 (`highlight.js` 또는 `shiki`)
- [ ] 이미지 최적화 (`next/image` 적용)
- [ ] 로딩 스켈레톤 UI (`app/loading.tsx`)
- [x] 에러 바운더리 (`app/error.tsx`)

### 완료 기준

- 각 페이지의 `<title>`과 OG 태그가 올바르게 설정된다
- `sitemap.xml`이 발행된 글 URL을 포함하여 생성된다
- 코드 블록이 신택스 하이라이팅과 함께 렌더링된다
- Lighthouse SEO 점수 90 이상

---

## Phase 5 — 최적화 및 배포

**왜 마지막인가**: 기능이 완성된 후 성능을 측정하고 병목을 제거한다. 배포 전 빌드 검증을 통해 프로덕션 이슈를 사전에 차단한다.

**예상 소요 시간**: 2~3시간

### 작업 목록

#### 성능 최적화
- [ ] `npm run build` 번들 크기 분석
- [ ] 불필요한 클라이언트 컴포넌트 → 서버 컴포넌트 전환
- [ ] Notion API 응답 캐싱 전략 검토

#### 배포
- [x] `vercel.json` 생성 (`blog/` 서브디렉토리 루트로 설정)
- [x] `npm run build` 성공 확인
- [ ] Vercel 환경 변수 설정 (`NOTION_API_KEY`, `NOTION_DATABASE_ID`, `NOTION_ITEMS_DATABASE_ID`)
- [ ] 프로덕션 배포 및 동작 확인
- [ ] 커스텀 도메인 연결 (선택)

### 완료 기준

- Vercel 프로덕션 URL에서 모든 페이지가 정상 동작한다
- Notion에서 글을 발행하면 최대 60초 내에 블로그에 반영된다 (ISR)
- Lighthouse Performance 점수 85 이상

---

## Phase 6 — 견적서 관리 기능 (Invoices)

**배경**: Notion Invoices/Items 데이터베이스를 연동하여 견적서 목록 및 상세 페이지를 추가했다.

**예상 소요 시간**: 2~3시간

### 작업 목록

#### 타입 정의 (`types/invoice.ts`)
- [x] `Invoice` 인터페이스 (견적서 번호, 클라이언트명, 발행일, 유효기간, 상태, 총 금액)
- [x] `InvoiceItem` 인터페이스 (항목명, 수량, 단가, 금액)
- [x] `InvoiceDetail` 인터페이스 (Invoice + items 조인)
- [x] `InvoiceStatus` 유니온 타입 (`대기` | `승인` | `거절` | `완료`)

#### Notion API 클라이언트 (`lib/invoice.ts`)
- [x] `getInvoices()` — 전체 견적서 목록 조회 (발행일 최신순)
- [x] `getInvoiceById(id)` — 견적서 단건 조회
- [x] `getItemsByInvoiceId(invoiceId)` — 견적서 항목 목록 조회
- [x] `getInvoiceDetail(id)` — 견적서 + 항목 조인 조회

#### 페이지
- [x] `app/invoices/page.tsx` — 견적서 목록 (`/invoices`)
- [x] `app/invoices/[id]/page.tsx` — 견적서 상세 (`/invoices/:id`)

#### 환경 변수
- [x] `NOTION_ITEMS_DATABASE_ID` 추가 (Items DB)

### 완료 기준

- `/invoices`에서 Notion Invoices DB 데이터가 정상 출력된다 ✅
- `/invoices/:id`에서 항목 목록과 총 금액이 정상 렌더링된다 ✅
- `@notionhq/client` v5 호환 (`databases.query` → `search` API 대응) ✅

---

## Phase 7 — 관리자 기능 (Admin)

**배경**: 관리자 인증 및 Notion API를 통한 견적서 CRUD 기능을 추가한다.

**예상 소요 시간**: 4~6시간

### 작업 목록

#### 관리자 인증
- [ ] `/admin/login` 페이지 — 이메일/패스워드 또는 패스키 로그인
- [ ] 세션 관리 — Next.js middleware로 `/admin/*` 경로 보호
- [ ] 로그아웃 기능

#### 견적서 CRUD
- [ ] 견적서 생성 (`POST`) — Notion API로 새 페이지 생성
- [ ] 견적서 수정 (`PATCH`) — 상태, 유효기간 등 필드 업데이트
- [ ] 견적서 삭제 (`DELETE`) — Notion 페이지 아카이브
- [ ] 견적서 항목(Items) 추가/삭제

#### API 라우트 (`app/api/admin/`)
- [ ] `POST /api/admin/invoices` — 견적서 생성
- [ ] `PATCH /api/admin/invoices/[id]` — 견적서 수정
- [ ] `DELETE /api/admin/invoices/[id]` — 견적서 삭제
- [ ] `POST /api/admin/invoices/[id]/items` — 항목 추가
- [ ] `DELETE /api/admin/invoices/[id]/items/[itemId]` — 항목 삭제

#### 관리자 UI (`app/admin/`)
- [ ] `/admin` — 관리자 대시보드 (견적서 목록 + 액션 버튼)
- [ ] `/admin/invoices/new` — 견적서 생성 폼
- [ ] `/admin/invoices/[id]/edit` — 견적서 수정 폼

### 완료 기준

- 로그인하지 않은 사용자는 `/admin/*` 접근 시 로그인 페이지로 리다이렉트된다
- 관리자가 견적서를 생성하면 Notion DB에 즉시 반영된다
- 견적서 상태(대기/승인/거절/완료) 변경이 가능하다

---

## 전체 일정 요약 (업데이트)

| Phase | 내용 | 예상 시간 | 상태 |
|-------|------|-----------|------|
| 1 | 프로젝트 초기 설정 | 2~3h | 완료 |
| 2 | 공통 모듈/컴포넌트 | 3~4h | 완료 |
| 3 | 핵심 기능 개발 | 4~6h | 진행 중 |
| 4 | 추가 기능 개발 | 3~4h | 진행 중 |
| 5 | 최적화 및 배포 | 2~3h | 대기 |
| 6 | 견적서 관리 기능 | 2~3h | 완료 |
| 7 | 관리자 기능 | 4~6h | 대기 |

---

## MVP 범위 외 항목 (추후 고려)

- 댓글 기능
- 좋아요/북마크
- RSS 피드
- 다크 모드
- 이메일 뉴스레터
