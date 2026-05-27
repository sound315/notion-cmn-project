'use client';

// 에러 바운더리는 반드시 클라이언트 컴포넌트로 작성
import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function Error({ error, unstable_retry }: ErrorProps) {
  useEffect(() => {
    // 에러 로깅 (실제 운영에서는 Sentry 등 연동)
    console.error('페이지 렌더링 오류:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="mb-2 text-sm font-semibold text-red-600 uppercase tracking-wider">
        오류 발생
      </p>
      <h1 className="mb-4 text-4xl font-bold text-gray-900">
        페이지를 불러올 수 없습니다
      </h1>
      <p className="mb-8 text-gray-500">
        일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
      </p>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => unstable_retry()}
          className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
