import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPublishedPosts, getCategories } from '@/lib/notion';
import PostCard from '@/components/PostCard';
import CategoryBadge from '@/components/CategoryBadge';

// ISR: 60초마다 재검증
export const revalidate = 60;

interface PageProps {
  params: Promise<{ name: string }>;
}

// 정적 경로 사전 생성
export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({
    name: encodeURIComponent(cat.name),
  }));
}

// 메타데이터 동적 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  return {
    title: `${decodedName} 카테고리`,
    description: `${decodedName} 카테고리의 글 목록`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  // 전체 발행 글 중 해당 카테고리 필터링
  const allPosts = await getPublishedPosts();
  const filteredPosts = allPosts.filter((post) => post.category === decodedName);

  // 유효하지 않은 카테고리 처리
  if (filteredPosts.length === 0) {
    notFound();
  }

  // 전체 카테고리 목록 (사이드바용)
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* 페이지 헤더 */}
      <div className="mb-10">
        <p className="mb-2 text-sm text-gray-500">카테고리</p>
        <h1 className="text-3xl font-bold text-gray-900">{decodedName}</h1>
        <p className="mt-2 text-gray-500">{filteredPosts.length}개의 글</p>
      </div>

      <div className="flex gap-8">
        {/* 글 목록 */}
        <div className="flex-1">
          <div className="grid gap-6 sm:grid-cols-2">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        {/* 카테고리 사이드바 */}
        <aside className="hidden w-48 shrink-0 lg:block">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
            카테고리
          </h2>
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <CategoryBadge
                  name={cat.name}
                  linkable={cat.name !== decodedName}
                />
                <span className="text-xs text-gray-400">{cat.count}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
