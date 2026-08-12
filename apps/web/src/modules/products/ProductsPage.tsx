import React, { useState, useEffect } from 'react';
import { productsService } from '@qatar-erp/api';
import { formatQAR } from '@qatar-erp/utils';
import { Product } from '@qatar-erp/types';
import { Plus, Search, Download, Edit, Trash2, X, Package } from 'lucide-react';
import { Button, Badge, Card } from '@qatar-erp/ui';

const ARABIC_DICTIONARY: Record<string, string> = {
  milk: 'حليب',
  fresh: 'طازج',
  full: 'كامل',
  cream: 'الدسم',
  low: 'قليل',
  fat: 'الدسم',
  water: 'ماء',
  natural: 'طبيعي',
  rice: 'أرز',
  basmati: 'بسمتي',
  juice: 'عصير',
  orange: 'برتقال',
  apple: 'تفاح',
  banana: 'موز',
  bread: 'خبز',
  cheese: 'جبن',
  butter: 'زبدة',
  sugar: 'سكر',
  oil: 'زيت',
  tea: 'شاي',
  coffee: 'قهوة',
  chicken: 'دجاج',
  meat: 'لحم',
  fish: 'سمك',
  dates: 'تمر',
  khudri: 'خضري',
  premium: 'فاخر',
  original: 'أصلي',
  can: 'علبة',
  bottle: 'زجاجة',
  pack: 'عبوة',
  box: 'كرتون',
  almarai: 'المراعي',
  rayyan: 'الريان',
  khabari: 'خباري',
  pepsi: 'بيبسي',
  coca: 'كوكاكولا',
  cola: 'كولا',
  red: 'ريد',
  bull: 'بول',
  egg: 'بيض',
  eggs: 'بيض',
  yogurt: 'زبادي',
  laban: 'لبن',
};

const autoTranslateToArabic = (englishText: string): string => {
  if (!englishText) return '';
  const words = englishText.trim().split(/\s+/);
  const translatedWords = words.map((w) => {
    const cleanWord = w.toLowerCase().replace(/[^a-z]/g, '');
    if (ARABIC_DICTIONARY[cleanWord]) {
      return ARABIC_DICTIONARY[cleanWord];
    }
    // Convert units like 1L, 500ml, 5kg
    if (/^\d+(l|ml|g|kg)$/i.test(w)) {
      return w.toLowerCase().replace('l', ' لتر').replace('ml', ' مل').replace('kg', ' كجم').replace('g', ' جم');
    }
    return w;
  });
  return translatedWords.join(' ');
};

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isManualArabicEdit, setIsManualArabicEdit] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name: '',
    nameAr: '',
    categoryName: 'Dairy & Eggs',
    retailPrice: '',
    stockQuantity: '',
    unit: 'Pcs',
  });

  const loadProducts = () => {
    setProducts(productsService.getProductsSync());
  };

  useEffect(() => {
    loadProducts();
    const handleUpdate = () => loadProducts();
    window.addEventListener('qatar_products_updated', handleUpdate);
    return () => window.removeEventListener('qatar_products_updated', handleUpdate);
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: `62510${Math.floor(10000000 + Math.random() * 90000000)}`,
      name: '',
      nameAr: '',
      categoryName: 'Dairy & Eggs',
      retailPrice: '12.50',
      stockQuantity: '100',
      unit: 'Pcs',
    });
    setEditingProduct(null);
    setIsManualArabicEdit(false);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      sku: prod.sku,
      barcode: prod.barcode,
      name: prod.name,
      nameAr: prod.nameAr || '',
      categoryName: prod.categoryName || 'Dairy & Eggs',
      retailPrice: prod.retailPrice.toString(),
      stockQuantity: prod.stockQuantity.toString(),
      unit: prod.unit || 'Pcs',
    });
    setIsManualArabicEdit(true);
    setIsAddModalOpen(true);
  };

  const handleEnglishNameChange = (val: string) => {
    const updatedAr = !isManualArabicEdit ? autoTranslateToArabic(val) : formData.nameAr;
    setFormData({
      ...formData,
      name: val,
      nameAr: updatedAr,
    });
  };

  const handleArabicNameChange = (val: string) => {
    setIsManualArabicEdit(true);
    setFormData({
      ...formData,
      nameAr: val,
    });
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await productsService.deleteProduct(id);
      loadProducts();
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      await productsService.updateProduct(editingProduct.id, {
        sku: formData.sku,
        barcode: formData.barcode,
        name: formData.name,
        nameAr: formData.nameAr,
        categoryName: formData.categoryName,
        retailPrice: parseFloat(formData.retailPrice) || 0,
        stockQuantity: parseInt(formData.stockQuantity, 10) || 0,
        unit: formData.unit,
      });
    } else {
      await productsService.createProduct({
        sku: formData.sku,
        barcode: formData.barcode,
        name: formData.name,
        nameAr: formData.nameAr,
        categoryName: formData.categoryName,
        retailPrice: parseFloat(formData.retailPrice) || 0,
        costPrice: (parseFloat(formData.retailPrice) || 0) * 0.7,
        stockQuantity: parseInt(formData.stockQuantity, 10) || 0,
        minStockLevel: 10,
        unit: formData.unit,
      });
    }

    loadProducts();
    setIsAddModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm);

    const matchesCategory = selectedCategory ? p.categoryName?.toLowerCase().includes(selectedCategory) : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Products</h1>
          <p className="text-sm text-slate-500">Manage master product catalog, barcodes, and QAR pricing.</p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Product</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="flex flex-wrap items-center justify-between gap-4 p-3 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search product SKU, barcode, name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            <option value="">All Categories</option>
            <option value="dairy">Dairy & Eggs</option>
            <option value="beverages">Beverages</option>
            <option value="rice">Rice & Grains</option>
            <option value="dates">Dates & Dried Fruits</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-1.5 text-xs py-1.5 border-slate-300">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </Card>

      {/* Products Data Table */}
      <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">SKU / Barcode</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right">Price (QAR)</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{product.sku}</p>
                    <p className="text-slate-400">{product.barcode}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{product.name}</p>
                    {product.nameAr && <p className="text-xs text-slate-500 font-arabic">{product.nameAr}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                    {product.categoryName || 'General'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    <span
                      className={
                        product.stockQuantity < product.minStockLevel
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }
                    >
                      {product.stockQuantity} {product.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {formatQAR(product.retailPrice)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={product.isActive ? 'success' : 'neutral'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-950 rounded text-rose-600 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden font-sans">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-lg">
                <Package className="w-5 h-5 text-emerald-600" />
                <span>{editingProduct ? 'Edit Product' : 'Add New Product'}</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Barcode</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Product Name (English)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleEnglishNameChange(e.target.value)}
                  placeholder="e.g. Almarai Fresh Milk 1L"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Product Name (Arabic)</label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Auto-translated from English</span>
                </div>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => handleArabicNameChange(e.target.value)}
                  placeholder="مثال: حليب المراعي طازج 1 لتر"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-arabic"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category</label>
                  <select
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Rice & Grains">Rice & Grains</option>
                    <option value="Dates & Dried Fruits">Dates & Dried Fruits</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Box">Box</option>
                    <option value="Kg">Kg</option>
                    <option value="Pack">Pack</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Retail Price (QAR)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={formData.retailPrice}
                    onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    required
                  />
                </div>
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
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
