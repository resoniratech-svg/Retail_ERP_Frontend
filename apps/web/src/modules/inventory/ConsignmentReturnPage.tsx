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
          {/* Desktop App Style Action Toolbar */}
          <div className="flex items-center gap-4 px-3 py-1.5 bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700 shadow-sm text-[12px] text-slate-700 dark:text-slate-300">
            <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
              <Save className="w-4 h-4 text-blue-600" /> Save Layout
            </button>
            <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
              <Printer className="w-4 h-4 text-slate-500" /> Print
            </button>
            <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
              <Download className="w-4 h-4 text-blue-500" /> Print Digital
            </button>
            <div className="ml-auto">
              <Button variant="primary" onClick={openNewForm} className="h-6 text-[11px] px-2 py-0 bg-emerald-600 hover:bg-emerald-700 border-none">
                <Plus className="w-3 h-3 mr-1 inline" /> New Return
              </Button>
            </div>
          </div>

          <div className="bg-slate-200 dark:bg-slate-800 text-center py-1 text-[12px] font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-700 shadow-sm">
            ConsignmentReturns
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 px-2 py-1 flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter text to search..."
              className="w-64 border border-slate-300 dark:border-slate-600 px-2 py-1 bg-white dark:bg-slate-950 text-[11px] shadow-sm rounded-sm focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="px-4 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-sm text-[11px] font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-slate-700 dark:text-slate-300">
              Find
            </button>
            <button 
              className="px-4 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-sm text-[11px] font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-slate-700 dark:text-slate-300"
              onClick={() => setSearchTerm('')}
            >
              Clear
            </button>
          </div>

          <div className="flex-1 bg-white dark:bg-slate-900 border-t border-slate-300 dark:border-slate-700 shadow-sm overflow-auto">
            <table className="w-full text-left whitespace-nowrap border-collapse text-slate-700 dark:text-slate-300 table-fixed">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10 border-b border-slate-300 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200 uppercase text-[9px] font-bold">
                <tr>
                  <th className="px-2 py-2 border-r border-slate-300 dark:border-slate-700">Ref No</th>
                  <th className="px-2 py-2 border-r border-slate-300 dark:border-slate-700">Date</th>
                  <th className="px-2 py-2 border-r border-slate-300 dark:border-slate-700">Consignment Return No</th>
                  <th className="px-2 py-2 border-r border-slate-300 dark:border-slate-700">Vendor Name</th>
                  <th className="px-2 py-2 border-r border-slate-300 dark:border-slate-700">Location</th>
                  <th className="px-2 py-2 border-r border-slate-300 dark:border-slate-700">Other Ref No</th>
                  <th className="px-2 py-2 border-r border-slate-300 dark:border-slate-700">Notes</th>
                  <th className="px-2 py-2 text-center w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50 text-[10px]">
                {filteredRecords.map((w) => (
                  <tr key={w.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20">
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700/50 truncate">{w.id}</td>
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700/50 truncate">{w.returnDate}</td>
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700/50 truncate">{w.returnNo}</td>
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700/50 truncate">{w.vendorName}</td>
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700/50 truncate">Saudi Arabia</td>
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700/50 truncate">{w.consignmentNo}</td>
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700/50 truncate">{w.notes}</td>
                    <td className="px-2 py-1.5 text-center">
                      <Button variant="ghost" size="sm" onClick={() => { setActiveRecord(w); setIsViewModalOpen(true); }} className="h-5 px-2 py-0">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr><td colSpan={8} className="p-4 text-center text-slate-500">No consignment return records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-slate-200/50 dark:bg-slate-800/50 p-1 border border-slate-300 dark:border-slate-700 flex items-center text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <button className="px-1 hover:text-slate-900 dark:hover:text-white">|&lt;&lt;</button>
              <button className="px-1 hover:text-slate-900 dark:hover:text-white">&lt;</button>
              <span className="px-2">ConsignmentReturn 0 of 0</span>
              <button className="px-1 hover:text-slate-900 dark:hover:text-white">&gt;</button>
              <button className="px-1 hover:text-slate-900 dark:hover:text-white">&gt;&gt;|</button>
            </div>
          </div>
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
            <button onClick={() => handleSaveForm('APPROVED')} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors text-slate-700 dark:text-slate-300">
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
              ConsignmentReturn Details <span className="ml-2 font-normal">Ref#: New</span>
            </div>
            <div className="px-3 pb-3 flex flex-col gap-2 text-[12px] text-slate-800 dark:text-slate-200 font-medium">
              {/* Row 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 w-[180px]">
                  <span>Consignment Return Ref#</span>
                  <input type="text" className="border border-slate-300 dark:border-slate-600 px-1.5 py-0.5 bg-white dark:bg-slate-950 shadow-sm h-[24px] rounded-sm focus:outline-none focus:border-blue-500 text-[12px] font-normal" />
                </div>
                <div className="flex flex-col gap-1 w-[120px]">
                  <span>Date</span>
                  <input type="date" defaultValue={returnDate} className="border border-slate-300 dark:border-slate-600 px-1.5 py-0.5 bg-white dark:bg-slate-950 shadow-sm h-[24px] rounded-sm focus:outline-none focus:border-blue-500 text-[12px] font-normal" />
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
                  <span>ConsignmentReturn Terms</span>
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
