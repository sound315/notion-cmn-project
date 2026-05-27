import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getInvoiceDetail, getInvoices } from '@/lib/invoice';
import type { InvoiceStatus } from '@/types/invoice';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const invoices = await getInvoices();
  return invoices.map((invoice) => ({ id: invoice.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const invoice = await getInvoiceDetail(id);
  if (!invoice) return { title: '견적서를 찾을 수 없습니다' };
  return {
    title: `${invoice.invoiceNumber} — ${invoice.clientName}`,
    description: `${invoice.clientName} 견적서 | 총 ${invoice.totalAmount.toLocaleString('ko-KR')}원`,
  };
}

const STATUS_STYLE: Record<InvoiceStatus, string> = {
  대기: 'bg-yellow-100 text-yellow-700',
  승인: 'bg-green-100 text-green-700',
  거절: 'bg-red-100 text-red-700',
  완료: 'bg-gray-100 text-gray-600',
};

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const invoice = await getInvoiceDetail(id);

  if (!invoice) notFound();

  const issuedAt = invoice.issuedAt
    ? new Date(invoice.issuedAt).toLocaleDateString('ko-KR')
    : '-';
  const expiresAt = invoice.expiresAt
    ? new Date(invoice.expiresAt).toLocaleDateString('ko-KR')
    : '-';

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* 뒤로가기 */}
      <Link
        href="/invoices"
        className="mb-8 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        견적서 목록
      </Link>

      {/* 견적서 헤더 */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
          <p className="mt-1 text-lg text-gray-600">{invoice.clientName}</p>
        </div>
        <span
          className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLE[invoice.status]}`}
        >
          {invoice.status}
        </span>
      </div>

      {/* 기본 정보 */}
      <div className="mb-8 grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">발행일</p>
          <p className="mt-1 text-gray-800">{issuedAt}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">유효기간</p>
          <p className="mt-1 text-gray-800">{expiresAt}</p>
        </div>
      </div>

      {/* 항목 테이블 */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-600">항목명</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-600">수량</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-600">단가</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-600">금액</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoice.items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  항목이 없습니다.
                </td>
              </tr>
            ) : (
              invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-gray-800">{item.name}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{item.quantity}</td>
                  <td className="px-6 py-4 text-right text-gray-600">
                    {item.unitPrice.toLocaleString('ko-KR')}원
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {item.amount.toLocaleString('ko-KR')}원
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {/* 합계 */}
          <tfoot className="border-t-2 border-gray-200 bg-gray-50">
            <tr>
              <td colSpan={3} className="px-6 py-4 text-right font-semibold text-gray-700">
                총 금액
              </td>
              <td className="px-6 py-4 text-right text-lg font-bold text-gray-900">
                {invoice.totalAmount.toLocaleString('ko-KR')}원
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
