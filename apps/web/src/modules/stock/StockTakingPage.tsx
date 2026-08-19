import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Plus, Search, Eye, Edit, Trash2, Power, ArrowRight, CheckSquare, Save, X, UploadCloud, Printer } from 'lucide-react';
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
          <div className="flex flex-col border border-slate-300 dark:border-slate-700 rounded-sm bg-[#f1f5f9] dark:bg-slate-800 shadow-sm">
            {/* Top Action Bar */}
            <div className="flex flex-wrap items-center justify-between p-1 border-b border-slate-300 dark:border-slate-700">
              <div className="flex items-center">
                <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300">
                  <Save className="w-3.5 h-3.5 text-slate-600" />
                  <span>Save Layout</span>
                </button>
                <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300">
                  <Power className="w-3.5 h-3.5 text-slate-600 rotate-180" />
                  <span>Unpost</span>
                </button>
              </div>
              
              <div className="flex items-center gap-2 pr-2">
                <Button variant="primary" className="py-1 px-2 text-xs h-7 flex items-center gap-1 font-bold" onClick={handleOpenNew}>
                  <Plus className="w-3.5 h-3.5" /> New Stock Taking
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
                </select>
              </div>
            </div>

            {/* Header */}
            <div className="bg-slate-200 text-slate-700 text-center text-[11px] font-bold py-1 border-b border-slate-300">
              StockTakings
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
              <table className="w-full h-full text-left text-[11px] whitespace-nowrap min-w-max">
                <thead className="bg-slate-100 uppercase font-semibold text-slate-700 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="p-4">Ref No</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-center">Posted</th>
                    <th className="p-4">Location</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRecords.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-xs">{st.stockTakeNo}</td>
                      <td className="p-4 text-xs">{st.countDate}</td>
                      <td className="p-4 text-right text-slate-600 text-xs">{st.totalVarianceValue.toFixed(2)}</td>
                      <td className="p-4 text-center text-xs">
                        {st.status === 'COMPLETED' || st.status === 'APPROVED' ? <CheckSquare className="w-4 h-4 text-emerald-600 inline-block" /> : ''}
                      </td>
                      <td className="p-4 text-xs text-slate-600">{st.warehouseName}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600" onClick={() => handleEdit(st)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500 text-xs">No stock takes found.</td></tr>
                  )}
                  {/* Filler row to push footer to bottom */}
                  <tr className="h-full">
                    <td colSpan={6}></td>
                  </tr>
                </tbody>
                <tfoot className="sticky bottom-0 bg-slate-100 dark:bg-slate-800 border-t border-slate-300 z-10 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
                  <tr>
                    <td colSpan={2}></td>
                    <td className="p-1 align-middle text-right">
                      <input 
                        type="text" 
                        value={filteredRecords.reduce((sum, st) => sum + st.totalVarianceValue, 0).toFixed(2)} 
                        readOnly 
                        className="w-full min-w-[70px] max-w-[120px] ml-auto px-2 py-1 text-xs text-right border border-slate-300 rounded bg-white font-bold text-slate-800" 
                      />
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT FORM (EMBEDDED) --- */}
      {isFormModalOpen && (
        <div className="relative flex-1 bg-[#f0f4f8] flex flex-col border border-slate-300 dark:border-slate-800 shadow-sm animate-in fade-in duration-200">
          
          {/* Header */}
          <div className="px-2 py-1 border-b border-slate-300 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center text-[12px] font-semibold text-slate-800">
              {formData.id ? `Edit Stock Taking: ${formData.stockTakeNo}` : "New StockTaking"}
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
            <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => handleSaveForm('IN_PROGRESS')}>
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
            <div className="bg-[#f0f4f8] border-b border-slate-300 pb-2">
              <div className="flex items-center gap-4 text-[11px] font-bold text-slate-800 mb-2 pl-1">
                <span>Ref #: {formData.id ? formData.stockTakeNo : "New"}</span>
              </div>
              
              <div className="flex flex-col gap-2 pl-1">
                {/* Row 1 */}
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1 w-[120px]">
                    <label className="text-[11px] font-medium text-slate-700">Barcode</label>
                    <input type="text" className="w-full text-xs h-6 border border-slate-300 px-2 bg-white" />
                  </div>
                  <div className="flex flex-col gap-1 w-[120px]">
                    <label className="text-[11px] font-medium text-slate-700">Code</label>
                    <input type="text" className="w-full text-xs h-6 border border-slate-300 px-2 bg-white" />
                  </div>
                  <div className="flex flex-col gap-1 w-[260px]">
                    <label className="text-[11px] font-medium text-slate-700">Item Name</label>
                    <div className="flex gap-1">
                      <select 
                        className="flex-1 text-xs h-6 border border-slate-300 px-1 bg-white text-slate-600"
                        value={newItem.productId || ''}
                        onChange={(e) => handleProductSelect(e.target.value)}
                      >
                        <option value="">[Select an Item]</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <Button variant="outline" className="h-6 w-6 p-0 shrink-0 border-slate-300 bg-white"><Plus className="w-3 h-3 text-blue-500" /></Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 w-[100px]">
                    <label className="text-[11px] font-medium text-slate-700">Unit</label>
                    <input type="text" value={newItem.unit || ''} readOnly className="w-full text-xs h-6 border border-slate-300 px-2 bg-slate-50" />
                  </div>
                  <div className="flex flex-col gap-1 w-[100px]">
                    <label className="text-[11px] font-medium text-slate-700">Quantity</label>
                    <input 
                      type="number" 
                      value={newItem.physicalQty?.toString() || ''} 
                      onChange={(e) => handlePhysicalQtyChange(Number(e.target.value))} 
                      className="w-full text-xs h-6 border border-slate-300 px-2 bg-white" 
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-[160px]">
                    <label className="text-[11px] font-medium text-slate-700">Rack</label>
                    <select className="w-full text-xs h-6 border border-slate-300 px-1 bg-white text-slate-600">
                      <option>[Select a Rack]</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 w-[120px]">
                    <label className="text-[11px] font-medium text-slate-700">Serial #</label>
                    <input type="text" className="w-full text-xs h-6 border border-slate-300 px-2 bg-white" />
                  </div>
                  <div className="flex flex-col gap-1 w-[120px]">
                    <label className="text-[11px] font-medium text-slate-700">Batch #</label>
                    <input type="text" className="w-full text-xs h-6 border border-slate-300 px-2 bg-white" />
                  </div>
                  <div className="flex flex-col gap-1 items-start mt-4">
                    <Button variant="outline" className="h-6 text-[10px] px-2 py-0 border-slate-300 bg-white" onClick={handleAddItem}><Plus className="w-3 h-3 text-green-600 mr-1" /> Add (F1)</Button>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex flex-col gap-1 w-[120px]">
                    <label className="text-[11px] font-medium text-slate-700">Date</label>
                    <input type="date" className="w-full text-xs h-6 border border-slate-300 px-2 bg-white" value={formData.countDate} onChange={(e) => setFormData({...formData, countDate: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-1 w-[120px]">
                    <label className="text-[11px] font-medium text-slate-700">Location</label>
                    <select 
                      className="w-full text-xs h-6 border border-slate-300 px-1 bg-white text-slate-600"
                      value={formData.warehouseId || ''}
                      onChange={(e) => setFormData({...formData, warehouseId: e.target.value})}
                    >
                      <option value="">[Select Warehouse]</option>
                      {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 w-[100px]">
                    <label className="text-[11px] font-medium text-slate-700">UOM</label>
                    <input type="text" className="w-full text-xs h-6 border border-slate-300 px-2 bg-slate-50" readOnly />
                  </div>
                  <div className="flex flex-col gap-1 w-[100px]">
                    <label className="text-[11px] font-medium text-slate-700">Cost</label>
                    <input type="text" value={newItem.unitCost || ''} readOnly className="w-full text-xs h-6 border border-slate-300 px-2 bg-slate-50" />
                  </div>
                  <div className="flex flex-col gap-1 w-[100px]">
                    <label className="text-[11px] font-medium text-slate-700">Price</label>
                    <input type="text" className="w-full text-xs h-6 border border-slate-300 px-2 bg-slate-50" readOnly />
                  </div>
                  <div className="flex flex-col gap-1 w-[100px]">
                    <label className="text-[11px] font-medium text-slate-700">Tax(%)</label>
                    <input type="text" className="w-full text-xs h-6 border border-slate-300 px-2 bg-slate-50" readOnly />
                  </div>
                  <div className="flex flex-col gap-1 w-[100px]">
                    <label className="text-[11px] font-medium text-slate-700">Price Incl Tax</label>
                    <input type="text" className="w-full text-xs h-6 border border-slate-300 px-2 bg-slate-50" readOnly />
                  </div>
                  <div className="flex flex-col gap-1 w-[120px]">
                    <label className="text-[11px] font-medium text-slate-700">Exp Date</label>
                    <input type="date" className="w-full text-xs h-6 border border-slate-300 px-2 bg-white" />
                  </div>
                  <div className="flex flex-col gap-1 items-start mt-4">
                    <Button variant="outline" className="h-6 text-[10px] px-2 py-0 border-slate-300 bg-white text-rose-500 hover:text-rose-600"><X className="w-3 h-3 text-rose-500 mr-1" /> Remove</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Block */}
            <div className="bg-white border border-slate-300 shadow-sm flex flex-col flex-1 min-h-[250px] relative">
              <div className="flex-1 overflow-auto flex flex-col relative">
                <table className="w-full h-full text-left text-[11px] whitespace-nowrap min-w-max border-collapse">
                  <thead className="bg-[#f0f4f8] font-semibold text-slate-600 border-b border-slate-300 uppercase sticky top-0 z-10">
                    <tr>
                      <th className="p-1.5 border-r border-slate-300 w-24 bg-[#f0f4f8]">Code</th>
                      <th className="p-1.5 border-r border-slate-300 w-32 bg-[#f0f4f8]">Barcode</th>
                      <th className="p-1.5 border-r border-slate-300 min-w-[200px] bg-[#f0f4f8]">Product</th>
                      <th className="p-1.5 border-r border-slate-300 w-16 bg-[#f0f4f8]">UOM</th>
                      <th className="p-1.5 border-r border-slate-300 w-16 text-right bg-[#f0f4f8]">Qty</th>
                      <th className="p-1.5 border-r border-slate-300 w-16 text-right bg-[#f0f4f8]">Cost</th>
                      <th className="p-1.5 border-r border-slate-300 w-24 text-right bg-[#f0f4f8]">Amount</th>
                      <th className="p-1.5 border-r border-slate-300 w-24 bg-[#f0f4f8]">Serial No</th>
                      <th className="p-1.5 border-r border-slate-300 w-24 bg-[#f0f4f8]">Batch No</th>
                      <th className="p-1.5 border-r border-slate-300 w-24 bg-[#f0f4f8]">Expiry Date</th>
                      <th className="p-1.5 border-r border-slate-300 w-24 text-right bg-[#f0f4f8]">System Stock</th>
                      <th className="p-1.5 border-r border-slate-300 w-24 bg-[#f0f4f8]">Rack</th>
                      <th className="p-1.5 border-r border-slate-300 w-24 text-right bg-[#f0f4f8]">Stock Value</th>
                      <th className="p-1.5 border-r border-slate-300 w-24 text-right bg-[#f0f4f8]">Qty Diff</th>
                      <th className="p-1.5 border-r border-slate-300 w-24 text-right bg-[#f0f4f8]">Diff Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {formData.items && formData.items.length > 0 ? formData.items.map(item => (
                      <tr key={item.id} className="hover:bg-blue-50 bg-white group relative">
                        <td className="p-1.5 border-r border-slate-200">{item.sku}</td>
                        <td className="p-1.5 border-r border-slate-200"></td>
                        <td className="p-1.5 border-r border-slate-200">{item.productName}</td>
                        <td className="p-1.5 border-r border-slate-200">{item.unit}</td>
                        <td className="p-1.5 border-r border-slate-200 text-right font-bold text-slate-800">{item.physicalQty}</td>
                        <td className="p-1.5 border-r border-slate-200 text-right">{item.unitCost.toFixed(2)}</td>
                        <td className="p-1.5 border-r border-slate-200 text-right">{(item.physicalQty * item.unitCost).toFixed(2)}</td>
                        <td className="p-1.5 border-r border-slate-200"></td>
                        <td className="p-1.5 border-r border-slate-200"></td>
                        <td className="p-1.5 border-r border-slate-200"></td>
                        <td className="p-1.5 border-r border-slate-200 text-right">{item.systemQty}</td>
                        <td className="p-1.5 border-r border-slate-200"></td>
                        <td className="p-1.5 border-r border-slate-200 text-right">{(item.systemQty * item.unitCost).toFixed(2)}</td>
                        <td className="p-1.5 border-r border-slate-200 text-right font-bold">
                          <span className={item.varianceQty < 0 ? "text-rose-600" : item.varianceQty > 0 ? "text-emerald-600" : ""}>
                            {item.varianceQty > 0 ? `+${item.varianceQty}` : item.varianceQty}
                          </span>
                        </td>
                        <td className="p-1.5 border-r border-slate-200 text-right font-bold">
                          <span className={item.varianceValue < 0 ? "text-rose-600" : item.varianceValue > 0 ? "text-emerald-600" : ""}>
                            {item.varianceValue.toFixed(2)}
                          </span>
                          <button onClick={() => handleRemoveItem(item.id)} className="absolute right-2 top-1.5 hidden group-hover:flex items-center justify-center text-red-500 hover:text-red-700 bg-white shadow-sm border border-slate-200 rounded w-5 h-5">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    )) : null}
                    <tr className="h-full">
                      <td colSpan={15}></td>
                    </tr>
                  </tbody>
                  <tfoot className="sticky bottom-0 bg-slate-100 border-t border-slate-300 z-10 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
                    <tr>
                      <td colSpan={6}></td>
                      <td className="p-1 align-middle text-right border-r border-slate-300">
                        <input 
                          type="text" 
                          value={formData.items?.reduce((sum, item) => sum + (item.physicalQty * item.unitCost), 0).toFixed(2) || "0.00"} 
                          readOnly 
                          className="w-full min-w-[70px] max-w-[100px] ml-auto px-2 py-1 text-[11px] text-right border border-slate-300 rounded-sm bg-white font-bold text-slate-800" 
                        />
                      </td>
                      <td colSpan={5}></td>
                      <td className="p-1 align-middle text-right border-r border-slate-300">
                        <input 
                          type="text" 
                          value={formData.items?.reduce((sum, item) => sum + (item.systemQty * item.unitCost), 0).toFixed(2) || "0.00"} 
                          readOnly 
                          className="w-full min-w-[70px] max-w-[100px] ml-auto px-2 py-1 text-[11px] text-right border border-slate-300 rounded-sm bg-white font-bold text-slate-800" 
                        />
                      </td>
                      <td colSpan={1}></td>
                      <td className="p-1 align-middle text-right">
                        <input 
                          type="text" 
                          value={calculateTotals(formData.items || []).totalVarianceValue.toFixed(2)} 
                          readOnly 
                          className="w-full min-w-[70px] max-w-[100px] ml-auto px-2 py-1 text-[11px] text-right border border-slate-300 rounded-sm bg-white font-bold text-slate-800" 
                        />
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

          </div>
        </div>
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
