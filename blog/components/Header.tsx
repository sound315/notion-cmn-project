import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        {/* 블로그 제목 */}
        <Link
          href="/"
          className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
        >
          Dev Blog
        </Link>

        {/* 네비게이션 */}
        <nav>
          <ul className="flex items-center gap-6 text-sm font-medium text-gray-600">
            <li>
              <Link href="/" className="hover:text-gray-900 transition-colors">
                홈
              </Link>
            </li>
            <li>
              <Link href="/invoices" className="hover:text-gray-900 transition-colors">
                견적서
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
