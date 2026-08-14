import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Search, Plus, Eye, Trash2 } from 'lucide-react';
import { productsService } from '@qatar-erp/api';

const STORAGE_KEY = 'retail_erp_productions';
const CURRENT_USER = 'Ahmed Al-Mansouri';
const WAREHOUSES = [
  { id: 'wh-01', name: 'Main Distribution Center (Doha)' },
  { id: 'wh-02', name: 'City Center Mall Branch' },
  { id: 'wh-03', name: 'Al Wakrah Retail Store' },
];

type ProductionStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface MaterialConsumed {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  requiredQuantity: number;
  consumedQuantity: number;
  uom: string;
  remarks: string;
}

interface ProductionExecution {
  id: string;
  productionNo: string;
  productionDate: string;
  productionPlanNo: string;
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productSku: string;
  productName: string;
  plannedQuantity: number;
  producedQuantity: number;
  remarks: string;
  materials: MaterialConsumed[];
  status: ProductionStatus;
  createdDate: string;
  createdBy: string;
}

export const ProductionPage: React.FC = () => {
  const [records, setRecords] = useState<ProductionExecution[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const [activeRecord, setActiveRecord] = useState<ProductionExecution | null>(null);

  // Form State
  const [formWarehouse, setFormWarehouse] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formPlanNo, setFormPlanNo] = useState('');
  const [formProduct, setFormProduct] = useState('');
  const [formPlannedQty, setFormPlannedQty] = useState<number>(0);
  const [formProducedQty, setFormProducedQty] = useState<number>(0);
  const [formRemarks, setFormRemarks] = useState('');
  const [formMaterials, setFormMaterials] = useState<MaterialConsumed[]>([]);

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

  const saveRecords = (data: ProductionExecution[]) => {
    setRecords(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const generateNo = () => {
    return `PRD-2026-${(records.length + 1).toString().padStart(4, '0')}`;
  };

  const getStatusBadge = (status: ProductionStatus) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="neutral">Draft</Badge>;
      case 'IN_PROGRESS': return <Badge variant="warning">In Progress</Badge>;
      case 'COMPLETED': return <Badge variant="success">Completed</Badge>;
      case 'CANCELLED': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const openNewForm = () => {
    setActiveRecord(null);
    setFormWarehouse('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPlanNo('');
    setFormProduct('');
    setFormPlannedQty(0);
    setFormProducedQty(0);
    setFormRemarks('');
    setFormMaterials([]);
    setIsFormModalOpen(true);
  };

  const addMaterial = (prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;
    if (formMaterials.some(m => m.productId === prod.id)) return alert('Material already added.');
    setFormMaterials([...formMaterials, {
      id: Date.now().toString(),
      productId: prod.id,
      productSku: prod.sku,
      productName: prod.name,
      requiredQuantity: 1,
      consumedQuantity: 1,
      uom: 'PCS',
      remarks: ''
    }]);
  };

  const handleSaveForm = (isSubmit: boolean = false) => {
    if (!formWarehouse) return alert('Warehouse is required.');
    if (!formProduct) return alert('Product is required.');
    if (formProducedQty < 0) return alert('Produced quantity cannot be negative.');
    if (formMaterials.some(m => m.consumedQuantity < 0)) return alert('Consumed quantities cannot be negative.');

    const prod = products.find(p => p.id === formProduct);
    if (!prod) return;

    const newRecord: ProductionExecution = {
      id: activeRecord?.id || Date.now().toString(),
      productionNo: activeRecord?.productionNo || generateNo(),
      productionDate: formDate,
      productionPlanNo: formPlanNo,
      warehouseId: formWarehouse,
      warehouseName: WAREHOUSES.find(w => w.id === formWarehouse)?.name || formWarehouse,
      productId: prod.id,
      productSku: prod.sku,
      productName: prod.name,
      plannedQuantity: formPlannedQty,
      producedQuantity: formProducedQty,
      remarks: formRemarks,
      materials: formMaterials,
      status: isSubmit ? 'IN_PROGRESS' : 'DRAFT',
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

  const handleStatusChange = (r: ProductionExecution, newStatus: ProductionStatus) => {
    saveRecords(records.map(sa => sa.id === r.id ? { ...sa, status: newStatus } : sa));
    setIsViewModalOpen(false);
  };

  const filteredRecords = records.filter(w => {
    if (statusFilter !== 'ALL' && w.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return w.productionNo.toLowerCase().includes(q) || 
             w.productName.toLowerCase().includes(q) ||
             w.productionPlanNo.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Production</h1>
          <p className="text-sm text-slate-500">Execute and track production activities.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={openNewForm}>
            <Plus className="w-4 h-4 mr-2 inline" /> New Production
          </Button>
        </div>
      </div>

      <Card className="p-4 flex gap-4 bg-slate-50/50">
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search production..." 
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
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' }
          ]}
        />
      </Card>

      <Card className="p-0 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 uppercase text-[11px] font-semibold text-slate-700 border-b">
            <tr>
              <th className="p-4">Production #</th>
              <th className="p-4">Date</th>
              <th className="p-4">Plan #</th>
              <th className="p-4">Product</th>
              <th className="p-4 text-center">Planned Qty</th>
              <th className="p-4 text-center">Produced Qty</th>
              <th className="p-4">Warehouse</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRecords.map((w) => (
              <tr key={w.id} className="hover:bg-slate-50">
                <td className="p-4 font-mono font-bold text-xs">{w.productionNo}</td>
                <td className="p-4 text-xs">{w.productionDate}</td>
                <td className="p-4 text-xs font-mono">{w.productionPlanNo || '-'}</td>
                <td className="p-4 text-slate-700 text-xs font-medium">{w.productSku} - {w.productName}</td>
                <td className="p-4 text-center text-slate-500">{w.plannedQuantity}</td>
                <td className="p-4 text-center font-bold text-slate-800">{w.producedQuantity}</td>
                <td className="p-4 text-xs">{w.warehouseName}</td>
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
        <Modal isOpen onClose={() => setIsFormModalOpen(false)} title="New Production Execution" className="max-w-[900px]">
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="col-span-1">
                <label className="block text-xs font-semibold mb-1">Production Date</label>
                <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-semibold mb-1">Production Plan # (Optional)</label>
                <Input type="text" value={formPlanNo} onChange={(e) => setFormPlanNo(e.target.value)} placeholder="e.g. PPL-2026-0001" />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-semibold mb-1">Warehouse</label>
                <Select value={formWarehouse} onChange={(e) => setFormWarehouse(e.target.value)} options={[{ value: '', label: 'Select...' }, ...WAREHOUSES.map(w => ({ value: w.id, label: w.name }))]} />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 border rounded-lg items-end">
              <div className="col-span-1">
                <label className="block text-xs font-semibold mb-1 text-blue-700">Finished Product</label>
                <Select value={formProduct} onChange={(e) => setFormProduct(e.target.value)} options={[{ value: '', label: 'Select Product...' }, ...products.map((p: any) => ({ value: p.id, label: `${p.sku} - ${p.name}` }))]} />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-semibold mb-1 text-slate-500">Planned Qty</label>
                <Input type="number" min="0" value={formPlannedQty || ''} onChange={(e) => setFormPlannedQty(parseInt(e.target.value) || 0)} />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-semibold mb-1 text-emerald-700">Actual Produced Qty</label>
                <Input type="number" min="0" value={formProducedQty || ''} onChange={(e) => setFormProducedQty(parseInt(e.target.value) || 0)} />
              </div>
            </div>

            <div className="mb-4">
               <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm">Material Consumption</h3>
                  <Select 
                    value="" 
                    onChange={(e) => { if(e.target.value) addMaterial(e.target.value); }}
                    options={[{ value: '', label: '+ Add Material' }, ...products.map((p: any) => ({ value: p.id, label: `${p.sku} - ${p.name}` }))]}
                  />
               </div>
               <table className="w-full text-left text-sm border rounded">
                  <thead className="bg-slate-100 text-xs">
                     <tr>
                        <th className="p-2">Material</th>
                        <th className="p-2 w-24">Req. Qty</th>
                        <th className="p-2 w-24">Cons. Qty</th>
                        <th className="p-2">Remarks</th>
                        <th className="p-2 w-10"></th>
                     </tr>
                  </thead>
                  <tbody>
                     {formMaterials.map((m, i) => (
                        <tr key={m.id} className="border-t">
                           <td className="p-2 text-xs">{m.productSku} - {m.productName}</td>
                           <td className="p-2">
                              <Input type="number" min="0" value={m.requiredQuantity || ''} onChange={(e) => setFormMaterials(formMaterials.map((fm, fi) => fi === i ? { ...fm, requiredQuantity: parseInt(e.target.value) || 0 } : fm))} />
                           </td>
                           <td className="p-2">
                              <Input type="number" min="0" value={m.consumedQuantity || ''} onChange={(e) => setFormMaterials(formMaterials.map((fm, fi) => fi === i ? { ...fm, consumedQuantity: parseInt(e.target.value) || 0 } : fm))} />
                           </td>
                           <td className="p-2">
                              <Input type="text" value={m.remarks} onChange={(e) => setFormMaterials(formMaterials.map((fm, fi) => fi === i ? { ...fm, remarks: e.target.value } : fm))} />
                           </td>
                           <td className="p-2">
                              <Button variant="ghost" size="sm" onClick={() => setFormMaterials(formMaterials.filter((_, fi) => fi !== i))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                           </td>
                        </tr>
                     ))}
                     {formMaterials.length === 0 && (
                        <tr><td colSpan={5} className="p-4 text-center text-xs text-slate-500">No materials added.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>

            <div className="mb-4">
                <label className="block text-xs font-semibold mb-1">Production Remarks</label>
                <Input value={formRemarks} onChange={(e) => setFormRemarks(e.target.value)} placeholder="Additional notes..." />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
              <Button variant="outline" onClick={() => handleSaveForm(false)}>Save Draft</Button>
              <Button variant="primary" onClick={() => handleSaveForm(true)}>Start Production</Button>
            </div>
          </div>
        </Modal>
      )}

      {isViewModalOpen && activeRecord && (
        <Modal isOpen onClose={() => setIsViewModalOpen(false)} title={`Production: ${activeRecord.productionNo}`} className="max-w-[800px]">
          <div className="p-6">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{activeRecord.productionNo}</h2>
                <p className="text-sm text-slate-500">{activeRecord.warehouseName} | Date: {activeRecord.productionDate}</p>
              </div>
              {getStatusBadge(activeRecord.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="p-4 border rounded-lg bg-blue-50 border-blue-100">
                  <p className="text-xs font-bold text-blue-800 uppercase mb-2">Finished Product</p>
                  <p className="font-medium text-lg">{activeRecord.productSku} - {activeRecord.productName}</p>
               </div>
               <div className="p-4 border rounded-lg bg-emerald-50 border-emerald-100 flex items-center justify-center flex-col">
                  <p className="text-xs font-bold text-emerald-800 uppercase mb-2">Produced Quantity</p>
                  <p className="text-3xl font-bold text-emerald-700">{activeRecord.producedQuantity} <span className="text-sm font-normal text-emerald-600">/ {activeRecord.plannedQuantity} Planned</span></p>
               </div>
            </div>

            <h3 className="font-bold text-sm mb-2">Materials Consumed</h3>
            <table className="w-full text-left text-sm border rounded mb-6">
               <thead className="bg-slate-50 text-xs">
                  <tr>
                     <th className="p-2">Material</th>
                     <th className="p-2 text-center">Req Qty</th>
                     <th className="p-2 text-center">Consumed Qty</th>
                  </tr>
               </thead>
               <tbody>
                  {activeRecord.materials.map(m => (
                     <tr key={m.id} className="border-t">
                        <td className="p-2 text-xs">{m.productSku} - {m.productName}</td>
                        <td className="p-2 text-center font-bold text-slate-500">{m.requiredQuantity}</td>
                        <td className="p-2 text-center font-bold text-slate-800">{m.consumedQuantity}</td>
                     </tr>
                  ))}
               </tbody>
            </table>

            <div className="flex justify-end gap-3 mt-8">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
              {activeRecord.status === 'DRAFT' && (
                <Button variant="outline" onClick={() => handleStatusChange(activeRecord, 'CANCELLED')}>Cancel Production</Button>
              )}
              {activeRecord.status === 'IN_PROGRESS' && (
                <Button variant="primary" onClick={() => handleStatusChange(activeRecord, 'COMPLETED')}>Complete Production</Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
