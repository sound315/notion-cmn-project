'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Invoice, InvoiceStatus } from '@/types/invoice';

const STATUSES: InvoiceStatus[] = ['대기', '승인', '거절', '완료'];

interface Props {
  invoice?: Invoice;
}

export default function InvoiceForm({ invoice }: Props) {
  const router = useRouter();
  const isEdit = !!invoice;

  const [form, setForm] = useState({
    invoiceNumber: invoice?.invoiceNumber ?? '',
    clientName: invoice?.clientName ?? '',
    issuedAt: invoice?.issuedAt ?? '',
    expiresAt: invoice?.expiresAt ?? '',
    status: invoice?.status ?? '대기' as InvoiceStatus,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isEdit ? `/api/admin/invoices/${invoice.id}` : '/api/admin/invoices';
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      router.push('/admin');
    } else {
      const data = await res.json();
      setError(data.error ?? '저장 중 오류가 발생했습니다.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">견적서 번호</label>
        <input
          name="invoiceNumber"
          value={form.invoiceNumber}
          onChange={handleChange}
          required
          disabled={isEdit}
          placeholder="INV-2026-001"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">클라이언트명</label>
        <input
          name="clientName"
          value={form.clientName}
          onChange={handleChange}
          required
          placeholder="A 회사"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">발행일</label>
          <input
            type="date"
            name="issuedAt"
            value={form.issuedAt}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">유효기간</label>
          <input
            type="date"
            name="expiresAt"
            value={form.expiresAt}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '저장 중...' : isEdit ? '수정 저장' : '견적서 생성'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}
