import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Modal, Select } from '@qatar-erp/ui';
import { Plus, Search, Download, Trash2, Edit, Eye, X } from 'lucide-react';
import { formatQAR } from '@qatar-erp/utils';
import { PurchaseOrder, poStorage } from './PurchaseOrdersPage';

// --- INLINED GRN STORAGE LOGIC ---
export interface GRNItem {
  id: string;
  product: string;
  barcode: string;
  orderedQty: number;
  previouslyReceived: number;
  receivingNow: number;
  acceptedQty: number;
  rejectedQty: number;
  unitCost: number;
  taxPercent: number;
  batchNumber: string;
  expiryDate: string;
  lineTotal: number;
}

export type GRNStatus = 'DRAFT' | 'SUBMITTED' | 'RECEIVED' | 'PARTIALLY_RECEIVED' | 'CANCELLED';

export interface GRN {
  id: string;
  code: string;
  poNumber: string;
  supplier: string;
  receiptDate: string;
  warehouse: string;
  supplierInvoiceNumber: string;
  invoiceDate: string;
  reference: string; // Delivery Note / ASN
  notes: string;
  status: GRNStatus;
  items: GRNItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
}

const STORAGE_KEY = 'retail_erp_grns';

const seedData: GRN[] = [
  {
    id: '1',
    code: 'GRN-2026-001',
    poNumber: 'PO-2026-001',
    supplier: 'Almarai Foods Qatar',
    receiptDate: '2026-08-12',
    warehouse: 'Main Warehouse Doha',
    supplierInvoiceNumber: 'INV-ALM-0922',
    invoiceDate: '2026-08-11',
    reference: 'DEL-9921',
    notes: 'Initial seed record. Full delivery received.',
    status: 'RECEIVED',
    items: [],
    subtotal: 85000.00,
    taxTotal: 0,
    grandTotal: 85000.00,
  }
];

export const grnStorage = {
  getGRNs: (): GRN[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
      return seedData;
    } catch (e) {
      console.error('Failed to parse GRN data', e);
      return [];
    }
  },

  saveGRN: (grn: GRN): void => {
    const grns = grnStorage.getGRNs();
    const existingIndex = grns.findIndex(g => g.id === grn.id);
    if (existingIndex >= 0) {
      grns[existingIndex] = grn;
    } else {
      grns.unshift(grn);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(grns));
  },

  deleteGRN: (id: string): void => {
    const grns = grnStorage.getGRNs();
    const updated = grns.filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  generateGRNCode: (): string => {
    const grns = grnStorage.getGRNs();
    const year = new Date().getFullYear();
    const count = grns.length + 1;
    return `GRN-${year}-${count.toString().padStart(3, '0')}`;
  }
};
// -----------------------------

const initialFormState = {
  poNumber: '',
  supplier: '',
  receiptDate: new Date().toISOString().split('T')[0],
  warehouse: '',
  supplierInvoiceNumber: '',
  invoiceDate: '',
  reference: '',
  notes: '',
  items: [] as GRNItem[]
};

export const GRNPage: React.FC = () => {
  const [grns, setGrns] = useState<GRN[]>([]);
  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  
  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Active state
  const [activeGRN, setActiveGRN] = useState<GRN | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setGrns(grnStorage.getGRNs());
    setPOs(poStorage.getPurchaseOrders().filter(po => po.status !== 'DRAFT' && po.status !== 'CANCELLED' && po.status !== 'REJECTED'));
  };

  const filteredGRNs = grns.filter((grn) => {
    const matchesSearch = (grn.code || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (grn.supplier || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (grn.poNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || grn.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECEIVED': return 'success';
      case 'PARTIALLY_RECEIVED': return 'info';
      case 'SUBMITTED': return 'info';
      case 'DRAFT': return 'warning';
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  };

  // Form Handlers
  const handleOpenCreate = () => {
    setFormData(initialFormState);
    setActiveGRN(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (grn: GRN) => {
    setFormData({
      poNumber: grn.poNumber,
      supplier: grn.supplier,
      receiptDate: grn.receiptDate,
      warehouse: grn.warehouse,
      supplierInvoiceNumber: grn.supplierInvoiceNumber || '',
      invoiceDate: grn.invoiceDate || '',
      reference: grn.reference || '',
      notes: grn.notes || '',
      items: grn.items.map(item => ({ ...item })) // Deep copy
    });
    setActiveGRN(grn);
    setIsFormModalOpen(true);
  };

  const handleOpenView = (grn: GRN) => {
    setActiveGRN(grn);
    setIsViewModalOpen(true);
  };

  const handleOpenDelete = (grn: GRN) => {
    setActiveGRN(grn);
    setIsDeleteModalOpen(true);
  };

  const handlePOSelection = (poNumber: string) => {
    const selectedPO = pos.find(p => p.code === poNumber);
    if (selectedPO) {
      // Auto-populate
      setFormData(prev => ({
        ...prev,
        poNumber: selectedPO.code,
        supplier: selectedPO.supplier,
        warehouse: selectedPO.warehouse || 'Main Warehouse',
        items: selectedPO.items.map((item, index) => {
          return {
            id: Math.random().toString(36).substring(7),
            product: item.product,
            barcode: `BC-${1000 + index}`, // Mocking barcode from product info
            orderedQty: item.quantity,
            previouslyReceived: 0, // Mocked previously received for now since we don't have full tracking
            receivingNow: item.quantity, // Default to receiving everything
            acceptedQty: item.quantity,
            rejectedQty: 0,
            unitCost: item.unitCost,
            taxPercent: item.taxPercent,
            batchNumber: '',
            expiryDate: '',
            lineTotal: item.lineTotal // Base on acceptedQty which initially is full qty
          };
        })
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        poNumber,
        items: []
      }));
    }
  };

  const handleItemChange = (id: string, field: keyof GRNItem, value: string | number) => {
    setFormData(prev => {
      const newItems = prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Auto-adjust accepted qty if receivingNow changes (convenience)
          if (field === 'receivingNow') {
            updatedItem.acceptedQty = Number(value);
            updatedItem.rejectedQty = 0;
          }

          // Calculate line total based on ACCEPTED qty (for valuation)
          const gross = updatedItem.acceptedQty * updatedItem.unitCost;
          const tax = gross * (updatedItem.taxPercent / 100);
          updatedItem.lineTotal = gross + tax;

          return updatedItem;
        }
        return item;
      });
      return { ...prev, items: newItems };
    });
  };

  const validateItems = () => {
    for (const item of formData.items) {
      const remaining = item.orderedQty - item.previouslyReceived;
      
      if (item.receivingNow < 0) {
        return `Receiving Now cannot be negative for ${item.product || 'an item'}.`;
      }
      if (item.receivingNow > remaining) {
        return `Cannot receive more than remaining quantity for ${item.product || 'an item'}. (Receiving: ${item.receivingNow}, Remaining: ${remaining})`;
      }
      if (item.acceptedQty < 0 || item.rejectedQty < 0) {
        return `Accepted and Rejected quantities cannot be negative for ${item.product || 'an item'}.`;
      }
      if (item.acceptedQty + item.rejectedQty !== item.receivingNow) {
        return `Accepted (${item.acceptedQty}) + Rejected (${item.rejectedQty}) must equal Receiving Now (${item.receivingNow}) for ${item.product || 'an item'}.`;
      }
    }
    return null;
  };

  const calculateTotals = (items: GRNItem[]) => {
    let subtotal = 0;
    let taxTotal = 0;
    
    items.forEach(item => {
      const gross = item.acceptedQty * item.unitCost;
      const tax = gross * (item.taxPercent / 100);
      subtotal += gross;
      taxTotal += tax;
    });

    return { subtotal, taxTotal, grandTotal: subtotal + taxTotal };
  };

  const saveGRN = (status: GRNStatus) => {
    if (status !== 'DRAFT') {
      if (!formData.supplier || !formData.receiptDate || !formData.warehouse) {
        alert("Supplier, Receipt Date, and Warehouse are required.");
        return;
      }
      if (formData.items.length === 0) {
        alert("At least one product is required to submit a GRN.");
        return;
      }
      const validationError = validateItems();
      if (validationError) {
        alert(validationError);
        return;
      }
    }

    const { subtotal, taxTotal, grandTotal } = calculateTotals(formData.items);

    const grn: GRN = {
      id: activeGRN ? activeGRN.id : Math.random().toString(36).substring(7),
      code: activeGRN ? activeGRN.code : grnStorage.generateGRNCode(),
      poNumber: formData.poNumber,
      supplier: formData.supplier,
      receiptDate: formData.receiptDate,
      warehouse: formData.warehouse,
      supplierInvoiceNumber: formData.supplierInvoiceNumber,
      invoiceDate: formData.invoiceDate,
      reference: formData.reference,
      notes: formData.notes,
      status: status,
      items: formData.items,
      subtotal,
      taxTotal,
      grandTotal
    };

    grnStorage.saveGRN(grn);
    setFilterStatus('ALL');
    loadData();
    setIsFormModalOpen(false);
  };

  const handleDelete = () => {
    if (activeGRN) {
      grnStorage.deleteGRN(activeGRN.id);
      loadData();
      setIsDeleteModalOpen(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredGRNs.length === 0) {
      alert('No records available to export.');
      return;
    }
    
    const headers = ['GRN Number', 'PO Number', 'Supplier', 'Receipt Date', 'Warehouse', 'Value', 'Status'];
    const rows = filteredGRNs.map(grn => [
      grn.code,
      grn.poNumber,
      grn.supplier,
      grn.receiptDate,
      grn.warehouse,
      grn.grandTotal.toString(),
      grn.status
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
    link.setAttribute('download', `grn-receipts-${date}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totals = calculateTotals(formData.items);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">GRN</h1>
          <p className="text-sm text-slate-500">Manage and track goods received from suppliers</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate} className="flex items-center gap-2 font-bold">
          <Plus className="w-4 h-4" /> New GRN
        </Button>
      </div>

      <Card className="p-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search GRN No, PO No, Supplier..."
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
                { value: 'PARTIALLY_RECEIVED', label: 'Partially Received' },
                { value: 'RECEIVED', label: 'Received' },
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
                <th className="p-3">GRN Number</th>
                <th className="p-3">PO Number</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Receipt Date</th>
                <th className="p-3">Warehouse</th>
                <th className="p-3 text-right">Value (QAR)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredGRNs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">No GRNs found.</td>
                </tr>
              ) : (
                filteredGRNs.map((grn) => (
                  <tr key={grn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-bold text-xs">{grn.code}</td>
                    <td className="p-3 font-medium text-slate-500 text-xs">{grn.poNumber || '-'}</td>
                    <td className="p-3 font-medium">{grn.supplier}</td>
                    <td className="p-3 text-xs text-slate-500">{grn.receiptDate}</td>
                    <td className="p-3 text-xs">{grn.warehouse}</td>
                    <td className="p-3 text-right font-bold text-emerald-600">
                      {formatQAR(grn.grandTotal)}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={getStatusColor(grn.status) as any}>{grn.status}</Badge>
                    </td>
                    <td className="p-3 flex items-center justify-center gap-2">
                      <Button variant="outline" className="py-1 px-2 text-xs" onClick={() => handleOpenView(grn)} title="View">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {grn.status === 'DRAFT' && (
                        <>
                          <Button variant="outline" className="py-1 px-2 text-xs" onClick={() => handleOpenEdit(grn)} title="Edit">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="outline" className="py-1 px-2 text-xs text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => handleOpenDelete(grn)} title="Delete">
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

      {/* Custom GRN Form Modal (Wide layout) */}
      {isFormModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsFormModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-[90vw] max-w-[1400px] flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{activeGRN ? `Edit GRN: ${activeGRN.code}` : "New GRN"}</h3>
              <button onClick={() => setIsFormModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Scrollable Form Content */}
            <div className="p-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex flex-col gap-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Purchase Order *</label>
                    <select 
                      className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={formData.poNumber} 
                      onChange={(e) => handlePOSelection(e.target.value)}
                    >
                      <option value="">Select PO...</option>
                      {pos.map(po => (
                        <option key={po.code} value={po.code}>{po.code} - {po.supplier}</option>
                      ))}
                    </select>
                  </div>
                  <Input label="Supplier *" value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})} disabled={!!formData.poNumber} required />
                  <Input label="Receipt Date *" type="date" value={formData.receiptDate} onChange={(e) => setFormData({...formData, receiptDate: e.target.value})} required />
                  <Input label="Warehouse *" value={formData.warehouse} onChange={(e) => setFormData({...formData, warehouse: e.target.value})} required />
                  <Input label="Delivery Note / ASN" value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} />
                  <Input label="Notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Receiving condition notes..." />
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-semibold text-sm mb-2">Received Items</h3>
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-100 dark:bg-slate-800">
                        <tr>
                          <th className="p-2 min-w-[150px]">Product</th>
                          <th className="p-2 w-24">Barcode</th>
                          <th className="p-2 w-20">Ordered</th>
                          <th className="p-2 w-24">Previously</th>
                          <th className="p-2 w-24 text-emerald-700 dark:text-emerald-400">Receiving</th>
                          <th className="p-2 w-24 text-emerald-700 dark:text-emerald-400">Accepted</th>
                          <th className="p-2 w-24 text-rose-700 dark:text-rose-400">Rejected</th>
                          <th className="p-2 w-24">Unit Cost</th>
                          <th className="p-2 w-20">Tax %</th>
                          <th className="p-2 w-24">Batch No</th>
                          <th className="p-2 w-32">Expiry Date</th>
                          <th className="p-2 text-right">Line Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.length === 0 ? (
                          <tr>
                            <td colSpan={12} className="p-4 text-center text-slate-500">Please select a Purchase Order to load items.</td>
                          </tr>
                        ) : (
                          formData.items.map((item) => {
                            const remaining = item.orderedQty - item.previouslyReceived;
                            return (
                              <tr key={item.id} className="border-t border-slate-200 dark:border-slate-800">
                                <td className="p-2 font-medium">{item.product}</td>
                                <td className="p-2 font-mono text-slate-500">{item.barcode}</td>
                                <td className="p-2 text-center">{item.orderedQty}</td>
                                <td className="p-2 text-center">{item.previouslyReceived}</td>
                                <td className="p-2">
                                  <input 
                                    type="number" 
                                    className={`w-full p-1.5 border rounded bg-white dark:bg-slate-900 focus:ring-1 focus:ring-emerald-500 ${item.receivingNow > remaining || item.receivingNow < 0 ? 'border-rose-500 text-rose-600' : 'border-slate-300 dark:border-slate-700'}`} 
                                    min="0" 
                                    max={remaining}
                                    value={item.receivingNow} 
                                    onChange={(e) => handleItemChange(item.id, 'receivingNow', parseFloat(e.target.value) || 0)} 
                                  />
                                </td>
                                <td className="p-2">
                                  <input 
                                    type="number" 
                                    className={`w-full p-1.5 border rounded focus:ring-1 focus:ring-emerald-500 ${item.acceptedQty + item.rejectedQty !== item.receivingNow || item.acceptedQty < 0 ? 'border-rose-500 text-rose-600 bg-rose-50' : 'border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/50 dark:bg-emerald-900/20'}`} 
                                    min="0" 
                                    value={item.acceptedQty} 
                                    onChange={(e) => handleItemChange(item.id, 'acceptedQty', parseFloat(e.target.value) || 0)} 
                                  />
                                </td>
                                <td className="p-2">
                                  <input 
                                    type="number" 
                                    className={`w-full p-1.5 border rounded focus:ring-1 focus:ring-rose-500 ${item.acceptedQty + item.rejectedQty !== item.receivingNow || item.rejectedQty < 0 ? 'border-rose-500 text-rose-600 bg-rose-50' : 'border-rose-300 dark:border-rose-700/50 bg-rose-50/50 dark:bg-rose-900/20'}`} 
                                    min="0" 
                                    value={item.rejectedQty} 
                                    onChange={(e) => handleItemChange(item.id, 'rejectedQty', parseFloat(e.target.value) || 0)} 
                                  />
                                </td>
                                <td className="p-2">
                                  <input type="number" className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 focus:ring-1 focus:ring-emerald-500" min="0" step="0.01" value={item.unitCost} onChange={(e) => handleItemChange(item.id, 'unitCost', parseFloat(e.target.value) || 0)} />
                                </td>
                                <td className="p-2 text-center">{item.taxPercent}%</td>
                                <td className="p-2">
                                  <input className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900" placeholder="Batch..." value={item.batchNumber} onChange={(e) => handleItemChange(item.id, 'batchNumber', e.target.value)} />
                                </td>
                                <td className="p-2">
                                  <input type="date" className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-xs" value={item.expiryDate} onChange={(e) => handleItemChange(item.id, 'expiryDate', e.target.value)} />
                                </td>
                                <td className="p-2 text-right font-medium">{formatQAR(item.lineTotal)}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-72 flex flex-col gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex justify-between"><span>Subtotal:</span> <span className="font-medium">{formatQAR(totals.subtotal)}</span></div>
                    <div className="flex justify-between"><span>Tax:</span> <span>+{formatQAR(totals.taxTotal)}</span></div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                      <span>Total:</span> <span>{formatQAR(totals.grandTotal)}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 shrink-0 bg-slate-50 dark:bg-slate-900">
              <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
              <Button variant="secondary" onClick={() => saveGRN('DRAFT')}>Save Draft</Button>
              <Button variant="primary" onClick={() => saveGRN('SUBMITTED')}>Submit</Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom View Modal (Wide layout) */}
      {isViewModalOpen && activeGRN && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsViewModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-[90vw] max-w-[1400px] flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Goods Receipt Note: {activeGRN.code}</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{activeGRN.supplier}</h3>
                    <p className="text-sm text-slate-500">PO Number: {activeGRN.poNumber || 'N/A'} | Date: {activeGRN.receiptDate}</p>
                    <p className="text-sm text-slate-500">Warehouse: {activeGRN.warehouse}</p>
                  </div>
                  <Badge variant={getStatusColor(activeGRN.status) as any} className="text-sm px-3 py-1">{activeGRN.status}</Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg text-sm">
                  <div>
                    <span className="text-slate-500 block mb-0.5 text-xs font-semibold uppercase">Supplier Invoice No</span>
                    <span className="font-medium">{activeGRN.supplierInvoiceNumber || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5 text-xs font-semibold uppercase">Invoice Date</span>
                    <span className="font-medium">{activeGRN.invoiceDate || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5 text-xs font-semibold uppercase">Delivery Note / ASN</span>
                    <span className="font-medium">{activeGRN.reference || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5 text-xs font-semibold uppercase">Notes</span>
                    <span className="font-medium">{activeGRN.notes || '-'}</span>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="p-2">Product</th>
                        <th className="p-2">Barcode</th>
                        <th className="p-2 text-center">Ordered</th>
                        <th className="p-2 text-center">Previously</th>
                        <th className="p-2 text-center font-semibold">Receiving</th>
                        <th className="p-2 text-center font-semibold text-emerald-600">Accepted</th>
                        <th className="p-2 text-center font-semibold text-rose-600">Rejected</th>
                        <th className="p-2 text-right">Unit Cost</th>
                        <th className="p-2 text-center">Tax %</th>
                        <th className="p-2">Batch No</th>
                        <th className="p-2">Expiry Date</th>
                        <th className="p-2 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {activeGRN.items.length === 0 ? (
                        <tr><td colSpan={12} className="p-4 text-center text-slate-500">No items</td></tr>
                      ) : (
                        activeGRN.items.map(item => (
                          <tr key={item.id}>
                            <td className="p-2 font-medium">{item.product || 'Unnamed Item'}</td>
                            <td className="p-2 font-mono text-slate-500">{item.barcode}</td>
                            <td className="p-2 text-center">{item.orderedQty}</td>
                            <td className="p-2 text-center">{item.previouslyReceived}</td>
                            <td className="p-2 text-center font-bold">{item.receivingNow}</td>
                            <td className="p-2 text-center font-bold text-emerald-600">{item.acceptedQty}</td>
                            <td className="p-2 text-center font-bold text-rose-600">{item.rejectedQty}</td>
                            <td className="p-2 text-right">{formatQAR(item.unitCost)}</td>
                            <td className="p-2 text-center">{item.taxPercent}%</td>
                            <td className="p-2">{item.batchNumber || '-'}</td>
                            <td className="p-2">{item.expiryDate || '-'}</td>
                            <td className="p-2 text-right font-medium">{formatQAR(item.lineTotal)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <div className="w-72 flex flex-col gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex justify-between"><span>Subtotal:</span> <span className="font-medium">{formatQAR(activeGRN.subtotal)}</span></div>
                    <div className="flex justify-between"><span>Tax:</span> <span>+{formatQAR(activeGRN.taxTotal)}</span></div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                      <span>Total:</span> <span>{formatQAR(activeGRN.grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 shrink-0 bg-slate-50 dark:bg-slate-900">
              <Button variant="outline" onClick={() => window.print()}>Print GRN</Button>
              <Button variant="primary" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && activeGRN && (
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
          <div className="flex flex-col gap-4">
            <p>Are you sure you want to delete GRN <strong>{activeGRN.code}</strong>?</p>
            <p className="text-sm text-slate-500">This action cannot be undone.</p>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
              <Button variant="primary" className="bg-rose-600 hover:bg-rose-700 border-rose-600" onClick={handleDelete}>Delete GRN</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
