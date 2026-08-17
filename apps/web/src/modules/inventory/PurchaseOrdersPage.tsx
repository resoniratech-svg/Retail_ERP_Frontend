import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Modal, Select } from '@qatar-erp/ui';
import { Plus, Search, Download, Trash2, Edit, Eye, X } from 'lucide-react';
import { formatQAR } from '@qatar-erp/utils';

// --- INLINED STORAGE LOGIC ---
export interface PurchaseOrderItem {
  id: string;
  productId: string;
  code: string;
  barcode?: string;
  product: string; // item name
  unit?: string;
  uom: string;
  quantity: number;
  foc: number;
  currentCost?: number;
  currentPrice?: number;
  unitCost: number; // Sup. Cost
  discountPercent: number; // keeping for backward compat
  taxPercent: number;
  taxAmount: number;
  lineTotal: number; // Amount
  amountIncludingTax: number;
  uniqueLineId: string;
  lastPurchasePrice?: number;
  remarks?: string;
}

export type POStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PARTIALLY_RECEIVED' | 'FULLY_RECEIVED' | 'CANCELLED';

export interface PurchaseOrder {
  id: string;
  code: string;
  supplier: string; // Vendor ID / Name
  vendorTrn?: string;
  date: string;
  expectedDate: string;
  receivingTimeFrom?: string;
  receivingTimeTo?: string;
  warehouse: string; // Location
  branch: string;
  paymentTerms: string; // Paymode
  currency: string;
  exchangeRate?: number;
  reference: string;
  otherReference?: string;
  deliveryAddress?: string;
  deliveryTerms: string; 
  notes: string;
  
  approvalLevel?: string;
  approvalStatus?: string;
  approvedBy?: string;
  approvedOn?: string;
  
  expectedOtherExpense?: string;
  otherExpenseAmount?: number;

  status: POStatus;
  items: PurchaseOrderItem[];
  
  subtotal: number; // Gross Total
  discountTotal: number;
  taxTotal: number;
  grandTotal: number; // Net Total
  
  emailStatus?: string;
  isPosted?: boolean;
  purchaseReference?: string;
}

const STORAGE_KEY = 'retail_erp_purchase_orders';

const seedData: PurchaseOrder[] = [
  {
    id: '1',
    code: 'PO-2026-001',
    supplier: 'Almarai Foods Qatar',
    date: '2026-08-10',
    expectedDate: '2026-08-15',
    warehouse: 'Main Warehouse Doha',
    branch: 'Doha Main',
    paymentTerms: 'Net 30',
    currency: 'QAR',
    reference: 'REF-8891',
    deliveryTerms: 'DDP',
    notes: 'Initial seed record.',
    status: 'APPROVED',
    items: [],
    subtotal: 85000.00,
    discountTotal: 0,
    taxTotal: 0,
    grandTotal: 85000.00,
  }
];

export const poStorage = {
  getPurchaseOrders: (): PurchaseOrder[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
      return seedData;
    } catch (e) {
      console.error('Failed to parse PO data', e);
      return [];
    }
  },

  savePurchaseOrder: (po: PurchaseOrder): void => {
    const pos = poStorage.getPurchaseOrders();
    const existingIndex = pos.findIndex(p => p.id === po.id);
    if (existingIndex >= 0) {
      pos[existingIndex] = po;
    } else {
      pos.unshift(po);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  },

  deletePurchaseOrder: (id: string): void => {
    const pos = poStorage.getPurchaseOrders();
    const updated = pos.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  generatePOCode: (): string => {
    const pos = poStorage.getPurchaseOrders();
    const year = new Date().getFullYear();
    const count = pos.length + 1;
    return `PO-${year}-${count.toString().padStart(3, '0')}`;
  }
};
// -----------------------------

const initialFormState = {
  supplier: '',
  vendorTrn: '',
  date: new Date().toISOString().split('T')[0],
  expectedDate: '',
  receivingTimeFrom: '',
  receivingTimeTo: '',
  warehouse: '',
  branch: '',
  paymentTerms: 'Cash', // Paymode
  currency: 'QAR',
  exchangeRate: 1,
  reference: '',
  otherReference: '',
  deliveryAddress: '',
  deliveryTerms: '',
  notes: '',
  expectedOtherExpense: '',
  otherExpenseAmount: 0,
  items: [] as PurchaseOrderItem[]
};

const initialProductEntry = {
  id: '',
  code: '',
  barcode: '',
  product: '',
  unit: 'Unit',
  uom: '1',
  currentCost: 0,
  currentPrice: 0,
  taxPercent: 0,
  priceInclTax: 0,
  quantity: 0,
  foc: 0,
  unitCost: 0, // Sup. Cost
  lineTotal: 0, // Amount
  taxAmount: 0, // Tax
  amountIncludingTax: 0, // Amount Incl.Tax
  remarks: ''
};

export const PurchaseOrdersPage: React.FC = () => {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  
  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'PRODUCTS'>('DETAILS');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Active PO state
  const [activePO, setActivePO] = useState<PurchaseOrder | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  
  // Product Entry State
  const [productEntry, setProductEntry] = useState(initialProductEntry);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  useEffect(() => {
    loadPOs();
  }, []);

  const loadPOs = () => {
    setPos(poStorage.getPurchaseOrders());
  };

  const filteredPOs = pos.filter((po) => {
    const matchesSearch = (po.code || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (po.supplier || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (po.reference || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || po.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'SUBMITTED': return 'info';
      case 'DRAFT': return 'warning';
      case 'REJECTED': 
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  };

  // Form Handlers
  const handleOpenCreate = () => {
    setFormData(initialFormState);
    setActivePO(null);
    setActiveTab('DETAILS');
    setProductEntry(initialProductEntry);
    setEditingItemId(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (po: PurchaseOrder) => {
    setFormData({
      supplier: po.supplier,
      vendorTrn: po.vendorTrn || '',
      date: po.date,
      expectedDate: po.expectedDate,
      receivingTimeFrom: po.receivingTimeFrom || '',
      receivingTimeTo: po.receivingTimeTo || '',
      warehouse: po.warehouse,
      branch: po.branch,
      paymentTerms: po.paymentTerms || 'Cash',
      currency: po.currency,
      exchangeRate: po.exchangeRate || 1,
      reference: po.reference,
      otherReference: po.otherReference || '',
      deliveryAddress: po.deliveryAddress || '',
      deliveryTerms: po.deliveryTerms,
      notes: po.notes,
      expectedOtherExpense: po.expectedOtherExpense || '',
      otherExpenseAmount: po.otherExpenseAmount || 0,
      items: po.items.map(item => ({ ...item }))
    });
    setActivePO(po);
    setActiveTab('DETAILS');
    setProductEntry(initialProductEntry);
    setEditingItemId(null);
    setIsFormModalOpen(true);
  };

  const handleOpenView = (po: PurchaseOrder) => {
    setActivePO(po);
    setIsViewModalOpen(true);
  };

  const handleOpenDelete = (po: PurchaseOrder) => {
    setActivePO(po);
    setIsDeleteModalOpen(true);
  };

  // Product Entry Handlers
  const updateProductEntry = (field: keyof typeof productEntry, value: string | number) => {
    setProductEntry(prev => {
      const next = { ...prev, [field]: value };
      
      // Auto-calculate values for entry form
      const qty = next.quantity || 0;
      const supCost = next.unitCost || 0;
      const taxPct = next.taxPercent || 0;
      
      const amount = qty * supCost;
      const taxAmt = amount * (taxPct / 100);
      
      next.lineTotal = amount;
      next.taxAmount = taxAmt;
      next.amountIncludingTax = amount + taxAmt;
      
      return next;
    });
  };

  const handleAddProduct = () => {
    if (!productEntry.product && !productEntry.code) {
      alert("Please enter a product code or name.");
      return;
    }

    const newItem: PurchaseOrderItem = {
      id: editingItemId || Math.random().toString(36).substring(7),
      productId: '',
      code: productEntry.code,
      barcode: productEntry.barcode,
      product: productEntry.product,
      unit: productEntry.unit,
      uom: productEntry.uom,
      quantity: productEntry.quantity,
      foc: productEntry.foc,
      currentCost: productEntry.currentCost,
      currentPrice: productEntry.currentPrice,
      unitCost: productEntry.unitCost,
      discountPercent: 0,
      taxPercent: productEntry.taxPercent,
      taxAmount: productEntry.taxAmount,
      lineTotal: productEntry.lineTotal,
      amountIncludingTax: productEntry.amountIncludingTax,
      uniqueLineId: editingItemId ? productEntry.id : Math.random().toString(36).substring(7),
      remarks: productEntry.remarks
    };

    setFormData(prev => {
      if (editingItemId) {
        return {
          ...prev,
          items: prev.items.map(item => item.id === editingItemId ? newItem : item)
        };
      } else {
        return {
          ...prev,
          items: [...prev.items, newItem]
        };
      }
    });

    setProductEntry(initialProductEntry);
    setEditingItemId(null);
  };

  const handleRemoveProduct = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleEditProduct = (item: PurchaseOrderItem) => {
    setProductEntry({
      id: item.uniqueLineId,
      code: item.code,
      barcode: item.barcode || '',
      product: item.product,
      unit: item.unit || 'Unit',
      uom: item.uom,
      currentCost: item.currentCost || 0,
      currentPrice: item.currentPrice || 0,
      taxPercent: item.taxPercent,
      priceInclTax: item.currentPrice || 0,
      quantity: item.quantity,
      foc: item.foc,
      unitCost: item.unitCost,
      lineTotal: item.lineTotal,
      taxAmount: item.taxAmount,
      amountIncludingTax: item.amountIncludingTax,
      remarks: item.remarks || ''
    });
    setEditingItemId(item.id);
  };

  const calculateTotals = (items: PurchaseOrderItem[]) => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;
    
    items.forEach(item => {
      const gross = item.quantity * item.unitCost;
      // DART POS usually calculates discount at bill level or line level, using 0 for now as it's not in the row
      const discount = 0; 
      const taxable = gross - discount;
      const tax = taxable * (item.taxPercent / 100);
      
      subtotal += gross;
      discountTotal += discount;
      taxTotal += tax;
    });

    return { subtotal, discountTotal, taxTotal, grandTotal: subtotal - discountTotal + taxTotal };
  };

  // Submit Handlers
  const savePO = (status: POStatus) => {
    if (!formData.supplier || !formData.date || !formData.warehouse) {
      alert("Vendor, Date, and Location are required.");
      return;
    }
    if (status === 'SUBMITTED' && formData.items.length === 0) {
      alert("At least one product is required to post.");
      return;
    }

    const { subtotal, discountTotal, taxTotal, grandTotal } = calculateTotals(formData.items);

    const po: PurchaseOrder = {
      id: activePO ? activePO.id : Math.random().toString(36).substring(7),
      code: activePO ? activePO.code : poStorage.generatePOCode(),
      supplier: formData.supplier,
      vendorTrn: formData.vendorTrn,
      date: formData.date,
      expectedDate: formData.expectedDate,
      receivingTimeFrom: formData.receivingTimeFrom,
      receivingTimeTo: formData.receivingTimeTo,
      warehouse: formData.warehouse,
      branch: formData.branch,
      paymentTerms: formData.paymentTerms,
      currency: formData.currency,
      exchangeRate: formData.exchangeRate,
      reference: formData.reference,
      otherReference: formData.otherReference,
      deliveryAddress: formData.deliveryAddress,
      deliveryTerms: formData.deliveryTerms,
      notes: formData.notes,
      expectedOtherExpense: formData.expectedOtherExpense,
      otherExpenseAmount: formData.otherExpenseAmount,
      status: status,
      items: formData.items,
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal,
      emailStatus: activePO?.emailStatus || 'Not Sent',
      isPosted: activePO?.isPosted || false,
      purchaseReference: activePO?.purchaseReference || ''
    };

    poStorage.savePurchaseOrder(po);
    setFilterStatus('ALL');
    loadPOs();
    setIsFormModalOpen(false);
  };

  const handleDelete = () => {
    if (activePO) {
      poStorage.deletePurchaseOrder(activePO.id);
      loadPOs();
      setIsDeleteModalOpen(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredPOs.length === 0) {
      alert('No records available to export.');
      return;
    }
    
    const headers = ['PO Number', 'Supplier', 'Date', 'Warehouse', 'Value', 'Status'];
    const rows = filteredPOs.map(po => [
      po.code,
      po.supplier,
      po.date,
      po.warehouse,
      po.grandTotal.toString(),
      po.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `purchase-orders-${date}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totals = calculateTotals(formData.items);

  // Common DART style layout blocks
  const renderTotalsBlock = () => (
    <div className="w-full sm:w-72 flex flex-col gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 ml-auto">
      <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Total:</span> <span>{formatQAR(totals.subtotal)}</span></div>
      <div className="flex justify-between text-slate-600 dark:text-slate-400">
        <span>Discount (%):</span> 
        <span>{(totals.subtotal > 0 ? (totals.discountTotal / totals.subtotal) * 100 : 0).toFixed(2)}%</span>
      </div>
      <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Discount Amount:</span> <span>{formatQAR(totals.discountTotal)}</span></div>
      <div className="flex justify-between text-rose-600"><span>Discount:</span> <span>-{formatQAR(totals.discountTotal)}</span></div>
      <div className="flex justify-between font-medium"><span>Sub Total:</span> <span>{formatQAR(totals.subtotal - totals.discountTotal)}</span></div>
      <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>TAX:</span> <span>+{formatQAR(totals.taxTotal)}</span></div>
      <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200 dark:border-slate-700 mt-2 text-slate-900 dark:text-white">
        <span>Net Total:</span> <span>{formatQAR(totals.grandTotal)}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-sm text-slate-500">Manage and track purchase orders</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate} className="flex items-center gap-2 font-bold">
          <Plus className="w-4 h-4" /> New Purchase Order
        </Button>
      </div>

      <Card className="p-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search PO No, Supplier, Ref No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div className="w-48">
            <Select 
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'DRAFT', label: 'Draft' },
                { value: 'SUBMITTED', label: 'Submitted' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'CANCELLED', label: 'Cancelled' }
              ]}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            />
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-1.5 text-xs py-1.5" onClick={handleExportCSV}>
          <Download className="w-4 h-4" /> Export Report
        </Button>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-3">Refno</th>
                <th className="p-3">Vendor Name</th>
                <th className="p-3">PO Date</th>
                <th className="p-3">Location</th>
                <th className="p-3">Paymode</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-right">Discount P</th>
                <th className="p-3 text-right">Discount</th>
                <th className="p-3 text-right">Sub Total</th>
                <th className="p-3 text-right">TAX</th>
                <th className="p-3 text-right">Net Total</th>
                <th className="p-3 text-center">Email Status</th>
                <th className="p-3 text-center">Is Posted</th>
                <th className="p-3 text-center">Is PO Expired</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Purchase Refno</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={17} className="p-6 text-center text-slate-500">No purchase orders found.</td>
                </tr>
              ) : (
                filteredPOs.map((po) => {
                  const discountP = po.subtotal > 0 ? (po.discountTotal / po.subtotal) * 100 : 0;
                  const subTotal = po.subtotal - po.discountTotal;
                  return (
                  <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-bold text-xs">{po.code}</td>
                    <td className="p-3 font-medium">{po.supplier}</td>
                    <td className="p-3 text-xs text-slate-500">{po.date}</td>
                    <td className="p-3 text-xs">{po.warehouse}</td>
                    <td className="p-3 text-xs">{po.paymentTerms || '—'}</td>
                    <td className="p-3 text-right text-slate-600">{formatQAR(po.subtotal)}</td>
                    <td className="p-3 text-right text-slate-600">{discountP.toFixed(2)}%</td>
                    <td className="p-3 text-right text-rose-600">{formatQAR(po.discountTotal)}</td>
                    <td className="p-3 text-right font-medium text-slate-700">{formatQAR(subTotal)}</td>
                    <td className="p-3 text-right text-slate-600">{formatQAR(po.taxTotal)}</td>
                    <td className="p-3 text-right font-bold text-emerald-600">
                      {formatQAR(po.grandTotal)}
                    </td>
                    <td className="p-3 text-center text-xs">{po.emailStatus || 'Not Sent'}</td>
                    <td className="p-3 text-center text-xs">{po.isPosted ? 'Yes' : 'No'}</td>
                    <td className="p-3 text-center text-xs">—</td>
                    <td className="p-3 text-center">
                      <Badge variant={getStatusColor(po.status) as any}>{po.status}</Badge>
                    </td>
                    <td className="p-3 text-xs font-mono">{po.purchaseReference || '—'}</td>
                    <td className="p-3 flex items-center justify-center gap-2">
                      <Button variant="outline" className="py-1 px-2 text-xs" onClick={() => handleOpenView(po)} title="View">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {(po.status === 'DRAFT' || po.status === 'REJECTED') && (
                        <>
                          <Button variant="outline" className="py-1 px-2 text-xs" onClick={() => handleOpenEdit(po)} title="Edit">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="outline" className="py-1 px-2 text-xs text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => handleOpenDelete(po)} title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Custom PO Form Modal (Enhanced DART Style Layout) */}
      {isFormModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsFormModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-[95vw] max-w-6xl flex flex-col max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-4 pb-0 border-b border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  {activePO ? `Edit Purchase Order - ${activePO.code}` : "New Purchase Order"}
                </h3>
                <button onClick={() => setIsFormModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Tabs */}
              <div className="flex items-center gap-6">
                <button 
                  className={`px-2 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'DETAILS' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  onClick={() => setActiveTab('DETAILS')}
                >
                  PO Details
                </button>
                <button 
                  className={`px-2 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'PRODUCTS' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  onClick={() => setActiveTab('PRODUCTS')}
                >
                  Products
                </button>
              </div>
            </div>
            
            {/* Scrollable Form Content */}
            <div className="p-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-slate-50/50 dark:bg-slate-900/50">
              {activeTab === 'DETAILS' && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Vendor *</label>
                        <div className="flex gap-2 items-center">
                          <Select 
                            className="flex-1 bg-white dark:bg-slate-900"
                            options={[
                              { value: '', label: '[Select a Vendor]' },
                              { value: 'Spectron IT Solution', label: 'Spectron IT Solution' },
                              { value: 'Almarai Foods Qatar', label: 'Almarai Foods Qatar' }
                            ]}
                            value={formData.supplier}
                            onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                          />
                          <Button variant="outline" className="px-2.5 py-2 text-primary-600 border-primary-200 bg-primary-50" title="Add Vendor">
                            <Plus className="w-4 h-4" /> <span className="text-[10px] ml-1">F4</span>
                          </Button>
                        </div>
                      </div>
                      <Input label="TRN" value={formData.vendorTrn} onChange={(e) => setFormData({...formData, vendorTrn: e.target.value})} placeholder="N/A" />
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Location *</label>
                        <div className="flex gap-2 items-center">
                          <Select 
                            className="flex-1 bg-white dark:bg-slate-900"
                            options={[
                              { value: '', label: '[Select a Location]' },
                              { value: 'Saudi Arabia', label: 'Saudi Arabia' },
                              { value: 'Main Warehouse Doha', label: 'Main Warehouse Doha' }
                            ]}
                            value={formData.warehouse}
                            onChange={(e) => setFormData({...formData, warehouse: e.target.value})}
                          />
                          <Button variant="outline" className="px-2.5 py-2 text-primary-600 border-primary-200 bg-primary-50" title="Add Location">
                            <Plus className="w-4 h-4" /> <span className="text-[10px] ml-1">F4</span>
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Paymode</label>
                        <Select 
                          className="w-full bg-white dark:bg-slate-900"
                          options={[
                            { value: 'Cash', label: 'Cash' },
                            { value: 'Credit', label: 'Credit' },
                            { value: 'Bank Transfer', label: 'Bank Transfer' }
                          ]}
                          value={formData.paymentTerms}
                          onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                        />
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-[2]">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Currency</label>
                            <Select 
                              className="w-full bg-white dark:bg-slate-900 text-slate-500"
                              options={[
                                { value: 'QAR', label: '[Currency]' },
                                { value: 'USD', label: 'USD' }
                              ]}
                              value={formData.currency}
                              onChange={(e) => setFormData({...formData, currency: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5 opacity-0">Rate</label>
                          <Input type="number" value={formData.exchangeRate} onChange={(e) => setFormData({...formData, exchangeRate: parseFloat(e.target.value) || 1})} />
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Delivery Address</label>
                        <textarea 
                          className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg min-h-[100px] bg-white dark:bg-slate-900"
                          value={formData.deliveryAddress}
                          onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                        />
                      </div>
                      
                      <div className="flex gap-4 items-end">
                        <div className="flex-[2]">
                          <Input label="Expected Other Expense" value={formData.expectedOtherExpense} onChange={(e) => setFormData({...formData, expectedOtherExpense: e.target.value})} />
                        </div>
                        <div className="flex-1">
                          <Input label="Amount" type="number" value={formData.otherExpenseAmount} onChange={(e) => setFormData({...formData, otherExpenseAmount: parseFloat(e.target.value) || 0})} />
                        </div>
                      </div>
                    </div>

                    {/* Middle Column */}
                    <div className="flex flex-col gap-4">
                      <Input label="PO Date *" type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
                      <Input label="Req. Delivery Date" type="date" value={formData.expectedDate} onChange={(e) => setFormData({...formData, expectedDate: e.target.value})} />
                      <div className="flex gap-4 items-end">
                        <div className="flex-1">
                          <Input label="Receiving Time From" type="time" value={formData.receivingTimeFrom} onChange={(e) => setFormData({...formData, receivingTimeFrom: e.target.value})} />
                        </div>
                        <div className="flex-1">
                          <Input label="To" type="time" value={formData.receivingTimeTo} onChange={(e) => setFormData({...formData, receivingTimeTo: e.target.value})} />
                        </div>
                      </div>
                      <Input label="Oth. Ref" value={formData.otherReference} onChange={(e) => setFormData({...formData, otherReference: e.target.value})} />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment Terms</label>
                        <textarea 
                          className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg min-h-[80px] bg-white dark:bg-slate-900"
                          value={formData.paymentTerms}
                          onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
                        <textarea 
                          className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg min-h-[80px] bg-white dark:bg-slate-900"
                          value={formData.notes}
                          onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-4">
                      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                              <th className="p-3 font-semibold">Level</th>
                              <th className="p-3 font-semibold">Approval</th>
                              <th className="p-3 font-semibold">Approved By</th>
                              <th className="p-3 font-semibold">Approved On</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="p-3 text-slate-400 border-b border-slate-100">1</td>
                              <td className="p-3 text-slate-400 border-b border-slate-100">—</td>
                              <td className="p-3 text-slate-400 border-b border-slate-100">—</td>
                              <td className="p-3 text-slate-400 border-b border-slate-100">—</td>
                            </tr>
                            <tr>
                              <td colSpan={4} className="p-4 bg-slate-50 dark:bg-slate-800/50">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Approval Status:</span> 
                                <span className="ml-2 text-slate-500">Pending</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-auto pt-6">
                        {renderTotalsBlock()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'PRODUCTS' && (
                <div className="flex flex-col gap-4">
                  {/* Product Entry Form (Top Section) */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-3 shadow-sm">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 border-b border-slate-100 pb-2 mb-1">Product Details</h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-9 gap-3">
                      <Input label="Code" value={productEntry.code} onChange={(e) => updateProductEntry('code', e.target.value)} />
                      <Input label="Barcode" value={productEntry.barcode} onChange={(e) => updateProductEntry('barcode', e.target.value)} />
                      
                      <div className="md:col-span-2 flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-700">Item Name</label>
                        <Select 
                          className="w-full text-sm bg-white" 
                          options={[
                            { value: '', label: 'Select Item...' },
                            { value: 'Product A', label: 'Product A' },
                            { value: 'Product B', label: 'Product B' }
                          ]}
                          value={productEntry.product}
                          onChange={(e) => updateProductEntry('product', e.target.value)}
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-700">Unit</label>
                        <Select 
                          className="w-full text-sm bg-white" 
                          options={[
                            { value: 'Unit', label: 'Unit' },
                            { value: 'Box', label: 'Box' }
                          ]}
                          value={productEntry.unit}
                          onChange={(e) => updateProductEntry('unit', e.target.value)}
                        />
                      </div>
                      
                      <Input label="UOM" value={productEntry.uom} onChange={(e) => updateProductEntry('uom', e.target.value)} />
                      <Input label="Curr. Cost" type="number" value={productEntry.currentCost} onChange={(e) => updateProductEntry('currentCost', parseFloat(e.target.value) || 0)} />
                      <Input label="Curr Price" type="number" value={productEntry.currentPrice} onChange={(e) => updateProductEntry('currentPrice', parseFloat(e.target.value) || 0)} />
                      <Input label="Tax(%)" type="number" value={productEntry.taxPercent} onChange={(e) => updateProductEntry('taxPercent', parseFloat(e.target.value) || 0)} />
                      <Input label="Price Incl Tax" type="number" value={productEntry.priceInclTax} onChange={(e) => updateProductEntry('priceInclTax', parseFloat(e.target.value) || 0)} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                      <Input label="Pur. Qty" type="number" min="1" value={productEntry.quantity} onChange={(e) => updateProductEntry('quantity', parseFloat(e.target.value) || 0)} />
                      <Input label="FOC" type="number" min="0" value={productEntry.foc} onChange={(e) => updateProductEntry('foc', parseFloat(e.target.value) || 0)} />
                      <Input label="Sup. Cost" type="number" min="0" value={productEntry.unitCost} onChange={(e) => updateProductEntry('unitCost', parseFloat(e.target.value) || 0)} />
                      <Input label="Amount" type="number" value={productEntry.lineTotal} readOnly className="bg-slate-50" />
                      <Input label="Tax" type="number" value={productEntry.taxAmount} readOnly className="bg-slate-50" />
                      <Input label="Amount Incl.Tax" type="number" value={productEntry.amountIncludingTax} readOnly className="bg-slate-50 font-medium" />
                      <Input label="Remarks" value={productEntry.remarks} onChange={(e) => updateProductEntry('remarks', e.target.value)} />
                    </div>

                    {/* Actions Row */}
                    <div className="flex gap-2 items-center flex-wrap mt-2">
                      <Button variant="outline" className="text-xs py-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" onClick={handleAddProduct}>
                        <Plus className="w-3.5 h-3.5 mr-1" /> {editingItemId ? 'Update (F1)' : 'Add (F1)'}
                      </Button>
                      <Button variant="outline" className="text-xs py-1.5 text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => editingItemId && handleRemoveProduct(editingItemId)}>
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove (F2)
                      </Button>
                      <Button variant="outline" className="text-xs py-1.5" onClick={() => {}}>
                        <Edit className="w-3.5 h-3.5 mr-1" /> Edit (F3)
                      </Button>
                      <Button variant="outline" className="text-xs py-1.5" onClick={() => {}}>
                        PDT (F7)
                      </Button>
                      <Button variant="outline" className="text-xs py-1.5 bg-slate-50" onClick={() => {}}>
                        Add From List (F9)
                      </Button>
                      <Button variant="outline" className="text-xs py-1.5 bg-emerald-50 text-emerald-700 border-emerald-200" onClick={() => {}}>
                        Import from Excel
                      </Button>
                    </div>
                  </div>

                  {/* Product Table */}
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 shadow-sm">
                    <table className="w-full text-left text-[11px] whitespace-nowrap">
                      <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-semibold text-slate-600">
                        <tr>
                          <th className="p-3">Code</th>
                          <th className="p-3">Barcode</th>
                          <th className="p-3 min-w-[150px]">Product</th>
                          <th className="p-3">UOM</th>
                          <th className="p-3 text-right">Qty</th>
                          <th className="p-3 text-right">FOC</th>
                          <th className="p-3 text-right">Tax Perc</th>
                          <th className="p-3 text-right">Sup Cost</th>
                          <th className="p-3 text-right">Amount</th>
                          <th className="p-3 text-right">Tax</th>
                          <th className="p-3 text-right">Amount Incl Tax</th>
                          <th className="p-3">Unique Line ID</th>
                          <th className="p-3 text-right">Last Purchase...</th>
                          <th className="p-3">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {formData.items.length === 0 ? (
                          <tr>
                            <td colSpan={14} className="p-6 text-center text-slate-500">No products added.</td>
                          </tr>
                        ) : (
                          formData.items.map((item) => (
                            <tr key={item.id} 
                                className={`cursor-pointer transition-colors hover:bg-slate-50 ${editingItemId === item.id ? 'bg-primary-50 border-l-2 border-primary-500' : ''}`}
                                onClick={() => handleEditProduct(item)}>
                              <td className="p-3">{item.code}</td>
                              <td className="p-3">{item.barcode || '—'}</td>
                              <td className="p-3 font-medium text-slate-800">{item.product}</td>
                              <td className="p-3 text-slate-500">{item.uom}</td>
                              <td className="p-3 text-right font-medium">{item.quantity}</td>
                              <td className="p-3 text-right text-slate-500">{item.foc}</td>
                              <td className="p-3 text-right text-slate-500">{item.taxPercent}%</td>
                              <td className="p-3 text-right">{formatQAR(item.unitCost)}</td>
                              <td className="p-3 text-right">{formatQAR(item.lineTotal)}</td>
                              <td className="p-3 text-right text-slate-500">{formatQAR(item.taxAmount)}</td>
                              <td className="p-3 text-right font-medium text-emerald-600">{formatQAR(item.amountIncludingTax)}</td>
                              <td className="p-3 font-mono text-[10px] text-slate-400">{item.uniqueLineId}</td>
                              <td className="p-3 text-right text-slate-400">{item.lastPurchasePrice ? formatQAR(item.lastPurchasePrice) : '—'}</td>
                              <td className="p-3 text-slate-500">{item.remarks || '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    {renderTotalsBlock()}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 shrink-0 bg-slate-50 dark:bg-slate-900">
              <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
              <Button variant="secondary" onClick={() => savePO('DRAFT')}>Save & New</Button>
              <Button variant="secondary" onClick={() => savePO('DRAFT')}>Save & Close</Button>
              <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6" onClick={() => savePO('SUBMITTED')}>Post</Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom View Modal (Wider layout) */}
      {isViewModalOpen && activePO && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsViewModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-[90vw] max-w-4xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Purchase Order Details: {activePO.code}</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{activePO.supplier}</h3>
                    <p className="text-sm text-slate-500">PO Date: {activePO.date} | Expected: {activePO.expectedDate || 'N/A'}</p>
                    <p className="text-sm text-slate-500">Warehouse: {activePO.warehouse} | Ref: {activePO.reference || 'N/A'}</p>
                  </div>
                  <Badge variant={getStatusColor(activePO.status) as any} className="text-sm px-3 py-1">{activePO.status}</Badge>
                </div>
                
                {activePO.notes && (
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded text-sm">
                    <span className="font-semibold block mb-1">Notes:</span>
                    {activePO.notes}
                  </div>
                )}

                <div className="border border-slate-200 dark:border-slate-700 rounded overflow-hidden">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="p-2">Product</th>
                        <th className="p-2 text-right">Qty</th>
                        <th className="p-2 text-right">Cost</th>
                        <th className="p-2 text-right">Disc %</th>
                        <th className="p-2 text-right">Tax %</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {activePO.items.length === 0 ? (
                        <tr><td colSpan={6} className="p-4 text-center text-slate-500">No items</td></tr>
                      ) : (
                        activePO.items.map(item => (
                          <tr key={item.id}>
                            <td className="p-2 font-medium">{item.product || 'Unnamed Item'}</td>
                            <td className="p-2 text-right">{item.quantity}</td>
                            <td className="p-2 text-right">{formatQAR(item.unitCost)}</td>
                            <td className="p-2 text-right">{item.discountPercent}%</td>
                            <td className="p-2 text-right">{item.taxPercent}%</td>
                            <td className="p-2 text-right font-medium">{formatQAR(item.lineTotal)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <div className="w-72 flex flex-col gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex justify-between"><span>Subtotal:</span> <span className="font-medium">{formatQAR(activePO.subtotal)}</span></div>
                    <div className="flex justify-between text-rose-600"><span>Discount:</span> <span>-{formatQAR(activePO.discountTotal)}</span></div>
                    <div className="flex justify-between"><span>Tax:</span> <span>+{formatQAR(activePO.taxTotal)}</span></div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                      <span>Total:</span> <span>{formatQAR(activePO.grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* Custom Delete Modal */}
      {isDeleteModalOpen && activePO && (
        <Modal 
          isOpen={isDeleteModalOpen} 
          onClose={() => setIsDeleteModalOpen(false)} 
          title="Delete Purchase Order"
        >
          <div className="p-4">
            <p className="mb-4">Are you sure you want to delete PO <strong>{activePO.code}</strong>?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
              <Button variant="primary" className="bg-rose-600 hover:bg-rose-700 border-none text-white" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
