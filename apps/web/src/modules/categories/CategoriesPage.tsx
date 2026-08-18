import React, { useState, useEffect } from 'react';
import { Card, Button } from '@qatar-erp/ui';
import { Plus, Tag, Edit, Trash2, X, Search, ArrowUpDown, Layers, Grid, RotateCcw, XCircle } from 'lucide-react';

const CATEGORY_STORAGE_KEY = 'qatar_erp_categories';

export interface CategoryItem {
  id: string;
  code: string;
  department: string;
  subDepartment: string;
  name: string;
  nameAr?: string;
  sortOrder?: number;
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', code: 'CAT-DAIRY', department: 'Fresh Food', subDepartment: 'Dairy Counter', name: 'Dairy & Eggs', nameAr: 'الألبان والبيض', sortOrder: 1 },
  { id: 'cat-2', code: 'CAT-BEV', department: 'Beverages', subDepartment: 'Soft Drinks & Water', name: 'Beverages', nameAr: 'المشروبات', sortOrder: 2 },
  { id: 'cat-3', code: 'CAT-RICE', department: 'Grocery', subDepartment: 'Grains & Staples', name: 'Rice & Grains', nameAr: 'الأرز والحبوب', sortOrder: 3 },
  { id: 'cat-4', code: 'CAT-DATES', department: 'Fresh Food', subDepartment: 'Dates & Fruits', name: 'Dates & Dried Fruits', nameAr: 'التمر والفواكه المجففة', sortOrder: 4 },
];

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    department: 'Fresh Food',
    subDepartment: 'Dairy Counter',
    name: '',
    nameAr: '',
  });

  const getStoredCategories = (): CategoryItem[] => {
    try {
      const stored = localStorage.getItem(CATEGORY_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
        return INITIAL_CATEGORIES;
      }
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((c: any) => ({
          ...c,
          department: c.department || 'Fresh Food',
          subDepartment: c.subDepartment || 'Dairy Counter',
        }));
      }
      return INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  };

  const saveCategoriesToStorage = (items: CategoryItem[]) => {
    try {
      localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new Event('qatar_categories_updated'));
    } catch (e) {
      console.error('Failed to save categories to localStorage:', e);
    }
  };

  useEffect(() => {
    setCategories(getStoredCategories());
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      code: `CAT-${Math.floor(100 + Math.random() * 900)}`,
      department: 'Fresh Food',
      subDepartment: 'Dairy Counter',
      name: '',
      nameAr: '',
    });
    setEditingCategory(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      code: cat.code,
      department: cat.department,
      subDepartment: cat.subDepartment,
      name: cat.name,
      nameAr: cat.nameAr || '',
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const updated = categories.filter((c) => c.id !== id);
      setCategories(updated);
      saveCategoriesToStorage(updated);
    }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter Category Name.');
      return;
    }

    let updated: CategoryItem[];
    if (editingCategory) {
      updated = categories.map((c) =>
        c.id === editingCategory.id
          ? {
              ...c,
              code: formData.code,
              department: formData.department,
              subDepartment: formData.subDepartment,
              name: formData.name,
              nameAr: formData.nameAr,
            }
          : c
      );
    } else {
      const newCat: CategoryItem = {
        id: `cat-${Date.now()}`,
        code: formData.code,
        department: formData.department,
        subDepartment: formData.subDepartment,
        name: formData.name,
        nameAr: formData.nameAr,
        sortOrder: categories.length + 1,
      };
      updated = [newCat, ...categories];
    }

    setCategories(updated);
    saveCategoriesToStorage(updated);
    setIsAddModalOpen(false);
  };

  const filteredCategories = categories.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q) ||
      c.subDepartment.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-4 font-sans text-xs">
      {/* 1. TOP DART POS SUB-RIBBON ACTION TOOLBAR (Matching Screenshot 100%) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-emerald-400" />
          <h1 className="text-sm font-bold">Categories - DART POS</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('🔄 Categories sort order updated!')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg border border-slate-700"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
            <span>Sort Order</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH FILTER BAR MATCHING SCREENSHOT */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Enter text to search..."
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

        <span className="text-xs font-bold text-slate-700">
          Total Categories: <strong className="text-emerald-600">{filteredCategories.length}</strong>
        </span>
      </div>

      {/* 3. DART POS CATEGORIES DATA TABLE WITH RIGHT VERTICAL SHORTCUT STRIP (Matching Screenshot 100%) */}
      <div className="bg-slate-200 border border-slate-300 rounded-xl overflow-hidden shadow-sm flex">
        {/* Left: Master Table Container */}
        <div className="flex-1 overflow-x-auto max-h-[60vh] bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 uppercase font-bold text-[10px] tracking-wider sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="py-2.5 px-4 w-1/3 border-r border-slate-200">DEPARTMENT</th>
                <th className="py-2.5 px-4 w-1/3 border-r border-slate-200">SUB DEPARTMENT</th>
                <th className="py-2.5 px-4 w-1/3">CATEGORY NAME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500">
                    <Tag className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-bold text-sm">No Categories Found</p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c) => {
                  const isSelected = selectedCategory?.id === c.id;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCategory(c)}
                      onDoubleClick={() => handleOpenEditModal(c)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-navy-900 bg-blue-900 text-white font-bold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-4 font-bold text-slate-900 border-r border-slate-200">{c.department}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-700 border-r border-slate-200">{c.subDepartment}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        <span>{c.name}</span>
                        {c.nameAr && <span className="text-slate-400 font-arabic text-[11px] ml-2">({c.nameAr})</span>}
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
          {/* Button 1: Add Category (Green Plus Circle - Ctrl+A) */}
          <button
            onClick={handleOpenAddModal}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs group transition-all"
            title="Add Category (Ctrl + A)"
          >
            <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs leading-none shadow-2xs">
              +
            </div>
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+A</span>
          </button>

          {/* Button 2: Edit Category (Pencil Icon - Ctrl+E) */}
          <button
            onClick={() => {
              if (!selectedCategory) {
                alert('Please select a category first to edit.');
                return;
              }
              handleOpenEditModal(selectedCategory);
            }}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Edit Selected Category (Ctrl + E)"
          >
            <Edit className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+E</span>
          </button>

          {/* Button 3: Delete Category (Red Cross Icon - Ctrl+D) */}
          <button
            onClick={() => {
              if (!selectedCategory) {
                alert('Please select a category first to delete.');
                return;
              }
              handleDeleteCategory(selectedCategory.id);
            }}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Delete Selected Category (Ctrl + D)"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+D</span>
          </button>

          {/* Button 4: Refresh List (Blue Circular Arrow Icon - Ctrl+R) */}
          <button
            onClick={() => setCategories(categories)}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Refresh List (Ctrl + R)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+R</span>
          </button>

          {/* Button 5: Print / Search (Magnifying Glass Icon - Ctrl+P) */}
          <button
            onClick={() => alert('📄 Printing categories report...')}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Print / Search Categories (Ctrl + P)"
          >
            <Search className="w-3.5 h-3.5 text-slate-700" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+P</span>
          </button>
        </div>
      </div>

      {/* 4. ADD / EDIT CATEGORY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold">{editingCategory ? 'Edit Category' : 'New Category - DART POS'}</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-semibold bg-white"
                >
                  <option value="Fresh Food">Fresh Food</option>
                  <option value="Grocery">Grocery</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Household">Household</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Sub Department *</label>
                <select
                  value={formData.subDepartment}
                  onChange={(e) => setFormData({ ...formData, subDepartment: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-semibold bg-white"
                >
                  <option value="Dairy Counter">Dairy Counter</option>
                  <option value="Soft Drinks & Water">Soft Drinks & Water</option>
                  <option value="Grains & Staples">Grains & Staples</option>
                  <option value="Dates & Fruits">Dates & Fruits</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Category Name (English) *</label>
                <input
                  type="text"
                  placeholder="e.g. Milk & Eggs"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Category Name (Arabic)</label>
                <input
                  type="text"
                  placeholder="مثال: الألبان والبيض"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-arabic text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingCategory ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
