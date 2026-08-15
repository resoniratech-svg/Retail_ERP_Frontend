import React, { useState, useEffect } from 'react';
import { Card, Button } from '@qatar-erp/ui';
import { Plus, ListFilter, Edit, Trash2, X, Search, Layers } from 'lucide-react';

const SUBCATEGORY_STORAGE_KEY = 'qatar_erp_subcategories';

export interface SubCategoryItem {
  id: string;
  code: string;
  department: string;
  subDepartment: string;
  category: string;
  name: string;
  nameAr?: string;
}

const INITIAL_SUBCATEGORIES: SubCategoryItem[] = [
  {
    id: 'subcat-1',
    code: 'SUBCAT-MILK',
    department: 'Fresh Food',
    subDepartment: 'Dairy Counter',
    category: 'Dairy & Eggs',
    name: 'Full Cream Milk',
    nameAr: 'حليب كامل الدسم',
  },
  {
    id: 'subcat-2',
    code: 'SUBCAT-WAT',
    department: 'Beverages',
    subDepartment: 'Soft Drinks & Water',
    category: 'Beverages',
    name: 'Mineral Water 500ml',
    nameAr: 'مياه معدنية 500 مل',
  },
  {
    id: 'subcat-3',
    code: 'SUBCAT-RICE',
    department: 'Grocery',
    subDepartment: 'Grains & Staples',
    category: 'Rice & Grains',
    name: 'Basmati Rice Premium',
    nameAr: 'أرز بسمتي فاخر',
  },
];

export const SubCategoriesPage: React.FC = () => {
  const [subCategories, setSubCategories] = useState<SubCategoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategoryItem | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    department: 'Fresh Food',
    subDepartment: 'Dairy Counter',
    category: 'Dairy & Eggs',
    name: '',
    nameAr: '',
  });

  const getStoredSubCategories = (): SubCategoryItem[] => {
    try {
      const stored = localStorage.getItem(SUBCATEGORY_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(SUBCATEGORY_STORAGE_KEY, JSON.stringify(INITIAL_SUBCATEGORIES));
        return INITIAL_SUBCATEGORIES;
      }
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as SubCategoryItem[];
      }
      return INITIAL_SUBCATEGORIES;
    } catch {
      return INITIAL_SUBCATEGORIES;
    }
  };

  const saveSubCategoriesToStorage = (items: SubCategoryItem[]) => {
    try {
      localStorage.setItem(SUBCATEGORY_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save subcategories to localStorage:', e);
    }
  };

  useEffect(() => {
    setSubCategories(getStoredSubCategories());
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      code: `SUBCAT-${Math.floor(100 + Math.random() * 900)}`,
      department: 'Fresh Food',
      subDepartment: 'Dairy Counter',
      category: 'Dairy & Eggs',
      name: '',
      nameAr: '',
    });
    setEditingSubCategory(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (subCat: SubCategoryItem) => {
    setEditingSubCategory(subCat);
    setFormData({
      code: subCat.code,
      department: subCat.department,
      subDepartment: subCat.subDepartment,
      category: subCat.category,
      name: subCat.name,
      nameAr: subCat.nameAr || '',
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteSubCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      const updated = subCategories.filter((c) => c.id !== id);
      setSubCategories(updated);
      saveSubCategoriesToStorage(updated);
    }
  };

  const handleSaveSubCategory = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter Sub Category Name.');
      return;
    }

    let updated: SubCategoryItem[];
    if (editingSubCategory) {
      updated = subCategories.map((c) =>
        c.id === editingSubCategory.id
          ? {
              ...c,
              code: formData.code,
              department: formData.department,
              subDepartment: formData.subDepartment,
              category: formData.category,
              name: formData.name,
              nameAr: formData.nameAr,
            }
          : c
      );
    } else {
      const newSubCat: SubCategoryItem = {
        id: `subcat-${Date.now()}`,
        code: formData.code,
        department: formData.department,
        subDepartment: formData.subDepartment,
        category: formData.category,
        name: formData.name,
        nameAr: formData.nameAr,
      };
      updated = [newSubCat, ...subCategories];
    }

    setSubCategories(updated);
    saveSubCategoriesToStorage(updated);
    setIsAddModalOpen(false);
  };

  const filteredSubCategories = subCategories.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q) ||
      c.subDepartment.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-4 font-sans text-xs">
      {/* 1. TOP TITLE BAR (Matching Image 2 Top) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <ListFilter className="w-5 h-5 text-emerald-400" />
          <h1 className="text-sm font-bold">SubCategories - DART POS</h1>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add SubCategory</span>
        </button>
      </div>

      {/* 2. SEARCH BAR (Matching Image 2 Search Bar) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Enter text to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-300"
          >
            Clear
          </button>
        </div>

        <span className="text-xs font-bold text-slate-700">
          Total SubCategories: <strong className="text-emerald-600">{filteredSubCategories.length}</strong>
        </span>
      </div>

      {/* 3. DART POS SUBCATEGORIES DATA TABLE (All 4 Columns from Image 2) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px] tracking-wider sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-4 w-1/4">Department</th>
                <th className="py-2.5 px-4 w-1/4">Sub Department</th>
                <th className="py-2.5 px-4 w-1/4">Category</th>
                <th className="py-2.5 px-4 w-1/4">Sub Category Name</th>
                <th className="py-2.5 px-4 text-center sticky right-0 bg-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredSubCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    <ListFilter className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-bold text-sm">No SubCategories Found</p>
                  </td>
                </tr>
              ) : (
                filteredSubCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{c.department}</td>
                    <td className="py-2.5 px-4 text-slate-700 font-semibold">{c.subDepartment}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{c.category}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      <span>{c.name}</span>
                      {c.nameAr && <span className="text-slate-400 font-arabic text-[11px] ml-2">({c.nameAr})</span>}
                    </td>
                    <td className="py-2.5 px-4 text-center sticky right-0 bg-white shadow-left">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="p-1 hover:bg-slate-100 text-blue-600 rounded"
                          title="Edit SubCategory"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubCategory(c.id)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded"
                          title="Delete SubCategory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. ADD / EDIT SUBCATEGORY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold">{editingSubCategory ? 'Edit SubCategory' : 'New SubCategory - DART POS'}</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubCategory} className="p-5 space-y-4 text-xs">
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
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-semibold bg-white"
                >
                  <option value="Dairy & Eggs">Dairy & Eggs</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Rice & Grains">Rice & Grains</option>
                  <option value="Dates & Dried Fruits">Dates & Dried Fruits</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Sub Category Name (English) *</label>
                <input
                  type="text"
                  placeholder="e.g. Full Cream Milk"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Sub Category Name (Arabic)</label>
                <input
                  type="text"
                  placeholder="مثال: حليب كامل الدسم"
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
                  {editingSubCategory ? 'Update SubCategory' : 'Save SubCategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategoriesPage;
