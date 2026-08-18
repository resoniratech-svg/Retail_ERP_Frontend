import React, { useState } from 'react';
import { Plus, Edit, XCircle, RotateCcw, Search, Scale } from 'lucide-react';

export interface UnitItem {
  id: string;
  code: string;
  name: string;
  baseUnit: string;
  allowDecimals: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

const INITIAL_UNITS: UnitItem[] = [
  { id: '1', code: 'Pcs', name: 'Pieces (Pcs)', baseUnit: 'Unit', allowDecimals: false, status: 'ACTIVE' },
  { id: '2', code: 'Kg', name: 'Kilograms (Kg)', baseUnit: 'Weight', allowDecimals: true, status: 'ACTIVE' },
  { id: '3', code: 'Box', name: 'Box Packaging', baseUnit: 'Box', allowDecimals: false, status: 'ACTIVE' },
  { id: '4', code: 'Pack', name: 'Pack Multi-Unit', baseUnit: 'Pack', allowDecimals: false, status: 'ACTIVE' },
  { id: '5', code: 'apple', name: 'Apple Fruit Master Unit', baseUnit: 'Unit', allowDecimals: false, status: 'ACTIVE' },
  { id: '6', code: 'Carton', name: 'Carton Master Bulk', baseUnit: 'Carton', allowDecimals: false, status: 'ACTIVE' },
];

export const UnitsPage: React.FC = () => {
  const [units, setUnits] = useState<UnitItem[]>(INITIAL_UNITS);
  const [selectedUnit, setSelectedUnit] = useState<UnitItem | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitItem | null>(null);
  const [formData, setFormData] = useState<Partial<UnitItem>>({
    code: '',
    name: '',
    baseUnit: 'Unit',
    allowDecimals: false,
    status: 'ACTIVE',
  });

  const handleOpenAddModal = () => {
    setEditingUnit(null);
    setFormData({
      code: '',
      name: '',
      baseUnit: 'Unit',
      allowDecimals: false,
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: UnitItem) => {
    setEditingUnit(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDeleteUnit = (id: string) => {
    if (!selectedUnit) {
      alert('Please select a unit of measure first to delete.');
      return;
    }
    if (confirm(`Are you sure you want to delete unit "${selectedUnit.name}"?`)) {
      setUnits((prev) => prev.filter((u) => u.id !== id));
      setSelectedUnit(null);
    }
  };

  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert('Please fill all required unit fields.');
      return;
    }

    if (editingUnit) {
      setUnits((prev) =>
        prev.map((u) => (u.id === editingUnit.id ? { ...u, ...(formData as UnitItem) } : u))
      );
    } else {
      const newUnit: UnitItem = {
        id: Date.now().toString(),
        code: formData.code || `UOM-${Date.now()}`,
        name: formData.name || 'New UOM Unit',
        baseUnit: formData.baseUnit || 'Unit',
        allowDecimals: formData.allowDecimals || false,
        status: formData.status || 'ACTIVE',
      };
      setUnits((prev) => [newUnit, ...prev]);
    }

    setIsModalOpen(false);
  };

  const filteredUnits = units.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      u.code.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
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
            <span>Add UOM Unit (Ctrl+A)</span>
          </button>
          <button
            onClick={() => setUnits(INITIAL_UNITS)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold rounded-lg text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Units List (Ctrl+R)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-amber-950/60 text-amber-300 border border-amber-800/60 px-3 py-1 rounded-lg font-bold">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>Units of Measure Master Setup - DART POS</span>
          </div>
        </div>
      </div>

      {/* 2. FILTER & SEARCH BAR */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search unit by code or description..."
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

        <span className="font-mono text-slate-500 font-bold">Total Units: {filteredUnits.length}</span>
      </div>

      {/* 3. MAIN CONTENT AREA & RIGHT VERTICAL SHORTCUT STRIP */}
      <div className="flex gap-2 min-h-[460px]">
        {/* DATA TABLE */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead className="bg-slate-800 text-slate-200 font-bold uppercase sticky top-0 border-b border-slate-700">
                <tr>
                  <th className="py-2 px-3 border-r border-slate-700">Unit Code</th>
                  <th className="py-2 px-3 border-r border-slate-700">Unit Name / Description</th>
                  <th className="py-2 px-3 border-r border-slate-700">Base Unit Type</th>
                  <th className="py-2 px-3 border-r border-slate-700 text-center">Allow Decimals</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 italic font-mono">
                      No units found matching search filters.
                    </td>
                  </tr>
                ) : (
                  filteredUnits.map((unit) => {
                    const isSelected = selectedUnit?.id === unit.id;
                    return (
                      <tr
                        key={unit.id}
                        onClick={() => setSelectedUnit(unit)}
                        onDoubleClick={() => handleOpenEditModal(unit)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-900 text-white font-bold'
                            : unit.status === 'INACTIVE'
                            ? 'bg-slate-50 text-slate-400'
                            : 'hover:bg-amber-50/50 text-slate-800'
                        }`}
                      >
                        <td className="py-2.5 px-3 border-r border-slate-200 font-mono font-bold">{unit.code}</td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-bold">{unit.name}</td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-semibold">{unit.baseUnit}</td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono">
                          {unit.allowDecimals ? (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                              YES (3 Decimals)
                            </span>
                          ) : (
                            <span className="text-slate-400">NO (Integer)</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              unit.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {unit.status}
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
            title="Add Unit (Ctrl + A)"
          >
            <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs leading-none">
              +
            </div>
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+A</span>
          </button>

          <button
            onClick={() => {
              if (!selectedUnit) {
                alert('Please select a unit of measure first to edit.');
                return;
              }
              handleOpenEditModal(selectedUnit);
            }}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Edit Selected Unit (Ctrl + E)"
          >
            <Edit className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+E</span>
          </button>

          <button
            onClick={() => {
              if (!selectedUnit) {
                alert('Please select a unit of measure first to delete.');
                return;
              }
              handleDeleteUnit(selectedUnit.id);
            }}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Delete Selected Unit (Ctrl + D)"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+D</span>
          </button>

          <button
            onClick={() => setUnits([...units])}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Refresh Unit List (Ctrl + R)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+R</span>
          </button>

          <button
            onClick={() => alert(`🖨️ Printing Units Master Schedule for ${filteredUnits.length} items.`)}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Print Unit Setup (Ctrl + P)"
          >
            <Search className="w-3.5 h-3.5 text-slate-700" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+P</span>
          </button>
        </div>
      </div>

      {/* ADD / EDIT UNIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-100 rounded-xl shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden text-xs font-sans">
            <div className="bg-slate-200 border-b border-slate-300 px-4 py-2 flex items-center justify-between text-slate-800 font-bold">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-600" />
                <span>{editingUnit ? 'Edit Unit of Measure' : 'New Unit of Measure'} - DART POS</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-900 font-bold px-2">✕</button>
            </div>

            <form onSubmit={handleSaveUnit} className="p-4 space-y-3 bg-slate-50">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Unit Code *</label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold bg-white"
                  placeholder="eg: Pcs, Kg, Box"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Unit Name / Description *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold bg-white"
                  placeholder="eg: Pieces (Pcs)"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Base Unit Category</label>
                <select
                  value={formData.baseUnit || 'Unit'}
                  onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-semibold"
                >
                  <option value="Unit">Unit (Individual Pieces)</option>
                  <option value="Weight">Weight (Kg, Grams)</option>
                  <option value="Box">Box (Inner Box)</option>
                  <option value="Pack">Pack (Multi-Pack)</option>
                  <option value="Carton">Carton (Outer Case)</option>
                </select>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.allowDecimals || false}
                    onChange={(e) => setFormData({ ...formData, allowDecimals: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Allow Fractional Decimals</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.status === 'ACTIVE'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'ACTIVE' : 'INACTIVE' })}
                    className="rounded text-emerald-600"
                  />
                  <span>Active Unit</span>
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
                  Save Unit (Ctrl+S)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitsPage;
