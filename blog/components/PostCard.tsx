import Link from 'next/link';
import type { Post } from '@/types/post';
import CategoryBadge from './CategoryBadge';
import TagBadge from './TagBadge';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  // 발행일 포맷팅
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      {/* 카테고리 */}
      {post.category && (
        <div className="mb-3">
          <CategoryBadge name={post.category} />
        </div>
      )}

      {/* 제목 */}
      <h2 className="mb-2 text-xl font-semibold text-gray-900">
        <Link
          href={`/posts/${post.slug}`}
          className="hover:text-blue-600 transition-colors"
        >
          {post.title}
        </Link>
      </h2>

      {/* 발행일 */}
      {formattedDate && (
        <p className="mb-4 text-sm text-gray-500">{formattedDate}</p>
      )}

      {/* 태그 목록 */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <TagBadge key={tag} name={tag} />
          ))}
        </div>
      )}
    </article>
  );
}
