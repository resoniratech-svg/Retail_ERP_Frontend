import React, { useState, useEffect } from 'react';
import { productsService } from '@qatar-erp/api';
import { formatQAR } from '@qatar-erp/utils';
import { Product, ProductPacking } from '@qatar-erp/types';
import {
  Plus,
  Search,
  Download,
  Edit,
  Trash2,
  X,
  Package,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  Boxes,
  Barcode,
  Copy,
  History,
  Layers,
  Tag,
  ShieldAlert,
  Percent,
  DollarSign,
  Scale,
  Building,
  Truck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  QrCode,
  FileText,
} from 'lucide-react';
import { Button, Badge, Card } from '@qatar-erp/ui';

const CATEGORY_STORAGE_KEY = 'qatar_erp_categories';

const DEFAULT_CATEGORIES = [
  { name: 'Dairy & Eggs', nameAr: 'الألبان والبيض' },
  { name: 'Beverages', nameAr: 'المشروبات' },
  { name: 'Rice & Grains', nameAr: 'الأرز والحبوب' },
  { name: 'Dates & Dried Fruits', nameAr: 'التمر والفواكه المجففة' },
];

const loadAvailableCategories = (): Array<{ name: string; nameAr?: string }> => {
  try {
    const stored = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((c: any) => ({ name: c.name, nameAr: c.nameAr }));
      }
    }
  } catch (e) {
    console.error('Failed to parse categories from localStorage:', e);
  }
  return DEFAULT_CATEGORIES;
};

const ARABIC_DICTIONARY: Record<string, string> = {
  milk: 'حليب',
  fresh: 'طازج',
  full: 'كامل',
  cream: 'الدسم',
  water: 'ماء',
  natural: 'طبيعي',
  rice: 'أرز',
  basmati: 'بسمتي',
  juice: 'عصير',
  apple: 'تفاح',
  dates: 'تمر',
  khudri: 'خضري',
  premium: 'فاخر',
  original: 'أصلي',
  can: 'علبة',
  bottle: 'زجاجة',
  box: 'كرتون',
  almarai: 'المراعي',
  rayyan: 'الريان',
  khabari: 'خباري',
  coca: 'كوكاكولا',
  cola: 'كولا',
};

const autoTranslateToArabic = (englishText: string): string => {
  if (!englishText) return '';
  const words = englishText.trim().split(/\s+/);
  const translatedWords = words.map((w) => {
    const cleanWord = w.toLowerCase().replace(/[^a-z]/g, '');
    return ARABIC_DICTIONARY[cleanWord] || w;
  });
  return translatedWords.join(' ');
};

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Array<{ name: string; nameAr?: string }>>([]);

  // Search & Filter State
  const [barcodeScanInput, setBarcodeScanInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMatchType, setSearchMatchType] = useState<'Begin With' | 'Contains'>('Contains');
  const [selectedVendorFilter, setSelectedVendorFilter] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'Costing' | 'Packings' | 'Classifications'>('Costing');

  // Form State matching DART POS Screenshots 2 & 3
  const [formData, setFormData] = useState<Partial<Product>>({
    sku: '',
    barcode: '',
    name: '',
    nameAr: '',
    localDescription: '',
    shortDescription: '',
    description: '',
    additionalDescription: '',
    categoryName: 'Dairy & Eggs',
    subDepartment: 'Fresh Counter',
    brandName: 'Almarai',
    defaultVendor: 'Almarai Food Qatar W.L.L',

    costPrice: 5.50,
    costInclTax: 5.50,
    landedCost: 5.60,
    costingMethod: 'Weighted Average',
    avgCost: 5.50,
    lastSupplierCost: 5.50,
    vatRate: 0.00,
    saleTaxRate: 0.00,
    purchaseTaxRate: 0.00,

    retailPrice: 7.50,
    discount: 0.00,
    markupPercent: 36.36,
    grossProfitPercent: 26.67,
    priceInclTax: 7.50,
    msp: 7.00,
    wasPrice: 8.50,
    openPrice: false,

    wsPrice: 6.80,
    wsMarkupPercent: 23.64,
    wsGrossProfitPercent: 19.12,
    wsPriceInclTax: 6.80,
    wsMsp: 6.50,

    expDays: 14,
    weighingProductType: 'None',
    nonInventory: false,
    autoProductionWhileSale: false,
    procurementType: 'Normal Purchase',
    divisionFactor: 1.000,
    maxDiscountRate: 10.00,
    unit: 'Pcs',
    stockQuantity: 100,
    minStockLevel: 10,
    isActive: true,

    packings: [],
  });

  // Packings state for multi-unit modal
  const [packingsList, setPackingsList] = useState<ProductPacking[]>([]);

  // Bottom Print Panel State
  const [quickPrintWasPrice, setQuickPrintWasPrice] = useState('67.00');
  const [stockLookupLocation, setStockLookupLocation] = useState('Doha Main Branch');

  const loadProducts = () => {
    setProducts(productsService.getProductsSync());
  };

  useEffect(() => {
    loadProducts();
    setCategoriesList(loadAvailableCategories());
    const handleUpdate = () => loadProducts();
    window.addEventListener('qatar_products_updated', handleUpdate);
    return () => window.removeEventListener('qatar_products_updated', handleUpdate);
  }, []);

  // Form Margin Calculations
  const updatePricingCalculations = (field: string, value: number) => {
    let cost = field === 'costPrice' ? value : formData.costPrice || 0;
    let price = field === 'retailPrice' ? value : formData.retailPrice || 0;
    let markup = formData.markupPercent || 0;
    let gp = formData.grossProfitPercent || 0;

    if (field === 'markupPercent') {
      markup = value;
      price = cost + (cost * markup) / 100;
      gp = price > 0 ? ((price - cost) / price) * 100 : 0;
    } else if (field === 'grossProfitPercent') {
      gp = value;
      if (gp < 100) {
        price = cost / (1 - gp / 100);
        markup = cost > 0 ? ((price - cost) / cost) * 100 : 0;
      }
    } else {
      markup = cost > 0 ? ((price - cost) / cost) * 100 : 0;
      gp = price > 0 ? ((price - cost) / price) * 100 : 0;
    }

    const vat = formData.vatRate || 0;
    const costWithTax = cost + cost * vat;
    const priceWithTax = price + price * vat;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
      costPrice: cost,
      retailPrice: price,
      costInclTax: costWithTax,
      priceInclTax: priceWithTax,
      markupPercent: Math.round(markup * 100) / 100,
      grossProfitPercent: Math.round(gp * 100) / 100,
    }));
  };

  const handleOpenAddModal = () => {
    const available = loadAvailableCategories();
    setCategoriesList(available);

    setEditingProduct(null);
    setFormData({
      sku: `123${Math.floor(10 + Math.random() * 89)}`,
      barcode: `346578${Math.floor(100 + Math.random() * 899)}`,
      name: '',
      nameAr: '',
      localDescription: '',
      shortDescription: '',
      description: '',
      additionalDescription: '',
      categoryName: available[0]?.name || 'Dairy & Eggs',
      subDepartment: 'GSDUYGYG',
      brandName: 'Almarai',
      defaultVendor: 'Almarai Food Qatar W.L.L',

      costPrice: 10.00,
      costInclTax: 10.00,
      landedCost: 10.50,
      costingMethod: 'Weighted Average',
      avgCost: 10.00,
      lastSupplierCost: 10.00,
      vatRate: 0.00,
      saleTaxRate: 0.00,
      purchaseTaxRate: 0.00,

      retailPrice: 13.04,
      discount: 0.00,
      markupPercent: 30.43,
      grossProfitPercent: 23.33,
      priceInclTax: 15.00,
      msp: 12.00,
      wasPrice: 18.00,
      openPrice: false,

      wsPrice: 13.04,
      wsMarkupPercent: 30.43,
      wsGrossProfitPercent: 23.33,
      wsPriceInclTax: 15.00,
      wsMsp: 12.00,

      expDays: 0,
      weighingProductType: 'None',
      nonInventory: false,
      autoProductionWhileSale: false,
      procurementType: 'Normal Purchase',
      divisionFactor: 1.000,
      maxDiscountRate: 0.00,
      unit: 'Pcs',
      stockQuantity: 100,
      minStockLevel: 10,
      isActive: true,
    });
    setPackingsList([]);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({ ...prod });
    setPackingsList(prod.packings || []);
    setIsAddModalOpen(true);
  };

  const handleDuplicateProduct = async (prod: Product) => {
    const duplicatedData = {
      ...prod,
      id: undefined,
      sku: `${prod.sku}-COPY`,
      barcode: `62510${Math.floor(10000000 + Math.random() * 90000000)}`,
      name: `${prod.name} (Copy)`,
    };
    await productsService.createProduct(duplicatedData);
    loadProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await productsService.deleteProduct(id);
      loadProducts();
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const productPayload: Partial<Product> = {
      ...formData,
      packings: packingsList,
    };

    if (editingProduct) {
      await productsService.updateProduct(editingProduct.id, productPayload);
    } else {
      await productsService.createProduct(productPayload);
    }

    loadProducts();
    setIsAddModalOpen(false);
  };

  const handleAddPackingRow = () => {
    setPackingsList((prev) => [
      ...prev,
      {
        id: `pack-${Date.now()}`,
        barcode: `${formData.barcode || '346578'}-CRTN`,
        unit: 'Carton (12 Pcs)',
        packQty: 12,
        cost: (formData.costPrice || 10) * 11,
        price: (formData.retailPrice || 13.04) * 12,
        priceInclTax: (formData.priceInclTax || 15) * 12,
        productName: `${formData.name || 'Product'} Box 1X12`,
        wasPrice: (formData.wasPrice || 18) * 12,
        wsPrice: (formData.wsPrice || 13.04) * 12,
        isStockUnit: false,
      },
    ]);
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const cleanSearch = searchTerm.toLowerCase().trim();
    let matchesSearch = true;

    if (cleanSearch) {
      if (searchMatchType === 'Begin With') {
        matchesSearch =
          p.name.toLowerCase().startsWith(cleanSearch) ||
          p.sku.toLowerCase().startsWith(cleanSearch) ||
          p.barcode.startsWith(cleanSearch);
      } else {
        matchesSearch =
          p.name.toLowerCase().includes(cleanSearch) ||
          p.sku.toLowerCase().includes(cleanSearch) ||
          p.barcode.includes(cleanSearch);
      }
    }

    const matchesBarcodeScan = barcodeScanInput
      ? p.barcode.includes(barcodeScanInput) || p.sku.includes(barcodeScanInput)
      : true;

    const matchesVendor = selectedVendorFilter
      ? p.defaultVendor?.toLowerCase().includes(selectedVendorFilter.toLowerCase())
      : true;

    return matchesSearch && matchesBarcodeScan && matchesVendor;
  });

  return (
    <div className="flex flex-col gap-4 font-sans text-xs">
      {/* 1. TOP DART POS SUB-RIBBON ACTION TOOLBAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-white shadow-sm flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white shadow"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product</span>
          </button>

          <button
            onClick={() => alert('📊 Stock Ledger Report generated for product master catalog.')}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-semibold"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
            <span>Stock Report</span>
          </button>

          <button
            onClick={() => alert('⚖️ Scale Barcode File generated for DIGI/Mettler Toledo weighing scales.')}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-semibold"
          >
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Scale File</span>
          </button>

          <button
            onClick={() => alert('📈 Price Adjustment History Log opened.')}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-semibold"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Price Adj Logs</span>
          </button>

          <button
            onClick={() => alert('💵 Cost Adjustment History Log opened.')}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-semibold"
          >
            <DollarSign className="w-3.5 h-3.5 text-yellow-400" />
            <span>Cost Adj Logs</span>
          </button>

          <button
            onClick={() => alert('📦 Stock Movement Audit Log opened.')}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-semibold"
          >
            <Boxes className="w-3.5 h-3.5 text-purple-400" />
            <span>Stock Movement</span>
          </button>

          <button
            onClick={() => alert('📥 Bulk Excel/CSV Products Import Wizard opened.')}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Import Products</span>
          </button>

          <button
            onClick={() => alert('🖨️ Shelf Barcode Printing Wizard initiated.')}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-semibold"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            <span>Barcode Printing</span>
          </button>

          <button
            onClick={() => alert('🏷️ Price Change by Gross Profit % tool triggered.')}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-semibold"
          >
            <Percent className="w-3.5 h-3.5 text-rose-400" />
            <span>Price Chng By GP</span>
          </button>

          <button
            onClick={() => alert('🚚 Primary Supplier & Vendor Directory opened.')}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-semibold"
          >
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            <span>Vendors</span>
          </button>
        </div>

        <span className="text-[10px] text-slate-400 font-mono shrink-0">Catalog Items: {products.length}</span>
      </div>

      {/* 2. DART POS TASKS & FILTER BAR (Matching Screenshot 1) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 flex-wrap w-full">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 text-xs">Barcode:</span>
            <div className="relative w-40">
              <input
                type="text"
                placeholder="Scan Barcode Here"
                value={barcodeScanInput}
                onChange={(e) => setBarcodeScanInput(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <Barcode className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <span className="font-bold text-slate-700 text-xs">Search:</span>
            <input
              type="text"
              placeholder="Enter Product Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
            />
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="searchMatchType"
                  checked={searchMatchType === 'Begin With'}
                  onChange={() => setSearchMatchType('Begin With')}
                />
                <span>Begin With</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="searchMatchType"
                  checked={searchMatchType === 'Contains'}
                  onChange={() => setSearchMatchType('Contains')}
                />
                <span>Contains</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 text-xs">Vendor:</span>
            <select
              value={selectedVendorFilter}
              onChange={(e) => setSelectedVendorFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 font-semibold focus:outline-none"
            >
              <option value="">[Select a Vendor]</option>
              <option value="Almarai">Almarai Food Qatar W.L.L</option>
              <option value="Doha Wholesale">Doha Wholesale Trading W.L.L</option>
              <option value="Rayyan">Rayyan Water Company W.L.L</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. DART POS MASTER PRODUCTS DATA TABLE (Matching Screenshot 1 Columns) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[55vh]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px] tracking-wider sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3">Product Code</th>
                <th className="py-2.5 px-3">Product Description</th>
                <th className="py-2.5 px-3">Barcode</th>
                <th className="py-2.5 px-3">Unit Code</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Sub Department</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Brand</th>
                <th className="py-2.5 px-3">Tax Code</th>
                <th className="py-2.5 px-3 text-right">Cost</th>
                <th className="py-2.5 px-3 text-right">Cost Incl.Tax</th>
                <th className="py-2.5 px-3 text-right">Avg Cost</th>
                <th className="py-2.5 px-3 text-right">Last Sup. Cost</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 px-3 text-right text-emerald-600">Price Incl.Tax</th>
                <th className="py-2.5 px-3 text-right">Exp Days</th>
                <th className="py-2.5 px-3 text-right">WS Price</th>
                <th className="py-2.5 px-3 text-right">WS Price Incl.Tax</th>
                <th className="py-2.5 px-3">Vendor Name</th>
                <th className="py-2.5 px-3 text-center">Inactive</th>
                <th className="py-2.5 px-3 text-right">Markup %</th>
                <th className="py-2.5 px-3 text-right">Gross Profit %</th>
                <th className="py-2.5 px-3">Short Description</th>
                <th className="py-2.5 px-3 text-center sticky right-0 bg-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={24} className="py-8 text-center text-slate-500">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-bold text-sm">No Products Found</p>
                    <p className="text-xs text-slate-400">Click "+ Add Product" to create a new master item.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{p.sku}</td>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      {p.nameAr && <p className="text-[10px] text-slate-500 font-arabic">{p.nameAr}</p>}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{p.barcode}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{p.unit}</td>
                    <td className="py-2.5 px-3 text-slate-700">{p.categoryName || 'General'}</td>
                    <td className="py-2.5 px-3 text-slate-500">{p.subDepartment || 'GSFDGVFF'}</td>
                    <td className="py-2.5 px-3 text-slate-700">{p.categoryName}</td>
                    <td className="py-2.5 px-3 text-slate-700">{p.brandName || 'Almarai'}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-bold">{p.vatRate === 0 ? 'SR (0%)' : 'VAT (15%)'}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800">{formatQAR(p.costPrice)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800">{formatQAR(p.costInclTax || p.costPrice)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{formatQAR(p.avgCost || p.costPrice)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{formatQAR(p.lastSupplierCost || p.costPrice)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatQAR(p.retailPrice)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">{formatQAR(p.priceInclTax || p.retailPrice)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{p.expDays || 0}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">{formatQAR(p.wsPrice || p.retailPrice * 0.9)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">{formatQAR(p.wsPriceInclTax || p.retailPrice * 0.9)}</td>
                    <td className="py-2.5 px-3 text-slate-600">{p.defaultVendor || 'General'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <input type="checkbox" checked={!p.isActive} readOnly className="rounded text-rose-600" />
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-bold">{p.markupPercent || 30.43}%</td>
                    <td className="py-2.5 px-3 text-right font-mono text-blue-700 font-bold">{p.grossProfitPercent || 23.33}%</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">{p.shortDescription || p.name.substring(0, 12)}</td>
                    <td className="py-2.5 px-3 text-center sticky right-0 bg-white shadow-left">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1 hover:bg-slate-100 text-blue-600 rounded"
                          title="Edit Product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicateProduct(p)}
                          className="p-1 hover:bg-slate-100 text-teal-600 rounded"
                          title="Duplicate Product"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded"
                          title="Delete Product"
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

      {/* 4. BOTTOM PANELS: QUICK BARCODE PRINTING & WAREHOUSE STOCK OVERVIEW (Matching Screenshot 1 Bottom) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT PANEL: QUICK BARCODE PRINTING */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-emerald-600" />
              <span>Quick Barcode Printing</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">DART Label Template</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-semibold text-slate-700">
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="radio" name="quickPrintTax" defaultChecked />
              <span>Incl. Tax</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="radio" name="quickPrintTax" />
              <span>Excl. Tax</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" defaultChecked />
              <span>Default Design</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" defaultChecked />
              <span>Print Price</span>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="block text-[10px] font-bold text-slate-600 mb-0.5">Prd. Date</span>
              <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
              />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-600 mb-0.5">Exp. Date</span>
              <input type="date" className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-600 mb-0.5">Was Price (Comparative)</span>
              <input
                type="text"
                value={quickPrintWasPrice}
                onChange={(e) => setQuickPrintWasPrice(e.target.value)}
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono font-bold text-amber-700"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-1">
            <button
              onClick={() => alert(`🖨️ Thermal Shelf Label Printed! (Was Price: QAR ${quickPrintWasPrice})`)}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Label (F1)</span>
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: WAREHOUSE STOCK OVERVIEW */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Branch Warehouse Stock Overview</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Multi-Store Lookup</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-700">Location:</span>
            <select
              value={stockLookupLocation}
              onChange={(e) => setStockLookupLocation(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg bg-slate-50 font-semibold"
            >
              <option value="Doha Main Branch">Doha Main Branch Warehouse</option>
              <option value="West Bay Store">West Bay Store Branch</option>
              <option value="Al Rayyan Hub">Al Rayyan Distribution Hub</option>
              <option value="Saudi Arabia">Saudi Arabia Regional Store</option>
            </select>
            <button
              onClick={() => alert(`📦 Stock lookup refreshed for ${stockLookupLocation}: 142 Pcs Available.`)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg flex items-center gap-1"
            >
              <span>Get Stock (F2)</span>
            </button>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
            <span className="text-slate-600 font-semibold">{stockLookupLocation} Quantity:</span>
            <strong className="text-emerald-700 font-mono text-sm font-black">142 Pcs Available</strong>
          </div>
        </div>
      </div>

      {/* 5. DART POS COMPREHENSIVE NEW/EDIT PRODUCT MODAL (Matching Screenshots 2 & 3 Layout) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-6">
            {/* MODAL HEADER BAR */}
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold">
                  {editingProduct ? `Edit Master Product: ${editingProduct.sku}` : 'New Product - DART POS'}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveProduct}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded"
                >
                  Save (Ctrl+S)
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* MODAL MAIN CONTENT GRID */}
            <form onSubmit={handleSaveProduct} className="p-4 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* LEFT COLUMN: GENERAL IDENTIFICATION & CLASSIFICATIONS (5 COLS) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* GENERAL CARD */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2.5">
                    <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1">
                      General Identification
                    </h3>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Code / SKU *</label>
                        <input
                          type="text"
                          value={formData.sku || ''}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold text-slate-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Barcode *</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.barcode || ''}
                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                            className="w-full pl-2.5 pr-6 py-1.5 border border-slate-300 rounded font-mono text-slate-900"
                            required
                          />
                          <Barcode className="w-3.5 h-3.5 absolute right-2 top-2 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Product Name (English) *</label>
                      <input
                        type="text"
                        placeholder="e.g. Almarai Fresh Milk Full Cream 1L"
                        value={formData.name || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({
                            ...formData,
                            name: val,
                            nameAr: autoTranslateToArabic(val),
                            localDescription: autoTranslateToArabic(val),
                          });
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-semibold text-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Local / Arabic Description</label>
                      <input
                        type="text"
                        placeholder="مثال: حليب المراعي طازج"
                        value={formData.nameAr || formData.localDescription || ''}
                        onChange={(e) => setFormData({ ...formData, nameAr: e.target.value, localDescription: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-arabic text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Short Description</label>
                        <input
                          type="text"
                          placeholder="Receipt Title"
                          value={formData.shortDescription || ''}
                          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Units</label>
                        <select
                          value={formData.unit || 'Pcs'}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-semibold"
                        >
                          <option value="Pcs">Pcs</option>
                          <option value="Box">Box</option>
                          <option value="Kg">Kg</option>
                          <option value="Pack">Pack</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Default Vendor</label>
                      <select
                        value={formData.defaultVendor || 'Almarai Food Qatar W.L.L'}
                        onChange={(e) => setFormData({ ...formData, defaultVendor: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-semibold bg-white"
                      >
                        <option value="Almarai Food Qatar W.L.L">Almarai Food Qatar W.L.L</option>
                        <option value="Doha Wholesale Trading W.L.L">Doha Wholesale Trading W.L.L</option>
                        <option value="Rayyan Water Company W.L.L">Rayyan Water Company W.L.L</option>
                      </select>
                    </div>
                  </div>

                  {/* CLASSIFICATIONS CARD */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                    <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1">
                      Classifications & Grouping
                    </h3>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Brand</label>
                        <select
                          value={formData.brandName || 'Almarai'}
                          onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                          className="w-full px-2 py-1 border border-slate-300 rounded font-semibold bg-white"
                        >
                          <option value="Almarai">Almarai</option>
                          <option value="Khabari">Khabari</option>
                          <option value="Rayyan">Rayyan</option>
                          <option value="APPLE">APPLE</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Department</label>
                        <select
                          value={formData.categoryName || 'Dairy & Eggs'}
                          onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                          className="w-full px-2 py-1 border border-slate-300 rounded font-semibold bg-white"
                        >
                          {categoriesList.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Sub Department</label>
                        <input
                          type="text"
                          value={formData.subDepartment || 'GSDUYGYG'}
                          onChange={(e) => setFormData({ ...formData, subDepartment: e.target.value })}
                          className="w-full px-2 py-1 border border-slate-300 rounded font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* OPTIONS & OPERATIONAL FLAGS BOX (Matching Screenshot 2 Bottom Left) */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-[11px]">
                    <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1">
                      Options & Flags
                    </h3>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-0.5">Weighing Product</label>
                        <select
                          value={formData.weighingProductType || 'None'}
                          onChange={(e) => setFormData({ ...formData, weighingProductType: e.target.value as any })}
                          className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                        >
                          <option value="None">None (Standard SKU)</option>
                          <option value="Amount In Barcode">Amount In Barcode</option>
                          <option value="Weight In Barcode">Weight In Barcode</option>
                          <option value="Quantity In Barcode">Quantity In Barcode</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-0.5">Procurement Type</label>
                        <select
                          value={formData.procurementType || 'Normal Purchase'}
                          onChange={(e) => setFormData({ ...formData, procurementType: e.target.value as any })}
                          className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                        >
                          <option value="Normal Purchase">Normal Purchase</option>
                          <option value="Consignment">Consignment</option>
                          <option value="Internal Production">Internal Production</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={formData.isActive === false}
                          onChange={(e) => setFormData({ ...formData, isActive: !e.target.checked })}
                          className="rounded text-rose-600"
                        />
                        <span>Inactive (For Sale)</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={formData.nonInventory || false}
                          onChange={(e) => setFormData({ ...formData, nonInventory: e.target.checked })}
                          className="rounded text-emerald-600"
                        />
                        <span>Non Inventory Product</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: COSTING, TAXES, PRICING & PACKINGS (7 COLS) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* COST, TAX AND PRICING PANEL (Matching Screenshot 2 Top Right) */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                        Cost, Tax and Pricing Grid
                      </h3>
                      <span className="text-[10px] text-emerald-600 font-bold font-mono">QAR Currency</span>
                    </div>

                    {/* COSTING & TAXES */}
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-0.5">Cost Price *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.costPrice ?? 10.00}
                          onChange={(e) => updatePricingCalculations('costPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-slate-300 rounded font-mono font-bold text-slate-900 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-0.5">Cost Incl. Tax</label>
                        <input
                          type="number"
                          readOnly
                          value={formData.costInclTax ?? formData.costPrice ?? 10.00}
                          className="w-full px-2 py-1 border border-slate-200 rounded font-mono font-bold text-slate-600 bg-slate-100 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-0.5">Landed Cost</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.landedCost ?? 10.50}
                          onChange={(e) => setFormData({ ...formData, landedCost: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 border border-slate-300 rounded font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-0.5">Costing Method</label>
                        <select
                          value={formData.costingMethod || 'Weighted Average'}
                          onChange={(e) => setFormData({ ...formData, costingMethod: e.target.value as any })}
                          className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-semibold text-[11px]"
                        >
                          <option value="Weighted Average">Weighted Average</option>
                          <option value="Purchase Cost">Purchase Cost</option>
                          <option value="FIFO">FIFO</option>
                        </select>
                      </div>
                    </div>

                    {/* TAXES SELECTION */}
                    <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded border border-slate-200">
                      <div>
                        <span className="block font-bold text-slate-700 text-[10px]">Sale Tax Rate (Qatar VAT)</span>
                        <select
                          value={formData.vatRate || 0}
                          onChange={(e) => setFormData({ ...formData, vatRate: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 border border-slate-300 rounded font-semibold text-xs"
                        >
                          <option value={0}>STANDARD RATE 0% (Zero VAT)</option>
                          <option value={0.15}>STANDARD RATE 15% VAT</option>
                        </select>
                      </div>
                      <div>
                        <span className="block font-bold text-slate-700 text-[10px]">Purchase Tax Rate</span>
                        <select
                          value={formData.purchaseTaxRate || 0}
                          onChange={(e) => setFormData({ ...formData, purchaseTaxRate: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 border border-slate-300 rounded font-semibold text-xs"
                        >
                          <option value={0}>STANDARD RATE 0% (Zero VAT)</option>
                          <option value={0.15}>STANDARD RATE 15% VAT</option>
                        </select>
                      </div>
                    </div>

                    {/* RETAIL PRICING MARGIN GRID */}
                    <div className="grid grid-cols-6 gap-2 text-xs pt-1">
                      <div>
                        <label className="block font-bold text-slate-700 mb-0.5">Retail Price *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.retailPrice ?? 13.04}
                          onChange={(e) => updatePricingCalculations('retailPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-slate-300 rounded font-mono font-bold text-slate-900 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-emerald-700 mb-0.5">Markup %</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.markupPercent ?? 30.43}
                          onChange={(e) => updatePricingCalculations('markupPercent', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-emerald-300 rounded font-mono font-bold text-emerald-700 bg-emerald-50"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-blue-700 mb-0.5">GP %</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.grossProfitPercent ?? 23.33}
                          onChange={(e) => updatePricingCalculations('grossProfitPercent', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-blue-300 rounded font-mono font-bold text-blue-700 bg-blue-50"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-0.5">Price Incl Tax</label>
                        <input
                          type="number"
                          readOnly
                          value={formData.priceInclTax ?? 15.00}
                          className="w-full px-2 py-1 border border-slate-200 rounded font-mono font-bold text-slate-800 bg-slate-100 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-0.5">MSP (Floor)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.msp ?? 12.00}
                          onChange={(e) => setFormData({ ...formData, msp: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 border border-slate-300 rounded font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-amber-700 mb-0.5">Was Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.wasPrice ?? 18.00}
                          onChange={(e) => setFormData({ ...formData, wasPrice: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 border border-amber-300 rounded font-mono font-bold text-amber-700 bg-amber-50"
                        />
                      </div>
                    </div>

                    {/* WHOLESALE PRICING GRID */}
                    <div className="bg-white p-2 rounded border border-slate-200 space-y-1">
                      <span className="block font-bold text-slate-700 text-[10px] uppercase">Wholesale Price Tier</span>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="block text-[10px] text-slate-500">WS Price</span>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.wsPrice ?? 13.04}
                            onChange={(e) => setFormData({ ...formData, wsPrice: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1 border border-slate-300 rounded font-mono font-bold"
                          />
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-500">WS Markup %</span>
                          <input
                            type="number"
                            value={formData.wsMarkupPercent ?? 30.43}
                            onChange={(e) => setFormData({ ...formData, wsMarkupPercent: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1 border border-slate-300 rounded font-mono"
                          />
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-500">WS GP %</span>
                          <input
                            type="number"
                            value={formData.wsGrossProfitPercent ?? 23.33}
                            onChange={(e) => setFormData({ ...formData, wsGrossProfitPercent: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1 border border-slate-300 rounded font-mono"
                          />
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-500">WS Price Incl Tax</span>
                          <input
                            type="number"
                            value={formData.wsPriceInclTax ?? 15.00}
                            onChange={(e) => setFormData({ ...formData, wsPriceInclTax: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1 border border-slate-300 rounded font-mono font-bold text-emerald-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PACKINGS & MULTI-UNIT BARCODES GRID (Matching Screenshot 2 Bottom Right) */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                        Packings & Multi-Unit Barcodes (Carton / Box Multipliers)
                      </h3>
                      <button
                        type="button"
                        onClick={handleAddPackingRow}
                        className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded"
                      >
                        + Add Pack Unit
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] border-collapse bg-white rounded border border-slate-200">
                        <thead className="bg-slate-100 font-bold uppercase text-[9px] text-slate-600">
                          <tr>
                            <th className="p-1.5">Barcode</th>
                            <th className="p-1.5">Unit</th>
                            <th className="p-1.5 text-center">Pack Qty</th>
                            <th className="p-1.5 text-right">Cost</th>
                            <th className="p-1.5 text-right">Retail Price</th>
                            <th className="p-1.5 text-right">Price Incl Tax</th>
                            <th className="p-1.5 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {packingsList.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-3 text-center text-slate-400 text-[10px]">
                                No multi-unit carton packings defined. Click "+ Add Pack Unit" to map bulk boxes.
                              </td>
                            </tr>
                          ) : (
                            packingsList.map((pack, idx) => (
                              <tr key={pack.id}>
                                <td className="p-1.5 font-mono text-slate-800">{pack.barcode}</td>
                                <td className="p-1.5 font-semibold text-slate-800">{pack.unit}</td>
                                <td className="p-1.5 text-center font-mono font-bold">{pack.packQty}</td>
                                <td className="p-1.5 text-right font-mono">{formatQAR(pack.cost)}</td>
                                <td className="p-1.5 text-right font-mono font-bold text-slate-900">{formatQAR(pack.price)}</td>
                                <td className="p-1.5 text-right font-mono font-bold text-emerald-600">{formatQAR(pack.priceInclTax)}</td>
                                <td className="p-1.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => setPackingsList((prev) => prev.filter((_, i) => i !== idx))}
                                    className="text-rose-600 hover:text-rose-800 font-bold text-[10px]"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  {editingProduct ? 'Update Product Master' : 'Save Product Master'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
