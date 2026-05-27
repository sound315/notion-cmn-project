import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: '문의하기',
  description: '궁금한 점이나 프로젝트 문의를 남겨주세요.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">문의하기</h1>
        <p className="mt-2 text-gray-500">궁금한 점이나 프로젝트 문의를 남겨주세요.</p>
      </div>
      <ContactForm />
    </div>
  );
}
