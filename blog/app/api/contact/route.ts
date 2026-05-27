import { NextResponse } from 'next/server';
import { createContact } from '@/lib/contact';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json({ error: '모든 항목을 입력해주세요.' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: '올바른 이메일 형식이 아닙니다.' }, { status: 400 });
  }

  try {
    const contact = await createContact({ name, email, message });
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('문의 저장 오류:', error);
    return NextResponse.json({ error: '문의 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
