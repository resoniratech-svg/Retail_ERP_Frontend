import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Plus, Search, Eye, Edit, Trash2, Power, ArrowRight, X, Printer, Undo2, Save, Banknote, CheckCircle2, Tag, List, ArrowRightLeft, Mail, History } from 'lucide-react';
import { productsService } from '@qatar-erp/api';
import { Product } from '@qatar-erp/types';
import { formatQAR } from '@qatar-erp/utils';
import { PDTListModal } from './components/PDTListModal';

const STORAGE_KEY = 'retail_erp_purchases';
const CURRENT_USER = 'Ahmed Al-Mansouri (SUPER_ADMIN)';

type PurchaseStatus = 'DRAFT' | 'POSTED' | 'PAID' | 'CANCELLED';

interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  code: string;
  barcode: string;
  unit: string;
  uom: string;
  serialNo: string;
  quantity: number;
  foc: number;
  supCost: number;
  unitDisc: number;
  itemDiscount: number;
  discPercent: number;
  amount: number;
  taxPercent: number;
  taxAmount: number;
  amtInclTax: number;
  batchNo: string;
  expiryDate: string;
  remarks: string;
  additionalDescriptions: string;
  
  // Extra columns shown in table
  billDiscount: number;
  cost: number;
  priceIndTax: number;
  wsPriceIn: number;
  assignFoc: number;
  markUp: number;
  gp: number;
  wsMarkUp: number;
  wsGp: number;
  msp: number;
  wsmsp: number;
  productLe: string;
  landingCost: number;
  poUnique: string;
  priceExclTax: number;
  wsPriceE: number;
  mnSlNo: string;
  profit: number;
}

interface PurchaseInvoice {
  id: string;
  invoiceNo: string;
  supplierName: string;
  invoiceDate: string;
  dueDate: string;
  reference: string; // Used for Refno
  
  // Added DART fields
  receivedOn: string;
  currency: string;
  exchangeRate: number;
  location: string;
  paymode: string;
  poNo: string;
  disableTax: boolean;
  vendorTrn: string;
  asnNumber: string;
  accInvoiceNumber: string;
  
  notes: string;
  items: PurchaseItem[];
  
  // Totals
  totalAmount: number; // Gross Total
  discountPercentage?: number;
  discountAmount?: number;
  subTotal?: number;
  taxAdjustment?: number;
  taxAmount?: number;
  roundOff?: number;
  netTotal?: number;
  
  status: PurchaseStatus;
  
  // Audit properties
  createdDate: string;
  createdBy: string;
  postedDate?: string;
  postedBy?: string;
  modifiedBy?: string;
  modifiedOn?: string;
  
  // Backward compatibility
  fullReference?: string;
  isPosted?: boolean;
  emailStatus?: string;
}

const DEFAULT_PURCHASES: PurchaseInvoice[] = [
  {
    id: 'pur-2026-001',
    invoiceNo: 'PINV-2026-001',
    supplierName: 'Global Electronics Ltd.',
    invoiceDate: '2026-08-14',
    dueDate: '2026-09-14',
    reference: 'PO-2026-105',
    receivedOn: '2026-08-14',
    currency: 'QAR',
    exchangeRate: 1,
    location: 'Saudi Arabia',
    paymode: 'Credit',
    poNo: '',
    disableTax: false,
    vendorTrn: '',
    asnNumber: '',
    accInvoiceNumber: '',
    notes: 'Initial stock intake for Q3',
    items: [],
    totalAmount: 5000.0,
    status: 'POSTED',
    createdDate: '2026-08-14T08:00:00Z',
    createdBy: CURRENT_USER,
    postedDate: '2026-08-14T09:00:00Z',
    postedBy: CURRENT_USER,
    isPosted: true
  }
];

const initialProductEntry = {
  id: '',
  productId: '',
  productName: '',
  sku: '',
  code: '',
  barcode: '',
  unit: 'Unit',
  uom: '1',
  serialNo: '',
  
  // Costs & Prices
  newCostExclTax: 0,
  newCostIndTax: 0,
  retailMsp: 0,
  retailNewPrice: 0,
  retailProfit: 0,
  wholesaleMsp: 0,
  wholesaleProfit: 0,
  currCost: 0,
  taxPercent: 0,
  currPrice: 0,
  priceIndTax: 0,
  
  // Options
  calcQtyFromSerialNos: false,
  doNotUpdateCost: false,
  doNotUpdatePrice: false,
  alertForSameProduct: true,
  importedPurchase: false,
  
  // Quantity & Amounts
  quantity: 0,
  foc: 0,
  supCost: 0,
  unitDisc: 0,
  itemDiscount: 0,
  discPercent: 0,
  amount: 0,
  taxAmount: 0,
  amtInclTax: 0,
  batchNo: '',
  expiryDate: '',
  remarks: '',
  additionalDescriptions: '',
  
  radioSelection: 'Markup',
  gpPercent: 0
};

export const PurchasePage: React.FC = () => {
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activePurchase, setActivePurchase] = useState<PurchaseInvoice | null>(null);
  const [isPDTModalOpen, setIsPDTModalOpen] = useState(false);
  
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<Partial<PurchaseInvoice>>({ items: [] });
  
  // Product Entry State
  const [productEntry, setProductEntry] = useState(initialProductEntry);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(productsService.getProductsSync());
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPurchases(JSON.parse(saved));
      } else {
        setPurchases(DEFAULT_PURCHASES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PURCHASES));
      }
    } catch (e) {
      setPurchases(DEFAULT_PURCHASES);
    }
  };

  const savePurchases = (data: PurchaseInvoice[]) => {
    setPurchases(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const getStatusBadge = (status: PurchaseStatus) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="neutral">Draft</Badge>;
      case 'POSTED': return <Badge variant="warning">Posted</Badge>;
      case 'PAID': return <Badge variant="success">Paid</Badge>;
      case 'CANCELLED': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleOpenNew = () => {
    setFormError('');
    setFormData({
      invoiceNo: `PINV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierName: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      receivedOn: new Date().toISOString().split('T')[0],
      dueDate: '',
      reference: '',
      currency: 'QAR',
      exchangeRate: 1,
      location: '',
      paymode: 'Credit',
      poNo: '',
      disableTax: false,
      vendorTrn: '',
      asnNumber: '',
      accInvoiceNumber: '',
      notes: '',
      items: [],
      totalAmount: 0,
      discountPercentage: 0,
      discountAmount: 0,
      subTotal: 0,
      taxAdjustment: 0,
      taxAmount: 0,
      roundOff: 0,
      netTotal: 0,
      status: 'DRAFT',
      createdBy: CURRENT_USER,
      createdDate: new Date().toISOString()
    });
    setProductEntry(initialProductEntry);
    setEditingItemId(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (p: PurchaseInvoice) => {
    setFormError('');
    setFormData(JSON.parse(JSON.stringify(p)));
    setProductEntry(initialProductEntry);
    setEditingItemId(null);
    setIsFormModalOpen(true);
  };

  const handleDelete = (p: PurchaseInvoice) => {
    if (confirm(`Are you sure you want to delete purchase invoice ${p.invoiceNo}?`)) {
      savePurchases(purchases.filter(pur => pur.id !== p.id));
    }
  };

  const handleStatusChange = (p: PurchaseInvoice, newStatus: PurchaseStatus) => {
    const updated = purchases.map(pur => {
      if (pur.id === p.id) {
        const purCopy = { ...pur, status: newStatus, modifiedBy: CURRENT_USER, modifiedOn: new Date().toISOString() };
        if (newStatus === 'POSTED') {
          purCopy.postedBy = CURRENT_USER;
          purCopy.postedDate = new Date().toISOString();
          purCopy.isPosted = true;
        }
        return purCopy;
      }
      return pur;
    });
    savePurchases(updated);
  };

  const calculateTotals = (items: PurchaseItem[], billDiscountPercent: number = 0, billDiscountAmount: number = 0) => {
    let subtotal = 0;
    let taxTotal = 0;
    
    items.forEach(item => {
      subtotal += item.amount || 0;
      taxTotal += item.taxAmount || 0;
    });

    const netTotal = subtotal - billDiscountAmount + taxTotal;

    return { subtotal, discountTotal: billDiscountAmount, taxTotal, grandTotal: netTotal };
  };

  const handleSaveForm = (submitAsStatus: PurchaseStatus) => {
    setFormError('');
    if (!formData.supplierName) return setFormError('Vendor is required.');
    if (!formData.invoiceDate) return setFormError('Invoice Date is required.');
    
    const { subtotal, discountTotal, taxTotal, grandTotal } = calculateTotals(formData.items || [], formData.discountPercentage || 0, formData.discountAmount || 0);

    const payload: PurchaseInvoice = {
      ...(formData as PurchaseInvoice),
      id: formData.id || `pur-${Date.now()}`,
      status: submitAsStatus,
      totalAmount: subtotal,
      subTotal: subtotal - discountTotal,
      taxAmount: taxTotal,
      discountAmount: discountTotal,
      netTotal: grandTotal,
    };

    if (submitAsStatus === 'POSTED' && !formData.postedDate) {
      payload.postedDate = new Date().toISOString();
      payload.postedBy = CURRENT_USER;
      payload.isPosted = true;
    }

    if (formData.id) {
      payload.modifiedBy = CURRENT_USER;
      payload.modifiedOn = new Date().toISOString();
      savePurchases(purchases.map(pur => pur.id === formData.id ? payload : pur));
    } else {
      savePurchases([payload, ...purchases]);
    }
    setIsFormModalOpen(false);
  };

  const updateProductEntry = (field: string, value: any) => {
    setProductEntry(prev => {
      const next = { ...prev, [field]: value };
      
      // Auto calc
      const qty = next.quantity || 0;
      const supCost = next.supCost || 0;
      const taxPct = next.taxPercent || 0;
      const disc = next.itemDiscount || 0;
      
      const gross = qty * supCost;
      const amount = gross - disc;
      const taxAmt = amount * (taxPct / 100);
      
      next.amount = amount;
      next.taxAmount = taxAmt;
      next.amtInclTax = amount + taxAmt;
      
      return next;
    });
  };

  const handleAddProduct = () => {
    if (!productEntry.productName && !productEntry.code) {
      alert("Please enter a product code or name.");
      return;
    }

    const newItem: PurchaseItem = {
      id: editingItemId || `itm-${Date.now()}`,
      productId: productEntry.productId,
      productName: productEntry.productName,
      sku: productEntry.sku,
      code: productEntry.code,
      barcode: productEntry.barcode,
      unit: productEntry.unit,
      uom: productEntry.uom,
      serialNo: productEntry.serialNo,
      quantity: productEntry.quantity,
      foc: productEntry.foc,
      supCost: productEntry.supCost,
      unitDisc: productEntry.unitDisc,
      itemDiscount: productEntry.itemDiscount,
      discPercent: productEntry.discPercent,
      amount: productEntry.amount,
      taxPercent: productEntry.taxPercent,
      taxAmount: productEntry.taxAmount,
      amtInclTax: productEntry.amtInclTax,
      batchNo: productEntry.batchNo,
      expiryDate: productEntry.expiryDate,
      remarks: productEntry.remarks,
      additionalDescriptions: productEntry.additionalDescriptions,
      
      billDiscount: 0,
      cost: productEntry.supCost,
      priceIndTax: productEntry.priceIndTax,
      wsPriceIn: 0,
      assignFoc: 0,
      markUp: 0,
      gp: 0,
      wsMarkUp: 0,
      wsGp: 0,
      msp: productEntry.retailMsp,
      wsmsp: 0,
      productLe: '',
      landingCost: 0,
      poUnique: '',
      priceExclTax: 0,
      wsPriceE: 0,
      mnSlNo: '',
      profit: 0
    };

    setFormData(prev => {
      const existingItems = prev.items || [];
      if (editingItemId) {
        return {
          ...prev,
          items: existingItems.map(item => item.id === editingItemId ? newItem : item)
        };
      } else {
        return {
          ...prev,
          items: [...existingItems, newItem]
        };
      }
    });

    setProductEntry(initialProductEntry);
    setEditingItemId(null);
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData({ ...formData, items: formData.items?.filter(i => i.id !== itemId) });
  };

  const handleEditProduct = (item: PurchaseItem) => {
    setProductEntry({
      ...initialProductEntry,
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      code: item.code,
      barcode: item.barcode,
      unit: item.unit,
      uom: item.uom,
      serialNo: item.serialNo,
      quantity: item.quantity,
      foc: item.foc,
      supCost: item.supCost,
      unitDisc: item.unitDisc,
      itemDiscount: item.itemDiscount,
      discPercent: item.discPercent,
      amount: item.amount,
      taxPercent: item.taxPercent,
      taxAmount: item.taxAmount,
      amtInclTax: item.amtInclTax,
      batchNo: item.batchNo,
      expiryDate: item.expiryDate,
      remarks: item.remarks,
      additionalDescriptions: item.additionalDescriptions
    });
    setEditingItemId(item.id);
  };

  const filteredPurchases = purchases.filter(pur => {
    if (statusFilter !== 'ALL' && pur.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return pur.invoiceNo.toLowerCase().includes(q) || 
             pur.supplierName.toLowerCase().includes(q) ||
             pur.reference.toLowerCase().includes(q) ||
             (pur.fullReference && pur.fullReference.toLowerCase().includes(q));
    }
    return true;
  });

  const totals = calculateTotals(formData.items || [], formData.discountPercentage || 0, formData.discountAmount || 0);
  
  const totalQty = (formData.items || []).reduce((acc, curr) => acc + curr.quantity, 0);
  const totalFoc = (formData.items || []).reduce((acc, curr) => acc + curr.foc, 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col border border-slate-300 dark:border-slate-700 rounded-sm bg-[#f1f5f9] dark:bg-slate-800 shadow-sm">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between p-1 border-b border-slate-300 dark:border-slate-700">
          <div className="flex items-center">
            <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300">
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Barcode</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300">
              <Undo2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Unpost</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300">
              <Save className="w-3.5 h-3.5 text-slate-600" />
              <span>Save Layout</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300">
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              <span>Payments</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Approval Status</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300">
              <Tag className="w-3.5 h-3.5 text-blue-500" />
              <span>Price Update</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300" onClick={() => setIsPDTModalOpen(true)}>
              <List className="w-3.5 h-3.5 text-orange-500" />
              <span>PDT List</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300">
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>Stock Transfer</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300">
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              <span>E-Mail To Vendor</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300">
              <History className="w-3.5 h-3.5 text-slate-600" />
              <span>Action History</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <Edit className="w-3.5 h-3.5 text-slate-600" />
              <span>Modify Expenses</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2 pr-2">
            <Button variant="outline" className="py-1 px-2 text-xs h-7 flex items-center gap-1" onClick={loadData}>
              Refresh
            </Button>
            <Button variant="primary" className="py-1 px-2 text-xs h-7 flex items-center gap-1 font-bold" onClick={handleOpenNew}>
              <Plus className="w-3.5 h-3.5" /> New Purchase
            </Button>
          </div>
        </div>

        {/* Serial Search Row */}
        <div className="flex items-center gap-3 p-1.5 bg-[#e2e8f0] dark:bg-slate-900 border-b border-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-700 font-medium ml-1">Serial Search</span>
            <input type="text" className="w-48 px-2 py-0.5 text-xs border border-slate-300 rounded bg-white" />
            <button className="flex items-center gap-1 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded hover:bg-slate-50">
              <Search className="w-3 h-3 text-blue-500" /> Search
            </button>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-[11px] text-slate-700">Records</span>
            <input type="text" value="0" readOnly className="w-16 px-2 py-0.5 text-xs border border-slate-300 rounded bg-slate-100 text-center" />
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-[11px] text-slate-700">List Type</span>
            <select className="px-2 py-0.5 text-xs border border-slate-300 rounded bg-white w-32">
              <option>All</option>
              <option>Drafted</option>
              <option>Approval Pending</option>
              <option>Approved Not Posted</option>
              <option>Posted</option>
            </select>
          </div>
        </div>
        
        {/* Purchases Header */}
        <div className="bg-slate-200 text-slate-700 text-center text-[11px] font-bold py-1 border-b border-slate-300">
          Purchases
        </div>

        {/* Search Bar Row */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900 border-b border-slate-300">
          <input
            type="text"
            placeholder="Enter text to search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-primary-500 ml-1"
          />
          <button className="px-4 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-50 shadow-sm text-slate-700 font-medium">
            Find
          </button>
          <button 
            className="px-4 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-50 shadow-sm text-slate-700 font-medium"
            onClick={() => setSearchTerm('')}
          >
            Clear
          </button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-max">
            <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-[11px] font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">Full Reference</th>
                <th className="p-4">Refno</th>
                <th className="p-4">Vendor</th>
                <th className="p-4">Invoice No</th>
                <th className="p-4">Invoice Date</th>
                <th className="p-4">Received On</th>
                <th className="p-4">Location</th>
                <th className="p-4">Currency</th>
                <th className="p-4">Paymode</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-right">Discount %</th>
                <th className="p-4 text-right">Discount</th>
                <th className="p-4 text-right">Sub Total</th>
                <th className="p-4 text-right">Tax Adjustment</th>
                <th className="p-4 text-right">TAX</th>
                <th className="p-4 text-right">Round Off</th>
                <th className="p-4 text-right">Net Total</th>
                <th className="p-4 text-center">Is Posted</th>
                <th className="p-4 text-center">Email Status</th>
                <th className="p-4">Created By</th>
                <th className="p-4">Created On</th>
                <th className="p-4">Modified By</th>
                <th className="p-4">Modified On</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {filteredPurchases.length > 0 ? filteredPurchases.map((p) => {
                const total = p.totalAmount;
                const discPct = p.discountPercentage || 0;
                const discAmt = p.discountAmount || 0;
                const subTot = p.subTotal !== undefined ? p.subTotal : total;
                const taxAdj = p.taxAdjustment || 0;
                const taxAmt = p.taxAmount || 0;
                const roundOff = p.roundOff || 0;
                const netTot = p.netTotal !== undefined ? p.netTotal : total;
                const isPosted = p.isPosted || p.status === 'POSTED' || p.status === 'PAID';

                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-xs">
                    <td className="p-4">{p.fullReference || '—'}</td>
                    <td className="p-4">{p.reference || '—'}</td>
                    <td className="p-4 font-medium">{p.supplierName}</td>
                    <td className="p-4 font-mono font-bold">{p.invoiceNo}</td>
                    <td className="p-4">{p.invoiceDate}</td>
                    <td className="p-4">{p.receivedOn || '—'}</td>
                    <td className="p-4">{p.location || '—'}</td>
                    <td className="p-4">{p.currency || '—'}</td>
                    <td className="p-4">{p.paymode || '—'}</td>
                    <td className="p-4 text-right text-slate-600">{total.toFixed(2)}</td>
                    <td className="p-4 text-right text-slate-600">{discPct.toFixed(2)}</td>
                    <td className="p-4 text-right text-rose-600">{discAmt.toFixed(2)}</td>
                    <td className="p-4 text-right font-medium text-slate-700">{subTot.toFixed(2)}</td>
                    <td className="p-4 text-right text-slate-600">{taxAdj.toFixed(2)}</td>
                    <td className="p-4 text-right text-slate-600">{taxAmt.toFixed(2)}</td>
                    <td className="p-4 text-right text-slate-600">{roundOff.toFixed(2)}</td>
                    <td className="p-4 text-right font-bold text-emerald-600">{netTot.toFixed(2)}</td>
                    <td className="p-4 text-center">{isPosted ? 'Yes' : 'No'}</td>
                    <td className="p-4 text-center">{p.emailStatus || '—'}</td>
                    <td className="p-4">{p.createdBy || '—'}</td>
                    <td className="p-4">{p.createdDate ? new Date(p.createdDate).toLocaleDateString() : '—'}</td>
                    <td className="p-4">{p.modifiedBy || '—'}</td>
                    <td className="p-4">{p.modifiedOn ? new Date(p.modifiedOn).toLocaleDateString() : '—'}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600" onClick={() => { setActivePurchase(p); setIsViewModalOpen(true); }} title="View Details">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        
                        {p.status === 'DRAFT' && (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600" onClick={() => handleEdit(p)} title="Edit">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        )}

                        {p.status === 'DRAFT' && (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-500 hover:text-emerald-600" onClick={() => handleStatusChange(p, 'POSTED')} title="Post Invoice">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        )}

                        {p.status === 'DRAFT' && (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600" onClick={() => handleDelete(p)} title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}

                        {p.status === 'POSTED' && (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-indigo-500 hover:text-indigo-600" onClick={() => handleStatusChange(p, 'PAID')} title="Mark as Paid">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        )}

                        {(p.status === 'POSTED' || p.status === 'DRAFT') && (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600" onClick={() => handleStatusChange(p, 'CANCELLED')} title="Cancel">
                            <Power className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={24} className="p-8 text-center text-slate-500">
                    No purchase invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* --- ADD / EDIT MODAL (REBUILT FOR DART POS) --- */}
      {isFormModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsFormModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-[95vw] max-w-7xl flex flex-col h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  {formData.id ? `Edit Purchase: ${formData.invoiceNo}` : "New Purchase"}
                </h3>
              </div>
              <button onClick={() => setIsFormModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-4 [&::-webkit-scrollbar]:hidden">
              {formError && (
                <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-md font-medium border border-rose-200">
                  {formError}
                </div>
              )}
              
              {/* Top Block: Invoice Details */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 border-b border-slate-100 pb-2 mb-3">Invoice Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-9 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-700 block mb-1">Vendor *</label>
                    <Select 
                      options={[{value:'', label:'Choose Vendor'}, {value:'Global Electronics Ltd.', label:'Global Electronics Ltd.'}]}
                      value={formData.supplierName}
                      onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
                      className="w-full text-sm"
                    />
                  </div>
                  <Input label="Invoice No" value={formData.invoiceNo} readOnly className="bg-slate-50" />
                  <Input label="Invoice Date *" type="date" value={formData.invoiceDate} onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})} />
                  <Input label="Received On" type="date" value={formData.receivedOn} onChange={(e) => setFormData({...formData, receivedOn: e.target.value})} />
                  
                  <div className="col-span-1 flex gap-1 items-end">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-slate-700 block mb-1">Currency</label>
                      <Select 
                        options={[{value:'QAR', label:'QAR'}, {value:'USD', label:'USD'}]}
                        value={formData.currency}
                        onChange={(e) => setFormData({...formData, currency: e.target.value})}
                        className="w-full text-sm"
                      />
                    </div>
                    <div className="w-12">
                      <Input value={formData.exchangeRate?.toString() || '1'} onChange={(e) => setFormData({...formData, exchangeRate: parseFloat(e.target.value) || 1})} />
                    </div>
                  </div>

                  <div className="col-span-1">
                    <label className="text-xs font-medium text-slate-700 block mb-1">Location</label>
                    <Select 
                      options={[{value:'Saudi Arabia', label:'Saudi Arabia'}, {value:'Qatar', label:'Qatar'}]}
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full text-sm"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="text-xs font-medium text-slate-700 block mb-1">Paymode</label>
                    <Select 
                      options={[{value:'Credit', label:'Credit'}, {value:'Cash', label:'Cash'}]}
                      value={formData.paymode}
                      onChange={(e) => setFormData({...formData, paymode: e.target.value})}
                      className="w-full text-sm"
                    />
                  </div>

                  <Input label="PO No." value={formData.poNo} onChange={(e) => setFormData({...formData, poNo: e.target.value})} />

                  <div className="col-span-2">
                    <Input label="ASN Number" value={formData.asnNumber} onChange={(e) => setFormData({...formData, asnNumber: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <Input label="ACC.Invoice Number" value={formData.accInvoiceNumber} onChange={(e) => setFormData({...formData, accInvoiceNumber: e.target.value})} />
                  </div>
                  <div className="col-span-3 flex items-center gap-4 px-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer mt-4">
                      <input type="checkbox" checked={formData.disableTax} onChange={(e) => setFormData({...formData, disableTax: e.target.checked})} />
                      Disable Tax
                    </label>
                    <div className="flex-1">
                      <Input label="Vendor TRN" value={formData.vendorTrn} onChange={(e) => setFormData({...formData, vendorTrn: e.target.value})} />
                    </div>
                  </div>
                  <div className="col-span-2 flex items-end">
                    <Button variant="outline" className="w-full text-xs text-emerald-700 bg-emerald-50 border-emerald-200">Import from Excel</Button>
                  </div>
                </div>
              </div>

              {/* Middle Block: Purchase Product Details Form */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-4">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 border-b border-slate-100 pb-2">Purchase Product Details</h4>
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Left Form Grid */}
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                      <Input label="Code" value={productEntry.code} onChange={(e) => updateProductEntry('code', e.target.value)} />
                      <Input label="Barcode" value={productEntry.barcode} onChange={(e) => updateProductEntry('barcode', e.target.value)} />
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-slate-700 block mb-1">Product Name</label>
                        <Select 
                          options={[{value:'', label:'[Select...]'}, {value:'Item A', label:'Item A'}]}
                          value={productEntry.productName}
                          onChange={(e) => updateProductEntry('productName', e.target.value)}
                          className="w-full text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-700 block mb-1">Unit</label>
                        <Select 
                          options={[{value:'Unit', label:'Unit'}, {value:'Box', label:'Box'}]}
                          value={productEntry.unit}
                          onChange={(e) => updateProductEntry('unit', e.target.value)}
                          className="w-full text-sm"
                        />
                      </div>
                      <Input label="UOM" value={productEntry.uom} onChange={(e) => updateProductEntry('uom', e.target.value)} />
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
                      <Input label="Pur. Qty" type="number" value={productEntry.quantity} onChange={(e) => updateProductEntry('quantity', parseFloat(e.target.value)||0)} />
                      <Input label="FOC" type="number" value={productEntry.foc} onChange={(e) => updateProductEntry('foc', parseFloat(e.target.value)||0)} />
                      <Input label="Sup. Cost" type="number" value={productEntry.supCost} onChange={(e) => updateProductEntry('supCost', parseFloat(e.target.value)||0)} />
                      <Input label="Unit. Disc" type="number" value={productEntry.unitDisc} onChange={(e) => updateProductEntry('unitDisc', parseFloat(e.target.value)||0)} />
                      <Input label="Discount" type="number" value={productEntry.itemDiscount} onChange={(e) => updateProductEntry('itemDiscount', parseFloat(e.target.value)||0)} />
                      <Input label="Disc %" type="number" value={productEntry.discPercent} onChange={(e) => updateProductEntry('discPercent', parseFloat(e.target.value)||0)} />
                      <Input label="Amount" type="number" value={productEntry.amount} readOnly className="bg-slate-50" />
                      <Input label="Tax Amount" type="number" value={productEntry.taxAmount} readOnly className="bg-slate-50" />
                      <Input label="Amt. Incl Tax" type="number" value={productEntry.amtInclTax} readOnly className="bg-slate-50" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                      <div className="md:col-span-3">
                        <Input label="Remarks" value={productEntry.remarks} onChange={(e) => updateProductEntry('remarks', e.target.value)} />
                      </div>
                      <div className="md:col-span-3">
                        <Input label="Additional Descriptions" value={productEntry.additionalDescriptions} onChange={(e) => updateProductEntry('additionalDescriptions', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Right Blocks */}
                  <div className="w-full lg:w-96 grid grid-cols-2 gap-3 shrink-0">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] font-semibold mb-2 uppercase text-slate-500">Current Details</div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input label="Curr. Cost" type="number" value={productEntry.currCost} readOnly className="bg-white" />
                        <Input label="Tax (%)" type="number" value={productEntry.taxPercent} onChange={(e) => updateProductEntry('taxPercent', parseFloat(e.target.value)||0)} />
                        <Input label="Curr. Price" type="number" value={productEntry.currPrice} readOnly className="bg-white" />
                        <Input label="Price Ind Tax" type="number" value={productEntry.priceIndTax} onChange={(e) => updateProductEntry('priceIndTax', parseFloat(e.target.value)||0)} />
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] font-semibold mb-2 uppercase text-slate-500">Options</div>
                      <div className="flex flex-col gap-1 text-[11px] font-medium text-slate-700">
                        <label className="flex items-center gap-1.5"><input type="checkbox" checked={productEntry.calcQtyFromSerialNos} onChange={(e) => updateProductEntry('calcQtyFromSerialNos', e.target.checked)} /> Calc. Qty From Serial Nos.</label>
                        <label className="flex items-center gap-1.5"><input type="checkbox" checked={productEntry.doNotUpdateCost} onChange={(e) => updateProductEntry('doNotUpdateCost', e.target.checked)} /> Do not update cost</label>
                        <label className="flex items-center gap-1.5"><input type="checkbox" checked={productEntry.doNotUpdatePrice} onChange={(e) => updateProductEntry('doNotUpdatePrice', e.target.checked)} /> Do not update price</label>
                        <label className="flex items-center gap-1.5"><input type="checkbox" checked={productEntry.alertForSameProduct} onChange={(e) => updateProductEntry('alertForSameProduct', e.target.checked)} /> Alert For Same Product</label>
                        <label className="flex items-center gap-1.5"><input type="checkbox" checked={productEntry.importedPurchase} onChange={(e) => updateProductEntry('importedPurchase', e.target.checked)} /> Imported purchase</label>
                      </div>
                    </div>

                    <div className="col-span-2 flex gap-2">
                      <Button variant="outline" className="flex-1 text-xs py-1" onClick={() => {}}>List</Button>
                      <Button variant="outline" className="flex-1 text-xs py-1" onClick={() => {}}>PDT F7</Button>
                      <Button variant="outline" className="flex-1 text-xs py-1 bg-emerald-50 text-emerald-700 border-emerald-200" onClick={handleAddProduct}>
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add F1
                      </Button>
                      <Button variant="outline" className="flex-1 text-xs py-1" onClick={() => {}}>
                        <Edit className="w-3.5 h-3.5 mr-1" /> Edit F3
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Block */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col min-h-[250px]">
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-[11px] whitespace-nowrap min-w-max">
                    <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-semibold text-slate-600 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-2">SlNo</th>
                        <th className="p-2">Code</th>
                        <th className="p-2">Barcode</th>
                        <th className="p-2">Product Name</th>
                        <th className="p-2">UOM</th>
                        <th className="p-2 text-right">Quantity</th>
                        <th className="p-2 text-right">FOC</th>
                        <th className="p-2 text-right">Tax (%)</th>
                        <th className="p-2 text-right">Sup. Cost</th>
                        <th className="p-2 text-right">Unit Discount</th>
                        <th className="p-2 text-right">Item Discount</th>
                        <th className="p-2 text-right">Amount</th>
                        <th className="p-2 text-right">Bill Discount</th>
                        <th className="p-2 text-right">Taxes</th>
                        <th className="p-2 text-right">Cost</th>
                        <th className="p-2 text-right">Price Ind Tax</th>
                        <th className="p-2 text-right">WS Price In...</th>
                        <th className="p-2 text-right">Amt. Ind Tax</th>
                        <th className="p-2">Batch No</th>
                        <th className="p-2">Expiry Date</th>
                        <th className="p-2">Serial No</th>
                        <th className="p-2">Remarks</th>
                        <th className="p-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {formData.items?.length === 0 ? (
                        <tr><td colSpan={23} className="p-6 text-center text-slate-500">No items added.</td></tr>
                      ) : (
                        formData.items?.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => handleEditProduct(item)}>
                            <td className="p-2">{idx + 1}</td>
                            <td className="p-2">{item.code}</td>
                            <td className="p-2">{item.barcode}</td>
                            <td className="p-2 font-medium">{item.productName}</td>
                            <td className="p-2">{item.uom}</td>
                            <td className="p-2 text-right font-bold">{item.quantity}</td>
                            <td className="p-2 text-right">{item.foc}</td>
                            <td className="p-2 text-right">{item.taxPercent}</td>
                            <td className="p-2 text-right">{formatQAR(item.supCost)}</td>
                            <td className="p-2 text-right">{formatQAR(item.unitDisc)}</td>
                            <td className="p-2 text-right">{formatQAR(item.itemDiscount)}</td>
                            <td className="p-2 text-right font-medium">{formatQAR(item.amount)}</td>
                            <td className="p-2 text-right">{formatQAR(item.billDiscount)}</td>
                            <td className="p-2 text-right">{formatQAR(item.taxAmount)}</td>
                            <td className="p-2 text-right">{formatQAR(item.cost)}</td>
                            <td className="p-2 text-right">{formatQAR(item.priceIndTax)}</td>
                            <td className="p-2 text-right">{formatQAR(item.wsPriceIn)}</td>
                            <td className="p-2 text-right font-medium text-emerald-600">{formatQAR(item.amtInclTax)}</td>
                            <td className="p-2">{item.batchNo}</td>
                            <td className="p-2">{item.expiryDate}</td>
                            <td className="p-2">{item.serialNo}</td>
                            <td className="p-2 text-slate-500 max-w-[150px] truncate">{item.remarks}</td>
                            <td className="p-2 text-center">
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-rose-500" onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.id); }}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Block: Expenses & Totals */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col">
                  <div className="flex gap-4 border-b border-slate-100 mb-3 text-sm font-medium">
                    <button className="pb-2 border-b-2 border-primary-500 text-primary-600">Expenses & Notes</button>
                    <button className="pb-2 border-b-2 border-transparent text-slate-500">Attached Documents</button>
                    <button className="pb-2 border-b-2 border-transparent text-slate-500">Approval Status</button>
                  </div>
                  <div className="flex-1 flex gap-4">
                    <div className="flex-1 border border-slate-200 rounded p-2 flex flex-col gap-2">
                      <div className="text-xs font-semibold text-slate-600">Other Related Expenses</div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="text-xs py-1 px-2 border-emerald-200 text-emerald-700 bg-emerald-50"><Plus className="w-3 h-3 mr-1"/> Add Pur. Exp.</Button>
                        <Input type="number" value="0.00" readOnly className="w-24 h-7 text-xs bg-slate-50" />
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">Linked Expenses</span>
                          <Button variant="outline" className="text-[10px] h-6 px-2 py-0">View</Button>
                          <Button variant="outline" className="text-[10px] h-6 px-2 py-0">Link</Button>
                        </div>
                      </div>
                      <div className="flex-1 mt-2">
                        <textarea className="w-full h-full min-h-[60px] text-xs p-2 border border-slate-200 rounded bg-slate-50 placeholder-slate-400" placeholder="Enter Notes or Remarks here" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-600 border-b border-slate-100 pb-2 mb-3">
                    <span>Qty: {totalQty}</span>
                    <span>FOC: {totalFoc}</span>
                    <span>Total Qty: {totalQty + totalFoc}</span>
                    <span>Total Profit: 0.00</span>
                    <span>Line Discount: 0.00</span>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1 border border-slate-200 rounded p-3 flex flex-col gap-2 bg-slate-50/50">
                      <div className="text-xs font-bold text-slate-700 mb-1">Apply Bill Discount</div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Disc %</span>
                        <Input type="number" className="w-24 h-7 text-xs text-right" value={formData.discountPercentage} onChange={(e) => setFormData({...formData, discountPercentage: parseFloat(e.target.value)||0})} />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Discount</span>
                        <Input type="number" className="w-24 h-7 text-xs text-right" value={formData.discountAmount} onChange={(e) => setFormData({...formData, discountAmount: parseFloat(e.target.value)||0})} />
                      </div>
                      <div className="mt-1">
                        <Select options={[{value:'701007', label:'701007-Purchase Discounts'}]} className="w-full text-xs h-7" value="701007" />
                      </div>
                      <Button variant="primary" className="w-full h-7 text-xs mt-1">Apply</Button>
                    </div>

                    <div className="flex-[1.2] flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between"><span>Total</span><span className="font-medium">{formatQAR(totals.subtotal)}</span></div>
                      <div className="flex justify-between text-rose-600"><span>Discount</span><span>{formatQAR(totals.discountTotal)}</span></div>
                      <div className="flex justify-between"><span>Sub Total</span><span className="font-medium">{formatQAR(totals.subtotal - totals.discountTotal)}</span></div>
                      <div className="flex justify-between"><span>Tax Amount</span><span>{formatQAR(totals.taxTotal)}</span></div>
                      <div className="flex justify-between"><span>Round off</span><span>0.00</span></div>
                      <div className="flex justify-between font-bold text-sm pt-2 border-t border-slate-200 mt-1">
                        <span>Net Total</span><span>{formatQAR(totals.grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 shrink-0 bg-slate-50 dark:bg-slate-900">
              <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
              <Button variant="secondary" onClick={() => handleSaveForm('DRAFT')}>Save & New</Button>
              <Button variant="secondary" onClick={() => handleSaveForm('DRAFT')}>Save & Close</Button>
              <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none" onClick={() => handleSaveForm('POSTED')}>Post</Button>
            </div>
          </div>
        </div>
      )}

      {/* --- VIEW MODAL --- */}
      {isViewModalOpen && activePurchase && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Purchase Details: ${activePurchase.invoiceNo}`}
          className="max-w-[900px]"
        >
          <div className="w-full p-4 md:p-6 overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">{activePurchase.invoiceNo}</h2>
                <p className="text-sm text-slate-500">Supplier: <span className="font-semibold text-slate-700">{activePurchase.supplierName}</span></p>
                <p className="text-xs text-slate-500">Invoice Date: {activePurchase.invoiceDate}</p>
                {activePurchase.dueDate && <p className="text-xs text-slate-500">Due Date: {activePurchase.dueDate}</p>}
              </div>
              {getStatusBadge(activePurchase.status)}
            </div>
            
            {(activePurchase.reference || activePurchase.notes) && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                {activePurchase.reference && <p className="text-sm mb-2"><span className="font-bold">Reference:</span> {activePurchase.reference}</p>}
                {activePurchase.notes && <p className="text-sm"><span className="font-bold">Notes:</span> {activePurchase.notes}</p>}
              </div>
            )}

            <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Line Items</h3>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-8">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-sm text-left whitespace-nowrap min-w-max">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3 text-right">Sup. Cost</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {activePurchase.items.map(item => (
                      <tr key={item.id}>
                        <td className="p-3 font-medium">{item.productName} <span className="text-xs text-slate-500 ml-2">({item.code})</span></td>
                        <td className="p-3 text-right font-bold">{item.quantity}</td>
                        <td className="p-3 text-right text-slate-600">{formatQAR(item.supCost)}</td>
                        <td className="p-3 text-right font-bold text-slate-800">{formatQAR(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200">
                    <tr>
                      <td colSpan={3} className="p-3 text-right font-bold text-slate-700">Total:</td>
                      <td className="p-3 text-right font-bold text-lg text-slate-900">{formatQAR(activePurchase.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      <PDTListModal isOpen={isPDTModalOpen} onClose={() => setIsPDTModalOpen(false)} title="Purchase" />
    </div>
  );
};
