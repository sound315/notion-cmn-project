'use client';

import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import type { InvoiceItem } from '@/types/invoice';

interface Props {
  invoiceId: string;
  initialItems: InvoiceItem[];
}

export default function ItemManager({ invoiceId, initialItems }: Props) {
  const [items, setItems] = useState<InvoiceItem[]>(initialItems);
  const [form, setForm] = useState({ name: '', quantity: '', unitPrice: '' });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleAdd() {
    if (!form.name || !form.quantity || !form.unitPrice) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    setError('');
    setAdding(true);

    const res = await fetch(`/api/admin/invoices/${invoiceId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        quantity: Number(form.quantity),
        unitPrice: Number(form.unitPrice),
      }),
    });

    setAdding(false);

    if (res.ok) {
      const item: InvoiceItem = await res.json();
      setItems((prev) => [...prev, item]);
      setForm({ name: '', quantity: '', unitPrice: '' });
    } else {
      setError('항목 추가 중 오류가 발생했습니다.');
    }
  }

  async function handleDelete(itemId: string) {
    if (!confirm('이 항목을 삭제하시겠습니까?')) return;

    const res = await fetch(`/api/admin/invoices/${invoiceId}/items/${itemId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } else {
      alert('삭제 중 오류가 발생했습니다.');
    }
  }

  return (
    <div className="space-y-4">
      {/* 항목 목록 */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">항목명</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">수량</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">단가</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">금액</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  항목이 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-gray-800">{item.name}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {item.unitPrice.toLocaleString('ko-KR')}원
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {item.amount.toLocaleString('ko-KR')}원
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 항목 추가 폼 */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-gray-700">항목 추가</p>
        <div className="grid grid-cols-3 gap-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="항목명"
            className="col-span-3 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <input
            name="quantity"
            type="number"
            min="1"
            value={form.quantity}
            onChange={handleChange}
            placeholder="수량"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <input
            name="unitPrice"
            type="number"
            min="0"
            value={form.unitPrice}
            onChange={handleChange}
            placeholder="단가"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <button
            onClick={handleAdd}
            disabled={adding}
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            추가
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
