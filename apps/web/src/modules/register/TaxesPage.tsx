import React, { useState } from 'react';
import { Plus, Edit, XCircle, RotateCcw, Search, Percent, ShieldCheck } from 'lucide-react';

export interface TaxItem {
  id: string;
  code: string;
  name: string;
  rate: number;
  type: 'Sale Tax' | 'Purchase Tax' | 'Both';
  isDefault: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

const INITIAL_TAXES: TaxItem[] = [
  { id: '1', code: 'VAT-15', name: 'STANDARD RATE 15% VAT', rate: 15.0, type: 'Both', isDefault: true, status: 'ACTIVE' },
  { id: '2', code: 'VAT-0', name: 'STANDARD RATE 0% (Zero VAT)', rate: 0.0, type: 'Both', isDefault: false, status: 'ACTIVE' },
  { id: '3', code: 'EXCISE-50', name: 'EXCISE TAX 50% (Sugary Drinks)', rate: 50.0, type: 'Sale Tax', isDefault: false, status: 'ACTIVE' },
  { id: '4', code: 'VAT-EXEMPT', name: 'TAX EXEMPT (Medical & Financial)', rate: 0.0, type: 'Both', isDefault: false, status: 'ACTIVE' },
];

export const RegisterTaxesPage: React.FC = () => {
  const [taxes, setTaxes] = useState<TaxItem[]>(INITIAL_TAXES);
  const [selectedTax, setSelectedTax] = useState<TaxItem | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxItem | null>(null);
  const [formData, setFormData] = useState<Partial<TaxItem>>({
    code: '',
    name: '',
    rate: 15.0,
    type: 'Both',
    isDefault: false,
    status: 'ACTIVE',
  });

  const handleOpenAddModal = () => {
    setEditingTax(null);
    setFormData({
      code: `TAX-${Math.floor(100 + Math.random() * 899)}`,
      name: '',
      rate: 15.0,
      type: 'Both',
      isDefault: false,
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: TaxItem) => {
    setEditingTax(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDeleteTax = (id: string) => {
    if (!selectedTax) {
      alert('Please select a tax rule first to delete.');
      return;
    }
    if (confirm(`Are you sure you want to delete tax rule "${selectedTax.name}"?`)) {
      setTaxes((prev) => prev.filter((t) => t.id !== id));
      setSelectedTax(null);
    }
  };

  const handleSaveTax = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert('Please fill all required tax fields.');
      return;
    }

    if (editingTax) {
      setTaxes((prev) =>
        prev.map((t) =>
          t.id === editingTax.id
            ? { ...t, ...(formData as TaxItem) }
            : formData.isDefault
            ? { ...t, isDefault: false }
            : t
        )
      );
    } else {
      const newTax: TaxItem = {
        id: Date.now().toString(),
        code: formData.code || `TAX-${Date.now()}`,
        name: formData.name || 'New Tax Rate',
        rate: formData.rate ?? 15.0,
        type: formData.type || 'Both',
        isDefault: formData.isDefault || false,
        status: formData.status || 'ACTIVE',
      };
      setTaxes((prev) => [newTax, ...prev]);
    }

    setIsModalOpen(false);
  };

  const filteredTaxes = taxes.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      t.code.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-3 font-sans text-xs select-none">
      {/* 1. TOP SUB-RIBBON ACTION TOOLBAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-white shadow-sm flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tax Rule (Ctrl+A)</span>
          </button>
          <button
            onClick={() => setTaxes(INITIAL_TAXES)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold rounded-lg text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Master List (Ctrl+R)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-rose-950/60 text-rose-300 border border-rose-800/60 px-3 py-1 rounded-lg font-bold">
            <Percent className="w-4 h-4 text-rose-400" />
            <span>Taxes Master Setup - DART POS</span>
          </div>
        </div>
      </div>

      {/* 2. FILTER & SEARCH BAR */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search tax by code or name..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg bg-slate-50 font-semibold text-xs"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>

        <span className="font-mono text-slate-500 font-bold">Total Taxes: {filteredTaxes.length}</span>
      </div>

      {/* 3. MAIN CONTENT AREA & RIGHT VERTICAL SHORTCUT STRIP */}
      <div className="flex gap-2 min-h-[460px]">
        {/* DATA TABLE */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead className="bg-slate-800 text-slate-200 font-bold uppercase sticky top-0 border-b border-slate-700">
                <tr>
                  <th className="py-2 px-3 border-r border-slate-700">Tax Code</th>
                  <th className="py-2 px-3 border-r border-slate-700">Tax Description</th>
                  <th className="py-2 px-3 border-r border-slate-700 text-right">Tax Rate (%)</th>
                  <th className="py-2 px-3 border-r border-slate-700">Tax Application</th>
                  <th className="py-2 px-3 border-r border-slate-700 text-center">Default Tax</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {filteredTaxes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 italic font-mono">
                      No tax rules found matching search filters.
                    </td>
                  </tr>
                ) : (
                  filteredTaxes.map((tax) => {
                    const isSelected = selectedTax?.id === tax.id;
                    return (
                      <tr
                        key={tax.id}
                        onClick={() => setSelectedTax(tax)}
                        onDoubleClick={() => handleOpenEditModal(tax)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-900 text-white font-bold'
                            : tax.status === 'INACTIVE'
                            ? 'bg-slate-50 text-slate-400'
                            : 'hover:bg-amber-50/50 text-slate-800'
                        }`}
                      >
                        <td className="py-2.5 px-3 border-r border-slate-200 font-mono font-bold">{tax.code}</td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-bold">{tax.name}</td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono font-black text-rose-600">
                          {tax.rate.toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-semibold">{tax.type}</td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center">
                          {tax.isDefault ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                              YES (Default)
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tax.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {tax.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT VERTICAL ACTION SHORTCUT STRIP */}
        <div className="w-11 bg-slate-300 border-l border-slate-400 p-1 flex flex-col items-center gap-2 shrink-0 select-none shadow-inner justify-start pt-2 rounded-xl">
          <button
            onClick={handleOpenAddModal}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Add Tax (Ctrl + A)"
          >
            <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs leading-none">
              +
            </div>
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+A</span>
          </button>

          <button
            onClick={() => {
              if (!selectedTax) {
                alert('Please select a tax rule first to edit.');
                return;
              }
              handleOpenEditModal(selectedTax);
            }}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Edit Selected Tax (Ctrl + E)"
          >
            <Edit className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+E</span>
          </button>

          <button
            onClick={() => {
              if (!selectedTax) {
                alert('Please select a tax rule first to delete.');
                return;
              }
              handleDeleteTax(selectedTax.id);
            }}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Delete Selected Tax (Ctrl + D)"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+D</span>
          </button>

          <button
            onClick={() => setTaxes([...taxes])}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Refresh Tax List (Ctrl + R)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+R</span>
          </button>

          <button
            onClick={() => alert(`🖨️ Printing Tax Master Schedule for ${filteredTaxes.length} items.`)}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Print Tax Setup (Ctrl + P)"
          >
            <Search className="w-3.5 h-3.5 text-slate-700" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+P</span>
          </button>
        </div>
      </div>

      {/* ADD / EDIT TAX MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-100 rounded-xl shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden text-xs font-sans">
            <div className="bg-slate-200 border-b border-slate-300 px-4 py-2 flex items-center justify-between text-slate-800 font-bold">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-rose-600" />
                <span>{editingTax ? 'Edit Tax Rule' : 'New Tax Rule'} - DART POS</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-900 font-bold px-2">✕</button>
            </div>

            <form onSubmit={handleSaveTax} className="p-4 space-y-3 bg-slate-50">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tax Code *</label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tax Description / Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold bg-white"
                  placeholder="eg: STANDARD RATE 15% VAT"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tax Rate (%) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rate ?? 15.0}
                    onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold text-rose-600 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tax Type</label>
                  <select
                    value={formData.type || 'Both'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-semibold"
                  >
                    <option value="Both">Both (Sale & Purchase)</option>
                    <option value="Sale Tax">Sale Tax Only</option>
                    <option value="Purchase Tax">Purchase Tax Only</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.isDefault || false}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Default System Tax</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.status === 'ACTIVE'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'ACTIVE' : 'INACTIVE' })}
                    className="rounded text-emerald-600"
                  />
                  <span>Active Rule</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-xs"
                >
                  Save Tax (Ctrl+S)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterTaxesPage;
