import React, { useState, useEffect } from 'react';
import { formatQAR } from '@qatar-erp/utils';
import {
  Boxes,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Download,
  Printer,
  RotateCcw,
  XCircle,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

const STORAGE_KEY = 'qatar_erp_production_materials';

export interface ProductionMaterialItem {
  id: string;
  code: string;
  barcode: string;
  itemName: string;
  itemNameAr?: string;
  uomUnit: string;
  productionCost: number;
  labourCost: number;
  notes?: string;
}

const INITIAL_MATERIALS: ProductionMaterialItem[] = [
  {
    id: 'mat-001',
    code: 'MAT-001',
    barcode: '62910381001',
    itemName: 'Wheat Flour Premium 25kg',
    itemNameAr: 'دقيق قمح ممتاز 25 كجم',
    uomUnit: 'Bag',
    productionCost: 45.00,
    labourCost: 5.00,
    notes: 'Bakery raw material',
  },
  {
    id: 'mat-002',
    code: 'MAT-002',
    barcode: '62910381002',
    itemName: 'Refined White Sugar 50kg',
    itemNameAr: 'سكر أبيض مكرر 50 كجم',
    uomUnit: 'Bag',
    productionCost: 110.00,
    labourCost: 8.00,
    notes: 'Confectionery material',
  },
  {
    id: 'mat-003',
    code: 'MAT-003',
    barcode: '62910381003',
    itemName: 'Unsalted Butter Block 10kg',
    itemNameAr: 'زبدة غير مملحة 10 كجم',
    uomUnit: 'Box',
    productionCost: 185.00,
    labourCost: 12.00,
    notes: 'Chilled dairy ingredient',
  },
  {
    id: 'mat-004',
    code: 'MAT-004',
    barcode: '62910381004',
    itemName: 'Full Cream Milk Powder 25kg',
    itemNameAr: 'حليب مجفف كامل الدسم 25 كجم',
    uomUnit: 'Bag',
    productionCost: 240.00,
    labourCost: 15.00,
    notes: 'High grade dairy powder',
  },
];

const loadStoredMaterials = (): ProductionMaterialItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_MATERIALS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MATERIALS;
  } catch {
    return INITIAL_MATERIALS;
  }
};

const saveStoredMaterials = (list: ProductionMaterialItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save production materials to localStorage:', err);
  }
};

export const ProductionMaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<ProductionMaterialItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<ProductionMaterialItem | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<ProductionMaterialItem | null>(null);

  const [formData, setFormData] = useState<Partial<ProductionMaterialItem>>({
    code: '',
    barcode: '',
    itemName: '',
    itemNameAr: '',
    uomUnit: 'Bag',
    productionCost: 0,
    labourCost: 0,
    notes: '',
  });

  useEffect(() => {
    setMaterials(loadStoredMaterials());
  }, []);

  const filteredMaterials = materials.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.code.toLowerCase().includes(q) ||
      m.barcode.toLowerCase().includes(q) ||
      m.itemName.toLowerCase().includes(q) ||
      (m.itemNameAr && m.itemNameAr.includes(q)) ||
      m.uomUnit.toLowerCase().includes(q)
    );
  });

  const handleOpenAddModal = () => {
    setEditingMaterial(null);
    setFormData({
      code: `MAT-${Math.floor(100 + Math.random() * 900)}`,
      barcode: `6291${Math.floor(1000000 + Math.random() * 9000000)}`,
      itemName: '',
      itemNameAr: '',
      uomUnit: 'Bag',
      productionCost: 0.00,
      labourCost: 0.00,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ProductionMaterialItem) => {
    setEditingMaterial(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDeleteMaterial = (id: string) => {
    if (window.confirm('Are you sure you want to delete this Production Material record?')) {
      const updated = materials.filter((m) => m.id !== id);
      setMaterials(updated);
      saveStoredMaterials(updated);
      if (selectedMaterial?.id === id) {
        setSelectedMaterial(null);
      }
    }
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemName?.trim()) {
      alert('Please enter Item Name');
      return;
    }

    const payload: ProductionMaterialItem = {
      id: editingMaterial ? editingMaterial.id : `mat-${Date.now()}`,
      code: formData.code || `MAT-${Date.now()}`,
      barcode: formData.barcode || '0000000000',
      itemName: formData.itemName.trim(),
      itemNameAr: formData.itemNameAr?.trim() || '',
      uomUnit: formData.uomUnit || 'PCS',
      productionCost: Number(formData.productionCost) || 0,
      labourCost: Number(formData.labourCost) || 0,
      notes: formData.notes?.trim() || '',
    };

    let updated: ProductionMaterialItem[];
    if (editingMaterial) {
      updated = materials.map((m) => (m.id === editingMaterial.id ? payload : m));
    } else {
      updated = [payload, ...materials];
    }

    setMaterials(updated);
    saveStoredMaterials(updated);
    setIsModalOpen(false);
    setSelectedMaterial(payload);
  };

  return (
    <div className="flex flex-col gap-3 font-sans text-xs select-none">
      {/* 1. TOP DART POS SUB-RIBBON ACTION TOOLBAR (Matching Screenshot 100%) */}
      <div className="bg-slate-200 border border-slate-300 rounded-xl p-1.5 text-slate-900 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => alert('📥 Importing raw materials & BOM directory from Excel file.')}
            className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-white text-slate-800 font-bold text-xs rounded border border-slate-400 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* 2. CENTERED INNER TITLE BAR (Matching Screenshot Banner) */}
      <div className="bg-slate-300 py-1.5 border border-slate-400 text-center font-bold text-slate-800 text-xs shadow-inner rounded-t-lg">
        Production Materials
      </div>

      {/* 3. SEARCH FILTER BAR MATCHING SCREENSHOT */}
      <div className="bg-slate-100 p-2 rounded-b-lg border-x border-b border-slate-300 shadow-xs flex items-center gap-2 -mt-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Enter text to search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1 text-xs font-semibold border border-slate-400 rounded bg-white focus:outline-none focus:border-cyan-600"
          />
        </div>

        <button
          onClick={() => alert(`Filter applied for "${searchQuery}"`)}
          className="px-4 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded font-bold text-slate-800 text-xs shadow-2xs"
        >
          Find
        </button>

        <button
          onClick={() => setSearchQuery('')}
          className="px-4 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded font-bold text-slate-800 text-xs shadow-2xs"
        >
          Clear
        </button>
      </div>

      {/* 4. DART POS PRODUCTION MATERIALS DATA TABLE WITH RIGHT VERTICAL SHORTCUT STRIP (Matching Screenshot 100%) */}
      <div className="bg-slate-200 border border-slate-300 rounded-xl overflow-hidden shadow-sm flex">
        {/* Left: Master Materials Table Container */}
        <div className="flex-1 overflow-x-auto max-h-[60vh] bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold text-[10px] tracking-wider sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="py-2 px-3 border-r border-slate-200 w-28">Code</th>
                <th className="py-2 px-3 border-r border-slate-200 w-36 font-mono">Barcode</th>
                <th className="py-2 px-3 border-r border-slate-200">ItemName</th>
                <th className="py-2 px-3 border-r border-slate-200 text-center w-24">UOM Unit</th>
                <th className="py-2 px-3 border-r border-slate-200 text-right w-36">Production Cost</th>
                <th className="py-2 px-3 text-right w-36">Labour Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Boxes className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-bold text-sm">No Production Materials Found</p>
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((m) => {
                  const isSelected = selectedMaterial?.id === m.id;
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedMaterial(m)}
                      onDoubleClick={() => handleOpenEditModal(m)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-navy-900 bg-blue-900 text-white font-bold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2 px-3 font-mono font-bold border-r border-slate-200">{m.code}</td>
                      <td className="py-2 px-3 font-mono border-r border-slate-200">{m.barcode}</td>
                      <td className="py-2 px-3 font-bold border-r border-slate-200">
                        <span>{m.itemName}</span>
                        {m.itemNameAr && <span className="text-slate-400 font-arabic text-[11px] ml-2">({m.itemNameAr})</span>}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-semibold">{m.uomUnit}</td>
                      <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-bold text-emerald-700">
                        {formatQAR(m.productionCost)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-indigo-700">
                        {formatQAR(m.labourCost)}
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
          {/* Button 1: Add Material (Green Plus Circle - Ctrl+A) */}
          <button
            onClick={handleOpenAddModal}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs group transition-all"
            title="Add Production Material (Ctrl + A)"
          >
            <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs leading-none shadow-2xs">
              +
            </div>
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+A</span>
          </button>

          {/* Button 2: Edit Material (Pencil Icon - Ctrl+E) */}
          <button
            onClick={() => {
              if (!selectedMaterial) {
                alert('Please select a material record first to edit.');
                return;
              }
              handleOpenEditModal(selectedMaterial);
            }}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Edit Selected Material (Ctrl + E)"
          >
            <Edit className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+E</span>
          </button>

          {/* Button 3: Delete Material (Red Cross Icon - Ctrl+D) */}
          <button
            onClick={() => {
              if (!selectedMaterial) {
                alert('Please select a material record first to delete.');
                return;
              }
              handleDeleteMaterial(selectedMaterial.id);
            }}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Delete Selected Material (Ctrl + D)"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+D</span>
          </button>

          {/* Button 4: Refresh List (Blue Circular Arrow Icon - Ctrl+R) */}
          <button
            onClick={() => setMaterials(loadStoredMaterials())}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Refresh List (Ctrl + R)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+R</span>
          </button>

          {/* Button 5: Print / Search (Magnifying Glass Icon - Ctrl+P) */}
          <button
            onClick={() => alert('📄 Printing Production Materials BOM report...')}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Print / Search Production Materials (Ctrl + P)"
          >
            <Search className="w-3.5 h-3.5 text-slate-700" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+P</span>
          </button>
        </div>
      </div>

      {/* 5. BOTTOM STATUS NAVIGATION BAR (Matching Target Image 1 Bottom) */}
      <div className="bg-slate-200 border border-slate-300 rounded-lg p-1.5 flex items-center justify-between text-[11px] font-mono text-slate-700 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (materials.length > 0) setSelectedMaterial(materials[0]);
            }}
            className="px-1.5 py-0.5 bg-slate-100 hover:bg-white border border-slate-400 rounded text-slate-800 font-bold"
          >
            |◄
          </button>
          <button
            onClick={() => {
              const idx = materials.findIndex((m) => m.id === selectedMaterial?.id);
              if (idx > 0) setSelectedMaterial(materials[idx - 1]);
            }}
            className="px-1.5 py-0.5 bg-slate-100 hover:bg-white border border-slate-400 rounded text-slate-800 font-bold"
          >
            ◄
          </button>
          <span>
            Production Materials {filteredMaterials.length > 0 ? (selectedMaterial ? materials.findIndex((m) => m.id === selectedMaterial.id) + 1 : 1) : 0} of {filteredMaterials.length}
          </span>
          <button
            onClick={() => {
              const idx = materials.findIndex((m) => m.id === selectedMaterial?.id);
              if (idx < materials.length - 1) setSelectedMaterial(materials[idx + 1]);
            }}
            className="px-1.5 py-0.5 bg-slate-100 hover:bg-white border border-slate-400 rounded text-slate-800 font-bold"
          >
            ►
          </button>
          <button
            onClick={() => {
              if (materials.length > 0) setSelectedMaterial(materials[materials.length - 1]);
            }}
            className="px-1.5 py-0.5 bg-slate-100 hover:bg-white border border-slate-400 rounded text-slate-800 font-bold"
          >
            ►|
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={handleOpenAddModal} className="w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center justify-center font-bold text-xs" title="Add Item">+</button>
          <button onClick={() => { if (selectedMaterial) handleDeleteMaterial(selectedMaterial.id); }} className="w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded flex items-center justify-center font-bold text-xs" title="Delete Item">-</button>
          <button onClick={() => alert('Record saved')} className="w-5 h-5 bg-sky-600 hover:bg-sky-700 text-white rounded flex items-center justify-center font-bold text-xs" title="Save">✓</button>
          <button onClick={() => setSelectedMaterial(null)} className="w-5 h-5 bg-slate-600 hover:bg-slate-700 text-white rounded flex items-center justify-center font-bold text-xs" title="Cancel">✕</button>
        </div>
      </div>

      {/* 6. ADD / EDIT PRODUCTION MATERIAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold">
                  {editingMaterial ? `Edit Material: ${editingMaterial.code}` : 'New Production Material - DART POS'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="p-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Material Code *</label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Barcode *</label>
                  <input
                    type="text"
                    value={formData.barcode || ''}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Name (English) *</label>
                <input
                  type="text"
                  placeholder="e.g. Wheat Flour Premium 25kg"
                  value={formData.itemName || ''}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Name (Arabic)</label>
                <input
                  type="text"
                  placeholder="e.g. دقيق قمح ممتاز"
                  value={formData.itemNameAr || ''}
                  onChange={(e) => setFormData({ ...formData, itemNameAr: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-arabic text-right"
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">UOM Unit *</label>
                  <select
                    value={formData.uomUnit || 'Bag'}
                    onChange={(e) => setFormData({ ...formData, uomUnit: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold"
                  >
                    <option value="Bag">Bag</option>
                    <option value="Box">Box</option>
                    <option value="KG">KG</option>
                    <option value="Litre">Litre</option>
                    <option value="PCS">PCS</option>
                    <option value="Drum">Drum</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Production Cost (QAR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.productionCost || 0}
                    onChange={(e) => setFormData({ ...formData, productionCost: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Labour Cost (QAR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.labourCost || 0}
                    onChange={(e) => setFormData({ ...formData, labourCost: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold text-indigo-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Recipe Usage</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ingredients usage, supplier info, recipe Notes..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingMaterial ? 'Update Material' : 'Save Material'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
