import { NextResponse } from 'next/server';
import { createItem } from '@/lib/invoice';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id: invoiceId } = await params;
  const body = await request.json();
  const { name, quantity, unitPrice } = body;

  if (!name || quantity == null || unitPrice == null) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
  }

  const item = await createItem({
    invoiceId,
    name,
    quantity: Number(quantity),
    unitPrice: Number(unitPrice),
  });

  return NextResponse.json(item, { status: 201 });
}
