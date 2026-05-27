// Notion CMS 블로그 타입 정의

export interface Post {
  id: string;
  slug: string;
  title: string;
  category: string;
  tags: string[];
  publishedAt: string;
  status: '초안' | '발행됨';
}

export interface PostDetail extends Post {
  blocks: NotionBlock[];
}

// Notion 페이지 블록 타입
export interface NotionBlock {
  id: string;
  type: string;
  content: string;
}

// 카테고리 정보
export interface Category {
  name: string;
  count: number;
}
