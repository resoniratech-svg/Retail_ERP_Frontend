import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Plus, Search, Eye, Edit, Trash2, Power, ArrowRight, CornerUpLeft, Save, Undo2, Banknote, List, Mail, History, X, CheckSquare, FileText } from 'lucide-react';
import { Warehouse } from '@qatar-erp/types';
import { PDTListModal } from './components/PDTListModal';

const STORAGE_KEY = 'retail_erp_purchase_returns';
const PURCHASES_KEY = 'retail_erp_purchases';
const WAREHOUSES_KEY = 'retail_erp_warehouses';
const CURRENT_USER = 'Ahmed Al-Mansouri (SUPER_ADMIN)';

type ReturnStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PROCESSED' | 'CANCELLED';

interface ReturnItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  originalQty: number;
  previouslyReturned: number;
  returnableQty: number;
  returnQty: number;
  unitCost: number;
  taxPercent: number;
  lineTotal: number;
  returnReason: string;
}

interface PurchaseReturn {
  id: string;
  returnNo: string;
  purchaseInvoiceId: string;
  purchaseInvoiceNo: string;
  supplierName: string;
  returnDate: string;
  warehouseId: string;
  warehouseName: string;
  returnReason: string;
  reference: string;
  notes: string;
  items: ReturnItem[];
  subtotal: number;
  taxAmount: number;
  totalValue: number;
  status: ReturnStatus;
  
  // Audit properties
  createdDate: string;
  createdBy: string;
  submittedDate?: string;
  submittedBy?: string;
  approvedDate?: string;
  approvedBy?: string;
  processedDate?: string;
  processedBy?: string;
  
  // DART POS Alignment Fields
  fullReference?: string;
  paymode?: string;
  discountPercentage?: number;
  discountAmount?: number;
  taxAdjustment?: number;
  netTotal?: number;
  isPosted?: boolean;
  emailStatus?: string;
  modifiedBy?: string;
  modifiedDate?: string;
}

const DEFAULT_RETURNS: PurchaseReturn[] = [
  {
    id: 'pr-2026-001',
    returnNo: 'PR-2026-001',
    purchaseInvoiceId: 'pur-2026-001',
    purchaseInvoiceNo: 'PINV-2026-001',
    supplierName: 'Global Electronics Ltd.',
    returnDate: '2026-08-14',
    warehouseId: 'wh-doh-01',
    warehouseName: 'Doha Central Depot',
    returnReason: 'Damaged',
    reference: 'Ref-0122',
    notes: 'Items damaged in transit',
    items: [{
      id: 'itm-1',
      productId: 'prod-1',
      productName: 'Sample SKU',
      sku: 'SKU-001',
      originalQty: 100,
      previouslyReturned: 0,
      returnableQty: 100,
      returnQty: 10,
      unitCost: 50.0,
      taxPercent: 5.0,
      lineTotal: 500.0,
      returnReason: 'Damaged'
    }],
    subtotal: 500.0,
    taxAmount: 25.0,
    totalValue: 525.0,
    status: 'PROCESSED',
    createdDate: '2026-08-14T09:00:00Z',
    createdBy: CURRENT_USER,
    submittedDate: '2026-08-14T09:10:00Z',
    submittedBy: CURRENT_USER,
    approvedDate: '2026-08-14T09:20:00Z',
    approvedBy: CURRENT_USER,
    processedDate: '2026-08-14T09:30:00Z',
    processedBy: CURRENT_USER
  }
];

export const PurchaseReturnPage: React.FC = () => {
  const [returns, setReturns] = useState<PurchaseReturn[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeReturn, setActiveReturn] = useState<PurchaseReturn | null>(null);
  const [isPDTModalOpen, setIsPDTModalOpen] = useState(false);
  
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<Partial<PurchaseReturn>>({ items: [] });
  const [newItem, setNewItem] = useState<Partial<ReturnItem>>({});
  
  // Available items derived from selected purchase invoice
  const availablePurchaseItems = useMemo(() => {
    if (!formData.purchaseInvoiceId) return [];
    const selectedPurchase = purchases.find(p => p.id === formData.purchaseInvoiceId);
    if (!selectedPurchase) return [];
    
    // In a real app we'd query backend for previously returned items.
    // For now we assume 0 returned unless we calculate it from local data.
    return selectedPurchase.items.map((pi: any) => {
      // Calculate previous returns across all processed records in memory
      let prevRet = 0;
      returns.forEach(r => {
        if (r.id !== formData.id && r.status !== 'CANCELLED' && r.purchaseInvoiceId === selectedPurchase.id) {
          const matchedItem = r.items.find(ri => ri.productId === pi.productId);
          if (matchedItem) prevRet += matchedItem.returnQty;
        }
      });
      
      return {
        ...pi,
        previouslyReturned: prevRet,
        returnableQty: Math.max(0, pi.quantity - prevRet)
      };
    }).filter((pi: any) => pi.returnableQty > 0); // Only show items that can be returned
  }, [formData.purchaseInvoiceId, formData.id, purchases, returns]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const pData = localStorage.getItem(PURCHASES_KEY);
      if (pData) setPurchases(JSON.parse(pData));
      
      const wData = localStorage.getItem(WAREHOUSES_KEY);
      if (wData) setWarehouses(JSON.parse(wData));
      
      const rData = localStorage.getItem(STORAGE_KEY);
      if (rData) {
        setReturns(JSON.parse(rData));
      } else {
        setReturns(DEFAULT_RETURNS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RETURNS));
      }
    } catch (e) {
      console.error(e);
      setReturns(DEFAULT_RETURNS);
    }
  };

  const saveReturns = (data: PurchaseReturn[]) => {
    setReturns(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const getStatusBadge = (status: ReturnStatus) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="neutral">Draft</Badge>;
      case 'SUBMITTED': return <Badge variant="warning">Submitted</Badge>;
      case 'APPROVED': return <Badge variant="info">Approved</Badge>;
      case 'PROCESSED': return <Badge variant="success">Processed</Badge>;
      case 'CANCELLED': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleOpenNew = () => {
    setFormError('');
    setFormData({
      returnNo: `PR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      purchaseInvoiceId: '',
      purchaseInvoiceNo: '',
      supplierName: '',
      returnDate: new Date().toISOString().split('T')[0],
      warehouseId: '',
      warehouseName: '',
      returnReason: 'Damaged',
      reference: '',
      notes: '',
      items: [],
      subtotal: 0,
      taxAmount: 0,
      totalValue: 0,
      status: 'DRAFT',
      createdBy: CURRENT_USER,
      createdDate: new Date().toISOString()
    });
    setNewItem({});
    setIsFormModalOpen(true);
  };

  const handleEdit = (r: PurchaseReturn) => {
    setFormError('');
    setFormData(JSON.parse(JSON.stringify(r)));
    setNewItem({});
    setIsFormModalOpen(true);
  };

  const handleDelete = (r: PurchaseReturn) => {
    if (confirm(`Are you sure you want to delete return ${r.returnNo}?`)) {
      saveReturns(returns.filter(ret => ret.id !== r.id));
    }
  };

  const handleStatusChange = (r: PurchaseReturn, newStatus: ReturnStatus) => {
    const updated = returns.map(ret => {
      if (ret.id === r.id) {
        const copy = { ...ret, status: newStatus };
        const now = new Date().toISOString();
        if (newStatus === 'SUBMITTED') {
          copy.submittedBy = CURRENT_USER;
          copy.submittedDate = now;
        } else if (newStatus === 'APPROVED') {
          copy.approvedBy = CURRENT_USER;
          copy.approvedDate = now;
        } else if (newStatus === 'PROCESSED') {
          copy.processedBy = CURRENT_USER;
          copy.processedDate = now;
        }
        return copy;
      }
      return ret;
    });
    saveReturns(updated);
  };

  const handlePurchaseSelect = (purchaseId: string) => {
    const selectedPurchase = purchases.find(p => p.id === purchaseId);
    setFormData(prev => ({
      ...prev,
      purchaseInvoiceId: purchaseId,
      purchaseInvoiceNo: selectedPurchase?.invoiceNo || '',
      supplierName: selectedPurchase?.supplierName || '',
      items: [] // Clear items on purchase change
    }));
    setNewItem({});
  };

  const calculateTotals = (items: ReturnItem[]) => {
    let subtotal = 0;
    let taxAmount = 0;
    
    items.forEach(item => {
      subtotal += item.lineTotal;
      taxAmount += item.lineTotal * (item.taxPercent / 100);
    });
    
    return { subtotal, taxAmount, totalValue: subtotal + taxAmount };
  };

  const handleSaveForm = (submitAsStatus: ReturnStatus) => {
    setFormError('');
    if (!formData.supplierName) return setFormError('Supplier Name is required.');
    if (!formData.warehouseId) return setFormError('Warehouse is required.');
    if (!formData.returnDate) return setFormError('Return Date is required.');
    if (!formData.items || formData.items.length === 0) return setFormError('At least one item is required.');

    const warehouse = warehouses.find(w => w.id === formData.warehouseId);
    const totals = calculateTotals(formData.items);

    const payload: PurchaseReturn = {
      ...(formData as PurchaseReturn),
      id: formData.id || `pr-${Date.now()}`,
      warehouseName: warehouse?.name || '',
      status: submitAsStatus,
      ...totals
    };

    if (submitAsStatus === 'SUBMITTED' && !formData.submittedDate) {
      payload.submittedDate = new Date().toISOString();
      payload.submittedBy = CURRENT_USER;
    }

    if (formData.id) {
      saveReturns(returns.map(r => r.id === formData.id ? payload : r));
    } else {
      saveReturns([payload, ...returns]);
    }
    setIsFormModalOpen(false);
  };

  const handleAddItem = () => {
    if (!newItem.productId || !newItem.returnQty || newItem.returnQty <= 0) {
      alert("Please select a product and enter a valid return quantity greater than 0.");
      return;
    }
    if (newItem.unitCost === undefined || newItem.unitCost < 0) {
      alert("Unit cost cannot be negative.");
      return;
    }
    if (newItem.taxPercent === undefined || newItem.taxPercent < 0) {
      alert("Tax percent cannot be negative.");
      return;
    }
    
    const availableItem = availablePurchaseItems.find((i: any) => i.productId === newItem.productId);
    if (availableItem && newItem.returnQty > availableItem.returnableQty) {
      alert(`Return quantity cannot exceed returnable quantity (${availableItem.returnableQty}).`);
      return;
    }

    if (formData.items?.some(i => i.productId === newItem.productId)) {
      alert("Product is already added to this return. Please remove and re-add to change quantity.");
      return;
    }

    const item: ReturnItem = {
      id: `itm-${Date.now()}`,
      productId: availableItem.productId,
      productName: availableItem.productName,
      sku: availableItem.sku,
      originalQty: availableItem.quantity,
      previouslyReturned: availableItem.previouslyReturned,
      returnableQty: availableItem.returnableQty,
      returnQty: newItem.returnQty,
      unitCost: newItem.unitCost,
      taxPercent: newItem.taxPercent || 0,
      lineTotal: newItem.returnQty * newItem.unitCost,
      returnReason: newItem.returnReason || formData.returnReason || 'Damaged'
    };

    setFormData({ ...formData, items: [...(formData.items || []), item] });
    setNewItem({ productId: '', returnQty: undefined, unitCost: undefined, taxPercent: undefined });
  };

  const handleProductSelectForAdd = (productId: string) => {
    const p = availablePurchaseItems.find((i: any) => i.productId === productId);
    if (p) {
      setNewItem({
        ...newItem,
        productId,
        returnQty: p.returnableQty,
        unitCost: p.unitPrice,
        taxPercent: 0 // Default 0 for demonstration
      });
    } else {
      setNewItem({ ...newItem, productId });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData({ ...formData, items: formData.items?.filter(i => i.id !== itemId) });
  };

  const filteredReturns = returns.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return r.returnNo.toLowerCase().includes(q) || 
             r.purchaseInvoiceNo.toLowerCase().includes(q) ||
             r.supplierName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-2 h-full relative">
      <div className="flex flex-col border border-slate-300 dark:border-slate-700 rounded-sm bg-[#f1f5f9] dark:bg-slate-800 shadow-sm">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between p-1 border-b border-slate-300 dark:border-slate-700">
          <div className="flex items-center">
            <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300">
              <Save className="w-3.5 h-3.5 text-slate-600" />
              <span>Save Layout</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300">
              <Undo2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Unpost</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300">
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              <span>Payment</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300" onClick={() => setIsPDTModalOpen(true)}>
              <List className="w-3.5 h-3.5 text-orange-500" />
              <span>PDT List</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300">
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              <span>E-Mail To Vendor</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <History className="w-3.5 h-3.5 text-slate-600" />
              <span>Action History</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2 pr-2">
            <Button variant="outline" className="py-1 px-2 text-xs h-7 flex items-center gap-1" onClick={loadData}>
              Refresh
            </Button>
            <Button variant="primary" className="py-1 px-2 text-xs h-7 flex items-center gap-1 font-bold" onClick={handleOpenNew}>
              <Plus className="w-3.5 h-3.5" /> New Purchase Return
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
          Purchase Returns
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

      <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-300 rounded-sm relative">
        <div className="flex-1 overflow-auto flex flex-col relative">
          <table className="w-full h-full text-left text-[11px]">
          <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-[11px] font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 whitespace-nowrap">Refno</th>
              <th className="p-4 whitespace-nowrap">Full Ref No</th>
              <th className="p-4 whitespace-nowrap">Vendor</th>
              <th className="p-4 whitespace-nowrap">Invoice No</th>
              <th className="p-4 whitespace-nowrap">Invoice Date</th>
              <th className="p-4 whitespace-nowrap">Returned Date</th>
              <th className="p-4 whitespace-nowrap">Location</th>
              <th className="p-4 whitespace-nowrap">Paymode</th>
              <th className="p-4 text-right whitespace-nowrap">Total</th>
              <th className="p-4 text-right whitespace-nowrap">Discount P</th>
              <th className="p-4 text-right whitespace-nowrap">Discount</th>
              <th className="p-4 text-right whitespace-nowrap">Sub Total</th>
              <th className="p-4 text-right whitespace-nowrap">TAX</th>
              <th className="p-4 text-right whitespace-nowrap">Tax Adj</th>
              <th className="p-4 text-right whitespace-nowrap">Net Total</th>
              <th className="p-4 text-center whitespace-nowrap">Is Posted</th>
              <th className="p-4 text-center whitespace-nowrap">Email Status</th>
              <th className="p-4 whitespace-nowrap">Created By</th>
              <th className="p-4 whitespace-nowrap">Created Date</th>
              <th className="p-4 whitespace-nowrap">Modified By</th>
              <th className="p-4 whitespace-nowrap">Modified Date</th>
              <th className="p-4 text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {filteredReturns.length > 0 ? filteredReturns.map((r) => {
              const isPosted = r.isPosted || r.status === 'PROCESSED';
              const total = r.totalValue || r.subtotal + r.taxAmount || 0;
              const discPct = r.discountPercentage || 0;
              const discAmt = r.discountAmount || 0;
              const subTot = r.subtotal || 0;
              const taxAmt = r.taxAmount || 0;
              const taxAdj = r.taxAdjustment || 0;
              const netTot = r.netTotal !== undefined ? r.netTotal : total;
              
              return (
              <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-mono font-bold text-xs">{r.returnNo}</td>
                <td className="p-4 text-xs">{r.fullReference || '—'}</td>
                <td className="p-4 font-medium">{r.supplierName}</td>
                <td className="p-4 font-mono text-xs">{r.purchaseInvoiceNo || '—'}</td>
                <td className="p-4 text-xs">{r.createdDate ? new Date(r.createdDate).toLocaleDateString() : '—'}</td>
                <td className="p-4 text-xs">{r.returnDate}</td>
                <td className="p-4 text-xs text-slate-600">{r.warehouseName}</td>
                <td className="p-4 text-xs">{r.paymode || '—'}</td>
                <td className="p-4 text-right text-slate-600 text-xs">{total.toFixed(2)}</td>
                <td className="p-4 text-right text-slate-600 text-xs">{discPct.toFixed(2)}</td>
                <td className="p-4 text-right text-rose-600 text-xs">{discAmt.toFixed(2)}</td>
                <td className="p-4 text-right font-medium text-slate-700 text-xs">{subTot.toFixed(2)}</td>
                <td className="p-4 text-right text-slate-600 text-xs">{taxAmt.toFixed(2)}</td>
                <td className="p-4 text-right text-slate-600 text-xs">{taxAdj.toFixed(2)}</td>
                <td className="p-4 text-right font-bold text-emerald-600 text-xs">{netTot.toFixed(2)}</td>
                <td className="p-4 text-center text-xs">{isPosted ? 'Yes' : 'No'}</td>
                <td className="p-4 text-center text-xs">{r.emailStatus || '—'}</td>
                <td className="p-4 text-xs">{r.createdBy}</td>
                <td className="p-4 text-xs">{r.createdDate ? new Date(r.createdDate).toLocaleDateString() : '—'}</td>
                <td className="p-4 text-xs">{r.modifiedBy || '—'}</td>
                <td className="p-4 text-xs">{r.modifiedDate ? new Date(r.modifiedDate).toLocaleDateString() : '—'}</td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600" onClick={() => { setActiveReturn(r); setIsViewModalOpen(true); }} title="View Details">
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {r.status === 'DRAFT' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600" onClick={() => handleEdit(r)} title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}

                    {r.status === 'DRAFT' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-600" onClick={() => handleStatusChange(r, 'SUBMITTED')} title="Submit">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}

                    {r.status === 'DRAFT' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600" onClick={() => handleDelete(r)} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}

                    {r.status === 'SUBMITTED' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-indigo-500 hover:text-indigo-600" onClick={() => handleStatusChange(r, 'APPROVED')} title="Approve">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}

                    {r.status === 'APPROVED' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-indigo-500 hover:text-indigo-600" onClick={() => handleStatusChange(r, 'PROCESSED')} title="Process Return">
                        <CornerUpLeft className="w-4 h-4" />
                      </Button>
                    )}

                    {(r.status === 'DRAFT' || r.status === 'SUBMITTED' || r.status === 'APPROVED') && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600" onClick={() => handleStatusChange(r, 'CANCELLED')} title="Cancel">
                        <Power className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
            }) : (
              <tr>
                <td colSpan={22} className="p-8 text-center text-slate-500">
                  No purchase returns found.
                </td>
              </tr>
            )}
            {/* Filler row to push footer to bottom */}
            <tr className="h-full">
              <td colSpan={22}></td>
            </tr>
          </tbody>
          <tfoot className="sticky bottom-0 bg-slate-100 dark:bg-slate-800 border-t border-slate-300 dark:border-slate-700 z-10 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
            <tr>
              <td colSpan={11}></td>
              <td className="p-1 align-middle text-right">
                <input type="text" value="0.00" readOnly className="w-full min-w-[70px] max-w-[100px] px-2 py-1 text-xs text-right border border-slate-300 rounded bg-white font-medium text-slate-700" />
              </td>
              <td className="p-1 align-middle text-right">
                <input type="text" value="0.00" readOnly className="w-full min-w-[70px] max-w-[100px] px-2 py-1 text-xs text-right border border-slate-300 rounded bg-white font-medium text-slate-700" />
              </td>
              <td className="p-1 align-middle text-right">
                <input type="text" value="0.00" readOnly className="w-full min-w-[70px] max-w-[100px] px-2 py-1 text-xs text-right border border-slate-300 rounded bg-white font-medium text-slate-700" />
              </td>
              <td className="p-1 align-middle text-right">
                <input type="text" value="0.00" readOnly className="w-full min-w-[70px] max-w-[100px] px-2 py-1 text-xs text-right border border-slate-300 rounded bg-white font-medium text-slate-700" />
              </td>
              <td colSpan={7}></td>
            </tr>
          </tfoot>
        </table>
        </div>
      </div>
      {/* --- ADD / EDIT FORM OVERLAY --- */}
      {isFormModalOpen && (
        <div className="absolute inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col font-sans text-xs overflow-hidden rounded-sm border border-slate-300 dark:border-slate-700">

          {/* Action Toolbar */}
          <div className="flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 gap-1 shadow-sm relative z-10">
            <button className="flex flex-col items-center justify-center px-2 py-0.5 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 rounded text-slate-700 dark:text-slate-300 min-w-[70px] transition-colors">
              <div className="relative">
                <Save className="w-4 h-4 text-blue-600 mb-0.5" />
                <Plus className="w-2.5 h-2.5 text-blue-600 absolute -top-1 -right-2" />
              </div>
              <span className="text-[10px] font-medium">Save & New</span>
              <span className="text-[9px] text-slate-500 font-normal">Ctrl + N</span>
            </button>
            <button className="flex flex-col items-center justify-center px-2 py-0.5 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 rounded text-slate-700 dark:text-slate-300 min-w-[70px] transition-colors" onClick={() => { handleSaveForm('SUBMITTED'); setIsFormModalOpen(false); }}>
              <div className="relative">
                <Save className="w-4 h-4 text-red-600 mb-0.5" />
                <CornerUpLeft className="w-2.5 h-2.5 text-red-600 absolute -top-1 -right-2" />
              </div>
              <span className="text-[10px] font-medium">Save & Close</span>
              <span className="text-[9px] text-slate-500 font-normal">Ctrl + L</span>
            </button>
            <button className="flex flex-col items-center justify-center px-2 py-0.5 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 rounded text-slate-700 dark:text-slate-300 min-w-[70px] transition-colors">
              <Banknote className="w-4 h-4 text-emerald-600 mb-0.5" />
              <span className="text-[10px] font-medium">Post</span>
              <span className="text-[9px] text-slate-500 font-normal">Ctrl + P</span>
            </button>
            <div className="ml-auto flex items-center pr-2">
              <button onClick={() => setIsFormModalOpen(false)} className="flex items-center justify-center hover:bg-rose-500 hover:text-white w-6 h-6 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 transition-colors bg-white dark:bg-slate-800 shadow-sm" title="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Invoice Details Section */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-300 dark:border-slate-700">
            <div className="px-3 py-1.5 font-bold text-blue-700 dark:text-blue-400 text-[11px] flex items-center gap-2">
              Invoice Details <span className="text-slate-700 dark:text-slate-300">Ref#: {formData.id ? formData.returnNo : 'New'}</span>
            </div>
            <div className="px-3 pb-2 flex flex-col gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
              {/* Row 1 */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-[280px]">
                  <span className="w-14 text-right shrink-0">Vendor</span>
                  <select className="flex-1 border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-white dark:bg-slate-950 shadow-sm h-[22px] rounded-sm focus:outline-none focus:border-blue-500">
                    <option>[Select a vendor]</option>
                  </select>
                  <div className="w-[18px] h-[18px] bg-blue-50 dark:bg-blue-900/30 border border-blue-400 dark:border-blue-700 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-[14px] leading-none cursor-pointer hover:bg-blue-100 shrink-0">+</div>
                </div>
                <div className="flex items-center gap-1 w-[200px]">
                  <span className="w-16 text-right shrink-0">Invoice No.</span>
                  <input type="text" className="flex-1 border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-white dark:bg-slate-950 shadow-sm h-[22px] rounded-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div className="flex items-center gap-1 w-[160px]">
                  <span className="w-14 text-right shrink-0">Inv Date</span>
                  <input type="date" className="flex-1 border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-white dark:bg-slate-950 shadow-sm h-[22px] rounded-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div className="flex items-center gap-1 w-[180px]">
                  <span className="w-20 text-right shrink-0">Returned Date</span>
                  <input type="date" className="flex-1 border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-white dark:bg-slate-950 shadow-sm h-[22px] rounded-sm focus:outline-none focus:border-blue-500" defaultValue={formData.returnDate} />
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <span className="font-medium text-slate-500">TRN</span>
                  <span className="text-slate-500 font-medium">N/A</span>
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-[280px]">
                  <span className="w-14 text-right shrink-0">Location</span>
                  <select className="flex-1 border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-white dark:bg-slate-950 shadow-sm h-[22px] rounded-sm focus:outline-none focus:border-blue-500">
                    <option>Saudi Arabia</option>
                  </select>
                  <div className="w-[18px] h-[18px] bg-blue-50 dark:bg-blue-900/30 border border-blue-400 dark:border-blue-700 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-[14px] leading-none cursor-pointer hover:bg-blue-100 shrink-0">+</div>
                </div>
                <div className="flex items-center gap-1 w-[200px]">
                  <span className="w-16 text-right shrink-0">Paymode</span>
                  <select className="flex-1 border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-white dark:bg-slate-950 shadow-sm h-[22px] rounded-sm focus:outline-none focus:border-blue-500">
                    <option>Credit</option>
                  </select>
                </div>
                <div className="flex items-center gap-1 ml-1 w-[160px]">
                  <input type="checkbox" id="disableTax" className="w-3 h-3 cursor-pointer" />
                  <label htmlFor="disableTax" className="cursor-pointer mt-0.5">Disable Tax</label>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-300 dark:border-slate-700">
             <div className="px-3 py-1 font-bold text-blue-700 dark:text-blue-400 text-[11px]">Product Details</div>
             
             <div className="px-3 pb-2 space-y-1 text-[10px]">
               {/* First Row of Headers & Inputs */}
               <div className="flex gap-1.5 items-end">
                 <div className="w-[80px] shrink-0"><div className="text-slate-600 dark:text-slate-400 mb-0.5">Code</div><input type="text" className="w-full border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-white dark:bg-slate-950 h-[22px] rounded-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500" /></div>
                 <div className="w-[110px] shrink-0"><div className="text-slate-600 dark:text-slate-400 mb-0.5">Barcode</div><input type="text" className="w-full border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-white dark:bg-slate-950 h-[22px] rounded-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500" /></div>
                 <div className="flex-1 min-w-[200px] relative">
                   <div className="text-slate-600 dark:text-slate-400 mb-0.5 flex justify-between">Product <div className="text-slate-700 dark:text-slate-300 flex items-center justify-center w-3 h-3 bg-slate-200 dark:bg-slate-700 border border-slate-400 dark:border-slate-600 rounded-sm text-[8px]">👤</div></div>
                   <input type="text" className="w-full border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-white dark:bg-slate-950 h-[22px] rounded-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500" />
                 </div>
                 <div className="w-[100px] shrink-0">
                   <div className="text-slate-600 dark:text-slate-400 mb-0.5 flex justify-between">Unit <div className="text-emerald-500 flex items-center justify-center w-3 h-3 text-[8px] font-bold">🔄</div></div>
                   <select className="w-full border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-white dark:bg-slate-950 h-[22px] rounded-sm text-slate-500 dark:text-slate-400 focus:outline-none focus:border-blue-500"><option>[Select unit]</option></select>
                 </div>
                 <div className="w-[60px] shrink-0"><div className="text-slate-600 dark:text-slate-400 mb-0.5">UOM</div><input type="text" className="w-full border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 h-[22px] rounded-sm focus:outline-none" value="1" readOnly /></div>
                 <div className="w-[80px] shrink-0"><div className="text-slate-600 dark:text-slate-400 mb-0.5">Curr. Cost</div><input type="text" className="w-full border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-slate-100 dark:bg-slate-900 h-[22px] rounded-sm text-slate-700 dark:text-slate-300 focus:outline-none" readOnly /></div>
                 <div className="w-[80px] shrink-0"><div className="text-slate-600 dark:text-slate-400 mb-0.5">Curr Price</div><input type="text" className="w-full border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-slate-100 dark:bg-slate-900 h-[22px] rounded-sm text-slate-700 dark:text-slate-300 focus:outline-none" readOnly /></div>
                 <div className="w-[60px] shrink-0"><div className="text-slate-600 dark:text-slate-400 mb-0.5">Tax(%)</div><input type="text" className="w-full border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-white dark:bg-slate-950 h-[22px] rounded-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500" /></div>
                 
                 <div className="ml-2 flex items-end">
                   <button className="border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 px-3 py-0.5 shadow-sm rounded-sm hover:bg-slate-200 dark:hover:bg-slate-700 h-[22px] flex items-center font-medium text-slate-700 dark:text-slate-300 transition-colors">Load Purchase</button>
                 </div>
               </div>

               {/* Second Row of Headers & Inputs */}
               <div className="flex gap-1.5 items-end mt-1.5">
                 <div className="w-[60px] shrink-0"><div className="text-slate-600 dark:text-slate-400 mb-0.5">Pur. Qty</div><input type="text" className="w-full border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-white dark:bg-slate-950 h-[22px] rounded-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500" /></div>
                 <div className="w-[50px] shrink-0"><div className="text-slate-600 dark:text-slate-400 mb-0.5">FOC</div><input type="text" className="w-full border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-white dark:bg-slate-950 h-[22px] rounded-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500" /></div>
                 <div className="w-[80px] shrink-0"><div className="text-slate-600 dark:text-slate-400 mb-0.5">Sup. Cost</div><input type="text" className="w-full border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-white dark:bg-slate-950 h-[22px] rounded-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500" /></div>
                 
                 <div className="w-[80px] shrink-0"><div className="text-slate-600 dark:text-slate-400 mb-0.5">Unit. Disc</div><input type="text" className="w-full border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-white dark:bg-slate-950 text-right h-[22px] rounded-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500" defaultValue="0.0000" /></div>
                 <div className="w-[80px] shrink-0"><div className="text-slate-600 dark:text-slate-400 mb-0.5">Discount</div><input type="text" className="w-full border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-white dark:bg-slate-950 text-right h-[22px] rounded-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500" defaultValue="0.0000" /></div>
                 
                 <div className="w-[80px] shrink-0"><div className="text-slate-600 dark:text-slate-400 mb-0.5">Amount</div><input type="text" className="w-full border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-slate-100 dark:bg-slate-900 text-right h-[22px] rounded-sm text-slate-700 dark:text-slate-300 focus:outline-none" defaultValue="0.00" readOnly /></div>
                 <div className="w-[60px] shrink-0"><div className="text-slate-600 dark:text-slate-400 mb-0.5">Tax</div><input type="text" className="w-full border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-slate-100 dark:bg-slate-900 text-right h-[22px] rounded-sm text-slate-700 dark:text-slate-300 focus:outline-none" defaultValue="0.00" readOnly /></div>
                 <div className="w-[90px] shrink-0"><div className="text-slate-600 dark:text-slate-400 mb-0.5">Amount Incl.Tax</div><input type="text" className="w-full border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-slate-100 dark:bg-slate-900 text-right h-[22px] rounded-sm text-slate-700 dark:text-slate-300 focus:outline-none" defaultValue="0.00" readOnly /></div>
                 
                 <div className="flex-1 min-w-[150px] flex flex-col">
                   <div className="text-slate-600 dark:text-slate-400 mb-0.5 flex justify-between px-1">
                     <span className="text-[9px] translate-y-1 text-slate-400 dark:text-slate-500 truncate mr-2">Additional Descriptions</span>
                     <span className="shrink-0">Serial #</span>
                   </div>
                   <input type="text" className="w-full border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-white dark:bg-slate-950 h-[22px] rounded-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500" />
                 </div>

                 <div className="flex flex-col gap-1 ml-2 shrink-0">
                   <div className="flex gap-1 h-[22px]">
                     <button className="flex items-center justify-center gap-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 rounded-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-red-600 font-medium transition-colors">
                       <div className="w-3 h-3 bg-red-600 rounded-full flex items-center justify-center"><X className="w-2.5 h-2.5 text-white" /></div> Remove
                     </button>
                     <button className="flex items-center justify-center gap-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 rounded-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                       <span className="text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1"><div className="w-3 h-3 bg-blue-700 text-white rounded-[2px] flex items-center justify-center text-[8px] transform -rotate-45">✎</div> PDT</span> <span className="text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-600 px-1 rounded-sm text-[9px]">F7</span>
                     </button>
                   </div>
                   <div className="flex gap-1 h-[22px]">
                     <button className="flex items-center justify-center gap-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 rounded-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-400 font-medium w-[84px] transition-colors">
                       <div className="w-3.5 h-3.5 bg-blue-100 dark:bg-blue-900/50 border border-blue-400 dark:border-blue-700 rounded-full flex items-center justify-center text-[12px] leading-none">+</div> Add (F1)
                     </button>
                     <button className="flex-1 flex items-center justify-center border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 rounded-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors">
                       <div className="w-3 h-3 bg-blue-700 text-white rounded-[2px] flex items-center justify-center text-[8px] transform -rotate-45 mr-1">✎</div> Edit
                     </button>
                   </div>
                 </div>
               </div>
               
               <div className="flex items-center gap-1 mt-0 ml-[490px]">
                 <input type="checkbox" id="calcQty" defaultChecked className="w-3 h-3 cursor-pointer" />
                 <label htmlFor="calcQty" className="text-slate-700 dark:text-slate-300 mt-0.5 cursor-pointer">Calc. Qty From Serial</label>
               </div>
             </div>
          </div>

          {/* Main Table */}
          <div className="flex-1 overflow-auto bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm flex flex-col relative">
            <table className="w-full min-h-full text-left text-[11px] whitespace-nowrap border-collapse text-slate-700 dark:text-slate-300">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10 border-b border-slate-300 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200">
                <tr>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-10 text-center">SlNo</th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-20">Code</th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-24">Barcode</th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 min-w-[150px]">Product</th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-16">UOM</th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-16 text-right">Qty</th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-16 text-right">FOC</th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-16 text-right">Tax Perc</th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-20 text-right">Sup Cost</th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-24 text-right">Unit Discount</th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-24 text-right">Item Discount</th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-24 text-right">Amount</th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-20 text-right">Tax</th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-24 text-right">Amount Incl.Tax</th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-24">Serial No</th>
                  <th className="font-normal px-2 py-1.5">Additional Descriptions</th>
                </tr>
              </thead>
              <tbody>
                {/* Empty table space to ensure rows render properly if any */}
                <tr className="h-full"><td colSpan={16}></td></tr>
              </tbody>
            </table>
          </div>

          {/* Footer Totals */}
          <div className="h-[120px] bg-slate-100 dark:bg-slate-800 flex text-[11px] shrink-0 border-t border-slate-300 dark:border-slate-700">
            {/* Left Tabs */}
            <div className="flex-1 border-r border-slate-300 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-900">
              <div className="flex bg-slate-100 dark:bg-slate-800/50 border-b border-slate-300 dark:border-slate-700 h-[26px]">
                <button className="px-3 bg-white dark:bg-slate-900 border-t-2 border-t-blue-500 border-r border-slate-300 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200">General</button>
                <button className="px-3 hover:bg-slate-200 dark:hover:bg-slate-700 border-r border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 flex items-center gap-1 transition-colors"><FileText className="w-3.5 h-3.5 text-orange-400" /> Notes</button>
                <button className="px-3 hover:bg-slate-200 dark:hover:bg-slate-700 border-r border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 flex items-center gap-1 transition-colors"><CheckSquare className="w-3.5 h-3.5 text-green-500" /> Approval Status</button>
                <button className="px-3 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors">Documents</button>
              </div>
              <div className="p-3 space-y-2">
                <div className="text-blue-700 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1 font-medium">F8 - Product Purchase History</div>
                <div className="text-blue-700 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1 font-medium">F9 - Load Product From Purchase</div>
              </div>
            </div>

            {/* Bill Discount */}
            <div className="w-[340px] border-r border-slate-300 dark:border-slate-700 p-2 relative bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300">
               <div className="font-bold text-slate-700 dark:text-slate-300 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">Apply Bill Discount</div>
               <div className="grid grid-cols-[80px_100px] gap-2 items-center mb-1.5">
                 <span className="text-slate-600 dark:text-slate-400">Discount (%)</span>
                 <input type="text" className="border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-white dark:bg-slate-950 text-right rounded-sm" />
               </div>
               <div className="grid grid-cols-[80px_100px] gap-2 items-center mb-1">
                 <span className="text-slate-600 dark:text-slate-400">Disc Amount</span>
                 <input type="text" className="border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-white dark:bg-slate-950 text-right rounded-sm" />
               </div>
               <div className="absolute right-4 top-10">
                 <button className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-1.5 rounded-sm shadow-sm flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                   <div className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] leading-none">←</div> Apply
                 </button>
               </div>
               <div className="absolute bottom-2 right-2 w-[180px]">
                 <select className="w-full border border-slate-300 dark:border-slate-600 px-1 py-0.5 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[10px] rounded-sm">
                   <option>[Select a Ledger]</option>
                 </select>
               </div>
            </div>

            {/* Final Totals */}
            <div className="w-[220px] p-2 bg-slate-100 dark:bg-slate-800 grid grid-cols-[100px_80px] justify-end gap-x-4 gap-y-1 content-start text-slate-700 dark:text-slate-300">
               <div className="text-right text-slate-600 dark:text-slate-400">Total</div>
               <div className="text-right font-medium pr-1">0.00</div>
               
               <div className="text-right text-slate-600 dark:text-slate-400">Discount</div>
               <div className="text-right font-medium pr-1">0.00</div>
               
               <div className="text-right text-slate-600 dark:text-slate-400">Sub Total</div>
               <div className="text-right font-medium pr-1">0.00</div>
               
               <div className="text-right text-slate-600 dark:text-slate-400 pt-0.5">TAX</div>
               <input type="text" className="border border-slate-300 dark:border-slate-600 px-1 bg-white dark:bg-slate-950 text-right h-5 rounded-sm" />
               
               <div className="text-right text-slate-600 dark:text-slate-400 pt-0.5">Round off</div>
               <input type="text" className="border border-slate-300 dark:border-slate-600 px-1 bg-white dark:bg-slate-950 text-right h-5 rounded-sm" />
               
               <div className="text-right font-bold text-slate-900 dark:text-slate-100 mt-1">Net Total</div>
               <div className="text-right font-bold text-slate-900 dark:text-slate-100 mt-1 pr-1">0.00</div>
            </div>
          </div>
        </div>
      )}

      {/* --- VIEW MODAL --- */}
      {isViewModalOpen && activeReturn && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Purchase Return Details: ${activeReturn.returnNo}`}
          className="max-w-[1000px]"
        >
          <div className="w-full p-4 md:p-6 overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">{activeReturn.returnNo}</h2>
                <p className="text-sm text-slate-500">Invoice: <span className="font-semibold text-slate-700">{activeReturn.purchaseInvoiceNo}</span></p>
                <p className="text-sm text-slate-500">Supplier: <span className="font-semibold text-slate-700">{activeReturn.supplierName}</span></p>
                <p className="text-xs text-slate-500">Return Date: {activeReturn.returnDate}</p>
                <p className="text-xs text-slate-500">Warehouse: {activeReturn.warehouseName}</p>
              </div>
              {getStatusBadge(activeReturn.status)}
            </div>
            
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-sm mb-2"><span className="font-bold">Return Reason:</span> {activeReturn.returnReason}</p>
              {activeReturn.reference && <p className="text-sm mb-2"><span className="font-bold">Reference:</span> {activeReturn.reference}</p>}
              {activeReturn.notes && <p className="text-sm"><span className="font-bold">Notes:</span> {activeReturn.notes}</p>}
            </div>

            <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Returned Items</h3>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto mb-8">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3 text-right">Orig Qty</th>
                    <th className="p-3 text-right">Prev Returned</th>
                    <th className="p-3 text-right text-rose-600">Return Qty</th>
                    <th className="p-3 text-right">Unit Cost</th>
                    <th className="p-3 text-right">Tax %</th>
                    <th className="p-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activeReturn.items.map(item => (
                    <tr key={item.id}>
                      <td className="p-3 font-medium">{item.productName} <span className="text-xs text-slate-500 ml-2">({item.sku})</span></td>
                      <td className="p-3 text-right">{item.originalQty}</td>
                      <td className="p-3 text-right">{item.previouslyReturned}</td>
                      <td className="p-3 text-right font-bold text-rose-600">{item.returnQty}</td>
                      <td className="p-3 text-right">${item.unitCost.toFixed(2)}</td>
                      <td className="p-3 text-right">{item.taxPercent}%</td>
                      <td className="p-3 text-right font-bold text-slate-800">${item.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200">
                  <tr>
                    <td colSpan={6} className="p-3 text-right font-bold text-slate-700">Subtotal:</td>
                    <td className="p-3 text-right font-bold text-slate-900">${activeReturn.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={6} className="p-3 text-right font-bold text-slate-500">Tax:</td>
                    <td className="p-3 text-right font-bold text-slate-500">${activeReturn.taxAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={6} className="p-3 text-right font-bold text-rose-700 text-sm">Total Return Value:</td>
                    <td className="p-3 text-right font-bold text-rose-700 text-sm">${activeReturn.totalValue.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Audit Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Created</span>
                <span className="font-medium">{activeReturn.createdBy} <span className="text-xs text-slate-400">({new Date(activeReturn.createdDate).toLocaleString()})</span></span>
              </div>
              {activeReturn.submittedBy && (
                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Submitted</span>
                  <span className="font-medium">{activeReturn.submittedBy} <span className="text-xs text-slate-400">({new Date(activeReturn.submittedDate!).toLocaleString()})</span></span>
                </div>
              )}
              {activeReturn.approvedBy && (
                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Approved</span>
                  <span className="font-medium">{activeReturn.approvedBy} <span className="text-xs text-slate-400">({new Date(activeReturn.approvedDate!).toLocaleString()})</span></span>
                </div>
              )}
              {activeReturn.processedBy && (
                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Processed</span>
                  <span className="font-medium">{activeReturn.processedBy} <span className="text-xs text-slate-400">({new Date(activeReturn.processedDate!).toLocaleString()})</span></span>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      <PDTListModal isOpen={isPDTModalOpen} onClose={() => setIsPDTModalOpen(false)} title="Purchase Return" />
    </div>
  );
};
