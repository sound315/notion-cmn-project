import { Suspense } from 'react';
import LoginForm from '@/components/admin/LoginForm';

export const metadata = { title: '관리자 로그인' };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-bold text-gray-900">관리자 로그인</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
