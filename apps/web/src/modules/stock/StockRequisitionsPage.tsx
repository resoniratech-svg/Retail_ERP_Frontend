import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Plus, Search, Eye, Edit, Trash2, Power, CheckCircle, Package, ArrowRight, XCircle, FileBox, RefreshCw } from 'lucide-react';
import { productsService } from '@qatar-erp/api';
import { Product, Warehouse } from '@qatar-erp/types';

const STORAGE_KEY = 'retail_erp_stock_requisitions';
const WAREHOUSES_KEY = 'retail_erp_warehouses';
const CURRENT_USER = 'Ahmed Al-Mansouri (SUPER_ADMIN)';

type RequisitionStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'FULFILLED' | 'CANCELLED';

interface RequisitionItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  availableStock: number;
  requestedQty: number;
  requiredQty?: number;
  unit: string;
  remarks?: string;
}

interface StockRequisition {
  id: string;
  requisitionNo: string;
  sourceWarehouseId: string; // The requesting warehouse
  sourceWarehouseName: string;
  destWarehouseId: string; // The required/destination warehouse
  destWarehouseName: string;
  requestedBy: string;
  requestDate: string;
  requiredDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  reference: string;
  notes: string;
  items: RequisitionItem[];
  status: RequisitionStatus;
  
  // Audit properties
  createdDate: string;
  submittedDate?: string;
  approvedDate?: string;
  approvedBy?: string;
  rejectedDate?: string;
  rejectedBy?: string;
  fulfilledDate?: string;
  fulfilledBy?: string;
}

const DEFAULT_REQUISITIONS: StockRequisition[] = [
  {
    id: 'req-2026-001',
    requisitionNo: 'SR-2026-001',
    sourceWarehouseId: 'wh-doh-01',
    sourceWarehouseName: 'Doha Central Depot',
    destWarehouseId: 'wh-ray-02',
    destWarehouseName: 'Al Rayyan Mall Storage',
    requestedBy: 'Nasser Al-Kaabi',
    requestDate: '2026-08-11',
    requiredDate: '2026-08-15',
    priority: 'HIGH',
    reference: 'Restock electronic department',
    notes: 'Need this urgently before weekend.',
    items: [{ id: 'item-1', productId: 'prod-1', productName: 'Sample SKU', sku: 'SKU-001', availableStock: 100, requestedQty: 50, requiredQty: 50, unit: 'Pcs' }],
    status: 'PENDING_APPROVAL',
    createdDate: '2026-08-11T10:00:00Z',
    submittedDate: '2026-08-11T10:05:00Z'
  },
  {
    id: 'req-2026-002',
    requisitionNo: 'SR-2026-002',
    sourceWarehouseId: 'wh-wak-03',
    sourceWarehouseName: 'Al Wakrah Storage',
    destWarehouseId: 'wh-doh-01',
    destWarehouseName: 'Doha Central Depot',
    requestedBy: 'Salim Al-Hajri',
    requestDate: '2026-08-10',
    requiredDate: '2026-08-12',
    priority: 'MEDIUM',
    reference: 'Monthly bulk transfer',
    notes: '',
    items: [{ id: 'item-2', productId: 'prod-2', productName: 'Sample SKU 2', sku: 'SKU-002', availableStock: 200, requestedQty: 100, requiredQty: 100, unit: 'Pcs' }],
    status: 'APPROVED',
    createdDate: '2026-08-10T09:00:00Z',
    submittedDate: '2026-08-10T09:10:00Z',
    approvedDate: '2026-08-10T14:30:00Z',
    approvedBy: 'Regional Manager'
  }
];

export const StockRequisitionsPage: React.FC = () => {
  const [requisitions, setRequisitions] = useState<StockRequisition[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeReq, setActiveReq] = useState<StockRequisition | null>(null);
  
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<Partial<StockRequisition>>({ priority: 'MEDIUM', items: [] });
  const [newItem, setNewItem] = useState<Partial<RequisitionItem>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const whData = localStorage.getItem(WAREHOUSES_KEY);
      if (whData) setWarehouses(JSON.parse(whData));
    } catch (e) {
      console.error(e);
    }
    
    setProducts(productsService.getProductsSync());

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setRequisitions(JSON.parse(saved));
      } else {
        setRequisitions(DEFAULT_REQUISITIONS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REQUISITIONS));
      }
    } catch (e) {
      setRequisitions(DEFAULT_REQUISITIONS);
    }
  };

  const saveRequisitions = (data: StockRequisition[]) => {
    setRequisitions(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const getStatusBadge = (status: RequisitionStatus) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="neutral">Draft</Badge>;
      case 'PENDING_APPROVAL': return <Badge variant="warning">Pending Approval</Badge>;
      case 'APPROVED': return <Badge variant="success">Approved</Badge>;
      case 'REJECTED': return <Badge variant="danger">Rejected</Badge>;
      case 'FULFILLED': return <Badge variant="info">Fulfilled</Badge>;
      case 'CANCELLED': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleOpenNew = () => {
    setFormError('');
    setFormData({
      requisitionNo: `SR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceWarehouseId: '',
      destWarehouseId: '',
      priority: 'MEDIUM',
      reference: '',
      notes: '',
      items: [],
      status: 'DRAFT',
      requestDate: new Date().toISOString().split('T')[0],
      requiredDate: '',
      requestedBy: CURRENT_USER,
      createdDate: new Date().toISOString()
    });
    setNewItem({});
    setIsFormModalOpen(true);
  };

  const handleEdit = (r: StockRequisition) => {
    setFormError('');
    setFormData(JSON.parse(JSON.stringify(r)));
    setNewItem({});
    setIsFormModalOpen(true);
  };

  const handleDelete = (r: StockRequisition) => {
    if (confirm(`Are you sure you want to delete requisition ${r.requisitionNo}?`)) {
      saveRequisitions(requisitions.filter(req => req.id !== r.id));
    }
  };

  const handleStatusChange = (r: StockRequisition, newStatus: RequisitionStatus) => {
    const updated = requisitions.map(req => {
      if (req.id === r.id) {
        const reqCopy = { ...req, status: newStatus };
        const now = new Date().toISOString();
        if (newStatus === 'APPROVED') {
          reqCopy.approvedBy = CURRENT_USER;
          reqCopy.approvedDate = now;
        } else if (newStatus === 'REJECTED') {
          reqCopy.rejectedBy = CURRENT_USER;
          reqCopy.rejectedDate = now;
        } else if (newStatus === 'FULFILLED') {
          // As per architecture review: No warehouse-specific stock structure exists yet.
          // Therefore, we only change status and DO NOT deduct from global stock to avoid data inconsistency.
          reqCopy.fulfilledBy = CURRENT_USER;
          reqCopy.fulfilledDate = now;
        } else if (newStatus === 'PENDING_APPROVAL') {
          reqCopy.submittedDate = now;
        }
        return reqCopy;
      }
      return req;
    });
    saveRequisitions(updated);
  };

  const handleSaveForm = (submitAsStatus: RequisitionStatus) => {
    setFormError('');
    if (!formData.sourceWarehouseId) return setFormError('Requesting Warehouse is required.');
    if (!formData.destWarehouseId) return setFormError('Destination Warehouse is required.');
    if (formData.sourceWarehouseId === formData.destWarehouseId) return setFormError('Requesting and Destination Warehouses cannot be the same.');
    if (!formData.requestDate) return setFormError('Request Date is required.');
    
    if (formData.requiredDate && new Date(formData.requiredDate) < new Date(formData.requestDate)) {
      return setFormError('Required Date cannot be earlier than Request Date.');
    }
    
    if (!formData.items || formData.items.length === 0) return setFormError('At least one item is required.');

    const sourceWh = warehouses.find(w => w.id === formData.sourceWarehouseId);
    const destWh = warehouses.find(w => w.id === formData.destWarehouseId);

    const payload: StockRequisition = {
      ...(formData as StockRequisition),
      id: formData.id || `req-${Date.now()}`,
      sourceWarehouseName: sourceWh?.name || 'Unknown',
      destWarehouseName: destWh?.name || 'Unknown',
      status: submitAsStatus,
      submittedDate: submitAsStatus === 'PENDING_APPROVAL' && !formData.submittedDate ? new Date().toISOString() : formData.submittedDate
    };

    if (formData.id) {
      saveRequisitions(requisitions.map(req => req.id === formData.id ? payload : req));
    } else {
      saveRequisitions([payload, ...requisitions]);
    }
    setIsFormModalOpen(false);
  };

  const handleAddItem = () => {
    if (!newItem.productId || !newItem.requestedQty || newItem.requestedQty <= 0) {
      alert("Please select a product and enter a valid quantity greater than 0.");
      return;
    }
    const prod = products.find(p => p.id === newItem.productId);
    if (!prod) return;
    
    if (formData.items?.some(i => i.productId === prod.id)) {
      alert("Product already exists in this requisition.");
      return;
    }

    const item: RequisitionItem = {
      id: `itm-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      availableStock: prod.stockQuantity, // Note: Global stock reference as warehouse level is missing
      requestedQty: newItem.requestedQty,
      requiredQty: newItem.requestedQty, // Default required matches requested
      unit: prod.unit || 'Pcs',
      remarks: newItem.remarks
    };

    setFormData({ ...formData, items: [...(formData.items || []), item] });
    setNewItem({});
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData({ ...formData, items: formData.items?.filter(i => i.id !== itemId) });
  };

  const filteredRequisitions = requisitions.filter(req => {
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return req.requisitionNo.toLowerCase().includes(q) || 
             req.sourceWarehouseName.toLowerCase().includes(q) ||
             req.destWarehouseName.toLowerCase().includes(q) ||
             req.requestedBy.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {!isViewModalOpen && !isFormModalOpen && (
        <div className="flex flex-col h-full gap-2">
          <div className="flex flex-col border border-slate-300 dark:border-slate-700 rounded-sm bg-[#f1f5f9] dark:bg-slate-800 shadow-sm">
            {/* Top Action Bar */}
            <div className="flex flex-wrap items-center justify-between p-1 border-b border-slate-300 dark:border-slate-700">
              <div className="flex items-center">
                 {/* Left side empty in Stock Requisitions */}
              </div>
              <div className="flex items-center gap-2 pr-2">
                <Button variant="outline" className="py-1 px-2 text-xs h-7 flex items-center gap-1 font-bold bg-white" onClick={loadData}>
                  Refresh
                </Button>
                <Button variant="primary" className="py-1 px-2 text-xs h-7 flex items-center gap-1 font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-0" onClick={handleOpenNew}>
                  <Plus className="w-3.5 h-3.5" /> New Stock Requisition
                </Button>
              </div>
            </div>

            {/* Header */}
            <div className="bg-slate-200 text-slate-700 text-center text-[11px] font-bold py-1 border-b border-slate-300">
              Stock Requisitions
            </div>

            {/* Search Bar Row */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900 border-b border-slate-300">
              <div className="relative w-[300px] ml-1">
                <input
                  type="text"
                  placeholder="Enter text to search..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-2 pr-8 py-1 text-xs border border-slate-300 bg-white focus:outline-none"
                />
                <div className="absolute right-0 top-0 bottom-0 w-6 border-l border-slate-300 flex items-center justify-center bg-slate-100 cursor-pointer">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <Button variant="outline" className="h-6 px-4 text-[11px] font-bold bg-white border-slate-300 text-black shadow-[inset_1px_1px_0px_#fff]">
                 Find
              </Button>
              <Button variant="outline" className="h-6 px-4 text-[11px] font-bold bg-white border-slate-300 text-black shadow-[inset_1px_1px_0px_#fff]" onClick={() => setSearchTerm('')}>
                 Clear
              </Button>
            </div>
          </div>

          <Card className="p-0 overflow-hidden shadow-sm flex-1">
            <div className="w-full h-full overflow-auto">
              <table className="w-full text-left text-[11px] whitespace-nowrap min-w-max border-collapse">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-300 sticky top-0 z-10 shadow-sm uppercase font-semibold">
                  <tr>
                    <th className="p-4">REF NO</th>
                    <th className="p-4">FULL REF NO</th>
                    <th className="p-4">REQUEST DATE</th>
                    <th className="p-4">REQUIRED DATE</th>
                    <th className="p-4">LOCATION NAME</th>
                    <th className="p-4">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequisitions.length > 0 ? filteredRequisitions.map((r, idx) => (
                    <tr key={r.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 cursor-pointer`} onClick={() => { setActiveReq(r); setIsViewModalOpen(true); }}>
                      <td className="p-4 text-blue-600 underline cursor-pointer" onClick={(e) => { e.stopPropagation(); handleEdit(r); }}>{r.requisitionNo}</td>
                      <td className="p-4">{r.requisitionNo}</td>
                      <td className="p-4">{r.requestDate}</td>
                      <td className="p-4">{r.requiredDate || '-'}</td>
                      <td className="p-4">{r.destWarehouseName}</td>
                      <td className="p-4">{r.status}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 italic">No records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Bottom Status Bar */}
          <div className="flex items-center gap-1 px-2 py-1 bg-[#e2e8f0] border-t border-slate-300 text-[11px] text-slate-700 shrink-0 mt-[-8px]">
            <button className="px-1.5 hover:bg-slate-300 rounded font-bold">|&lt;&lt;</button>
            <button className="px-1.5 hover:bg-slate-300 rounded font-bold">&lt;&lt;</button>
            <span className="mx-1">StockRequisitions 0 of {filteredRequisitions.length || 0}</span>
            <button className="px-1.5 hover:bg-slate-300 rounded font-bold">&gt;&gt;</button>
            <button className="px-1.5 hover:bg-slate-300 rounded font-bold">&gt;&gt;|</button>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT FORM (FULL SCREEN) --- */}
      {isFormModalOpen && (
        <div className="flex-1 flex flex-col h-full bg-[#f0f4f8] relative">
          <div className="relative bg-[#f0f4f8] flex flex-col h-full w-full">
            {/* Top Action Bar */}
            <div className="flex items-center gap-1 px-2 py-1 bg-[#f1f5f9] border-b border-slate-300">
              <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => handleSaveForm('DRAFT')}>
                <FileBox className="w-4 h-4 text-blue-600 mb-0.5" />
                <span>Save & New<br/><span className="text-[9px] text-slate-400">Ctrl + N</span></span>
              </button>
              <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => handleSaveForm('DRAFT')}>
                <XCircle className="w-4 h-4 text-rose-600 mb-0.5" />
                <span>Save & Close<br/><span className="text-[9px] text-slate-400">Ctrl + L</span></span>
              </button>
              <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => handleSaveForm('PENDING_APPROVAL')}>
                <CheckCircle className="w-4 h-4 text-orange-500 mb-0.5" />
                <span>Proceed For<br/>Approval</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-2 bg-[#f0f4f8] flex flex-col gap-2 [&::-webkit-scrollbar]:hidden">
              <div className="flex items-center gap-4 font-bold text-[13px] text-slate-800 pl-1 mb-1 border-b border-slate-300 pb-1">
                <span>Request</span>
                <span>Ref#: {formData.id ? formData.requisitionNo : 'New'}</span>
              </div>
              
              {/* Form Section */}
              <div className="bg-[#f0f4f8] pb-2 flex flex-col gap-2 border-b border-slate-300">
                {formError && (
                  <div className="mb-2 p-2 bg-rose-50 text-rose-600 text-[11px] rounded font-medium border border-rose-200">
                    {formError}
                  </div>
                )}
                {/* Row 1 */}
                <div className="flex items-end gap-3 pl-1">
                  <div className="flex flex-col gap-1 w-[250px]">
                    <label className="text-[11px] font-medium text-slate-700">Location</label>
                    <div className="flex items-center gap-1">
                      <select 
                        value={formData.destWarehouseId || ''}
                        onChange={(e) => setFormData({...formData, destWarehouseId: e.target.value})}
                        className="flex-1 text-xs h-6 border border-slate-300 px-1 bg-white text-slate-600"
                      >
                        <option value="">[Select a Location]</option>
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                      <Plus className="w-4 h-4 text-emerald-600 cursor-pointer" />
                      <span className="text-[10px] text-slate-500">F4</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 w-[140px]">
                    <label className="text-[11px] font-medium text-slate-700">Requesting Date</label>
                    <input type="date" value={formData.requestDate || ''} onChange={(e) => setFormData({...formData, requestDate: e.target.value})} className="w-full text-xs h-6 border border-slate-300 px-2 bg-white" />
                  </div>
                  <div className="flex flex-col gap-1 w-[140px]">
                    <label className="text-[11px] font-medium text-slate-700">Required On</label>
                    <input type="date" value={formData.requiredDate || ''} onChange={(e) => setFormData({...formData, requiredDate: e.target.value})} className="w-full text-xs h-6 border border-slate-300 px-2 bg-white" />
                  </div>
                  <div className="flex items-center gap-2 h-6 mb-0.5 ml-4">
                    <span className="text-[11px] text-slate-600">Status</span>
                    <span className="text-[11px] font-bold text-black">{formData.status || 'Open'}</span>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="flex items-start gap-2 pl-1 mt-1">
                  <div className="flex gap-2 w-full max-w-[600px]">
                    <label className="text-[11px] font-medium text-slate-700 pt-1 w-12">Notes</label>
                    <textarea 
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="flex-1 text-xs border border-slate-300 p-1 bg-white resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Product Details Header */}
              <div className="bg-[#e2e8f0] text-slate-800 text-[12px] font-bold py-1 px-3 border border-slate-300 mt-1">
                Product Details
              </div>

              {/* Add Product Row */}
              <div className="bg-[#f0f4f8] p-2 flex items-end gap-2 border-b border-slate-300">
                <div className="flex flex-col gap-1 w-[100px]">
                  <label className="text-[11px] font-medium text-slate-700">Code</label>
                  <input type="text" className="w-full text-xs h-6 border border-slate-300 px-2 bg-white" />
                </div>
                <div className="flex flex-col gap-1 w-[120px]">
                  <label className="text-[11px] font-medium text-slate-700">Barcode</label>
                  <input type="text" className="w-full text-xs h-6 border border-slate-300 px-2 bg-white" />
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                  <label className="text-[11px] font-medium text-slate-700">Item Name</label>
                  <div className="flex items-center gap-1">
                    <select 
                      value={newItem.productId || ''}
                      onChange={(e) => setNewItem({...newItem, productId: e.target.value})}
                      className="flex-1 text-xs h-6 border border-slate-300 px-1 bg-white text-slate-600"
                    >
                      <option value=""></option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <RefreshCw className="w-3.5 h-3.5 text-blue-500 cursor-pointer" />
                    <Plus className="w-3.5 h-3.5 text-emerald-600 cursor-pointer" />
                    <span className="text-[10px] text-slate-500">F4</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-[120px]">
                  <label className="text-[11px] font-medium text-slate-700">Unit</label>
                  <select className="w-full text-xs h-6 border border-slate-300 px-1 bg-white text-slate-600">
                    <option value="">[Select unit]</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1 w-[50px]">
                  <label className="text-[11px] font-medium text-slate-700">UOM</label>
                  <input type="text" disabled value="1" className="w-full text-xs h-6 border border-slate-300 px-2 bg-slate-100" />
                </div>
                <div className="flex flex-col gap-1 w-[80px]">
                  <label className="text-[11px] font-medium text-slate-700">Req. Qty</label>
                  <input type="number" min="1" value={newItem.requestedQty || ''} onChange={(e) => setNewItem({...newItem, requestedQty: Number(e.target.value)})} className="w-full text-xs h-6 border border-slate-300 px-2 bg-white text-right" />
                </div>
                <div className="flex flex-col gap-1 w-[80px]">
                  <label className="text-[11px] font-medium text-slate-700">Curr. Cost</label>
                  <input type="text" disabled className="w-full text-xs h-6 border border-slate-300 px-2 bg-slate-100 text-right" />
                </div>
                <div className="flex flex-col gap-1 w-[90px]">
                  <label className="text-[11px] font-medium text-slate-700">Price Incl Tax</label>
                  <input type="text" disabled className="w-full text-xs h-6 border border-slate-300 px-2 bg-slate-100 text-right" />
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Button variant="outline" onClick={handleAddItem} className="h-6 px-3 text-[11px] font-medium bg-[#f0f4f8] border-slate-400 text-black shadow-[inset_1px_1px_0px_#fff] flex items-center gap-1">
                     <Plus className="w-3 h-3 text-emerald-600" /> Add <span className="text-[9px] text-slate-500">F1</span>
                  </Button>
                  <Button variant="outline" className="h-6 px-3 text-[11px] font-medium bg-[#f0f4f8] border-slate-400 text-black shadow-[inset_1px_1px_0px_#fff] flex items-center gap-1">
                     <XCircle className="w-3 h-3 text-rose-600" /> Remove <span className="text-[9px] text-slate-500">F2</span>
                  </Button>
                  <Button variant="outline" className="h-6 px-3 text-[11px] font-medium bg-[#f0f4f8] border-slate-400 text-black shadow-[inset_1px_1px_0px_#fff] flex items-center gap-1">
                     <Edit className="w-3 h-3 text-blue-600" /> Edit <span className="text-[9px] text-slate-500">F3</span>
                  </Button>
                </div>
              </div>

              {/* List Info Bar */}
              <div className="flex items-center gap-2 px-3 py-1 bg-[#e2e8f0] border border-slate-300 text-[11px] font-medium text-slate-600">
                <FileBox className="w-3.5 h-3.5 text-blue-600" />
                <span>Ctrl + L to Focus List</span>
              </div>

              {/* Table Area */}
              <div className="flex-1 overflow-auto bg-white border border-slate-300 rounded-sm">
                <table className="w-full text-left text-[11px] whitespace-nowrap border-collapse">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-300 sticky top-0 z-10">
                    <tr>
                      <th className="p-1 px-2 border-r border-slate-200 font-normal">Code</th>
                      <th className="p-1 px-2 border-r border-slate-200 font-normal">Barcode</th>
                      <th className="p-1 px-2 border-r border-slate-200 font-normal">Product</th>
                      <th className="p-1 px-2 border-r border-slate-200 font-normal">UOM</th>
                      <th className="p-1 px-2 border-r border-slate-200 font-normal">Req Qty</th>
                      <th className="p-1 px-2 border-r border-slate-200 font-normal">Cost</th>
                      <th className="p-1 px-2 font-normal">Approved Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formData.items && formData.items.length > 0 ? formData.items.map((item, idx) => (
                      <tr key={item.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 cursor-pointer`}>
                        <td className="p-1 px-2 border-r border-slate-200 text-blue-600">
                          {/* Code */}
                        </td>
                        <td className="p-1 px-2 border-r border-slate-200">{item.sku}</td>
                        <td className="p-1 px-2 border-r border-slate-200">{item.productName}</td>
                        <td className="p-1 px-2 border-r border-slate-200">{item.unit || '1'}</td>
                        <td className="p-1 px-2 border-r border-slate-200">{item.requestedQty}</td>
                        <td className="p-1 px-2 border-r border-slate-200 text-slate-400">0.00</td>
                        <td className="p-1 px-2">{item.requestedQty}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-slate-500 italic">No items added.</td>
                      </tr>
                    )}
                    <tr className="h-full">
                      <td colSpan={7}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- VIEW MODAL --- */}
      {isViewModalOpen && activeReq && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Requisition Details: ${activeReq.requisitionNo}`}
          className="max-w-[900px]"
        >
          <div className="w-full p-4 md:p-6 overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">{activeReq.requisitionNo}</h2>
                <p className="text-sm text-slate-500">Requested on {activeReq.requestDate} by {activeReq.requestedBy}</p>
                {activeReq.requiredDate && <p className="text-xs text-slate-500">Required by: {activeReq.requiredDate}</p>}
              </div>
              {getStatusBadge(activeReq.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="p-4 bg-slate-50 dark:bg-slate-800/30 border-dashed">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Requesting Warehouse</p>
                <p className="font-semibold text-base">{activeReq.sourceWarehouseName}</p>
              </Card>
              <Card className="p-4 bg-slate-50 dark:bg-slate-800/30 border-dashed">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Destination Warehouse</p>
                <p className="font-semibold text-base">{activeReq.destWarehouseName}</p>
              </Card>
            </div>
            
            {(activeReq.reference || activeReq.notes) && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                {activeReq.reference && <p className="text-sm mb-2"><span className="font-bold">Reference:</span> {activeReq.reference}</p>}
                {activeReq.notes && <p className="text-sm"><span className="font-bold">Notes:</span> {activeReq.notes}</p>}
              </div>
            )}

            <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Requested Items</h3>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-8">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3 text-right">Requested Qty</th>
                    <th className="p-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activeReq.items.map(item => (
                    <tr key={item.id}>
                      <td className="p-3 font-medium">{item.productName} <span className="text-xs text-slate-500 ml-2">({item.sku})</span></td>
                      <td className="p-3 text-right font-bold">{item.requestedQty} {item.unit}</td>
                      <td className="p-3 text-xs text-slate-500">{item.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Audit Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Created</span>
                <span className="font-medium">{activeReq.requestedBy} <span className="text-xs text-slate-400">({new Date(activeReq.createdDate).toLocaleString()})</span></span>
              </div>
              {activeReq.submittedDate && (
                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Submitted</span>
                  <span className="font-medium"><span className="text-xs text-slate-400">({new Date(activeReq.submittedDate).toLocaleString()})</span></span>
                </div>
              )}
              {activeReq.approvedBy && (
                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Approved</span>
                  <span className="font-medium">{activeReq.approvedBy} <span className="text-xs text-slate-400">({new Date(activeReq.approvedDate!).toLocaleString()})</span></span>
                </div>
              )}
              {activeReq.rejectedBy && (
                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 text-rose-500">Rejected</span>
                  <span className="font-medium">{activeReq.rejectedBy} <span className="text-xs text-slate-400">({new Date(activeReq.rejectedDate!).toLocaleString()})</span></span>
                </div>
              )}
              {activeReq.fulfilledBy && (
                <div className="flex justify-between">
                  <span className="text-slate-500 text-primary-500">Fulfilled</span>
                  <span className="font-medium">{activeReq.fulfilledBy} <span className="text-xs text-slate-400">({new Date(activeReq.fulfilledDate!).toLocaleString()})</span></span>
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
