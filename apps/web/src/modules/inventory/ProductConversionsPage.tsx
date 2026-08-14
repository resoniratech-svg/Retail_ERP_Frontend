import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Search, Plus, Eye, Edit2, Send, CheckSquare, XCircle } from 'lucide-react';
import { productsService } from '@qatar-erp/api';

const STORAGE_KEY = 'retail_erp_product_conversions';
const CURRENT_USER = 'Ahmed Al-Mansouri';
const WAREHOUSES = [
  { id: 'wh-01', name: 'Main Distribution Center (Doha)' },
  { id: 'wh-02', name: 'City Center Mall Branch' },
  { id: 'wh-03', name: 'Al Wakrah Retail Store' },
];

type ConversionStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

interface ProductConversion {
  id: string;
  conversionNo: string;
  conversionDate: string;
  warehouseId: string;
  warehouseName: string;
  sourceProductId: string;
  sourceProductSku: string;
  sourceProductName: string;
  sourceQuantity: number;
  sourceUOM: string;
  destinationProductId: string;
  destinationProductSku: string;
  destinationProductName: string;
  destinationQuantity: number;
  destinationUOM: string;
  reason: string;
  remarks: string;
  status: ConversionStatus;
  createdDate: string;
  createdBy: string;
}

export const ProductConversionsPage: React.FC = () => {
  const [records, setRecords] = useState<ProductConversion[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const [activeRecord, setActiveRecord] = useState<ProductConversion | null>(null);

  // Form State
  const [formWarehouse, setFormWarehouse] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formSourceProduct, setFormSourceProduct] = useState('');
  const [formSourceQty, setFormSourceQty] = useState<number>(0);
  const [formDestProduct, setFormDestProduct] = useState('');
  const [formDestQty, setFormDestQty] = useState<number>(0);
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

  const saveRecords = (data: ProductConversion[]) => {
    setRecords(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const generateNo = () => {
    return `CNV-2026-${(records.length + 1).toString().padStart(4, '0')}`;
  };

  const getStatusBadge = (status: ConversionStatus) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="neutral">Draft</Badge>;
      case 'PENDING_APPROVAL': return <Badge variant="warning">Pending</Badge>;
      case 'APPROVED': return <Badge variant="info">Approved</Badge>;
      case 'COMPLETED': return <Badge variant="success">Completed</Badge>;
      case 'REJECTED': return <Badge variant="danger">Rejected</Badge>;
      case 'CANCELLED': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const openNewForm = () => {
    setActiveRecord(null);
    setFormWarehouse('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormSourceProduct('');
    setFormSourceQty(0);
    setFormDestProduct('');
    setFormDestQty(0);
    setFormReason('');
    setFormRemarks('');
    setIsFormModalOpen(true);
  };

  const handleSaveForm = (isSubmit: boolean = false) => {
    if (!formWarehouse) return alert('Warehouse is required.');
    if (!formDate) return alert('Date is required.');
    if (!formSourceProduct || !formDestProduct) return alert('Source and destination products are required.');
    if (formSourceProduct === formDestProduct) return alert('Source and destination cannot be the same product.');
    if (formSourceQty <= 0 || formDestQty <= 0) return alert('Quantities must be greater than 0.');

    const srcProd = products.find(p => p.id === formSourceProduct);
    const destProd = products.find(p => p.id === formDestProduct);
    
    if (!srcProd || !destProd) return;

    const newRecord: ProductConversion = {
      id: activeRecord?.id || Date.now().toString(),
      conversionNo: activeRecord?.conversionNo || generateNo(),
      conversionDate: formDate,
      warehouseId: formWarehouse,
      warehouseName: WAREHOUSES.find(w => w.id === formWarehouse)?.name || formWarehouse,
      sourceProductId: srcProd.id,
      sourceProductSku: srcProd.sku,
      sourceProductName: srcProd.name,
      sourceQuantity: formSourceQty,
      sourceUOM: 'PCS',
      destinationProductId: destProd.id,
      destinationProductSku: destProd.sku,
      destinationProductName: destProd.name,
      destinationQuantity: formDestQty,
      destinationUOM: 'PCS',
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

  const handleStatusChange = (r: ProductConversion, newStatus: ConversionStatus) => {
    saveRecords(records.map(sa => sa.id === r.id ? { ...sa, status: newStatus } : sa));
    setIsViewModalOpen(false);
  };

  const filteredRecords = records.filter(w => {
    if (statusFilter !== 'ALL' && w.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return w.conversionNo.toLowerCase().includes(q) || 
             w.sourceProductName.toLowerCase().includes(q) ||
             w.destinationProductName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Conversions</h1>
          <p className="text-sm text-slate-500">Convert inventory quantities between products or units.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={openNewForm}>
            <Plus className="w-4 h-4 mr-2 inline" /> New Conversion
          </Button>
        </div>
      </div>

      <Card className="p-4 flex gap-4 bg-slate-50/50">
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversions..." 
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
            { value: 'COMPLETED', label: 'Completed' }
          ]}
        />
      </Card>

      <Card className="p-0 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 uppercase text-[11px] font-semibold text-slate-700 border-b">
            <tr>
              <th className="p-4">Conversion #</th>
              <th className="p-4">Date</th>
              <th className="p-4">Warehouse</th>
              <th className="p-4">Source Product</th>
              <th className="p-4 text-center">Src Qty</th>
              <th className="p-4">Destination Product</th>
              <th className="p-4 text-center">Dest Qty</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRecords.map((w) => (
              <tr key={w.id} className="hover:bg-slate-50">
                <td className="p-4 font-mono font-bold text-xs">{w.conversionNo}</td>
                <td className="p-4 text-xs">{w.conversionDate}</td>
                <td className="p-4 font-medium">{w.warehouseName}</td>
                <td className="p-4 text-slate-700 text-xs">{w.sourceProductSku} - {w.sourceProductName}</td>
                <td className="p-4 text-center font-bold text-rose-600">-{w.sourceQuantity}</td>
                <td className="p-4 text-slate-700 text-xs">{w.destinationProductSku} - {w.destinationProductName}</td>
                <td className="p-4 text-center font-bold text-emerald-600">+{w.destinationQuantity}</td>
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
        <Modal isOpen onClose={() => setIsFormModalOpen(false)} title="New Product Conversion" className="max-w-[800px]">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Warehouse</label>
                <Select value={formWarehouse} onChange={(e) => setFormWarehouse(e.target.value)} options={[{ value: '', label: 'Select...' }, ...WAREHOUSES.map(w => ({ value: w.id, label: w.name }))]} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Date</label>
                <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 border rounded-lg">
              <div>
                <label className="block text-xs font-semibold mb-1 text-rose-700">Source Product</label>
                <Select value={formSourceProduct} onChange={(e) => setFormSourceProduct(e.target.value)} options={[{ value: '', label: 'Select Source...' }, ...products.map((p: any) => ({ value: p.id, label: `${p.sku} - ${p.name}` }))]} />
                <label className="block text-xs font-semibold mb-1 mt-3">Source Qty to Convert</label>
                <Input type="number" min="1" value={formSourceQty || ''} onChange={(e) => setFormSourceQty(parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-emerald-700">Destination Product</label>
                <Select value={formDestProduct} onChange={(e) => setFormDestProduct(e.target.value)} options={[{ value: '', label: 'Select Destination...' }, ...products.map((p: any) => ({ value: p.id, label: `${p.sku} - ${p.name}` }))]} />
                <label className="block text-xs font-semibold mb-1 mt-3">Resulting Destination Qty</label>
                <Input type="number" min="1" value={formDestQty || ''} onChange={(e) => setFormDestQty(parseInt(e.target.value) || 0)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Reason</label>
                <Input value={formReason} onChange={(e) => setFormReason(e.target.value)} placeholder="e.g., Repackaging bulk to retail" />
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
        <Modal isOpen onClose={() => setIsViewModalOpen(false)} title={`Conversion Details: ${activeRecord.conversionNo}`} className="max-w-[800px]">
          <div className="p-6">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{activeRecord.conversionNo}</h2>
                <p className="text-sm text-slate-500">{activeRecord.warehouseName} | {activeRecord.conversionDate}</p>
              </div>
              {getStatusBadge(activeRecord.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 border rounded-lg bg-rose-50 border-rose-100">
                <p className="text-xs font-bold text-rose-800 uppercase mb-2">Source (Decrease)</p>
                <p className="font-medium">{activeRecord.sourceProductSku} - {activeRecord.sourceProductName}</p>
                <p className="text-xl font-bold text-rose-600 mt-2">-{activeRecord.sourceQuantity} {activeRecord.sourceUOM}</p>
              </div>
              <div className="p-4 border rounded-lg bg-emerald-50 border-emerald-100">
                <p className="text-xs font-bold text-emerald-800 uppercase mb-2">Destination (Increase)</p>
                <p className="font-medium">{activeRecord.destinationProductSku} - {activeRecord.destinationProductName}</p>
                <p className="text-xl font-bold text-emerald-600 mt-2">+{activeRecord.destinationQuantity} {activeRecord.destinationUOM}</p>
              </div>
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
                <Button variant="primary" onClick={() => handleStatusChange(activeRecord, 'COMPLETED')}>Complete Conversion</Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
