import React, { useState } from 'react';
import { Search, Save, Play, Plus, RefreshCw, FileText, DollarSign, CheckSquare, QrCode } from 'lucide-react';

export interface CustomerItem {
  code: string;
  name: string;
  address: string;
  city: string;
  trn: string;
  route: string;
  phone: string;
  contact: string;
  mobile: string;
  email: string;
  salesAgent: string;
  deliveryAgent: string;
  customerType: string;
  location: string;
  customerGroup: string;
  priceGroup: string;
  creditLimit: string;
  defaultTerms: string;
  status: string;
}

export interface CustomerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: CustomerItem) => void;
}

export const CustomerSearchModal: React.FC<CustomerSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCustomer,
}) => {
  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'name' | 'phone' | 'mobile' | 'code' | 'address'>('all');
  const [showAllLocations, setShowAllLocations] = useState(true);

  // Sample customers matching screenshot
  const [customers] = useState<CustomerItem[]>([
    {
      code: '00001',
      name: 'hariesh',
      address: 'vemulawada road',
      city: 'kmr',
      trn: '300908811',
      route: 'North Route',
      phone: '100',
      contact: 'Hariesh Kumar',
      mobile: '9848012345',
      email: 'tfdgtffg@gmail.com',
      salesAgent: 'Sai',
      deliveryAgent: 'Agent 1',
      customerType: 'No Commission',
      location: 'Saudi Arabia Branch',
      customerGroup: 'Credit Customers',
      priceGroup: 'General',
      creditLimit: '10,000.00',
      defaultTerms: '30 Days',
      status: 'Active',
    },
    {
      code: '00002',
      name: 'Tariq Al-Mansouri',
      address: 'Al Rayyan Street',
      city: 'Doha',
      trn: '300000010',
      route: 'Doha Main',
      phone: '44556677',
      contact: 'Tariq',
      mobile: '55667788',
      email: 'tariq@retail.qa',
      salesAgent: 'Ahmed',
      deliveryAgent: 'Agent 2',
      customerType: 'VIP Corporate',
      location: 'Doha Main Store',
      customerGroup: 'Credit Customers',
      priceGroup: 'Retail Wholesale',
      creditLimit: '25,000.00',
      defaultTerms: '15 Days',
      status: 'Active',
    },
  ]);

  const [selectedCustomer, setSelectedCustomerState] = useState<CustomerItem | null>(customers[0]);

  if (!isOpen) return null;

  const handleConfirmSelect = () => {
    if (selectedCustomer) {
      onSelectCustomer(selectedCustomer);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 select-none font-sans text-xs">
      <div className="bg-slate-200 rounded-xl shadow-2xl border border-slate-400 w-full max-w-6xl overflow-hidden flex flex-col h-[580px]">
        {/* 1. TITLE BAR (Matching Customer Search Screenshot 100%) */}
        <div className="bg-slate-300 text-slate-900 px-3 py-1.5 flex items-center justify-between border-b border-slate-400 shrink-0">
          <h2 className="text-xs font-bold tracking-wide">Customer Search</h2>
          <div className="flex items-center gap-1">
            <button className="text-slate-600 hover:text-slate-900 font-bold px-1.5 py-0.5 rounded hover:bg-slate-400/50">_</button>
            <button className="text-slate-600 hover:text-slate-900 font-bold px-1.5 py-0.5 rounded hover:bg-slate-400/50">□</button>
            <button onClick={onClose} className="text-slate-600 hover:text-slate-900 font-bold px-1.5 py-0.5 rounded hover:bg-slate-400/50">✕</button>
          </div>
        </div>

        {/* 2. TOP QUICK TOOLBAR STRIP */}
        <div className="bg-slate-100 border-b border-slate-300 px-2 py-1 flex items-center gap-2 overflow-x-auto text-[11px] font-semibold">
          <button onClick={() => alert('Receive Advance Customer Payment')} className="flex items-center gap-1 px-2 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded">
            <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
            <span>Receive Advance</span>
          </button>

          <button onClick={() => alert('Receive Credit Invoice Payment')} className="flex items-center gap-1 px-2 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded">
            <FileText className="w-3.5 h-3.5 text-blue-700" />
            <span>Receive Payment</span>
          </button>

          <button onClick={() => alert('Show Statement Of Account')} className="flex items-center gap-1 px-2 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded">
            <FileText className="w-3.5 h-3.5 text-amber-700" />
            <span>Show Statement</span>
          </button>

          <button onClick={() => alert('Add New Customer Master')} className="flex items-center gap-1 px-2 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded">
            <Plus className="w-3.5 h-3.5 text-purple-700" />
            <span>Add Customer</span>
          </button>

          <button onClick={() => alert('View Customer Purchase History')} className="flex items-center gap-1 px-2 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-700" />
            <span>History</span>
          </button>

          <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-700 ml-2">
            <input
              type="checkbox"
              checked={showAllLocations}
              onChange={(e) => setShowAllLocations(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span>Show All Location Customers</span>
          </label>

          <button onClick={() => alert('Buy XTimes Promo Status Check')} className="flex items-center gap-1 px-2 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded ml-2">
            <CheckSquare className="w-3.5 h-3.5 text-rose-700" />
            <span>Check Buy XTimes Promo Status</span>
          </button>
        </div>

        {/* 3. FILTER SEARCH BAR ROW (Matching Screenshot Layout) */}
        <div className="bg-slate-200 p-2 border-b border-slate-300 space-y-1">
          <div className="font-bold text-slate-700 text-[11px]">Filter</div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-64">
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Press F1 To Focus"
                className="w-full px-2.5 py-1 border border-slate-400 rounded bg-white text-xs font-medium focus:border-cyan-600 focus:outline-none"
                autoFocus
              />
            </div>

            <button className="px-3 py-1 bg-slate-100 hover:bg-white border border-slate-400 rounded font-bold text-slate-800 flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>Search</span>
            </button>

            <button className="px-3 py-1 bg-slate-100 hover:bg-white border border-slate-400 rounded font-bold text-slate-800 flex items-center gap-1 font-mono">
              <span>║║▌║ Scan (F2)</span>
            </button>

            {/* Radio Filter Selector */}
            <div className="flex items-center gap-3 font-semibold text-slate-700 pl-2">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="custFilter" checked={filterType === 'name'} onChange={() => setFilterType('name')} />
                <span>Name</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="custFilter" checked={filterType === 'phone'} onChange={() => setFilterType('phone')} />
                <span>Phone</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="custFilter" checked={filterType === 'mobile'} onChange={() => setFilterType('mobile')} />
                <span>Mobile</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="custFilter" checked={filterType === 'code'} onChange={() => setFilterType('code')} />
                <span>Code</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="custFilter" checked={filterType === 'address'} onChange={() => setFilterType('address')} />
                <span>Address</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="custFilter" checked={filterType === 'all'} onChange={() => setFilterType('all')} />
                <span>All</span>
              </label>
            </div>

            {/* Far Right Action Buttons */}
            <div className="ml-auto flex items-center gap-2">
              <button className="px-3 py-1 bg-slate-100 hover:bg-white border border-slate-400 rounded font-bold text-slate-800 flex items-center gap-1">
                <Save className="w-3.5 h-3.5 text-slate-700" />
              </button>

              <button
                onClick={handleConfirmSelect}
                className="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 rounded font-bold flex items-center gap-1 shadow-2xs"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>OK</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. CUSTOMER DATA GRID TABLE (Matching 19 Columns in Screenshot) */}
        <div className="flex-1 overflow-auto bg-white p-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-200 font-bold text-slate-700 uppercase text-[10px] sticky top-0 border-b border-slate-300">
              <tr>
                <th className="p-2 border-r border-slate-300 min-w-[70px]">Cust Code</th>
                <th className="p-2 border-r border-slate-300 min-w-[120px]">Customer Name</th>
                <th className="p-2 border-r border-slate-300 min-w-[110px]">Address</th>
                <th className="p-2 border-r border-slate-300 min-w-[80px]">City</th>
                <th className="p-2 border-r border-slate-300 min-w-[90px]">TRN</th>
                <th className="p-2 border-r border-slate-300 min-w-[90px]">Route</th>
                <th className="p-2 border-r border-slate-300 min-w-[90px]">Phone</th>
                <th className="p-2 border-r border-slate-300 min-w-[90px]">Contact</th>
                <th className="p-2 border-r border-slate-300 min-w-[90px]">Mobile</th>
                <th className="p-2 border-r border-slate-300 min-w-[120px]">Email</th>
                <th className="p-2 border-r border-slate-300 min-w-[90px]">Sales Agent</th>
                <th className="p-2 border-r border-slate-300 min-w-[90px]">Delivery Agent</th>
                <th className="p-2 border-r border-slate-300 min-w-[100px]">Customer Type</th>
                <th className="p-2 border-r border-slate-300 min-w-[110px]">Location</th>
                <th className="p-2 border-r border-slate-300 min-w-[110px]">Customer Group</th>
                <th className="p-2 border-r border-slate-300 min-w-[100px]">Price Group</th>
                <th className="p-2 border-r border-slate-300 min-w-[90px]">Credit Limit</th>
                <th className="p-2 border-r border-slate-300 min-w-[90px]">Default Terms</th>
                <th className="p-2 min-w-[70px] text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {customers.map((c) => {
                const isSelected = selectedCustomer?.code === c.code;
                return (
                  <tr
                    key={c.code}
                    onClick={() => setSelectedCustomerState(c)}
                    onDoubleClick={() => {
                      setSelectedCustomerState(c);
                      onSelectCustomer(c);
                      onClose();
                    }}
                    className={`cursor-pointer hover:bg-sky-50 ${
                      isSelected ? 'bg-navy-900 bg-blue-900 text-white font-bold' : ''
                    }`}
                  >
                    <td className="p-2 border-r border-slate-200 font-mono font-bold">{c.code}</td>
                    <td className="p-2 border-r border-slate-200 font-bold">{c.name}</td>
                    <td className="p-2 border-r border-slate-200">{c.address}</td>
                    <td className="p-2 border-r border-slate-200">{c.city}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{c.trn}</td>
                    <td className="p-2 border-r border-slate-200">{c.route}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{c.phone}</td>
                    <td className="p-2 border-r border-slate-200">{c.contact}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{c.mobile}</td>
                    <td className="p-2 border-r border-slate-200">{c.email}</td>
                    <td className="p-2 border-r border-slate-200">{c.salesAgent}</td>
                    <td className="p-2 border-r border-slate-200">{c.deliveryAgent}</td>
                    <td className="p-2 border-r border-slate-200">{c.customerType}</td>
                    <td className="p-2 border-r border-slate-200">{c.location}</td>
                    <td className="p-2 border-r border-slate-200">{c.customerGroup}</td>
                    <td className="p-2 border-r border-slate-200">{c.priceGroup}</td>
                    <td className="p-2 border-r border-slate-200 font-mono font-bold text-right">{c.creditLimit}</td>
                    <td className="p-2 border-r border-slate-200">{c.defaultTerms}</td>
                    <td className="p-2 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">{c.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerSearchModal;
