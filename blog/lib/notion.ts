import { Client, isFullPage } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type { Post, PostDetail, NotionBlock, Category } from '@/types/post';

// Notion 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

/**
 * Notion 페이지 객체에서 Post 타입으로 변환
 */
function pageToPost(page: PageObjectResponse): Post {
  const props = page.properties;

  // 제목 추출
  const titleProp = props['Title'];
  const title =
    titleProp?.type === 'title'
      ? titleProp.title.map((t) => t.plain_text).join('')
      : '';

  // 슬러그: 페이지 ID (하이픈 제거)
  const slug = page.id.replace(/-/g, '');

  // 카테고리 추출
  const categoryProp = props['Category'];
  const category =
    categoryProp?.type === 'select' ? (categoryProp.select?.name ?? '') : '';

  // 태그 추출
  const tagsProp = props['Tags'];
  const tags: string[] =
    tagsProp?.type === 'multi_select'
      ? tagsProp.multi_select.map((tag) => tag.name)
      : [];

  // 발행일 추출
  const publishedProp = props['Published'];
  const publishedAt =
    publishedProp?.type === 'date' ? (publishedProp.date?.start ?? '') : '';

  // 상태 추출
  const statusProp = props['Status'];
  const statusValue =
    statusProp?.type === 'select' ? (statusProp.select?.name ?? '초안') : '초안';
  const status = statusValue as '초안' | '발행됨';

  return {
    id: page.id,
    slug,
    title,
    category,
    tags,
    publishedAt,
    status,
  };
}

/**
 * 발행된 글 목록 조회 (최신순 정렬)
 * search API로 DATABASE_ID에 속한 페이지를 가져온 뒤 클라이언트 필터링
 */
export async function getPublishedPosts(): Promise<Post[]> {
  try {
    const response = await notion.search({
      filter: {
        property: 'object',
        value: 'page',
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time',
      },
    });

    const posts = response.results
      .filter(isFullPage)
      .filter((page) => {
        // 대상 데이터베이스 소속 페이지만 필터링
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbId = (page.parent as any).database_id?.replace(/-/g, '');
        return dbId === DATABASE_ID.replace(/-/g, '');
      })
      .map(pageToPost)
      .filter((post) => post.status === '발행됨');

    // 발행일 기준 최신순 정렬
    return posts.sort((a, b) => {
      if (!a.publishedAt) return 1;
      if (!b.publishedAt) return -1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  } catch (error) {
    console.error('글 목록 조회 오류:', error);
    return [];
  }
}

/**
 * 슬러그(페이지 ID)로 글 상세 조회
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    // 슬러그는 하이픈 없는 페이지 ID이므로 하이픈 형식으로 복원
    const pageId = [
      slug.slice(0, 8),
      slug.slice(8, 12),
      slug.slice(12, 16),
      slug.slice(16, 20),
      slug.slice(20),
    ].join('-');

    const page = await notion.pages.retrieve({ page_id: pageId });

    if (!isFullPage(page)) {
      return null;
    }

    return pageToPost(page);
  } catch (error) {
    console.error('글 조회 오류:', error);
    return null;
  }
}

/**
 * 페이지 블록 목록 조회
 */
export async function getPostBlocks(pageId: string): Promise<NotionBlock[]> {
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
    });

    return response.results.map((block) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const b = block as any;
      const type: string = b.type ?? 'unsupported';

      // 블록 타입별 텍스트 내용 추출
      const richTexts: Array<{ plain_text: string }> = b[type]?.rich_text ?? [];
      const content = richTexts.map((rt) => rt.plain_text).join('');

      return {
        id: b.id as string,
        type,
        content,
      };
    });
  } catch (error) {
    console.error('블록 조회 오류:', error);
    return [];
  }
}

/**
 * 전체 카테고리 목록 추출 (발행된 글 기준)
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const posts = await getPublishedPosts();

    // 카테고리별 글 수 집계
    const categoryMap = new Map<string, number>();
    for (const post of posts) {
      if (post.category) {
        categoryMap.set(post.category, (categoryMap.get(post.category) ?? 0) + 1);
      }
    }

    return Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  } catch (error) {
    console.error('카테고리 조회 오류:', error);
    return [];
  }
}

/**
 * 슬러그로 글 상세 + 블록을 함께 조회
 */
export async function getPostDetail(slug: string): Promise<PostDetail | null> {
  const post = await getPostBySlug(slug);
  if (!post) return null;

  const blocks = await getPostBlocks(post.id);
  return { ...post, blocks };
}
