# PRD: 개인 개발 블로그 (Notion CMS 기반)

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | 개인 개발 블로그 |
| 목적 | Notion을 CMS로 활용한 개인 기술 블로그 |
| CMS 선택 이유 | Notion에서 글을 작성하면 자동으로 블로그에 반영 |
| 배포 환경 | Vercel |

## 2. 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | Next.js 15, TypeScript |
| CMS | Notion API (`@notionhq/client`) |
| Styling | Tailwind CSS, shadcn/ui |
| Icons | Lucide React |
| Deployment | Vercel |

## 3. Notion 데이터베이스 구조

| 필드명 | 타입 | 설명 |
|--------|------|------|
| Title | title | 글 제목 |
| Category | select | 카테고리 |
| Tags | multi_select | 태그 목록 |
| Published | date | 발행일 |
| Status | select | 상태 (`초안` / `발행됨`) |
| Content | page content | 본문 (Notion 페이지 블록) |

## 4. 주요 기능

### 4.1 MVP 기능

| # | 기능 | 설명 |
|---|------|------|
| 1 | 글 목록 조회 | Notion 데이터베이스에서 발행된 글 목록 가져오기 |
| 2 | 글 상세 페이지 | 개별 글의 Notion 블록 콘텐츠 렌더링 |
| 3 | 카테고리 필터링 | 카테고리별 글 목록 필터링 |
| 4 | 검색 기능 | 제목 및 태그 기반 글 검색 |
| 5 | 반응형 디자인 | 모바일/태블릿/데스크톱 대응 |

### 4.2 기능 상세

#### 글 목록 조회
- `Status = 발행됨` 인 글만 노출
- `Published` 날짜 기준 최신순 정렬
- 제목, 카테고리, 태그, 발행일 표시

#### 글 상세 페이지
- Notion 페이지 블록을 HTML로 변환하여 렌더링
- 제목, 발행일, 카테고리, 태그 메타 정보 표시
- 이전/다음 글 네비게이션

#### 카테고리 필터링
- 전체 카테고리 목록 자동 추출
- 카테고리 클릭 시 해당 카테고리 글만 표시

#### 검색
- 클라이언트 사이드 검색 (제목, 태그 대상)
- 실시간 검색 결과 반영

## 5. 화면 구성

### 5.1 페이지 목록

| 경로 | 페이지명 | 설명 |
|------|----------|------|
| `/` | 홈 | 최근 글 목록 표시 |
| `/posts/[slug]` | 글 상세 | 개별 글 본문 표시 |
| `/category/[name]` | 카테고리 | 카테고리별 글 목록 |

### 5.2 공통 컴포넌트

- **Header**: 블로그 제목, 네비게이션 메뉴
- **Footer**: 저작권 정보
- **PostCard**: 글 목록 카드 컴포넌트
- **CategoryBadge**: 카테고리 뱃지
- **TagBadge**: 태그 뱃지

## 6. MVP 범위

### 포함
- Notion API 연동 및 데이터 패칭
- 글 목록 페이지
- 글 상세 페이지
- 기본 스타일링 (Tailwind CSS)
- 반응형 디자인

### 제외 (추후 고려)
- 댓글 기능
- 좋아요/북마크
- RSS 피드
- 다크 모드
- 이메일 뉴스레터

## 7. 구현 단계

### Phase 1 - 환경 설정
- [ ] Next.js 15 프로젝트 생성
- [ ] Notion API 패키지 설치 (`@notionhq/client`)
- [ ] 환경 변수 설정 (`NOTION_API_KEY`, `NOTION_DATABASE_ID`)
- [ ] shadcn/ui 초기 설정

### Phase 2 - Notion 연동
- [ ] Notion 데이터베이스 생성 및 구조 설정
- [ ] Notion Integration 생성 및 API 키 발급
- [ ] Notion API 클라이언트 설정
- [ ] 글 목록 데이터 패칭 함수 구현

### Phase 3 - 페이지 구현
- [ ] 글 목록 페이지 (`/`) 구현
- [ ] 글 상세 페이지 (`/posts/[slug]`) 구현
- [ ] 카테고리 페이지 (`/category/[name]`) 구현

### Phase 4 - 스타일링 및 최적화
- [ ] 반응형 디자인 적용
- [ ] SEO 메타태그 설정
- [ ] 이미지 최적화
- [ ] Vercel 배포

## 8. 환경 변수

```env
NOTION_API_KEY=your_notion_integration_secret
NOTION_DATABASE_ID=your_database_id
```

## 9. 디렉토리 구조 (예상)

```
notion-cms-project/
├── app/
│   ├── page.tsx                  # 홈 (글 목록)
│   ├── posts/
│   │   └── [slug]/
│   │       └── page.tsx          # 글 상세
│   └── category/
│       └── [name]/
│           └── page.tsx          # 카테고리별 목록
├── components/
│   ├── PostCard.tsx
│   ├── CategoryBadge.tsx
│   └── TagBadge.tsx
├── lib/
│   └── notion.ts                 # Notion API 클라이언트
├── types/
│   └── post.ts                   # 타입 정의
└── docs/
    └── PRD.md
```
