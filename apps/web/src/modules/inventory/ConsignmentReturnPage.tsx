import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'retail_erp_consignment_returns';
const CONSIGNMENTS_KEY = 'retail_erp_consignments';
const PRODUCTS_KEY = 'retail_erp_products';
const CURRENT_USER = 'Ahmed Al-Mansouri';

type ReturnStatus = 'DRAFT' | 'APPROVED' | 'POSTED' | 'CANCELLED';

interface ReturnItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  returnQty: number;
}

interface ConsignmentReturnRecord {
  id: string;
  returnNo: string;
  consignmentId: string;
  consignmentNo: string;
  vendorName: string;
  returnDate: string;
  notes: string;
  items: ReturnItem[];
  status: ReturnStatus;
  createdDate: string;
  createdBy: string;
}

export const ConsignmentReturnPage: React.FC = () => {
  const [records, setRecords] = useState<ConsignmentReturnRecord[]>([]);
  const [consignments, setConsignments] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<ConsignmentReturnRecord | null>(null);

  // Form State
  const [consignmentId, setConsignmentId] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ReturnItem[]>([]);

  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) setRecords(JSON.parse(data));

      const csgns = localStorage.getItem(CONSIGNMENTS_KEY);
      if (csgns) setConsignments(JSON.parse(csgns));

      const prods = localStorage.getItem(PRODUCTS_KEY);
      if (prods) setProducts(JSON.parse(prods));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveRecords = (data: ConsignmentReturnRecord[]) => {
    setRecords(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const getStatusBadge = (status: ReturnStatus) => {
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
    setConsignmentId('');
    setReturnDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setItems([]);
    setIsFormModalOpen(true);
  };

  const handleConsignmentChange = (val: string) => {
    setConsignmentId(val);
    const csgn = consignments.find(c => c.id === val);
    if (csgn) {
      setItems(csgn.items.map((i: any) => ({
        id: Date.now().toString() + Math.random(),
        productId: i.productId,
        productName: i.productName,
        sku: i.sku,
        returnQty: 0
      })));
    } else {
      setItems([]);
    }
  };

  const handleSaveForm = (status: ReturnStatus) => {
    if (!consignmentId) {
      return alert('Consignment reference is required.');
    }
    const csgn = consignments.find(c => c.id === consignmentId);
    
    // Validate quantities
    for (const item of items) {
      if (item.returnQty > 0) {
        const orig = csgn?.items?.find((i: any) => i.productId === item.productId);
        if (orig && item.returnQty > orig.consignedQty) {
          return alert(`Return quantity for ${item.productName} cannot exceed consigned quantity (${orig.consignedQty}).`);
        }
      }
    }

    const activeItems = items.filter(i => i.returnQty > 0);
    if (activeItems.length === 0) {
      return alert('At least one item must have a return quantity > 0.');
    }

    const newRecord: ConsignmentReturnRecord = {
      id: activeRecord?.id || Date.now().toString(),
      returnNo: activeRecord?.returnNo || `CSRET-2026-${(records.length + 1).toString().padStart(4, '0')}`,
      consignmentId,
      consignmentNo: csgn?.consignmentNo || 'Unknown',
      vendorName: csgn?.vendorName || 'Unknown',
      returnDate,
      notes,
      items: activeItems,
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

  const handleStatusChange = (r: ConsignmentReturnRecord, newStatus: ReturnStatus) => {
    saveRecords(records.map(gr => gr.id === r.id ? { ...gr, status: newStatus } : gr));
    setIsViewModalOpen(false);
  };

  const filteredRecords = records.filter(w => 
    w.returnNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Consignment Return</h1>
          <p className="text-sm text-slate-500">Return unused consignment inventory</p>
        </div>
        <Button variant="primary" onClick={openNewForm}>
          <Plus className="w-4 h-4 mr-2 inline" /> New Return
        </Button>
      </div>

      <Card className="p-4 flex gap-4 bg-slate-50/50">
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Consignment Returns..."
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
              <th className="p-4">Return #</th>
              <th className="p-4">Consignment #</th>
              <th className="p-4">Date</th>
              <th className="p-4">Vendor</th>
              <th className="p-4 text-center">Items Returned</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRecords.map((w) => (
              <tr key={w.id} className="hover:bg-slate-50">
                <td className="p-4 font-mono font-bold text-xs">{w.returnNo}</td>
                <td className="p-4 font-mono text-xs">{w.consignmentNo}</td>
                <td className="p-4">{w.returnDate}</td>
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
              <tr><td colSpan={7} className="p-8 text-center text-slate-500">No consignment return records found.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {isFormModalOpen && (
        <Modal isOpen onClose={() => setIsFormModalOpen(false)} title="New Consignment Return" className="max-w-[800px]">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Select Consignment</label>
                <Select value={consignmentId} onChange={(e) => handleConsignmentChange(e.target.value)} options={[{ value: '', label: 'Select...' }, ...consignments.filter(c => c.status === 'ACTIVE').map(c => ({ value: c.id, label: `${c.consignmentNo} - ${c.vendorName}` }))]} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Return Date</label>
                <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
              </div>
            </div>
            
            <div className="mb-6">
               <h3 className="font-bold text-sm mb-2">Return Items</h3>
               <table className="w-full text-left text-sm border rounded">
                  <thead className="bg-slate-100 text-xs">
                     <tr>
                        <th className="p-2">Product</th>
                        <th className="p-2 w-24">Return Qty</th>
                     </tr>
                  </thead>
                  <tbody>
                     {items.map((m, i) => (
                        <tr key={m.id} className="border-t">
                           <td className="p-2 text-xs">{m.sku} - {m.productName}</td>
                           <td className="p-2">
                              <Input type="number" min="0" value={m.returnQty} onChange={(e) => {
                                 const val = parseInt(e.target.value) || 0;
                                 setItems(items.map((it, idx) => idx === i ? { ...it, returnQty: val } : it));
                              }} />
                           </td>
                        </tr>
                     ))}
                     {items.length === 0 && (
                        <tr><td colSpan={2} className="p-4 text-center text-xs text-slate-500">Please select an active consignment.</td></tr>
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
        <Modal isOpen onClose={() => setIsViewModalOpen(false)} title={`Consignment Return: ${activeRecord.returnNo}`} className="max-w-[800px]">
          <div className="p-6">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{activeRecord.vendorName}</h2>
                <p className="text-sm text-slate-500">Consignment: {activeRecord.consignmentNo}</p>
                <p className="text-xs text-slate-400">Date: {activeRecord.returnDate}</p>
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
