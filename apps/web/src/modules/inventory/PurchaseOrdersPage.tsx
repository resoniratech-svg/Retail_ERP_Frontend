import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Modal, Select } from '@qatar-erp/ui';
import { Plus, Search, Download, Trash2, Edit, Eye, X } from 'lucide-react';
import { formatQAR } from '@qatar-erp/utils';

// --- INLINED STORAGE LOGIC ---
export interface PurchaseOrderItem {
  id: string;
  product: string;
  barcode: string;
  sku: string;
  uom: string;
  quantity: number;
  unitCost: number;
  discountPercent: number;
  taxPercent: number;
  lineTotal: number;
}

export type POStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PARTIALLY_RECEIVED' | 'FULLY_RECEIVED' | 'CANCELLED';

export interface PurchaseOrder {
  id: string;
  code: string;
  supplier: string;
  date: string;
  expectedDate: string;
  warehouse: string;
  branch: string;
  paymentTerms: string;
  currency: string;
  reference: string;
  deliveryTerms: string;
  notes: string;
  status: POStatus;
  items: PurchaseOrderItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
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
  date: new Date().toISOString().split('T')[0],
  expectedDate: '',
  warehouse: '',
  branch: '',
  paymentTerms: '',
  currency: 'QAR',
  reference: '',
  deliveryTerms: '',
  notes: '',
  items: [] as PurchaseOrderItem[]
};

export const PurchaseOrdersPage: React.FC = () => {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  
  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Active PO state
  const [activePO, setActivePO] = useState<PurchaseOrder | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  
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
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (po: PurchaseOrder) => {
    setFormData({
      supplier: po.supplier,
      date: po.date,
      expectedDate: po.expectedDate,
      warehouse: po.warehouse,
      branch: po.branch,
      paymentTerms: po.paymentTerms,
      currency: po.currency,
      reference: po.reference,
      deliveryTerms: po.deliveryTerms,
      notes: po.notes,
      items: po.items.map(item => ({ ...item })) // Deep copy items
    });
    setActivePO(po);
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

  // Item Handlers
  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Math.random().toString(36).substring(7), product: '', barcode: '', sku: '', uom: 'pcs', quantity: 1, unitCost: 0, discountPercent: 0, taxPercent: 0, lineTotal: 0 }
      ]
    }));
  };

  const handleRemoveItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleItemChange = (id: string, field: keyof PurchaseOrderItem, value: string | number) => {
    setFormData(prev => {
      const newItems = prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          // Calculate line total
          const gross = updatedItem.quantity * updatedItem.unitCost;
          const discount = gross * (updatedItem.discountPercent / 100);
          const taxable = gross - discount;
          const tax = taxable * (updatedItem.taxPercent / 100);
          updatedItem.lineTotal = taxable + tax;
          return updatedItem;
        }
        return item;
      });
      return { ...prev, items: newItems };
    });
  };

  const calculateTotals = (items: PurchaseOrderItem[]) => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;
    
    items.forEach(item => {
      const gross = item.quantity * item.unitCost;
      const discount = gross * (item.discountPercent / 100);
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
      alert("Supplier, Date, and Warehouse are required.");
      return;
    }
    if (status === 'SUBMITTED' && formData.items.length === 0) {
      alert("At least one product is required to submit.");
      return;
    }

    const { subtotal, discountTotal, taxTotal, grandTotal } = calculateTotals(formData.items);

    const po: PurchaseOrder = {
      id: activePO ? activePO.id : Math.random().toString(36).substring(7),
      code: activePO ? activePO.code : poStorage.generatePOCode(),
      supplier: formData.supplier,
      date: formData.date,
      expectedDate: formData.expectedDate,
      warehouse: formData.warehouse,
      branch: formData.branch,
      paymentTerms: formData.paymentTerms,
      currency: formData.currency,
      reference: formData.reference,
      deliveryTerms: formData.deliveryTerms,
      notes: formData.notes,
      status: status,
      items: formData.items,
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal
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
                <th className="p-3">Reference Code</th>
                <th className="p-3">Supplier / Description</th>
                <th className="p-3">Date</th>
                <th className="p-3">Warehouse</th>
                <th className="p-3 text-right">Value (QAR)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">No purchase orders found.</td>
                </tr>
              ) : (
                filteredPOs.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-bold text-xs">{po.code}</td>
                    <td className="p-3 font-medium">{po.supplier}</td>
                    <td className="p-3 text-xs text-slate-500">{po.date}</td>
                    <td className="p-3 text-xs">{po.warehouse}</td>
                    <td className="p-3 text-right font-bold text-emerald-600">
                      {formatQAR(po.grandTotal)}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={getStatusColor(po.status) as any}>{po.status}</Badge>
                    </td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Custom PO Form Modal (Wider layout, hides visible scrollbar) */}
      {isFormModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsFormModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-[90vw] max-w-4xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{activePO ? "Edit Purchase Order" : "New Purchase Order"}</h3>
              <button onClick={() => setIsFormModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Scrollable Form Content */}
            <div className="p-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex flex-col gap-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Supplier *" value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})} required />
                  <Input label="Order Date *" type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
                  <Input label="Warehouse *" value={formData.warehouse} onChange={(e) => setFormData({...formData, warehouse: e.target.value})} required />
                  <Input label="Expected Delivery Date" type="date" value={formData.expectedDate} onChange={(e) => setFormData({...formData, expectedDate: e.target.value})} />
                  <Input label="Reference Number" value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} />
                  <Input label="Payment Terms" value={formData.paymentTerms} onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})} />
                </div>

                {/* Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">Order Items</h3>
                    <Button variant="outline" className="text-xs py-1" onClick={handleAddItem}>+ Add Product</Button>
                  </div>
                  {/* overflow-x-auto ensures horizontal overflow on very small screens doesn't break modal, but width is large enough normally */}
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-100 dark:bg-slate-800">
                        <tr>
                          <th className="p-2 w-1/3">Product</th>
                          <th className="p-2 w-24">Qty</th>
                          <th className="p-2 w-32">Unit Cost</th>
                          <th className="p-2 w-24">Disc %</th>
                          <th className="p-2 w-24">Tax %</th>
                          <th className="p-2 text-right">Total</th>
                          <th className="p-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-4 text-center text-slate-500">No items added.</td>
                          </tr>
                        ) : (
                          formData.items.map((item) => (
                            <tr key={item.id} className="border-t border-slate-200 dark:border-slate-800">
                              <td className="p-2">
                                <input className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900" value={item.product} onChange={(e) => handleItemChange(item.id, 'product', e.target.value)} placeholder="Product name" />
                              </td>
                              <td className="p-2">
                                <input type="number" className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900" min="1" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)} />
                              </td>
                              <td className="p-2">
                                <input type="number" className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900" min="0" value={item.unitCost} onChange={(e) => handleItemChange(item.id, 'unitCost', parseFloat(e.target.value) || 0)} />
                              </td>
                              <td className="p-2">
                                <input type="number" className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900" min="0" max="100" value={item.discountPercent} onChange={(e) => handleItemChange(item.id, 'discountPercent', parseFloat(e.target.value) || 0)} />
                              </td>
                              <td className="p-2">
                                <input type="number" className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900" min="0" max="100" value={item.taxPercent} onChange={(e) => handleItemChange(item.id, 'taxPercent', parseFloat(e.target.value) || 0)} />
                              </td>
                              <td className="p-2 text-right font-medium">{formatQAR(item.lineTotal)}</td>
                              <td className="p-2 text-center">
                                <button onClick={() => handleRemoveItem(item.id)} className="text-rose-500 hover:text-rose-700 p-1">
                                  <X className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-72 flex flex-col gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex justify-between"><span>Subtotal:</span> <span className="font-medium">{formatQAR(totals.subtotal)}</span></div>
                    <div className="flex justify-between text-rose-600"><span>Discount:</span> <span>-{formatQAR(totals.discountTotal)}</span></div>
                    <div className="flex justify-between"><span>Tax:</span> <span>+{formatQAR(totals.taxTotal)}</span></div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                      <span>Total:</span> <span>{formatQAR(totals.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Input label="Notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Internal notes or terms..." />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 shrink-0 bg-slate-50 dark:bg-slate-900">
              <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
              <Button variant="secondary" onClick={() => savePO('DRAFT')}>Save Draft</Button>
              <Button variant="primary" onClick={() => savePO('SUBMITTED')}>Submit</Button>
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
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 shrink-0 bg-slate-50 dark:bg-slate-900">
              <Button variant="outline" onClick={() => window.print()}>Print PO</Button>
              <Button variant="primary" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Standard size) */}
      {isDeleteModalOpen && activePO && (
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
          <div className="flex flex-col gap-4">
            <p>Are you sure you want to delete Purchase Order <strong>{activePO.code}</strong>?</p>
            <p className="text-sm text-slate-500">This action cannot be undone.</p>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
              <Button variant="primary" className="bg-rose-600 hover:bg-rose-700 border-rose-600" onClick={handleDelete}>Delete PO</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
