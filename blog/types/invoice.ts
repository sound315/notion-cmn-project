// 견적서 상태
export type InvoiceStatus = '대기' | '승인' | '거절' | '완료';

// 견적 항목 (Items 데이터베이스)
export interface InvoiceItem {
  id: string;
  name: string;       // 항목명 (title)
  quantity: number;   // 수량
  unitPrice: number;  // 단가
  amount: number;     // 금액 (수량 × 단가, formula)
  invoiceId: string;  // 연결된 Invoice ID (relation)
}

// 견적서 (Invoices 데이터베이스)
export interface Invoice {
  id: string;
  invoiceNumber: string;  // 견적서 번호 (title) — e.g. INV-2026-001
  clientName: string;     // 클라이언트명
  issuedAt: string;       // 발행일 (ISO 8601)
  expiresAt: string;      // 유효기간 (ISO 8601)
  status: InvoiceStatus;  // 상태
  totalAmount: number;    // 총 금액 (원 단위)
  itemIds: string[];      // 연결된 Item ID 목록 (relation)
}

// Invoice + Items 조인 (상세 조회용)
export interface InvoiceDetail extends Invoice {
  items: InvoiceItem[];
}

// Notion 페이지 → Invoice 변환 시 사용하는 raw 타입
export interface NotionInvoiceProperties {
  '견적서 번호': { type: 'title'; title: Array<{ plain_text: string }> };
  '클라이언트명': { type: 'rich_text'; rich_text: Array<{ plain_text: string }> };
  '발행일': { type: 'date'; date: { start: string } | null };
  '유효기간': { type: 'date'; date: { start: string } | null };
  '상태': { type: 'select'; select: { name: InvoiceStatus } | null };
  '총 금액': { type: 'number'; number: number | null };
  '항목': { type: 'relation'; relation: Array<{ id: string }> };
}

// Notion 페이지 → InvoiceItem 변환 시 사용하는 raw 타입
export interface NotionItemProperties {
  '항목명': { type: 'title'; title: Array<{ plain_text: string }> };
  '수량': { type: 'number'; number: number | null };
  '단가': { type: 'number'; number: number | null };
  '금액': { type: 'formula'; formula: { type: 'number'; number: number | null } };
  'Invoices': { type: 'relation'; relation: Array<{ id: string }> };
}
