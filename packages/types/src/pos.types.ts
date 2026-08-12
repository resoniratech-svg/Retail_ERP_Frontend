import { Product } from './product.types';

export interface CartItem {
  id: string;
  productId: string;
  barcode: string;
  name: string;
  nameAr?: string;
  unitPrice: number;
  quantity: number;
  discount: number; // in QAR or percentage
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  notes?: string;
}

export interface POSSession {
  id: string;
  registerId: string;
  cashierId: string;
  cashierName: string;
  openingFloat: number;
  openedAt: string;
  closedAt?: string;
  closingCashActual?: number;
  closingCashExpected?: number;
  cashDropsTotal: number;
  status: 'OPEN' | 'CLOSED';
}

export interface POSSaleTransaction {
  id: string;
  transactionNo: string;
  sessionId: string;
  branchId: string;
  cashierId: string;
  customerId?: string;
  customerName?: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paymentMethod: 'CASH' | 'CARD' | 'SPLIT' | 'CREDIT';
  amountPaid: number;
  changeAmount: number;
  status: 'COMPLETED' | 'HELD' | 'REFUNDED' | 'CANCELLED';
  createdAt: string;
  isOffline?: boolean;
}

export interface ElectronBridgeAPI {
  // Typed Domain Operations
  listProducts: (params?: any) => Promise<Product[]>;
  getProductByBarcode: (barcode: string) => Promise<Product | null>;
  createSale: (sale: POSSaleTransaction) => Promise<{ success: boolean; id: string }>;
  holdInvoice: (invoiceData: any) => Promise<boolean>;
  recallInvoices: () => Promise<any[]>;
  openRegisterSession: (openingFloat: number) => Promise<POSSession>;
  closeRegisterSession: (actualCash: number) => Promise<POSSession>;
  recordCashDrop: (amount: number, reason: string) => Promise<boolean>;
  getPendingSyncQueue: () => Promise<any[]>;
  markSynced: (syncId: string) => Promise<boolean>;
  printReceipt: (receiptData: any) => Promise<boolean>;
  openCashDrawer: () => Promise<boolean>;
  getDeviceStatus: () => Promise<{ scannerConnected: boolean; printerConnected: boolean }>;
}
