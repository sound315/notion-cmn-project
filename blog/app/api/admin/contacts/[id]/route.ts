import { NextResponse } from 'next/server';
import { markAsRead } from '@/lib/contact';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  try {
    await markAsRead(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('읽음 처리 오류:', error);
    return NextResponse.json({ error: '읽음 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
