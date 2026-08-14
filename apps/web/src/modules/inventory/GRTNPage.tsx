import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'retail_erp_grtn';
const PRODUCTS_KEY = 'retail_erp_products';
const CURRENT_USER = 'Ahmed Al-Mansouri';

type GRTNStatus = 'DRAFT' | 'APPROVED' | 'POSTED' | 'CANCELLED';

interface GRTNItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  returnQty: number;
  unitCost: number;
}

interface GRTNRecord {
  id: string;
  grtnNo: string;
  supplierId: string;
  supplierName: string;
  grtnDate: string;
  warehouseId: string;
  warehouseName: string;
  reference: string;
  notes: string;
  items: GRTNItem[];
  status: GRTNStatus;
  createdDate: string;
  createdBy: string;
}

const DEFAULT_PRODUCTS = [
  { id: 'PROD-001', name: 'Premium Jasmine Rice 5kg', sku: 'ITM-001', price: 45.00 },
  { id: 'PROD-002', name: 'Sunflower Oil 2L', sku: 'ITM-002', price: 22.50 },
  { id: 'PROD-003', name: 'Fresh Milk 1L', sku: 'ITM-003', price: 7.00 },
];

export const GRTNPage: React.FC = () => {
  const [records, setRecords] = useState<GRTNRecord[]>([]);
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<GRTNRecord | null>(null);

  // Form State
  const [supplierId, setSupplierId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [grtnDate, setGrtnDate] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<GRTNItem[]>([]);

  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) setRecords(JSON.parse(data));

      const prods = localStorage.getItem(PRODUCTS_KEY);
      if (prods) setProducts(JSON.parse(prods));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveRecords = (data: GRTNRecord[]) => {
    setRecords(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const getStatusBadge = (status: GRTNStatus) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="neutral">Draft</Badge>;
      case 'APPROVED': return <Badge variant="warning">Approved</Badge>;
      case 'POSTED': return <Badge variant="success">Posted</Badge>;
      case 'CANCELLED': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const openNewForm = () => {
    setActiveRecord(null);
    setSupplierId('');
    setWarehouseId('');
    setGrtnDate(new Date().toISOString().split('T')[0]);
    setReference('');
    setNotes('');
    setItems([]);
    setIsFormModalOpen(true);
  };

  const addItem = (prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;
    setItems([...items, {
      id: Date.now().toString(),
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      returnQty: 1,
      unitCost: prod.price
    }]);
  };

  const handleSaveForm = (status: GRTNStatus) => {
    if (!supplierId || !warehouseId) {
      return alert('Supplier and Warehouse are required.');
    }
    if (items.length === 0) {
      return alert('At least one item must be added.');
    }

    const newRecord: GRTNRecord = {
      id: activeRecord?.id || Date.now().toString(),
      grtnNo: activeRecord?.grtnNo || `GRTN-2026-${(records.length + 1).toString().padStart(4, '0')}`,
      supplierId,
      supplierName: supplierId === 'SUP-01' ? 'Global Distributors' : 'Local Wholesalers',
      warehouseId,
      warehouseName: warehouseId === 'WH-01' ? 'Doha Central' : 'Al Rayyan Depot',
      grtnDate,
      reference,
      notes,
      items,
      status,
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

  const handleStatusChange = (r: GRTNRecord, newStatus: GRTNStatus) => {
    saveRecords(records.map(gr => gr.id === r.id ? { ...gr, status: newStatus } : gr));
    setIsViewModalOpen(false);
  };

  const filteredRecords = records.filter(w => 
    w.grtnNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goods Return Note (GRTN)</h1>
          <p className="text-sm text-slate-500">Manage vendor returns</p>
        </div>
        <Button variant="primary" onClick={openNewForm}>
          <Plus className="w-4 h-4 mr-2 inline" /> New GRTN
        </Button>
      </div>

      <Card className="p-4 flex gap-4 bg-slate-50/50">
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search GRTN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300"
          />
        </div>
      </Card>

      <Card className="p-0 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 uppercase text-[11px] font-semibold text-slate-700 border-b">
            <tr>
              <th className="p-4">GRTN #</th>
              <th className="p-4">Date</th>
              <th className="p-4">Supplier</th>
              <th className="p-4">Warehouse</th>
              <th className="p-4 text-center">Items</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRecords.map((w) => (
              <tr key={w.id} className="hover:bg-slate-50">
                <td className="p-4 font-mono font-bold text-xs">{w.grtnNo}</td>
                <td className="p-4">{w.grtnDate}</td>
                <td className="p-4 font-medium">{w.supplierName}</td>
                <td className="p-4 text-xs text-slate-600">{w.warehouseName}</td>
                <td className="p-4 text-center font-bold">{w.items.length}</td>
                <td className="p-4 text-center">{getStatusBadge(w.status)}</td>
                <td className="p-4 text-center">
                  <Button variant="ghost" size="sm" onClick={() => { setActiveRecord(w); setIsViewModalOpen(true); }}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {filteredRecords.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-slate-500">No GRTN records found.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {isFormModalOpen && (
        <Modal isOpen onClose={() => setIsFormModalOpen(false)} title="New GRTN" className="max-w-[800px]">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Supplier</label>
                <Select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} options={[{ value: '', label: 'Select Supplier' }, { value: 'SUP-01', label: 'Global Distributors' }, { value: 'SUP-02', label: 'Local Wholesalers' }]} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Warehouse</label>
                <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} options={[{ value: '', label: 'Select Warehouse' }, { value: 'WH-01', label: 'Doha Central' }, { value: 'WH-02', label: 'Al Rayyan Depot' }]} />
              </div>
            </div>
            
            <div className="mb-6">
               <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm">Return Items</h3>
                  <Select 
                    value="" 
                    onChange={(e) => { if(e.target.value) addItem(e.target.value); }}
                    options={[{ value: '', label: '+ Add Product' }, ...products.map(p => ({ value: p.id, label: `${p.sku} - ${p.name}` }))]}
                  />
               </div>
               <table className="w-full text-left text-sm border rounded">
                  <thead className="bg-slate-100 text-xs">
                     <tr>
                        <th className="p-2">Product</th>
                        <th className="p-2 w-24">Return Qty</th>
                        <th className="p-2 w-10"></th>
                     </tr>
                  </thead>
                  <tbody>
                     {items.map((m, i) => (
                        <tr key={m.id} className="border-t">
                           <td className="p-2 text-xs">{m.sku} - {m.productName}</td>
                           <td className="p-2">
                              <Input type="number" min="1" value={m.returnQty} onChange={(e) => {
                                 const val = parseInt(e.target.value) || 0;
                                 setItems(items.map((it, idx) => idx === i ? { ...it, returnQty: val } : it));
                              }} />
                           </td>
                           <td className="p-2">
                              <Button variant="ghost" size="sm" onClick={() => setItems(items.filter((_, idx) => idx !== i))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                           </td>
                        </tr>
                     ))}
                     {items.length === 0 && (
                        <tr><td colSpan={3} className="p-4 text-center text-xs text-slate-500">No items added.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
              <Button variant="outline" onClick={() => handleSaveForm('DRAFT')}>Save Draft</Button>
              <Button variant="primary" onClick={() => handleSaveForm('APPROVED')}>Submit</Button>
            </div>
          </div>
        </Modal>
      )}

      {isViewModalOpen && activeRecord && (
        <Modal isOpen onClose={() => setIsViewModalOpen(false)} title={`GRTN: ${activeRecord.grtnNo}`} className="max-w-[800px]">
          <div className="p-6">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{activeRecord.supplierName}</h2>
                <p className="text-sm text-slate-500">Date: {activeRecord.grtnDate}</p>
              </div>
              {getStatusBadge(activeRecord.status)}
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
              {activeRecord.status === 'DRAFT' && (
                <Button variant="primary" onClick={() => handleStatusChange(activeRecord, 'APPROVED')}>Approve</Button>
              )}
              {activeRecord.status === 'APPROVED' && (
                <Button variant="success" onClick={() => handleStatusChange(activeRecord, 'POSTED')}>Post</Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
