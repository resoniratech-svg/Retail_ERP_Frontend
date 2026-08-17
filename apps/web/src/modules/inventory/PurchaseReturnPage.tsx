import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Plus, Search, Eye, Edit, Trash2, Power, ArrowRight, CornerUpLeft } from 'lucide-react';
import { Warehouse } from '@qatar-erp/types';

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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Returns</h1>
          <p className="text-sm text-slate-500">Manage and track goods returned to suppliers</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={loadData}>
            Refresh
          </Button>
          <Button variant="primary" className="flex items-center gap-2 font-bold" onClick={handleOpenNew}>
            <Plus className="w-4 h-4" /> New Purchase Return
          </Button>
        </div>
      </div>

      <Card className="p-4 flex flex-wrap items-center justify-start gap-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search return no, invoice no, supplier..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>
        <div className="w-full md:w-48">
          <Select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'DRAFT', label: 'Draft' },
              { value: 'SUBMITTED', label: 'Submitted' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'PROCESSED', label: 'Processed' },
              { value: 'CANCELLED', label: 'Cancelled' }
            ]}
          />
        </div>
      </Card>

      <Card className="p-0 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm">
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
          </tbody>
        </table>
      </Card>

      {/* --- ADD / EDIT MODAL --- */}
      {isFormModalOpen && (
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={formData.id ? `Edit Return: ${formData.returnNo}` : "New Purchase Return"}
          className="max-w-[1200px]"
        >
          <div className="w-full p-4 md:p-6 overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:hidden">
            {formError && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-md font-medium border border-rose-200">
                {formError}
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-6 lg:col-span-1 border-r border-slate-100 dark:border-slate-800 pr-0 lg:pr-6">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Return Details</h3>
                  <div className="space-y-4">
                    <Input label="Return No" value={formData.returnNo} disabled />
                    
                    <div>
                      <span className="text-slate-500 block mb-1.5 text-xs font-semibold uppercase">Purchase / Invoice</span>
                      <Select 
                        value={formData.purchaseInvoiceId || ''}
                        onChange={(e) => handlePurchaseSelect(e.target.value)}
                        options={[
                          { value: '', label: '-- Select Purchase Invoice --' },
                          ...purchases.map(p => ({ value: p.id, label: `${p.invoiceNo} - ${p.supplierName}` }))
                        ]}
                      />
                    </div>

                    <Input 
                      label="Supplier Name *" 
                      value={formData.supplierName} 
                      onChange={(e) => setFormData({...formData, supplierName: e.target.value})} 
                      disabled={!!formData.purchaseInvoiceId}
                    />

                    <div>
                      <span className="text-slate-500 block mb-1.5 text-xs font-semibold uppercase">Warehouse *</span>
                      <Select 
                        value={formData.warehouseId || ''}
                        onChange={(e) => setFormData({...formData, warehouseId: e.target.value})}
                        options={[
                          { value: '', label: '-- Select Warehouse --' },
                          ...warehouses.map(w => ({ value: w.id, label: w.name }))
                        ]}
                      />
                    </div>

                    <Input type="date" label="Return Date *" value={formData.returnDate} onChange={(e) => setFormData({...formData, returnDate: e.target.value})} />

                    <div>
                      <span className="text-slate-500 block mb-1.5 text-xs font-semibold uppercase">Global Return Reason</span>
                      <Select 
                        value={formData.returnReason || 'Damaged'}
                        onChange={(e) => setFormData({...formData, returnReason: e.target.value})}
                        options={[
                          { value: 'Damaged', label: 'Damaged' },
                          { value: 'Expired', label: 'Expired' },
                          { value: 'Wrong Item', label: 'Wrong Item' },
                          { value: 'Excess Quantity', label: 'Excess Quantity' },
                          { value: 'Quality Issue', label: 'Quality Issue' },
                          { value: 'Supplier Request', label: 'Supplier Request' },
                          { value: 'Other', label: 'Other' }
                        ]}
                      />
                    </div>

                    <Input label="Reference / Delivery Note" value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} />
                    <Input label="Remarks / Notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Return Items</h3>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-end mb-4">
                  <div className="flex-1 min-w-[200px]">
                    <span className="text-slate-500 block mb-1.5 text-xs font-semibold uppercase">Available Product</span>
                    <Select 
                      value={newItem.productId || ''}
                      onChange={(e) => handleProductSelectForAdd(e.target.value)}
                      options={[
                        { value: '', label: '-- Select Product --' },
                        ...availablePurchaseItems.map((p: any) => ({ value: p.productId, label: `${p.productName} (Returnable: ${p.returnableQty})` }))
                      ]}
                      disabled={!formData.purchaseInvoiceId}
                    />
                    {!formData.purchaseInvoiceId && <p className="text-[10px] text-slate-500 mt-1">Select an invoice first</p>}
                  </div>
                  <div className="w-24">
                    <Input 
                      type="number"
                      label="Return Qty" 
                      value={newItem.returnQty?.toString() || ''} 
                      onChange={(e) => setNewItem({...newItem, returnQty: Number(e.target.value)})} 
                    />
                  </div>
                  <div className="w-28">
                    <Input 
                      type="number"
                      label="Unit Cost" 
                      value={newItem.unitCost?.toString() || ''} 
                      onChange={(e) => setNewItem({...newItem, unitCost: Number(e.target.value)})} 
                    />
                  </div>
                  <div className="w-20">
                    <Input 
                      type="number"
                      label="Tax %" 
                      value={newItem.taxPercent?.toString() || ''} 
                      onChange={(e) => setNewItem({...newItem, taxPercent: Number(e.target.value)})} 
                    />
                  </div>
                  <div className="w-full md:w-auto mt-2 md:mt-0">
                    <Button variant="primary" onClick={handleAddItem} className="w-full" disabled={!formData.purchaseInvoiceId}>Add Item</Button>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto">
                  <table className="w-full text-xs text-left whitespace-nowrap">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3 text-right">Orig Qty</th>
                        <th className="p-3 text-right">Returnable</th>
                        <th className="p-3 text-right">Return Qty</th>
                        <th className="p-3 text-right">Unit Cost</th>
                        <th className="p-3 text-right">Line Total</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {formData.items && formData.items.length > 0 ? formData.items.map(item => (
                        <tr key={item.id}>
                          <td className="p-3 font-medium">{item.productName} <span className="text-slate-500 ml-1">({item.sku})</span></td>
                          <td className="p-3 text-right">{item.originalQty}</td>
                          <td className="p-3 text-right">{item.returnableQty}</td>
                          <td className="p-3 text-right font-bold text-rose-600">{item.returnQty}</td>
                          <td className="p-3 text-right">${item.unitCost.toFixed(2)}</td>
                          <td className="p-3 text-right font-bold">${item.lineTotal.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-rose-500" onClick={() => handleRemoveItem(item.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={7} className="p-6 text-center text-slate-500">No items added.</td></tr>
                      )}
                    </tbody>
                    {formData.items && formData.items.length > 0 && (
                      <tfoot className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200">
                        <tr>
                          <td colSpan={5} className="p-3 text-right font-bold">Subtotal:</td>
                          <td className="p-3 text-right font-bold">${calculateTotals(formData.items).subtotal.toFixed(2)}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan={5} className="p-3 text-right font-bold text-slate-500">Tax:</td>
                          <td className="p-3 text-right font-bold text-slate-500">${calculateTotals(formData.items).taxAmount.toFixed(2)}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan={5} className="p-3 text-right font-bold text-slate-900 text-sm">Total Return Value:</td>
                          <td className="p-3 text-right font-bold text-slate-900 text-sm">${calculateTotals(formData.items).totalValue.toFixed(2)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t pt-4">
              <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
              <Button variant="primary" className="bg-slate-600 hover:bg-slate-700" onClick={() => handleSaveForm('DRAFT')}>Save as Draft</Button>
              <Button variant="primary" onClick={() => handleSaveForm('SUBMITTED')}>Submit Return</Button>
            </div>
          </div>
        </Modal>
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

    </div>
  );
};
