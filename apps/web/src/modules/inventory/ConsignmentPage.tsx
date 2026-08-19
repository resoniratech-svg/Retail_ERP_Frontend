import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Plus, Search, Eye, Edit, Trash2, X, Save, Printer, Download, FileText, Send, UploadCloud } from 'lucide-react';

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
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print</span>
                </button>
                <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-300">
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print Digital</span>
                </button>
              </div>
              
              <div className="flex items-center gap-2 pr-2">
                <Button variant="primary" className="py-1 px-2 text-xs h-7 flex items-center gap-1 font-bold" onClick={openNewForm}>
                  <Plus className="w-3.5 h-3.5" /> New Consignment
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
              Consignments
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

          <Card className="p-0 overflow-hidden shadow-sm flex-1">
            <div className="w-full h-full overflow-auto">
              <table className="w-full text-left text-sm whitespace-nowrap min-w-max">
                <thead className="bg-slate-100 uppercase text-[11px] font-semibold text-slate-700 border-b sticky top-0 z-10">
                  <tr>
                    <th className="p-4">Ref No</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Consignment No</th>
                    <th className="p-4">Vendor Name</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Other Ref No</th>
                    <th className="p-4">Notes</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRecords.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono font-bold text-xs">{w.id}</td>
                      <td className="p-4">{w.startDate}</td>
                      <td className="p-4">{w.consignmentNo}</td>
                      <td className="p-4 font-medium">{w.vendorName}</td>
                      <td className="p-4 text-xs text-slate-600">Saudi Arabia</td>
                      <td className="p-4">{w.reference}</td>
                      <td className="p-4">{w.notes}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setActiveRecord(w); setIsViewModalOpen(true); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr><td colSpan={8} className="p-8 text-center text-slate-500">No consignment records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* New Consignment Overlay Ribbon */}
      {isFormModalOpen && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900 z-50 flex flex-col">
          {/* GRN Style Top Action Toolbar */}
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700 px-3 py-2 shadow-sm text-[12px] font-medium">
            <button onClick={() => handleSaveForm('DRAFT')} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors text-slate-700 dark:text-slate-300">
              <Save className="w-4 h-4 text-blue-600" /> Save
            </button>
            <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors text-slate-700 dark:text-slate-300">
              <Save className="w-4 h-4 text-emerald-600" /> Save & New
            </button>
            <button onClick={() => handleSaveForm('ACTIVE')} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors text-slate-700 dark:text-slate-300">
              <Save className="w-4 h-4 text-green-600" /> Save & Close
            </button>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
            <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors text-slate-700 dark:text-slate-300">
              <UploadCloud className="w-4 h-4 text-orange-500" /> Post <span className="text-[10px] text-slate-400 font-normal ml-1">Ctrl + P</span>
            </button>
            
            <div className="ml-auto flex items-center pr-2">
              <button onClick={() => setIsFormModalOpen(false)} className="flex items-center justify-center hover:bg-rose-500 hover:text-white w-6 h-6 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 transition-colors bg-white dark:bg-slate-800 shadow-sm" title="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Consignment Details Header */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-300 dark:border-slate-700">
            <div className="px-3 py-1.5 font-bold text-slate-800 dark:text-slate-200 text-[12px]">
              Consignment Details <span className="ml-2 font-normal">Ref#: New</span>
            </div>
            <div className="px-3 pb-3 flex flex-col gap-2 text-[12px] text-slate-800 dark:text-slate-200 font-medium">
              {/* Row 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 w-[140px]">
                  <span>Consignment Ref#</span>
                  <input type="text" className="border border-slate-300 dark:border-slate-600 px-1.5 py-0.5 bg-white dark:bg-slate-950 shadow-sm h-[24px] rounded-sm focus:outline-none focus:border-blue-500 text-[12px] font-normal" />
                </div>
                <div className="flex flex-col gap-1 w-[120px]">
                  <span>Date</span>
                  <input type="date" defaultValue={startDate} className="border border-slate-300 dark:border-slate-600 px-1.5 py-0.5 bg-white dark:bg-slate-950 shadow-sm h-[24px] rounded-sm focus:outline-none focus:border-blue-500 text-[12px] font-normal" />
                </div>
                <div className="flex flex-col gap-1 w-[200px]">
                  <span>Vendor</span>
                  <div className="flex gap-1">
                    <select className="flex-1 border border-slate-300 dark:border-slate-600 px-1.5 py-0.5 bg-white dark:bg-slate-950 shadow-sm h-[24px] rounded-sm focus:outline-none focus:border-blue-500 text-[12px] font-normal text-slate-500">
                      <option>[Select a Vendor]</option>
                    </select>
                    <div className="w-[24px] h-[24px] bg-blue-50 dark:bg-blue-900/30 border border-blue-400 dark:border-blue-700 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-[16px] leading-none cursor-pointer hover:bg-blue-100 shrink-0">+</div>
                    <span className="text-slate-500 font-medium self-center text-[10px]">F4</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-[160px]">
                  <span>Other Ref#</span>
                  <input type="text" className="border border-slate-300 dark:border-slate-600 px-1.5 py-0.5 bg-white dark:bg-slate-950 shadow-sm h-[24px] rounded-sm focus:outline-none focus:border-blue-500 text-[12px] font-normal" />
                </div>
                <div className="flex items-end pb-[1px] pl-4">
                  <button className="flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 h-[24px] rounded-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors font-medium">
                    <Save className="w-3.5 h-3.5 text-slate-500" /> Save
                  </button>
                </div>
                
                <div className="ml-auto flex items-end gap-2 pb-[1px] pr-2">
                  <button className="flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 h-[24px] rounded-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors font-medium">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" /> 
                    Remove <span className="text-[9px] text-slate-400 font-normal ml-1">F2</span>
                  </button>
                  <button className="flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 h-[24px] rounded-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors font-medium">
                    <Printer className="w-3.5 h-3.5 text-blue-500" /> 
                    Save & Print <span className="text-[9px] text-slate-400 font-normal ml-1">F1</span>
                  </button>
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 w-[276px]">
                  <span>Location</span>
                  <select className="border border-slate-300 dark:border-slate-600 px-1.5 py-0.5 bg-white dark:bg-slate-950 shadow-sm h-[24px] rounded-sm focus:outline-none focus:border-blue-500 text-[12px] font-normal">
                    <option>Saudi Arabia</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1 w-[200px]">
                  <span>Consignment Terms</span>
                  <select className="border border-slate-300 dark:border-slate-600 px-1.5 py-0.5 bg-white dark:bg-slate-950 shadow-sm h-[24px] rounded-sm focus:outline-none focus:border-blue-500 text-[12px] font-normal text-slate-500">
                    <option>Choose Term</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Table */}
          <div className="flex-1 overflow-auto bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700 shadow-sm flex flex-col relative">
            <table className="w-full text-left text-[11px] whitespace-nowrap border-collapse text-slate-700 dark:text-slate-300">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10 border-b border-slate-300 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200">
                <tr>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-10 text-center"></th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-24">Code</th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-32">Barcode</th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 min-w-[200px]">Product</th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-16">Unit</th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-16">UOM</th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-16">Qty</th>
                  <th className="font-normal px-2 py-1.5 border-r border-slate-300 dark:border-slate-700 w-48">Remarks</th>
                  <th className="font-normal px-2 py-1.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700 text-center text-slate-400">*</td>
                  <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700"></td>
                  <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700"></td>
                  <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700"></td>
                  <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700"></td>
                  <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700"></td>
                  <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700"></td>
                  <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700"></td>
                  <td className="px-2 py-1.5"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Area */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2 h-24 flex items-start text-[11px] text-slate-700 dark:text-slate-300 gap-6">
            <div className="flex flex-col gap-1 w-64">
              <span>Notes</span>
              <textarea className="w-full border border-slate-300 dark:border-slate-600 p-1 bg-white dark:bg-slate-950 shadow-sm rounded-sm focus:outline-none focus:border-blue-500 h-[50px] resize-none"></textarea>
            </div>
            
            <div className="flex items-center gap-2 mt-4 ml-8">
              <span className="text-slate-500">Product Search Mode</span>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-sm px-2 py-0.5 shadow-sm">
                <span className="text-slate-600 font-medium">Contains</span>
                <div className="w-6 h-3 bg-slate-200 dark:bg-slate-700 rounded-full relative shadow-inner border border-slate-300 dark:border-slate-600">
                   <div className="w-2.5 h-2.5 bg-white border border-slate-400 absolute left-[1px] top-[1px] shadow-sm rounded-sm"></div>
                </div>
                <span className="text-slate-400">Start With</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal logic (unmodified structure) */}
      {isViewModalOpen && activeRecord && (
        <Modal isOpen onClose={() => setIsViewModalOpen(false)} title={`Consignment: ${activeRecord.consignmentNo}`} className="max-w-[800px]">
          <div className="p-6">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{activeRecord.vendorName}</h2>
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
