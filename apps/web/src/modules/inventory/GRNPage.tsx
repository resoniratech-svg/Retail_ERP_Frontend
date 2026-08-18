import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Modal, Select } from '@qatar-erp/ui';
import { Plus, Search, Download, Trash2, Edit, Eye, X, Save, ArrowDownToLine, RefreshCw, Printer, FolderOpen, History, Undo2, Users, CheckCircle2 } from 'lucide-react';
import { formatQAR } from '@qatar-erp/utils';
import { PurchaseOrder, poStorage } from './PurchaseOrdersPage';

// --- INLINED GRN STORAGE LOGIC ---
export interface GRNItem {
  id: string;
  slNo: number;
  code: string;
  barcode: string;
  productName: string;
  uom: string;
  quantity: number;
  foc: number;
  taxPercent: number;
  supCost: number;
  unitDiscount: number;
  itemDiscount: number;
  amount: number;
  billDiscount: number;
  taxes: number;
  cost: number;
  priceIndTax: number;
  wsPriceIndTax: number;
  amtIndTax: number;
  batchNo: string;
  expiryDate: string;
  serialNo: string;
  remarks: string;
  assignFoc: number;
  markUp: number;
  gp: number;
  wsMarkUp: number;
  wsGp: number;
  msp: number;
  wsMsp: number;
  productLevel: string;
  landingCost: number;
  poUniqueLine: string;
  priceExclTax: number;
  wsPriceExclTax: number;
  mnSlNo: string;
  additionalDesc: string;
  poRefNo: string;
  profit: number;
}

export type GRNStatus = 'DRAFT' | 'SUBMITTED' | 'RECEIVED' | 'PARTIALLY_RECEIVED' | 'CANCELLED';

export interface GRN {
  id: string;
  code: string;
  vendor: string;
  invoiceNo: string;
  invoiceDate: string;
  receivedOn: string;
  currency: string;
  location: string;
  paymode: string;
  poNo: string;
  vendorTRN: string;
  asnNumber: string;
  accInvoiceNumber: string;
  disableTax: boolean;
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
    vendor: 'Almarai Foods Qatar',
    invoiceNo: 'INV-ALM-0922',
    invoiceDate: '2026-08-11',
    receivedOn: '2026-08-12',
    currency: 'QAR',
    location: 'Main Warehouse Doha',
    paymode: 'Credit',
    poNo: 'PO-2026-001',
    vendorTRN: '1234567890',
    asnNumber: 'ASN-001',
    accInvoiceNumber: 'ACC-001',
    disableTax: false,
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

const initialFormState = {
  vendor: '',
  invoiceNo: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  receivedOn: new Date().toISOString().split('T')[0],
  currency: 'QAR',
  location: '',
  paymode: 'Credit',
  poNo: '',
  disableTax: false,
  vendorTRN: '',
  asnNumber: '',
  accInvoiceNumber: '',
  items: [] as GRNItem[]
};

export const GRNPage: React.FC = () => {
  const [grns, setGrns] = useState<GRN[]>([]);
  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  
  const [activeGRN, setActiveGRN] = useState<GRN | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  
  // Product Entry States
  const [prodEntry, setProdEntry] = useState({
    code: '', barcode: '', productName: '', unit: '', uom: '1', serialNo: '',
    purQty: 0, foc: 0, supCost: 0, unitDisc: 0, discount: 0, discPercent: 0,
    amount: 0, taxAmount: 0, amtInclTax: 0, batchNo: '', expiryDate: '', remarks: '', additionalDesc: ''
  });
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setGrns(grnStorage.getGRNs());
    setPOs(poStorage.getPurchaseOrders().filter(po => po.status !== 'DRAFT' && po.status !== 'CANCELLED' && po.status !== 'REJECTED'));
  };

  const filteredGRNs = grns.filter((grn) => {
    const matchesSearch = (grn.code || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (grn.vendor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (grn.poNo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || grn.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCreate = () => {
    setFormData(initialFormState);
    setActiveGRN(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (grn: GRN) => {
    setFormData({
      vendor: grn.vendor,
      invoiceNo: grn.invoiceNo,
      invoiceDate: grn.invoiceDate,
      receivedOn: grn.receivedOn,
      currency: grn.currency,
      location: grn.location,
      paymode: grn.paymode,
      poNo: grn.poNo,
      disableTax: grn.disableTax,
      vendorTRN: grn.vendorTRN,
      asnNumber: grn.asnNumber,
      accInvoiceNumber: grn.accInvoiceNumber,
      items: grn.items.map(item => ({ ...item }))
    });
    setActiveGRN(grn);
    setIsFormModalOpen(true);
  };

  const calculateTotals = (items: GRNItem[]) => {
    let subtotal = 0;
    let taxTotal = 0;
    items.forEach(item => {
      subtotal += item.amount;
      taxTotal += item.taxes;
    });
    return { subtotal, taxTotal, grandTotal: subtotal + taxTotal };
  };

  const saveGRN = (status: GRNStatus) => {
    const { subtotal, taxTotal, grandTotal } = calculateTotals(formData.items);
    const grn: GRN = {
      id: activeGRN ? activeGRN.id : Math.random().toString(36).substring(7),
      code: activeGRN ? activeGRN.code : grnStorage.generateGRNCode(),
      vendor: formData.vendor,
      invoiceNo: formData.invoiceNo,
      invoiceDate: formData.invoiceDate,
      receivedOn: formData.receivedOn,
      currency: formData.currency,
      location: formData.location,
      paymode: formData.paymode,
      poNo: formData.poNo,
      vendorTRN: formData.vendorTRN,
      asnNumber: formData.asnNumber,
      accInvoiceNumber: formData.accInvoiceNumber,
      disableTax: formData.disableTax,
      notes: '',
      status: status,
      items: formData.items,
      subtotal,
      taxTotal,
      grandTotal,
    };
    grnStorage.saveGRN(grn);
    setFilterStatus('ALL');
    loadData();
    setIsFormModalOpen(false);
  };

  return (
    <div className="-m-4 flex flex-col h-[calc(100vh-224px)] bg-[#e8ecef] dark:bg-slate-900 overflow-hidden font-sans">
      
      {/* Header Toolbar */}
      <div className="flex items-center gap-1 p-1 bg-white border-b border-slate-300 dark:bg-slate-800 dark:border-slate-700 shadow-sm shrink-0">
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs hover:bg-slate-100 rounded transition-colors" onClick={() => saveGRN('DRAFT')}>
          <Save className="w-4 h-4 text-blue-600" /> Save & New
        </button>
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs hover:bg-slate-100 rounded transition-colors" onClick={() => saveGRN('DRAFT')}>
          <Save className="w-4 h-4 text-emerald-600" /> Save & Close
        </button>
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs hover:bg-slate-100 rounded transition-colors" onClick={() => saveGRN('RECEIVED')}>
          <ArrowDownToLine className="w-4 h-4 text-amber-500" /> Post <span className="text-slate-400 text-[10px] ml-1">Ctrl + P</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-1.5 flex flex-col gap-1.5">
        
        {/* Invoice Details Section */}
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-sm">
          <div className="bg-[#f0f4f8] dark:bg-slate-700 px-2 py-1 border-b border-slate-300 dark:border-slate-600 flex items-center font-bold text-xs text-slate-800 dark:text-slate-200">
            Invoice Details <span className="ml-4 font-normal">Ref#: New</span>
          </div>
          <div className="p-2 grid grid-cols-1 md:grid-cols-12 gap-x-2 gap-y-1.5 text-[11px]">
            
            {/* Vendor Row */}
            <div className="col-span-12 flex items-center gap-2 flex-wrap">
              <div className="flex flex-col w-48">
                <label className="text-slate-600 mb-0.5">Vendor</label>
                <div className="flex">
                  <select className="flex-1 border border-slate-300 rounded-l px-1 py-1" value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})}>
                    <option value="">Choose Vendor</option>
                    <option value="Almarai Foods Qatar">Almarai Foods Qatar</option>
                  </select>
                  <button className="bg-slate-100 border border-l-0 border-slate-300 rounded-r px-1.5 hover:bg-slate-200"><FolderOpen className="w-3 h-3 text-slate-600"/></button>
                </div>
              </div>
              
              <div className="flex flex-col w-32">
                <label className="text-slate-600 mb-0.5">Invoice No</label>
                <input type="text" className="border border-slate-300 rounded px-1.5 py-1" value={formData.invoiceNo} onChange={e => setFormData({...formData, invoiceNo: e.target.value})} />
              </div>
              
              <div className="flex flex-col w-28">
                <label className="text-slate-600 mb-0.5">Invoice Date</label>
                <input type="date" className="border border-slate-300 rounded px-1.5 py-1" value={formData.invoiceDate} onChange={e => setFormData({...formData, invoiceDate: e.target.value})} />
              </div>
              
              <div className="flex flex-col w-28">
                <label className="text-slate-600 mb-0.5">Received On</label>
                <input type="date" className="border border-slate-300 rounded px-1.5 py-1" value={formData.receivedOn} onChange={e => setFormData({...formData, receivedOn: e.target.value})} />
              </div>
              
              <div className="flex flex-col w-24">
                <label className="text-slate-600 mb-0.5">Currency</label>
                <div className="flex gap-1">
                  <select className="w-16 border border-slate-300 rounded px-1 py-1" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                    <option value="QAR">QAR</option>
                  </select>
                  <input type="text" className="w-8 border border-slate-300 rounded px-1 py-1 text-center" value="1" readOnly />
                </div>
              </div>
              
              <div className="flex flex-col w-48">
                <label className="text-slate-600 mb-0.5">Location</label>
                <div className="flex">
                  <select className="flex-1 border border-slate-300 rounded-l px-1 py-1" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>
                    <option value="Main Warehouse Doha">Main Warehouse Doha</option>
                  </select>
                  <button className="bg-slate-100 border border-l-0 border-slate-300 rounded-r px-1.5 hover:bg-slate-200"><FolderOpen className="w-3 h-3 text-slate-600"/></button>
                </div>
              </div>
              
              <div className="flex flex-col w-24">
                <label className="text-slate-600 mb-0.5">Paymode</label>
                <select className="border border-slate-300 rounded px-1 py-1" value={formData.paymode} onChange={e => setFormData({...formData, paymode: e.target.value})}>
                  <option value="Credit">Credit</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              
              <div className="flex flex-col w-32">
                <label className="text-slate-600 mb-0.5">PO No.</label>
                <input type="text" className="border border-slate-300 rounded px-1.5 py-1" value={formData.poNo} onChange={e => setFormData({...formData, poNo: e.target.value})} />
              </div>
              
              <div className="flex items-center gap-1 w-24 mt-4">
                <input type="checkbox" id="disableTax" checked={formData.disableTax} onChange={e => setFormData({...formData, disableTax: e.target.checked})} />
                <label htmlFor="disableTax" className="text-slate-600 mb-0">Disable Tax</label>
              </div>
              
              <div className="flex flex-col w-32">
                <label className="text-slate-600 mb-0.5">Vendor TRN</label>
                <input type="text" className="border border-slate-300 rounded px-1.5 py-1" value={formData.vendorTRN} onChange={e => setFormData({...formData, vendorTRN: e.target.value})} />
              </div>
            </div>

            {/* Second Row */}
            <div className="col-span-12 flex items-center gap-2 mt-1">
              <div className="flex flex-col w-48">
                <label className="text-slate-600 mb-0.5">ASN Number</label>
                <input type="text" className="border border-slate-300 rounded px-1.5 py-1" value={formData.asnNumber} onChange={e => setFormData({...formData, asnNumber: e.target.value})} />
              </div>
              <div className="flex flex-col w-48">
                <label className="text-slate-600 mb-0.5">ACC.Invoice Number</label>
                <input type="text" className="border border-slate-300 rounded px-1.5 py-1" value={formData.accInvoiceNumber} onChange={e => setFormData({...formData, accInvoiceNumber: e.target.value})} />
              </div>
              <div className="ml-auto mt-4">
                 <button className="bg-slate-100 border border-slate-300 px-4 py-1 rounded text-slate-700 hover:bg-slate-200 shadow-sm font-medium">Load Purchase Order</button>
              </div>
            </div>
          </div>
        </div>

        {/* GRN Product Details Section (Complex Form) */}
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-sm">
          <div className="bg-[#f0f4f8] dark:bg-slate-700 px-2 py-1 border-b border-slate-300 dark:border-slate-600 flex items-center font-bold text-xs text-slate-800 dark:text-slate-200">
            GRN Product Details
          </div>
          
          <div className="p-2 flex gap-4 text-[11px] overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-slate-300">
            {/* Left Side: Inputs */}
            <div className="flex-1 flex flex-col gap-1.5 min-w-[750px]">
              <div className="flex gap-2">
                <div className="flex flex-col w-24"><label className="text-slate-600 mb-0.5">Code</label><input type="text" className="border border-slate-300 rounded px-1 py-1" value={prodEntry.code} onChange={e=>setProdEntry({...prodEntry, code:e.target.value})}/></div>
                <div className="flex flex-col w-32"><label className="text-slate-600 mb-0.5">Barcode</label><input type="text" className="border border-slate-300 rounded px-1 py-1" value={prodEntry.barcode} onChange={e=>setProdEntry({...prodEntry, barcode:e.target.value})}/></div>
                <div className="flex flex-col flex-1">
                  <label className="text-slate-600 mb-0.5">Product Name</label>
                  <div className="flex">
                    <input type="text" className="flex-1 border border-slate-300 rounded-l px-1 py-1" value={prodEntry.productName} onChange={e=>setProdEntry({...prodEntry, productName:e.target.value})}/>
                    <button className="bg-slate-100 border border-l-0 border-slate-300 px-1.5"><FolderOpen className="w-3 h-3 text-slate-600"/></button>
                    <button className="bg-slate-100 border border-l-0 border-slate-300 px-1.5"><Undo2 className="w-3 h-3 text-slate-600"/></button>
                    <button className="bg-slate-100 border border-l-0 border-slate-300 rounded-r px-1.5"><Users className="w-3 h-3 text-slate-600"/></button>
                  </div>
                </div>
                <div className="flex flex-col w-20"><label className="text-slate-600 mb-0.5">Unit</label><select className="border border-slate-300 rounded px-1 py-1"><option>Select...</option></select></div>
                <div className="flex flex-col w-16"><label className="text-slate-600 mb-0.5">UOM</label><input type="text" className="border border-slate-300 rounded px-1 py-1 text-center" value={prodEntry.uom} onChange={e=>setProdEntry({...prodEntry, uom:e.target.value})}/></div>
                <div className="flex flex-col w-24"><label className="text-slate-600 mb-0.5">Serial #</label><input type="text" className="border border-slate-300 rounded px-1 py-1" value={prodEntry.serialNo} onChange={e=>setProdEntry({...prodEntry, serialNo:e.target.value})}/></div>
              </div>

              <div className="flex gap-2">
                <div className="flex flex-col w-16"><label className="text-slate-600 mb-0.5">Pur. Qty</label><input type="number" className="border border-slate-300 rounded px-1 py-1 text-right" value={prodEntry.purQty || ''} onChange={e=>setProdEntry({...prodEntry, purQty:Number(e.target.value)})}/></div>
                <div className="flex flex-col w-12"><label className="text-slate-600 mb-0.5">FOC</label><input type="number" className="border border-slate-300 rounded px-1 py-1 text-right" value={prodEntry.foc || ''} onChange={e=>setProdEntry({...prodEntry, foc:Number(e.target.value)})}/></div>
                <div className="flex flex-col w-16"><label className="text-slate-600 mb-0.5">Sup. Cost</label><input type="number" className="border border-slate-300 rounded px-1 py-1 text-right" value={prodEntry.supCost || ''} onChange={e=>setProdEntry({...prodEntry, supCost:Number(e.target.value)})}/></div>
                <div className="flex flex-col w-16"><label className="text-slate-600 mb-0.5">Unit. Disc</label><input type="number" className="border border-slate-300 rounded px-1 py-1 text-right" value={prodEntry.unitDisc || ''} onChange={e=>setProdEntry({...prodEntry, unitDisc:Number(e.target.value)})}/></div>
                <div className="flex flex-col w-16"><label className="text-slate-600 mb-0.5">Discount</label><input type="number" className="border border-slate-300 rounded px-1 py-1 text-right" value={prodEntry.discount || ''} onChange={e=>setProdEntry({...prodEntry, discount:Number(e.target.value)})}/></div>
                <div className="flex flex-col w-12"><label className="text-slate-600 mb-0.5">Disc %</label><input type="number" className="border border-slate-300 rounded px-1 py-1 text-right" value={prodEntry.discPercent || ''} onChange={e=>setProdEntry({...prodEntry, discPercent:Number(e.target.value)})}/></div>
                <div className="flex flex-col w-20"><label className="text-slate-600 mb-0.5">Amount</label><input type="number" className="border border-slate-300 rounded px-1 py-1 text-right bg-slate-50" value={prodEntry.amount || ''} readOnly/></div>
                <div className="flex flex-col w-20"><label className="text-slate-600 mb-0.5">Tax Amount</label><input type="number" className="border border-slate-300 rounded px-1 py-1 text-right bg-slate-50" value={prodEntry.taxAmount || ''} readOnly/></div>
                <div className="flex flex-col w-20"><label className="text-slate-600 mb-0.5">Amt. Incl Tax</label><input type="number" className="border border-slate-300 rounded px-1 py-1 text-right bg-slate-50" value={prodEntry.amtInclTax || ''} readOnly/></div>
                <div className="flex flex-col w-20"><label className="text-slate-600 mb-0.5 text-slate-400">Batch #</label><input type="text" className="border border-slate-300 rounded px-1 py-1 bg-slate-50 text-slate-400" disabled/></div>
                <div className="flex flex-col w-24"><label className="text-slate-600 mb-0.5 text-slate-400">Expiry Date</label><input type="date" className="border border-slate-300 rounded px-1 py-1 bg-slate-50 text-slate-400" disabled/></div>
              </div>

              <div className="flex gap-2">
                <div className="flex flex-col flex-1 max-w-xs"><label className="text-slate-600 mb-0.5">Remarks</label><input type="text" className="border border-slate-300 rounded px-1 py-1" value={prodEntry.remarks} onChange={e=>setProdEntry({...prodEntry, remarks:e.target.value})}/></div>
                <div className="flex flex-col flex-1 max-w-md"><label className="text-slate-600 mb-0.5">Additional Descriptions</label><input type="text" className="border border-slate-300 rounded px-1 py-1" value={prodEntry.additionalDesc} onChange={e=>setProdEntry({...prodEntry, additionalDesc:e.target.value})}/></div>
                <div className="flex items-center gap-4 ml-4 mt-4 text-[11px]">
                   <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="calcMethod" defaultChecked/> Markup</label>
                   <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="calcMethod" /> GP %</label>
                </div>
              </div>
            </div>

            {/* Right Side: Options and Prices */}
            <div className="flex gap-2 pl-2 border-l border-slate-300 border-dashed shrink-0">
              {/* New Cost block */}
              <div className="flex flex-col gap-1 w-24">
                <span className="font-semibold text-slate-700 border-b border-slate-200 pb-0.5 mb-0.5">New Cost</span>
                <label className="flex justify-between items-center text-slate-500">Excl. Tax <input type="text" className="w-12 border border-slate-300 rounded px-1 py-0.5 text-right bg-slate-50" value="0.00" readOnly/></label>
                <label className="flex justify-between items-center text-slate-500">Ind. Tax <input type="text" className="w-12 border border-slate-300 rounded px-1 py-0.5 text-right bg-slate-50" value="0.00" readOnly/></label>
              </div>
              
              {/* Retail/Wholesale block */}
              <div className="flex flex-col gap-1 w-40">
                <div className="flex justify-between font-semibold text-slate-700 border-b border-slate-200 pb-0.5 mb-0.5">
                  <span className="w-16"></span><span className="w-10 text-center">Retail</span><span className="w-14 text-center">Wholesale</span>
                </div>
                <div className="flex items-center gap-1"><span className="w-8 text-slate-500">MSP</span><input type="text" className="w-14 border border-slate-300 rounded px-1 py-0.5 text-right"/><input type="text" className="w-14 border border-slate-300 rounded px-1 py-0.5 text-right"/></div>
                <div className="flex justify-center border-t border-slate-200 mt-1 pt-1"><span className="text-slate-500 text-[10px]">New Price</span></div>
                <div className="flex items-center gap-1 justify-end"><input type="text" className="w-14 border border-slate-300 rounded px-1 py-0.5 text-right"/><input type="text" className="w-14 border border-slate-300 rounded px-1 py-0.5 text-right"/></div>
                <div className="flex justify-center"><span className="text-slate-500 text-[10px]">Profit</span></div>
                <div className="flex items-center gap-1 justify-end"><input type="text" className="w-14 border border-slate-300 rounded px-1 py-0.5 text-right bg-slate-50" value="0.00" readOnly/><input type="text" className="w-14 border border-slate-300 rounded px-1 py-0.5 text-right bg-slate-50" value="0.00" readOnly/></div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-1 justify-center px-1">
                <button className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-300 rounded hover:bg-slate-100 text-slate-700"><History className="w-3 h-3 text-orange-500"/> List</button>
                <button className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-300 rounded hover:bg-slate-100 text-slate-700"><span className="w-3 font-bold text-[10px] text-blue-600">P</span> PDT <span className="text-[9px] text-slate-400">F7</span></button>
                <button className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-300 rounded hover:bg-slate-100 text-slate-700"><Plus className="w-3 h-3 text-emerald-500"/> Add <span className="text-[9px] text-slate-400">F1</span></button>
                <button className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-300 rounded hover:bg-slate-100 text-slate-700"><Edit className="w-3 h-3 text-emerald-500"/> Edit <span className="text-[9px] text-slate-400">F3</span></button>
              </div>

              {/* Current Details */}
              <div className="flex flex-col gap-1 w-36 px-2 border-l border-slate-200">
                <span className="font-semibold text-slate-700 border-b border-slate-200 pb-0.5 mb-0.5">Current Details</span>
                <div className="flex gap-1">
                   <input type="text" className="w-14 border border-slate-200 rounded px-1 py-0.5 bg-slate-50 text-slate-400" placeholder="Curr. Cost" disabled/>
                   <input type="text" className="w-14 border border-slate-200 rounded px-1 py-0.5 bg-slate-50 text-slate-400" placeholder="Tax (%)" disabled/>
                </div>
                <div className="flex gap-1 mt-2">
                   <input type="text" className="w-14 border border-slate-200 rounded px-1 py-0.5 bg-slate-50 text-slate-400" placeholder="Curr. Price" disabled/>
                   <input type="text" className="w-14 border border-slate-200 rounded px-1 py-0.5 bg-slate-50 text-slate-400" placeholder="Price Ind Tax" disabled/>
                </div>
                <input type="text" className="w-full border border-slate-200 rounded px-1 py-0.5 bg-slate-50 text-slate-400 mt-2" placeholder="Last Sup. Cost" disabled/>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-1 w-40 px-2 border-l border-slate-200 text-[10px] text-slate-700">
                <span className="font-semibold text-slate-700 border-b border-slate-200 pb-0.5 mb-0.5 text-[11px]">Options</span>
                <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" defaultChecked/> Calc. Qty From Serial Nos.</label>
                <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" /> Do not update cost</label>
                <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" /> Do not update price</label>
                <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" defaultChecked/> Alert For Same Product</label>
                <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" /> Imported purchase</label>
              </div>
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-sm overflow-hidden flex flex-col min-h-[200px]">
          <div className="px-2 py-0.5 bg-[#f0f4f8] dark:bg-slate-700 border-b border-slate-300 text-[10px] text-slate-500">
            Alt + L to Focus List
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-max text-left text-[11px] whitespace-nowrap table-fixed">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-300 text-slate-700 sticky top-0 z-10">
                <tr>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[40px]">SlNo</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[80px]">Code</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[100px]">Barcode</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[150px]">Product Name</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[60px]">UOM</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[60px] text-right">Quantity</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[50px] text-right">FOC</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[60px] text-right">Tax (%)</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[80px] text-right">Sup. Cost</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[80px] text-right">Unit Discount</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[80px] text-right">Item Discount</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[80px] text-right">Amount</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[80px] text-right">Bill Discount</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[60px] text-right">Taxes</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[80px] text-right">Cost</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[80px] text-right">Price Ind Tax</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[100px] text-right">WS Price In...</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[80px] text-right">Amt. Ind T</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[80px]">Batch No</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[80px]">Expiry Date</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[80px]">Serial No</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[100px]">Remarks</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[80px] text-right">Assign FOC</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[60px] text-right">Mark Up</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[60px] text-right">GP</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[80px] text-right">WS_Mark Up</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[60px] text-right">WS_GP</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[60px] text-right">MSP</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[60px] text-right">WSMSP</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[100px]">Product Le...</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[80px] text-right">Landing Cost</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[80px]">PO Unique ...</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[80px] text-right">Price Excl Tax</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[80px] text-right">WS Price E...</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[60px]">Mn SlNo</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[100px]">Additional ...</th>
                  <th className="p-1.5 border-r border-slate-200 font-medium min-w-[80px]">PO Ref No</th>
                  <th className="p-1.5 font-medium min-w-[80px] text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {formData.items.length === 0 ? (
                  <tr>
                    <td colSpan={38} className="p-4 text-center text-slate-500 italic bg-white h-24"></td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex gap-2 shrink-0 h-44">
          
          {/* Hotkeys block */}
          <div className="w-56 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-sm p-2 overflow-y-auto text-[10px] text-blue-800 dark:text-blue-300 font-medium font-mono leading-tight shadow-sm">
            <div>F2 - Remove Product From List</div>
            <div className="mt-1">F6 - Assign FOC</div>
            <div className="mt-1">F7 - Action History</div>
            <div className="mt-1">F8 - Product Purchase History</div>
            <div className="mt-1">F9 - Toggle Vendor Product/All Products</div>
            <div className="mt-1">F10 - Load Consignment Product</div>
            <div className="mt-1">[Ctrl+Q] - Barcode Quick Print</div>
            <div className="mt-1">[Ctrl+S] -Selected Line Serial List</div>
          </div>

          {/* Tabs Block */}
          <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-sm flex flex-col shadow-sm">
            <div className="flex border-b border-slate-300 bg-[#f0f4f8]">
              <button className="px-3 py-1 text-[11px] font-medium text-slate-700 bg-white border-r border-slate-300 border-t-2 border-t-blue-500 flex items-center gap-1">
                <FolderOpen className="w-3 h-3 text-blue-500" /> Attached Documents
              </button>
              <button className="px-3 py-1 text-[11px] font-medium text-slate-500 border-r border-slate-300 hover:bg-white flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Approval Status
              </button>
            </div>
            <div className="flex-1 p-2 flex justify-end items-end gap-1 text-slate-400">
              <div className="flex items-center gap-1 mr-1">
                <span className="text-[14px] font-bold">Ab</span>
                <Plus className="w-4 h-4 text-emerald-500" />
                <X className="w-4 h-4 text-rose-500" />
              </div>
            </div>
          </div>

          {/* Totals Block */}
          <div className="w-[500px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-sm flex flex-col shadow-sm text-[11px]">
            <div className="px-2 py-1 bg-[#f0f4f8] border-b border-slate-300 text-slate-700 flex justify-between font-semibold">
              <span>Qty : <span className="text-black">0.000</span></span>
              <span>FOC : <span className="text-black">0.000</span></span>
              <span>Total Qty : <span className="text-black">0.000(0.000)</span></span>
              <span>Total Profit : <span className="text-black">0.00</span></span>
              <span>Line Discount : <span className="text-black">0.00</span></span>
            </div>
            <div className="flex-1 p-2 flex gap-4">
              {/* Left Totals */}
              <div className="w-56 flex flex-col gap-1">
                <div className="font-semibold text-slate-700 border-b border-slate-200 pb-0.5">Apply Bill Discount</div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Disc %</span>
                  <input type="text" className="w-24 border border-slate-300 rounded px-1.5 py-0.5 text-right" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Discount</span>
                  <input type="text" className="w-24 border border-slate-300 rounded px-1.5 py-0.5 text-right" />
                </div>
                <div className="flex gap-1">
                  <select className="flex-1 border border-slate-300 rounded px-1 py-0.5">
                    <option>701007-Purchase Discounts</option>
                  </select>
                  <button className="bg-slate-100 border border-slate-300 px-1 rounded hover:bg-slate-200"><Plus className="w-3 h-3 text-blue-500"/></button>
                </div>
                <div className="flex justify-end">
                  <button className="flex items-center gap-1 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded hover:bg-slate-200 text-slate-700 shadow-sm"><Undo2 className="w-3 h-3 text-blue-500"/> Apply</button>
                </div>
              </div>
              {/* Right Totals */}
              <div className="flex-1 flex flex-col justify-between pl-4">
                <div className="flex justify-between items-center"><span className="text-slate-600">Total</span><input type="text" className="w-24 border border-slate-300 rounded bg-white text-right px-1.5 py-0.5 text-slate-700" value="0.00" readOnly/></div>
                <div className="flex justify-between items-center"><span className="text-slate-600">Discount</span><input type="text" className="w-24 border border-slate-300 rounded bg-white text-right px-1.5 py-0.5 text-slate-700" value="0.00" readOnly/></div>
                <div className="flex justify-between items-center"><span className="text-slate-600">Sub Total</span><input type="text" className="w-24 border border-slate-300 rounded bg-white text-right px-1.5 py-0.5 text-slate-700" value="0.00" readOnly/></div>
                <div className="flex justify-between items-center"><span className="text-slate-600">Tax Amount</span><input type="text" className="w-24 border border-slate-300 rounded bg-white text-right px-1.5 py-0.5 text-slate-700" value="0.00" readOnly/></div>
                <div className="flex justify-between items-center"><span className="text-slate-600">Round off</span><input type="text" className="w-24 border border-slate-300 rounded bg-white text-right px-1.5 py-0.5 text-slate-700" value="0.00" readOnly/></div>
                <div className="flex justify-between items-center"><span className="text-slate-800 font-bold">Net Total</span><input type="text" className="w-24 border border-slate-300 rounded bg-white text-right px-1.5 py-0.5 text-black font-bold" value="0.00" readOnly/></div>
              </div>
            </div>
          </div>
        </div>

      </div>
      

    </div>
  );
};
