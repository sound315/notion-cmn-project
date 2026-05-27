'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MarkReadButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await fetch(`/api/admin/contacts/${id}`, { method: 'PATCH' });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
    >
      {loading ? '...' : '읽음'}
    </button>
  );
}
