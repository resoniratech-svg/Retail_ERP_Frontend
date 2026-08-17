import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, RefreshCw, Printer, Check } from 'lucide-react';

interface BusinessTypeRecord {
  id: string;
  typeId: string;
  description: string;
}

export const CustomerBusinessTypesPage: React.FC = () => {
  const [types, setTypes] = useState<BusinessTypeRecord[]>([
    { id: '1', typeId: 'BIZ-RETAIL', description: 'Individual Walk-in Retail Shoppers' },
    { id: '2', typeId: 'BIZ-WHOLESALE', description: 'Bulk Supermarket & Distributor Accounts' },
    { id: '3', typeId: 'BIZ-HORECA', description: 'Hotel, Restaurant, & Catering Corporate Clients' },
    { id: '4', typeId: 'BIZ-GOVT', description: 'State & Government Ministry Procurement' },
  ]);

  const [searchText, setSearchText] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>('1');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    typeId: '',
    description: '',
  });

  const filteredTypes = types.filter((t) => {
    const query = searchText.toLowerCase().trim();
    if (!query) return true;
    return (
      t.typeId.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query)
    );
  });

  const handleClear = () => {
    setSearchText('');
  };

  const handleAddType = () => {
    if (!formData.typeId.trim() || !formData.description.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    const newType: BusinessTypeRecord = {
      id: Date.now().toString(),
      typeId: formData.typeId,
      description: formData.description,
    };
    setTypes([newType, ...types]);
    setIsAddModalOpen(false);
    setFormData({ typeId: '', description: '' });
  };

  const handleDeleteType = () => {
    if (!selectedTypeId) {
      alert('Please select a customer business type to delete.');
      return;
    }
    setTypes(types.filter((t) => t.id !== selectedTypeId));
    setSelectedTypeId(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-100 font-sans text-xs select-none">
      {/* 1. TOP TITLE HEADER */}
      <div className="bg-slate-200 border-b border-slate-300 px-3 py-1.5 flex items-center justify-between shadow-xs">
        <h1 className="text-sm font-bold text-slate-800 tracking-tight">Customer Business Type - DART POS</h1>
        <span className="text-[11px] text-slate-500 font-mono">Total Business Types: {filteredTypes.length}</span>
      </div>

      {/* 2. INNER CENTERED TITLE BAR (Matching Target Image 4) */}
      <div className="bg-slate-300 py-1 border-b border-slate-400 text-center font-bold text-slate-800 text-xs shadow-inner">
        Customer Business Type
      </div>

      {/* 3. SEARCH BAR ROW (Matching Target Image 4) */}
      <div className="bg-slate-200 p-2 border-b border-slate-300 flex items-center gap-2">
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
          onClick={() => alert(`🔍 Searching Customer Business Types for "${searchText}"`)}
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

      {/* 4. MAIN CONTENT GRID & RIGHT TOOLBAR */}
      <div className="flex-1 flex overflow-hidden">
        {/* DATA GRID TABLE */}
        <div className="flex-1 overflow-auto bg-white border-r border-slate-300">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-200 font-bold text-slate-700 uppercase text-[11px] sticky top-0 border-b border-slate-300 shadow-xs">
              <tr>
                <th className="p-2 border-r border-slate-300 w-80 font-mono">Customer Business Type ID</th>
                <th className="p-2 border-r border-slate-300">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredTypes.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-12 text-center text-slate-400 italic">
                    No Customer Business Type records found. Click ➕ (Ctrl+A) to define a business tier.
                  </td>
                </tr>
              ) : (
                filteredTypes.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTypeId(t.id)}
                    className={`cursor-pointer hover:bg-sky-50 ${selectedTypeId === t.id ? 'bg-sky-100 font-bold text-slate-900' : 'text-slate-800'}`}
                  >
                    <td className="p-2 border-r border-slate-200 font-mono font-bold text-slate-900">{t.typeId}</td>
                    <td className="p-2 border-r border-slate-200 text-slate-700">{t.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT FLOATING ACTION TOOLBAR (Matching Target Image 4 Right Strip) */}
        <div className="w-12 bg-slate-200 border-l border-slate-300 flex flex-col items-center py-2 gap-2 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-emerald-700 shadow-xs relative group"
            title="New Business Type (Ctrl+A)"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">A</span>
          </button>

          <button
            onClick={() => {
              if (!selectedTypeId) alert('Please select a business type to edit.');
              else alert('✏️ Edit Customer Business Type modal opened');
            }}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-amber-700 shadow-xs relative group"
            title="Edit Business Type (Ctrl+E)"
          >
            <Edit className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">E</span>
          </button>

          <button
            onClick={handleDeleteType}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-rose-700 shadow-xs relative group"
            title="Delete Business Type (Ctrl+D)"
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
            onClick={() => alert('🖨️ Customer Business Types Report Preview (Ctrl+P)')}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-indigo-700 shadow-xs relative group"
            title="Print Preview (Ctrl+P)"
          >
            <Printer className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">P</span>
          </button>
        </div>
      </div>

      {/* 5. BOTTOM STATUS PAGINATION FOOTER (Matching Target Image 4 Bottom) */}
      <div className="bg-slate-200 border-t border-slate-300 px-3 py-1 flex items-center justify-between text-[11px] text-slate-600 font-mono">
        <div className="flex items-center gap-1.5">
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">|◄</button>
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">◄</button>
          <span className="font-bold text-slate-800 px-2">Customer Business Type {filteredTypes.length === 0 ? '0 of 0' : `1 of ${filteredTypes.length}`}</span>
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">►</button>
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">►|</button>
        </div>
        <div>Status: Ready | Server: Connected</div>
      </div>

      {/* 6. ADD TYPE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-200 rounded-xl shadow-2xl border border-slate-400 w-full max-w-md overflow-hidden font-sans">
            <div className="bg-slate-300 text-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-400">
              <h2 className="text-xs font-bold">New Customer Business Type</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-600 hover:text-slate-900 font-bold">✕</button>
            </div>
            <div className="p-4 space-y-3 bg-slate-100 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Customer Business Type ID</label>
                <input
                  type="text"
                  placeholder="e.g. BIZ-RETAIL"
                  value={formData.typeId}
                  onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded font-mono font-bold bg-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Individual Walk-in Retail Shoppers"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-300">
                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-1.5 bg-slate-300 hover:bg-slate-400/80 text-slate-800 font-bold border border-slate-400 rounded">
                  Cancel
                </button>
                <button onClick={handleAddType} className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Business Type</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBusinessTypesPage;
