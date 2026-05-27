'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface Props {
  id: string;
  invoiceNumber: string;
}

export default function DeleteInvoiceButton({ id, invoiceNumber }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`"${invoiceNumber}" 견적서를 삭제하시겠습니까?`)) return;

    setLoading(true);
    const res = await fetch(`/api/admin/invoices/${id}`, { method: 'DELETE' });
    setLoading(false);

    if (res.ok) {
      router.refresh();
    } else {
      alert('삭제 중 오류가 발생했습니다.');
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50 transition-colors"
      title="삭제"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
