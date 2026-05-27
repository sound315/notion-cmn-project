import type { Metadata } from 'next';
import Link from 'next/link';
import { getInvoices } from '@/lib/invoice';
import type { InvoiceStatus } from '@/types/invoice';

export const revalidate = 60;

export const metadata: Metadata = {
  title: '견적서 목록',
  description: '견적서 목록을 확인합니다.',
};

const STATUS_STYLE: Record<InvoiceStatus, string> = {
  대기: 'bg-yellow-100 text-yellow-700',
  승인: 'bg-green-100 text-green-700',
  거절: 'bg-red-100 text-red-700',
  완료: 'bg-gray-100 text-gray-600',
};

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">견적서 목록</h1>
        <p className="mt-2 text-gray-500">총 {invoices.length}건</p>
      </div>

      {invoices.length === 0 ? (
        <p className="py-20 text-center text-gray-400">등록된 견적서가 없습니다.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">견적서 번호</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">클라이언트</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">발행일</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">유효기간</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">총 금액</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-600">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="font-medium text-blue-600 hover:underline"
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
                  <td className="px-6 py-4 text-gray-500">
                    {invoice.expiresAt
                      ? new Date(invoice.expiresAt).toLocaleDateString('ko-KR')
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
