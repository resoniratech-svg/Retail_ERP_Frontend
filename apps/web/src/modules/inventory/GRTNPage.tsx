import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Plus, Search, Eye, Edit, Trash2, Power, ArrowRight, X } from 'lucide-react';
import { formatQAR } from '@qatar-erp/utils';

const STORAGE_KEY = 'retail_erp_grtn';
const PRODUCTS_KEY = 'retail_erp_products';
const CURRENT_USER = 'Ahmed Al-Mansouri';

type GRTNStatus = 'DRAFT' | 'APPROVED' | 'POSTED' | 'CANCELLED';

interface GRTNItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  code: string;
  barcode: string;
  unit: string;
  uom: string;
  returnQty: number; // Qty
  foc: number;
  supCost: number; // Sup Cost
  unitDisc: number;
  itemDiscount: number;
  amount: number;
  taxPercent: number;
  taxAmount: number;
  amtInclTax: number;
  serialNo: string;
  additionalDescriptions: string;
  currCost: number;
  currPrice: number;
}

interface GRTNRecord {
  id: string;
  grtnNo: string;
  supplierId: string;
  supplierName: string;
  grtnDate: string;
  warehouseId: string;
  warehouseName: string;
  reference: string; 
  notes: string;
  items: GRTNItem[];
  status: GRTNStatus;
  createdDate: string;
  createdBy: string;
  
  // DART POS Alignment Fields
  fullReference?: string;
  invoiceNo?: string;
  invoiceDate?: string;
  returnedOn?: string;
  location?: string;
  paymode?: string;
  totalAmount?: number;
  discountPercentage?: number;
  discountAmount?: number;
  subTotal?: number;
  taxAmount?: number;
  taxAdjustment?: number;
  netTotal?: number;
  isPosted?: boolean;
  emailStatus?: string;
  modifiedBy?: string;
  modifiedOn?: string;
  returnReason?: string;

  // New fields
  disableTax?: boolean;
  vendorTrn?: string;
}

const DEFAULT_PRODUCTS = [
  { id: 'PROD-001', name: 'Premium Jasmine Rice 5kg', sku: 'ITM-001', price: 45.00, code: 'C-001', barcode: '8901234' },
  { id: 'PROD-002', name: 'Sunflower Oil 2L', sku: 'ITM-002', price: 22.50, code: 'C-002', barcode: '8901235' },
  { id: 'PROD-003', name: 'Fresh Milk 1L', sku: 'ITM-003', price: 7.00, code: 'C-003', barcode: '8901236' },
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
  currCost: 0,
  currPrice: 0,
  taxPercent: 0,
  returnQty: 0,
  foc: 0,
  supCost: 0,
  unitDisc: 0,
  itemDiscount: 0,
  amount: 0,
  taxAmount: 0,
  amtInclTax: 0,
  serialNo: '',
  additionalDescriptions: '',
  calcQtyFromSerial: false
};

export const GRTNPage: React.FC = () => {
  const [records, setRecords] = useState<GRTNRecord[]>([]);
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<GRTNRecord | null>(null);

  // Form State
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<Partial<GRTNRecord>>({ items: [] });
  
  // Product Entry State
  const [productEntry, setProductEntry] = useState(initialProductEntry);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) setRecords(JSON.parse(data));

      const prods = localStorage.getItem(PRODUCTS_KEY);
      if (prods) setProducts(JSON.parse(prods));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveRecords = (data: GRTNRecord[]) => {
    setRecords(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const getStatusBadge = (status: GRTNStatus) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="neutral">Draft</Badge>;
      case 'APPROVED': return <Badge variant="warning">Approved</Badge>;
      case 'POSTED': return <Badge variant="success">Posted</Badge>;
      case 'CANCELLED': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const openNewForm = () => {
    setFormError('');
    setFormData({
      grtnNo: `GRTN-2026-${(records.length + 1).toString().padStart(4, '0')}`,
      supplierName: '',
      location: '',
      invoiceNo: '',
      paymode: 'Credit',
      invoiceDate: new Date().toISOString().split('T')[0],
      returnedOn: new Date().toISOString().split('T')[0],
      disableTax: false,
      vendorTrn: 'N/A',
      reference: '',
      notes: '',
      items: [],
      totalAmount: 0,
      discountPercentage: 0,
      discountAmount: 0,
      subTotal: 0,
      taxAdjustment: 0,
      taxAmount: 0,
      netTotal: 0,
      status: 'DRAFT',
      createdBy: CURRENT_USER,
      createdDate: new Date().toISOString()
    });
    setProductEntry(initialProductEntry);
    setEditingItemId(null);
    setIsFormModalOpen(true);
  };

  const calculateTotals = (items: GRTNItem[], billDiscountPercent: number = 0, billDiscountAmount: number = 0) => {
    let subtotal = 0;
    let taxTotal = 0;
    
    items.forEach(item => {
      subtotal += item.amount || 0;
      taxTotal += item.taxAmount || 0;
    });

    const netTotal = subtotal - billDiscountAmount + taxTotal;

    return { subtotal, discountTotal: billDiscountAmount, taxTotal, grandTotal: netTotal };
  };

  const handleSaveForm = (submitAsStatus: GRTNStatus) => {
    setFormError('');
    if (!formData.supplierName) return setFormError('Vendor is required.');
    
    const { subtotal, discountTotal, taxTotal, grandTotal } = calculateTotals(formData.items || [], formData.discountPercentage || 0, formData.discountAmount || 0);

    const payload: GRTNRecord = {
      ...(formData as GRTNRecord),
      id: formData.id || `grtn-${Date.now()}`,
      status: submitAsStatus,
      totalAmount: subtotal,
      subTotal: subtotal - discountTotal,
      taxAmount: taxTotal,
      discountAmount: discountTotal,
      netTotal: grandTotal,
    };

    if (formData.id) {
      payload.modifiedBy = CURRENT_USER;
      payload.modifiedOn = new Date().toISOString();
      saveRecords(records.map(r => r.id === formData.id ? payload : r));
    } else {
      saveRecords([payload, ...records]);
    }
    setIsFormModalOpen(false);
  };

  const handleStatusChange = (r: GRTNRecord, newStatus: GRTNStatus) => {
    saveRecords(records.map(gr => gr.id === r.id ? { ...gr, status: newStatus } : gr));
    setIsViewModalOpen(false);
  };

  const updateProductEntry = (field: string, value: any) => {
    setProductEntry(prev => {
      const next = { ...prev, [field]: value };
      
      const qty = next.returnQty || 0;
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

    const newItem: GRTNItem = {
      id: editingItemId || `itm-${Date.now()}`,
      productId: productEntry.productId,
      productName: productEntry.productName,
      sku: productEntry.sku,
      code: productEntry.code,
      barcode: productEntry.barcode,
      unit: productEntry.unit,
      uom: productEntry.uom,
      returnQty: productEntry.returnQty,
      foc: productEntry.foc,
      supCost: productEntry.supCost,
      unitDisc: productEntry.unitDisc,
      itemDiscount: productEntry.itemDiscount,
      amount: productEntry.amount,
      taxPercent: productEntry.taxPercent,
      taxAmount: productEntry.taxAmount,
      amtInclTax: productEntry.amtInclTax,
      serialNo: productEntry.serialNo,
      additionalDescriptions: productEntry.additionalDescriptions,
      currCost: productEntry.currCost,
      currPrice: productEntry.currPrice
    };

    setFormData(prev => {
      const existingItems = prev.items || [];
      if (editingItemId) {
        return { ...prev, items: existingItems.map(item => item.id === editingItemId ? newItem : item) };
      } else {
        return { ...prev, items: [...existingItems, newItem] };
      }
    });

    setProductEntry(initialProductEntry);
    setEditingItemId(null);
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData({ ...formData, items: formData.items?.filter(i => i.id !== itemId) });
  };

  const handleEditProduct = (item: GRTNItem) => {
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
      returnQty: item.returnQty,
      foc: item.foc,
      supCost: item.supCost,
      unitDisc: item.unitDisc,
      itemDiscount: item.itemDiscount,
      amount: item.amount,
      taxPercent: item.taxPercent,
      taxAmount: item.taxAmount,
      amtInclTax: item.amtInclTax,
      serialNo: item.serialNo,
      additionalDescriptions: item.additionalDescriptions,
      currCost: item.currCost,
      currPrice: item.currPrice
    });
    setEditingItemId(item.id);
  };

  const filteredRecords = records.filter(w => 
    w.grtnNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (w.supplierName && w.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (w.reference && w.reference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totals = calculateTotals(formData.items || [], formData.discountPercentage || 0, formData.discountAmount || 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goods Return Note (GRTN)</h1>
          <p className="text-sm text-slate-500">Manage vendor returns</p>
        </div>
        <Button variant="primary" onClick={openNewForm}>
          <Plus className="w-4 h-4 mr-2 inline" /> New GRTN
        </Button>
      </div>

      <Card className="p-4 flex gap-4 bg-slate-50/50">
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search GRTN, supplier, reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300"
          />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-max">
            <thead className="bg-slate-100 uppercase text-[11px] font-semibold text-slate-700 border-b">
              <tr>
                <th className="p-4">Refno</th>
                <th className="p-4">Full Reference</th>
                <th className="p-4">Vendor</th>
                <th className="p-4">Invoice No</th>
                <th className="p-4">Invoice Date</th>
                <th className="p-4">Returned On</th>
                <th className="p-4">Location</th>
                <th className="p-4">Paymode</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-right">Discount P</th>
                <th className="p-4 text-right">Discount</th>
                <th className="p-4 text-right">Sub Total</th>
                <th className="p-4 text-right">TAX</th>
                <th className="p-4 text-right">Tax Adj</th>
                <th className="p-4 text-right">Net Total</th>
                <th className="p-4 text-center">Is Posted</th>
                <th className="p-4 text-center">Email Status</th>
                <th className="p-4">Created By</th>
                <th className="p-4">Created On</th>
                <th className="p-4">Modified By</th>
                <th className="p-4">Modified On</th>
                <th className="p-4">Return Reason</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRecords.map((w) => {
                const isPosted = w.isPosted || w.status === 'POSTED';
                const total = w.totalAmount || w.items.reduce((acc, curr) => acc + (curr.returnQty * curr.supCost), 0) || 0;
                const discPct = w.discountPercentage || 0;
                const discAmt = w.discountAmount || 0;
                const subTot = w.subTotal !== undefined ? w.subTotal : total;
                const taxAmt = w.taxAmount || 0;
                const taxAdj = w.taxAdjustment || 0;
                const netTot = w.netTotal !== undefined ? w.netTotal : total;

                return (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold text-xs">{w.grtnNo}</td>
                    <td className="p-4">{w.fullReference || '—'}</td>
                    <td className="p-4 font-medium">{w.supplierName}</td>
                    <td className="p-4">{w.invoiceNo || '—'}</td>
                    <td className="p-4">{w.invoiceDate || '—'}</td>
                    <td className="p-4">{w.returnedOn || w.grtnDate}</td>
                    <td className="p-4 text-xs text-slate-600">{w.location || w.warehouseName}</td>
                    <td className="p-4">{w.paymode || '—'}</td>
                    <td className="p-4 text-right text-slate-600">{total.toFixed(2)}</td>
                    <td className="p-4 text-right text-slate-600">{discPct.toFixed(2)}</td>
                    <td className="p-4 text-right text-rose-600">{discAmt.toFixed(2)}</td>
                    <td className="p-4 text-right font-medium text-slate-700">{subTot.toFixed(2)}</td>
                    <td className="p-4 text-right text-slate-600">{taxAmt.toFixed(2)}</td>
                    <td className="p-4 text-right text-slate-600">{taxAdj.toFixed(2)}</td>
                    <td className="p-4 text-right font-bold text-emerald-600">{netTot.toFixed(2)}</td>
                    <td className="p-4 text-center">{isPosted ? 'Yes' : 'No'}</td>
                    <td className="p-4 text-center">{w.emailStatus || '—'}</td>
                    <td className="p-4">{w.createdBy}</td>
                    <td className="p-4">{w.createdDate ? new Date(w.createdDate).toLocaleDateString() : '—'}</td>
                    <td className="p-4">{w.modifiedBy || '—'}</td>
                    <td className="p-4">{w.modifiedOn ? new Date(w.modifiedOn).toLocaleDateString() : '—'}</td>
                    <td className="p-4">{w.returnReason || w.notes || '—'}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setActiveRecord(w); setIsViewModalOpen(true); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredRecords.length === 0 && (
                <tr><td colSpan={23} className="p-8 text-center text-slate-500">No GRTN records found.</td></tr>
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
            <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  {formData.id ? `Edit GRTN: ${formData.grtnNo}` : "New GRV"}
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
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700">Vendor *</label>
                      <Select 
                        options={[{value:'', label:'[Select a vendor]'}, {value:'Global Distributors', label:'Global Distributors'}]}
                        value={formData.supplierName}
                        onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
                        className="w-full text-sm h-8"
                      />
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700">Location</label>
                      <Select 
                        options={[{value:'Saudi Arabia', label:'Saudi Arabia'}, {value:'Qatar', label:'Qatar'}]}
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full text-sm h-8"
                      />
                    </div>
                    
                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700">Invoice No.</label>
                      <div className="flex gap-1">
                        <input type="text" className="w-full text-sm h-8 rounded-md border border-slate-300 px-3 flex-1" value={formData.invoiceNo || ''} onChange={(e) => setFormData({...formData, invoiceNo: e.target.value})} />
                        <Button variant="outline" className="h-8 w-8 p-0 shrink-0"><Plus className="w-4 h-4" /></Button>
                      </div>
                    </div>
                    
                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700">Paymode</label>
                      <div className="flex gap-1">
                        <Select 
                          options={[{value:'Credit', label:'Credit'}, {value:'Cash', label:'Cash'}]}
                          value={formData.paymode}
                          onChange={(e) => setFormData({...formData, paymode: e.target.value})}
                          className="w-full text-sm h-8 flex-1"
                        />
                        <Button variant="outline" className="h-8 w-8 p-0 shrink-0"><Plus className="w-4 h-4" /></Button>
                      </div>
                    </div>

                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700">Inv Date</label>
                      <input type="date" className="w-full text-sm h-8 rounded-md border border-slate-300 px-3" value={formData.invoiceDate || ''} onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})} />
                    </div>

                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700">Returned Date</label>
                      <input type="date" className="w-full text-sm h-8 rounded-md border border-slate-300 px-3" value={formData.returnedOn || ''} onChange={(e) => setFormData({...formData, returnedOn: e.target.value})} />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 px-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300" checked={formData.disableTax} onChange={(e) => setFormData({...formData, disableTax: e.target.checked})} />
                      Disable Tax
                    </label>
                    <div className="text-[11px] font-medium text-slate-700">TRN: <span className="font-normal">{formData.vendorTrn}</span></div>
                  </div>
                </div>
              </div>

              {/* Middle Block: Product Details */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-4">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 border-b border-slate-100 pb-2">Product Details</h4>
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-1 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700">Code</label>
                      <input type="text" className="w-full text-sm h-8 rounded-md border border-slate-300 px-2" value={productEntry.code} onChange={(e) => updateProductEntry('code', e.target.value)} />
                    </div>
                    <div className="col-span-1 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700">Barcode</label>
                      <input type="text" className="w-full text-sm h-8 rounded-md border border-slate-300 px-2" value={productEntry.barcode} onChange={(e) => updateProductEntry('barcode', e.target.value)} />
                    </div>
                    <div className="col-span-3 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700">Product</label>
                      <Select 
                        options={[{value:'', label:''}, {value:'Item A', label:'Item A'}]}
                        value={productEntry.productName}
                        onChange={(e) => updateProductEntry('productName', e.target.value)}
                        className="w-full text-sm h-8"
                      />
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700">Unit</label>
                      <Select 
                        options={[{value:'Unit', label:'[Select unit]'}, {value:'Box', label:'Box'}]}
                        value={productEntry.unit}
                        onChange={(e) => updateProductEntry('unit', e.target.value)}
                        className="w-full text-sm h-8"
                      />
                    </div>
                    <div className="col-span-1 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700">UOM</label>
                      <input type="text" className="w-full text-sm h-8 rounded-md border border-slate-300 px-2" value={productEntry.uom} onChange={(e) => updateProductEntry('uom', e.target.value)} />
                    </div>
                    <div className="col-span-1 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700 truncate">Curr. Cost</label>
                      <input type="number" className="w-full text-sm h-8 rounded-md border border-slate-200 bg-slate-50 px-2" value={productEntry.currCost} readOnly />
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700 truncate">Curr Price</label>
                      <input type="number" className="w-full text-sm h-8 rounded-md border border-slate-200 bg-slate-50 px-2" value={productEntry.currPrice} readOnly />
                    </div>
                    <div className="col-span-1 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700">Tax(%)</label>
                      <input type="number" className="w-full text-sm h-8 rounded-md border border-slate-300 px-2" value={productEntry.taxPercent} onChange={(e) => updateProductEntry('taxPercent', parseFloat(e.target.value)||0)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-10 gap-2">
                    <div className="col-span-1 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700">Pur. Qty</label>
                      <input type="number" className="w-full text-sm h-8 rounded-md border border-slate-300 px-2" value={productEntry.returnQty} onChange={(e) => updateProductEntry('returnQty', parseFloat(e.target.value)||0)} />
                    </div>
                    <div className="col-span-1 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700">FOC</label>
                      <input type="number" className="w-full text-sm h-8 rounded-md border border-slate-300 px-2" value={productEntry.foc} onChange={(e) => updateProductEntry('foc', parseFloat(e.target.value)||0)} />
                    </div>
                    <div className="col-span-1 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700 truncate">Sup. Cost</label>
                      <input type="number" className="w-full text-sm h-8 rounded-md border border-slate-300 px-2" value={productEntry.supCost} onChange={(e) => updateProductEntry('supCost', parseFloat(e.target.value)||0)} />
                    </div>
                    <div className="col-span-1 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700 truncate">Unit. Disc</label>
                      <input type="number" className="w-full text-sm h-8 rounded-md border border-slate-300 px-2" value={productEntry.unitDisc} onChange={(e) => updateProductEntry('unitDisc', parseFloat(e.target.value)||0)} />
                    </div>
                    <div className="col-span-1 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700">Discount</label>
                      <input type="number" className="w-full text-sm h-8 rounded-md border border-slate-300 px-2" value={productEntry.itemDiscount} onChange={(e) => updateProductEntry('itemDiscount', parseFloat(e.target.value)||0)} />
                    </div>
                    <div className="col-span-1 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700">Amount</label>
                      <input type="number" className="w-full text-sm h-8 rounded-md border border-slate-200 bg-slate-50 px-2" value={productEntry.amount} readOnly />
                    </div>
                    <div className="col-span-1 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700">Tax</label>
                      <input type="number" className="w-full text-sm h-8 rounded-md border border-slate-200 bg-slate-50 px-2" value={productEntry.taxAmount} readOnly />
                    </div>
                    <div className="col-span-1 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700 truncate">Amt Ind.Tax</label>
                      <input type="number" className="w-full text-sm h-8 rounded-md border border-slate-200 bg-slate-50 px-2" value={productEntry.amtInclTax} readOnly />
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700">Serial #</label>
                      <input type="text" className="w-full text-sm h-8 rounded-md border border-slate-300 px-2" value={productEntry.serialNo} onChange={(e) => updateProductEntry('serialNo', e.target.value)} />
                    </div>
                  </div>

                  <div className="flex items-end gap-3 mt-1">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-700">Additional Descriptions</label>
                      <input type="text" className="w-full text-sm h-8 rounded-md border border-slate-300 px-2" value={productEntry.additionalDescriptions} onChange={(e) => updateProductEntry('additionalDescriptions', e.target.value)} />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1.5 w-32 shrink-0">
                      <input type="checkbox" className="rounded border-slate-300" checked={productEntry.calcQtyFromSerial} onChange={(e) => updateProductEntry('calcQtyFromSerial', e.target.checked)} />
                      <label className="text-[11px] font-medium text-slate-700 cursor-pointer" onClick={() => updateProductEntry('calcQtyFromSerial', !productEntry.calcQtyFromSerial)}>Calc. Qty From Serial</label>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                      <div className="flex flex-col gap-1 w-20">
                        <Button variant="outline" className="w-full text-[10px] h-7 px-1 text-rose-600 border-rose-200 bg-rose-50" onClick={() => { if (editingItemId) { handleRemoveItem(editingItemId); setEditingItemId(null); setProductEntry(initialProductEntry); } }}>
                          <Trash2 className="w-3 h-3 mr-1"/> Remove
                        </Button>
                        <Button variant="outline" className="w-full text-[10px] h-7 px-1 bg-emerald-50 text-emerald-700 border-emerald-200" onClick={handleAddProduct}>
                          <Plus className="w-3 h-3 mr-1"/> Add (F1)
                        </Button>
                      </div>
                      <div className="flex flex-col gap-1 w-20">
                        <Button variant="outline" className="w-full text-[10px] h-7 px-1">PDT F7</Button>
                        <Button variant="outline" className="w-full text-[10px] h-7 px-1">
                          <Edit className="w-3 h-3 mr-1"/> Edit
                        </Button>
                      </div>
                      <div className="flex flex-col justify-start">
                        <Button variant="outline" className="w-24 text-[10px] h-7 px-1 font-semibold">Load Purchase</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Block */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col min-h-[250px]">
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-[11px] whitespace-nowrap min-w-max">
                    <thead className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-2 border-r border-slate-200">SlNo</th>
                        <th className="p-2 border-r border-slate-200">Code</th>
                        <th className="p-2 border-r border-slate-200">Barcode</th>
                        <th className="p-2 border-r border-slate-200">Product</th>
                        <th className="p-2 border-r border-slate-200">UOM</th>
                        <th className="p-2 border-r border-slate-200 text-right">Qty</th>
                        <th className="p-2 border-r border-slate-200 text-right">FOC</th>
                        <th className="p-2 border-r border-slate-200 text-right">Tax Perc</th>
                        <th className="p-2 border-r border-slate-200 text-right">Sup Cost</th>
                        <th className="p-2 border-r border-slate-200 text-right">Unit Discount</th>
                        <th className="p-2 border-r border-slate-200 text-right">Item Discount</th>
                        <th className="p-2 border-r border-slate-200 text-right">Amount</th>
                        <th className="p-2 border-r border-slate-200 text-right">Tax</th>
                        <th className="p-2 border-r border-slate-200 text-right">Amount Incl...</th>
                        <th className="p-2 border-r border-slate-200">Serial No</th>
                        <th className="p-2">Additional De...</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {formData.items?.length === 0 ? (
                        <tr><td colSpan={16} className="p-6 text-center text-slate-500">No items added.</td></tr>
                      ) : (
                        formData.items?.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => handleEditProduct(item)}>
                            <td className="p-2 border-r border-slate-100">{idx + 1}</td>
                            <td className="p-2 border-r border-slate-100">{item.code}</td>
                            <td className="p-2 border-r border-slate-100">{item.barcode}</td>
                            <td className="p-2 border-r border-slate-100 font-medium">{item.productName}</td>
                            <td className="p-2 border-r border-slate-100">{item.uom}</td>
                            <td className="p-2 border-r border-slate-100 text-right font-bold">{item.returnQty}</td>
                            <td className="p-2 border-r border-slate-100 text-right">{item.foc}</td>
                            <td className="p-2 border-r border-slate-100 text-right">{item.taxPercent}</td>
                            <td className="p-2 border-r border-slate-100 text-right">{formatQAR(item.supCost)}</td>
                            <td className="p-2 border-r border-slate-100 text-right">{formatQAR(item.unitDisc)}</td>
                            <td className="p-2 border-r border-slate-100 text-right">{formatQAR(item.itemDiscount)}</td>
                            <td className="p-2 border-r border-slate-100 text-right font-medium">{formatQAR(item.amount)}</td>
                            <td className="p-2 border-r border-slate-100 text-right">{formatQAR(item.taxAmount)}</td>
                            <td className="p-2 border-r border-slate-100 text-right font-medium text-emerald-600">{formatQAR(item.amtInclTax)}</td>
                            <td className="p-2 border-r border-slate-100">{item.serialNo}</td>
                            <td className="p-2 text-slate-500 truncate max-w-[120px]">{item.additionalDescriptions}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Block: General & Totals */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col">
                  <div className="flex gap-4 border-b border-slate-100 mb-3 text-[11px] font-medium">
                    <button className="pb-2 border-b-2 border-primary-500 text-primary-600">General</button>
                    <button className="pb-2 border-b-2 border-transparent text-slate-500">Notes</button>
                    <button className="pb-2 border-b-2 border-transparent text-slate-500">Approval Status</button>
                    <button className="pb-2 border-b-2 border-transparent text-slate-500">Documents</button>
                  </div>
                  <div className="flex-1 flex gap-4 mt-2 text-xs">
                    <div className="flex-1 flex flex-col gap-2 text-blue-700 font-medium">
                      <button className="text-left hover:underline">F8 - Product Purchase History</button>
                      <button className="text-left hover:underline">F9 - Load Product From Purchase</button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="flex gap-4">
                    <div className="flex-1 flex flex-col gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-700 mb-1">Apply Bill Discount</div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Discount (%)</span>
                        <Input type="number" className="w-16 h-6 text-xs text-right" value={formData.discountPercentage} onChange={(e) => setFormData({...formData, discountPercentage: parseFloat(e.target.value)||0})} />
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Disc Amount</span>
                        <Input type="number" className="w-16 h-6 text-xs text-right" value={formData.discountAmount} onChange={(e) => setFormData({...formData, discountAmount: parseFloat(e.target.value)||0})} />
                      </div>
                      <div className="flex justify-end mt-1">
                        <Button variant="outline" className="h-6 text-[10px] px-2 border-blue-200 text-blue-700 bg-blue-50 py-0">&lt;- Apply</Button>
                      </div>
                      <div className="mt-1">
                        <Select options={[{value:'', label:'[Select a Ledger]'}]} className="w-full text-[10px] h-6" value="" />
                      </div>
                    </div>

                    <div className="flex-[1.2] flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between"><span>Total</span><span className="font-medium">{formatQAR(totals.subtotal)}</span></div>
                      <div className="flex justify-between text-rose-600"><span>Discount</span><span>{formatQAR(totals.discountTotal)}</span></div>
                      <div className="flex justify-between"><span>Sub Total</span><span className="font-medium">{formatQAR(totals.subtotal - totals.discountTotal)}</span></div>
                      <div className="flex justify-between"><span>TAX</span><span>{formatQAR(totals.taxTotal)}</span></div>
                      <div className="flex justify-between"><span>Round off</span><span><Input type="number" className="w-16 h-6 text-[10px] text-right" value="0.00" readOnly /></span></div>
                      <div className="flex justify-between font-bold text-sm pt-2 border-t border-slate-200 mt-1">
                        <span>Net Total</span><span>{formatQAR(totals.grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            
            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-start gap-3 shrink-0 bg-slate-50 dark:bg-slate-900 border-b-4 border-b-slate-300">
              <Button variant="outline" className="h-8 text-xs font-semibold" onClick={() => handleSaveForm('DRAFT')}>Save & New</Button>
              <Button variant="outline" className="h-8 text-xs font-semibold" onClick={() => handleSaveForm('DRAFT')}>Save & Close</Button>
              <Button variant="primary" className="h-8 text-xs font-semibold bg-emerald-600 border-none" onClick={() => handleSaveForm('APPROVED')}>Post</Button>
            </div>
          </div>
        </div>
      )}

      {/* --- VIEW MODAL --- */}
      {isViewModalOpen && activeRecord && (
        <Modal isOpen onClose={() => setIsViewModalOpen(false)} title={`GRTN: ${activeRecord.grtnNo}`} className="max-w-[800px]">
          <div className="p-6">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{activeRecord.supplierName}</h2>
                <p className="text-sm text-slate-500">Date: {activeRecord.grtnDate}</p>
              </div>
              {getStatusBadge(activeRecord.status)}
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
              {activeRecord.status === 'DRAFT' && (
                <Button variant="primary" onClick={() => handleStatusChange(activeRecord, 'APPROVED')}>Approve</Button>
              )}
              {activeRecord.status === 'APPROVED' && (
                <Button variant="success" onClick={() => handleStatusChange(activeRecord, 'POSTED')}>Post</Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
