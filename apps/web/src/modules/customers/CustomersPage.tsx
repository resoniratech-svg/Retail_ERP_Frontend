import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, RefreshCw, Printer, Check, DollarSign, FileText, Barcode, Building, Award, UserCheck, Gift, Save } from 'lucide-react';

interface CustomerRecord {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  trn: string;
  route: string;
  phone: string;
  contactPerson: string;
  mobile: string;
  email: string;
  salesPerson: string;
  deliveryAgent: string;
  customerGroup: string;
  location: string;
  customerTerms: string;
  priceGroup: string;
  category: string;
  customerType: string;
  defaultTax: string;
  status: string;
}

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerRecord[]>([
    {
      id: '1',
      code: '00001',
      name: 'harlesh',
      address: 'vemulwada',
      city: 'kmr',
      trn: '30000001',
      route: 'Doha Central',
      phone: '100',
      contactPerson: 'Harlesh Admin',
      mobile: '55001122',
      email: 'tfdgtffg@gmail.com',
      salesPerson: 'Sai',
      deliveryAgent: 'Kassim Driver',
      customerGroup: 'No Company Group',
      location: 'Saudi Arabia',
      customerTerms: 'Credit & Cash',
      priceGroup: 'Retail Tier 1',
      category: 'General',
      customerType: 'B2B Client',
      defaultTax: 'Qatar VAT 0%',
      status: 'Active',
    },
    {
      id: '2',
      code: '00002',
      name: 'Al Mansoor Hotel Group',
      address: 'West Bay Diplomatic Area',
      city: 'Doha',
      trn: '30000088',
      route: 'West Bay Corporate Route',
      phone: '44991122',
      contactPerson: 'Tariq Procurement',
      mobile: '55112233',
      email: 'procurement@almansoor.qa',
      salesPerson: 'Sai',
      deliveryAgent: 'Doha Express Fleet',
      customerGroup: 'Hospitality Group',
      location: 'Doha Main Branch',
      customerTerms: '30 Days Net Credit',
      priceGroup: 'Wholesale Tier A',
      category: 'Corporate VIP',
      customerType: 'Hotel & Hospitality',
      defaultTax: 'Qatar VAT 0%',
      status: 'Active',
    },
  ]);

  const [searchText, setSearchText] = useState('');
  const [otherContactsSearch, setOtherContactsSearch] = useState('');
  const [searchMode, setSearchMode] = useState<'Begin With' | 'Contains'>('Begin With');
  const [selectedCustId, setSelectedCustId] = useState<string | null>('1');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: `0000${customers.length + 1}`,
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Doha',
    salesPerson: 'Sai',
    location: 'Saudi Arabia',
  });

  const filteredCustomers = customers.filter((c) => {
    const query = searchText.toLowerCase().trim();
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      c.phone.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query)
    );
  });

  const handleClear = () => {
    setSearchText('');
  };

  const handleAddCustomer = () => {
    if (!formData.name.trim()) {
      alert('Please enter Customer Name');
      return;
    }
    const newCust: CustomerRecord = {
      id: Date.now().toString(),
      code: formData.code || `0000${customers.length + 1}`,
      name: formData.name,
      address: formData.address || 'Doha Qatar',
      city: formData.city || 'Doha',
      trn: '30000099',
      route: 'General Route',
      phone: formData.phone || '44000000',
      contactPerson: formData.name,
      mobile: formData.phone || '55000000',
      email: formData.email || 'customer@retail.qa',
      salesPerson: formData.salesPerson,
      deliveryAgent: 'Standard Delivery',
      customerGroup: 'General',
      location: formData.location,
      customerTerms: 'Credit & Cash',
      priceGroup: 'Retail Tier 1',
      category: 'General',
      customerType: 'Retail',
      defaultTax: 'Qatar VAT 0%',
      status: 'Active',
    };
    setCustomers([newCust, ...customers]);
    setIsAddModalOpen(false);
    setFormData({ code: '', name: '', phone: '', email: '', address: '', city: 'Doha', salesPerson: 'Sai', location: 'Saudi Arabia' });
  };

  const handleDeleteCustomer = () => {
    if (!selectedCustId) {
      alert('Please select a customer to delete.');
      return;
    }
    setCustomers(customers.filter((c) => c.id !== selectedCustId));
    setSelectedCustId(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-100 font-sans text-xs select-none">
      {/* 1. TOP SUB-RIBBON QUICK TOOLS BAR (Matching Target Image 1 Top Strip) */}
      <div className="bg-white border-b border-slate-300 p-1.5 flex items-center justify-between gap-1 overflow-x-auto text-[11px] font-semibold shrink-0 shadow-xs">
        <div className="flex items-center gap-1 flex-wrap">
          <button onClick={() => alert('💰 Customer Balance Breakdown Report')} className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Show Customer Balance</span>
          </button>
          <button onClick={() => alert('📄 Customer Statement Preview (PDF)')} className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Customer Statement</span>
          </button>
          <button onClick={() => alert('🖨️ Customer Barcode Card Printed')} className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded">
            <Barcode className="w-3.5 h-3.5 text-indigo-600" />
            <span>Barcode</span>
          </button>
          <button onClick={() => alert('🏢 Customer Companies Directory')} className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded">
            <Building className="w-3.5 h-3.5 text-amber-600" />
            <span>Companies</span>
          </button>
          <button onClick={() => alert('📊 Asset Report Generated')} className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded">
            <Award className="w-3.5 h-3.5 text-purple-600" />
            <span>Asset Report</span>
          </button>
          <button onClick={() => alert('📄 VCF Contact File Exported')} className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded">
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            <span>Create VCF</span>
          </button>
          <button onClick={() => alert('👥 SalesMan Customer Change Modal')} className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded">
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>SalesMan Customer Change</span>
          </button>
          <button onClick={() => alert('🎁 Opening Loyalty Point Adjustment Modal')} className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded">
            <Gift className="w-3.5 h-3.5 text-pink-600" />
            <span>Opening Loyalty Point</span>
          </button>
          <button onClick={() => alert('💾 Customer Layout Settings Saved!')} className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded">
            <Save className="w-3.5 h-3.5 text-slate-700" />
            <span>Save Layout</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH OTHER CONTACTS BAR (Matching Target Image 1) */}
      <div className="bg-slate-200 px-3 py-1 border-b border-slate-300 flex items-center gap-3 font-semibold text-slate-700 shrink-0">
        <span className="text-slate-800 shrink-0">Search Other Contacts</span>
        <input
          type="text"
          placeholder="Search Other Contacts"
          value={otherContactsSearch}
          onChange={(e) => setOtherContactsSearch(e.target.value)}
          className="px-2.5 py-0.5 border border-slate-400 rounded bg-white font-mono text-xs w-64 focus:border-cyan-600"
        />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="custSearchMode"
              checked={searchMode === 'Begin With'}
              onChange={() => setSearchMode('Begin With')}
            />
            <span>Begin With</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="custSearchMode"
              checked={searchMode === 'Contains'}
              onChange={() => setSearchMode('Contains')}
            />
            <span>Contains</span>
          </label>
        </div>
      </div>

      {/* 3. INNER CENTERED TITLE BAR (Matching Target Image 1) */}
      <div className="bg-slate-300 py-1 border-b border-slate-400 text-center font-bold text-slate-800 text-xs shadow-inner shrink-0">
        Customers
      </div>

      {/* 4. MAIN TABLE SEARCH ROW (Matching Target Image 1) */}
      <div className="bg-slate-200 p-2 border-b border-slate-300 flex items-center gap-2 shrink-0">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Enter text to search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-2 pr-6 py-1 border border-slate-400 rounded bg-white text-xs font-mono focus:border-cyan-600 focus:outline-none shadow-xs"
          />
          <span className="absolute right-2 top-1.5 text-slate-400 text-[10px]">▼</span>
        </div>

        <button
          onClick={() => alert(`🔍 Searching Customers for "${searchText}"`)}
          className="px-4 py-1 bg-slate-300 hover:bg-slate-400/80 text-slate-900 font-bold border border-slate-400 rounded shadow-xs active:bg-slate-400"
        >
          Find
        </button>

        <button
          onClick={handleClear}
          className="px-4 py-1 bg-slate-300 hover:bg-slate-400/80 text-slate-900 font-bold border border-slate-400 rounded shadow-xs active:bg-slate-400"
        >
          Clear
        </button>
      </div>

      {/* 5. MAIN CONTENT GRID & RIGHT TOOLBAR */}
      <div className="flex-1 flex overflow-hidden">
        {/* DATA GRID TABLE WITH FULL 20 MASTER COLUMNS */}
        <div className="flex-1 overflow-auto bg-white border-r border-slate-300">
          <table className="w-full text-left text-xs border-collapse min-w-[1400px]">
            <thead className="bg-slate-200 font-bold text-slate-700 uppercase text-[10px] sticky top-0 border-b border-slate-300 shadow-xs">
              <tr>
                <th className="p-2 border-r border-slate-300 w-24 font-mono">Customer Code</th>
                <th className="p-2 border-r border-slate-300 w-36">Customer Name</th>
                <th className="p-2 border-r border-slate-300 w-36">Address</th>
                <th className="p-2 border-r border-slate-300 w-24">City</th>
                <th className="p-2 border-r border-slate-300 w-28 font-mono">TRN</th>
                <th className="p-2 border-r border-slate-300 w-28">Route</th>
                <th className="p-2 border-r border-slate-300 w-24 font-mono">Phone</th>
                <th className="p-2 border-r border-slate-300 w-32">Contact Person</th>
                <th className="p-2 border-r border-slate-300 w-28 font-mono">Mobile</th>
                <th className="p-2 border-r border-slate-300 w-36 font-mono">Email</th>
                <th className="p-2 border-r border-slate-300 w-28">Sales Person</th>
                <th className="p-2 border-r border-slate-300 w-32">Delivery Agent</th>
                <th className="p-2 border-r border-slate-300 w-32">Customer Group</th>
                <th className="p-2 border-r border-slate-300 w-32">Location</th>
                <th className="p-2 border-r border-slate-300 w-32">Customer Terms</th>
                <th className="p-2 border-r border-slate-300 w-28">Price Group</th>
                <th className="p-2 border-r border-slate-300 w-28">Customer Category</th>
                <th className="p-2 border-r border-slate-300 w-28">Customer Type</th>
                <th className="p-2 border-r border-slate-300 w-28">Default Tax</th>
                <th className="p-2 w-20 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={20} className="p-12 text-center text-slate-400 italic">
                    No Customer records found. Click ➕ (Ctrl+A) to add a customer.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustId(c.id)}
                    className={`cursor-pointer hover:bg-sky-50 ${selectedCustId === c.id ? 'bg-sky-100 font-bold text-slate-900' : 'text-slate-800'}`}
                  >
                    <td className="p-2 border-r border-slate-200 font-mono font-bold text-slate-900">{c.code}</td>
                    <td className="p-2 border-r border-slate-200 font-bold">{c.name}</td>
                    <td className="p-2 border-r border-slate-200 text-slate-700">{c.address}</td>
                    <td className="p-2 border-r border-slate-200 text-slate-700">{c.city}</td>
                    <td className="p-2 border-r border-slate-200 font-mono text-slate-600">{c.trn}</td>
                    <td className="p-2 border-r border-slate-200 text-slate-600">{c.route}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{c.phone}</td>
                    <td className="p-2 border-r border-slate-200 text-slate-700">{c.contactPerson}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{c.mobile}</td>
                    <td className="p-2 border-r border-slate-200 font-mono text-blue-700">{c.email}</td>
                    <td className="p-2 border-r border-slate-200 font-semibold">{c.salesPerson}</td>
                    <td className="p-2 border-r border-slate-200 text-slate-600">{c.deliveryAgent}</td>
                    <td className="p-2 border-r border-slate-200 text-slate-600">{c.customerGroup}</td>
                    <td className="p-2 border-r border-slate-200 font-semibold text-slate-800">{c.location}</td>
                    <td className="p-2 border-r border-slate-200 text-slate-700">{c.customerTerms}</td>
                    <td className="p-2 border-r border-slate-200 text-slate-600">{c.priceGroup}</td>
                    <td className="p-2 border-r border-slate-200 font-semibold text-slate-700">{c.category}</td>
                    <td className="p-2 border-r border-slate-200 text-slate-700">{c.customerType}</td>
                    <td className="p-2 border-r border-slate-200 font-mono text-slate-600">{c.defaultTax}</td>
                    <td className="p-2 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">{c.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT FLOATING ACTION TOOLBAR (Matching Target Image 1 Right Strip) */}
        <div className="w-12 bg-slate-200 border-l border-slate-300 flex flex-col items-center py-2 gap-2 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-emerald-700 shadow-xs relative group"
            title="New Customer (Ctrl+A)"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">A</span>
          </button>

          <button
            onClick={() => {
              if (!selectedCustId) alert('Please select a customer to edit.');
              else alert('✏️ Edit Customer modal opened');
            }}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-amber-700 shadow-xs relative group"
            title="Edit Customer (Ctrl+E)"
          >
            <Edit className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">E</span>
          </button>

          <button
            onClick={handleDeleteCustomer}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-rose-700 shadow-xs relative group"
            title="Delete Customer (Ctrl+D)"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">D</span>
          </button>

          <button
            onClick={() => alert('🔄 Grid refreshed!')}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-sky-700 shadow-xs relative group"
            title="Refresh (Ctrl+R)"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">R</span>
          </button>

          <button
            onClick={() => alert('🖨️ Customer Statement & Report Preview (Ctrl+P)')}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-indigo-700 shadow-xs relative group"
            title="Print Preview (Ctrl+P)"
          >
            <Printer className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">P</span>
          </button>
        </div>
      </div>

      {/* 6. BOTTOM STATUS PAGINATION FOOTER (Matching Target Image 1 Bottom) */}
      <div className="bg-slate-200 border-t border-slate-300 px-3 py-1 flex items-center justify-between text-[11px] text-slate-600 font-mono shrink-0">
        <div className="flex items-center gap-1.5">
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">|◄</button>
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">◄</button>
          <span className="font-bold text-slate-800 px-2">Customers {filteredCustomers.length === 0 ? '0 of 0' : `1 of ${filteredCustomers.length}`}</span>
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">►</button>
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">►|</button>
        </div>
        <div>Status: Ready | Server: Connected</div>
      </div>

      {/* 7. ADD CUSTOMER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-200 rounded-xl shadow-2xl border border-slate-400 w-full max-w-lg overflow-hidden font-sans">
            <div className="bg-slate-300 text-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-400">
              <h2 className="text-xs font-bold">New Customer Account</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-600 hover:text-slate-900 font-bold">✕</button>
            </div>
            <div className="p-4 space-y-3 bg-slate-100 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Customer Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Customer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Harlesh"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded font-bold bg-white"
                    autoFocus
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone / Mobile</label>
                  <input
                    type="text"
                    placeholder="100 / 55001122"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded font-mono bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Address</label>
                  <input
                    type="text"
                    placeholder="Vemulwada / West Bay"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-300">
                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-1.5 bg-slate-300 hover:bg-slate-400/80 text-slate-800 font-bold border border-slate-400 rounded">
                  Cancel
                </button>
                <button onClick={handleAddCustomer} className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Customer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
