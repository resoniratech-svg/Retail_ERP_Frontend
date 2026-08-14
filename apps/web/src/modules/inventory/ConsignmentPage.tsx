import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'retail_erp_consignments';
const PRODUCTS_KEY = 'retail_erp_products';
const CURRENT_USER = 'Ahmed Al-Mansouri';

type ConsignmentStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'CANCELLED';

interface ConsignmentItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  consignedQty: number;
  unitCost: number;
}

interface ConsignmentRecord {
  id: string;
  consignmentNo: string;
  vendorId: string;
  vendorName: string;
  startDate: string;
  endDate: string;
  reference: string;
  notes: string;
  items: ConsignmentItem[];
  status: ConsignmentStatus;
  createdDate: string;
  createdBy: string;
}

const DEFAULT_PRODUCTS = [
  { id: 'PROD-001', name: 'Premium Jasmine Rice 5kg', sku: 'ITM-001', price: 45.00 },
  { id: 'PROD-002', name: 'Sunflower Oil 2L', sku: 'ITM-002', price: 22.50 },
  { id: 'PROD-003', name: 'Fresh Milk 1L', sku: 'ITM-003', price: 7.00 },
];

export const ConsignmentPage: React.FC = () => {
  const [records, setRecords] = useState<ConsignmentRecord[]>([]);
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<ConsignmentRecord | null>(null);

  // Form State
  const [vendorId, setVendorId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ConsignmentItem[]>([]);

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

  const saveRecords = (data: ConsignmentRecord[]) => {
    setRecords(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const getStatusBadge = (status: ConsignmentStatus) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="neutral">Draft</Badge>;
      case 'ACTIVE': return <Badge variant="warning">Active</Badge>;
      case 'CLOSED': return <Badge variant="success">Closed</Badge>;
      case 'CANCELLED': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const openNewForm = () => {
    setActiveRecord(null);
    setVendorId('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
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
      consignedQty: 1,
      unitCost: prod.price
    }]);
  };

  const handleSaveForm = (status: ConsignmentStatus) => {
    if (!vendorId) {
      return alert('Vendor is required.');
    }
    if (items.length === 0) {
      return alert('At least one item must be added.');
    }

    const newRecord: ConsignmentRecord = {
      id: activeRecord?.id || Date.now().toString(),
      consignmentNo: activeRecord?.consignmentNo || `CSGN-2026-${(records.length + 1).toString().padStart(4, '0')}`,
      vendorId,
      vendorName: vendorId === 'VND-01' ? 'Local Brands LLC' : 'Import Traders',
      startDate,
      endDate,
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

  const handleStatusChange = (r: ConsignmentRecord, newStatus: ConsignmentStatus) => {
    saveRecords(records.map(gr => gr.id === r.id ? { ...gr, status: newStatus } : gr));
    setIsViewModalOpen(false);
  };

  const filteredRecords = records.filter(w => 
    w.consignmentNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Consignment</h1>
          <p className="text-sm text-slate-500">Manage consignment inventory</p>
        </div>
        <Button variant="primary" onClick={openNewForm}>
          <Plus className="w-4 h-4 mr-2 inline" /> New Consignment
        </Button>
      </div>

      <Card className="p-4 flex gap-4 bg-slate-50/50">
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Consignments..."
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
              <th className="p-4">Consignment #</th>
              <th className="p-4">Start Date</th>
              <th className="p-4">Vendor</th>
              <th className="p-4 text-center">Items</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRecords.map((w) => (
              <tr key={w.id} className="hover:bg-slate-50">
                <td className="p-4 font-mono font-bold text-xs">{w.consignmentNo}</td>
                <td className="p-4">{w.startDate}</td>
                <td className="p-4 font-medium">{w.vendorName}</td>
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
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">No consignment records found.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {isFormModalOpen && (
        <Modal isOpen onClose={() => setIsFormModalOpen(false)} title="New Consignment" className="max-w-[800px]">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Vendor</label>
                <Select value={vendorId} onChange={(e) => setVendorId(e.target.value)} options={[{ value: '', label: 'Select Vendor' }, { value: 'VND-01', label: 'Local Brands LLC' }, { value: 'VND-02', label: 'Import Traders' }]} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
            </div>
            
            <div className="mb-6">
               <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm">Consigned Items</h3>
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
                        <th className="p-2 w-24">Qty</th>
                        <th className="p-2 w-10"></th>
                     </tr>
                  </thead>
                  <tbody>
                     {items.map((m, i) => (
                        <tr key={m.id} className="border-t">
                           <td className="p-2 text-xs">{m.sku} - {m.productName}</td>
                           <td className="p-2">
                              <Input type="number" min="1" value={m.consignedQty} onChange={(e) => {
                                 const val = parseInt(e.target.value) || 0;
                                 setItems(items.map((it, idx) => idx === i ? { ...it, consignedQty: val } : it));
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
              <Button variant="primary" onClick={() => handleSaveForm('ACTIVE')}>Activate</Button>
            </div>
          </div>
        </Modal>
      )}

      {isViewModalOpen && activeRecord && (
        <Modal isOpen onClose={() => setIsViewModalOpen(false)} title={`Consignment: ${activeRecord.consignmentNo}`} className="max-w-[800px]">
          <div className="p-6">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{activeRecord.vendorName}</h2>
                <p className="text-sm text-slate-500">Date: {activeRecord.startDate}</p>
              </div>
              {getStatusBadge(activeRecord.status)}
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
              {activeRecord.status === 'DRAFT' && (
                <Button variant="primary" onClick={() => handleStatusChange(activeRecord, 'ACTIVE')}>Activate</Button>
              )}
              {activeRecord.status === 'ACTIVE' && (
                <Button variant="success" onClick={() => handleStatusChange(activeRecord, 'CLOSED')}>Close</Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
