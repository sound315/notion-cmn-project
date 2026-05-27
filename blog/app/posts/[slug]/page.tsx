import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPostBySlug, getPostBlocks, getPublishedPosts } from '@/lib/notion';
import CategoryBadge from '@/components/CategoryBadge';
import TagBadge from '@/components/TagBadge';
import type { NotionBlock, Post } from '@/types/post';

// ISR: 60초마다 재검증
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 정적 경로 사전 생성
export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// 메타데이터 동적 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: '글을 찾을 수 없습니다' };

  return {
    title: post.title,
    description: `${post.category} | ${post.tags.join(', ')}`,
  };
}

/**
 * Notion 블록을 HTML 요소로 렌더링
 */
function renderBlock(block: NotionBlock) {
  switch (block.type) {
    case 'heading_1':
      return (
        <h1 key={block.id} className="mt-8 mb-4 text-3xl font-bold text-gray-900">
          {block.content}
        </h1>
      );
    case 'heading_2':
      return (
        <h2 key={block.id} className="mt-7 mb-3 text-2xl font-semibold text-gray-900">
          {block.content}
        </h2>
      );
    case 'heading_3':
      return (
        <h3 key={block.id} className="mt-6 mb-2 text-xl font-semibold text-gray-900">
          {block.content}
        </h3>
      );
    case 'paragraph':
      return (
        <p key={block.id} className="mb-4 leading-7 text-gray-700">
          {block.content}
        </p>
      );
    case 'bulleted_list_item':
      return (
        <li key={block.id} className="mb-1 ml-6 list-disc text-gray-700">
          {block.content}
        </li>
      );
    case 'numbered_list_item':
      return (
        <li key={block.id} className="mb-1 ml-6 list-decimal text-gray-700">
          {block.content}
        </li>
      );
    case 'code':
      return (
        <pre
          key={block.id}
          className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100"
        >
          <code>{block.content}</code>
        </pre>
      );
    case 'quote':
      return (
        <blockquote
          key={block.id}
          className="mb-4 border-l-4 border-blue-400 pl-4 italic text-gray-600"
        >
          {block.content}
        </blockquote>
      );
    case 'divider':
      return <hr key={block.id} className="my-6 border-gray-200" />;
    default:
      return block.content ? (
        <p key={block.id} className="mb-4 text-gray-700">
          {block.content}
        </p>
      ) : null;
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;

  // 현재 글과 전체 글 목록을 병렬로 조회
  const [post, allPosts] = await Promise.all([
    getPostBySlug(slug),
    getPublishedPosts(),
  ]);

  if (!post) {
    notFound();
  }

  const blocks = await getPostBlocks(post.id);

  // 이전/다음 글 계산 (발행일 최신순 기준)
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost: Post | null = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost: Post | null = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  // 발행일 포맷팅
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      {/* 글 헤더 */}
      <header className="mb-10">
        {post.category && (
          <div className="mb-4">
            <CategoryBadge name={post.category} />
          </div>
        )}

        <h1 className="mb-4 text-4xl font-bold text-gray-900 leading-tight">
          {post.title}
        </h1>

        {formattedDate && (
          <p className="mb-4 text-sm text-gray-500">{formattedDate}</p>
        )}

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <TagBadge key={tag} name={tag} />
            ))}
          </div>
        )}

        <hr className="mt-8 border-gray-200" />
      </header>

      {/* 글 본문 */}
      <div className="prose max-w-none">
        {blocks.length === 0 ? (
          <p className="text-gray-400">본문 내용이 없습니다.</p>
        ) : (
          blocks.map((block) => renderBlock(block))
        )}
      </div>

      {/* 이전/다음 글 네비게이션 */}
      {(prevPost || nextPost) && (
        <nav
          className="mt-16 flex items-stretch gap-4 border-t border-gray-200 pt-8"
          aria-label="이전/다음 글 이동"
        >
          {/* 이전 글 (더 오래된 글) */}
          <div className="flex-1">
            {prevPost && (
              <Link
                href={`/posts/${prevPost.slug}`}
                className="group flex h-full flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <span className="flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-blue-500">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  이전 글
                </span>
                <span className="text-sm font-semibold text-gray-700 line-clamp-2 group-hover:text-blue-600">
                  {prevPost.title}
                </span>
              </Link>
            )}
          </div>

          {/* 다음 글 (더 최신 글) */}
          <div className="flex-1">
            {nextPost && (
              <Link
                href={`/posts/${nextPost.slug}`}
                className="group flex h-full flex-col items-end gap-1 rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all text-right"
              >
                <span className="flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-blue-500">
                  다음 글
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm font-semibold text-gray-700 line-clamp-2 group-hover:text-blue-600">
                  {nextPost.title}
                </span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </article>
  );
}
