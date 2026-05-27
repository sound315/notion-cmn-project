import { NextResponse } from 'next/server';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: '비밀번호를 입력해주세요.' }, { status: 400 });
  }

  const valid = await verifyPassword(password);
  if (!valid) {
    return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
