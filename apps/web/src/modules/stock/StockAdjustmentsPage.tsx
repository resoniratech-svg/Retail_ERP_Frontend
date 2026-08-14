import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Plus, Search, Eye, Edit, Trash2, Power, ArrowRight, CheckSquare, XCircle, FileBox } from 'lucide-react';
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Adjustments</h1>
          <p className="text-sm text-slate-500">Manage and record inventory quantity adjustments.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={loadData}>
            Refresh
          </Button>
          <Button variant="primary" className="flex items-center gap-2 font-bold" onClick={handleOpenNew}>
            <Plus className="w-4 h-4" /> New Stock Adjustment
          </Button>
        </div>
      </div>

      <Card className="p-4 flex flex-wrap items-center justify-start gap-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search adjustment no, warehouse, reason, user..." 
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
              { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'POSTED', label: 'Posted' },
              { value: 'REJECTED', label: 'Rejected' },
              { value: 'CANCELLED', label: 'Cancelled' }
            ]}
          />
        </div>
      </Card>

      <Card className="p-0 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-[11px] font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 whitespace-nowrap">Adjustment #</th>
              <th className="p-4 whitespace-nowrap">Warehouse</th>
              <th className="p-4 whitespace-nowrap">Adjustment Date</th>
              <th className="p-4 whitespace-nowrap">Reason</th>
              <th className="p-4 text-center whitespace-nowrap">SKU Count</th>
              <th className="p-4 text-right whitespace-nowrap">Adjustment Value</th>
              <th className="p-4 whitespace-nowrap">Created By</th>
              <th className="p-4 text-center whitespace-nowrap">Status</th>
              <th className="p-4 text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {filteredRecords.length > 0 ? filteredRecords.map((sa) => (
              <tr key={sa.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-mono font-bold text-xs">{sa.adjustmentNo}</td>
                <td className="p-4 font-medium">{sa.warehouseName}</td>
                <td className="p-4 text-xs">{sa.adjustmentDate}</td>
                <td className="p-4 text-slate-600">
                  {sa.adjustmentType === 'Increase' ? 
                    <span className="text-emerald-600 font-bold mr-1">↑</span> : 
                    <span className="text-rose-600 font-bold mr-1">↓</span>
                  }
                  {sa.reason}
                </td>
                <td className="p-4 text-center font-semibold">{sa.totalItems}</td>
                <td className="p-4 text-right font-bold text-slate-700">
                  ${sa.totalAdjustmentValue.toFixed(2)}
                </td>
                <td className="p-4 text-xs text-slate-500">{sa.createdBy}</td>
                <td className="p-4 text-center">{getStatusBadge(sa.status)}</td>
                <td className="p-4">
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
                <td colSpan={9} className="p-8 text-center text-slate-500">
                  No stock adjustments found.
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
          title={formData.id ? `Edit Stock Adjustment: ${formData.adjustmentNo}` : "New Stock Adjustment"}
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
                  <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Header Details</h3>
                  <div className="space-y-4">
                    <Input label="Adjustment Number" value={formData.adjustmentNo} disabled />
                    
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

                    <Input type="date" label="Adjustment Date *" value={formData.adjustmentDate} onChange={(e) => setFormData({...formData, adjustmentDate: e.target.value})} />

                    <div>
                      <span className="text-slate-500 block mb-1.5 text-xs font-semibold uppercase">Adjustment Type *</span>
                      <Select 
                        value={formData.adjustmentType || 'Decrease'}
                        onChange={(e) => handleAdjustmentTypeChange(e.target.value)}
                        options={[
                          { value: 'Decrease', label: 'Decrease' },
                          { value: 'Increase', label: 'Increase' }
                        ]}
                      />
                    </div>

                    <Input label="Reason *" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
                    <Input label="Reference / Document No." value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} />
                    <Input label="Notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Adjustment Items</h3>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-end mb-4">
                  <div className="flex-1 min-w-[200px]">
                    <span className="text-slate-500 block mb-1.5 text-xs font-semibold uppercase">Product / SKU</span>
                    <Select 
                      value={newItem.productId || ''}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      options={[
                        { value: '', label: '-- Select Product --' },
                        ...products.map(p => ({ value: p.id, label: `${p.sku} - ${p.name}` }))
                      ]}
                    />
                  </div>
                  
                  {newItem.productId && (
                    <>
                      <div className="w-24">
                        <Input label="Current Sys Qty" value={newItem.systemQty?.toString()} disabled />
                      </div>
                      <div className="w-24">
                        <Input 
                          type="number"
                          label="Adj Qty" 
                          value={newItem.adjustmentQty?.toString() || ''} 
                          onChange={(e) => handleAdjustmentQtyChange(Number(e.target.value))} 
                        />
                      </div>
                      <div className="w-24">
                        <Input label="Resulting Qty" value={newItem.adjustedQty?.toString() || ''} disabled />
                      </div>
                      <div className="w-36">
                        <Input 
                          label="Remarks / Reason" 
                          value={newItem.reason || ''} 
                          onChange={(e) => setNewItem({...newItem, reason: e.target.value})} 
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="w-full md:w-auto mt-2 md:mt-0">
                    <Button variant="primary" onClick={handleAddItem} className="w-full">Add Item</Button>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto">
                  <table className="w-full text-xs text-left whitespace-nowrap">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="p-3">Product / SKU</th>
                        <th className="p-3 text-right">Sys Qty</th>
                        <th className="p-3 text-right">Adj Qty</th>
                        <th className="p-3 text-right">Adjusted Qty</th>
                        <th className="p-3 text-right">Unit Cost</th>
                        <th className="p-3 text-right">Adj Value</th>
                        <th className="p-3">Reason / Remarks</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {formData.items && formData.items.length > 0 ? formData.items.map(item => (
                        <tr key={item.id}>
                          <td className="p-3">
                            <div className="font-mono">{item.sku}</div>
                            <div className="font-medium text-slate-700">{item.productName}</div>
                          </td>
                          <td className="p-3 text-right text-slate-500">{item.systemQty}</td>
                          <td className="p-3 text-right font-bold">
                            <span className={formData.adjustmentType === 'Decrease' ? "text-rose-600" : "text-emerald-600"}>
                              {formData.adjustmentType === 'Increase' ? '+' : '-'}{item.adjustmentQty}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-slate-800">{item.adjustedQty}</td>
                          <td className="p-3 text-right">${item.unitCost.toFixed(2)}</td>
                          <td className="p-3 text-right font-bold text-slate-700">
                            ${item.adjustmentValue.toFixed(2)}
                          </td>
                          <td className="p-3 text-slate-600">{item.reason || '-'}</td>
                          <td className="p-3 text-center">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-rose-500" onClick={() => handleRemoveItem(item.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={8} className="p-6 text-center text-slate-500">No adjustment lines added.</td></tr>
                      )}
                    </tbody>
                    {formData.items && formData.items.length > 0 && (
                      <tfoot className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 font-bold text-slate-700">
                        <tr>
                          <td colSpan={5} className="p-3 text-right">Total Adjustment Value:</td>
                          <td className="p-3 text-right">
                            ${calculateTotals(formData.items).totalAdjustmentValue.toFixed(2)}
                          </td>
                          <td colSpan={2}></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t pt-4">
              <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
              <Button variant="primary" className="bg-slate-600 hover:bg-slate-700" onClick={() => handleSaveForm('DRAFT')}>Save Draft</Button>
              <Button variant="primary" onClick={() => handleSaveForm('PENDING_APPROVAL')}>
                Submit for Approval
              </Button>
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
