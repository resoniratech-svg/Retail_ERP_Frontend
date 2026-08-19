import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Search, Plus, Eye, CheckSquare, XCircle, Send, CornerUpLeft, Save, FileText } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative">
      {!isFormModalOpen && !isViewModalOpen && (
        <div className="flex flex-col h-full gap-2">
          <div className="flex flex-col border border-slate-300 rounded-sm bg-[#f1f5f9] shadow-sm">
            {/* Top Action Bar */}
            <div className="flex flex-wrap items-center justify-between p-1 border-b border-slate-300 bg-white">
              <div className="flex items-center">
                <button className="flex items-center gap-1 px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[11px] text-slate-700 font-bold">
                  <CornerUpLeft className="w-4 h-4 text-blue-800" />
                  <span>UnPost</span>
                </button>
                <button className="flex items-center gap-1 px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[11px] text-slate-700 font-bold">
                  <span>Show Consumption Details</span>
                </button>
              </div>
              
              <div className="flex items-center gap-2 pr-2">
                <Button variant="primary" className="py-1 px-2 text-xs h-7 flex items-center gap-1 font-bold bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white" onClick={openNewForm}>
                  <Plus className="w-3.5 h-3.5" /> New Request
                </Button>
              </div>
            </div>

            {/* Title Bar */}
            <div className="bg-[#e2e8f0] border-b border-slate-300 py-1 px-3 text-[12px] font-bold text-slate-800 flex justify-center">
              Production Request
            </div>

            {/* Search Row */}
            <div className="flex items-center gap-2 p-1.5 bg-[#f8fafc] border-b border-slate-300">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Enter text to search..." 
                  className="w-48 px-2 py-0.5 text-[11px] border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="absolute right-0 top-0 h-full px-1 border-l border-slate-300 hover:bg-slate-100 flex items-center justify-center">
                  <span className="w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-transparent border-t-slate-600"></span>
                </button>
              </div>
              <button className="px-3 py-0.5 text-[11px] bg-[#f0f4f8] border border-slate-400 shadow-[inset_1px_1px_0px_#fff] text-black hover:bg-slate-200">
                Find
              </button>
              <button className="px-3 py-0.5 text-[11px] bg-[#f0f4f8] border border-slate-400 shadow-[inset_1px_1px_0px_#fff] text-black hover:bg-slate-200" onClick={() => setSearchTerm('')}>
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
                    <th className="p-4">Entry Date</th>
                    <th className="p-4">Request Date</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Created By</th>
                    <th className="p-4">Created On</th>
                    <th className="p-4">Approved By</th>
                    <th className="p-4">Appoved On</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Request Posted</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRecords.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono font-bold text-xs">{w.requestNo}</td>
                      <td className="p-4 text-xs">{w.createdDate.split('T')[0]}</td>
                      <td className="p-4 text-xs font-semibold">{w.requestDate}</td>
                      <td className="p-4 font-medium text-xs">{w.warehouseName}</td>
                      <td className="p-4 text-slate-700 text-xs">{w.createdBy}</td>
                      <td className="p-4 text-xs text-slate-600">{new Date(w.createdDate).toLocaleTimeString()}</td>
                      <td className="p-4 text-xs text-slate-600">System</td>
                      <td className="p-4 text-xs text-slate-600">{w.createdDate.split('T')[0]}</td>
                      <td className="p-4 text-center">{getStatusBadge(w.status)}</td>
                      <td className="p-4 text-center">
                        <input type="checkbox" checked={w.status === 'PROCESSED'} readOnly className="mt-0.5" />
                      </td>
                      <td className="p-4 text-center">
                        <Button variant="ghost" size="sm" onClick={() => { setActiveRecord(w); setIsViewModalOpen(true); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr><td colSpan={11} className="p-8 text-center text-slate-500">No records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {isFormModalOpen && (
        <Modal isOpen onClose={() => setIsFormModalOpen(false)} title="New Production Request" className="max-w-[1200px]">
          <div className="relative bg-[#f0f4f8] flex flex-col h-[80vh] w-full border border-slate-300 shadow-sm">
            {/* Top Action Bar */}
            <div className="flex items-center gap-1 px-2 py-1 bg-[#f1f5f9] border-b border-slate-300">
              <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => handleSaveForm(true)}>
                <Save className="w-4 h-4 text-blue-600 mb-0.5" />
                <span>Save</span>
              </button>
              <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700">
                <FileText className="w-4 h-4 text-blue-600 mb-0.5" />
                <span>Save & New</span>
              </button>
              <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => handleSaveForm(false)}>
                <Save className="w-4 h-4 text-green-600 mb-0.5" />
                <span>Save & Close</span>
              </button>
              <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700">
                <CheckSquare className="w-4 h-4 text-orange-500 mb-0.5" />
                <span>Post</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-2 bg-[#f0f4f8] flex flex-col gap-2 [&::-webkit-scrollbar]:hidden">
              
              {/* Details Section */}
              <div className="bg-[#f0f4f8] border-b border-slate-300 pb-2 flex flex-col gap-2">
                
                {/* Form fields mimicking 3 column layout */}
                <div className="flex items-end gap-3 pl-1 mb-2">
                  <div className="flex flex-col gap-1 w-[130px]">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-slate-800">Ref No :</label>
                      <span className="text-[11px] font-bold text-slate-800">New</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 pl-1">
                  {/* Column 1 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-medium text-slate-700 w-24 text-right">Entry Date</label>
                      <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="flex-1 text-xs h-6 border border-slate-300 px-2 bg-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-medium text-slate-700 w-24 text-right">Request Date</label>
                      <input type="date" value={formRequiredDate} onChange={(e) => setFormRequiredDate(e.target.value)} className="flex-1 text-xs h-6 border border-slate-300 px-2 bg-white" />
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-medium text-slate-700 w-16 text-right">Location</label>
                      <select value={formWarehouse} onChange={(e) => setFormWarehouse(e.target.value)} className="flex-1 text-xs h-6 border border-slate-300 px-1 bg-white text-slate-600">
                        <option value="">Select Location...</option>
                        {WAREHOUSES.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-16"></div>
                      <input type="checkbox" id="show-limit" className="w-3 h-3 border-slate-300" />
                      <label htmlFor="show-limit" className="text-[11px] text-slate-700 cursor-pointer">Show daily production limit upon selection</label>
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div className="flex flex-col gap-2 justify-between">
                    <div className="flex items-center gap-2 h-6 pl-4">
                      <label className="text-[11px] font-medium text-slate-700">Status :</label>
                      <span className="text-[11px] font-bold text-slate-800">New</span>
                    </div>
                    <div className="flex items-center gap-2 mt-auto">
                      <button className="h-6 px-4 text-[11px] font-bold bg-[#f0f4f8] border border-slate-400 text-slate-800 ml-auto shadow-[inset_1px_1px_0px_#fff]">
                        Show Consumption Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Area */}
              <div className="flex-1 min-h-[300px] bg-white border border-slate-300 rounded-sm relative flex flex-col">
                <div className="flex-1 overflow-auto flex flex-col relative">
                  <table className="w-full h-full text-left text-[11px] whitespace-nowrap min-w-max border-collapse">
                    <thead className="bg-[#f8fafc] text-slate-700 border-b border-slate-300 sticky top-0 z-10 shadow-sm font-normal">
                      <tr>
                        <th className="p-1 px-2 border-r border-slate-200 text-center w-8 font-normal">*</th>
                        <th className="p-1 px-2 border-r border-slate-200 text-center font-normal">SlNo</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal">Code</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal">Barcode</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal">ItemName</th>
                        <th className="p-1 px-2 border-r border-slate-200 text-center font-normal">Unit</th>
                        <th className="p-1 px-2 border-r border-slate-200 text-center font-normal">UOM</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal">Additional Cost</th>
                        <th className="p-1 px-2 border-r border-slate-200 text-center font-normal">Requested Qty</th>
                        <th className="p-1 px-2 border-r border-slate-200 text-center font-normal">Plan Qty</th>
                        <th className="p-1 px-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-slate-50 h-7 border-b border-slate-200">
                        <td className="p-1 border-r border-slate-200 text-center font-bold text-slate-800">*</td>
                        <td className="p-1 border-r border-slate-200 text-center">1</td>
                        <td className="p-0 border-r border-slate-200">
                          <input type="text" className="w-full bg-transparent outline-none h-6 px-2 focus:bg-white focus:ring-1 focus:ring-slate-300" placeholder="" />
                        </td>
                        <td className="p-0 border-r border-slate-200"></td>
                        <td className="p-0 border-r border-slate-200"></td>
                        <td className="p-0 border-r border-slate-200 text-center"></td>
                        <td className="p-0 border-r border-slate-200 text-center"></td>
                        <td className="p-0 border-r border-slate-200">
                          <input type="number" className="w-full bg-transparent outline-none h-6 px-2 text-right focus:bg-white focus:ring-1 focus:ring-slate-300" />
                        </td>
                        <td className="p-0 border-r border-slate-200">
                          <input type="number" className="w-full bg-transparent outline-none h-6 px-2 text-right focus:bg-white focus:ring-1 focus:ring-slate-300" />
                        </td>
                        <td className="p-0 border-r border-slate-200">
                          <input type="number" className="w-full bg-transparent outline-none h-6 px-2 text-right focus:bg-white focus:ring-1 focus:ring-slate-300" />
                        </td>
                        <td className="p-1 text-center">
                          <button className="text-red-500 hover:text-red-700 font-bold">
                            <XCircle className="w-3.5 h-3.5 mx-auto" />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={11} className="p-8 text-center text-slate-400 text-xs italic">
                           No items added.
                        </td>
                      </tr>
                      <tr className="h-full">
                        <td colSpan={11}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
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
