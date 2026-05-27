'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
    >
      로그아웃
    </button>
  );
}
