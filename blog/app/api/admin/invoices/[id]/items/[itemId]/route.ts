import { NextResponse } from 'next/server';
import { deleteItem } from '@/lib/invoice';

interface RouteContext {
  params: Promise<{ id: string; itemId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { itemId } = await params;
  await deleteItem(itemId);
  return NextResponse.json({ ok: true });
}
