import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Search, Plus, Eye, Trash2 } from 'lucide-react';
import { productsService } from '@qatar-erp/api';

const STORAGE_KEY = 'retail_erp_customer_price_lists';
const CURRENT_USER = 'Ahmed Al-Mansouri';
const CUSTOMERS = [
  { id: 'CUST-001', name: 'Doha Hypermarket Chain' },
  { id: 'CUST-002', name: 'Al Meera Consumer Goods' },
  { id: 'GROUP-VIP', name: 'VIP Wholesale Group' },
];

type PriceListStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

interface PriceListItem {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  basePrice: number;
  customerPrice: number;
  minQuantity: number;
  maxQuantity: number;
}

interface CustomerPriceList {
  id: string;
  priceListNo: string;
  name: string;
  customerId: string;
  customerName: string;
  currency: string;
  effectiveFrom: string;
  effectiveTo: string;
  remarks: string;
  items: PriceListItem[];
  productCount: number;
  status: PriceListStatus;
  createdDate: string;
  createdBy: string;
}

export const CustomerPriceListPage: React.FC = () => {
  const [records, setRecords] = useState<CustomerPriceList[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const [activeRecord, setActiveRecord] = useState<CustomerPriceList | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCustomer, setFormCustomer] = useState('');
  const [formCurrency, setFormCurrency] = useState('QAR');
  const [formFromDate, setFormFromDate] = useState('');
  const [formToDate, setFormToDate] = useState('');
  const [formRemarks, setFormRemarks] = useState('');
  const [formItems, setFormItems] = useState<PriceListItem[]>([]);

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

  const saveRecords = (data: CustomerPriceList[]) => {
    setRecords(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const generateNo = () => {
    return `CPL-2026-${(records.length + 1).toString().padStart(4, '0')}`;
  };

  const getStatusBadge = (status: PriceListStatus) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="neutral">Draft</Badge>;
      case 'ACTIVE': return <Badge variant="success">Active</Badge>;
      case 'INACTIVE': return <Badge variant="danger">Inactive</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const openNewForm = () => {
    setActiveRecord(null);
    setFormName('');
    setFormCustomer('');
    setFormCurrency('QAR');
    setFormFromDate('');
    setFormToDate('');
    setFormRemarks('');
    setFormItems([]);
    setIsFormModalOpen(true);
  };

  const addItem = (prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;
    if (formItems.some(m => m.productId === prod.id)) return alert('Product already added to this price list.');
    setFormItems([...formItems, {
      id: Date.now().toString(),
      productId: prod.id,
      productSku: prod.sku,
      productName: prod.name,
      basePrice: prod.price || 0,
      customerPrice: prod.price || 0,
      minQuantity: 1,
      maxQuantity: 99999
    }]);
  };

  const handlePriceChange = (index: number, newPrice: number) => {
    setFormItems(formItems.map((item, i) => i === index ? { ...item, customerPrice: newPrice } : item));
  };
  const handleMinChange = (index: number, newMin: number) => {
    setFormItems(formItems.map((item, i) => i === index ? { ...item, minQuantity: newMin } : item));
  };
  const handleMaxChange = (index: number, newMax: number) => {
    setFormItems(formItems.map((item, i) => i === index ? { ...item, maxQuantity: newMax } : item));
  };

  const handleSaveForm = (isActive: boolean = false) => {
    if (!formName) return alert('Price List Name is required.');
    if (!formCustomer) return alert('Customer / Customer Group is required.');
    if (formFromDate && formToDate && new Date(formFromDate) > new Date(formToDate)) return alert('Effective From date cannot be after Effective To date.');
    if (formItems.some(i => i.customerPrice < 0)) return alert('Prices cannot be negative.');

    const newRecord: CustomerPriceList = {
      id: activeRecord?.id || Date.now().toString(),
      priceListNo: activeRecord?.priceListNo || generateNo(),
      name: formName,
      customerId: formCustomer,
      customerName: CUSTOMERS.find(c => c.id === formCustomer)?.name || formCustomer,
      currency: formCurrency,
      effectiveFrom: formFromDate,
      effectiveTo: formToDate,
      remarks: formRemarks,
      items: formItems,
      productCount: formItems.length,
      status: isActive ? 'ACTIVE' : 'DRAFT',
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

  const handleStatusChange = (r: CustomerPriceList, newStatus: PriceListStatus) => {
    saveRecords(records.map(sa => sa.id === r.id ? { ...sa, status: newStatus } : sa));
    setIsViewModalOpen(false);
  };

  const filteredRecords = records.filter(w => {
    if (statusFilter !== 'ALL' && w.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return w.priceListNo.toLowerCase().includes(q) || 
             w.name.toLowerCase().includes(q) ||
             w.customerName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Price List</h1>
          <p className="text-sm text-slate-500">Manage customer-specific product pricing.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={openNewForm}>
            <Plus className="w-4 h-4 mr-2 inline" /> New Price List
          </Button>
        </div>
      </div>

      <Card className="p-4 flex gap-4 bg-slate-50/50">
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search price lists..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300"
          />
        </div>
        <Select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'DRAFT', label: 'Draft' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' }
          ]}
        />
      </Card>

      <Card className="p-0 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 uppercase text-[11px] font-semibold text-slate-700 border-b">
            <tr>
              <th className="p-4">Price List #</th>
              <th className="p-4">Name</th>
              <th className="p-4">Customer / Group</th>
              <th className="p-4">Effective Dates</th>
              <th className="p-4 text-center">Products</th>
              <th className="p-4 text-center">Currency</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRecords.map((w) => (
              <tr key={w.id} className="hover:bg-slate-50">
                <td className="p-4 font-mono font-bold text-xs">{w.priceListNo}</td>
                <td className="p-4 font-medium">{w.name}</td>
                <td className="p-4 text-slate-700 text-xs">{w.customerName}</td>
                <td className="p-4 text-xs font-mono">{w.effectiveFrom || '-'} to {w.effectiveTo || '-'}</td>
                <td className="p-4 text-center font-bold text-slate-700">{w.productCount}</td>
                <td className="p-4 text-center text-xs">{w.currency}</td>
                <td className="p-4 text-center">{getStatusBadge(w.status)}</td>
                <td className="p-4 text-center">
                  <Button variant="ghost" size="sm" onClick={() => { setActiveRecord(w); setIsViewModalOpen(true); }}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {filteredRecords.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-slate-500">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {isFormModalOpen && (
        <Modal isOpen onClose={() => setIsFormModalOpen(false)} title="New Customer Price List" className="max-w-[1000px]">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-blue-700">Price List Name</label>
                <Input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. VIP Summer Discount" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Customer / Customer Group</label>
                <Select value={formCustomer} onChange={(e) => setFormCustomer(e.target.value)} options={[{ value: '', label: 'Select...' }, ...CUSTOMERS.map(w => ({ value: w.id, label: w.name }))]} />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 border rounded-lg">
              <div>
                <label className="block text-xs font-semibold mb-1">Currency</label>
                <Select value={formCurrency} onChange={(e) => setFormCurrency(e.target.value)} options={[{ value: 'QAR', label: 'QAR' }, { value: 'USD', label: 'USD' }]} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Effective From</label>
                <Input type="date" value={formFromDate} onChange={(e) => setFormFromDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Effective To</label>
                <Input type="date" value={formToDate} onChange={(e) => setFormToDate(e.target.value)} />
              </div>
            </div>

            <div className="mb-4">
               <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm">Products Pricing</h3>
                  <Select 
                    value="" 
                    onChange={(e) => { if(e.target.value) addItem(e.target.value); }}
                    options={[{ value: '', label: '+ Add Product' }, ...products.map((p: any) => ({ value: p.id, label: `${p.sku} - ${p.name}` }))]}
                  />
               </div>
               <table className="w-full text-left text-sm border rounded">
                  <thead className="bg-slate-100 text-xs">
                     <tr>
                        <th className="p-2">Product</th>
                        <th className="p-2 w-28 text-right">Base Price</th>
                        <th className="p-2 w-32">Cust. Price ({formCurrency})</th>
                        <th className="p-2 w-24">Min Qty</th>
                        <th className="p-2 w-24">Max Qty</th>
                        <th className="p-2 w-10"></th>
                     </tr>
                  </thead>
                  <tbody>
                     {formItems.map((m, i) => (
                        <tr key={m.id} className="border-t">
                           <td className="p-2 text-xs">{m.productSku} - {m.productName}</td>
                           <td className="p-2 text-right text-xs font-mono line-through text-slate-400">{m.basePrice.toFixed(2)}</td>
                           <td className="p-2">
                              <Input type="number" min="0" step="0.01" value={m.customerPrice} onChange={(e) => handlePriceChange(i, parseFloat(e.target.value) || 0)} />
                           </td>
                           <td className="p-2">
                              <Input type="number" min="1" value={m.minQuantity} onChange={(e) => handleMinChange(i, parseInt(e.target.value) || 0)} />
                           </td>
                           <td className="p-2">
                              <Input type="number" min="1" value={m.maxQuantity} onChange={(e) => handleMaxChange(i, parseInt(e.target.value) || 0)} />
                           </td>
                           <td className="p-2">
                              <Button variant="ghost" size="sm" onClick={() => setFormItems(formItems.filter((_, fi) => fi !== i))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                           </td>
                        </tr>
                     ))}
                     {formItems.length === 0 && (
                        <tr><td colSpan={6} className="p-4 text-center text-xs text-slate-500">No products added.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>

            <div className="mb-4">
                <label className="block text-xs font-semibold mb-1">Remarks</label>
                <Input value={formRemarks} onChange={(e) => setFormRemarks(e.target.value)} placeholder="Additional notes..." />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
              <Button variant="outline" onClick={() => handleSaveForm(false)}>Save Draft</Button>
              <Button variant="primary" onClick={() => handleSaveForm(true)}>Activate List</Button>
            </div>
          </div>
        </Modal>
      )}

      {isViewModalOpen && activeRecord && (
        <Modal isOpen onClose={() => setIsViewModalOpen(false)} title={`Price List: ${activeRecord.priceListNo}`} className="max-w-[800px]">
          <div className="p-6">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{activeRecord.name}</h2>
                <p className="text-sm text-slate-500">{activeRecord.customerName} | {activeRecord.currency}</p>
                <p className="text-xs text-slate-400">Valid: {activeRecord.effectiveFrom || 'Always'} to {activeRecord.effectiveTo || 'Always'}</p>
              </div>
              {getStatusBadge(activeRecord.status)}
            </div>

            <h3 className="font-bold text-sm mb-2">Priced Products</h3>
            <table className="w-full text-left text-sm border rounded mb-6">
               <thead className="bg-slate-50 text-xs">
                  <tr>
                     <th className="p-2">Product</th>
                     <th className="p-2 text-right">Base Price</th>
                     <th className="p-2 text-right">Customer Price</th>
                     <th className="p-2 text-center">Qty Limits</th>
                  </tr>
               </thead>
               <tbody>
                  {activeRecord.items.map(m => (
                     <tr key={m.id} className="border-t">
                        <td className="p-2 text-xs">{m.productSku} - {m.productName}</td>
                        <td className="p-2 text-right font-mono text-xs text-slate-400 line-through">{m.basePrice.toFixed(2)}</td>
                        <td className="p-2 text-right font-mono font-bold text-emerald-700">{m.customerPrice.toFixed(2)} {activeRecord.currency}</td>
                        <td className="p-2 text-center text-[10px] text-slate-500">{m.minQuantity} - {m.maxQuantity === 99999 ? 'MAX' : m.maxQuantity}</td>
                     </tr>
                  ))}
               </tbody>
            </table>

            <div className="flex justify-end gap-3 mt-8">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
              {activeRecord.status === 'DRAFT' && (
                <Button variant="primary" onClick={() => handleStatusChange(activeRecord, 'ACTIVE')}>Activate</Button>
              )}
              {activeRecord.status === 'ACTIVE' && (
                <Button variant="danger" onClick={() => handleStatusChange(activeRecord, 'INACTIVE')}>Deactivate</Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
