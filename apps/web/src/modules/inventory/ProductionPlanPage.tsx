import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Search, Plus, Eye, Trash2, Save, CheckCircle, X, XCircle } from 'lucide-react';
import { productsService } from '@qatar-erp/api';

const STORAGE_KEY = 'retail_erp_production_plans';
const CURRENT_USER = 'Ahmed Al-Mansouri';
const WAREHOUSES = [
  { id: 'wh-01', name: 'Main Distribution Center (Doha)' },
  { id: 'wh-02', name: 'City Center Mall Branch' },
  { id: 'wh-03', name: 'Al Wakrah Retail Store' },
];

type PlanStatus = 'DRAFT' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface MaterialReq {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  requiredQuantity: number;
  uom: string;
  availableQuantity: number;
  remarks: string;
}

interface ProductionPlan {
  id: string;
  planNo: string;
  planDate: string;
  startDate: string;
  endDate: string;
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productSku: string;
  productName: string;
  plannedQuantity: number;
  priority: string;
  remarks: string;
  materials: MaterialReq[];
  status: PlanStatus;
  createdDate: string;
  createdBy: string;
}

export const ProductionPlanPage: React.FC = () => {
  const [records, setRecords] = useState<ProductionPlan[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const [activeRecord, setActiveRecord] = useState<ProductionPlan | null>(null);

  // Form State
  const [formWarehouse, setFormWarehouse] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formProduct, setFormProduct] = useState('');
  const [formQty, setFormQty] = useState<number>(0);
  const [formPriority, setFormPriority] = useState('Medium');
  const [formRemarks, setFormRemarks] = useState('');
  const [formMaterials, setFormMaterials] = useState<MaterialReq[]>([]);

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

  const saveRecords = (data: ProductionPlan[]) => {
    setRecords(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const generateNo = () => {
    return `PPL-2026-${(records.length + 1).toString().padStart(4, '0')}`;
  };

  const getStatusBadge = (status: PlanStatus) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="neutral">Draft</Badge>;
      case 'APPROVED': return <Badge variant="info">Approved</Badge>;
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
    setFormStartDate('');
    setFormEndDate('');
    setFormProduct('');
    setFormQty(0);
    setFormPriority('Medium');
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
      uom: 'PCS',
      availableQuantity: prod.stockQuantity || 0,
      remarks: ''
    }]);
  };

  const handleSaveForm = (isSubmit: boolean = false) => {
    if (!formWarehouse) return alert('Warehouse is required.');
    if (!formStartDate || !formEndDate) return alert('Start and End dates are required.');
    if (new Date(formStartDate) > new Date(formEndDate)) return alert('Start Date cannot be after End Date.');
    if (!formProduct) return alert('Product is required.');
    if (formQty <= 0) return alert('Planned quantity must be greater than 0.');
    if (formMaterials.some(m => m.requiredQuantity <= 0)) return alert('Material quantities must be greater than 0.');

    const prod = products.find(p => p.id === formProduct);
    if (!prod) return;

    const newRecord: ProductionPlan = {
      id: activeRecord?.id || Date.now().toString(),
      planNo: activeRecord?.planNo || generateNo(),
      planDate: formDate,
      startDate: formStartDate,
      endDate: formEndDate,
      warehouseId: formWarehouse,
      warehouseName: WAREHOUSES.find(w => w.id === formWarehouse)?.name || formWarehouse,
      productId: prod.id,
      productSku: prod.sku,
      productName: prod.name,
      plannedQuantity: formQty,
      priority: formPriority,
      remarks: formRemarks,
      materials: formMaterials,
      status: isSubmit ? 'APPROVED' : 'DRAFT',
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

  const handleStatusChange = (r: ProductionPlan, newStatus: PlanStatus) => {
    saveRecords(records.map(sa => sa.id === r.id ? { ...sa, status: newStatus } : sa));
    setIsViewModalOpen(false);
  };

  const filteredRecords = records.filter(w => {
    if (statusFilter !== 'ALL' && w.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return w.planNo.toLowerCase().includes(q) || 
             w.productName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-4 bg-slate-50 min-h-screen">
      <div className="flex items-center gap-4 py-2 px-3">
        <button className="flex items-center gap-1 text-slate-700 hover:text-blue-600 text-xs font-bold">
          <span className="text-blue-600 font-extrabold text-lg leading-none mt-[-4px]">↶</span> UnPost
        </button>
        <button className="text-slate-700 hover:text-blue-600 text-xs font-bold">
          Show Consumption Details
        </button>
      </div>

      <div className="bg-white border border-slate-300 rounded-sm shadow-sm flex flex-col min-h-[450px] mx-2">
        <div className="bg-[#f0f4f8] border-b border-slate-300 flex items-center justify-between px-2 py-1.5">
           <div className="flex-1"></div>
           <div className="font-bold text-[12px] text-slate-800">Production Plan</div>
           <div className="flex-1 flex justify-end">
              <Button variant="primary" size="sm" className="h-6 text-[11px] px-3 bg-teal-600 hover:bg-teal-700" onClick={openNewForm}>
                 + New Plan
              </Button>
           </div>
        </div>

        <div className="flex items-center gap-2 p-2 border-b border-slate-200">
           <div className="flex items-center border border-slate-300 bg-white rounded-sm">
             <input 
               type="text" 
               placeholder="Enter text to search..." 
               className="text-[11px] p-1 w-48 outline-none" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             <button className="px-2 border-l border-slate-300 hover:bg-slate-50 text-[11px] text-slate-500">▼</button>
           </div>
           <button className="px-3 py-1 border border-slate-300 bg-white hover:bg-slate-50 text-[11px] font-bold rounded-sm text-slate-700">Find</button>
           <button className="px-3 py-1 border border-slate-300 bg-white hover:bg-slate-50 text-[11px] font-bold rounded-sm text-slate-700" onClick={() => setSearchTerm('')}>Clear</button>
        </div>

        <div className="flex-1 overflow-auto flex flex-col">
          <table className="w-full text-left text-[11px] whitespace-nowrap min-w-max">
            <thead className="text-slate-600 border-b border-slate-300 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">REF NO</th>
                <th className="p-3">ENTRY DATE</th>
                <th className="p-3">REQUEST DATE</th>
                <th className="p-3">LOCATION</th>
                <th className="p-3">CREATED BY</th>
                <th className="p-3">CREATED ON</th>
                <th className="p-3">APPROVED BY</th>
                <th className="p-3">APPOVED ON</th>
                <th className="p-3 text-center">STATUS</th>
                <th className="p-3">REQUEST POSTED</th>
                <th className="p-3 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50 h-8 border-b border-slate-100">
                  <td className="p-3 font-mono font-bold text-blue-600 cursor-pointer hover:underline" onClick={() => { setActiveRecord(w); setIsViewModalOpen(true); }}>{w.planNo}</td>
                  <td className="p-3">{w.planDate}</td>
                  <td className="p-3">{w.startDate}</td>
                  <td className="p-3">{w.warehouseName}</td>
                  <td className="p-3">{w.createdBy}</td>
                  <td className="p-3">{new Date(w.createdDate).toLocaleDateString()}</td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3 text-center">{getStatusBadge(w.status)}</td>
                  <td className="p-3"></td>
                  <td className="p-3 text-center">
                    <Button variant="ghost" size="sm" onClick={() => { setActiveRecord(w); setIsViewModalOpen(true); }}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs italic">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormModalOpen && (
        <Modal isOpen onClose={() => setIsFormModalOpen(false)} title="New Production Request" className="max-w-[1000px] w-full p-0 flex flex-col bg-[#e6e8eb] shadow-2xl border border-slate-400">
          <div className="flex flex-col h-[550px] font-sans">
            <div className="flex items-center gap-2 p-1 bg-[#f0f4f8] border-b border-slate-300">
              <button className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded hover:bg-blue-50 text-[11px] font-medium text-slate-700 shadow-sm" onClick={() => handleSaveForm(false)}>
                <Save className="w-3.5 h-3.5 text-blue-600" /> Save & New
              </button>
              <button className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded hover:bg-blue-50 text-[11px] font-medium text-slate-700 shadow-sm" onClick={() => handleSaveForm(true)}>
                <Save className="w-3.5 h-3.5 text-blue-600" /> Save & Close
              </button>
              <button className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded hover:bg-blue-50 text-[11px] font-medium text-slate-700 shadow-sm" onClick={() => handleSaveForm(true)}>
                <CheckCircle className="w-3.5 h-3.5 text-yellow-500" /> Post
              </button>
            </div>

            <div className="flex-1 flex flex-col p-2 bg-[#f0f4f8]">
              <div className="bg-white border border-slate-300 rounded-sm shadow-sm p-3 mb-2">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-[12px] font-bold text-slate-800">Ref No :</label>
                      <span className="text-[12px] font-bold text-slate-800">New</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 pl-1">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-medium text-slate-700 w-24 text-right">Entry Date</label>
                      <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="flex-1 text-xs h-6 border border-slate-300 px-2 bg-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-medium text-slate-700 w-24 text-right">Request Date</label>
                      <input type="date" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} className="flex-1 text-xs h-6 border border-slate-300 px-2 bg-white" />
                    </div>
                  </div>

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

                  <div className="flex flex-col gap-2 justify-between">
                    <div className="flex items-center gap-2 h-6 pl-4">
                      <label className="text-[11px] font-medium text-slate-700">Status :</label>
                      <span className="text-[11px] font-bold text-slate-800">New</span>
                    </div>
                    <div className="flex items-center gap-2 mt-auto">
                      <button className="h-6 px-4 text-[11px] font-normal bg-[#f0f4f8] border border-slate-400 text-slate-800 ml-auto shadow-[inset_1px_1px_0px_#fff] hover:bg-slate-200">
                        Show Consumption Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-h-[250px] bg-white border border-slate-300 rounded-sm relative flex flex-col">
                <div className="flex-1 overflow-auto flex flex-col relative">
                  <table className="w-full h-full text-left text-[11px] whitespace-nowrap min-w-max border-collapse">
                    <thead className="bg-[#f8fafc] text-slate-700 border-b border-slate-300 sticky top-0 z-10 shadow-sm font-normal">
                      <tr>
                        <th className="p-1 px-2 border-r border-slate-200 text-center w-8 font-normal">*</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal text-center">SlNo</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal">Code</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal">Barcode</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal">ItemName</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal text-center">Unit</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal text-center">UOM</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal">Additional Cost</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal text-right">Requested Qty</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal text-right">Plan Qty</th>
                        <th className="p-1 px-2 border-slate-200 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-slate-50 h-7 border-b border-slate-200">
                        <td className="p-1 border-r border-slate-200 text-center font-bold text-slate-800">▶</td>
                        <td className="p-0 border-r border-slate-200">
                          <input type="text" className="w-full bg-transparent outline-none h-6 px-2 focus:bg-white focus:ring-1 focus:ring-slate-300" placeholder="" />
                        </td>
                        <td className="p-0 border-r border-slate-200">
                          <input type="text" className="w-full bg-transparent outline-none h-6 px-2 focus:bg-white focus:ring-1 focus:ring-slate-300" placeholder="" />
                        </td>
                        <td className="p-0 border-r border-slate-200">
                          <input type="text" className="w-full bg-transparent outline-none h-6 px-2 focus:bg-white focus:ring-1 focus:ring-slate-300" placeholder="" />
                        </td>
                        <td className="p-0 border-r border-slate-200">
                          <input type="text" className="w-full bg-transparent outline-none h-6 px-2 focus:bg-white focus:ring-1 focus:ring-slate-300" placeholder="" />
                        </td>
                        <td className="p-0 border-r border-slate-200">
                          <input type="text" className="w-full bg-transparent outline-none h-6 px-2 focus:bg-white focus:ring-1 focus:ring-slate-300" placeholder="" />
                        </td>
                        <td className="p-0 border-r border-slate-200">
                          <input type="text" className="w-full bg-transparent outline-none h-6 px-2 focus:bg-white focus:ring-1 focus:ring-slate-300" placeholder="" />
                        </td>
                        <td className="p-0 border-r border-slate-200">
                          <input type="text" className="w-full bg-transparent outline-none h-6 px-2 focus:bg-white focus:ring-1 focus:ring-slate-300 text-right" placeholder="" />
                        </td>
                        <td className="p-0 border-r border-slate-200">
                          <input type="text" className="w-full bg-transparent outline-none h-6 px-2 focus:bg-white focus:ring-1 focus:ring-slate-300 text-right" placeholder="" />
                        </td>
                        <td className="p-0 border-r border-slate-200">
                          <input type="text" className="w-full bg-transparent outline-none h-6 px-2 focus:bg-white focus:ring-1 focus:ring-slate-300 text-right" placeholder="" />
                        </td>
                        <td className="p-1 text-center">
                          <button className="text-red-500 hover:text-red-700">
                            <X className="w-3.5 h-3.5 mx-auto" />
                          </button>
                        </td>
                      </tr>
                      <tr className="h-full">
                        <td colSpan={11}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="flex flex-col px-2 py-1 bg-[#f0f4f8] text-[10px] text-slate-600 shrink-0 border-t border-slate-300">
                  <div className="flex items-center gap-2">
                    <button className="hover:text-blue-600">|◀</button>
                    <button className="hover:text-blue-600">◀</button>
                    <span>Products 1 of 1</span>
                    <button className="hover:text-blue-600">▶</button>
                    <button className="hover:text-blue-600">▶|</button>
                    <span className="ml-2 font-bold cursor-pointer hover:text-blue-600">+</span>
                    <span className="ml-1 font-bold cursor-pointer hover:text-blue-600">-</span>
                    <span className="ml-1 font-bold cursor-pointer hover:text-blue-600">✓</span>
                    <span className="ml-1 font-bold text-red-500 cursor-pointer hover:text-red-700">✗</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {isViewModalOpen && activeRecord && (
        <Modal isOpen onClose={() => setIsViewModalOpen(false)} title={`Production Plan: ${activeRecord.planNo}`} className="max-w-[800px]">
          <div className="p-6">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{activeRecord.planNo}</h2>
                <p className="text-sm text-slate-500">{activeRecord.warehouseName} | Schedule: {activeRecord.startDate} to {activeRecord.endDate}</p>
              </div>
              {getStatusBadge(activeRecord.status)}
            </div>

            <div className="p-4 border rounded-lg bg-blue-50 border-blue-100 mb-6">
              <p className="text-xs font-bold text-blue-800 uppercase mb-2">Planned Product</p>
              <p className="font-medium text-lg">{activeRecord.productSku} - {activeRecord.productName}</p>
              <p className="text-xl font-bold text-blue-700 mt-2">{activeRecord.plannedQuantity} Units Planned</p>
            </div>

            <h3 className="font-bold text-sm mb-2">Required Materials</h3>
            <table className="w-full text-left text-sm border rounded mb-6">
               <thead className="bg-slate-50 text-xs">
                  <tr>
                     <th className="p-2">Material</th>
                     <th className="p-2 text-center">Req Qty</th>
                     <th className="p-2 text-center">Available</th>
                  </tr>
               </thead>
               <tbody>
                  {activeRecord.materials.map(m => (
                     <tr key={m.id} className="border-t">
                        <td className="p-2 text-xs">{m.productSku} - {m.productName}</td>
                        <td className="p-2 text-center font-bold">{m.requiredQuantity}</td>
                        <td className="p-2 text-center">{m.availableQuantity}</td>
                     </tr>
                  ))}
               </tbody>
            </table>

            <div className="flex justify-end gap-3 mt-8">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
              {(activeRecord.status === 'DRAFT' || activeRecord.status === 'APPROVED') && (
                <Button variant="outline" onClick={() => handleStatusChange(activeRecord, 'CANCELLED')}>Cancel Plan</Button>
              )}
              {activeRecord.status === 'APPROVED' && (
                <Button variant="primary" onClick={() => handleStatusChange(activeRecord, 'IN_PROGRESS')}>Mark In Progress</Button>
              )}
              {activeRecord.status === 'IN_PROGRESS' && (
                <Button variant="primary" onClick={() => handleStatusChange(activeRecord, 'COMPLETED')}>Complete Plan</Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
