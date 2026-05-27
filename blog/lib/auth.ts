import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';
const SESSION_COOKIE = 'admin_session';
const SESSION_VALUE = 'authenticated';

export async function verifyPassword(password: string): Promise<boolean> {
  if (!ADMIN_PASSWORD) return false;
  return password === ADMIN_PASSWORD;
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7일
    path: '/',
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}
