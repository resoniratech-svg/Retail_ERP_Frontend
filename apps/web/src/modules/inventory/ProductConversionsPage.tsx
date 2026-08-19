import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Search, Plus, Eye, Edit2, Send, CheckSquare, XCircle, Printer, CornerUpLeft, FileText, Save } from 'lucide-react';
import { productsService } from '@qatar-erp/api';

const STORAGE_KEY = 'retail_erp_product_conversions';
const CURRENT_USER = 'Ahmed Al-Mansouri';
const WAREHOUSES = [
  { id: 'wh-01', name: 'Main Distribution Center (Doha)' },
  { id: 'wh-02', name: 'City Center Mall Branch' },
  { id: 'wh-03', name: 'Al Wakrah Retail Store' },
];

type ConversionStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

interface ProductConversion {
  id: string;
  conversionNo: string;
  conversionDate: string;
  warehouseId: string;
  warehouseName: string;
  sourceProductId: string;
  sourceProductSku: string;
  sourceProductName: string;
  sourceQuantity: number;
  sourceUOM: string;
  destinationProductId: string;
  destinationProductSku: string;
  destinationProductName: string;
  destinationQuantity: number;
  destinationUOM: string;
  reason: string;
  remarks: string;
  status: ConversionStatus;
  createdDate: string;
  createdBy: string;
}

export const ProductConversionsPage: React.FC = () => {
  const [records, setRecords] = useState<ProductConversion[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const [activeRecord, setActiveRecord] = useState<ProductConversion | null>(null);

  // Form State
  const [formWarehouse, setFormWarehouse] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formSourceProduct, setFormSourceProduct] = useState('');
  const [formSourceQty, setFormSourceQty] = useState<number>(0);
  const [formDestProduct, setFormDestProduct] = useState('');
  const [formDestQty, setFormDestQty] = useState<number>(0);
  const [formReason, setFormReason] = useState('');
  const [formRemarks, setFormRemarks] = useState('');

  useEffect(() => {
    loadData();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsService.getProducts();
      setProducts(data);
    } catch (e) {
      console.error('Failed to load products:', e);
    }
  };

  const loadData = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) setRecords(JSON.parse(data));
    } catch (e) {
      console.error(e);
    }
  };

  const saveRecords = (data: ProductConversion[]) => {
    setRecords(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const generateNo = () => {
    return `CNV-2026-${(records.length + 1).toString().padStart(4, '0')}`;
  };

  const getStatusBadge = (status: ConversionStatus) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="neutral">Draft</Badge>;
      case 'PENDING_APPROVAL': return <Badge variant="warning">Pending</Badge>;
      case 'APPROVED': return <Badge variant="info">Approved</Badge>;
      case 'COMPLETED': return <Badge variant="success">Completed</Badge>;
      case 'REJECTED': return <Badge variant="danger">Rejected</Badge>;
      case 'CANCELLED': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const openNewForm = () => {
    setActiveRecord(null);
    setFormWarehouse('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormSourceProduct('');
    setFormSourceQty(0);
    setFormDestProduct('');
    setFormDestQty(0);
    setFormReason('');
    setFormRemarks('');
    setIsFormModalOpen(true);
  };

  const handleSaveForm = (isSubmit: boolean = false) => {
    if (!formWarehouse) return alert('Warehouse is required.');
    if (!formDate) return alert('Date is required.');
    if (!formSourceProduct || !formDestProduct) return alert('Source and destination products are required.');
    if (formSourceProduct === formDestProduct) return alert('Source and destination cannot be the same product.');
    if (formSourceQty <= 0 || formDestQty <= 0) return alert('Quantities must be greater than 0.');

    const srcProd = products.find(p => p.id === formSourceProduct);
    const destProd = products.find(p => p.id === formDestProduct);
    
    if (!srcProd || !destProd) return;

    const newRecord: ProductConversion = {
      id: activeRecord?.id || Date.now().toString(),
      conversionNo: activeRecord?.conversionNo || generateNo(),
      conversionDate: formDate,
      warehouseId: formWarehouse,
      warehouseName: WAREHOUSES.find(w => w.id === formWarehouse)?.name || formWarehouse,
      sourceProductId: srcProd.id,
      sourceProductSku: srcProd.sku,
      sourceProductName: srcProd.name,
      sourceQuantity: formSourceQty,
      sourceUOM: 'PCS',
      destinationProductId: destProd.id,
      destinationProductSku: destProd.sku,
      destinationProductName: destProd.name,
      destinationQuantity: formDestQty,
      destinationUOM: 'PCS',
      reason: formReason,
      remarks: formRemarks,
      status: isSubmit ? 'PENDING_APPROVAL' : 'DRAFT',
      createdDate: activeRecord?.createdDate || new Date().toISOString(),
      createdBy: activeRecord?.createdBy || CURRENT_USER,
    };

    if (activeRecord) {
      saveRecords(records.map(r => r.id === activeRecord.id ? newRecord : r));
    } else {
      saveRecords([newRecord, ...records]);
    }
    setIsFormModalOpen(false);
  };

  const handleStatusChange = (r: ProductConversion, newStatus: ConversionStatus) => {
    saveRecords(records.map(sa => sa.id === r.id ? { ...sa, status: newStatus } : sa));
    setIsViewModalOpen(false);
  };

  const filteredRecords = records.filter(w => {
    if (statusFilter !== 'ALL' && w.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return w.conversionNo.toLowerCase().includes(q) || 
             w.sourceProductName.toLowerCase().includes(q) ||
             w.destinationProductName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {!isFormModalOpen && !isViewModalOpen && (
        <div className="flex flex-col h-full gap-2">
          <div className="flex flex-col border border-slate-300 dark:border-slate-700 rounded-sm bg-[#f1f5f9] dark:bg-slate-800 shadow-sm">
            {/* Top Action Bar */}
            <div className="flex flex-wrap items-center justify-between p-1 border-b border-slate-300 dark:border-slate-700">
              <div className="flex items-center">
                <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700">
                  <CornerUpLeft className="w-4 h-4 text-blue-800 mb-0.5" />
                  <span>Unpost</span>
                </button>
                <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700">
                  <Printer className="w-4 h-4 text-slate-600 mb-0.5" />
                  <span>Print</span>
                </button>
              </div>
              
              <div className="flex items-center gap-2 pr-2">
                <Button variant="primary" className="py-1 px-2 text-xs h-7 flex items-center gap-1 font-bold" onClick={openNewForm}>
                  <Plus className="w-3.5 h-3.5" /> New Conversion
                </Button>
              </div>
            </div>

            {/* Title Bar */}
            <div className="bg-[#e2e8f0] border-b border-slate-300 py-1 px-3 text-[12px] font-bold text-slate-800 flex justify-center">
              ProductConversions
            </div>

            {/* Search Row */}
            <div className="flex items-center gap-2 p-1.5 bg-[#f8fafc] border-b border-slate-300">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Enter text to search..." 
                  className="w-48 px-2 py-0.5 text-[11px] border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="absolute right-0 top-0 h-full px-1 border-l border-slate-300 hover:bg-slate-100 flex items-center justify-center">
                  <span className="w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-transparent border-t-slate-600"></span>
                </button>
              </div>
              <button className="px-3 py-0.5 text-[11px] bg-[#f0f4f8] border border-slate-400 shadow-[inset_1px_1px_0px_#fff] text-black hover:bg-slate-200">
                Find
              </button>
              <button className="px-3 py-0.5 text-[11px] bg-[#f0f4f8] border border-slate-400 shadow-[inset_1px_1px_0px_#fff] text-black hover:bg-slate-200" onClick={() => setSearchTerm('')}>
                Clear
              </button>
            </div>
          </div>

          <Card className="p-0 overflow-hidden shadow-sm flex-1">
            <div className="w-full h-full overflow-auto">
              <table className="w-full text-left text-sm whitespace-nowrap min-w-max">
                <thead className="bg-slate-100 uppercase text-[11px] font-semibold text-slate-700 border-b sticky top-0 z-10">
                  <tr>
                    <th className="p-4">Ref No</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Note</th>
                    <th className="p-4">Is Posted</th>
                    <th className="p-4">Location</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRecords.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono font-bold text-xs">{w.conversionNo}</td>
                      <td className="p-4">{w.conversionDate}</td>
                      <td className="p-4 font-medium">{w.remarks}</td>
                      <td className="p-4">
                        <input type="checkbox" checked={w.status === 'COMPLETED'} readOnly className="mt-0.5" />
                      </td>
                      <td className="p-4 text-xs text-slate-600">{w.warehouseName}</td>
                      <td className="p-4 text-center">
                        <Button variant="ghost" size="sm" onClick={() => { setActiveRecord(w); setIsViewModalOpen(true); }} className="h-5 w-5 p-0">
                          <Eye className="w-4 h-4 text-slate-600" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500 italic">No conversions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex items-center px-2 py-1 bg-[#f0f4f8] border border-slate-300 text-[10px] text-slate-600 shrink-0">
            <div className="flex items-center gap-2">
              <button className="hover:text-slate-800 flex items-center gap-1"><span>|◄</span></button>
              <button className="hover:text-slate-800 flex items-center gap-1"><span>◄</span></button>
              <span>ProductConversions 0 of 0</span>
              <button className="hover:text-slate-800 flex items-center gap-1"><span>►</span></button>
              <button className="hover:text-slate-800 flex items-center gap-1"><span>►|</span></button>
            </div>
          </div>
        </div>
      )}

      {isFormModalOpen && (
        <Modal isOpen onClose={() => setIsFormModalOpen(false)} title="Product Conversion" className="max-w-[1000px]">
          <div className="flex flex-col bg-[#f0f4f8]">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-1 border-b border-slate-300 bg-[#f8fafc]">
              <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700 bg-slate-200 border-slate-300 shadow-sm" onClick={() => handleSaveForm(true)}>
                <Save className="w-4 h-4 text-blue-800 mb-0.5" />
                <span>Save<br/><span className="text-[8px] text-slate-500">Ctrl + S</span></span>
              </button>
              <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700">
                <FileText className="w-4 h-4 text-slate-600 mb-0.5" />
                <span>Save & New<br/><span className="text-[8px] text-slate-500">Ctrl + N</span></span>
              </button>
              <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => handleSaveForm(false)}>
                <Save className="w-4 h-4 text-slate-600 mb-0.5" />
                <span>Save & Close<br/><span className="text-[8px] text-slate-500">Ctrl + L</span></span>
              </button>
              <div className="w-px h-8 bg-slate-300 mx-1"></div>
              <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700">
                <CheckSquare className="w-4 h-4 text-slate-600 mb-0.5" />
                <span>Post<br/><span className="text-[8px] text-slate-500">Ctrl + P</span></span>
              </button>
            </div>

            {/* Form Fields */}
            <div className="p-2 border-b border-slate-300 flex flex-wrap gap-x-6 gap-y-2 relative bg-[#f1f5f9]">
              <div className="flex items-center gap-2 w-[300px]">
                <label className="w-12 text-[11px] text-right text-slate-700">Ref #</label>
                <input type="text" value="--" readOnly className="flex-1 px-2 py-0.5 text-[11px] border border-slate-300 bg-slate-100" />
              </div>
              <div className="flex items-center gap-2 w-[400px]">
                <label className="w-16 text-[11px] text-right text-slate-700">Location</label>
                <select className="flex-1 px-2 py-0.5 text-[11px] border border-slate-300 bg-white" value={formWarehouse} onChange={(e) => setFormWarehouse(e.target.value)}>
                  <option value="">Select...</option>
                  {WAREHOUSES.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <button className="p-0.5 border border-slate-300 bg-[#f8fafc] hover:bg-slate-200 rounded text-blue-600 flex items-center justify-center">
                  <Plus className="w-3 h-3" />
                  <span className="text-[9px] ml-0.5 font-bold">F4</span>
                </button>
              </div>
              
              <div className="absolute right-4 top-2 flex items-start gap-2">
                 <label className="text-[11px] text-slate-700 mt-0.5">Note</label>
                 <textarea className="w-64 h-12 px-2 py-1 text-[11px] border border-slate-300 bg-white resize-none" value={formRemarks} onChange={e => setFormRemarks(e.target.value)}></textarea>
              </div>

              <div className="flex items-center gap-2 w-[300px]">
                <label className="w-12 text-[11px] text-right text-slate-700">Date</label>
                <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="flex-1 px-2 py-0.5 text-[11px] border border-slate-300 bg-white" />
              </div>
              <div className="flex items-center gap-2 w-[400px]">
                <div className="w-16"></div>
                <button className="px-3 py-0.5 text-[11px] bg-[#f0f4f8] border border-slate-400 shadow-[inset_1px_1px_0px_#fff] text-black hover:bg-slate-200 flex items-center gap-1">
                  <CornerUpLeft className="w-3 h-3 text-blue-600" />
                  Apply Source Cost [F1]
                </button>
              </div>
            </div>

            {/* Split Grids */}
            <div className="flex gap-2 p-2 bg-slate-200">
              {/* Source Products Grid */}
              <div className="flex-1 flex flex-col bg-white border border-slate-400 min-h-[300px]">
                <div className="bg-[#e2e8f0] px-2 py-1 text-[11px] font-bold text-slate-800 border-b border-slate-300">
                  Source Products
                </div>
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left text-[11px] whitespace-nowrap">
                    <thead className="bg-[#f8fafc] text-slate-700 border-b border-slate-300">
                      <tr>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal w-6 text-center">*</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal">Code</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal">Barcode</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal">Product</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal">Unit</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal">UOM</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal">Cost</th>
                        <th className="p-1 px-2 font-normal">Qty</th>
                        <th className="p-1 px-1 w-6 border-l border-slate-200"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-blue-50 h-6">
                        <td className="p-1 px-2 border-r border-slate-200 text-center font-bold">*</td>
                        <td className="p-1 px-2 border-r border-slate-200">
                          <input type="text" className="w-full bg-transparent outline-none focus:bg-white" />
                        </td>
                        <td className="p-1 px-2 border-r border-slate-200"></td>
                        <td className="p-1 px-2 border-r border-slate-200"></td>
                        <td className="p-1 px-2 border-r border-slate-200"></td>
                        <td className="p-1 px-2 border-r border-slate-200"></td>
                        <td className="p-1 px-2 border-r border-slate-200 text-right">
                          <input type="number" className="w-full bg-transparent outline-none text-right" />
                        </td>
                        <td className="p-1 px-1 text-center text-red-600 font-bold text-lg border-l border-slate-200 cursor-pointer hover:bg-red-50">×</td>
                      </tr>
                      {/* empty rows to fill space */}
                      {Array.from({length: 8}).map((_, i) => (
                        <tr key={i} className="h-6">
                          <td className="p-1 px-2 border-r border-slate-200 text-center"></td>
                          <td className="p-1 px-2 border-r border-slate-200"></td>
                          <td className="p-1 px-2 border-r border-slate-200"></td>
                          <td className="p-1 px-2 border-r border-slate-200"></td>
                          <td className="p-1 px-2 border-r border-slate-200"></td>
                          <td className="p-1 px-2 border-r border-slate-200"></td>
                          <td className="p-1 px-2 border-r border-slate-200"></td>
                          <td className="p-1 px-2 border-r border-slate-200"></td>
                          <td className="p-1 px-1 border-l border-slate-200"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col px-2 py-1 bg-[#f0f4f8] border-t border-slate-300 text-[10px] text-slate-600">
                  <div className="flex items-center gap-2 mb-1">
                    <button className="hover:text-slate-800">|◄</button>
                    <button className="hover:text-slate-800">◄</button>
                    <span>Product 0 of 0</span>
                    <button className="hover:text-slate-800">►</button>
                    <button className="hover:text-slate-800">►|</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>F1 to Delete Row</span>
                    <span className="font-bold text-[11px] text-black mr-2">Total Cost : <span className="ml-4">0.00</span></span>
                  </div>
                </div>
              </div>

              {/* Target Products Grid */}
              <div className="flex-1 flex flex-col bg-white border border-slate-400 min-h-[300px]">
                <div className="bg-[#e2e8f0] px-2 py-1 text-[11px] font-bold text-slate-800 border-b border-slate-300">
                  Target Products
                </div>
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left text-[11px] whitespace-nowrap">
                    <thead className="bg-[#f8fafc] text-slate-700 border-b border-slate-300">
                      <tr>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal w-6 text-center">*</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal">Code</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal">Barcode</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal">Product</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal">Unit</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal">UOM</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal">Cost</th>
                        <th className="p-1 px-2 font-normal">Qty</th>
                        <th className="p-1 px-1 w-6 border-l border-slate-200"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-blue-50 h-6">
                        <td className="p-1 px-2 border-r border-slate-200 text-center font-bold">*</td>
                        <td className="p-1 px-2 border-r border-slate-200">
                          <input type="text" className="w-full bg-transparent outline-none focus:bg-white" />
                        </td>
                        <td className="p-1 px-2 border-r border-slate-200"></td>
                        <td className="p-1 px-2 border-r border-slate-200"></td>
                        <td className="p-1 px-2 border-r border-slate-200"></td>
                        <td className="p-1 px-2 border-r border-slate-200"></td>
                        <td className="p-1 px-2 border-r border-slate-200 text-right">
                          <input type="number" className="w-full bg-transparent outline-none text-right" />
                        </td>
                        <td className="p-1 px-1 text-center text-red-600 font-bold text-lg border-l border-slate-200 cursor-pointer hover:bg-red-50">×</td>
                      </tr>
                      {/* empty rows to fill space */}
                      {Array.from({length: 8}).map((_, i) => (
                        <tr key={i} className="h-6">
                          <td className="p-1 px-2 border-r border-slate-200 text-center"></td>
                          <td className="p-1 px-2 border-r border-slate-200"></td>
                          <td className="p-1 px-2 border-r border-slate-200"></td>
                          <td className="p-1 px-2 border-r border-slate-200"></td>
                          <td className="p-1 px-2 border-r border-slate-200"></td>
                          <td className="p-1 px-2 border-r border-slate-200"></td>
                          <td className="p-1 px-2 border-r border-slate-200"></td>
                          <td className="p-1 px-2 border-r border-slate-200"></td>
                          <td className="p-1 px-1 border-l border-slate-200"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col px-2 py-1 bg-[#f0f4f8] border-t border-slate-300 text-[10px] text-slate-600">
                  <div className="flex items-center gap-2 mb-1">
                    <button className="hover:text-slate-800">|◄</button>
                    <button className="hover:text-slate-800">◄</button>
                    <span>Product 0 of 0</span>
                    <button className="hover:text-slate-800">►</button>
                    <button className="hover:text-slate-800">►|</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>F1 to Delete Row</span>
                    <span className="font-bold text-[11px] text-black mr-2">Total Cost : <span className="ml-4">0.00</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {isViewModalOpen && activeRecord && (
        <Modal isOpen onClose={() => setIsViewModalOpen(false)} title={`Conversion Details: ${activeRecord.conversionNo}`} className="max-w-[800px]">
          <div className="p-6">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{activeRecord.conversionNo}</h2>
                <p className="text-sm text-slate-500">{activeRecord.warehouseName} | {activeRecord.conversionDate}</p>
              </div>
              {getStatusBadge(activeRecord.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 border rounded-lg bg-rose-50 border-rose-100">
                <p className="text-xs font-bold text-rose-800 uppercase mb-2">Source (Decrease)</p>
                <p className="font-medium">{activeRecord.sourceProductSku} - {activeRecord.sourceProductName}</p>
                <p className="text-xl font-bold text-rose-600 mt-2">-{activeRecord.sourceQuantity} {activeRecord.sourceUOM}</p>
              </div>
              <div className="p-4 border rounded-lg bg-emerald-50 border-emerald-100">
                <p className="text-xs font-bold text-emerald-800 uppercase mb-2">Destination (Increase)</p>
                <p className="font-medium">{activeRecord.destinationProductSku} - {activeRecord.destinationProductName}</p>
                <p className="text-xl font-bold text-emerald-600 mt-2">+{activeRecord.destinationQuantity} {activeRecord.destinationUOM}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
              {activeRecord.status === 'PENDING_APPROVAL' && (
                <>
                  <Button variant="outline" onClick={() => handleStatusChange(activeRecord, 'REJECTED')}>Reject</Button>
                  <Button variant="primary" onClick={() => handleStatusChange(activeRecord, 'APPROVED')}>Approve</Button>
                </>
              )}
              {activeRecord.status === 'APPROVED' && (
                <Button variant="primary" onClick={() => handleStatusChange(activeRecord, 'COMPLETED')}>Complete Conversion</Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
