import { getPublishedPosts } from '@/lib/notion';
import PostCard from '@/components/PostCard';

// ISR: 60초마다 재검증
export const revalidate = 60;

export default async function HomePage() {
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">최근 글</h1>
        <p className="mt-2 text-gray-500">개발 경험과 인사이트를 공유합니다.</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-gray-400 py-20">아직 발행된 글이 없습니다.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
