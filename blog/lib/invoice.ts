import { Client, isFullPage } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type { Invoice, InvoiceItem, InvoiceDetail, InvoiceStatus } from '@/types/invoice';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const INVOICES_DATABASE_ID = process.env.NOTION_DATABASE_ID!.replace(/-/g, '');
const ITEMS_DATABASE_ID = process.env.NOTION_ITEMS_DATABASE_ID!.replace(/-/g, '');

function pageToInvoice(page: PageObjectResponse): Invoice {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props = page.properties as any;

  const invoiceNumber =
    props['견적서 번호']?.title?.map((t: { plain_text: string }) => t.plain_text).join('') ?? '';

  const clientName =
    props['클라이언트명']?.rich_text?.map((t: { plain_text: string }) => t.plain_text).join('') ?? '';

  const issuedAt = props['발행일']?.date?.start ?? '';
  const expiresAt = props['유효기간']?.date?.start ?? '';

  const status = (props['상태']?.select?.name ?? '대기') as InvoiceStatus;

  const totalAmount = props['총 금액']?.number ?? 0;

  const itemIds: string[] =
    props['항목']?.relation?.map((r: { id: string }) => r.id) ?? [];

  return {
    id: page.id,
    invoiceNumber,
    clientName,
    issuedAt,
    expiresAt,
    status,
    totalAmount,
    itemIds,
  };
}

function pageToItem(page: PageObjectResponse): InvoiceItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props = page.properties as any;

  const name =
    props['항목명']?.title?.map((t: { plain_text: string }) => t.plain_text).join('') ?? '';

  const quantity = props['수량']?.number ?? 0;
  const unitPrice = props['단가']?.number ?? 0;
  const amount = props['금액']?.formula?.number ?? quantity * unitPrice;

  const invoiceId: string = props['Invoices']?.relation?.[0]?.id ?? '';

  return {
    id: page.id,
    name,
    quantity,
    unitPrice,
    amount,
    invoiceId,
  };
}

/**
 * 전체 견적서 목록 조회 (발행일 최신순)
 */
export async function getInvoices(): Promise<Invoice[]> {
  try {
    const response = await notion.search({
      filter: { property: 'object', value: 'page' },
      sort: { direction: 'descending', timestamp: 'last_edited_time' },
    });

    const invoices = response.results
      .filter(isFullPage)
      .filter((page) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbId = (page.parent as any).database_id?.replace(/-/g, '');
        return dbId === INVOICES_DATABASE_ID;
      })
      .map(pageToInvoice);

    // 발행일 기준 최신순 정렬
    return invoices.sort((a, b) => {
      if (!a.issuedAt) return 1;
      if (!b.issuedAt) return -1;
      return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime();
    });
  } catch (error) {
    console.error('견적서 목록 조회 오류:', error);
    return [];
  }
}

/**
 * 견적서 단건 조회
 */
export async function getInvoiceById(id: string): Promise<Invoice | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    if (!isFullPage(page)) return null;
    return pageToInvoice(page);
  } catch (error) {
    console.error('견적서 조회 오류:', error);
    return null;
  }
}

/**
 * 특정 견적서의 항목 목록 조회
 */
export async function getItemsByInvoiceId(invoiceId: string): Promise<InvoiceItem[]> {
  try {
    const response = await notion.search({
      filter: { property: 'object', value: 'page' },
    });

    return response.results
      .filter(isFullPage)
      .filter((page) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbId = (page.parent as any).database_id?.replace(/-/g, '');
        return dbId === ITEMS_DATABASE_ID;
      })
      .map(pageToItem)
      .filter((item) => item.invoiceId.replace(/-/g, '') === invoiceId.replace(/-/g, ''));
  } catch (error) {
    console.error('견적 항목 조회 오류:', error);
    return [];
  }
}

/**
 * 견적서 + 항목 조인 조회 (상세 페이지용)
 */
export async function getInvoiceDetail(id: string): Promise<InvoiceDetail | null> {
  const [invoice, items] = await Promise.all([
    getInvoiceById(id),
    getItemsByInvoiceId(id),
  ]);

  if (!invoice) return null;
  return { ...invoice, items };
}
