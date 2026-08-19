import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Plus, Search, Eye, Edit, Trash2, X, Save, Printer, Download, FileText, Send, UploadCloud } from 'lucide-react';

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
                  <Plus className="w-3.5 h-3.5" /> New Return
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
              ConsignmentReturns
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
                    <th className="p-4">Consignment Return No</th>
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
                      <td className="p-4">{w.returnDate}</td>
                      <td className="p-4">{w.returnNo}</td>
                      <td className="p-4 font-medium">{w.vendorName}</td>
                      <td className="p-4 text-xs text-slate-600">Saudi Arabia</td>
                      <td className="p-4">{w.consignmentNo}</td>
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
                    <tr><td colSpan={8} className="p-8 text-center text-slate-500">No consignment return records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* --- ADD / EDIT FORM (EMBEDDED) --- */}
      {isFormModalOpen && (
        <div className="relative flex-1 bg-[#f0f4f8] flex flex-col border border-slate-300 dark:border-slate-800 shadow-sm animate-in fade-in duration-200">
          
          {/* Header */}
          <div className="px-2 py-1 border-b border-slate-300 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center text-[12px] font-semibold text-slate-800">
              New ConsignmentReturn - DART POS
            </div>
            <button onClick={() => setIsFormModalOpen(false)} className="p-0.5 hover:bg-slate-200 text-slate-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Top Action Bar */}
          <div className="flex items-center gap-1 px-2 py-1 bg-[#f1f5f9] border-b border-slate-300">
            <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => handleSaveForm('DRAFT')}>
              <Save className="w-4 h-4 text-blue-600 mb-0.5" />
              <span>Save</span>
            </button>
            <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => handleSaveForm('DRAFT')}>
              <Save className="w-4 h-4 text-emerald-600 mb-0.5" />
              <span>Save & New</span>
            </button>
            <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => handleSaveForm('APPROVED')}>
              <Save className="w-4 h-4 text-green-600 mb-0.5" />
              <span>Save & Close</span>
            </button>
            <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700">
              <UploadCloud className="w-4 h-4 text-orange-500 mb-0.5" />
              <span>Post</span>
            </button>
            <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700">
              <Trash2 className="w-4 h-4 text-red-500 mb-0.5" />
              <span>Remove</span>
            </button>
            <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700">
              <Printer className="w-4 h-4 text-blue-500 mb-0.5" />
              <span>Save & Print</span>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-2 bg-[#f0f4f8] flex flex-col gap-2 [&::-webkit-scrollbar]:hidden">
            
            {/* Details Section */}
            <div className="bg-[#f0f4f8] border-b border-slate-300 pb-2">
              <div className="flex items-center gap-4 text-[11px] font-bold text-slate-800 mb-2 pl-1">
                <span>ConsignmentReturn Details</span>
                <span className="font-normal text-slate-600">Ref#: New</span>
              </div>
              
              <div className="flex flex-col gap-2 pl-1">
                {/* Row 1 */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-[260px]">
                    <label className="text-[11px] font-medium text-slate-700 w-32">Consignment Return Ref#</label>
                    <input type="text" className="flex-1 text-xs h-6 border border-slate-300 px-2 bg-white" />
                  </div>
                  <div className="flex items-center gap-1 w-[180px]">
                    <label className="text-[11px] font-medium text-slate-700 w-12 pl-2">Date</label>
                    <input type="date" className="flex-1 text-xs h-6 border border-slate-300 px-2 bg-white" defaultValue={returnDate} />
                  </div>
                  <div className="flex items-center gap-1 w-[260px]">
                    <label className="text-[11px] font-medium text-slate-700 w-16 pl-2">Vendor</label>
                    <select className="flex-1 text-xs h-6 border border-slate-300 px-1 bg-white text-slate-600">
                      <option>[Select a Vendor]</option>
                    </select>
                    <Button variant="outline" className="h-6 w-6 p-0 shrink-0 border-slate-300 bg-white"><Plus className="w-3 h-3 text-blue-500" /></Button>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 w-[260px]">
                    <label className="text-[11px] font-medium text-slate-700 w-32">Location</label>
                    <select className="flex-1 text-xs h-6 border border-slate-300 px-1 bg-white">
                      <option>Saudi Arabia</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1 w-[180px]">
                    <label className="text-[11px] font-medium text-slate-700 w-12 pl-2">Terms</label>
                    <select className="flex-1 text-xs h-6 border border-slate-300 px-1 bg-white text-slate-600">
                      <option>Choose Term</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1 w-[260px]">
                    <label className="text-[11px] font-medium text-slate-700 w-16 pl-2">Other Ref#</label>
                    <input type="text" className="flex-1 text-xs h-6 border border-slate-300 px-2 bg-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Table Block */}
            <div className="bg-white border border-slate-300 shadow-sm flex flex-col flex-1 min-h-[250px]">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-[11px] whitespace-nowrap min-w-max border-collapse">
                  <thead className="bg-[#f0f4f8] font-semibold text-slate-600 border-b border-slate-300 uppercase">
                    <tr>
                      <th className="p-1.5 border-r border-slate-300 w-24">Code</th>
                      <th className="p-1.5 border-r border-slate-300 w-32">Barcode</th>
                      <th className="p-1.5 border-r border-slate-300 min-w-[200px]">Product</th>
                      <th className="p-1.5 border-r border-slate-300 w-16">Unit</th>
                      <th className="p-1.5 border-r border-slate-300 w-16">UOM</th>
                      <th className="p-1.5 border-r border-slate-300 w-16 text-right">Qty</th>
                      <th className="p-1.5 border-r border-slate-300">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="hover:bg-blue-50 bg-white">
                      <td className="p-1.5 border-r border-slate-200 text-center text-slate-400">*</td>
                      <td className="p-1.5 border-r border-slate-200"></td>
                      <td className="p-1.5 border-r border-slate-200"></td>
                      <td className="p-1.5 border-r border-slate-200"></td>
                      <td className="p-1.5 border-r border-slate-200"></td>
                      <td className="p-1.5 border-r border-slate-200"></td>
                      <td className="p-1.5 border-r border-slate-200"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Block */}
            <div className="flex gap-2 shrink-0 h-24">
              <div className="w-[320px] bg-white border border-slate-300 rounded-sm shadow-sm flex flex-col">
                <div className="flex bg-[#f0f4f8] border-b border-slate-300 text-[10px]">
                  <button className="px-2 py-1 font-semibold text-slate-700 bg-white border-r border-slate-300 border-t-2 border-t-blue-500">Notes</button>
                </div>
                <div className="flex-1 p-2 flex flex-col">
                  <textarea className="w-full h-full border border-slate-300 p-1 text-xs resize-none"></textarea>
                </div>
              </div>
              <div className="flex-1"></div>
            </div>

          </div>
        </div>
      )}

      {/* View Modal logic */}
      {isViewModalOpen && activeRecord && (
        <Modal isOpen onClose={() => setIsViewModalOpen(false)} title={`Return: ${activeRecord.returnNo}`} className="max-w-[800px]">
          <div className="p-6">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{activeRecord.vendorName}</h2>
                <p className="text-sm text-slate-500">Date: {activeRecord.returnDate}</p>
              </div>
              {getStatusBadge(activeRecord.status)}
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
