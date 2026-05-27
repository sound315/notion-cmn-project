import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getInvoiceDetail } from '@/lib/invoice';
import InvoiceForm from '@/components/admin/InvoiceForm';
import ItemManager from '@/components/admin/ItemManager';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const invoice = await getInvoiceDetail(id);
  if (!invoice) return { title: '견적서를 찾을 수 없습니다' };
  return { title: `${invoice.invoiceNumber} 수정` };
}

export default async function EditInvoicePage({ params }: PageProps) {
  const { id } = await params;
  const invoice = await getInvoiceDetail(id);

  if (!invoice) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/admin"
        className="mb-8 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        대시보드
      </Link>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">{invoice.invoiceNumber} 수정</h1>

      <InvoiceForm invoice={invoice} />

      <div className="mt-12">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">견적 항목</h2>
        <ItemManager invoiceId={invoice.id} initialItems={invoice.items} />
      </div>
    </div>
  );
}
