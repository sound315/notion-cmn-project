import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import InvoiceForm from '@/components/admin/InvoiceForm';

export const metadata: Metadata = {
  title: '새 견적서',
};

export default function NewInvoicePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/admin"
        className="mb-8 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        대시보드
      </Link>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">새 견적서 작성</h1>
      <InvoiceForm />
    </div>
  );
}
