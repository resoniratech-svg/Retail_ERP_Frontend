import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@qatar-erp/ui';
import { formatQAR } from '@qatar-erp/utils';
import {
  Truck,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Building,
  FileText,
  DollarSign,
  Landmark,
  Phone,
  Mail,
  Globe,
  RefreshCw,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Layers,
  Link,
  Shield,
  FileSpreadsheet,
  RotateCcw,
  XCircle,
} from 'lucide-react';

const STORAGE_KEY = 'qatar_erp_vendors';

export interface OpeningInvoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  note: string;
  amount: number;
  location: string;
}

export interface Vendor {
  id: string;
  code: string;
  group: string;
  name: string;
  type: string;
  defProfitRate: number;
  address: string;
  city: string;
  state: string;
  country: string;
  trn: string;
  phone: string;
  salesPerson: string;
  mobile: string;
  email: string;
  isActive: boolean;

  // Additional Fields from DART POS Modal (Image 2)
  fax?: string;
  managerContact?: string;
  accountsContact?: string;
  sourceOfSupply?: string;
  linkedCustomer?: string;
  consignmentReportType?: 'Amount' | 'Quantity' | 'Detailed';
  website?: string;
  defaultPurchasePaymode?: string;
  defaultPaymentPaymode?: string;
  notes?: string;

  fixedProfitType?: boolean;
  showInVanExpense?: boolean;

  creditAmount?: number;
  creditDays?: number;

  openingInvoices?: OpeningInvoice[];
  balancePayable?: number;
}

const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vnd-001',
    code: 'VND-ALM-01',
    group: 'General FMCG',
    name: 'Almarai Food Qatar W.L.L',
    type: 'Regular',
    defProfitRate: 25.00,
    address: 'Building 45, Street 890, Industrial Area',
    city: 'Doha',
    state: 'Ad Dawhah',
    country: 'Qatar',
    trn: 'TRN-1002938491',
    phone: '+974 4455 8899',
    salesPerson: 'Tariq Al-Mansoor',
    mobile: '+974 5512 8899',
    email: 'orders.qatar@almarai.com',
    isActive: true,

    fax: '+974 4455 8800',
    managerContact: '+974 5511 2233',
    accountsContact: '+974 4455 8890',
    sourceOfSupply: 'Local Qatar VAT Registered',
    website: 'https://www.almarai.com',
    defaultPurchasePaymode: 'Credit 30 Days',
    defaultPaymentPaymode: 'Bank Transfer',
    notes: 'Primary fresh dairy supplier. Weekly Tuesday delivery schedule.',

    creditAmount: 100000.00,
    creditDays: 30,
    balancePayable: 14250.00,
    openingInvoices: [
      {
        id: 'inv-op-1',
        invoiceNo: 'ALM-INV-9921',
        invoiceDate: '2026-08-01',
        note: 'Opening Dairy Stock Invoice',
        amount: 14250.00,
        location: 'Doha Main Branch',
      },
    ],
  },
  {
    id: 'vnd-002',
    code: 'VND-DOH-02',
    group: 'Wholesale Grains',
    name: 'Doha Wholesale Trading W.L.L',
    type: 'Regular',
    defProfitRate: 30.00,
    address: 'Zone 57, Street 340, Salwa Road',
    city: 'Doha',
    state: 'Ad Dawhah',
    country: 'Qatar',
    trn: 'TRN-8829103921',
    phone: '+974 4411 2233',
    salesPerson: 'Khaled Mahmood',
    mobile: '+974 6699 0011',
    email: 'sales@dohawholesale.qa',
    isActive: true,

    sourceOfSupply: 'Local Qatar VAT Registered',
    website: 'https://www.dohawholesale.qa',
    defaultPurchasePaymode: 'Credit 45 Days',
    creditAmount: 200000.00,
    creditDays: 45,
    balancePayable: 32000.00,
  },
  {
    id: 'vnd-003',
    code: 'VND-RAY-03',
    group: 'Beverages',
    name: 'Rayyan Water Company W.L.L',
    type: 'Regular',
    defProfitRate: 40.00,
    address: 'Al Rayyan Bottling Plant, Zone 53',
    city: 'Al Rayyan',
    state: 'Al Rayyan',
    country: 'Qatar',
    trn: 'TRN-5541092831',
    phone: '+974 4488 9900',
    salesPerson: 'Sultan Al-Kuwari',
    mobile: '+974 3311 4455',
    email: 'orders@rayyanwater.com',
    isActive: true,

    sourceOfSupply: 'Local Qatar VAT Registered',
    website: 'https://www.rayyanwater.com',
    creditAmount: 50000.00,
    creditDays: 30,
    balancePayable: 8400.00,
  },
];

const loadStoredVendors = (): Vendor[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_VENDORS));
      return INITIAL_VENDORS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as Vendor[];
    }
    return INITIAL_VENDORS;
  } catch (e) {
    return INITIAL_VENDORS;
  }
};

const saveStoredVendors = (list: Vendor[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('qatar_vendors_updated'));
  } catch (e) {
    console.error('Failed to save vendors to localStorage:', e);
  }
};

export const VendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [modalTab, setModalTab] = useState<'General' | 'Documents'>('General');

  // Statement Modal State
  const [statementVendor, setStatementVendor] = useState<Vendor | null>(null);

  // Form State matching DART POS Image 2
  const [formData, setFormData] = useState<Partial<Vendor>>({
    code: '',
    group: 'General',
    name: '',
    type: 'Regular',
    defProfitRate: 25.00,
    address: '',
    city: 'Doha',
    state: 'Ad Dawhah',
    country: 'Qatar',
    trn: '',
    phone: '',
    salesPerson: '',
    mobile: '',
    email: '',
    isActive: true,

    fax: '',
    managerContact: '',
    accountsContact: '',
    sourceOfSupply: 'Local Qatar VAT Registered',
    linkedCustomer: '',
    consignmentReportType: 'Amount',
    website: 'https://www.google.com',
    defaultPurchasePaymode: 'All',
    defaultPaymentPaymode: 'All',
    notes: '',

    fixedProfitType: false,
    showInVanExpense: false,

    creditAmount: 50000.00,
    creditDays: 30,
    openingInvoices: [],
  });

  const [openingInvoicesList, setOpeningInvoicesList] = useState<OpeningInvoice[]>([]);
  const [newInvoiceRow, setNewInvoiceRow] = useState<Partial<OpeningInvoice>>({
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    note: '',
    amount: 0,
    location: 'Saudi Arabia',
  });

  useEffect(() => {
    setVendors(loadStoredVendors());
  }, []);

  const handleOpenAddModal = () => {
    setEditingVendor(null);
    setFormData({
      code: `VND-${Math.floor(100 + Math.random() * 900)}`,
      group: 'General',
      name: '',
      type: 'Regular',
      defProfitRate: 25.00,
      address: '',
      city: 'Doha',
      state: 'Ad Dawhah',
      country: 'Qatar',
      trn: `TRN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      phone: '+974 ',
      salesPerson: '',
      mobile: '+974 ',
      email: '',
      isActive: true,

      fax: '',
      managerContact: '',
      accountsContact: '',
      sourceOfSupply: 'Local Qatar VAT Registered',
      linkedCustomer: '',
      consignmentReportType: 'Amount',
      website: 'https://www.google.com',
      defaultPurchasePaymode: 'All',
      defaultPaymentPaymode: 'All',
      notes: '',

      fixedProfitType: false,
      showInVanExpense: false,

      creditAmount: 50000.00,
      creditDays: 30,
    });
    setOpeningInvoicesList([]);
    setModalTab('General');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (v: Vendor) => {
    setEditingVendor(v);
    setFormData({ ...v });
    setOpeningInvoicesList(v.openingInvoices || []);
    setModalTab('General');
    setIsModalOpen(true);
  };

  const handleDeleteVendor = (id: string) => {
    if (confirm('Are you sure you want to delete this vendor record?')) {
      const updated = vendors.filter((v) => v.id !== id);
      setVendors(updated);
      saveStoredVendors(updated);
    }
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      alert('Please enter Vendor Name.');
      return;
    }

    const payload: Vendor = {
      id: editingVendor ? editingVendor.id : `vnd-${Date.now()}`,
      code: formData.code || `VND-${Math.floor(100 + Math.random() * 900)}`,
      group: formData.group || 'General',
      name: formData.name.trim(),
      type: formData.type || 'Regular',
      defProfitRate: formData.defProfitRate || 25.00,
      address: formData.address || '',
      city: formData.city || 'Doha',
      state: formData.state || 'Ad Dawhah',
      country: formData.country || 'Qatar',
      trn: formData.trn || '',
      phone: formData.phone || '',
      salesPerson: formData.salesPerson || '',
      mobile: formData.mobile || '',
      email: formData.email || '',
      isActive: formData.isActive !== false,

      fax: formData.fax,
      managerContact: formData.managerContact,
      accountsContact: formData.accountsContact,
      sourceOfSupply: formData.sourceOfSupply,
      linkedCustomer: formData.linkedCustomer,
      consignmentReportType: formData.consignmentReportType,
      website: formData.website,
      defaultPurchasePaymode: formData.defaultPurchasePaymode,
      defaultPaymentPaymode: formData.defaultPaymentPaymode,
      notes: formData.notes,

      fixedProfitType: formData.fixedProfitType,
      showInVanExpense: formData.showInVanExpense,

      creditAmount: formData.creditAmount || 50000.00,
      creditDays: formData.creditDays || 30,

      openingInvoices: openingInvoicesList,
      balancePayable: openingInvoicesList.reduce((acc, inv) => acc + inv.amount, 0),
    };

    let updated: Vendor[];
    if (editingVendor) {
      updated = vendors.map((v) => (v.id === editingVendor.id ? payload : v));
    } else {
      updated = [payload, ...vendors];
    }

    setVendors(updated);
    saveStoredVendors(updated);
    setIsModalOpen(false);
  };

  const handleAddOpeningInvoice = () => {
    if (!newInvoiceRow.invoiceNo?.trim()) {
      alert('Please enter Invoice Number.');
      return;
    }
    const newInv: OpeningInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNo: newInvoiceRow.invoiceNo.trim(),
      invoiceDate: newInvoiceRow.invoiceDate || new Date().toISOString().split('T')[0],
      note: newInvoiceRow.note || 'Opening Invoice',
      amount: newInvoiceRow.amount || 0,
      location: newInvoiceRow.location || 'Saudi Arabia',
    };

    setOpeningInvoicesList((prev) => [...prev, newInv]);
    setNewInvoiceRow({
      invoiceNo: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      note: '',
      amount: 0,
      location: 'Saudi Arabia',
    });
  };

  const filteredVendors = vendors.filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      v.code.toLowerCase().includes(q) ||
      v.name.toLowerCase().includes(q) ||
      v.group.toLowerCase().includes(q) ||
      v.phone.includes(q) ||
      v.trn.toLowerCase().includes(q) ||
      v.salesPerson.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-4 font-sans text-xs">
      {/* 1. TOP DART POS ACTION TOOLBAR (Matching Image 1 Top) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-emerald-400" />
          <h1 className="text-sm font-bold">Vendors Master & Supplier Directory - DART POS</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setVendors(loadStoredVendors());
              alert('🔄 Vendor balances & ledger payables refreshed!');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Show Vendor Balance</span>
          </button>

          <button
            onClick={() => {
              if (vendors.length > 0) setStatementVendor(vendors[0]);
              else alert('No vendors available for statement');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Vendor Statement</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & SUMMARY BAR */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Enter text to search vendor code, name, TRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1 text-xs font-medium border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-300"
          >
            Clear
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
          <span>Total Suppliers: <strong className="text-emerald-600">{vendors.length} Vendors</strong></span>
          <span>Total Payables: <strong className="text-rose-600">{formatQAR(vendors.reduce((sum, v) => sum + (v.balancePayable || 0), 0))}</strong></span>
        </div>
      </div>

      {/* 3. DART POS MASTER VENDORS DATA TABLE WITH RIGHT VERTICAL SHORTCUT STRIP (Matching Screenshot 100%) */}
      <div className="bg-slate-200 border border-slate-300 rounded-xl overflow-hidden shadow-sm flex">
        {/* Left: Master Table Container */}
        <div className="flex-1 overflow-x-auto max-h-[60vh] bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 uppercase font-bold text-[10px] tracking-wider sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-200">VENDOR CODE</th>
                <th className="py-2.5 px-3 border-r border-slate-200">GROUP</th>
                <th className="py-2.5 px-3 border-r border-slate-200">VENDOR NAME</th>
                <th className="py-2.5 px-3 border-r border-slate-200">TYPE</th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-right">DEF PROFIT RATE</th>
                <th className="py-2.5 px-3 border-r border-slate-200">ADDRESS</th>
                <th className="py-2.5 px-3 border-r border-slate-200">CITY</th>
                <th className="py-2.5 px-3 border-r border-slate-200">STATE</th>
                <th className="py-2.5 px-3 border-r border-slate-200">COUNTRY</th>
                <th className="py-2.5 px-3 border-r border-slate-200 font-mono">TRN</th>
                <th className="py-2.5 px-3 border-r border-slate-200">PHONE</th>
                <th className="py-2.5 px-3 border-r border-slate-200">SALES PERSON</th>
                <th className="py-2.5 px-3 border-r border-slate-200">MOBILE</th>
                <th className="py-2.5 px-3 border-r border-slate-200">EMAIL</th>
                <th className="py-2.5 px-3 text-center">IN ACTIVE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-8 text-center text-slate-500">
                    <Truck className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-bold text-sm">No Vendors Found</p>
                  </td>
                </tr>
              ) : (
                filteredVendors.map((v) => {
                  const isSelected = selectedVendor?.id === v.id;
                  return (
                    <tr
                      key={v.id}
                      onClick={() => setSelectedVendor(v)}
                      onDoubleClick={() => handleOpenEditModal(v)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-navy-900 bg-blue-900 text-white font-bold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2 px-3 font-mono font-bold border-r border-slate-200">{v.code}</td>
                      <td className="py-2 px-3 border-r border-slate-200">{v.group}</td>
                      <td className="py-2 px-3 font-bold border-r border-slate-200">{v.name}</td>
                      <td className="py-2 px-3 border-r border-slate-200">{v.type}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700 border-r border-slate-200">{v.defProfitRate || 25.00}%</td>
                      <td className="py-2 px-3 border-r border-slate-200 truncate max-w-[150px]">{v.address || '-'}</td>
                      <td className="py-2 px-3 border-r border-slate-200">{v.city || 'Doha'}</td>
                      <td className="py-2 px-3 border-r border-slate-200">{v.state || 'Ad Dawhah'}</td>
                      <td className="py-2 px-3 border-r border-slate-200 font-semibold">{v.country}</td>
                      <td className="py-2 px-3 font-mono border-r border-slate-200">{v.trn}</td>
                      <td className="py-2 px-3 font-mono border-r border-slate-200">{v.phone}</td>
                      <td className="py-2 px-3 border-r border-slate-200">{v.salesPerson || '-'}</td>
                      <td className="py-2 px-3 font-mono border-r border-slate-200">{v.mobile || '-'}</td>
                      <td className="py-2 px-3 border-r border-slate-200">{v.email || '-'}</td>
                      <td className="py-2 px-3 text-center">
                        <input type="checkbox" checked={!v.isActive} readOnly className="rounded text-rose-600" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Right Vertical Action Shortcut Strip (Matching Target DART POS Screenshot 100%) */}
        <div className="w-11 bg-slate-300 border-l border-slate-400 p-1 flex flex-col items-center gap-2 shrink-0 select-none shadow-inner justify-start pt-2">
          {/* Button 1: Add Vendor (Green Plus Circle - Ctrl+A) */}
          <button
            onClick={handleOpenAddModal}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs group transition-all"
            title="Add Vendor (Ctrl + A)"
          >
            <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs leading-none shadow-2xs">
              +
            </div>
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+A</span>
          </button>

          {/* Button 2: Edit Vendor (Pencil Icon - Ctrl+E) */}
          <button
            onClick={() => {
              if (!selectedVendor) {
                alert('Please select a vendor first to edit.');
                return;
              }
              handleOpenEditModal(selectedVendor);
            }}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Edit Selected Vendor (Ctrl + E)"
          >
            <Edit className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+E</span>
          </button>

          {/* Button 3: Delete Vendor (Red Cross Icon - Ctrl+D) */}
          <button
            onClick={() => {
              if (!selectedVendor) {
                alert('Please select a vendor first to delete.');
                return;
              }
              handleDeleteVendor(selectedVendor.id);
            }}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Delete Selected Vendor (Ctrl + D)"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+D</span>
          </button>

          {/* Button 4: Refresh List (Blue Circular Arrow Icon - Ctrl+R) */}
          <button
            onClick={() => setVendors(loadStoredVendors())}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Refresh List (Ctrl + R)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+R</span>
          </button>

          {/* Button 5: Print / Search (Magnifying Glass Icon - Ctrl+P) */}
          <button
            onClick={() => alert('📄 Printing vendors supplier directory...')}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Print / Search Vendors (Ctrl + P)"
          >
            <Search className="w-3.5 h-3.5 text-slate-700" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+P</span>
          </button>
        </div>
      </div>

      {/* 4. COMPREHENSIVE NEW / EDIT VENDOR MODAL (Matching Image 2 Layout) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-4">
            {/* MODAL TITLE & TOP ACTION STRIP (Matching Image 2 Header) */}
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold">
                  {editingVendor ? `Edit Vendor: ${editingVendor.code}` : 'New Vendor - DART POS'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveVendor}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded"
                >
                  Save (Ctrl+S)
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* MODAL MAIN TABS (General & Documents) */}
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 border-b border-slate-200">
              <button
                type="button"
                onClick={() => setModalTab('General')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  modalTab === 'General'
                    ? 'bg-slate-900 text-emerald-400 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                General Details
              </button>
              <button
                type="button"
                onClick={() => setModalTab('Documents')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  modalTab === 'Documents'
                    ? 'bg-slate-900 text-emerald-400 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Documents & Attachments
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {modalTab === 'General' && (
                <div className="space-y-4">
                  {/* MAIN TWO COLUMNS GRID (Matching Image 2 Left & Right Form Layout) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* LEFT COLUMN: GENERAL IDENTIFICATION */}
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5">
                      <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1">
                        General Identification & Address
                      </h3>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Vendor Code *</label>
                          <input
                            type="text"
                            value={formData.code || ''}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold bg-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Vendor Group</label>
                          <select
                            value={formData.group || 'General'}
                            onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-semibold bg-white"
                          >
                            <option value="General">General</option>
                            <option value="General FMCG">General FMCG</option>
                            <option value="Wholesale Grains">Wholesale Grains</option>
                            <option value="Beverages">Beverages</option>
                            <option value="Import Suppliers">Import Suppliers</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Vendor Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Almarai Food Qatar W.L.L"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold text-slate-900 bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Address</label>
                        <input
                          type="text"
                          placeholder="Building, Street, Industrial Area"
                          value={formData.address || ''}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">City</label>
                          <input
                            type="text"
                            value={formData.city || 'Doha'}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">State</label>
                          <input
                            type="text"
                            value={formData.state || 'Ad Dawhah'}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Country</label>
                          <select
                            value={formData.country || 'Qatar'}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-semibold"
                          >
                            <option value="Qatar">Qatar</option>
                            <option value="Saudi Arabia">Saudi Arabia</option>
                            <option value="United Arab Emirates">United Arab Emirates</option>
                            <option value="Kuwait">Kuwait</option>
                            <option value="Oman">Oman</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">TRN (Tax Reg No)</label>
                          <input
                            type="text"
                            placeholder="TRN-1002938491"
                            value={formData.trn || ''}
                            onChange={(e) => setFormData({ ...formData, trn: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Consignment Report Type</label>
                          <select
                            value={formData.consignmentReportType || 'Amount'}
                            onChange={(e) => setFormData({ ...formData, consignmentReportType: e.target.value as any })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                          >
                            <option value="Amount">Amount</option>
                            <option value="Quantity">Quantity</option>
                            <option value="Detailed">Detailed</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                          <input
                            type="checkbox"
                            checked={formData.isActive === false}
                            onChange={(e) => setFormData({ ...formData, isActive: !e.target.checked })}
                            className="rounded text-rose-600"
                          />
                          <span>Inactive Vendor</span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Website</label>
                        <input
                          type="text"
                          value={formData.website || 'https://www.google.com'}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-blue-600 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Notes</label>
                        <textarea
                          rows={2}
                          placeholder="Vendor purchase notes and instructions..."
                          value={formData.notes || ''}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white"
                        />
                      </div>
                    </div>

                    {/* RIGHT COLUMN: CONTACT & PRICING (Image 2 Right) */}
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5">
                      <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1">
                        Contacts & Procurement Settings
                      </h3>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Sales Person</label>
                          <input
                            type="text"
                            placeholder="Representative Name"
                            value={formData.salesPerson || ''}
                            onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Phone</label>
                          <input
                            type="text"
                            value={formData.phone || ''}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Mobile</label>
                          <input
                            type="text"
                            value={formData.mobile || ''}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Email</label>
                          <input
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Manager Contact</label>
                          <input
                            type="text"
                            value={formData.managerContact || ''}
                            onChange={(e) => setFormData({ ...formData, managerContact: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Accounts Contact</label>
                          <input
                            type="text"
                            value={formData.accountsContact || ''}
                            onChange={(e) => setFormData({ ...formData, accountsContact: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Source of Supply</label>
                        <select
                          value={formData.sourceOfSupply || 'Local Qatar VAT Registered'}
                          onChange={(e) => setFormData({ ...formData, sourceOfSupply: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-semibold"
                        >
                          <option value="Local Qatar VAT Registered">Local Qatar VAT Registered</option>
                          <option value="GCC Import Duty Free">GCC Import Duty Free</option>
                          <option value="Overseas International Import">Overseas International Import</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Default Profit Rate %</label>
                          <input
                            type="number"
                            step="0.1"
                            value={formData.defProfitRate ?? 25.00}
                            onChange={(e) => setFormData({ ...formData, defProfitRate: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold text-emerald-700 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Default Purchase Paymode</label>
                          <select
                            value={formData.defaultPurchasePaymode || 'All'}
                            onChange={(e) => setFormData({ ...formData, defaultPurchasePaymode: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                          >
                            <option value="All">All Paymodes</option>
                            <option value="Cash">Cash</option>
                            <option value="Credit 30 Days">Credit 30 Days</option>
                            <option value="Credit 45 Days">Credit 45 Days</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CREDIT LIMITS CARD (Matching Image 2 Credit Limits Panel) */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                    <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1">
                      Credit Limits & Payment Terms
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Credit Amount Limit (QAR)</label>
                        <input
                          type="number"
                          step="1000"
                          value={formData.creditAmount ?? 50000.00}
                          onChange={(e) => setFormData({ ...formData, creditAmount: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold text-rose-700 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Credit Days</label>
                        <input
                          type="number"
                          value={formData.creditDays ?? 30}
                          onChange={(e) => setFormData({ ...formData, creditDays: parseInt(e.target.value) || 30 })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ACCOUNTS & OPENING INVOICES GRID (Matching Image 2 Bottom Accounts Panel) */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                        Accounts - Opening Invoices Balance Grid
                      </h3>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">
                        Total Balance: {formatQAR(openingInvoicesList.reduce((acc, i) => acc + i.amount, 0))}
                      </span>
                    </div>

                    {/* NEW ROW INPUT GRID */}
                    <div className="grid grid-cols-5 gap-2 bg-white p-2 rounded border border-slate-200 text-xs">
                      <input
                        type="text"
                        placeholder="Invoice #"
                        value={newInvoiceRow.invoiceNo || ''}
                        onChange={(e) => setNewInvoiceRow({ ...newInvoiceRow, invoiceNo: e.target.value })}
                        className="px-2 py-1 border border-slate-300 rounded font-mono"
                      />
                      <input
                        type="date"
                        value={newInvoiceRow.invoiceDate || ''}
                        onChange={(e) => setNewInvoiceRow({ ...newInvoiceRow, invoiceDate: e.target.value })}
                        className="px-2 py-1 border border-slate-300 rounded font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Note"
                        value={newInvoiceRow.note || ''}
                        onChange={(e) => setNewInvoiceRow({ ...newInvoiceRow, note: e.target.value })}
                        className="px-2 py-1 border border-slate-300 rounded"
                      />
                      <input
                        type="number"
                        placeholder="Amount QAR"
                        value={newInvoiceRow.amount || ''}
                        onChange={(e) => setNewInvoiceRow({ ...newInvoiceRow, amount: parseFloat(e.target.value) || 0 })}
                        className="px-2 py-1 border border-slate-300 rounded font-mono font-bold text-right"
                      />
                      <div className="flex items-center gap-1">
                        <select
                          value={newInvoiceRow.location || 'Saudi Arabia'}
                          onChange={(e) => setNewInvoiceRow({ ...newInvoiceRow, location: e.target.value })}
                          className="flex-1 px-1.5 py-1 border border-slate-300 rounded text-[11px]"
                        >
                          <option value="Saudi Arabia">Saudi Arabia</option>
                          <option value="Doha Main Branch">Doha Main Branch</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleAddOpeningInvoice}
                          className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded text-xs"
                        >
                          + Add
                        </button>
                      </div>
                    </div>

                    {/* INVOICES TABLE */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] border-collapse bg-white rounded border border-slate-200">
                        <thead className="bg-slate-100 font-bold uppercase text-[9px] text-slate-600">
                          <tr>
                            <th className="p-1.5">Invoice #</th>
                            <th className="p-1.5">Invoice Date</th>
                            <th className="p-1.5">Note</th>
                            <th className="p-1.5 text-right">Amount (QAR)</th>
                            <th className="p-1.5">Location</th>
                            <th className="p-1.5 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {openingInvoicesList.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-3 text-center text-slate-400 text-[10px]">
                                No opening invoices recorded for this vendor.
                              </td>
                            </tr>
                          ) : (
                            openingInvoicesList.map((inv, idx) => (
                              <tr key={inv.id}>
                                <td className="p-1.5 font-mono font-bold text-slate-900">{inv.invoiceNo}</td>
                                <td className="p-1.5 font-mono text-slate-600">{inv.invoiceDate}</td>
                                <td className="p-1.5 text-slate-700">{inv.note}</td>
                                <td className="p-1.5 text-right font-mono font-bold text-emerald-700">{formatQAR(inv.amount)}</td>
                                <td className="p-1.5 text-slate-600">{inv.location}</td>
                                <td className="p-1.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => setOpeningInvoicesList((prev) => prev.filter((_, i) => i !== idx))}
                                    className="text-rose-600 hover:text-rose-800 font-bold text-[10px]"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'Documents' && (
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-4 text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">Vendor Compliance & Legal Documents</h3>
                    <p className="text-xs text-slate-500 mt-1">Upload Commercial Registration (CR), Tax Card, and IBAN Bank Letters.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert('📄 Commercial Registration (CR) uploaded!')}
                    className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg"
                  >
                    + Upload Vendor Document PDF
                  </button>
                </div>
              )}

              {/* MODAL FOOTER */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  {editingVendor ? 'Update Vendor Master' : 'Save Vendor Master'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. VENDOR STATEMENT OF ACCOUNT MODAL */}
      {statementVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Vendor Statement of Account (SOA)</span>
                </h2>
                <p className="text-xs text-slate-500">{statementVendor.name} ({statementVendor.code})</p>
              </div>
              <button onClick={() => setStatementVendor(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Credit Limit</span>
                <strong className="text-sm font-mono font-bold text-slate-900">{formatQAR(statementVendor.creditAmount || 50000)}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Terms</span>
                <strong className="text-sm font-mono font-bold text-slate-900">{statementVendor.creditDays || 30} Days</strong>
              </div>
              <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                <span className="text-[10px] text-rose-600 block font-bold">Current Payable Balance</span>
                <strong className="text-base font-mono font-black text-rose-700">{formatQAR(statementVendor.balancePayable || 0)}</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => alert(`🖨️ Statement of Account printed for ${statementVendor.name}`)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print SOA</span>
              </button>
              <button onClick={() => setStatementVendor(null)} className="px-4 py-2 bg-slate-100 text-slate-800 font-bold rounded-lg">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsPage;
