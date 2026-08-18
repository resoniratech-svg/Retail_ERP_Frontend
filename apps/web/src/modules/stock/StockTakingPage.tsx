import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Plus, Search, Eye, Edit, Trash2, Power, ArrowRight, CheckSquare } from 'lucide-react';
import { productsService } from '@qatar-erp/api';
import { Product, Warehouse } from '@qatar-erp/types';

const STORAGE_KEY = 'retail_erp_stock_takings';
const WAREHOUSES_KEY = 'retail_erp_warehouses';
const CURRENT_USER = 'Ahmed Al-Mansouri (SUPER_ADMIN)';

type StockTakeStatus = 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';

interface StockCountItem {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  unit: string;
  systemQty: number;
  physicalQty: number;
  varianceQty: number;
  unitCost: number;
  varianceValue: number;
  reason: string;
  notes: string;
}

interface StockTake {
  id: string;
  stockTakeNo: string;
  warehouseId: string;
  warehouseName: string;
  countDate: string;
  countType: string;
  reference: string;
  notes: string;
  countedBy: string;
  
  items: StockCountItem[];
  
  totalItems: number;
  totalSystemQty: number;
  totalPhysicalQty: number;
  totalVarianceQty: number;
  totalVarianceValue: number;
  varianceItemsCount: number;
  
  status: StockTakeStatus;
  
  // Audit properties
  createdDate: string;
  createdBy: string;
  submittedDate?: string;
  submittedBy?: string;
  approvedDate?: string;
  approvedBy?: string;
  completedDate?: string;
  completedBy?: string;
}

const DEFAULT_RECORDS: StockTake[] = [
  {
    id: 'st-2026-001',
    stockTakeNo: 'ST-2026-001',
    warehouseId: 'wh-doh-01',
    warehouseName: 'Doha Central Depot',
    countDate: '2026-08-14',
    countType: 'Full Stock Take',
    reference: 'Q3-Inventory',
    notes: 'Routine quarterly check',
    countedBy: CURRENT_USER,
    items: [{
      id: 'itm-1',
      productId: 'prod-1',
      sku: 'SKU-001',
      productName: 'Sample SKU',
      unit: 'PCS',
      systemQty: 150,
      physicalQty: 145,
      varianceQty: -5,
      unitCost: 50.0,
      varianceValue: -250.0,
      reason: 'Missing',
      notes: ''
    }],
    totalItems: 1,
    totalSystemQty: 150,
    totalPhysicalQty: 145,
    totalVarianceQty: -5,
    totalVarianceValue: -250.0,
    varianceItemsCount: 1,
    status: 'COMPLETED',
    createdDate: '2026-08-14T08:00:00Z',
    createdBy: CURRENT_USER,
    submittedDate: '2026-08-14T09:00:00Z',
    submittedBy: CURRENT_USER,
    approvedDate: '2026-08-14T10:00:00Z',
    approvedBy: CURRENT_USER,
    completedDate: '2026-08-14T11:00:00Z',
    completedBy: CURRENT_USER
  }
];

export const StockTakingPage: React.FC = () => {
  const [stockTakes, setStockTakes] = useState<StockTake[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<StockTake | null>(null);
  
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<Partial<StockTake>>({ items: [] });
  const [newItem, setNewItem] = useState<Partial<StockCountItem>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setProducts(productsService.getProductsSync());

      const wData = localStorage.getItem(WAREHOUSES_KEY);
      if (wData) setWarehouses(JSON.parse(wData));
      
      const stData = localStorage.getItem(STORAGE_KEY);
      if (stData) {
        setStockTakes(JSON.parse(stData));
      } else {
        setStockTakes(DEFAULT_RECORDS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RECORDS));
      }
    } catch (e) {
      console.error(e);
      setStockTakes(DEFAULT_RECORDS);
    }
  };

  const saveRecords = (data: StockTake[]) => {
    setStockTakes(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const getStatusBadge = (status: StockTakeStatus) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="neutral">Draft</Badge>;
      case 'IN_PROGRESS': return <Badge variant="info">In Progress</Badge>;
      case 'SUBMITTED': return <Badge variant="warning">Submitted</Badge>;
      case 'APPROVED': return <Badge variant="info">Approved</Badge>;
      case 'COMPLETED': return <Badge variant="success">Completed</Badge>;
      case 'CANCELLED': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleOpenNew = () => {
    setFormError('');
    setFormData({
      stockTakeNo: `ST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      warehouseId: '',
      warehouseName: '',
      countDate: new Date().toISOString().split('T')[0],
      countType: 'Full Stock Take',
      reference: '',
      notes: '',
      countedBy: CURRENT_USER,
      items: [],
      totalItems: 0,
      totalSystemQty: 0,
      totalPhysicalQty: 0,
      totalVarianceQty: 0,
      totalVarianceValue: 0,
      varianceItemsCount: 0,
      status: 'DRAFT',
      createdBy: CURRENT_USER,
      createdDate: new Date().toISOString()
    });
    setNewItem({});
    setIsFormModalOpen(true);
  };

  const handleEdit = (r: StockTake) => {
    setFormError('');
    setFormData(JSON.parse(JSON.stringify(r)));
    setNewItem({});
    setIsFormModalOpen(true);
  };

  const handleDelete = (r: StockTake) => {
    if (confirm(`Are you sure you want to delete stock take ${r.stockTakeNo}?`)) {
      saveRecords(stockTakes.filter(st => st.id !== r.id));
    }
  };

  const handleStatusChange = (r: StockTake, newStatus: StockTakeStatus) => {
    const updated = stockTakes.map(st => {
      if (st.id === r.id) {
        const copy = { ...st, status: newStatus };
        const now = new Date().toISOString();
        if (newStatus === 'SUBMITTED') {
          copy.submittedBy = CURRENT_USER;
          copy.submittedDate = now;
        } else if (newStatus === 'APPROVED') {
          copy.approvedBy = CURRENT_USER;
          copy.approvedDate = now;
        } else if (newStatus === 'COMPLETED') {
          copy.completedBy = CURRENT_USER;
          copy.completedDate = now;
        }
        return copy;
      }
      return st;
    });
    saveRecords(updated);
  };

  const calculateTotals = (items: StockCountItem[]) => {
    let totalSystemQty = 0;
    let totalPhysicalQty = 0;
    let totalVarianceQty = 0;
    let totalVarianceValue = 0;
    let varianceItemsCount = 0;
    
    items.forEach(item => {
      totalSystemQty += item.systemQty;
      totalPhysicalQty += item.physicalQty;
      totalVarianceQty += item.varianceQty;
      totalVarianceValue += item.varianceValue;
      if (item.varianceQty !== 0) varianceItemsCount++;
    });
    
    return { 
      totalItems: items.length,
      totalSystemQty, 
      totalPhysicalQty, 
      totalVarianceQty, 
      totalVarianceValue,
      varianceItemsCount
    };
  };

  const handleSaveForm = (submitAsStatus: StockTakeStatus) => {
    setFormError('');
    if (!formData.warehouseId) return setFormError('Warehouse is required.');
    if (!formData.countDate) return setFormError('Count Date is required.');
    if (!formData.items || formData.items.length === 0) return setFormError('At least one item is required.');

    // Validation for variance reason
    for (const item of formData.items) {
      if (item.varianceQty !== 0 && (!item.reason || item.reason === '')) {
        return setFormError(`Reason is required for SKU ${item.sku} as it has a variance.`);
      }
    }

    const warehouse = warehouses.find(w => w.id === formData.warehouseId);
    const totals = calculateTotals(formData.items);

    const payload: StockTake = {
      ...(formData as StockTake),
      id: formData.id || `st-${Date.now()}`,
      warehouseName: warehouse?.name || '',
      status: submitAsStatus,
      ...totals
    };

    if (submitAsStatus === 'SUBMITTED' && !formData.submittedDate) {
      payload.submittedDate = new Date().toISOString();
      payload.submittedBy = CURRENT_USER;
    }

    if (formData.id) {
      saveRecords(stockTakes.map(st => st.id === formData.id ? payload : st));
    } else {
      saveRecords([payload, ...stockTakes]);
    }
    setIsFormModalOpen(false);
  };

  const handleProductSelect = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    // Use product.stockQuantity if available globally. If warehouse-specific logic
    // was fully implemented we would pull it from there. Here we adhere strictly to
    // using existing data, avoiding inventing fake quantities. 
    // Fallback to 0 if stockQuantity is completely unavailable.
    const systemQty = (prod as any).stockQuantity || 0; 
    
    setNewItem({
      ...newItem,
      productId: prod.id,
      sku: prod.sku,
      productName: prod.name,
      unit: prod.unit || 'PCS',
      systemQty: systemQty,
      unitCost: prod.costPrice || 0,
      physicalQty: undefined,
      varianceQty: undefined,
      varianceValue: undefined,
      reason: ''
    });
  };

  const handlePhysicalQtyChange = (val: number) => {
    const physicalQty = val;
    const systemQty = newItem.systemQty || 0;
    const unitCost = newItem.unitCost || 0;
    
    const varianceQty = physicalQty - systemQty;
    const varianceValue = varianceQty * unitCost;

    setNewItem({
      ...newItem,
      physicalQty,
      varianceQty,
      varianceValue,
      reason: varianceQty === 0 ? '' : newItem.reason
    });
  };

  const handleAddItem = () => {
    if (!newItem.productId) {
      alert("Please select a product.");
      return;
    }
    if (newItem.physicalQty === undefined || newItem.physicalQty < 0) {
      alert("Physical quantity cannot be negative.");
      return;
    }
    if (newItem.systemQty === undefined || newItem.systemQty < 0) {
      alert("System quantity cannot be negative.");
      return;
    }
    if (newItem.unitCost === undefined || newItem.unitCost < 0) {
      alert("Unit cost cannot be negative.");
      return;
    }
    if (newItem.varianceQty !== 0 && !newItem.reason) {
      alert("Please provide a reason for the variance.");
      return;
    }

    if (formData.items?.some(i => i.productId === newItem.productId)) {
      alert("Product is already added to this count.");
      return;
    }

    const item: StockCountItem = {
      id: `itm-${Date.now()}`,
      productId: newItem.productId,
      sku: newItem.sku!,
      productName: newItem.productName!,
      unit: newItem.unit!,
      systemQty: newItem.systemQty,
      physicalQty: newItem.physicalQty,
      varianceQty: newItem.varianceQty!,
      unitCost: newItem.unitCost,
      varianceValue: newItem.varianceValue!,
      reason: newItem.reason || '',
      notes: newItem.notes || ''
    };

    setFormData({ ...formData, items: [...(formData.items || []), item] });
    setNewItem({ productId: '', physicalQty: undefined, varianceQty: undefined, varianceValue: undefined, reason: '', notes: '' });
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData({ ...formData, items: formData.items?.filter(i => i.id !== itemId) });
  };

  const filteredRecords = stockTakes.filter(st => {
    if (statusFilter !== 'ALL' && st.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return st.stockTakeNo.toLowerCase().includes(q) || 
             st.warehouseName.toLowerCase().includes(q) ||
             st.reference.toLowerCase().includes(q) ||
             st.countedBy.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {!isFormModalOpen && (
        <div className="flex flex-col h-full gap-2">
          {/* Desktop App Style Action Toolbar */}
          <div className="flex items-center gap-4 px-3 py-1.5 bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700 shadow-sm text-[12px] text-slate-700 dark:text-slate-300">
            <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
              <Power className="w-4 h-4 text-blue-600 rotate-180" /> Unpost
            </button>
            <div className="ml-auto">
              <Button variant="primary" onClick={handleOpenNew} className="h-6 text-[11px] px-2 py-0 bg-emerald-600 hover:bg-emerald-700 border-none">
                <Plus className="w-3 h-3 mr-1 inline" /> New Stock Taking
              </Button>
            </div>
          </div>

          <div className="bg-slate-200 dark:bg-slate-800 text-center py-1 text-[12px] font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-700 shadow-sm">
            StockTakings
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 px-2 py-1 flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter text to search..."
              className="w-64 border border-slate-300 dark:border-slate-600 px-2 py-1 bg-white dark:bg-slate-950 text-[11px] shadow-sm rounded-sm focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="px-4 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-sm text-[11px] font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-slate-700 dark:text-slate-300">
              Find
            </button>
            <button 
              className="px-4 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-sm text-[11px] font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-slate-700 dark:text-slate-300"
              onClick={() => setSearchTerm('')}
            >
              Clear
            </button>
          </div>

          <div className="flex-1 bg-white dark:bg-slate-900 border-t border-slate-300 dark:border-slate-700 shadow-sm overflow-auto">
            <table className="w-full text-left whitespace-nowrap border-collapse text-slate-700 dark:text-slate-300 table-fixed">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10 border-b border-slate-300 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200 uppercase text-[9px] font-bold">
                <tr>
                  <th className="px-2 py-2 border-r border-slate-300 dark:border-slate-700">Ref No</th>
                  <th className="px-2 py-2 border-r border-slate-300 dark:border-slate-700">Date</th>
                  <th className="px-2 py-2 border-r border-slate-300 dark:border-slate-700 text-right">Amount</th>
                  <th className="px-2 py-2 border-r border-slate-300 dark:border-slate-700 text-center w-24">Posted</th>
                  <th className="px-2 py-2 border-r border-slate-300 dark:border-slate-700">Location</th>
                  <th className="px-2 py-2 text-center w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50 text-[10px]">
                {filteredRecords.map((st) => (
                  <tr key={st.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20">
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700/50 truncate">{st.stockTakeNo}</td>
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700/50 truncate">{st.countDate}</td>
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700/50 truncate text-right font-medium">{st.totalVarianceValue.toFixed(2)}</td>
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700/50 truncate text-center">
                      {st.status === 'COMPLETED' || st.status === 'APPROVED' ? <CheckSquare className="w-3 h-3 text-emerald-600 inline-block" /> : ''}
                    </td>
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700/50 truncate">{st.warehouseName}</td>
                    <td className="px-2 py-1.5 text-center">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(st)} className="h-5 px-2 py-0">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr><td colSpan={6} className="p-4 text-center text-slate-500">No stock taking records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-slate-200/50 dark:bg-slate-800/50 p-1 border border-slate-300 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <button className="px-1 hover:text-slate-900 dark:hover:text-white">|&lt;&lt;</button>
              <button className="px-1 hover:text-slate-900 dark:hover:text-white">&lt;</button>
              <span className="px-2">StockTakings 0 of 0</span>
              <button className="px-1 hover:text-slate-900 dark:hover:text-white">&gt;</button>
              <button className="px-1 hover:text-slate-900 dark:hover:text-white">&gt;&gt;|</button>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 px-8 py-0.5 min-w-[120px] text-right font-bold text-slate-800 dark:text-slate-200">
              {filteredRecords.reduce((sum, st) => sum + st.totalVarianceValue, 0).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT MODAL --- */}
      {isFormModalOpen && (
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={formData.id ? `Edit Stock Take: ${formData.stockTakeNo}` : "New Stock Take"}
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
                    <Input label="Stock Take No" value={formData.stockTakeNo} disabled />
                    
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

                    <Input type="date" label="Count Date *" value={formData.countDate} onChange={(e) => setFormData({...formData, countDate: e.target.value})} />

                    <div>
                      <span className="text-slate-500 block mb-1.5 text-xs font-semibold uppercase">Count Type</span>
                      <Select 
                        value={formData.countType || 'Full Stock Take'}
                        onChange={(e) => setFormData({...formData, countType: e.target.value})}
                        options={[
                          { value: 'Full Stock Take', label: 'Full Stock Take' },
                          { value: 'Partial Stock Take', label: 'Partial Stock Take' }
                        ]}
                      />
                    </div>

                    <Input label="Reference" value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} />
                    <Input label="Notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                    <Input label="Counted By" value={formData.countedBy} disabled />
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Stock Count Items</h3>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-end mb-4">
                  <div className="flex-1 min-w-[200px]">
                    <span className="text-slate-500 block mb-1.5 text-xs font-semibold uppercase">Product</span>
                    <Select 
                      value={newItem.productId || ''}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      options={[
                        { value: '', label: '-- Select Product --' },
                        ...products.map(p => ({ value: p.id, label: p.name }))
                      ]}
                    />
                  </div>
                  
                  {newItem.productId && (
                    <>
                      <div className="w-24">
                        <Input label="Sys Qty" value={newItem.systemQty?.toString()} disabled />
                      </div>
                      <div className="w-24">
                        <Input 
                          type="number"
                          label="Phys Qty" 
                          value={newItem.physicalQty?.toString() || ''} 
                          onChange={(e) => handlePhysicalQtyChange(Number(e.target.value))} 
                        />
                      </div>
                      
                      {newItem.varianceQty !== undefined && newItem.varianceQty !== 0 && (
                        <div className="w-36">
                          <span className="text-slate-500 block mb-1.5 text-xs font-semibold uppercase">Reason</span>
                          <Select 
                            value={newItem.reason || ''}
                            onChange={(e) => setNewItem({...newItem, reason: e.target.value})}
                            options={[
                              { value: '', label: 'Select Reason' },
                              { value: 'Damaged', label: 'Damaged' },
                              { value: 'Missing', label: 'Missing' },
                              { value: 'Counting Error', label: 'Counting Error' },
                              { value: 'Expired', label: 'Expired' },
                              { value: 'Unrecorded Receipt', label: 'Unrecorded Receipt' },
                              { value: 'Unrecorded Transfer', label: 'Unrecorded Transfer' },
                              { value: 'Other', label: 'Other' }
                            ]}
                          />
                        </div>
                      )}
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
                        <th className="p-3">SKU</th>
                        <th className="p-3">Product</th>
                        <th className="p-3 text-right">Sys Qty</th>
                        <th className="p-3 text-right">Phys Qty</th>
                        <th className="p-3 text-right">Var Qty</th>
                        <th className="p-3 text-right">Unit Cost</th>
                        <th className="p-3 text-right">Var Value</th>
                        <th className="p-3">Reason</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {formData.items && formData.items.length > 0 ? formData.items.map(item => (
                        <tr key={item.id}>
                          <td className="p-3 font-mono">{item.sku}</td>
                          <td className="p-3 font-medium">{item.productName}</td>
                          <td className="p-3 text-right">{item.systemQty}</td>
                          <td className="p-3 text-right font-bold text-slate-800">{item.physicalQty}</td>
                          <td className="p-3 text-right font-bold">
                            <span className={item.varianceQty < 0 ? "text-rose-600" : item.varianceQty > 0 ? "text-emerald-600" : ""}>
                              {item.varianceQty > 0 ? `+${item.varianceQty}` : item.varianceQty}
                            </span>
                          </td>
                          <td className="p-3 text-right">${item.unitCost.toFixed(2)}</td>
                          <td className="p-3 text-right font-bold">
                            <span className={item.varianceValue < 0 ? "text-rose-600" : item.varianceValue > 0 ? "text-emerald-600" : ""}>
                              ${item.varianceValue.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">{item.reason || '-'}</td>
                          <td className="p-3 text-center">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-rose-500" onClick={() => handleRemoveItem(item.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={9} className="p-6 text-center text-slate-500">No items added.</td></tr>
                      )}
                    </tbody>
                    {formData.items && formData.items.length > 0 && (
                      <tfoot className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 font-bold text-slate-700">
                        <tr>
                          <td colSpan={2} className="p-3 text-right">Totals:</td>
                          <td className="p-3 text-right">{calculateTotals(formData.items).totalSystemQty}</td>
                          <td className="p-3 text-right">{calculateTotals(formData.items).totalPhysicalQty}</td>
                          <td className="p-3 text-right">{calculateTotals(formData.items).totalVarianceQty}</td>
                          <td></td>
                          <td className="p-3 text-right">
                            <span className={calculateTotals(formData.items).totalVarianceValue < 0 ? "text-rose-600" : calculateTotals(formData.items).totalVarianceValue > 0 ? "text-emerald-600" : ""}>
                              ${calculateTotals(formData.items).totalVarianceValue.toFixed(2)}
                            </span>
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
              <Button variant="primary" onClick={() => handleSaveForm(formData.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'DRAFT')}>
                {formData.status === 'IN_PROGRESS' ? 'Save Progress' : 'Start Count'}
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
          title={`Stock Take Details: ${activeRecord.stockTakeNo}`}
          className="max-w-[1000px]"
        >
          <div className="w-full p-4 md:p-6 overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">{activeRecord.stockTakeNo}</h2>
                <p className="text-sm text-slate-500">Warehouse: <span className="font-semibold text-slate-700">{activeRecord.warehouseName}</span></p>
                <p className="text-xs text-slate-500">Count Date: {activeRecord.countDate} | Type: {activeRecord.countType}</p>
                <p className="text-xs text-slate-500">Counted By: {activeRecord.countedBy}</p>
              </div>
              {getStatusBadge(activeRecord.status)}
            </div>
            
            {(activeRecord.reference || activeRecord.notes) && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                {activeRecord.reference && <p className="text-sm mb-2"><span className="font-bold">Reference:</span> {activeRecord.reference}</p>}
                {activeRecord.notes && <p className="text-sm"><span className="font-bold">Notes:</span> {activeRecord.notes}</p>}
              </div>
            )}

            <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Count Details</h3>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto mb-8">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Product</th>
                    <th className="p-3 text-right">Sys Qty</th>
                    <th className="p-3 text-right">Phys Qty</th>
                    <th className="p-3 text-right">Var Qty</th>
                    <th className="p-3 text-right">Unit Cost</th>
                    <th className="p-3 text-right">Var Value</th>
                    <th className="p-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activeRecord.items.map(item => (
                    <tr key={item.id}>
                      <td className="p-3 font-mono">{item.sku}</td>
                      <td className="p-3 font-medium">{item.productName}</td>
                      <td className="p-3 text-right">{item.systemQty}</td>
                      <td className="p-3 text-right font-bold text-slate-800">{item.physicalQty}</td>
                      <td className="p-3 text-right font-bold">
                        <span className={item.varianceQty < 0 ? "text-rose-600" : item.varianceQty > 0 ? "text-emerald-600" : ""}>
                          {item.varianceQty > 0 ? `+${item.varianceQty}` : item.varianceQty}
                        </span>
                      </td>
                      <td className="p-3 text-right">${item.unitCost.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold">
                        <span className={item.varianceValue < 0 ? "text-rose-600" : item.varianceValue > 0 ? "text-emerald-600" : ""}>
                          ${item.varianceValue.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{item.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 font-bold text-slate-700">
                  <tr>
                    <td colSpan={2} className="p-3 text-right">Summary ({activeRecord.totalItems} items):</td>
                    <td className="p-3 text-right">{activeRecord.totalSystemQty}</td>
                    <td className="p-3 text-right">{activeRecord.totalPhysicalQty}</td>
                    <td className="p-3 text-right">{activeRecord.totalVarianceQty}</td>
                    <td></td>
                    <td className="p-3 text-right">
                      <span className={activeRecord.totalVarianceValue < 0 ? "text-rose-600" : activeRecord.totalVarianceValue > 0 ? "text-emerald-600" : ""}>
                        ${activeRecord.totalVarianceValue.toFixed(2)}
                      </span>
                    </td>
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
              {activeRecord.completedBy && (
                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Completed</span>
                  <span className="font-medium">{activeRecord.completedBy} <span className="text-xs text-slate-400">({new Date(activeRecord.completedDate!).toLocaleString()})</span></span>
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
