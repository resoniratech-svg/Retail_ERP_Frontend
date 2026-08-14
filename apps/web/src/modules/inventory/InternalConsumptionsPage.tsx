import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Search, Plus, Eye, Trash2 } from 'lucide-react';
import { productsService } from '@qatar-erp/api';

const STORAGE_KEY = 'retail_erp_internal_consumptions';
const CURRENT_USER = 'Ahmed Al-Mansouri';
const WAREHOUSES = [
  { id: 'wh-01', name: 'Main Distribution Center (Doha)' },
  { id: 'wh-02', name: 'City Center Mall Branch' },
  { id: 'wh-03', name: 'Al Wakrah Retail Store' },
];

type ConsumptionStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'POSTED' | 'REJECTED';

interface ConsumptionItem {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  availableStock: number;
  quantity: number;
  uom: string;
  unitCost: number;
  estimatedValue: number;
}

interface InternalConsumption {
  id: string;
  consumptionNo: string;
  date: string;
  warehouseId: string;
  warehouseName: string;
  department: string;
  purpose: string;
  requestedBy: string;
  remarks: string;
  items: ConsumptionItem[];
  itemCount: number;
  totalQuantity: number;
  totalEstimatedValue: number;
  status: ConsumptionStatus;
  createdDate: string;
  createdBy: string;
}

export const InternalConsumptionsPage: React.FC = () => {
  const [records, setRecords] = useState<InternalConsumption[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const [activeRecord, setActiveRecord] = useState<InternalConsumption | null>(null);

  // Form State
  const [formWarehouse, setFormWarehouse] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDepartment, setFormDepartment] = useState('');
  const [formPurpose, setFormPurpose] = useState('');
  const [formRequestedBy, setFormRequestedBy] = useState('');
  const [formRemarks, setFormRemarks] = useState('');
  const [formItems, setFormItems] = useState<ConsumptionItem[]>([]);

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

  const saveRecords = (data: InternalConsumption[]) => {
    setRecords(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const generateNo = () => {
    return `INC-2026-${(records.length + 1).toString().padStart(4, '0')}`;
  };

  const getStatusBadge = (status: ConsumptionStatus) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="neutral">Draft</Badge>;
      case 'PENDING_APPROVAL': return <Badge variant="warning">Pending</Badge>;
      case 'APPROVED': return <Badge variant="info">Approved</Badge>;
      case 'POSTED': return <Badge variant="success">Posted</Badge>;
      case 'REJECTED': return <Badge variant="danger">Rejected</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const openNewForm = () => {
    setActiveRecord(null);
    setFormWarehouse('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDepartment('');
    setFormPurpose('');
    setFormRequestedBy('');
    setFormRemarks('');
    setFormItems([]);
    setIsFormModalOpen(true);
  };

  const addItem = (prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;
    if (formItems.some(m => m.productId === prod.id)) return alert('Product already added.');
    setFormItems([...formItems, {
      id: Date.now().toString(),
      productId: prod.id,
      productSku: prod.sku,
      productName: prod.name,
      availableStock: prod.stockQuantity || 0,
      quantity: 1,
      uom: 'PCS',
      unitCost: prod.price || 0,
      estimatedValue: (prod.price || 0) * 1
    }]);
  };

  const handleQtyChange = (index: number, newQty: number) => {
    setFormItems(formItems.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          quantity: newQty,
          estimatedValue: newQty * item.unitCost
        };
      }
      return item;
    }));
  };

  const handleSaveForm = (isSubmit: boolean = false) => {
    if (!formWarehouse) return alert('Warehouse is required.');
    if (!formPurpose) return alert('Purpose is required.');
    if (formItems.length === 0) return alert('At least one product is required.');
    if (formItems.some(i => i.quantity <= 0)) return alert('Quantity must be greater than 0.');
    if (formItems.some(i => i.quantity > i.availableStock)) return alert('Quantity cannot exceed available stock.');

    const newRecord: InternalConsumption = {
      id: activeRecord?.id || Date.now().toString(),
      consumptionNo: activeRecord?.consumptionNo || generateNo(),
      date: formDate,
      warehouseId: formWarehouse,
      warehouseName: WAREHOUSES.find(w => w.id === formWarehouse)?.name || formWarehouse,
      department: formDepartment,
      purpose: formPurpose,
      requestedBy: formRequestedBy,
      remarks: formRemarks,
      items: formItems,
      itemCount: formItems.length,
      totalQuantity: formItems.reduce((acc, curr) => acc + curr.quantity, 0),
      totalEstimatedValue: formItems.reduce((acc, curr) => acc + curr.estimatedValue, 0),
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

  const handleStatusChange = (r: InternalConsumption, newStatus: ConsumptionStatus) => {
    saveRecords(records.map(sa => sa.id === r.id ? { ...sa, status: newStatus } : sa));
    setIsViewModalOpen(false);
  };

  const filteredRecords = records.filter(w => {
    if (statusFilter !== 'ALL' && w.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return w.consumptionNo.toLowerCase().includes(q) || 
             w.purpose.toLowerCase().includes(q) ||
             w.department.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Internal Consumptions</h1>
          <p className="text-sm text-slate-500">Record inventory consumed for internal business operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={openNewForm}>
            <Plus className="w-4 h-4 mr-2 inline" /> New Consumption
          </Button>
        </div>
      </div>

      <Card className="p-4 flex gap-4 bg-slate-50/50">
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search consumptions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300"
          />
        </div>
        <Select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'DRAFT', label: 'Draft' },
            { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'POSTED', label: 'Posted' },
            { value: 'REJECTED', label: 'Rejected' }
          ]}
        />
      </Card>

      <Card className="p-0 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 uppercase text-[11px] font-semibold text-slate-700 border-b">
            <tr>
              <th className="p-4">Consumption #</th>
              <th className="p-4">Date</th>
              <th className="p-4">Warehouse</th>
              <th className="p-4">Department / Purpose</th>
              <th className="p-4 text-center">Items</th>
              <th className="p-4 text-center">Total Qty</th>
              <th className="p-4 text-right">Est. Value (QAR)</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRecords.map((w) => (
              <tr key={w.id} className="hover:bg-slate-50">
                <td className="p-4 font-mono font-bold text-xs">{w.consumptionNo}</td>
                <td className="p-4 text-xs">{w.date}</td>
                <td className="p-4 text-xs">{w.warehouseName}</td>
                <td className="p-4 text-slate-700 text-xs">
                  <span className="font-semibold">{w.department || '-'}</span>
                  <span className="block text-[10px] text-slate-500">{w.purpose}</span>
                </td>
                <td className="p-4 text-center text-slate-500">{w.itemCount}</td>
                <td className="p-4 text-center font-bold text-slate-800">{w.totalQuantity}</td>
                <td className="p-4 text-right font-mono font-medium">{w.totalEstimatedValue.toFixed(2)}</td>
                <td className="p-4 text-center">{getStatusBadge(w.status)}</td>
                <td className="p-4 text-center">
                  <Button variant="ghost" size="sm" onClick={() => { setActiveRecord(w); setIsViewModalOpen(true); }}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {filteredRecords.length === 0 && (
              <tr><td colSpan={9} className="p-8 text-center text-slate-500">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {isFormModalOpen && (
        <Modal isOpen onClose={() => setIsFormModalOpen(false)} title="New Internal Consumption" className="max-w-[900px]">
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="col-span-1">
                <label className="block text-xs font-semibold mb-1">Date</label>
                <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1">Warehouse</label>
                <Select value={formWarehouse} onChange={(e) => setFormWarehouse(e.target.value)} options={[{ value: '', label: 'Select...' }, ...WAREHOUSES.map(w => ({ value: w.id, label: w.name }))]} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 border rounded-lg">
              <div>
                <label className="block text-xs font-semibold mb-1">Department / Cost Center</label>
                <Input type="text" value={formDepartment} onChange={(e) => setFormDepartment(e.target.value)} placeholder="e.g. IT Department" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Requested By</label>
                <Input type="text" value={formRequestedBy} onChange={(e) => setFormRequestedBy(e.target.value)} placeholder="Name of requestor" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1 text-rose-700">Purpose</label>
                <Input type="text" value={formPurpose} onChange={(e) => setFormPurpose(e.target.value)} placeholder="Reason for consumption..." />
              </div>
            </div>

            <div className="mb-4">
               <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm">Consumed Items</h3>
                  <Select 
                    value="" 
                    onChange={(e) => { if(e.target.value) addItem(e.target.value); }}
                    options={[{ value: '', label: '+ Add Product' }, ...products.map((p: any) => ({ value: p.id, label: `${p.sku} - ${p.name}` }))]}
                  />
               </div>
               <table className="w-full text-left text-sm border rounded">
                  <thead className="bg-slate-100 text-xs">
                     <tr>
                        <th className="p-2">Product</th>
                        <th className="p-2 w-24 text-center">In Stock</th>
                        <th className="p-2 w-24">Quantity</th>
                        <th className="p-2 w-24 text-right">Unit Cost</th>
                        <th className="p-2 w-24 text-right">Total Est.</th>
                        <th className="p-2 w-10"></th>
                     </tr>
                  </thead>
                  <tbody>
                     {formItems.map((m, i) => (
                        <tr key={m.id} className="border-t">
                           <td className="p-2 text-xs">{m.productSku} - {m.productName}</td>
                           <td className="p-2 text-center text-xs font-mono">{m.availableStock}</td>
                           <td className="p-2">
                              <Input type="number" min="1" max={m.availableStock} value={m.quantity || ''} onChange={(e) => handleQtyChange(i, parseInt(e.target.value) || 0)} />
                           </td>
                           <td className="p-2 text-right text-xs font-mono">{m.unitCost.toFixed(2)}</td>
                           <td className="p-2 text-right text-xs font-mono font-bold">{m.estimatedValue.toFixed(2)}</td>
                           <td className="p-2">
                              <Button variant="ghost" size="sm" onClick={() => setFormItems(formItems.filter((_, fi) => fi !== i))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                           </td>
                        </tr>
                     ))}
                     {formItems.length === 0 && (
                        <tr><td colSpan={6} className="p-4 text-center text-xs text-slate-500">No items added.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>

            <div className="mb-4">
                <label className="block text-xs font-semibold mb-1">Remarks</label>
                <Input value={formRemarks} onChange={(e) => setFormRemarks(e.target.value)} placeholder="Additional notes..." />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
              <Button variant="outline" onClick={() => handleSaveForm(false)}>Save Draft</Button>
              <Button variant="primary" onClick={() => handleSaveForm(true)}>Save & Submit</Button>
            </div>
          </div>
        </Modal>
      )}

      {isViewModalOpen && activeRecord && (
        <Modal isOpen onClose={() => setIsViewModalOpen(false)} title={`Internal Consumption: ${activeRecord.consumptionNo}`} className="max-w-[800px]">
          <div className="p-6">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{activeRecord.consumptionNo}</h2>
                <p className="text-sm text-slate-500">{activeRecord.warehouseName} | Date: {activeRecord.date}</p>
                <p className="text-sm text-slate-500">Dept: {activeRecord.department} | Purpose: {activeRecord.purpose}</p>
              </div>
              {getStatusBadge(activeRecord.status)}
            </div>

            <h3 className="font-bold text-sm mb-2">Items Consumed</h3>
            <table className="w-full text-left text-sm border rounded mb-6">
               <thead className="bg-slate-50 text-xs">
                  <tr>
                     <th className="p-2">Product</th>
                     <th className="p-2 text-center">Qty</th>
                     <th className="p-2 text-right">Unit Cost</th>
                     <th className="p-2 text-right">Total Est.</th>
                  </tr>
               </thead>
               <tbody>
                  {activeRecord.items.map(m => (
                     <tr key={m.id} className="border-t">
                        <td className="p-2 text-xs">{m.productSku} - {m.productName}</td>
                        <td className="p-2 text-center font-bold">{m.quantity} {m.uom}</td>
                        <td className="p-2 text-right font-mono text-xs">{m.unitCost.toFixed(2)}</td>
                        <td className="p-2 text-right font-mono font-medium">{m.estimatedValue.toFixed(2)}</td>
                     </tr>
                  ))}
               </tbody>
               <tfoot className="bg-slate-100">
                 <tr>
                   <td colSpan={3} className="p-2 text-right font-bold text-xs">Total Estimated Value (QAR)</td>
                   <td className="p-2 text-right font-bold font-mono text-emerald-700">{activeRecord.totalEstimatedValue.toFixed(2)}</td>
                 </tr>
               </tfoot>
            </table>

            <div className="flex justify-end gap-3 mt-8">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
              {activeRecord.status === 'PENDING_APPROVAL' && (
                <>
                  <Button variant="outline" onClick={() => handleStatusChange(activeRecord, 'REJECTED')}>Reject</Button>
                  <Button variant="primary" onClick={() => handleStatusChange(activeRecord, 'APPROVED')}>Approve</Button>
                </>
              )}
              {activeRecord.status === 'APPROVED' && (
                <Button variant="primary" onClick={() => handleStatusChange(activeRecord, 'POSTED')}>Post Consumption</Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
