import { NextResponse } from 'next/server';
import { updateInvoice, deleteInvoice } from '@/lib/invoice';
import type { InvoiceStatus } from '@/types/invoice';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json();
  const { clientName, issuedAt, expiresAt, status } = body;

  const invoice = await updateInvoice(id, {
    clientName,
    issuedAt,
    expiresAt,
    status: status as InvoiceStatus | undefined,
  });

  return NextResponse.json(invoice);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  await deleteInvoice(id);
  return NextResponse.json({ ok: true });
}
