import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Plus, Search, Eye, Edit, Trash2, Power, CheckCircle, Truck, Inbox, XCircle, Settings2, ArrowRight, Save, X } from 'lucide-react';
import { productsService } from '@qatar-erp/api';
import { Product, Warehouse } from '@qatar-erp/types';

// Constants and Types
const STORAGE_KEY = 'retail_erp_stock_transfers';
const WAREHOUSES_KEY = 'retail_erp_warehouses';
const CURRENT_USER = 'Ahmed Al-Mansouri (SUPER_ADMIN)';

type TransferStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'DISPATCHED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';

interface TransferItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  availableStock: number;
  transferQty: number;
  unit: string;
  batchNo?: string;
  remarks?: string;
  receivedQty?: number;
}

interface Transfer {
  id: string;
  transferNo: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  destWarehouseId: string;
  destWarehouseName: string;
  requestedBy: string;
  requestDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  remarks: string;
  items: TransferItem[];
  status: TransferStatus;
  approvedDate?: string;
  approvedBy?: string;
  dispatchedDate?: string;
  dispatchedBy?: string;
  receivedDate?: string;
  receivedBy?: string;
}

// Default Seed
const DEFAULT_TRANSFERS: Transfer[] = [
  {
    id: 'trf-101',
    transferNo: 'TRF-2026-101',
    sourceWarehouseId: 'wh-doh-01',
    sourceWarehouseName: 'Doha Central Depot',
    destWarehouseId: 'wh-ray-02',
    destWarehouseName: 'Al Rayyan Mall Storage',
    requestedBy: 'Nasser Al-Kaabi',
    requestDate: '2026-08-11',
    priority: 'MEDIUM',
    remarks: 'Routine restocking',
    items: [{ id: 'item-1', productId: 'prod-1', productName: 'Sample SKU', sku: 'SKU-001', availableStock: 100, transferQty: 15, unit: 'Pcs' }],
    status: 'DISPATCHED',
    dispatchedBy: 'Nasser Al-Kaabi',
    dispatchedDate: '2026-08-12'
  },
  {
    id: 'trf-102',
    transferNo: 'TRF-2026-102',
    sourceWarehouseId: 'wh-doh-01',
    sourceWarehouseName: 'Doha Central Depot',
    destWarehouseId: 'wh-wak-03',
    destWarehouseName: 'Al Wakrah Storage',
    requestedBy: 'Salim Al-Hajri',
    requestDate: '2026-08-10',
    priority: 'HIGH',
    remarks: 'Urgent request',
    items: [{ id: 'item-2', productId: 'prod-2', productName: 'Sample SKU 2', sku: 'SKU-002', availableStock: 200, transferQty: 40, unit: 'Pcs', receivedQty: 40 }],
    status: 'RECEIVED',
    dispatchedBy: 'Salim Al-Hajri',
    dispatchedDate: '2026-08-10',
    receivedBy: 'Warehouse Manager',
    receivedDate: '2026-08-11'
  }
];

export const StockTransfersPage: React.FC = () => {
  // State
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  
  const [activeTransfer, setActiveTransfer] = useState<Transfer | null>(null);
  const [formError, setFormError] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Transfer>>({ priority: 'MEDIUM', items: [] });
  const [newItem, setNewItem] = useState<Partial<TransferItem>>({});

  // Initialization
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load Warehouses
    try {
      const whData = localStorage.getItem(WAREHOUSES_KEY);
      if (whData) setWarehouses(JSON.parse(whData));
    } catch (e) {
      console.error(e);
    }
    
    // Load Products
    setProducts(productsService.getProductsSync());

    // Load Transfers
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setTransfers(JSON.parse(saved));
      } else {
        setTransfers(DEFAULT_TRANSFERS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TRANSFERS));
      }
    } catch (e) {
      setTransfers(DEFAULT_TRANSFERS);
    }
  };

  const saveTransfers = (data: Transfer[]) => {
    setTransfers(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  // Status Badge Helper
  const getStatusBadge = (status: TransferStatus) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="neutral">Draft</Badge>;
      case 'PENDING_APPROVAL': return <Badge variant="warning">Pending Approval</Badge>;
      case 'APPROVED': return <Badge variant="success">Approved</Badge>;
      case 'REJECTED': return <Badge variant="danger">Rejected</Badge>;
      case 'DISPATCHED': return <Badge variant="info">Dispatched</Badge>;
      case 'PARTIALLY_RECEIVED': return <Badge variant="warning">Partially Received</Badge>;
      case 'RECEIVED': return <Badge variant="success">Received</Badge>;
      case 'CANCELLED': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  // Actions
  const handleOpenNew = () => {
    setFormError('');
    setFormData({
      transferNo: `TRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceWarehouseId: '',
      destWarehouseId: '',
      priority: 'MEDIUM',
      remarks: '',
      items: [],
      status: 'DRAFT',
      requestDate: new Date().toISOString().split('T')[0],
      requestedBy: CURRENT_USER
    });
    setNewItem({});
    setIsFormModalOpen(true);
  };

  const handleEdit = (t: Transfer) => {
    setFormError('');
    setFormData(JSON.parse(JSON.stringify(t))); // deep copy
    setNewItem({});
    setIsFormModalOpen(true);
  };

  const handleDelete = (t: Transfer) => {
    if (confirm(`Are you sure you want to delete draft transfer ${t.transferNo}?`)) {
      saveTransfers(transfers.filter(tr => tr.id !== t.id));
    }
  };

  const handleStatusChange = (t: Transfer, newStatus: TransferStatus) => {
    const updated = transfers.map(tr => {
      if (tr.id === t.id) {
        const trCopy = { ...tr, status: newStatus };
        if (newStatus === 'APPROVED') {
          trCopy.approvedBy = CURRENT_USER;
          trCopy.approvedDate = new Date().toISOString();
        } else if (newStatus === 'DISPATCHED') {
          // Note: In real architecture, deduct from specific warehouse stock.
          // Since it's global only, we deduct globally and log constraint.
          productsService.deductStock(trCopy.items.map(i => ({ id: i.productId, quantity: i.transferQty })));
          trCopy.dispatchedBy = CURRENT_USER;
          trCopy.dispatchedDate = new Date().toISOString();
        }
        return trCopy;
      }
      return tr;
    });
    saveTransfers(updated);
  };

  const handleSaveForm = (submitAsStatus: TransferStatus) => {
    setFormError('');
    if (!formData.sourceWarehouseId) return setFormError('Source Warehouse is required.');
    if (!formData.destWarehouseId) return setFormError('Destination Warehouse is required.');
    if (formData.sourceWarehouseId === formData.destWarehouseId) return setFormError('Source and Destination cannot be the same.');
    if (!formData.items || formData.items.length === 0) return setFormError('At least one item is required.');

    const sourceWh = warehouses.find(w => w.id === formData.sourceWarehouseId);
    const destWh = warehouses.find(w => w.id === formData.destWarehouseId);

    const payload: Transfer = {
      ...(formData as Transfer),
      id: formData.id || `trf-${Date.now()}`,
      sourceWarehouseName: sourceWh?.name || 'Unknown',
      destWarehouseName: destWh?.name || 'Unknown',
      status: submitAsStatus,
    };

    if (formData.id) {
      saveTransfers(transfers.map(t => t.id === formData.id ? payload : t));
    } else {
      saveTransfers([payload, ...transfers]);
    }
    setIsFormModalOpen(false);
  };

  const handleAddItem = () => {
    if (!newItem.productId || !newItem.transferQty || newItem.transferQty <= 0) {
      alert("Please select a product and enter a valid quantity.");
      return;
    }
    const prod = products.find(p => p.id === newItem.productId);
    if (!prod) return;
    
    // Check if already in list
    if (formData.items?.some(i => i.productId === prod.id)) {
      alert("Product already exists in this transfer.");
      return;
    }

    if (newItem.transferQty > prod.stockQuantity) {
      alert(`Transfer quantity (${newItem.transferQty}) exceeds available stock (${prod.stockQuantity}).`);
      return;
    }

    const item: TransferItem = {
      id: `itm-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      availableStock: prod.stockQuantity,
      transferQty: newItem.transferQty,
      unit: prod.unit || 'Pcs',
      remarks: newItem.remarks
    };

    setFormData({ ...formData, items: [...(formData.items || []), item] });
    setNewItem({});
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData({ ...formData, items: formData.items?.filter(i => i.id !== itemId) });
  };

  // Receive Logic
  const handleOpenReceive = (t: Transfer) => {
    const transferCopy = JSON.parse(JSON.stringify(t));
    
    // Default receiving qty for items not received yet
    transferCopy.items.forEach((item: any) => {
        if (item.receivedQty === undefined) {
            item.receivedQty = item.transferQty; // prefill full amount
        }
    });

    setActiveTransfer(transferCopy);
    setIsReceiveModalOpen(true);
  };

  const handleSaveReceive = () => {
    if (!activeTransfer) return;
    
    let isFullyReceived = true;
    let isPartiallyReceived = false;

    // Validate receiving quantities
    for (const item of activeTransfer.items) {
      if (item.receivedQty === undefined) item.receivedQty = 0;
      if (item.receivedQty < 0) {
        alert("Received quantity cannot be negative.");
        return;
      }
      if (item.receivedQty > item.transferQty) {
        alert("Received quantity cannot exceed dispatched quantity.");
        return;
      }
      if (item.receivedQty < item.transferQty) isFullyReceived = false;
      if (item.receivedQty > 0) isPartiallyReceived = true;
    }

    const newStatus: TransferStatus = isFullyReceived ? 'RECEIVED' : (isPartiallyReceived ? 'PARTIALLY_RECEIVED' : activeTransfer.status);
    
    if (newStatus === 'RECEIVED' || newStatus === 'PARTIALLY_RECEIVED') {
      activeTransfer.receivedBy = CURRENT_USER;
      activeTransfer.receivedDate = new Date().toISOString();
    }

    activeTransfer.status = newStatus;

    // In a real application, here we would add `receivedQty` to `destWarehouse` inventory.
    // Due to current `products.service.ts` limiting to global stock, we bypass dest increment.
    
    saveTransfers(transfers.map(t => t.id === activeTransfer.id ? activeTransfer : t));
    setIsReceiveModalOpen(false);
  };

  // Filter Data
  const filteredTransfers = transfers.filter(t => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return t.transferNo.toLowerCase().includes(q) || 
             t.sourceWarehouseName.toLowerCase().includes(q) ||
             t.destWarehouseName.toLowerCase().includes(q) ||
             t.requestedBy.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {!isViewModalOpen && !isFormModalOpen && !isReceiveModalOpen && (
        <div className="flex flex-col h-full gap-2">
          <div className="flex flex-col border border-slate-300 dark:border-slate-700 rounded-sm bg-[#f1f5f9] dark:bg-slate-800 shadow-sm">
            {/* Top Action Bar */}
            <div className="flex flex-wrap items-center justify-between p-1 border-b border-slate-300 dark:border-slate-700">
              <div className="flex items-center">
                <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={handleOpenNew}>
                  <ArrowRight className="w-4 h-4 text-blue-600 mb-0.5 rotate-180" />
                  <span>Unpost<br/><span className="text-[9px] text-slate-400">&nbsp;</span></span>
                </button>
              </div>
              
              <div className="flex items-center gap-2 pr-2">
                <Button variant="primary" className="py-1 px-2 text-xs h-7 flex items-center gap-1 font-bold bg-emerald-600 hover:bg-emerald-700" onClick={handleOpenNew}>
                  <Plus className="w-3.5 h-3.5" /> New Stock Transfer
                </Button>
              </div>
            </div>

            {/* Title Bar */}
            <div className="bg-[#e2e8f0] border-b border-slate-300 text-center py-1 text-[12px] font-bold text-slate-800 shrink-0">
              Stock Transfers
            </div>

            {/* Search/Filter Bar */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900 border-b border-slate-300 shrink-0">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Enter text to search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-primary-500 ml-1"
                />
                <select className="px-2 py-1 text-xs border border-slate-300 rounded bg-white w-32">
                  <option value=""></option>
                </select>
              </div>
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

          {/* Main Grid Area */}
          <Card className="p-0 overflow-hidden shadow-sm flex-1 mb-2 border border-slate-300 flex flex-col mx-2">
            <div className="w-full h-full overflow-auto bg-white [&::-webkit-scrollbar]:hidden">
              <table className="w-full text-left text-sm whitespace-nowrap min-w-max">
                <thead className="bg-slate-100 uppercase text-[11px] font-semibold text-slate-700 border-b sticky top-0 z-10">
                  <tr>
                    <th className="p-4">REF NO</th>
                    <th className="p-4">FULL REF NO</th>
                    <th className="p-4">TRANSFERRING DATE</th>
                    <th className="p-4">FROM</th>
                    <th className="p-4">TO</th>
                    <th className="p-4">STATUS</th>
                    <th className="p-4">AMOUNT</th>
                    <th className="p-4">TRANSFERED USER</th>
                    <th className="p-4">RECEIVED USER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransfers.length > 0 ? filteredTransfers.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => { setActiveTransfer(t); setIsViewModalOpen(true); }}>
                      <td className="p-4 text-blue-600 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleEdit(t); }}>{t.transferNo}</td>
                      <td className="p-4">{t.transferNo}</td>
                      <td className="p-4">{t.requestDate}</td>
                      <td className="p-4">{t.sourceWarehouseName}</td>
                      <td className="p-4">{t.destWarehouseName}</td>
                      <td className="p-4">{t.status}</td>
                      <td className="p-4">0.00</td>
                      <td className="p-4">{t.requestedBy}</td>
                      <td className="p-4">{t.receivedBy || ''}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500 italic">No records found.</td>
                    </tr>
                  )}
                  <tr className="h-full">
                    <td colSpan={9}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Bottom Status Bar */}
          <div className="flex items-center gap-1 px-2 py-1 bg-[#e2e8f0] border-t border-slate-300 text-[11px] text-slate-700 shrink-0 mt-[-8px]">
            <button className="px-1.5 hover:bg-slate-300 rounded font-bold">|&lt;&lt;</button>
            <button className="px-1.5 hover:bg-slate-300 rounded font-bold">&lt;&lt;</button>
            <span className="mx-1">StockTransfers 0 of {filteredTransfers.length || 0}</span>
            <button className="px-1.5 hover:bg-slate-300 rounded font-bold">&gt;&gt;</button>
            <button className="px-1.5 hover:bg-slate-300 rounded font-bold">&gt;&gt;|</button>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT FORM --- */}
      {isFormModalOpen && (
        <div className="relative flex-1 bg-[#f0f4f8] flex flex-col border border-slate-300 dark:border-slate-800 shadow-sm animate-in fade-in duration-200">
          
          {/* Header */}
          <div className="px-2 py-1 border-b border-slate-300 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center text-[12px] font-semibold text-slate-800">
              New Stock Transfer
            </div>
            <button onClick={() => setIsFormModalOpen(false)} className="p-0.5 hover:bg-slate-200 text-slate-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Top Action Bar */}
          <div className="flex items-center gap-1 px-2 py-1 bg-[#f1f5f9] border-b border-slate-300 shadow-sm shrink-0">
            <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => { setFormError(''); handleSaveForm('DRAFT'); }}>
              <Save className="w-4 h-4 text-blue-600 mb-0.5" />
              <span>Save & New<br/><span className="text-[9px] text-slate-400">Ctrl + N</span></span>
            </button>
            <div className="w-[1px] h-8 bg-slate-300 mx-1"></div>
            <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => { setFormError(''); handleSaveForm('DRAFT'); setIsFormModalOpen(false); }}>
              <Save className="w-4 h-4 text-blue-600 mb-0.5" />
              <span>Save & Close<br/><span className="text-[9px] text-slate-400">Ctrl + L</span></span>
            </button>
            <div className="w-[1px] h-8 bg-slate-300 mx-1"></div>
            <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => handleSaveForm('PENDING_APPROVAL')}>
              <CheckCircle className="w-4 h-4 text-orange-600 mb-0.5" />
              <span>Proceed For<br/>Delivery<span className="text-[9px] text-slate-400 ml-1">P</span></span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden bg-[#f0f4f8]">
            {/* Title Bar */}
            <div className="bg-[#e2e8f0] border-b border-slate-300 py-1 px-3 text-[12px] font-bold text-slate-800 flex items-center gap-4">
              <span>Stock Transfer</span>
              <span>Ref#: {formData.transferNo || 'New'}</span>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="mx-3 mt-3 p-2 bg-rose-50 text-rose-600 text-xs rounded border border-rose-200">
                {formError}
              </div>
            )}

            {/* Header Form */}
            <div className="p-3 bg-[#f8fafc] border-b border-slate-300 text-[11px] flex flex-col gap-2">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <label className="w-12 text-right">From</label>
                  <select 
                    className="w-48 h-6 border border-slate-300 bg-white px-1"
                    value={formData.sourceWarehouseId || ''}
                    onChange={(e) => setFormData({...formData, sourceWarehouseId: e.target.value})}
                  >
                    <option value="">[Select a Location]</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-8 text-right">To</label>
                  <select 
                    className="w-48 h-6 border border-slate-300 bg-white px-1"
                    value={formData.destWarehouseId || ''}
                    onChange={(e) => setFormData({...formData, destWarehouseId: e.target.value})}
                  >
                    <option value="">[Select a Location]</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-right">Transferring Date</label>
                  <input type="date" className="h-6 w-32 border border-slate-300 px-1 bg-white" value={formData.requestDate || ''} onChange={(e) => setFormData({...formData, requestDate: e.target.value})} />
                </div>
                
                <div className="flex items-center gap-4 ml-8">
                  <div className="flex items-center gap-2 font-bold">
                    <span>Status</span>
                    <span>{formData.status === 'DRAFT' || !formData.id ? 'Open' : formData.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-6 mt-1">
                <div className="flex gap-2 w-[800px]">
                  <label className="w-12 text-right pt-1">Notes</label>
                  <textarea 
                    className="flex-1 h-12 border border-slate-300 px-2 py-1 bg-white resize-none"
                    value={formData.remarks || ''}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input type="checkbox" defaultChecked /> Alert For Same Product
                  </label>
                  <div className="flex items-center gap-4 font-bold mt-2">
                    <span>Total Transferring Cost</span>
                    <span>0.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Header */}
            <div className="bg-[#e2e8f0] border-b border-slate-300 py-1 px-3 text-[12px] font-bold text-slate-800">
              Product Details
            </div>

            {/* Product Input Row */}
            <div className="bg-[#f8fafc] border-b border-slate-300 p-2 text-[11px]">
              <div className="flex items-end gap-2 mb-2">
                <div className="flex flex-col gap-1 w-24">
                  <label>Code</label>
                  <input type="text" className="h-6 border border-slate-300 px-1 text-[11px]" />
                </div>
                <div className="flex flex-col gap-1 w-32">
                  <label>Barcode</label>
                  <input type="text" className="h-6 border border-slate-300 px-1 text-[11px]" />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label>Item Name</label>
                  <select 
                    className="h-6 border border-slate-300 px-1 bg-white text-[11px]"
                    value={newItem.productId || ''}
                    onChange={(e) => {
                      const prod = products.find(p => p.id === e.target.value);
                      if (prod) {
                        setNewItem({
                          ...newItem,
                          productId: prod.id,
                          productName: prod.name,
                          sku: prod.sku,
                          unit: 'PCS',
                          transferQty: 1
                        });
                      }
                    }}
                  >
                    <option value=""></option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1 w-20">
                  <label>Unit</label>
                  <input type="text" className="h-6 border border-slate-300 px-1 bg-slate-100 text-[11px]" value={newItem.unit || '[Unit]'} readOnly />
                </div>
                <div className="flex flex-col gap-1 w-16">
                  <label>UOM</label>
                  <input type="text" className="h-6 border border-slate-300 px-1 text-[11px]" value="1" readOnly />
                </div>
                <div className="flex flex-col gap-1 w-24">
                  <label>Trnsf. Qty</label>
                  <input type="number" className="h-6 border border-slate-300 px-1 text-right text-[11px]" value={newItem.transferQty || ''} onChange={(e) => setNewItem({...newItem, transferQty: Number(e.target.value)})} />
                </div>
                <div className="flex flex-col gap-1 w-24">
                  <label>Curr. Cost</label>
                  <input type="text" className="h-6 border border-slate-300 px-1 bg-slate-100 text-[11px]" readOnly />
                </div>
                <div className="flex flex-col gap-1 w-24">
                  <label>Price Incl Tax</label>
                  <input type="text" className="h-6 border border-slate-300 px-1 bg-slate-100 text-[11px]" readOnly />
                </div>
                <div className="flex items-center gap-1 mb-0.5">
                  <button className="flex items-center justify-center gap-1 h-6 px-3 bg-[#f0f4f8] border border-slate-400 shadow-[inset_1px_1px_0px_#fff] text-black font-medium hover:bg-slate-200" onClick={handleAddItem}>
                    <Plus className="w-3 h-3 text-green-600" /> Add <span className="text-[9px] text-slate-500 ml-1 mt-0.5">F1</span>
                  </button>
                  <button className="flex items-center justify-center gap-1 h-6 px-3 bg-[#f0f4f8] border border-slate-400 shadow-[inset_1px_1px_0px_#fff] text-black font-medium hover:bg-slate-200" onClick={() => setNewItem({})}>
                    <XCircle className="w-3 h-3 text-red-600" /> Remove <span className="text-[9px] text-slate-500 ml-1 mt-0.5">F2</span>
                  </button>
                  <button className="flex items-center justify-center gap-1 h-6 px-3 bg-[#f0f4f8] border border-slate-400 shadow-[inset_1px_1px_0px_#fff] text-black font-medium hover:bg-slate-200">
                    <Edit className="w-3 h-3 text-green-600" /> Edit <span className="text-[9px] text-slate-500 ml-1 mt-0.5">F3</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 cursor-pointer hover:bg-slate-200 p-1 rounded">
                    <div className="w-4 h-4 border border-slate-400 bg-white flex items-center justify-center text-[10px]">E</div>
                    <span className="text-slate-500">Ctrl + L to Focus List</span>
                  </div>
                  <button className="flex items-center gap-2 h-6 px-3 bg-[#f0f4f8] border border-slate-400 shadow-[inset_1px_1px_0px_#fff] text-black hover:bg-slate-200">
                    <Truck className="w-3 h-3 text-blue-800" /> PDT <span className="text-[9px] text-slate-500 mt-0.5">F7</span>
                  </button>
                  <input type="text" className="h-6 w-64 border border-slate-300 px-2 text-[11px]" placeholder="Additional Descriptions" />
                </div>
                <button className="flex items-center gap-2 h-6 px-4 bg-[#f0f4f8] border border-slate-400 shadow-[inset_1px_1px_0px_#fff] text-black hover:bg-slate-200">
                  <div className="w-3 h-3 border border-green-600 bg-green-100 flex items-center justify-center"><ArrowRight className="w-2 h-2 text-green-600 rotate-90" /></div> Import from File
                </button>
              </div>
            </div>

            {/* Grid Area */}
            <div className="bg-white min-h-[300px]">
              <table className="w-full text-left text-[11px] whitespace-nowrap border-collapse">
                <thead className="bg-[#f0f4f8] text-slate-700 border-b border-slate-300">
                  <tr>
                    <th className="p-1 px-2 border-r border-slate-200 font-normal">SlNo</th>
                    <th className="p-1 px-2 border-r border-slate-200 font-normal">Code</th>
                    <th className="p-1 px-2 border-r border-slate-200 font-normal">Barcode</th>
                    <th className="p-1 px-2 border-r border-slate-200 font-normal">Product</th>
                    <th className="p-1 px-2 border-r border-slate-200 font-normal">Unit</th>
                    <th className="p-1 px-2 border-r border-slate-200 font-normal">UOM</th>
                    <th className="p-1 px-2 border-r border-slate-200 font-normal text-right">Cost</th>
                    <th className="p-1 px-2 border-r border-slate-200 font-normal text-right">Transferring Qty</th>
                    <th className="p-1 px-2 border-r border-slate-200 font-normal text-right">Transferring A...</th>
                    <th className="p-1 px-2 border-r border-slate-200 font-normal text-right">Receiving Qty</th>
                    <th className="p-1 px-2 border-r border-slate-200 font-normal text-right">Receiving Amo...</th>
                    <th className="p-1 px-2 border-r border-slate-200 font-normal">Remarks</th>
                    <th className="p-1 px-2 border-r border-slate-200 font-normal">Additional Des...</th>
                    <th className="p-1 px-2 border-r border-slate-200 font-normal text-right">Price Incl Tax</th>
                    <th className="p-1 px-2 border-r border-slate-200 font-normal">Additional Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {formData.items && formData.items.length > 0 ? formData.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-blue-50 cursor-pointer">
                      <td className="p-1 px-2 border-r border-slate-200">{index + 1}</td>
                      <td className="p-1 px-2 border-r border-slate-200 text-slate-500">{item.sku}</td>
                      <td className="p-1 px-2 border-r border-slate-200">{item.sku}</td>
                      <td className="p-1 px-2 border-r border-slate-200 font-medium">{item.productName}</td>
                      <td className="p-1 px-2 border-r border-slate-200">{item.unit}</td>
                      <td className="p-1 px-2 border-r border-slate-200">1</td>
                      <td className="p-1 px-2 border-r border-slate-200 text-right">0.00</td>
                      <td className="p-1 px-2 border-r border-slate-200 text-right font-bold">{item.transferQty}</td>
                      <td className="p-1 px-2 border-r border-slate-200 text-right">0.00</td>
                      <td className="p-1 px-2 border-r border-slate-200 text-right">0</td>
                      <td className="p-1 px-2 border-r border-slate-200 text-right">0.00</td>
                      <td className="p-1 px-2 border-r border-slate-200"></td>
                      <td className="p-1 px-2 border-r border-slate-200"></td>
                      <td className="p-1 px-2 border-r border-slate-200 text-right">0.00</td>
                      <td className="p-1 px-2 border-r border-slate-200 flex justify-between items-center group">
                        <span></span>
                        <button className="hidden group-hover:block text-rose-500 ml-2" onClick={() => handleRemoveItem(item.id)}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={15} className="p-4 text-center text-slate-500 italic">No products added.</td>
                    </tr>
                  )}
                  <tr className="h-full"><td colSpan={15}></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- VIEW MODAL --- */}
      {isViewModalOpen && activeTransfer && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Transfer Details: ${activeTransfer.transferNo}`}
          className="max-w-[900px]"
        >
          <div className="w-full p-4 md:p-6 overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">{activeTransfer.transferNo}</h2>
                <p className="text-sm text-slate-500">Requested on {activeTransfer.requestDate} by {activeTransfer.requestedBy}</p>
              </div>
              {getStatusBadge(activeTransfer.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="p-4 bg-slate-50 dark:bg-slate-800/30 border-dashed">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Source</p>
                <p className="font-semibold text-base">{activeTransfer.sourceWarehouseName}</p>
              </Card>
              <Card className="p-4 bg-slate-50 dark:bg-slate-800/30 border-dashed">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Destination</p>
                <p className="font-semibold text-base">{activeTransfer.destWarehouseName}</p>
              </Card>
            </div>

            <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Transfer Items</h3>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-8">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3 text-right">Requested Qty</th>
                    <th className="p-3 text-right">Received Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activeTransfer.items.map(item => (
                    <tr key={item.id}>
                      <td className="p-3 font-medium">{item.productName} <span className="text-xs text-slate-500 ml-2">({item.sku})</span></td>
                      <td className="p-3 text-right">{item.transferQty} {item.unit}</td>
                      <td className="p-3 text-right font-bold text-emerald-600">{item.receivedQty || 0} {item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Workflow Audit</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Requested</span>
                <span className="font-medium">{activeTransfer.requestedBy} <span className="text-xs text-slate-400">({activeTransfer.requestDate})</span></span>
              </div>
              {activeTransfer.approvedBy && (
                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Approved</span>
                  <span className="font-medium">{activeTransfer.approvedBy} <span className="text-xs text-slate-400">({new Date(activeTransfer.approvedDate!).toLocaleDateString()})</span></span>
                </div>
              )}
              {activeTransfer.dispatchedBy && (
                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Dispatched</span>
                  <span className="font-medium">{activeTransfer.dispatchedBy} <span className="text-xs text-slate-400">({new Date(activeTransfer.dispatchedDate!).toLocaleDateString()})</span></span>
                </div>
              )}
              {activeTransfer.receivedBy && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Received</span>
                  <span className="font-medium">{activeTransfer.receivedBy} <span className="text-xs text-slate-400">({new Date(activeTransfer.receivedDate!).toLocaleDateString()})</span></span>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- RECEIVE MODAL --- */}
      {isReceiveModalOpen && activeTransfer && (
        <Modal
          isOpen={isReceiveModalOpen}
          onClose={() => setIsReceiveModalOpen(false)}
          title={`Receive Transfer: ${activeTransfer.transferNo}`}
          className="max-w-[900px]"
        >
          <div className="w-full p-4 md:p-6 overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:hidden">
            
            <div className="bg-amber-50 text-amber-800 p-4 rounded-lg mb-6 border border-amber-200 text-sm">
              <h4 className="font-bold flex items-center gap-2 mb-1"><Settings2 className="w-4 h-4"/> Confirm Receipt</h4>
              <p>Please enter the quantities received for each item. Partial receiving is supported.</p>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-6">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3 text-right">Dispatched</th>
                    <th className="p-3 text-right">Prior Received</th>
                    <th className="p-3 text-right w-32">Receiving Now</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activeTransfer.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="p-3 font-medium">{item.productName}</td>
                      <td className="p-3 text-right font-bold text-slate-500">{item.transferQty}</td>
                      <td className="p-3 text-right text-emerald-600">{item.receivedQty || 0}</td>
                      <td className="p-3 text-right">
                        <Input 
                          type="number" 
                          value={item.receivedQty?.toString() || '0'} 
                          onChange={(e) => {
                            const newItems = [...activeTransfer.items];
                            newItems[index].receivedQty = Number(e.target.value);
                            setActiveTransfer({...activeTransfer, items: newItems});
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t pt-4">
              <Button variant="outline" onClick={() => setIsReceiveModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveReceive}>Confirm Receipt</Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
