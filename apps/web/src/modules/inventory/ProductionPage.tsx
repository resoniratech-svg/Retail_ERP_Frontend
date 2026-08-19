import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Search, Plus, Eye, Trash2, Save, CheckCircle, X, CornerUpLeft } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative min-h-[600px]">
      {!isFormModalOpen && !isViewModalOpen && (
        <div className="flex flex-col h-full gap-2 p-2">
          <div className="flex flex-col border border-slate-300 rounded-sm bg-[#f1f5f9] shadow-sm">
            {/* Top Action Bar */}
            <div className="flex flex-wrap items-center justify-between p-1 border-b border-slate-300 bg-white">
              <div className="flex items-center">
                <button className="flex items-center gap-1 px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[11px] text-slate-700 font-bold">
                  <span>Produced | Consumed Product Details</span>
                </button>
                <button className="flex items-center gap-1 px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[11px] text-slate-700 font-bold">
                  <span className="text-blue-800 font-extrabold text-lg leading-none mt-[-4px]">↶</span>
                  <span>UnPost</span>
                </button>
                <button className="flex items-center gap-1 px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[11px] text-slate-700 font-bold">
                  <span>Print Production</span>
                </button>
                <button className="flex items-center gap-1 px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[11px] text-slate-700 font-bold">
                  <span>Production Daily Config</span>
                </button>
              </div>
              
              <div className="flex items-center gap-2 pr-2">
                <Button variant="primary" className="py-1 px-2 text-xs h-7 flex items-center gap-1 font-bold bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white rounded-sm" onClick={openNewForm}>
                  <Plus className="w-3.5 h-3.5" /> New Production
                </Button>
              </div>
            </div>

            {/* Title Bar */}
            <div className="bg-[#e2e8f0] border-b border-slate-300 py-1 px-3 text-[12px] font-bold text-slate-800 flex justify-center">
              Production
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
                    <th className="p-4 border-r border-slate-200 font-bold">REF NO</th>
                    <th className="p-4 border-r border-slate-200 font-bold">DATE</th>
                    <th className="p-4 border-r border-slate-200 font-bold">NOTE</th>
                    <th className="p-4 border-r border-slate-200 font-bold">IN CHARGE</th>
                    <th className="p-4 border-r border-slate-200 font-bold">LOCATION</th>
                    <th className="p-4 text-center font-bold">POSTED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">No records found.</td>
                    </tr>
                  ) : (
                    filteredRecords.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => { setActiveRecord(w); setIsViewModalOpen(true); }}>
                        <td className="p-4 font-mono font-bold text-xs">{w.productionNo}</td>
                        <td className="p-4 text-xs">{w.productionDate}</td>
                        <td className="p-4 text-xs">{w.remarks || ''}</td>
                        <td className="p-4 text-xs text-slate-700">{w.createdBy}</td>
                        <td className="p-4 text-xs font-medium">{w.warehouseName}</td>
                        <td className="p-4 text-center">
                          <input type="checkbox" checked={w.status === 'COMPLETED'} readOnly className="mt-0.5" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
          
          <div className="flex flex-col px-2 py-1 bg-[#f0f4f8] text-[10px] text-slate-600 shrink-0 border border-slate-300">
            <div className="flex items-center gap-2">
              <button className="hover:text-blue-600">|◀</button>
              <button className="hover:text-blue-600">◀</button>
              <span>Production {filteredRecords.length > 0 ? '1' : '0'} of {filteredRecords.length}</span>
              <button className="hover:text-blue-600">▶</button>
              <button className="hover:text-blue-600">▶|</button>
            </div>
          </div>
        </div>
      )}

      {isFormModalOpen && (
        <Modal isOpen onClose={() => setIsFormModalOpen(false)} title="" className="max-w-[1000px] w-full p-0 flex flex-col bg-[#e6e8eb] shadow-2xl border border-slate-400">
          <div className="flex flex-col h-[550px] font-sans">
            <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-b from-[#f5f6f8] to-[#e6e8eb] border-b border-slate-300 shadow-[inset_0_1px_0_#fff]">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-slate-800">New Production</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="hover:bg-slate-300 p-0.5 rounded" onClick={() => setIsFormModalOpen(false)}>
                  <X className="w-4 h-4 text-slate-700" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1 bg-[#f0f4f8] border-b border-slate-300">
              <button className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded hover:bg-blue-50 text-[11px] font-medium text-slate-700 shadow-sm" onClick={() => handleSaveForm(false)}>
                <Save className="w-3.5 h-3.5 text-blue-600" /> Save
              </button>
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
              <div className="flex gap-16 mb-2 pl-1">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-slate-700 w-16">Date</label>
                    <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-48 text-xs h-[22px] border border-slate-300 px-1 bg-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-slate-700 w-16">Location</label>
                    <select value={formWarehouse} onChange={(e) => setFormWarehouse(e.target.value)} className="w-48 text-xs h-[22px] border border-slate-300 px-1 bg-white text-slate-600">
                      <option value="">Select Location...</option>
                      {WAREHOUSES.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-slate-700 w-16">In Charge</label>
                    <select className="w-48 text-xs h-[22px] border border-slate-300 px-1 bg-white text-slate-600">
                      <option value="Administrator">Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-slate-700 w-16">Packed By</label>
                    <select className="w-48 text-xs h-[22px] border border-slate-300 px-1 bg-white text-slate-600">
                      <option value="Administrator">Administrator</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-slate-700 w-16">Plan No</label>
                    <input type="text" value={formPlanNo} onChange={(e) => setFormPlanNo(e.target.value)} className="w-24 text-xs h-[22px] border border-slate-300 px-1 bg-white" />
                    <button className="px-3 h-[22px] bg-[#f0f4f8] border border-slate-400 text-[11px] text-slate-800 shadow-[inset_1px_1px_0px_#fff] hover:bg-slate-200">Search</button>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-h-[200px] bg-white border border-slate-300 rounded-sm relative flex flex-col mt-2">
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
                        <th className="p-1 px-2 border-r border-slate-200 font-normal text-right">Labour Cost</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal text-right">Production Cost</th>
                        <th className="p-1 px-2 border-r border-slate-200 font-normal text-right">Qty</th>
                        <th className="p-1 px-2 border-slate-200 w-8 text-center"></th>
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
                            <X className="w-4 h-4 mx-auto" strokeWidth={3} />
                          </button>
                        </td>
                      </tr>
                      <tr className="h-full">
                        <td colSpan={11}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="flex flex-col px-2 py-1 bg-[#f0f4f8] text-[10px] text-slate-600 shrink-0 border-t border-slate-300 flex-row justify-between">
                  <div className="flex items-center gap-2">
                    <button className="hover:text-blue-600">|◀</button>
                    <button className="hover:text-blue-600">◀</button>
                    <span>Products 0 of 0</span>
                    <button className="hover:text-blue-600">▶</button>
                    <button className="hover:text-blue-600">▶|</button>
                  </div>
                  <div className="flex items-center gap-2 pr-6">
                    <div className="border border-slate-300 bg-white px-2 py-0.5 w-24 text-right">0.000000000</div>
                    <div className="border border-slate-300 bg-white px-2 py-0.5 w-24 text-right">0.000000000</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 mt-2 pl-1">
                <label className="text-[11px] text-slate-700 w-10 mt-1">Note</label>
                <textarea className="w-80 h-[40px] text-xs border border-slate-300 p-1 bg-white resize-none" value={formRemarks} onChange={(e) => setFormRemarks(e.target.value)}></textarea>
                <button className="text-blue-700 hover:underline text-[11px] font-medium mt-1 ml-2">
                  [F4] - View Consumed Materials
                </button>
              </div>
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
