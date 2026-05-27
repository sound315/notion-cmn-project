import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="mb-2 text-sm font-semibold text-blue-600 uppercase tracking-wider">
        404
      </p>
      <h1 className="mb-4 text-4xl font-bold text-gray-900">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="mb-8 text-gray-500">
        요청하신 페이지가 존재하지 않거나 삭제되었습니다.
      </p>
      <Link
        href="/"
        className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
