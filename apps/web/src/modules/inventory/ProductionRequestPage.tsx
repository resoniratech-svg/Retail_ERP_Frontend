import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Search, Plus, Eye, CheckSquare, XCircle, Send } from 'lucide-react';
import { productsService } from '@qatar-erp/api';

const STORAGE_KEY = 'retail_erp_production_requests';
const CURRENT_USER = 'Ahmed Al-Mansouri';
const WAREHOUSES = [
  { id: 'wh-01', name: 'Main Distribution Center (Doha)' },
  { id: 'wh-02', name: 'City Center Mall Branch' },
  { id: 'wh-03', name: 'Al Wakrah Retail Store' },
];

type RequestStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PROCESSED' | 'REJECTED';

interface ProductionRequest {
  id: string;
  requestNo: string;
  requestDate: string;
  requiredDate: string;
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productSku: string;
  productName: string;
  requiredQuantity: number;
  priority: string;
  reason: string;
  remarks: string;
  status: RequestStatus;
  createdDate: string;
  createdBy: string;
}

export const ProductionRequestPage: React.FC = () => {
  const [records, setRecords] = useState<ProductionRequest[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const [activeRecord, setActiveRecord] = useState<ProductionRequest | null>(null);

  // Form State
  const [formWarehouse, setFormWarehouse] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formRequiredDate, setFormRequiredDate] = useState('');
  const [formProduct, setFormProduct] = useState('');
  const [formQty, setFormQty] = useState<number>(0);
  const [formPriority, setFormPriority] = useState('Medium');
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

  const saveRecords = (data: ProductionRequest[]) => {
    setRecords(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const generateNo = () => {
    return `PRQ-2026-${(records.length + 1).toString().padStart(4, '0')}`;
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="neutral">Draft</Badge>;
      case 'PENDING_APPROVAL': return <Badge variant="warning">Pending</Badge>;
      case 'APPROVED': return <Badge variant="info">Approved</Badge>;
      case 'PROCESSED': return <Badge variant="success">Processed</Badge>;
      case 'REJECTED': return <Badge variant="danger">Rejected</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const openNewForm = () => {
    setActiveRecord(null);
    setFormWarehouse('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormRequiredDate('');
    setFormProduct('');
    setFormQty(0);
    setFormPriority('Medium');
    setFormReason('');
    setFormRemarks('');
    setIsFormModalOpen(true);
  };

  const handleSaveForm = (isSubmit: boolean = false) => {
    if (!formWarehouse) return alert('Warehouse is required.');
    if (!formRequiredDate) return alert('Required date is required.');
    if (new Date(formRequiredDate) < new Date(formDate)) return alert('Required date cannot be before request date.');
    if (!formProduct) return alert('Product is required.');
    if (formQty <= 0) return alert('Quantity must be greater than 0.');

    const prod = products.find(p => p.id === formProduct);
    if (!prod) return;

    const newRecord: ProductionRequest = {
      id: activeRecord?.id || Date.now().toString(),
      requestNo: activeRecord?.requestNo || generateNo(),
      requestDate: formDate,
      requiredDate: formRequiredDate,
      warehouseId: formWarehouse,
      warehouseName: WAREHOUSES.find(w => w.id === formWarehouse)?.name || formWarehouse,
      productId: prod.id,
      productSku: prod.sku,
      productName: prod.name,
      requiredQuantity: formQty,
      priority: formPriority,
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

  const handleStatusChange = (r: ProductionRequest, newStatus: RequestStatus) => {
    saveRecords(records.map(sa => sa.id === r.id ? { ...sa, status: newStatus } : sa));
    setIsViewModalOpen(false);
  };

  const filteredRecords = records.filter(w => {
    if (statusFilter !== 'ALL' && w.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return w.requestNo.toLowerCase().includes(q) || 
             w.productName.toLowerCase().includes(q) ||
             w.warehouseName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Production Requests</h1>
          <p className="text-sm text-slate-500">Request and manage production requirements.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={openNewForm}>
            <Plus className="w-4 h-4 mr-2 inline" /> New Request
          </Button>
        </div>
      </div>

      <Card className="p-4 flex gap-4 bg-slate-50/50">
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search requests..." 
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
            { value: 'PROCESSED', label: 'Processed' },
            { value: 'REJECTED', label: 'Rejected' }
          ]}
        />
      </Card>

      <Card className="p-0 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 uppercase text-[11px] font-semibold text-slate-700 border-b">
            <tr>
              <th className="p-4">Request #</th>
              <th className="p-4">Date</th>
              <th className="p-4">Required By</th>
              <th className="p-4">Warehouse</th>
              <th className="p-4">Product</th>
              <th className="p-4 text-center">Req Qty</th>
              <th className="p-4 text-center">Priority</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRecords.map((w) => (
              <tr key={w.id} className="hover:bg-slate-50">
                <td className="p-4 font-mono font-bold text-xs">{w.requestNo}</td>
                <td className="p-4 text-xs">{w.requestDate}</td>
                <td className="p-4 text-xs font-semibold">{w.requiredDate}</td>
                <td className="p-4 font-medium text-xs">{w.warehouseName}</td>
                <td className="p-4 text-slate-700 text-xs">{w.productSku} - {w.productName}</td>
                <td className="p-4 text-center font-bold text-slate-700">{w.requiredQuantity}</td>
                <td className="p-4 text-center text-xs">
                   <Badge variant={w.priority === 'High' ? 'danger' : w.priority === 'Medium' ? 'warning' : 'neutral'}>{w.priority}</Badge>
                </td>
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
        <Modal isOpen onClose={() => setIsFormModalOpen(false)} title="New Production Request" className="max-w-[800px]">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Requesting Warehouse</label>
                <Select value={formWarehouse} onChange={(e) => setFormWarehouse(e.target.value)} options={[{ value: '', label: 'Select...' }, ...WAREHOUSES.map(w => ({ value: w.id, label: w.name }))]} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="block text-xs font-semibold mb-1">Request Date</label>
                    <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                 </div>
                 <div>
                    <label className="block text-xs font-semibold mb-1 text-rose-700">Required By</label>
                    <Input type="date" value={formRequiredDate} onChange={(e) => setFormRequiredDate(e.target.value)} />
                 </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mb-4 p-4 bg-slate-50 border rounded-lg">
              <div>
                <label className="block text-xs font-semibold mb-1">Product to Produce</label>
                <Select value={formProduct} onChange={(e) => setFormProduct(e.target.value)} options={[{ value: '', label: 'Select Product...' }, ...products.map((p: any) => ({ value: p.id, label: `${p.sku} - ${p.name}` }))]} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Required Qty</label>
                    <Input type="number" min="1" value={formQty || ''} onChange={(e) => setFormQty(parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Priority</label>
                    <Select value={formPriority} onChange={(e) => setFormPriority(e.target.value)} options={[{ value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }]} />
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Reason</label>
                <Input value={formReason} onChange={(e) => setFormReason(e.target.value)} placeholder="e.g., Stock depletion" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Remarks</label>
                <Input value={formRemarks} onChange={(e) => setFormRemarks(e.target.value)} placeholder="Additional notes..." />
              </div>
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
        <Modal isOpen onClose={() => setIsViewModalOpen(false)} title={`Request Details: ${activeRecord.requestNo}`} className="max-w-[600px]">
          <div className="p-6">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{activeRecord.requestNo}</h2>
                <p className="text-sm text-slate-500">{activeRecord.warehouseName} | Req: {activeRecord.requestDate} | Due: {activeRecord.requiredDate}</p>
              </div>
              {getStatusBadge(activeRecord.status)}
            </div>

            <div className="p-4 border rounded-lg bg-blue-50 border-blue-100 mb-6">
              <p className="text-xs font-bold text-blue-800 uppercase mb-2">Requested Product</p>
              <p className="font-medium text-lg">{activeRecord.productSku} - {activeRecord.productName}</p>
              <p className="text-xl font-bold text-blue-700 mt-2">{activeRecord.requiredQuantity} Units</p>
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
                <Button variant="primary" onClick={() => handleStatusChange(activeRecord, 'PROCESSED')}>Mark as Processed</Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
