import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getInvoices } from '@/lib/invoice';
import type { InvoiceStatus } from '@/types/invoice';
import LogoutButton from '@/components/admin/LogoutButton';
import DeleteInvoiceButton from '@/components/admin/DeleteInvoiceButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '관리자 대시보드',
};

const STATUS_STYLE: Record<InvoiceStatus, string> = {
  대기: 'bg-yellow-100 text-yellow-700',
  승인: 'bg-green-100 text-green-700',
  거절: 'bg-red-100 text-red-700',
  완료: 'bg-gray-100 text-gray-600',
};

export default async function AdminPage() {
  const invoices = await getInvoices();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="mt-1 text-gray-500">견적서 관리</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/contacts"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            문의 목록
          </Link>
          <Link
            href="/admin/invoices/new"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            새 견적서
          </Link>
          <LogoutButton />
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-20 text-center text-gray-400">
          등록된 견적서가 없습니다.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">견적서 번호</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">클라이언트</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">발행일</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">총 금액</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-600">상태</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-600">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="font-medium text-blue-600 hover:underline"
                      target="_blank"
                    >
                      {invoice.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{invoice.clientName}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {invoice.issuedAt
                      ? new Date(invoice.issuedAt).toLocaleDateString('ko-KR')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {invoice.totalAmount.toLocaleString('ko-KR')}원
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[invoice.status]}`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/invoices/${invoice.id}/edit`}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        title="수정"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteInvoiceButton id={invoice.id} invoiceNumber={invoice.invoiceNumber} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
