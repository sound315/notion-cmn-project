import { NextResponse } from 'next/server';
import { createInvoice } from '@/lib/invoice';
import type { InvoiceStatus } from '@/types/invoice';

export async function POST(request: Request) {
  const body = await request.json();
  const { invoiceNumber, clientName, issuedAt, expiresAt, status } = body;

  if (!invoiceNumber || !clientName || !issuedAt || !expiresAt) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
  }

  const invoice = await createInvoice({
    invoiceNumber,
    clientName,
    issuedAt,
    expiresAt,
    status: (status ?? '대기') as InvoiceStatus,
  });

  return NextResponse.json(invoice, { status: 201 });
}
