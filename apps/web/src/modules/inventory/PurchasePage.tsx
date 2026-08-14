import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Plus, Search, Eye, Edit, Trash2, Power, ArrowRight } from 'lucide-react';
import { productsService } from '@qatar-erp/api';
import { Product } from '@qatar-erp/types';

const STORAGE_KEY = 'retail_erp_purchases';
const CURRENT_USER = 'Ahmed Al-Mansouri (SUPER_ADMIN)';

type PurchaseStatus = 'DRAFT' | 'POSTED' | 'PAID' | 'CANCELLED';

interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface PurchaseInvoice {
  id: string;
  invoiceNo: string;
  supplierName: string;
  invoiceDate: string;
  dueDate: string;
  reference: string;
  notes: string;
  items: PurchaseItem[];
  totalAmount: number;
  status: PurchaseStatus;
  
  // Audit properties
  createdDate: string;
  createdBy: string;
  postedDate?: string;
  postedBy?: string;
}

const DEFAULT_PURCHASES: PurchaseInvoice[] = [
  {
    id: 'pur-2026-001',
    invoiceNo: 'PINV-2026-001',
    supplierName: 'Global Electronics Ltd.',
    invoiceDate: '2026-08-14',
    dueDate: '2026-09-14',
    reference: 'PO-2026-105',
    notes: 'Initial stock intake for Q3',
    items: [{ id: 'item-1', productId: 'prod-1', productName: 'Sample SKU', sku: 'SKU-001', quantity: 100, unitPrice: 50.0, totalPrice: 5000.0 }],
    totalAmount: 5000.0,
    status: 'POSTED',
    createdDate: '2026-08-14T08:00:00Z',
    createdBy: CURRENT_USER,
    postedDate: '2026-08-14T09:00:00Z',
    postedBy: CURRENT_USER
  }
];

export const PurchasePage: React.FC = () => {
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activePurchase, setActivePurchase] = useState<PurchaseInvoice | null>(null);
  
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<Partial<PurchaseInvoice>>({ items: [] });
  const [newItem, setNewItem] = useState<Partial<PurchaseItem>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(productsService.getProductsSync());

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPurchases(JSON.parse(saved));
      } else {
        setPurchases(DEFAULT_PURCHASES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PURCHASES));
      }
    } catch (e) {
      setPurchases(DEFAULT_PURCHASES);
    }
  };

  const savePurchases = (data: PurchaseInvoice[]) => {
    setPurchases(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const getStatusBadge = (status: PurchaseStatus) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="neutral">Draft</Badge>;
      case 'POSTED': return <Badge variant="warning">Posted</Badge>;
      case 'PAID': return <Badge variant="success">Paid</Badge>;
      case 'CANCELLED': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleOpenNew = () => {
    setFormError('');
    setFormData({
      invoiceNo: `PINV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierName: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      reference: '',
      notes: '',
      items: [],
      totalAmount: 0,
      status: 'DRAFT',
      createdBy: CURRENT_USER,
      createdDate: new Date().toISOString()
    });
    setNewItem({});
    setIsFormModalOpen(true);
  };

  const handleEdit = (p: PurchaseInvoice) => {
    setFormError('');
    setFormData(JSON.parse(JSON.stringify(p)));
    setNewItem({});
    setIsFormModalOpen(true);
  };

  const handleDelete = (p: PurchaseInvoice) => {
    if (confirm(`Are you sure you want to delete purchase invoice ${p.invoiceNo}?`)) {
      savePurchases(purchases.filter(pur => pur.id !== p.id));
    }
  };

  const handleStatusChange = (p: PurchaseInvoice, newStatus: PurchaseStatus) => {
    const updated = purchases.map(pur => {
      if (pur.id === p.id) {
        const purCopy = { ...pur, status: newStatus };
        if (newStatus === 'POSTED') {
          purCopy.postedBy = CURRENT_USER;
          purCopy.postedDate = new Date().toISOString();
        }
        return purCopy;
      }
      return pur;
    });
    savePurchases(updated);
  };

  const calculateTotal = (items: PurchaseItem[]) => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleSaveForm = (submitAsStatus: PurchaseStatus) => {
    setFormError('');
    if (!formData.supplierName) return setFormError('Supplier Name is required.');
    if (!formData.invoiceDate) return setFormError('Invoice Date is required.');
    if (!formData.items || formData.items.length === 0) return setFormError('At least one item is required.');

    const payload: PurchaseInvoice = {
      ...(formData as PurchaseInvoice),
      id: formData.id || `pur-${Date.now()}`,
      status: submitAsStatus,
      totalAmount: calculateTotal(formData.items),
    };

    if (submitAsStatus === 'POSTED' && !formData.postedDate) {
      payload.postedDate = new Date().toISOString();
      payload.postedBy = CURRENT_USER;
    }

    if (formData.id) {
      savePurchases(purchases.map(pur => pur.id === formData.id ? payload : pur));
    } else {
      savePurchases([payload, ...purchases]);
    }
    setIsFormModalOpen(false);
  };

  const handleAddItem = () => {
    if (!newItem.productId || !newItem.quantity || newItem.quantity <= 0 || newItem.unitPrice === undefined || newItem.unitPrice < 0) {
      alert("Please select a product and enter a valid quantity and unit price.");
      return;
    }
    const prod = products.find(p => p.id === newItem.productId);
    if (!prod) return;

    const item: PurchaseItem = {
      id: `itm-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      totalPrice: newItem.quantity * newItem.unitPrice
    };

    setFormData({ ...formData, items: [...(formData.items || []), item] });
    setNewItem({ productId: '', quantity: undefined, unitPrice: undefined });
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData({ ...formData, items: formData.items?.filter(i => i.id !== itemId) });
  };

  const filteredPurchases = purchases.filter(pur => {
    if (statusFilter !== 'ALL' && pur.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return pur.invoiceNo.toLowerCase().includes(q) || 
             pur.supplierName.toLowerCase().includes(q) ||
             pur.reference.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase (Invoices)</h1>
          <p className="text-sm text-slate-500">Record and manage purchase invoices post-receipt.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={loadData}>
            Refresh
          </Button>
          <Button variant="primary" className="flex items-center gap-2 font-bold" onClick={handleOpenNew}>
            <Plus className="w-4 h-4" /> New Purchase Invoice
          </Button>
        </div>
      </div>

      <Card className="p-4 flex flex-wrap items-center justify-start gap-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice no, supplier, reference..." 
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
              { value: 'POSTED', label: 'Posted' },
              { value: 'PAID', label: 'Paid' },
              { value: 'CANCELLED', label: 'Cancelled' }
            ]}
          />
        </div>
      </Card>

      <Card className="p-0 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-[11px] font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 whitespace-nowrap">Invoice #</th>
              <th className="p-4 whitespace-nowrap">Supplier</th>
              <th className="p-4 whitespace-nowrap">Invoice Date</th>
              <th className="p-4 whitespace-nowrap">Due Date</th>
              <th className="p-4 text-right whitespace-nowrap">Total Amount</th>
              <th className="p-4 text-center whitespace-nowrap">Status</th>
              <th className="p-4 text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {filteredPurchases.length > 0 ? filteredPurchases.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-mono font-bold text-xs">{p.invoiceNo}</td>
                <td className="p-4 font-medium">{p.supplierName}</td>
                <td className="p-4 text-xs">{p.invoiceDate}</td>
                <td className="p-4 text-xs">{p.dueDate || '-'}</td>
                <td className="p-4 text-right font-bold text-slate-700">${p.totalAmount.toFixed(2)}</td>
                <td className="p-4 text-center">{getStatusBadge(p.status)}</td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600" onClick={() => { setActivePurchase(p); setIsViewModalOpen(true); }} title="View Details">
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {p.status === 'DRAFT' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600" onClick={() => handleEdit(p)} title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}

                    {p.status === 'DRAFT' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-600" onClick={() => handleStatusChange(p, 'POSTED')} title="Post Invoice">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}

                    {p.status === 'DRAFT' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600" onClick={() => handleDelete(p)} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}

                    {p.status === 'POSTED' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-indigo-500 hover:text-indigo-600" onClick={() => handleStatusChange(p, 'PAID')} title="Mark as Paid">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}

                    {(p.status === 'POSTED' || p.status === 'DRAFT') && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600" onClick={() => handleStatusChange(p, 'CANCELLED')} title="Cancel">
                        <Power className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  No purchase invoices found.
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
          title={formData.id ? `Edit Purchase: ${formData.invoiceNo}` : "New Purchase Invoice"}
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
                  <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Invoice Details</h3>
                  <div className="space-y-4">
                    <Input label="Invoice No" value={formData.invoiceNo} disabled />
                    
                    <Input 
                      label="Supplier Name *" 
                      value={formData.supplierName} 
                      onChange={(e) => setFormData({...formData, supplierName: e.target.value})} 
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input type="date" label="Invoice Date *" value={formData.invoiceDate} onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})} />
                      <Input type="date" label="Due Date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
                    </div>

                    <Input label="Reference (e.g. PO Number)" value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} />
                    <Input label="Notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                  </div>
                </div>
              </div>
              
              {/* Right Column: Items */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Line Items</h3>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-end mb-4">
                  <div className="flex-1 min-w-[200px]">
                    <span className="text-slate-500 block mb-1.5 text-xs font-semibold uppercase">Product</span>
                    <Select 
                      value={newItem.productId || ''}
                      onChange={(e) => setNewItem({...newItem, productId: e.target.value})}
                      options={[
                        { value: '', label: '-- Select Product --' },
                        ...products.map(p => ({ value: p.id, label: p.name }))
                      ]}
                    />
                  </div>
                  <div className="w-24">
                    <Input 
                      type="number"
                      label="Quantity" 
                      value={newItem.quantity?.toString() || ''} 
                      onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})} 
                    />
                  </div>
                  <div className="w-32">
                    <Input 
                      type="number"
                      label="Unit Price" 
                      value={newItem.unitPrice?.toString() || ''} 
                      onChange={(e) => setNewItem({...newItem, unitPrice: Number(e.target.value)})} 
                    />
                  </div>
                  <div className="w-full md:w-auto mt-2 md:mt-0">
                    <Button variant="primary" onClick={handleAddItem} className="w-full">Add Product</Button>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3 text-right">Qty</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Total</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {formData.items && formData.items.length > 0 ? formData.items.map(item => (
                        <tr key={item.id}>
                          <td className="p-3 font-medium">{item.productName} <span className="text-xs text-slate-500 ml-1">({item.sku})</span></td>
                          <td className="p-3 text-right font-bold">{item.quantity}</td>
                          <td className="p-3 text-right text-slate-600">${item.unitPrice.toFixed(2)}</td>
                          <td className="p-3 text-right font-bold text-slate-800">${item.totalPrice.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500" onClick={() => handleRemoveItem(item.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} className="p-6 text-center text-slate-500">No items added.</td></tr>
                      )}
                    </tbody>
                    {formData.items && formData.items.length > 0 && (
                      <tfoot className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200">
                        <tr>
                          <td colSpan={3} className="p-3 text-right font-bold">Total Amount:</td>
                          <td className="p-3 text-right font-bold text-lg">${calculateTotal(formData.items).toFixed(2)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t pt-4">
              <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
              <Button variant="primary" className="bg-slate-600 hover:bg-slate-700" onClick={() => handleSaveForm('DRAFT')}>Save as Draft</Button>
              <Button variant="primary" onClick={() => handleSaveForm('POSTED')}>Post Invoice</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- VIEW MODAL --- */}
      {isViewModalOpen && activePurchase && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Purchase Details: ${activePurchase.invoiceNo}`}
          className="max-w-[900px]"
        >
          <div className="w-full p-4 md:p-6 overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">{activePurchase.invoiceNo}</h2>
                <p className="text-sm text-slate-500">Supplier: <span className="font-semibold text-slate-700">{activePurchase.supplierName}</span></p>
                <p className="text-xs text-slate-500">Invoice Date: {activePurchase.invoiceDate}</p>
                {activePurchase.dueDate && <p className="text-xs text-slate-500">Due Date: {activePurchase.dueDate}</p>}
              </div>
              {getStatusBadge(activePurchase.status)}
            </div>
            
            {(activePurchase.reference || activePurchase.notes) && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                {activePurchase.reference && <p className="text-sm mb-2"><span className="font-bold">Reference:</span> {activePurchase.reference}</p>}
                {activePurchase.notes && <p className="text-sm"><span className="font-bold">Notes:</span> {activePurchase.notes}</p>}
              </div>
            )}

            <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Line Items</h3>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-8">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activePurchase.items.map(item => (
                    <tr key={item.id}>
                      <td className="p-3 font-medium">{item.productName} <span className="text-xs text-slate-500 ml-2">({item.sku})</span></td>
                      <td className="p-3 text-right font-bold">{item.quantity}</td>
                      <td className="p-3 text-right text-slate-600">${item.unitPrice.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-slate-800">${item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200">
                  <tr>
                    <td colSpan={3} className="p-3 text-right font-bold text-slate-700">Total:</td>
                    <td className="p-3 text-right font-bold text-lg text-slate-900">${activePurchase.totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Audit Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Created</span>
                <span className="font-medium">{activePurchase.createdBy} <span className="text-xs text-slate-400">({new Date(activePurchase.createdDate).toLocaleString()})</span></span>
              </div>
              {activePurchase.postedBy && (
                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Posted</span>
                  <span className="font-medium">{activePurchase.postedBy} <span className="text-xs text-slate-400">({new Date(activePurchase.postedDate!).toLocaleString()})</span></span>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
