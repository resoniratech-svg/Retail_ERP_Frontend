export interface CartRow {
  id: string;
  barcode: string;
  name: string;
  description?: string;
  qty: number;
  unitPrice: number;
  tax: number;
  discount: number;
  lineTotal: number;
}

export interface HeldInvoiceItem {
  id: string;
  ref: string;
  itemsCount: number;
  total: number;
  time: string;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'SPLIT' | 'POINTS';
