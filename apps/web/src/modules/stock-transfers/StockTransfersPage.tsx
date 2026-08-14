import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Plus, Search, Eye, Edit, Trash2, Power, CheckCircle, Truck, Inbox, XCircle, Settings2 } from 'lucide-react';
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inter-Warehouse Stock Transfers</h1>
          <p className="text-sm text-slate-500">Request, approve, dispatch, and receive stock transfers.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" className="flex items-center gap-2 font-bold" onClick={handleOpenNew}>
            <Plus className="w-4 h-4" /> New Transfer Request
          </Button>
        </div>
      </div>

      <Card className="p-4 flex flex-wrap items-center justify-start gap-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search transfer no, warehouse, user..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>
        <div className="w-full md:w-48">
          <Select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'DRAFT', label: 'Draft' },
              { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'DISPATCHED', label: 'Dispatched' },
              { value: 'PARTIALLY_RECEIVED', label: 'Partially Received' },
              { value: 'RECEIVED', label: 'Received' },
              { value: 'CANCELLED', label: 'Cancelled' }
            ]}
          />
        </div>
      </Card>

      <Card className="p-0 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-[11px] font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 whitespace-nowrap">Transfer #</th>
              <th className="p-4 whitespace-nowrap">Source Warehouse</th>
              <th className="p-4 whitespace-nowrap">Destination Warehouse</th>
              <th className="p-4 whitespace-nowrap">Requested By</th>
              <th className="p-4 text-right whitespace-nowrap">SKU Count</th>
              <th className="p-4 text-center whitespace-nowrap">Status</th>
              <th className="p-4 text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {filteredTransfers.length > 0 ? filteredTransfers.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-mono font-bold text-xs">{t.transferNo}</td>
                <td className="p-4 font-medium">{t.sourceWarehouseName}</td>
                <td className="p-4 font-medium">{t.destWarehouseName}</td>
                <td className="p-4 text-xs text-slate-600 dark:text-slate-400">{t.requestedBy}<br/><span className="text-[10px] text-slate-400">{t.requestDate}</span></td>
                <td className="p-4 text-right font-bold">{t.items.length}</td>
                <td className="p-4 text-center">{getStatusBadge(t.status)}</td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600" onClick={() => { setActiveTransfer(t); setIsViewModalOpen(true); }} title="View Details">
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {t.status === 'DRAFT' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600" onClick={() => handleEdit(t)} title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}

                    {t.status === 'DRAFT' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600" onClick={() => handleDelete(t)} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}

                    {t.status === 'PENDING_APPROVAL' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-600" onClick={() => handleStatusChange(t, 'APPROVED')} title="Approve">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}

                    {t.status === 'PENDING_APPROVAL' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600" onClick={() => handleStatusChange(t, 'REJECTED')} title="Reject">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}

                    {t.status === 'APPROVED' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-amber-500 hover:text-amber-600" onClick={() => handleStatusChange(t, 'DISPATCHED')} title="Dispatch">
                        <Truck className="w-4 h-4" />
                      </Button>
                    )}

                    {(t.status === 'DISPATCHED' || t.status === 'PARTIALLY_RECEIVED') && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-indigo-500 hover:text-indigo-600" onClick={() => handleOpenReceive(t)} title="Receive">
                        <Inbox className="w-4 h-4" />
                      </Button>
                    )}

                    {(t.status === 'APPROVED' || t.status === 'DRAFT') && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600" onClick={() => handleStatusChange(t, 'CANCELLED')} title="Cancel">
                        <Power className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  No stock transfers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* --- ADD / EDIT MODAL --- */}
      {isFormModalOpen && (
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={formData.id ? `Edit Transfer: ${formData.transferNo}` : "New Transfer Request"}
          className="max-w-[1200px]"
        >
          <div className="w-full p-4 md:p-6 overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:hidden">
            {formError && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-md font-medium border border-rose-200">
                {formError}
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Basic Info */}
              <div className="space-y-6 lg:col-span-1 border-r border-slate-100 dark:border-slate-800 pr-0 lg:pr-6">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Transfer Details</h3>
                  <div className="space-y-4">
                    <Input label="Transfer No" value={formData.transferNo} disabled />
                    
                    <div>
                      <span className="text-slate-500 block mb-1.5 text-xs font-semibold uppercase">Source Warehouse *</span>
                      <Select 
                        value={formData.sourceWarehouseId || ''}
                        onChange={(e) => setFormData({...formData, sourceWarehouseId: e.target.value})}
                        options={[
                          { value: '', label: '-- Select Source --' },
                          ...warehouses.map(w => ({ value: w.id, label: w.name }))
                        ]}
                      />
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-1.5 text-xs font-semibold uppercase">Destination Warehouse *</span>
                      <Select 
                        value={formData.destWarehouseId || ''}
                        onChange={(e) => setFormData({...formData, destWarehouseId: e.target.value})}
                        options={[
                          { value: '', label: '-- Select Destination --' },
                          ...warehouses.map(w => ({ value: w.id, label: w.name }))
                        ]}
                      />
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-1.5 text-xs font-semibold uppercase">Priority</span>
                      <Select 
                        value={formData.priority || 'MEDIUM'}
                        onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                        options={[
                          { value: 'LOW', label: 'Low' },
                          { value: 'MEDIUM', label: 'Medium' },
                          { value: 'HIGH', label: 'High' },
                          { value: 'URGENT', label: 'Urgent' }
                        ]}
                      />
                    </div>

                    <Input label="Remarks" value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} />
                  </div>
                </div>
              </div>
              
              {/* Right Column: Items */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Transfer Items</h3>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-end mb-4">
                  <div className="flex-1 min-w-[200px]">
                    <span className="text-slate-500 block mb-1.5 text-xs font-semibold uppercase">Product</span>
                    <Select 
                      value={newItem.productId || ''}
                      onChange={(e) => setNewItem({...newItem, productId: e.target.value})}
                      options={[
                        { value: '', label: '-- Select Product --' },
                        ...products.map(p => ({ value: p.id, label: `${p.name} (Stock: ${p.stockQuantity})` }))
                      ]}
                    />
                  </div>
                  <div className="w-32">
                    <Input 
                      type="number"
                      label="Quantity" 
                      value={newItem.transferQty?.toString() || ''} 
                      onChange={(e) => setNewItem({...newItem, transferQty: Number(e.target.value)})} 
                    />
                  </div>
                  <div className="w-full md:w-auto mt-2 md:mt-0">
                    <Button variant="primary" onClick={handleAddItem} className="w-full">Add Item</Button>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3 text-right">Available</th>
                        <th className="p-3 text-right">Qty</th>
                        <th className="p-3 text-center">Unit</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {formData.items && formData.items.length > 0 ? formData.items.map(item => (
                        <tr key={item.id}>
                          <td className="p-3 font-medium">{item.productName}</td>
                          <td className="p-3 text-xs text-slate-500">{item.sku}</td>
                          <td className="p-3 text-right text-slate-500">{item.availableStock}</td>
                          <td className="p-3 text-right font-bold">{item.transferQty}</td>
                          <td className="p-3 text-center">{item.unit}</td>
                          <td className="p-3 text-center">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500" onClick={() => handleRemoveItem(item.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={6} className="p-6 text-center text-slate-500">No items added.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Validation Note */}
                <div className="bg-blue-50 text-blue-800 p-3 rounded text-xs border border-blue-100 mt-4">
                  <strong>Note on Validation:</strong> Item availability checks global stock (`productsService`) as warehouse-specific inventory isn't centrally maintained in localStorage yet.
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t pt-4">
              <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
              <Button variant="primary" className="bg-slate-600 hover:bg-slate-700" onClick={() => handleSaveForm('DRAFT')}>Save as Draft</Button>
              <Button variant="primary" onClick={() => handleSaveForm('PENDING_APPROVAL')}>Submit Request</Button>
            </div>
          </div>
        </Modal>
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
