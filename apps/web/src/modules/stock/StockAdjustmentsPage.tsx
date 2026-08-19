import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Plus, Search, Eye, Edit, Trash2, Power, ArrowRight, CheckSquare, XCircle, FileBox, X, Save, UploadCloud, RefreshCw } from 'lucide-react';
import { productsService } from '@qatar-erp/api';
import { Product, Warehouse } from '@qatar-erp/types';

const STORAGE_KEY = 'retail_erp_stock_adjustments';
const WAREHOUSES_KEY = 'retail_erp_warehouses';
const CURRENT_USER = 'Ahmed Al-Mansouri (SUPER_ADMIN)';

type StockAdjustmentStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'POSTED' | 'REJECTED' | 'CANCELLED';
type AdjustmentType = 'Increase' | 'Decrease';

interface StockAdjustmentItem {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  unit: string;
  systemQty: number;
  adjustmentQty: number;
  adjustedQty: number;
  unitCost: number;
  adjustmentValue: number;
  reason: string;
}

interface StockAdjustment {
  id: string;
  adjustmentNo: string;
  warehouseId: string;
  warehouseName: string;
  adjustmentDate: string;
  adjustmentType: AdjustmentType;
  reason: string;
  reference: string;
  notes: string;
  
  items: StockAdjustmentItem[];
  
  totalItems: number;
  totalAdjustmentValue: number;
  
  status: StockAdjustmentStatus;
  
  // Audit properties
  createdDate: string;
  createdBy: string;
  submittedDate?: string;
  submittedBy?: string;
  approvedDate?: string;
  approvedBy?: string;
  postedDate?: string;
  postedBy?: string;
}

const DEFAULT_RECORDS: StockAdjustment[] = [
  {
    id: 'sa-2026-001',
    adjustmentNo: 'SA-2026-001',
    warehouseId: 'wh-doh-01',
    warehouseName: 'Doha Central Depot',
    adjustmentDate: '2026-08-14',
    adjustmentType: 'Decrease',
    reason: 'Damaged Goods',
    reference: 'REF-DAMAGE-882',
    notes: 'Forklift accident in aisle 4',
    items: [{
      id: 'itm-1',
      productId: 'prod-1',
      sku: 'SKU-001',
      productName: 'Sample SKU',
      unit: 'PCS',
      systemQty: 150,
      adjustmentQty: 5,
      adjustedQty: 145,
      unitCost: 50.0,
      adjustmentValue: 250.0,
      reason: 'Damaged beyond repair'
    }],
    totalItems: 1,
    totalAdjustmentValue: 250.0,
    status: 'POSTED',
    createdDate: '2026-08-14T08:00:00Z',
    createdBy: CURRENT_USER,
    submittedDate: '2026-08-14T09:00:00Z',
    submittedBy: CURRENT_USER,
    approvedDate: '2026-08-14T10:00:00Z',
    approvedBy: CURRENT_USER,
    postedDate: '2026-08-14T11:00:00Z',
    postedBy: CURRENT_USER
  },
  {
    id: 'sa-2026-002',
    adjustmentNo: 'SA-2026-002',
    warehouseId: 'wh-doh-01',
    warehouseName: 'Doha Central Depot',
    adjustmentDate: '2026-08-14',
    adjustmentType: 'Increase',
    reason: 'Initial Stock Upload',
    reference: 'REF-INIT-01',
    notes: 'Missing entry from last month',
    items: [{
      id: 'itm-2',
      productId: 'prod-2',
      sku: 'SKU-002',
      productName: 'Sample Product 2',
      unit: 'PCS',
      systemQty: 0,
      adjustmentQty: 50,
      adjustedQty: 50,
      unitCost: 15.0,
      adjustmentValue: 750.0,
      reason: 'Found in storage'
    }],
    totalItems: 1,
    totalAdjustmentValue: 750.0,
    status: 'DRAFT',
    createdDate: '2026-08-14T12:00:00Z',
    createdBy: CURRENT_USER
  }
];

export const StockAdjustmentsPage: React.FC = () => {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<StockAdjustment | null>(null);
  
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<Partial<StockAdjustment>>({ items: [] });
  const [newItem, setNewItem] = useState<Partial<StockAdjustmentItem>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setProducts(productsService.getProductsSync());

      const wData = localStorage.getItem(WAREHOUSES_KEY);
      if (wData) setWarehouses(JSON.parse(wData));
      
      const saData = localStorage.getItem(STORAGE_KEY);
      if (saData) {
        setAdjustments(JSON.parse(saData));
      } else {
        setAdjustments(DEFAULT_RECORDS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RECORDS));
      }
    } catch (e) {
      console.error(e);
      setAdjustments(DEFAULT_RECORDS);
    }
  };

  const saveRecords = (data: StockAdjustment[]) => {
    setAdjustments(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const getStatusBadge = (status: StockAdjustmentStatus) => {
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

  const handleOpenNew = () => {
    setFormError('');
    setFormData({
      adjustmentNo: `SA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      warehouseId: '',
      warehouseName: '',
      adjustmentDate: new Date().toISOString().split('T')[0],
      adjustmentType: 'Decrease',
      reason: '',
      reference: '',
      notes: '',
      items: [],
      totalItems: 0,
      totalAdjustmentValue: 0,
      status: 'DRAFT',
      createdBy: CURRENT_USER,
      createdDate: new Date().toISOString()
    });
    setNewItem({});
    setIsFormModalOpen(true);
  };

  const handleEdit = (r: StockAdjustment) => {
    setFormError('');
    setFormData(JSON.parse(JSON.stringify(r)));
    setNewItem({});
    setIsFormModalOpen(true);
  };

  const handleDelete = (r: StockAdjustment) => {
    if (confirm(`Are you sure you want to delete adjustment ${r.adjustmentNo}?`)) {
      saveRecords(adjustments.filter(sa => sa.id !== r.id));
    }
  };

  const handleStatusChange = (r: StockAdjustment, newStatus: StockAdjustmentStatus) => {
    const updated = adjustments.map(sa => {
      if (sa.id === r.id) {
        const copy = { ...sa, status: newStatus };
        const now = new Date().toISOString();
        if (newStatus === 'PENDING_APPROVAL') {
          copy.submittedBy = CURRENT_USER;
          copy.submittedDate = now;
        } else if (newStatus === 'APPROVED') {
          copy.approvedBy = CURRENT_USER;
          copy.approvedDate = now;
        } else if (newStatus === 'POSTED') {
          // Rule: Actual inventory update happens ONLY when POSTED.
          // However, we are restricted from introducing a global store.
          // We just record the status and audit info here locally.
          copy.postedBy = CURRENT_USER;
          copy.postedDate = now;
        }
        return copy;
      }
      return sa;
    });
    saveRecords(updated);
  };

  const calculateTotals = (items: StockAdjustmentItem[]) => {
    let totalAdjustmentValue = 0;
    
    items.forEach(item => {
      totalAdjustmentValue += item.adjustmentValue;
    });
    
    return { 
      totalItems: items.length,
      totalAdjustmentValue
    };
  };

  const handleSaveForm = (submitAsStatus: StockAdjustmentStatus) => {
    setFormError('');
    if (!formData.warehouseId) return setFormError('Warehouse is required.');
    if (!formData.adjustmentDate) return setFormError('Adjustment Date is required.');
    if (!formData.adjustmentType) return setFormError('Adjustment Type is required.');
    if (!formData.reason) return setFormError('Reason is required.');
    if (!formData.items || formData.items.length === 0) return setFormError('At least one product is required.');

    const warehouse = warehouses.find(w => w.id === formData.warehouseId);
    const totals = calculateTotals(formData.items);

    const payload: StockAdjustment = {
      ...(formData as StockAdjustment),
      id: formData.id || `sa-${Date.now()}`,
      warehouseName: warehouse?.name || '',
      status: submitAsStatus,
      ...totals
    };

    if (submitAsStatus === 'PENDING_APPROVAL' && !formData.submittedDate) {
      payload.submittedDate = new Date().toISOString();
      payload.submittedBy = CURRENT_USER;
    }

    if (formData.id) {
      saveRecords(adjustments.map(sa => sa.id === formData.id ? payload : sa));
    } else {
      saveRecords([payload, ...adjustments]);
    }
    setIsFormModalOpen(false);
  };

  const handleProductSelect = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const systemQty = prod.stockQuantity || 0; 
    
    setNewItem({
      ...newItem,
      productId: prod.id,
      sku: prod.sku,
      productName: prod.name,
      unit: prod.unit || 'PCS',
      systemQty: systemQty,
      unitCost: prod.costPrice || 0,
      adjustmentQty: undefined,
      adjustedQty: undefined,
      adjustmentValue: undefined,
      reason: ''
    });
  };

  const handleAdjustmentQtyChange = (val: number) => {
    const adjustmentQty = val;
    const systemQty = newItem.systemQty || 0;
    const unitCost = newItem.unitCost || 0;
    
    let adjustedQty = systemQty;
    if (formData.adjustmentType === 'Increase') {
      adjustedQty = systemQty + adjustmentQty;
    } else {
      adjustedQty = systemQty - adjustmentQty;
    }

    const adjustmentValue = adjustmentQty * unitCost;

    setNewItem({
      ...newItem,
      adjustmentQty,
      adjustedQty,
      adjustmentValue
    });
  };

  const handleAdjustmentTypeChange = (type: string) => {
    setFormData({...formData, adjustmentType: type as AdjustmentType, items: []});
    setNewItem({});
  };

  const handleAddItem = () => {
    if (!newItem.productId) return alert("Please select a product.");
    if (newItem.adjustmentQty === undefined || newItem.adjustmentQty <= 0) return alert("Adjustment quantity must be greater than 0.");
    if (newItem.adjustedQty === undefined || newItem.adjustedQty < 0) return alert("Adjusted resulting quantity cannot be negative. Check system quantity limits.");
    
    if (formData.items?.some(i => i.productId === newItem.productId)) {
      return alert("Product is already added to this adjustment.");
    }

    const item: StockAdjustmentItem = {
      id: `itm-${Date.now()}`,
      productId: newItem.productId,
      sku: newItem.sku!,
      productName: newItem.productName!,
      unit: newItem.unit!,
      systemQty: newItem.systemQty!,
      adjustmentQty: newItem.adjustmentQty,
      adjustedQty: newItem.adjustedQty!,
      unitCost: newItem.unitCost!,
      adjustmentValue: newItem.adjustmentValue!,
      reason: newItem.reason || ''
    };

    setFormData({ ...formData, items: [...(formData.items || []), item] });
    setNewItem({ productId: '', adjustmentQty: undefined, adjustedQty: undefined, adjustmentValue: undefined, reason: '' });
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData({ ...formData, items: formData.items?.filter(i => i.id !== itemId) });
  };

  const filteredRecords = adjustments.filter(sa => {
    if (statusFilter !== 'ALL' && sa.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return sa.adjustmentNo.toLowerCase().includes(q) || 
             sa.warehouseName.toLowerCase().includes(q) ||
             sa.reason.toLowerCase().includes(q) ||
             sa.createdBy.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {!isFormModalOpen && (
        <div className="flex flex-col h-full gap-2">
          <div className="flex flex-col border border-slate-300 dark:border-slate-700 rounded-sm bg-[#f1f5f9] dark:bg-slate-800 shadow-sm">
            {/* Top Action Bar */}
            <div className="flex flex-wrap items-center justify-between p-1 border-b border-slate-300 dark:border-slate-700">
              <div className="flex items-center">
                <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300">
                  <Power className="w-3.5 h-3.5 text-slate-600 rotate-180" />
                  <span>Unpost</span>
                </button>
                <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300">
                  <FileBox className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print</span>
                </button>
              </div>
              
              <div className="flex items-center gap-2 pr-2">
                <Button variant="outline" className="py-1 px-2 text-xs h-7 flex items-center gap-1 font-bold bg-white" onClick={loadData}>
                  Refresh
                </Button>
                <Button variant="primary" className="py-1 px-2 text-xs h-7 flex items-center gap-1 font-bold" onClick={handleOpenNew}>
                  <Plus className="w-3.5 h-3.5" /> New Stock Adjustment
                </Button>
              </div>
            </div>

            {/* Header */}
            <div className="bg-slate-200 text-slate-700 text-center text-[11px] font-bold py-1 border-b border-slate-300">
              StockAdjustments
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
                    <th className="p-4">Ref No</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Narration</th>
                    <th className="p-4 text-center">Posted</th>
                    <th className="p-4">Location</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRecords.length > 0 ? filteredRecords.map((sa) => (
                    <tr key={sa.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-xs">{sa.adjustmentNo}</td>
                      <td className="p-4 text-xs">{sa.adjustmentDate}</td>
                      <td className="p-4 text-slate-600 text-xs">
                        {sa.adjustmentType === 'Increase' ? 
                          <span className="text-emerald-600 font-bold mr-1">↑</span> : 
                          <span className="text-rose-600 font-bold mr-1">↓</span>
                        }
                        {sa.reason}
                      </td>
                      <td className="p-4 text-center text-xs">
                        {sa.status === 'POSTED' ? <CheckSquare className="w-4 h-4 text-emerald-600 inline-block" /> : ''}
                      </td>
                      <td className="p-4 text-xs text-slate-600">{sa.warehouseName}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600" onClick={() => { setActiveRecord(sa); setIsViewModalOpen(true); }} title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {(sa.status === 'DRAFT' || sa.status === 'REJECTED') && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600" onClick={() => handleEdit(sa)} title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}

                          {(sa.status === 'DRAFT' || sa.status === 'REJECTED') && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-indigo-500 hover:text-indigo-600" onClick={() => handleStatusChange(sa, 'PENDING_APPROVAL')} title="Submit for Approval">
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          )}

                          {sa.status === 'PENDING_APPROVAL' && (
                            <>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-600" onClick={() => handleStatusChange(sa, 'APPROVED')} title="Approve">
                                <CheckSquare className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600" onClick={() => handleStatusChange(sa, 'REJECTED')} title="Reject">
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}

                          {sa.status === 'DRAFT' && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600" onClick={() => handleDelete(sa)} title="Delete/Cancel">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}

                          {sa.status === 'APPROVED' && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700" onClick={() => handleStatusChange(sa, 'POSTED')} title="Post">
                              <FileBox className="w-4 h-4" />
                            </Button>
                          )}

                          {(sa.status === 'APPROVED' || sa.status === 'DRAFT') && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600" onClick={() => handleStatusChange(sa, 'CANCELLED')} title="Cancel">
                              <Power className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                        No stock adjustments found.
                      </td>
                    </tr>
                  )}
                  {/* Filler row to push height */}
                  <tr className="h-full">
                    <td colSpan={6}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT FORM (POPUP) --- */}
      {isFormModalOpen && (
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={formData.id ? `Stock Adjustment: ${formData.adjustmentNo}` : "Stock Adjustment"}
          className="max-w-[1200px]"
        >
          <div className="relative bg-[#f0f4f8] flex flex-col h-[80vh] w-full border border-slate-300 dark:border-slate-800 shadow-sm">

          {/* Top Action Bar */}
          <div className="flex items-center gap-1 px-2 py-1 bg-[#f1f5f9] border-b border-slate-300">
            <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => handleSaveForm('DRAFT')}>
              <Save className="w-4 h-4 text-blue-600 mb-0.5" />
              <span>Save</span>
            </button>
            <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => handleSaveForm('DRAFT')}>
              <Save className="w-4 h-4 text-blue-600 mb-0.5" />
              <span>Save & New</span>
            </button>
            <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => handleSaveForm('PENDING_APPROVAL')}>
              <Save className="w-4 h-4 text-green-600 mb-0.5" />
              <span>Save & Close</span>
            </button>
            <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700">
              <UploadCloud className="w-4 h-4 text-orange-500 mb-0.5" />
              <span>Post</span>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-2 bg-[#f0f4f8] flex flex-col gap-2 [&::-webkit-scrollbar]:hidden">
            
            {/* Details Section */}
            <div className="bg-[#f0f4f8] border-b border-slate-300 pb-2 flex flex-col gap-2">
              
              {/* Row 1 */}
              <div className="flex items-end gap-3 pl-1">
                <div className="flex flex-col gap-1 w-[130px]">
                  <label className="text-[11px] font-medium text-slate-700">Date</label>
                  <input type="date" value={formData.adjustmentDate} onChange={(e) => setFormData({...formData, adjustmentDate: e.target.value})} className="w-full text-xs h-6 border border-slate-300 px-2 bg-white" />
                </div>
                <div className="flex flex-col gap-1 w-[200px]">
                  <label className="text-[11px] font-medium text-slate-700">Location</label>
                  <select value={formData.warehouseId || ''} onChange={(e) => setFormData({...formData, warehouseId: e.target.value})} className="w-full text-xs h-6 border border-slate-300 px-1 bg-white text-slate-600">
                    <option value="">[Select Location]</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <Button variant="outline" className="h-6 px-3 text-[11px] font-bold bg-white border-slate-300">
                   PDT
                </Button>
                <Button variant="outline" className="h-6 px-3 text-[11px] font-bold bg-white border-slate-300 flex items-center gap-1">
                   <UploadCloud className="w-3 h-3" /> Import from File
                </Button>
                <div className="flex items-center gap-1 h-6 ml-2">
                  <input type="checkbox" id="freeze-item" className="w-3 h-3 border-slate-300" />
                  <label htmlFor="freeze-item" className="text-[11px] text-slate-700 cursor-pointer">Freeze Item From Department</label>
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex items-start gap-4 pl-1 mt-1">
                <div className="flex flex-col gap-1 flex-1 max-w-[500px]">
                  <label className="text-[11px] font-medium text-slate-700">Notes</label>
                  <textarea 
                    value={formData.notes || ''} 
                    onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                    className="w-full text-xs border border-slate-300 p-1 bg-white min-h-[40px] resize-y" 
                  />
                </div>

                <div className="flex gap-4 items-end h-[40px] mt-auto pb-1">
                  <Button variant="outline" className="h-7 px-3 text-[11px] font-bold bg-white border-slate-300 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 text-emerald-600" /> Refresh Stock
                  </Button>

                  <div className="flex flex-col border border-slate-300 p-1 bg-white rounded-sm h-[40px] justify-center">
                    <div className="text-[10px] text-slate-500 font-semibold mb-0.5 leading-none">Recalculate</div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 text-[11px]"><input type="radio" name="recalc" defaultChecked className="w-3 h-3" /> Adj Qty</label>
                      <label className="flex items-center gap-1 text-[11px]"><input type="radio" name="recalc" className="w-3 h-3" /> New Qty</label>
                    </div>
                  </div>

                  <Button variant="outline" className="h-7 px-3 text-[11px] font-bold bg-white border-slate-300 flex items-center gap-1 text-rose-600">
                    <X className="w-3 h-3" /> Remove
                  </Button>
                </div>
              </div>
              
              {/* Product Select for adding */}
              <div className="flex items-center gap-4 pl-1 mt-2">
                <div className="flex flex-col gap-1 w-[260px]">
                  <label className="text-[11px] font-medium text-slate-700">Add Product</label>
                  <div className="flex gap-1">
                    <select 
                      className="flex-1 text-xs h-6 border border-slate-300 px-1 bg-white text-slate-600"
                      value={newItem.productId || ''}
                      onChange={(e) => handleProductSelect(e.target.value)}
                    >
                      <option value="">[Select an Item]</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}
                    </select>
                  </div>
                </div>
                {newItem.productId && (
                   <div className="flex gap-2 items-end">
                     <div className="flex flex-col gap-1 w-[80px]">
                        <label className="text-[11px] font-medium text-slate-700">Adj Qty</label>
                        <input type="number" value={newItem.adjustmentQty || ''} onChange={(e) => handleAdjustmentQtyChange(Number(e.target.value))} className="w-full text-xs h-6 border border-slate-300 px-2 bg-white" />
                     </div>
                     <Button variant="primary" onClick={handleAddItem} className="h-6 px-3 text-[11px] font-bold pb-0.5"><Plus className="w-3 h-3 mr-1 inline" /> Add</Button>
                   </div>
                )}
              </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 min-h-[300px] bg-white border border-slate-300 rounded-sm relative flex flex-col">
              <div className="flex-1 overflow-auto flex flex-col relative">
                <table className="w-full h-full text-left text-[11px] whitespace-nowrap min-w-max border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-semibold text-slate-700 border-b border-slate-300 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="p-2 border-r border-slate-200">Code</th>
                      <th className="p-2 border-r border-slate-200">Barcode</th>
                      <th className="p-2 border-r border-slate-200">Product</th>
                      <th className="p-2 border-r border-slate-200">Unit</th>
                      <th className="p-2 border-r border-slate-200">UOM</th>
                      <th className="p-2 border-r border-slate-200 text-right">Cost</th>
                      <th className="p-2 border-r border-slate-200 text-right">Avg Cost</th>
                      <th className="p-2 border-r border-slate-200 text-right">Crrnt Qty</th>
                      <th className="p-2 border-r border-slate-200 text-right">Adjustment</th>
                      <th className="p-2 border-r border-slate-200 text-right">New Qty</th>
                      <th className="p-2 border-slate-200 text-right">Adj Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formData.items && formData.items.length > 0 ? formData.items.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-1 px-2 border-r border-slate-200 text-blue-600 cursor-pointer">{item.sku}</td>
                        <td className="p-1 px-2 border-r border-slate-200">{item.sku}</td>
                        <td className="p-1 px-2 border-r border-slate-200">{item.productName}</td>
                        <td className="p-1 px-2 border-r border-slate-200">{item.unit || 'PCS'}</td>
                        <td className="p-1 px-2 border-r border-slate-200">{item.unit || 'PCS'}</td>
                        <td className="p-1 px-2 border-r border-slate-200 text-right">{item.unitCost.toFixed(2)}</td>
                        <td className="p-1 px-2 border-r border-slate-200 text-right">{item.unitCost.toFixed(2)}</td>
                        <td className="p-1 px-2 border-r border-slate-200 text-right text-rose-600 font-bold">{item.systemQty}</td>
                        <td className="p-1 px-2 border-r border-slate-200 text-right">
                           <input type="text" className="w-[60px] text-right border border-slate-300 h-5" value={item.adjustmentQty} readOnly />
                        </td>
                        <td className="p-1 px-2 border-r border-slate-200 text-right font-bold text-emerald-600">{item.adjustedQty}</td>
                        <td className="p-1 px-2 border-slate-200 text-right text-blue-600 font-bold">{item.adjustmentValue.toFixed(2)}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={11} className="p-4 text-center text-slate-500 italic">No items added to adjustment.</td>
                      </tr>
                    )}
                    {/* Filler row */}
                    <tr className="h-full">
                      <td colSpan={11} className="border-r border-slate-200"></td>
                    </tr>
                  </tbody>
                  {/* Table Footer */}
                  <tfoot className="sticky bottom-0 bg-slate-100 dark:bg-slate-800 border-t border-slate-300 z-10 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
                    <tr>
                      <td colSpan={10}></td>
                      <td className="p-1 align-middle text-right">
                        <input 
                          type="text" 
                          value={formData.items ? calculateTotals(formData.items).totalAdjustmentValue.toFixed(2) : "0.00"} 
                          readOnly 
                          className="w-full min-w-[70px] max-w-[120px] ml-auto px-2 py-1 text-xs text-right border border-slate-300 rounded bg-white font-bold text-slate-800" 
                        />
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          </div>
        </Modal>
      )}

      {/* --- VIEW MODAL --- */}
      {isViewModalOpen && activeRecord && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Stock Adjustment Details: ${activeRecord.adjustmentNo}`}
          className="max-w-[1000px]"
        >
          <div className="w-full p-4 md:p-6 overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">{activeRecord.adjustmentNo}</h2>
                <p className="text-sm text-slate-500">Warehouse: <span className="font-semibold text-slate-700">{activeRecord.warehouseName}</span></p>
                <p className="text-xs text-slate-500">Adjustment Date: {activeRecord.adjustmentDate} | Type: {activeRecord.adjustmentType}</p>
                <p className="text-xs text-slate-800 font-semibold mt-2">Reason: {activeRecord.reason}</p>
              </div>
              {getStatusBadge(activeRecord.status)}
            </div>
            
            {(activeRecord.reference || activeRecord.notes) && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                {activeRecord.reference && <p className="text-sm mb-2"><span className="font-bold">Reference:</span> {activeRecord.reference}</p>}
                {activeRecord.notes && <p className="text-sm"><span className="font-bold">Notes:</span> {activeRecord.notes}</p>}
              </div>
            )}

            <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Adjustment Items</h3>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto mb-8">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="p-3">Product / SKU</th>
                    <th className="p-3 text-right">Sys Qty</th>
                    <th className="p-3 text-right">Adj Qty</th>
                    <th className="p-3 text-right">Adjusted Qty</th>
                    <th className="p-3 text-right">Unit Cost</th>
                    <th className="p-3 text-right">Adj Value</th>
                    <th className="p-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activeRecord.items.map(item => (
                    <tr key={item.id}>
                      <td className="p-3">
                        <div className="font-mono">{item.sku}</div>
                        <div className="font-medium text-slate-700">{item.productName}</div>
                      </td>
                      <td className="p-3 text-right">{item.systemQty}</td>
                      <td className="p-3 text-right font-bold">
                        <span className={activeRecord.adjustmentType === 'Decrease' ? "text-rose-600" : "text-emerald-600"}>
                          {activeRecord.adjustmentType === 'Increase' ? '+' : '-'}{item.adjustmentQty}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-800">{item.adjustedQty}</td>
                      <td className="p-3 text-right">${item.unitCost.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-slate-700">${item.adjustmentValue.toFixed(2)}</td>
                      <td className="p-3 text-slate-600">{item.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 font-bold text-slate-700">
                  <tr>
                    <td colSpan={5} className="p-3 text-right">Total Adjustment Value:</td>
                    <td className="p-3 text-right">${activeRecord.totalAdjustmentValue.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Audit Information</h3>
            <div className="space-y-3 text-sm">
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
                  <span className="text-slate-500">Approved</span>
                  <span className="font-medium">{activeRecord.approvedBy} <span className="text-xs text-slate-400">({new Date(activeRecord.approvedDate!).toLocaleString()})</span></span>
                </div>
              )}
              {activeRecord.postedBy && (
                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Posted</span>
                  <span className="font-medium">{activeRecord.postedBy} <span className="text-xs text-slate-400">({new Date(activeRecord.postedDate!).toLocaleString()})</span></span>
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
