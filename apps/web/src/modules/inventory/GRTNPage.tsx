import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Plus, Search, Eye, Edit, Trash2, Power, ArrowRight, X, Save, Undo2, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
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
    <div className="flex flex-col gap-2 h-full">
      {!isFormModalOpen && (
        <>
          <div className="flex flex-col border border-slate-300 dark:border-slate-700 rounded-sm bg-[#f1f5f9] dark:bg-slate-800 shadow-sm">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between p-1 border-b border-slate-300 dark:border-slate-700">
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
              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-600" />
              <span>Purchase Return</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2 pr-2">
            <Button variant="primary" className="py-1 px-2 text-xs h-7 flex items-center gap-1 font-bold" onClick={openNewForm}>
              <Plus className="w-3.5 h-3.5" /> New GRTN
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
          Pre Purchase Returns
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
        </>
      )}

      {/* --- ADD / EDIT FORM (FULL SCREEN OVERLAY) --- */}
      {isFormModalOpen && (
        <div className="relative flex-1 bg-[#f0f4f8] flex flex-col -mx-4 -mt-4 border border-slate-300 dark:border-slate-800 shadow-sm min-h-[calc(100vh-140px)] animate-in fade-in duration-200">

            {/* Header */}
            <div className="px-2 py-1 border-b border-slate-300 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center text-[12px] font-semibold text-slate-800">
                {formData.id ? `Edit GRTN: ${formData.grtnNo}` : "New GRV"} - DART POS
              </div>
              <button onClick={() => setIsFormModalOpen(false)} className="p-0.5 hover:bg-slate-200 text-slate-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Top Action Bar */}
            <div className="flex items-center gap-1 px-2 py-1 bg-[#f1f5f9] border-b border-slate-300">
              <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => handleSaveForm('DRAFT')}>
                <Save className="w-4 h-4 text-blue-600 mb-0.5" />
                <span>Save & New</span>
              </button>
              <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => handleSaveForm('DRAFT')}>
                <Save className="w-4 h-4 text-blue-600 mb-0.5" />
                <span>Save & Close</span>
              </button>
              <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => handleSaveForm('APPROVED')}>
                <CheckCircle2 className="w-4 h-4 text-orange-500 mb-0.5" />
                <span>Post</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-2 bg-[#f0f4f8] flex flex-col gap-2 [&::-webkit-scrollbar]:hidden">
              {formError && (
                <div className="p-2 bg-rose-50 text-rose-600 text-xs rounded border border-rose-200">
                  {formError}
                </div>
              )}
              
              {/* Invoice Details */}
              <div className="bg-[#f0f4f8] border-b border-slate-300 pb-2">
                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-800 mb-2 pl-1">
                  <span>Invoice Details</span>
                  <span className="font-normal text-slate-600">Ref#: New</span>
                </div>
                
                <div className="flex flex-col gap-2 pl-1">
                  {/* Row 1 */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-[320px]">
                      <label className="text-[11px] font-medium text-slate-700 w-16">Vendor</label>
                      <Select 
                        options={[{value:'', label:'[Select a vendor]'}, {value:'Global Distributors', label:'Global Distributors'}]}
                        value={formData.supplierName}
                        onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
                        className="flex-1 text-xs h-6 py-0 border-slate-300"
                      />
                      <Button variant="outline" className="h-6 w-6 p-0 shrink-0 border-slate-300 bg-white"><Plus className="w-3 h-3 text-blue-500" /></Button>
                    </div>
                    <div className="flex items-center gap-1 w-[260px]">
                      <Button variant="outline" className="h-6 w-6 p-0 shrink-0 border-slate-300 bg-white"><Plus className="w-3 h-3 text-blue-500" /></Button>
                      <label className="text-[11px] font-medium text-slate-700 w-20 pl-2">Invoice No.</label>
                      <input type="text" className="flex-1 text-xs h-6 border border-slate-300 px-2 bg-white" value={formData.invoiceNo || ''} onChange={(e) => setFormData({...formData, invoiceNo: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-1 w-[220px]">
                      <label className="text-[11px] font-medium text-slate-700 w-16 pl-2">Inv Date</label>
                      <input type="date" className="flex-1 text-xs h-6 border border-slate-300 px-2 bg-white" value={formData.invoiceDate || ''} onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-2 w-[180px]">
                      <span className="text-[11px] font-medium text-slate-700 pl-2">TRN</span>
                      <span className="text-[11px] text-slate-700">{formData.vendorTrn || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-[320px]">
                      <label className="text-[11px] font-medium text-slate-700 w-16">Location</label>
                      <Select 
                        options={[{value:'Saudi Arabia', label:'Saudi Arabia'}, {value:'Qatar', label:'Qatar'}]}
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="flex-1 text-xs h-6 py-0 border-slate-300"
                      />
                      <Button variant="outline" className="h-6 w-6 p-0 shrink-0 border-slate-300 bg-white"><Plus className="w-3 h-3 text-blue-500" /></Button>
                    </div>
                    <div className="flex items-center gap-1 w-[260px]">
                      <Button variant="outline" className="h-6 w-6 p-0 shrink-0 border-slate-300 bg-white"><Plus className="w-3 h-3 text-blue-500" /></Button>
                      <label className="text-[11px] font-medium text-slate-700 w-20 pl-2">Paymode</label>
                      <Select 
                        options={[{value:'Credit', label:'Credit'}, {value:'Cash', label:'Cash'}]}
                        value={formData.paymode}
                        onChange={(e) => setFormData({...formData, paymode: e.target.value})}
                        className="flex-1 text-xs h-6 py-0 border-slate-300"
                      />
                    </div>
                    <div className="flex items-center gap-1 w-[220px]">
                      <label className="text-[11px] font-medium text-slate-700 w-20 pl-2 whitespace-nowrap">Returned Date</label>
                      <input type="date" className="flex-1 text-xs h-6 border border-slate-300 px-2 bg-white" value={formData.returnedOn || ''} onChange={(e) => setFormData({...formData, returnedOn: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-2 w-[180px] pl-2">
                      <input type="checkbox" className="rounded-sm border-slate-300" checked={formData.disableTax} onChange={(e) => setFormData({...formData, disableTax: e.target.checked})} />
                      <label className="text-[11px] text-slate-700">Disable Tax</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-[#f0f4f8] border-b border-slate-300 pb-2">
                <div className="text-[11px] font-bold text-slate-800 mb-2 pl-1">Product Details</div>
                
                <div className="flex flex-col gap-1.5 pl-1">
                  {/* Row 1 */}
                  <div className="flex items-end gap-1 text-[11px]">
                    <div className="flex flex-col gap-0.5 w-24">
                      <label className="text-slate-700">Code</label>
                      <input type="text" className="w-full text-xs h-6 border border-slate-300 px-1 bg-white" value={productEntry.code} onChange={(e) => updateProductEntry('code', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-0.5 w-24">
                      <label className="text-slate-700">Barcode</label>
                      <input type="text" className="w-full text-xs h-6 border border-slate-300 px-1 bg-white" value={productEntry.barcode} onChange={(e) => updateProductEntry('barcode', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-0.5 w-[240px] relative">
                      <label className="text-slate-700">Product</label>
                      <div className="flex gap-1">
                        <Select 
                          options={[{value:'', label:''}, {value:'Item A', label:'Item A'}]}
                          value={productEntry.productName}
                          onChange={(e) => updateProductEntry('productName', e.target.value)}
                          className="flex-1 text-xs h-6 py-0 border-slate-300"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5 w-24">
                      <label className="text-slate-700">Unit</label>
                      <div className="flex gap-1">
                        <Select 
                          options={[{value:'Unit', label:'[Select unit]'}, {value:'Box', label:'Box'}]}
                          value={productEntry.unit}
                          onChange={(e) => updateProductEntry('unit', e.target.value)}
                          className="flex-1 text-xs h-6 py-0 border-slate-300"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5 w-16">
                      <label className="text-slate-700">UOM</label>
                      <input type="text" className="w-full text-xs h-6 border border-slate-300 px-1 bg-white" value={productEntry.uom} onChange={(e) => updateProductEntry('uom', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-0.5 w-20">
                      <label className="text-slate-700 truncate">Curr. Cost</label>
                      <input type="number" className="w-full text-xs h-6 border border-slate-200 bg-slate-50 px-1 text-right" value={productEntry.currCost} readOnly />
                    </div>
                    <div className="flex flex-col gap-0.5 w-20">
                      <label className="text-slate-700 truncate">Curr Price</label>
                      <input type="number" className="w-full text-xs h-6 border border-slate-200 bg-slate-50 px-1 text-right" value={productEntry.currPrice} readOnly />
                    </div>
                    <div className="flex flex-col gap-0.5 w-16">
                      <label className="text-slate-700">Tax(%)</label>
                      <input type="number" className="w-full text-xs h-6 border border-slate-300 px-1 text-right bg-white" value={productEntry.taxPercent} onChange={(e) => updateProductEntry('taxPercent', parseFloat(e.target.value)||0)} />
                    </div>
                    
                    {/* Buttons cluster for row 1 */}
                    <div className="flex-1 flex justify-end pr-2">
                      <Button variant="outline" className="text-[10px] h-6 px-4 bg-slate-100 border-slate-300 text-slate-700 font-semibold shadow-sm rounded-sm">Load Purchase</Button>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="flex items-end gap-1 text-[11px]">
                    <div className="flex flex-col gap-0.5 w-16">
                      <label className="text-slate-700">Pur. Qty</label>
                      <input type="number" className="w-full text-xs h-6 border border-slate-300 px-1 text-right bg-white" value={productEntry.returnQty} onChange={(e) => updateProductEntry('returnQty', parseFloat(e.target.value)||0)} />
                    </div>
                    <div className="flex flex-col gap-0.5 w-16">
                      <label className="text-slate-700">FOC</label>
                      <input type="number" className="w-full text-xs h-6 border border-slate-300 px-1 text-right bg-white" value={productEntry.foc} onChange={(e) => updateProductEntry('foc', parseFloat(e.target.value)||0)} />
                    </div>
                    <div className="flex flex-col gap-0.5 w-24">
                      <label className="text-slate-700">Sup. Cost</label>
                      <input type="number" className="w-full text-xs h-6 border border-slate-300 px-1 text-right bg-white" value={productEntry.supCost} onChange={(e) => updateProductEntry('supCost', parseFloat(e.target.value)||0)} />
                    </div>
                    <div className="flex flex-col gap-0.5 w-24">
                      <label className="text-slate-700">Unit. Disc</label>
                      <input type="number" className="w-full text-xs h-6 border border-slate-300 px-1 text-right bg-white" value={productEntry.unitDisc} onChange={(e) => updateProductEntry('unitDisc', parseFloat(e.target.value)||0)} />
                    </div>
                    <div className="flex flex-col gap-0.5 w-24">
                      <label className="text-slate-700">Discount</label>
                      <input type="number" className="w-full text-xs h-6 border border-slate-300 px-1 text-right bg-white" value={productEntry.itemDiscount} onChange={(e) => updateProductEntry('itemDiscount', parseFloat(e.target.value)||0)} />
                    </div>
                    <div className="flex flex-col gap-0.5 w-24">
                      <label className="text-slate-700">Amount</label>
                      <input type="number" className="w-full text-xs h-6 border border-slate-200 bg-slate-50 px-1 text-right" value={productEntry.amount} readOnly />
                    </div>
                    <div className="flex flex-col gap-0.5 w-20">
                      <label className="text-slate-700">Tax</label>
                      <input type="number" className="w-full text-xs h-6 border border-slate-200 bg-slate-50 px-1 text-right" value={productEntry.taxAmount} readOnly />
                    </div>
                    <div className="flex flex-col gap-0.5 w-24">
                      <label className="text-slate-700 truncate">Amount Ind.Tax</label>
                      <input type="number" className="w-full text-xs h-6 border border-slate-200 bg-slate-50 px-1 text-right" value={productEntry.amtInclTax} readOnly />
                    </div>
                    <div className="flex flex-col gap-0.5 w-32">
                      <label className="text-slate-700">Serial #</label>
                      <input type="text" className="w-full text-xs h-6 border border-slate-300 px-1 bg-white" value={productEntry.serialNo} onChange={(e) => updateProductEntry('serialNo', e.target.value)} />
                    </div>
                    
                    {/* Buttons cluster for row 2 */}
                    <div className="flex-1 flex justify-end gap-1 pr-2">
                      <Button variant="outline" className="text-[10px] h-6 px-3 bg-slate-100 border-slate-300 text-rose-600 font-semibold shadow-sm rounded-sm"><X className="w-3 h-3 text-rose-500 mr-1" /> Remove</Button>
                      <Button variant="outline" className="text-[10px] h-6 px-3 bg-slate-100 border-slate-300 text-slate-700 font-semibold shadow-sm rounded-sm"><Edit className="w-3 h-3 text-slate-500 mr-1" /> PDT F7</Button>
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex flex-col gap-0.5 w-[500px]">
                      <label className="text-[10px] text-slate-500 leading-none">Additional Descriptions</label>
                      <input type="text" className="w-full text-xs h-6 border border-slate-300 px-1 bg-white" value={productEntry.additionalDescriptions} onChange={(e) => updateProductEntry('additionalDescriptions', e.target.value)} />
                    </div>
                    <div className="flex items-center gap-1.5 pt-4">
                      <input type="checkbox" className="rounded-sm border-slate-300" defaultChecked />
                      <label className="text-[11px] text-slate-700">Calc. Qty From Serial</label>
                    </div>
                    
                    {/* Buttons cluster for row 3 */}
                    <div className="flex-1 flex justify-end gap-1 pt-4 pr-2">
                      <Button variant="outline" className="text-[10px] h-6 px-3 bg-[#e0f2fe] border-blue-200 text-blue-700 font-semibold shadow-sm rounded-sm hover:bg-blue-100"><Plus className="w-3 h-3 text-blue-600 mr-1" /> Add (F1)</Button>
                      <Button variant="outline" className="text-[10px] h-6 px-3 bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold shadow-sm rounded-sm hover:bg-emerald-100"><Edit className="w-3 h-3 text-emerald-600 mr-1" /> Edit</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Block */}
              <div className="bg-white border border-slate-300 shadow-sm flex flex-col flex-1 min-h-[250px]">
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-[11px] whitespace-nowrap min-w-max border-collapse">
                    <thead className="bg-[#f0f4f8] font-semibold text-slate-600 border-b border-slate-300">
                      <tr>
                        <th className="p-1.5 border-r border-slate-300">SlNo</th>
                        <th className="p-1.5 border-r border-slate-300">Code</th>
                        <th className="p-1.5 border-r border-slate-300">Barcode</th>
                        <th className="p-1.5 border-r border-slate-300">Product</th>
                        <th className="p-1.5 border-r border-slate-300">UOM</th>
                        <th className="p-1.5 border-r border-slate-300 text-right">Qty</th>
                        <th className="p-1.5 border-r border-slate-300 text-right">FOC</th>
                        <th className="p-1.5 border-r border-slate-300 text-right">Tax Perc</th>
                        <th className="p-1.5 border-r border-slate-300 text-right">Sup Cost</th>
                        <th className="p-1.5 border-r border-slate-300 text-right">Unit Discount</th>
                        <th className="p-1.5 border-r border-slate-300 text-right">Item Discount</th>
                        <th className="p-1.5 border-r border-slate-300 text-right">Amount</th>
                        <th className="p-1.5 border-r border-slate-300 text-right">Tax</th>
                        <th className="p-1.5 border-r border-slate-300 text-right">Amount Incl...</th>
                        <th className="p-1.5 border-r border-slate-300">Serial No</th>
                        <th className="p-1.5">Additional De...</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {formData.items?.length === 0 ? (
                        <tr><td colSpan={16} className="p-6 text-center text-slate-500 bg-white"></td></tr>
                      ) : (
                        formData.items?.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-blue-50 cursor-pointer bg-white" onClick={() => handleEditProduct(item)}>
                            <td className="p-1.5 border-r border-slate-200 text-center">{idx + 1}</td>
                            <td className="p-1.5 border-r border-slate-200">{item.code}</td>
                            <td className="p-1.5 border-r border-slate-200">{item.barcode}</td>
                            <td className="p-1.5 border-r border-slate-200">{item.productName}</td>
                            <td className="p-1.5 border-r border-slate-200">{item.uom}</td>
                            <td className="p-1.5 border-r border-slate-200 text-right">{item.returnQty}</td>
                            <td className="p-1.5 border-r border-slate-200 text-right">{item.foc}</td>
                            <td className="p-1.5 border-r border-slate-200 text-right">{item.taxPercent}</td>
                            <td className="p-1.5 border-r border-slate-200 text-right">{item.supCost.toFixed(2)}</td>
                            <td className="p-1.5 border-r border-slate-200 text-right">{item.unitDisc.toFixed(2)}</td>
                            <td className="p-1.5 border-r border-slate-200 text-right">{item.itemDiscount.toFixed(2)}</td>
                            <td className="p-1.5 border-r border-slate-200 text-right">{item.amount.toFixed(2)}</td>
                            <td className="p-1.5 border-r border-slate-200 text-right">{item.taxAmount.toFixed(2)}</td>
                            <td className="p-1.5 border-r border-slate-200 text-right">{item.amtInclTax.toFixed(2)}</td>
                            <td className="p-1.5 border-r border-slate-200">{item.serialNo}</td>
                            <td className="p-1.5 text-slate-500 truncate max-w-[120px]">{item.additionalDescriptions}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Block: General & Totals */}
              <div className="flex gap-2 shrink-0 h-40">
                {/* Left Panel: Tabs */}
                <div className="w-[320px] bg-white border border-slate-300 rounded-sm shadow-sm flex flex-col">
                  <div className="flex bg-[#f0f4f8] border-b border-slate-300 text-[10px]">
                    <button className="px-2 py-1 font-semibold text-slate-700 bg-white border-r border-slate-300 border-t-2 border-t-blue-500">General</button>
                    <button className="px-2 py-1 text-slate-600 border-r border-slate-300">Notes</button>
                    <button className="px-2 py-1 text-slate-600 border-r border-slate-300">Approval Status</button>
                    <button className="px-2 py-1 text-slate-600">Documents</button>
                  </div>
                  <div className="flex-1 p-2 flex flex-col gap-1 text-[10px] text-blue-700 font-medium">
                    <button className="text-left hover:underline">F8 - Product Purchase History</button>
                    <button className="text-left hover:underline">F9 - Load Product From Purchase</button>
                  </div>
                </div>

                <div className="flex-1"></div>

                {/* Middle Panel: Apply Bill Discount */}
                <div className="w-[280px] bg-white border border-slate-300 rounded-sm shadow-sm flex flex-col p-3 text-[11px]">
                  <div className="text-[11px] font-bold text-slate-700 mb-2">Apply Bill Discount</div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600">Discount (%)</span>
                    <input type="number" className="w-24 border border-slate-300 rounded bg-white text-right px-1.5 py-0.5 text-slate-700" value={formData.discountPercentage} onChange={(e) => setFormData({...formData, discountPercentage: parseFloat(e.target.value)||0})} />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600">Disc Amount</span>
                    <input type="number" className="w-24 border border-slate-300 rounded bg-white text-right px-1.5 py-0.5 text-slate-700" value={formData.discountAmount} onChange={(e) => setFormData({...formData, discountAmount: parseFloat(e.target.value)||0})} />
                  </div>
                  <div className="flex justify-end mb-3">
                    <Button variant="outline" className="h-6 text-[10px] px-3 border-slate-300 bg-slate-100 text-slate-700 font-medium py-0 shadow-sm">&lt;- Apply</Button>
                  </div>
                  <div className="mt-auto">
                    <Select options={[{value:'', label:'[Select a Ledger]'}]} className="w-full text-[10px] h-7 bg-white border-slate-300 py-0" value="" />
                  </div>
                </div>

                {/* Right Panel: Totals */}
                <div className="w-[280px] bg-white border border-slate-300 rounded-sm shadow-sm flex flex-col p-3 text-[11px]">
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-center"><span className="text-slate-600">Total</span><span className="text-right font-medium">{totals.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-600">Discount</span><span className="text-right font-medium">{totals.discountTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-600">Sub Total</span><span className="text-right font-medium">{(totals.subtotal - totals.discountTotal).toFixed(2)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-600">TAX</span><span className="text-right font-medium">{totals.taxTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-600">Round off</span><input type="text" className="w-24 border border-slate-300 rounded bg-slate-50 text-right px-1.5 py-0.5 text-slate-700" value="0.00" readOnly/></div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-100 mt-1"><span className="text-slate-800 font-bold">Net Total</span><span className="font-bold text-right text-[13px]">{totals.grandTotal.toFixed(2)}</span></div>
                  </div>
                </div>
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
