import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Search, Plus, Eye, Edit2, Send, CheckSquare, XCircle, FileBox, Ban, Trash2, ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react';
import { productsService } from '@qatar-erp/api';

const STORAGE_KEY = 'retail_erp_wastage';
const CURRENT_USER = 'Ahmed Al-Mansouri (SUPER_ADMIN)';
const WAREHOUSES = [
  { id: 'wh-01', name: 'Main Distribution Center (Doha)' },
  { id: 'wh-02', name: 'City Center Mall Branch' },
  { id: 'wh-03', name: 'Al Wakrah Retail Store' },
];

type WastageStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'POSTED' | 'REJECTED' | 'CANCELLED';

interface WastageItem {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  unit: string;
  availableStock: number;
  quantity: number;
  unitCost: number;
  estimatedValue: number;
  reason: string;
}

interface Wastage {
  id: string;
  wastageNo: string;
  warehouseId: string;
  warehouseName: string;
  wastageDate: string;
  reason: string;
  remarks: string;
  
  items: WastageItem[];
  
  totalItems: number;
  totalEstimatedValue: number;
  
  status: WastageStatus;
  
  // Audit properties
  createdDate: string;
  createdBy: string;
  submittedDate?: string;
  submittedBy?: string;
  approvedDate?: string;
  approvedBy?: string;
  postedDate?: string;
  postedBy?: string;
  rejectedDate?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

export const WastagePage: React.FC = () => {
  const [wastages, setWastages] = useState<Wastage[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const [activeRecord, setActiveRecord] = useState<Wastage | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Form State
  const [formWarehouse, setFormWarehouse] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formReason, setFormReason] = useState('');
  const [formRemarks, setFormRemarks] = useState('');
  const [formItems, setFormItems] = useState<WastageItem[]>([]);
  
  const [selectedProduct, setSelectedProduct] = useState('');
  const [itemQuantity, setItemQuantity] = useState<number>(0);
  const [itemReason, setItemReason] = useState('');

  const [products, setProducts] = useState<any[]>([]);

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
      if (data) {
        setWastages(JSON.parse(data));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveRecords = (data: Wastage[]) => {
    setWastages(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const generateWastageNo = () => {
    const nextId = wastages.length + 1;
    return `WST-2026-${nextId.toString().padStart(4, '0')}`;
  };

  const getStatusBadge = (status: WastageStatus) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="neutral">Draft</Badge>;
      case 'PENDING_APPROVAL': return <Badge variant="warning">Pending Approval</Badge>;
      case 'APPROVED': return <Badge variant="info">Approved</Badge>;
      case 'POSTED': return <Badge variant="success">Posted</Badge>;
      case 'REJECTED': return <Badge variant="danger">Rejected</Badge>;
      case 'CANCELLED': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const openNewForm = () => {
    setActiveRecord(null);
    setFormWarehouse('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormReason('');
    setFormRemarks('');
    setFormItems([]);
    setSelectedProduct('');
    setItemQuantity(0);
    setItemReason('');
    setIsFormModalOpen(true);
  };

  const openEditForm = (record: Wastage) => {
    setActiveRecord(record);
    setFormWarehouse(record.warehouseId);
    setFormDate(record.wastageDate);
    setFormReason(record.reason);
    setFormRemarks(record.remarks);
    setFormItems(record.items);
    setSelectedProduct('');
    setItemQuantity(0);
    setItemReason('');
    setIsFormModalOpen(true);
  };

  const handleAddItem = () => {
    if (!selectedProduct) return alert('Select a product.');
    if (itemQuantity <= 0) return alert('Quantity must be greater than 0.');
    
    const product = products.find((p: any) => p.id === selectedProduct);
    if (!product) return;

    if (itemQuantity > product.stockQuantity) return alert('Quantity exceeds available stock.');
    if (formItems.some(i => i.productId === product.id)) return alert('Product already added.');

    const newItem: WastageItem = {
      id: Date.now().toString(),
      productId: product.id,
      sku: product.sku,
      productName: product.name,
      unit: 'PCS',
      availableStock: product.stockQuantity,
      quantity: itemQuantity,
      unitCost: product.costPrice,
      estimatedValue: itemQuantity * product.costPrice,
      reason: itemReason
    };

    setFormItems([...formItems, newItem]);
    setSelectedProduct('');
    setItemQuantity(0);
    setItemReason('');
  };

  const handleRemoveItem = (id: string) => {
    setFormItems(formItems.filter(i => i.id !== id));
  };

  const handleSaveForm = (isSubmit: boolean = false) => {
    if (!formWarehouse) return alert('Warehouse is required.');
    if (!formDate) return alert('Date is required.');
    if (!formReason) return alert('Reason is required.');
    if (formItems.length === 0) return alert('At least one item is required.');

    const totalEstimatedValue = formItems.reduce((acc, curr) => acc + curr.estimatedValue, 0);
    const now = new Date().toISOString();

    let updatedRecords: Wastage[];
    
    if (activeRecord) {
      // Edit mode
      const updatedRecord: Wastage = {
        ...activeRecord,
        warehouseId: formWarehouse,
        warehouseName: WAREHOUSES.find(w => w.id === formWarehouse)?.name || formWarehouse,
        wastageDate: formDate,
        reason: formReason,
        remarks: formRemarks,
        items: formItems,
        totalItems: formItems.length,
        totalEstimatedValue,
        status: isSubmit ? 'PENDING_APPROVAL' : 'DRAFT',
        submittedDate: isSubmit ? now : undefined,
        submittedBy: isSubmit ? CURRENT_USER : undefined
      };
      updatedRecords = wastages.map(r => r.id === activeRecord.id ? updatedRecord : r);
    } else {
      // New record
      const newRecord: Wastage = {
        id: Date.now().toString(),
        wastageNo: generateWastageNo(),
        warehouseId: formWarehouse,
        warehouseName: WAREHOUSES.find(w => w.id === formWarehouse)?.name || formWarehouse,
        wastageDate: formDate,
        reason: formReason,
        remarks: formRemarks,
        items: formItems,
        totalItems: formItems.length,
        totalEstimatedValue,
        status: isSubmit ? 'PENDING_APPROVAL' : 'DRAFT',
        createdDate: now,
        createdBy: CURRENT_USER,
        submittedDate: isSubmit ? now : undefined,
        submittedBy: isSubmit ? CURRENT_USER : undefined
      };
      updatedRecords = [newRecord, ...wastages];
    }

    saveRecords(updatedRecords);
    setIsFormModalOpen(false);
  };

  const handleStatusChange = (r: Wastage, newStatus: WastageStatus, reason?: string) => {
    if (newStatus === 'CANCELLED' && !confirm(`Are you sure you want to cancel wastage ${r.wastageNo}?`)) return;
    if (newStatus === 'APPROVED' && !confirm(`Approve wastage ${r.wastageNo}?`)) return;

    const updated = wastages.map(sa => {
      if (sa.id === r.id) {
        const copy = { ...sa, status: newStatus };
        const now = new Date().toISOString();
        if (newStatus === 'PENDING_APPROVAL') {
          copy.submittedBy = CURRENT_USER;
          copy.submittedDate = now;
        } else if (newStatus === 'APPROVED') {
          copy.approvedBy = CURRENT_USER;
          copy.approvedDate = now;
        } else if (newStatus === 'REJECTED') {
          copy.rejectedBy = CURRENT_USER;
          copy.rejectedDate = now;
          copy.rejectionReason = reason;
        } else if (newStatus === 'POSTED') {
          copy.postedBy = CURRENT_USER;
          copy.postedDate = now;
        }
        return copy;
      }
      return sa;
    });
    saveRecords(updated);
    setIsViewModalOpen(false);
    setIsRejecting(false);
    setRejectionReason('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this draft permanently?')) {
      saveRecords(wastages.filter(w => w.id !== id));
    }
  };

  const handleRejectSubmit = () => {
    if (!rejectionReason.trim()) {
      alert("Rejection reason is required.");
      return;
    }
    if (activeRecord) {
      handleStatusChange(activeRecord, 'REJECTED', rejectionReason);
    }
  };

  const filteredRecords = wastages.filter(w => {
    if (statusFilter !== 'ALL' && w.status !== statusFilter) return false;
    if (warehouseFilter !== 'ALL' && w.warehouseId !== warehouseFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return w.wastageNo.toLowerCase().includes(q) || 
             w.warehouseName.toLowerCase().includes(q) ||
             w.reason.toLowerCase().includes(q) ||
             w.createdBy.toLowerCase().includes(q);
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
                <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300 text-blue-800 font-medium">
                  <ArrowRight className="w-3.5 h-3.5 rotate-180 text-blue-700" />
                  <span>Unpost</span>
                </button>
              </div>
              
              <div className="flex items-center gap-2 pr-2">
                <Button variant="outline" className="py-1 px-2 text-xs h-7 flex items-center gap-1 font-bold bg-white" onClick={loadData}>
                  Refresh
                </Button>
                <Button variant="primary" className="py-1 px-2 text-xs h-7 flex items-center gap-1 font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-0" onClick={openNewForm}>
                  <Plus className="w-3.5 h-3.5" /> New Wastage
                </Button>
              </div>
            </div>

            {/* Header */}
            <div className="bg-slate-200 text-slate-700 text-center text-[11px] font-bold py-1 border-b border-slate-300">
              Wastages
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
              <table className="w-full h-full text-left text-[11px] whitespace-nowrap min-w-max border-collapse">
                <thead className="bg-slate-100 uppercase font-semibold text-slate-700 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="p-2 border-r border-slate-200 font-bold w-6"></th>
                    <th className="p-2 border-r border-slate-200">Ref No</th>
                    <th className="p-2 border-r border-slate-200">Full Ref No</th>
                    <th className="p-2 border-r border-slate-200">Date</th>
                    <th className="p-2 border-r border-slate-200 text-right">Amount</th>
                    <th className="p-2 border-r border-slate-200">Location</th>
                    <th className="p-2">Posted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length > 0 ? filteredRecords.map((w, idx) => (
                    <tr key={w.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}>
                      <td className="p-1 px-2 border-r border-slate-200 text-center font-bold text-slate-400">
                         {/* Empty selection indicator column */}
                      </td>
                      <td className="p-1 px-2 border-r border-slate-200 text-blue-600">{w.wastageNo}</td>
                      <td className="p-1 px-2 border-r border-slate-200">{w.wastageNo}</td>
                      <td className="p-1 px-2 border-r border-slate-200">{w.wastageDate}</td>
                      <td className="p-1 px-2 border-r border-slate-200 text-right">{w.totalEstimatedValue.toFixed(4)}</td>
                      <td className="p-1 px-2 border-r border-slate-200">{w.warehouseName}</td>
                      <td className="p-1 px-2">
                        {w.status === 'POSTED' ? <CheckSquare className="w-3.5 h-3.5 text-slate-700" /> : ''}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-500 italic">
                        No records found.
                      </td>
                    </tr>
                  )}
                  {/* Filler row */}
                  <tr className="h-full">
                    <td colSpan={7} className="border-r border-slate-200"></td>
                  </tr>
                </tbody>
                {/* Table Footer */}
                <tfoot className="sticky bottom-0 bg-slate-100 border-t border-slate-300 z-10 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
                  <tr>
                    <td colSpan={4}></td>
                    <td className="p-1 align-middle text-right border-r border-slate-200">
                      <input 
                        type="text" 
                        value="0.0000" 
                        readOnly 
                        className="w-full min-w-[70px] max-w-[100px] ml-auto px-2 py-1 text-xs text-right border border-slate-300 bg-white font-bold text-slate-800" 
                      />
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          {/* Bottom Navigation Strip */}
          <div className="flex items-center gap-1 px-2 py-1 bg-[#e2e8f0] border-t border-slate-300 text-[11px] text-slate-700 shrink-0">
            <button className="px-1.5 hover:bg-slate-300 rounded font-bold">|&lt;&lt;</button>
            <button className="px-1.5 hover:bg-slate-300 rounded font-bold">&lt;&lt;</button>
            <span className="mx-1">Wastages 0 of {filteredRecords.length}</span>
            <button className="px-1.5 hover:bg-slate-300 rounded font-bold">&gt;&gt;</button>
            <button className="px-1.5 hover:bg-slate-300 rounded font-bold">&gt;&gt;|</button>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT FORM (POPUP) --- */}
      {isFormModalOpen && (
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={activeRecord ? `Wastage: ${activeRecord.wastageNo}` : "New Wastage"}
          className="max-w-[1200px]"
        >
          <div className="relative bg-[#f0f4f8] flex flex-col h-[80vh] w-full border border-slate-300 dark:border-slate-800 shadow-sm">
            {/* Top Action Bar */}
            <div className="flex items-center gap-1 px-2 py-1 bg-[#f1f5f9] border-b border-slate-300">
              <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => handleSaveForm(false)}>
                <FileBox className="w-4 h-4 text-blue-600 mb-0.5" />
                <span>Save & New<br/><span className="text-[9px] text-slate-400">Ctrl + N</span></span>
              </button>
              <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => handleSaveForm(false)}>
                <XCircle className="w-4 h-4 text-rose-600 mb-0.5" />
                <span>Save & Close<br/><span className="text-[9px] text-slate-400">Ctrl + L</span></span>
              </button>
              <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => handleSaveForm(true)}>
                <FileBox className="w-4 h-4 text-orange-500 mb-0.5" />
                <span>Post<br/><span className="text-[9px] text-slate-400">Ctrl + P</span></span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-2 bg-[#f0f4f8] flex flex-col gap-2 [&::-webkit-scrollbar]:hidden">
              <div className="font-bold text-[13px] text-slate-800 pl-1 mb-1 border-b border-slate-300 pb-1">
                Ref #: {activeRecord ? activeRecord.wastageNo : 'New'}
              </div>
              
              {/* Form Section */}
              <div className="bg-[#f0f4f8] pb-2 flex flex-col gap-2 border-b border-slate-300">
                {/* Row 1 */}
                <div className="flex items-end gap-2 pl-1">
                  <div className="flex flex-col gap-1 w-[120px]">
                    <label className="text-[11px] font-medium text-slate-700">Barcode</label>
                    <input type="text" className="w-full text-xs h-6 border border-slate-300 px-2 bg-white" />
                  </div>
                  <div className="flex flex-col gap-1 w-[120px]">
                    <label className="text-[11px] font-medium text-slate-700">Code</label>
                    <input type="text" className="w-full text-xs h-6 border border-slate-300 px-2 bg-white" />
                  </div>
                  <div className="flex flex-col gap-1 w-[200px]">
                    <label className="text-[11px] font-medium text-slate-700">Item Name</label>
                    <select 
                      value={selectedProduct} 
                      onChange={(e) => setSelectedProduct(e.target.value)} 
                      className="w-full text-xs h-6 border border-slate-300 px-1 bg-white text-slate-600"
                    >
                      <option value=""></option>
                      {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center pb-1"><RefreshCw className="w-3.5 h-3.5 text-emerald-600" /></div>
                  <div className="flex flex-col gap-1 w-[130px]">
                    <label className="text-[11px] font-medium text-slate-700">Wastage Unit</label>
                    <select className="w-full text-xs h-6 border border-slate-300 px-1 bg-white text-slate-600">
                      <option value="">[Unit]</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 w-[100px]">
                    <label className="text-[11px] font-medium text-slate-700">Quantity</label>
                    <input type="number" min="1" value={itemQuantity || ''} onChange={(e) => setItemQuantity(parseInt(e.target.value) || 0)} className="w-full text-xs h-6 border border-slate-300 px-2 bg-white" />
                  </div>
                  <div className="flex flex-col gap-1 w-[200px]">
                    <label className="text-[11px] font-medium text-slate-700">Wastage Category</label>
                    <select 
                      value={itemReason} 
                      onChange={(e) => setItemReason(e.target.value)} 
                      className="w-full text-xs h-6 border border-slate-300 px-1 bg-white text-slate-600"
                    >
                      <option value="">Choose a Wastage Category</option>
                      <option value="Damaged during transit">Damaged during transit</option>
                      <option value="Expired">Expired</option>
                      <option value="Spoilage">Spoilage</option>
                      <option value="Theft">Theft</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <Button variant="outline" onClick={handleAddItem} className="h-6 px-4 text-[11px] font-medium bg-[#f0f4f8] border-slate-400 text-black shadow-[inset_1px_1px_0px_#fff]">
                     Add (F1)
                  </Button>
                </div>

                {/* Row 2 */}
                <div className="flex items-end gap-2 pl-1 mt-1">
                  <div className="flex flex-col gap-1 w-[60px]">
                    <label className="text-[11px] font-medium text-slate-700">UOM</label>
                    <input type="text" disabled value="1" className="w-full text-xs h-6 border border-slate-300 px-2 bg-slate-100" />
                  </div>
                  <div className="flex flex-col gap-1 w-[90px]">
                    <label className="text-[11px] font-medium text-slate-700">Cost</label>
                    <input type="text" disabled className="w-full text-xs h-6 border border-slate-300 px-2 bg-slate-100" />
                  </div>
                  <div className="flex flex-col gap-1 w-[90px]">
                    <label className="text-[11px] font-medium text-slate-700">Price</label>
                    <input type="text" disabled className="w-full text-xs h-6 border border-slate-300 px-2 bg-slate-100" />
                  </div>
                  <div className="flex flex-col gap-1 w-[80px]">
                    <label className="text-[11px] font-medium text-slate-700">Tax(%)</label>
                    <input type="text" disabled className="w-full text-xs h-6 border border-slate-300 px-2 bg-slate-100" />
                  </div>
                  <div className="flex flex-col gap-1 w-[90px]">
                    <label className="text-[11px] font-medium text-slate-700">Price Incl Tax</label>
                    <input type="text" disabled className="w-full text-xs h-6 border border-slate-300 px-2 bg-slate-100" />
                  </div>
                  <div className="flex flex-col gap-1 w-[385px]">
                    <label className="text-[11px] font-medium text-slate-700">Line Remark</label>
                    <input type="text" className="w-full text-xs h-6 border border-slate-300 px-2 bg-white" />
                  </div>
                  <Button variant="outline" className="h-6 px-4 text-[11px] font-medium bg-[#f0f4f8] border-slate-400 text-black shadow-[inset_1px_1px_0px_#fff] min-w-[75px]">
                     Remove
                  </Button>
                </div>

                {/* Row 3 */}
                <div className="flex items-start gap-4 pl-1 mt-3">
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1">
                        <label className="text-[11px] font-medium text-slate-700 w-[40px]">Date</label>
                        <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-[120px] text-xs h-6 border border-slate-300 px-2 bg-white" />
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <label className="text-[11px] font-medium text-slate-700 w-[50px]">Location</label>
                        <select value={formWarehouse} onChange={(e) => setFormWarehouse(e.target.value)} className="w-[150px] text-xs h-6 border border-slate-300 px-1 bg-white text-slate-600">
                          {WAREHOUSES.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <label className="text-[11px] font-medium text-slate-700 w-[40px] pt-1">Note</label>
                      <textarea 
                        value={formRemarks} 
                        onChange={(e) => setFormRemarks(e.target.value)} 
                        className="w-[332px] text-xs border border-slate-300 p-1 bg-white h-[45px] resize-none" 
                      />
                    </div>
                  </div>

                  <div className="border border-slate-300 p-2 pt-0 pb-3 bg-[#f0f4f8] relative ml-4 mt-2">
                    <div className="text-[10px] text-slate-500 absolute -top-2 left-2 bg-[#f0f4f8] px-1 font-semibold">Load Bad Return Products From Sales Return</div>
                    <div className="flex items-end gap-2 mt-4">
                      <div className="flex flex-col gap-1">
                         <label className="text-[10px] text-slate-500">Date From</label>
                         <input type="date" value={formDate} readOnly className="w-[110px] text-xs h-6 border border-slate-300 px-2 bg-white" />
                      </div>
                      <div className="flex flex-col gap-1">
                         <label className="text-[10px] text-slate-500">To</label>
                         <input type="date" value={formDate} readOnly className="w-[110px] text-xs h-6 border border-slate-300 px-2 bg-white" />
                      </div>
                      <button className="flex items-center justify-center gap-1 px-3 h-6 border border-slate-400 bg-gradient-to-b from-[#fdfdfd] to-[#e6e6e6] shadow-[inset_1px_1px_0px_#fff] text-[11px] rounded text-black font-medium">
                        <FileBox className="w-3.5 h-3.5 text-yellow-600" />
                        Load
                      </button>
                    </div>
                  </div>
                  
                  <button className="mt-8 flex items-center justify-center gap-1 px-3 h-6 border border-slate-400 bg-[#f0f4f8] shadow-[inset_1px_1px_0px_#fff] text-[11px] text-black font-medium">
                    <ShieldAlert className="w-3.5 h-3.5 text-blue-800" />
                    PDT
                  </button>
                </div>
              </div>

              {/* Table Area */}
              <div className="flex-1 min-h-[250px] bg-white border border-slate-300 rounded-sm relative flex flex-col mt-2">
                <div className="flex-1 overflow-auto flex flex-col relative">
                  <table className="w-full h-full text-left text-[11px] whitespace-nowrap min-w-max border-collapse">
                    <thead className="bg-slate-100 uppercase font-semibold text-slate-700 border-b border-slate-300 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="p-2 border-r border-slate-200">Code</th>
                        <th className="p-2 border-r border-slate-200">Barcode</th>
                        <th className="p-2 border-r border-slate-200">Product</th>
                        <th className="p-2 border-r border-slate-200">Unit</th>
                        <th className="p-2 border-r border-slate-200">UOM</th>
                        <th className="p-2 border-r border-slate-200 text-right">Qty</th>
                        <th className="p-2 border-r border-slate-200 text-right">Cost</th>
                        <th className="p-2 border-r border-slate-200 text-right">Amount</th>
                        <th className="p-2 border-r border-slate-200">Remarks</th>
                        <th className="p-2">Wastage Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formItems.length > 0 ? formItems.map((item, idx) => (
                        <tr key={item.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                          <td className="p-1 px-2 border-r border-slate-200">{item.sku}</td>
                          <td className="p-1 px-2 border-r border-slate-200">{item.sku}</td>
                          <td className="p-1 px-2 border-r border-slate-200">{item.productName}</td>
                          <td className="p-1 px-2 border-r border-slate-200">{item.unit}</td>
                          <td className="p-1 px-2 border-r border-slate-200">1</td>
                          <td className="p-1 px-2 border-r border-slate-200 text-right">{item.quantity}</td>
                          <td className="p-1 px-2 border-r border-slate-200 text-right">{item.unitCost.toFixed(4)}</td>
                          <td className="p-1 px-2 border-r border-slate-200 text-right font-bold text-slate-800">{item.estimatedValue.toFixed(4)}</td>
                          <td className="p-1 px-2 border-r border-slate-200">{item.reason || ''}</td>
                          <td className="p-1 px-2">{item.reason || ''}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={10} className="p-4 text-center text-slate-500 italic"></td></tr>
                      )}
                      <tr className="h-full">
                        <td colSpan={10}></td>
                      </tr>
                    </tbody>
                    <tfoot className="sticky bottom-0 bg-slate-100 border-t border-slate-300 z-10 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
                      <tr>
                        <td colSpan={7}></td>
                        <td className="p-1 align-middle text-right border-r border-slate-200">
                          <input 
                            type="text" 
                            value={formItems.reduce((acc, curr) => acc + curr.estimatedValue, 0).toFixed(4)} 
                            readOnly 
                            className="w-full min-w-[70px] max-w-[100px] ml-auto px-2 py-1 text-xs text-right border border-slate-300 bg-white font-bold text-slate-800" 
                          />
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="flex items-center gap-4 px-2 py-1 bg-[#e2e8f0] border-t border-slate-300 text-[10px] text-blue-700 shrink-0 font-medium h-6">
              <span>[F3] - Attach Documents</span>
              <span>[F4] - View Attached Documents</span>
            </div>
          </div>
        </Modal>
      )}

      {/* --- VIEW / REVIEW MODAL --- */}
      {isViewModalOpen && activeRecord && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Wastage Details: ${activeRecord.wastageNo}`}
          className="max-w-[1000px]"
        >
          <div className="w-full p-4 md:p-6 overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">{activeRecord.wastageNo}</h2>
                <p className="text-sm text-slate-500">Warehouse: <span className="font-semibold text-slate-700">{activeRecord.warehouseName}</span></p>
                <p className="text-xs text-slate-500">Date: {activeRecord.wastageDate}</p>
                <p className="text-xs text-slate-800 font-semibold mt-2">Primary Reason: {activeRecord.reason}</p>
              </div>
              {getStatusBadge(activeRecord.status)}
            </div>
            
            {(activeRecord.remarks || activeRecord.rejectionReason) && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                {activeRecord.remarks && <p className="text-sm"><span className="font-bold">Remarks:</span> {activeRecord.remarks}</p>}
                {activeRecord.rejectionReason && <p className="text-sm mt-2 pt-2 border-t border-rose-200 text-rose-700"><span className="font-bold">Rejection Reason:</span> {activeRecord.rejectionReason}</p>}
              </div>
            )}

            <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Wastage Items</h3>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto mb-8">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="p-3">Product / SKU</th>
                    <th className="p-3 text-right">Available Stock</th>
                    <th className="p-3 text-right">Wastage Qty</th>
                    <th className="p-3 text-right">Unit Cost</th>
                    <th className="p-3 text-right">Est. Value</th>
                    <th className="p-3">Specific Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activeRecord.items.map(item => (
                    <tr key={item.id}>
                      <td className="p-3">
                        <div className="font-mono">{item.sku}</div>
                        <div className="font-medium text-slate-700">{item.productName}</div>
                      </td>
                      <td className="p-3 text-right text-slate-500">{item.availableStock}</td>
                      <td className="p-3 text-right font-bold text-rose-600">{item.quantity}</td>
                      <td className="p-3 text-right">${item.unitCost.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-slate-700">${item.estimatedValue.toFixed(2)}</td>
                      <td className="p-3 text-slate-600">{item.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 font-bold text-slate-700">
                  <tr>
                    <td colSpan={4} className="p-3 text-right">Total Estimated Loss:</td>
                    <td className="p-3 text-right text-rose-700">${activeRecord.totalEstimatedValue.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Audit Information</h3>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Created</span>
                <span className="font-medium">{activeRecord.createdBy} <span className="text-xs text-slate-400">({new Date(activeRecord.createdDate).toLocaleString()})</span></span>
              </div>
              {activeRecord.submittedBy && (
                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Submitted</span>
                  <span className="font-medium">{activeRecord.submittedBy} <span className="text-xs text-slate-400">({new Date(activeRecord.submittedDate!).toLocaleString()})</span></span>
                </div>
              )}
              {activeRecord.approvedBy && (
                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Approved By</span>
                  <span className="font-medium">{activeRecord.approvedBy} <span className="text-xs text-slate-400">({new Date(activeRecord.approvedDate!).toLocaleString()})</span></span>
                </div>
              )}
              {activeRecord.rejectedBy && (
                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Rejected By</span>
                  <span className="font-medium text-rose-600">{activeRecord.rejectedBy} <span className="text-xs text-rose-400">({new Date(activeRecord.rejectedDate!).toLocaleString()})</span></span>
                </div>
              )}
              {activeRecord.postedBy && (
                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Posted By</span>
                  <span className="font-medium text-emerald-600">{activeRecord.postedBy} <span className="text-xs text-emerald-400">({new Date(activeRecord.postedDate!).toLocaleString()})</span></span>
                </div>
              )}
            </div>

            {isRejecting ? (
              <div className="mt-6 p-4 border border-rose-200 bg-rose-50 rounded-lg">
                <h4 className="font-bold text-rose-800 mb-2">Provide Rejection Reason</h4>
                <Input 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                />
                <div className="mt-4 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsRejecting(false)}>Cancel</Button>
                  <Button variant="primary" className="bg-rose-600 hover:bg-rose-700" onClick={handleRejectSubmit}>Confirm Reject</Button>
                </div>
              </div>
            ) : (
              <div className="mt-8 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                {activeRecord.status === 'PENDING_APPROVAL' && (
                  <>
                    <Button variant="primary" className="bg-rose-600 hover:bg-rose-700" onClick={() => setIsRejecting(true)}>Reject</Button>
                    <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusChange(activeRecord, 'APPROVED')}>Approve</Button>
                  </>
                )}
                {activeRecord.status === 'APPROVED' && (
                  <Button variant="primary" onClick={() => handleStatusChange(activeRecord, 'POSTED')}>Post Transaction</Button>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

    </div>
  );
};
