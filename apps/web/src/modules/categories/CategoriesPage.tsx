import React, { useState, useEffect } from 'react';
import { Card, Button } from '@qatar-erp/ui';
import { Plus, Tag, Edit, Trash2, X } from 'lucide-react';

const CATEGORY_STORAGE_KEY = 'qatar_erp_categories';

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', code: 'CAT-DAIRY', name: 'Dairy & Eggs', nameAr: 'الألبان والبيض' },
  { id: 'cat-2', code: 'CAT-BEV', name: 'Beverages', nameAr: 'المشروبات' },
  { id: 'cat-3', code: 'CAT-RICE', name: 'Rice & Grains', nameAr: 'الأرز والحبوب' },
];

const CATEGORY_ARABIC_MAP: Record<string, string> = {
  drink: 'مشروبات',
  drinks: 'مشروبات',
  beverage: 'المشروبات',
  beverages: 'المشروبات',
  dairy: 'الألبان',
  egg: 'البيض',
  eggs: 'البيض',
  rice: 'الأرز',
  grain: 'الحبوب',
  grains: 'الحبوب',
  bakery: 'المخبوزات',
  bread: 'الخبز',
  frozen: 'المجمدات',
  meat: 'اللحوم',
  poultry: 'الدواجن',
  seafood: 'الأغذية البحرية',
  fish: 'الأسماك',
  fruit: 'الفواكه',
  fruits: 'الفواكه',
  vegetable: 'الخضروات',
  vegetables: 'الخضروات',
  snack: 'الوجبات الخفيفة',
  snacks: 'الوجبات الخفيفة',
  sweet: 'الحلويات',
  sweets: 'الحلويات',
  candy: 'الحلوى',
  chocolate: 'الشوكولاتة',
  biscuit: 'البسكويت',
  biscuits: 'البسكويت',
  cookie: 'الكوكيز',
  cookies: 'الكوكيز',
  canned: 'المعلبات',
  beauty: 'العناية الشخصية',
  cosmetics: 'مستحضرات التجميل',
  household: 'المستلزمات المنزلية',
  cleaning: 'المنظفات',
  cleaner: 'منظفات',
  detergent: 'منظفات الغسيل',
  soap: 'الصابون',
  shampoo: 'الشامبو',
  paper: 'الورقيات',
  tissue: 'المناديل',
  water: 'المياه',
  juice: 'العصائر',
  tea: 'الشاي',
  coffee: 'القهوة',
  oil: 'الزيوت',
  spice: 'البهارات',
  spices: 'البهارات',
  sauce: 'الصلصات',
};

// Phonetic English to Arabic Transliteration Engine
const phoneticTransliterate = (englishWord: string): string => {
  let str = englishWord.toLowerCase();
  
  if (str === 'drink') return 'مشروب';
  if (str === 'drinks') return 'مشروبات';

  str = str
    .replace(/tion/g, 'شن')
    .replace(/kh/g, 'خ')
    .replace(/gh/g, 'غ')
    .replace(/sh/g, 'ش')
    .replace(/ch/g, 'تش')
    .replace(/th/g, 'ث')
    .replace(/ph/g, 'ف')
    .replace(/ee/g, 'ي')
    .replace(/oo/g, 'و')
    .replace(/ou/g, 'و')
    .replace(/au/g, 'و')
    .replace(/ck/g, 'ك')
    .replace(/qu/g, 'كو');

  const charMap: Record<string, string> = {
    a: 'ا',
    b: 'ب',
    c: 'ك',
    d: 'د',
    e: 'ي',
    f: 'ف',
    g: 'ج',
    h: 'ه',
    i: 'ي',
    j: 'ج',
    k: 'ك',
    l: 'ل',
    m: 'م',
    n: 'ن',
    o: 'و',
    p: 'ب',
    q: 'ق',
    r: 'ر',
    s: 'س',
    t: 'ت',
    u: 'و',
    v: 'ف',
    w: 'و',
    x: 'كس',
    y: 'ي',
    z: 'ز',
  };

  let arabicStr = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    arabicStr += charMap[char] || char;
  }

  return arabicStr;
};

const autoTranslateCategoryAr = (englishName: string): string => {
  if (!englishName) return '';
  const clean = englishName.toLowerCase().trim();
  if (CATEGORY_ARABIC_MAP[clean]) return CATEGORY_ARABIC_MAP[clean];

  const words = clean.split(/\s+/);
  const translated = words.map((w) => {
    const cleanWord = w.replace(/[^a-z]/g, '');
    if (CATEGORY_ARABIC_MAP[cleanWord]) {
      return CATEGORY_ARABIC_MAP[cleanWord];
    }
    return phoneticTransliterate(cleanWord);
  });
  return translated.join(' ');
};

export interface CategoryItem {
  id: string;
  code: string;
  name: string;
  nameAr: string;
}

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isManualArEdit, setIsManualArEdit] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
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
      return JSON.parse(stored);
    } catch {
      return INITIAL_CATEGORIES;
    }
  };

  const saveCategoriesToStorage = (items: CategoryItem[]) => {
    try {
      localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(items));
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
      name: '',
      nameAr: '',
    });
    setEditingCategory(null);
    setIsManualArEdit(false);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      code: cat.code,
      name: cat.name,
      nameAr: cat.nameAr,
    });
    setIsManualArEdit(true);
    setIsAddModalOpen(true);
  };

  const handleEnglishNameChange = (val: string) => {
    const updatedAr = !isManualArEdit ? autoTranslateCategoryAr(val) : formData.nameAr;
    setFormData({
      ...formData,
      name: val,
      nameAr: updatedAr,
    });
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

    let updated: CategoryItem[];
    if (editingCategory) {
      updated = categories.map((c) =>
        c.id === editingCategory.id ? { ...c, code: formData.code, name: formData.name, nameAr: formData.nameAr } : c
      );
    } else {
      const newCat: CategoryItem = {
        id: `cat-${Date.now()}`,
        code: formData.code,
        name: formData.name,
        nameAr: formData.nameAr,
      };
      updated = [newCat, ...categories];
    }

    setCategories(updated);
    saveCategoriesToStorage(updated);
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Product Categories</h1>
          <p className="text-sm text-slate-500">Hierarchy taxonomy for inventory grouping.</p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 font-bold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3">Category Code</th>
              <th className="p-3">English Name</th>
              <th className="p-3">Arabic Name</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3 font-mono text-xs font-bold text-slate-900 dark:text-white">{c.code}</td>
                <td className="p-3 font-medium text-slate-900 dark:text-white">{c.name}</td>
                <td className="p-3 font-arabic text-slate-600 dark:text-slate-300">{c.nameAr}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(c)}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400"
                      title="Edit Category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-950 rounded text-rose-600"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Add / Edit Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden font-sans">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-lg">
                <Tag className="w-5 h-5 text-emerald-600" />
                <span>{editingCategory ? 'Edit Category' : 'Add New Category'}</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category Name (English)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleEnglishNameChange(e.target.value)}
                  placeholder="e.g. Bakery & Snacks"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Category Name (Arabic)</label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Auto-translated into Arabic</span>
                </div>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => {
                    setIsManualArEdit(true);
                    setFormData({ ...formData, nameAr: e.target.value });
                  }}
                  placeholder="مثال: المخبوزات والحلويات"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-arabic"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingCategory ? 'Update Category' : 'Save Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
