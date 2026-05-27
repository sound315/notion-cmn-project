import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getContacts } from '@/lib/contact';
import MarkReadButton from '@/components/admin/MarkReadButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '문의 목록',
};

export default async function AdminContactsPage() {
  const contacts = await getContacts();
  const unreadCount = contacts.filter((c) => !c.read).length;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/admin"
        className="mb-8 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        대시보드
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">문의 목록</h1>
        <p className="mt-1 text-gray-500">
          총 {contacts.length}건
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              미확인 {unreadCount}건
            </span>
          )}
        </p>
      </div>

      {contacts.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-20 text-center text-gray-400">
          접수된 문의가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`rounded-xl border bg-white p-6 transition-colors ${
                contact.read ? 'border-gray-200' : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!contact.read && (
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                    <span className="font-semibold text-gray-900">{contact.name}</span>
                    <span className="text-sm text-gray-500">{contact.email}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                    {contact.message}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    {contact.createdAt
                      ? new Date(contact.createdAt).toLocaleDateString('ko-KR')
                      : '-'}
                  </p>
                </div>
                {!contact.read && <MarkReadButton id={contact.id} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
