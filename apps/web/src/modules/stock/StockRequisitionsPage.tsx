import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Plus, Search, Eye, Edit, Trash2, Power, CheckCircle, Package, ArrowRight, XCircle } from 'lucide-react';
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Requisitions</h1>
          <p className="text-sm text-slate-500">Request and manage stock requirements between warehouses</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={loadData}>
            Refresh
          </Button>
          <Button variant="primary" className="flex items-center gap-2 font-bold" onClick={handleOpenNew}>
            <Plus className="w-4 h-4" /> New Stock Requisition
          </Button>
        </div>
      </div>

      <Card className="p-4 flex flex-wrap items-center justify-start gap-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search requisition no, warehouse, user..." 
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
              { value: 'REJECTED', label: 'Rejected' },
              { value: 'FULFILLED', label: 'Fulfilled' },
              { value: 'CANCELLED', label: 'Cancelled' }
            ]}
          />
        </div>
      </Card>

      <Card className="p-0 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-[11px] font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 whitespace-nowrap">Requisition #</th>
              <th className="p-4 whitespace-nowrap">Requesting Warehouse</th>
              <th className="p-4 whitespace-nowrap">Destination Warehouse</th>
              <th className="p-4 whitespace-nowrap">Requested By</th>
              <th className="p-4 whitespace-nowrap">Request Date</th>
              <th className="p-4 whitespace-nowrap">Required Date</th>
              <th className="p-4 text-right whitespace-nowrap">SKU Count</th>
              <th className="p-4 text-center whitespace-nowrap">Priority</th>
              <th className="p-4 text-center whitespace-nowrap">Status</th>
              <th className="p-4 text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {filteredRequisitions.length > 0 ? filteredRequisitions.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-mono font-bold text-xs">{r.requisitionNo}</td>
                <td className="p-4 font-medium">{r.sourceWarehouseName}</td>
                <td className="p-4 font-medium text-slate-600 dark:text-slate-400">{r.destWarehouseName}</td>
                <td className="p-4 text-xs text-slate-600 dark:text-slate-400">{r.requestedBy}</td>
                <td className="p-4 text-xs">{r.requestDate}</td>
                <td className="p-4 text-xs">{r.requiredDate || '-'}</td>
                <td className="p-4 text-right font-bold">{r.items.length}</td>
                <td className="p-4 text-center">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${r.priority === 'URGENT' ? 'bg-rose-100 text-rose-700' : r.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                    {r.priority}
                  </span>
                </td>
                <td className="p-4 text-center">{getStatusBadge(r.status)}</td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600" onClick={() => { setActiveReq(r); setIsViewModalOpen(true); }} title="View Details">
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {(r.status === 'DRAFT' || r.status === 'REJECTED') && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600" onClick={() => handleEdit(r)} title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}

                    {r.status === 'DRAFT' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-600" onClick={() => handleStatusChange(r, 'PENDING_APPROVAL')} title="Submit">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}

                    {r.status === 'DRAFT' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600" onClick={() => handleDelete(r)} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}

                    {r.status === 'PENDING_APPROVAL' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-600" onClick={() => handleStatusChange(r, 'APPROVED')} title="Approve">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}

                    {r.status === 'PENDING_APPROVAL' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600" onClick={() => handleStatusChange(r, 'REJECTED')} title="Reject">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}

                    {r.status === 'APPROVED' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-indigo-500 hover:text-indigo-600" onClick={() => handleStatusChange(r, 'FULFILLED')} title="Fulfill">
                        <Package className="w-4 h-4" />
                      </Button>
                    )}

                    {(r.status === 'APPROVED' || r.status === 'DRAFT') && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600" onClick={() => handleStatusChange(r, 'CANCELLED')} title="Cancel">
                        <Power className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={10} className="p-8 text-center text-slate-500">
                  No stock requisitions found.
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
          title={formData.id ? `Edit Requisition: ${formData.requisitionNo}` : "New Stock Requisition"}
          className="max-w-[1200px]"
        >
          <div className="w-full p-4 md:p-6 overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:hidden">
            {formError && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-md font-medium border border-rose-200">
                {formError}
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Basic Info */}
              <div className="space-y-6 lg:col-span-1 border-r border-slate-100 dark:border-slate-800 pr-0 lg:pr-6">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Requisition Details</h3>
                  <div className="space-y-4">
                    <Input label="Requisition No" value={formData.requisitionNo} disabled />
                    
                    <div>
                      <span className="text-slate-500 block mb-1.5 text-xs font-semibold uppercase">Requesting Warehouse *</span>
                      <Select 
                        value={formData.sourceWarehouseId || ''}
                        onChange={(e) => setFormData({...formData, sourceWarehouseId: e.target.value})}
                        options={[
                          { value: '', label: '-- Select Requesting Warehouse --' },
                          ...warehouses.map(w => ({ value: w.id, label: w.name }))
                        ]}
                      />
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-1.5 text-xs font-semibold uppercase">Destination Warehouse *</span>
                      <Select 
                        value={formData.destWarehouseId || ''}
                        onChange={(e) => setFormData({...formData, destWarehouseId: e.target.value})}
                        options={[
                          { value: '', label: '-- Select Destination Warehouse --' },
                          ...warehouses.map(w => ({ value: w.id, label: w.name }))
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input type="date" label="Request Date *" value={formData.requestDate} onChange={(e) => setFormData({...formData, requestDate: e.target.value})} />
                      <Input type="date" label="Required Date" value={formData.requiredDate} onChange={(e) => setFormData({...formData, requiredDate: e.target.value})} />
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-1.5 text-xs font-semibold uppercase">Priority *</span>
                      <Select 
                        value={formData.priority || 'MEDIUM'}
                        onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                        options={[
                          { value: 'LOW', label: 'Low' },
                          { value: 'MEDIUM', label: 'Medium' },
                          { value: 'HIGH', label: 'High' },
                          { value: 'URGENT', label: 'Urgent' }
                        ]}
                      />
                    </div>

                    <Input label="Reference / Reason" value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} />
                    <Input label="Notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                  </div>
                </div>
              </div>
              
              {/* Right Column: Items */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Requested Items</h3>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-end mb-4">
                  <div className="flex-1 min-w-[200px]">
                    <span className="text-slate-500 block mb-1.5 text-xs font-semibold uppercase">Product</span>
                    <Select 
                      value={newItem.productId || ''}
                      onChange={(e) => setNewItem({...newItem, productId: e.target.value})}
                      options={[
                        { value: '', label: '-- Select Product --' },
                        ...products.map(p => ({ value: p.id, label: `${p.name} (Global Stock: ${p.stockQuantity})` }))
                      ]}
                    />
                  </div>
                  <div className="w-32">
                    <Input 
                      type="number"
                      label="Requested Qty" 
                      value={newItem.requestedQty?.toString() || ''} 
                      onChange={(e) => setNewItem({...newItem, requestedQty: Number(e.target.value)})} 
                    />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <Input 
                      label="Remarks" 
                      value={newItem.remarks || ''} 
                      onChange={(e) => setNewItem({...newItem, remarks: e.target.value})} 
                    />
                  </div>
                  <div className="w-full md:w-auto mt-2 md:mt-0">
                    <Button variant="primary" onClick={handleAddItem} className="w-full">Add Product</Button>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3 text-right">Requested Qty</th>
                        <th className="p-3 text-center">Unit</th>
                        <th className="p-3">Remarks</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {formData.items && formData.items.length > 0 ? formData.items.map(item => (
                        <tr key={item.id}>
                          <td className="p-3 font-medium">{item.productName}</td>
                          <td className="p-3 text-xs text-slate-500">{item.sku}</td>
                          <td className="p-3 text-right font-bold">{item.requestedQty}</td>
                          <td className="p-3 text-center">{item.unit}</td>
                          <td className="p-3 text-xs text-slate-500">{item.remarks || '-'}</td>
                          <td className="p-3 text-center">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500" onClick={() => handleRemoveItem(item.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={6} className="p-6 text-center text-slate-500">No items added.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t pt-4">
              <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
              <Button variant="primary" className="bg-slate-600 hover:bg-slate-700" onClick={() => handleSaveForm(formData.status === 'REJECTED' ? 'REJECTED' : 'DRAFT')}>Save as Draft</Button>
              <Button variant="primary" onClick={() => handleSaveForm('PENDING_APPROVAL')}>Submit Request</Button>
            </div>
          </div>
        </Modal>
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
