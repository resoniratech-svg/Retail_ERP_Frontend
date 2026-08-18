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
  Eye,
  Building,
  Truck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  QrCode,
  FileText,
  RotateCcw,
  Save,
  ShoppingCart,
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'Costing' | 'Packings' | 'Classifications'>('Costing');

  // Sub-Ribbon Screen & Modal States (Matching Target System Images 1, 2, 3, & 4)
  const [activeView, setActiveView] = useState<'Catalog' | 'StockReport' | 'PriceChange'>('Catalog');
  const [stockReportSubTab, setStockReportSubTab] = useState<'Single Location' | 'Location - Stock Matrix'>('Single Location');

  // Barcode Quick Print Modal State (Matching Target Image 3)
  const [isQuickPrintModalOpen, setIsQuickPrintModalOpen] = useState(false);
  const [quickPrintBarcodeScan, setQuickPrintBarcodeScan] = useState('');
  const [quickPrintCode, setQuickPrintCode] = useState('123');
  const [quickPrintProductDesc, setQuickPrintProductDesc] = useState('Almarai Full Cream Fresh Milk 1L');
  const [quickPrintPriceInclTax, setQuickPrintPriceInclTax] = useState(15.00);
  const [quickPrintWasPriceEnabled, setQuickPrintWasPriceEnabled] = useState(false);
  const [quickPrintWasPrice, setQuickPrintWasPrice] = useState(67.00);
  const [quickPrintTaxMode, setQuickPrintTaxMode] = useState<'Incl. Tax' | 'Excl. Tax'>('Incl. Tax');
  const [quickPrintDesignMode, setQuickPrintDesignMode] = useState<'Default Design' | 'PRN Template'>('Default Design');
  const [quickPrintTemplate, setQuickPrintTemplate] = useState('Standard Thermal 50x25mm');
  const [quickPrintPrintPrice, setQuickPrintPrintPrice] = useState(true);
  const [quickPrintAutoPrint, setQuickPrintAutoPrint] = useState(false);
  const [quickPrintAutoPrintQty, setQuickPrintAutoPrintQty] = useState(1);
  const [quickPrintQtyOnScan, setQuickPrintQtyOnScan] = useState(false);
  const [quickPrintQty, setQuickPrintQty] = useState(1);

  // Price Embedded Barcode Printing Modal State (Matching Target Image 4)
  const [isPriceEmbeddedModalOpen, setIsPriceEmbeddedModalOpen] = useState(false);
  const [embeddedSelectedProductId, setEmbeddedSelectedProductId] = useState('');
  const [embeddedCode, setEmbeddedCode] = useState('');
  const [embeddedBarcode, setEmbeddedBarcode] = useState('');
  const [embeddedAddDescription, setEmbeddedAddDescription] = useState('');
  const [embeddedVendor, setEmbeddedVendor] = useState('[Select a Vendor]');
  const [embeddedCost, setEmbeddedCost] = useState(10.00);
  const [embeddedCostCode, setEmbeddedCostCode] = useState('A10.00');
  const [embeddedPrice, setEmbeddedPrice] = useState(13.04);
  const [embeddedPriceInclTax, setEmbeddedPriceInclTax] = useState(15.00);
  const [embeddedPrintPrice, setEmbeddedPrintPrice] = useState(true);
  const [embeddedWasPriceEnabled, setEmbeddedWasPriceEnabled] = useState(false);
  const [embeddedWasPrice, setEmbeddedWasPrice] = useState(67.00);
  const [embeddedDesignMode, setEmbeddedDesignMode] = useState<'Default Design' | 'PRN Template'>('Default Design');
  const [embeddedTemplate, setEmbeddedTemplate] = useState('Choose a Template');
  const [embeddedQty, setEmbeddedQty] = useState(1);

  // Price Change Screen State (Matching Target Image 2)
  const [priceChangeKeyword, setPriceChangeKeyword] = useState('');
  const [priceChangeSearchBy, setPriceChangeSearchBy] = useState<'Description' | 'Barcode' | 'Product Code' | 'Department'>('Description');
  const [priceChangeSearchMode, setPriceChangeSearchMode] = useState<'Begin With' | 'Contains'>('Begin With');
  const [priceChangePriceType, setPriceChangePriceType] = useState<'Retail Price' | 'Wholesale Price'>('Retail Price');
  const [priceChangeDept, setPriceChangeDept] = useState('ALL');
  const [priceChangeSubDept, setPriceChangeSubDept] = useState('ALL');
  const [priceChangeBrand, setPriceChangeBrand] = useState('ALL');
  const [priceChangeVendor, setPriceChangeVendor] = useState('[Select a Vendor]');
  const [priceChangeMarkupPercent, setPriceChangeMarkupPercent] = useState('');
  const [priceChangeGrossProfitPercent, setPriceChangeGrossProfitPercent] = useState('');
  const [priceChangeShowStock, setPriceChangeShowStock] = useState(true);

  // Row 2 Sub-Ribbon Modal States (Matching Target Screenshot)
  const [isPromotionsModalOpen, setIsPromotionsModalOpen] = useState(false);
  const [isSortOrderModalOpen, setIsSortOrderModalOpen] = useState(false);
  const [isSerialHistoryModalOpen, setIsSerialHistoryModalOpen] = useState(false);
  const [isActionHistoryModalOpen, setIsActionHistoryModalOpen] = useState(false);
  const [isPurchaseHistoryModalOpen, setIsPurchaseHistoryModalOpen] = useState(false);
  const [isDeptShiftingModalOpen, setIsDeptShiftingModalOpen] = useState(false);
  const [serialSearchKeyword, setSerialSearchKeyword] = useState('');
  const [stockReportFilter, setStockReportFilter] = useState({
    reportType: 'All Products',
    location: 'Saudi Arabia',
    stockDate: new Date().toISOString().split('T')[0],
    procurementType: 'Normal Purchase',
    defaultVendor: '[Select a Vendor]',
    vendorGroup: '[Select a Group]',
    showDeptWiseStock: false,
    showVariantStock: false,
    includeVanStock: true,
    inStockOnly: false,
    negativeStock: false,
    showLastPurchaseDetail: false,
  });

  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const [scaleFilesList, setScaleFilesList] = useState([
    { id: '1', select: true, description: 'Bizerba Scale PLU Export File (Doha Main Branch)', status: 'Ready' },
    { id: '2', select: true, description: 'Mettler Toledo Scale PLU File (Salwa Road Branch)', status: 'Generated (17/08/2026 09:55:27 AM)' },
    { id: '3', select: false, description: 'DIGI SM-5100 Scale File (Industrial Area Plant)', status: 'Ready' },
    { id: '4', select: false, description: 'Ishida Scale PLU Export File (Al Rayyan Branch)', status: 'Ready' },
  ]);

  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [logsRadioMode, setLogsRadioMode] = useState<'User Log' | 'Barcode Print Log'>('User Log');
  const [logsFilterType, setLogsFilterType] = useState<'Cost' | 'Price' | 'Stock'>('Price');
  const [logsSearchProduct, setLogsSearchProduct] = useState('');
  const [logsFromDate, setLogsFromDate] = useState('2026-08-01T00:00');
  const [logsToDate, setLogsToDate] = useState('2026-08-17T23:59');
  const [logsDefaultVendor, setLogsDefaultVendor] = useState('[Select a Vendor]');

  // Import Products Modal State (Matching Target Screenshot 1)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFilePath, setImportFilePath] = useState('C:\\Documents\\Products_Master_Catalog.xlsx');
  const [importSheetName, setImportSheetName] = useState('Sheet1');
  const [checkDuplicateDescription, setCheckDuplicateDescription] = useState(false);
  const [checkDuplicateProductCode, setCheckDuplicateProductCode] = useState(false);
  const [importExcelData, setImportExcelData] = useState([
    { code: '123', description: 'Almarai Full Cream Fresh Milk 1L', barcode: '346578', category: 'Dairy & Eggs', cost: 10.00, price: 13.04, priceInclTax: 15.00, status: 'Ready' },
    { code: '124', description: 'Rayyan Natural Water 500ml Pack x24', barcode: '6291002938192', category: 'Beverages', cost: 9.50, price: 12.00, priceInclTax: 12.00, status: 'Ready' },
    { code: '125', description: 'Khabari Premium Khudri Dates 1kg', barcode: '6298810293812', category: 'Dates & Fruits', cost: 22.00, price: 30.00, priceInclTax: 30.00, status: 'Ready' },
  ]);

  // Batch Barcode Printing Modal State (Matching Target Screenshot 2)
  const [isBatchBarcodeModalOpen, setIsBatchBarcodeModalOpen] = useState(false);
  const [batchBarcodeItems, setBatchBarcodeItems] = useState<Array<Product & { selected: boolean; printQty: number; packId: number; uom: number }>>([]);
  const [batchBarcodeRecordsLimit, setBatchBarcodeRecordsLimit] = useState(100);
  const [batchBarcodeFromDate, setBatchBarcodeFromDate] = useState('2026-08-01');
  const [batchBarcodeToDate, setBatchBarcodeToDate] = useState('2026-08-17');
  const [batchBarcodePriceChangedOnly, setBatchBarcodePriceChangedOnly] = useState(false);
  const [batchBarcodeKeyword, setBatchBarcodeKeyword] = useState('');
  const [batchBarcodeSearchBy, setBatchBarcodeSearchBy] = useState<'Description' | 'Barcode' | 'Product Code' | 'Department'>('Description');
  const [batchBarcodeSearchMode, setBatchBarcodeSearchMode] = useState<'Begin With' | 'Contains'>('Contains');
  const [batchBarcodeTaxMode, setBatchBarcodeTaxMode] = useState<'Incl. Tax' | 'Excl. Tax'>('Incl. Tax');
  const [batchBarcodeDesignMode, setBatchBarcodeDesignMode] = useState<'Default Design' | 'PRN Template'>('Default Design');
  const [batchBarcodeTemplate, setBatchBarcodeTemplate] = useState('Choose a Template');
  const [batchBarcodePrintPrice, setBatchBarcodePrintPrice] = useState(true);
  const [batchBarcodeShowPackings, setBatchBarcodeShowPackings] = useState(false);
  const [batchBarcodePrintExpDate, setBatchBarcodePrintExpDate] = useState(false);
  const [batchBarcodeQtyMode, setBatchBarcodeQtyMode] = useState<'Stock Qty' | 'Manual Qty' | 'One Each'>('One Each');

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
  const [bottomWasPrice, setBottomWasPrice] = useState('67.00');
  const [stockLookupLocation, setStockLookupLocation] = useState('Doha Main Branch');

  // Modal Sub-Tabs State (Matching DART POS Screenshot media_1787034154403.png)
  const [activeClassTab, setActiveClassTab] = useState<'Classifications' | 'Properties'>('Classifications');
  const [activeOptionsTab, setActiveOptionsTab] = useState<'Options' | 'Add. Features' | 'Re Order' | 'Accounts'>('Options');
  const [activeCostingSubTab, setActiveCostingSubTab] = useState<'Costing & Pricing' | 'Barcode Printing'>('Costing & Pricing');
  const [activePackingsSubTab, setActivePackingsSubTab] = useState<'Packings' | 'Stock link'>('Packings');

  // Stock Link Sub-Tab State
  const [stockLinkCode, setStockLinkCode] = useState('');
  const [stockLinkBarcode, setStockLinkBarcode] = useState('');
  const [stockLinkProduct, setStockLinkProduct] = useState('');

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

  useEffect(() => {
    if (isAddModalOpen) {
      const tabTitle = editingProduct ? 'Edit Product' : 'New Product';
      window.dispatchEvent(new CustomEvent('qatar_erp_active_tab_rename', { detail: { title: tabTitle } }));
    } else {
      window.dispatchEvent(new CustomEvent('qatar_erp_active_tab_rename', { detail: { title: 'Products' } }));
    }
  }, [isAddModalOpen, editingProduct]);

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

  const handleCreateSimilarProduct = () => {
    const base = products[0];
    if (!base) {
      alert('Please select a product first to clone.');
      return;
    }
    const available = loadAvailableCategories();
    setCategoriesList(available);

    setEditingProduct(null);
    setFormData({
      ...base,
      sku: `${base.sku}-COPY`,
      barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      name: `${base.name} (Similar Copy)`,
      nameAr: base.nameAr ? `${base.nameAr} (نسخة)` : '',
    });
    setPackingsList(base.packings || []);
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

  if (isAddModalOpen) {
    return (
      <div className="w-full bg-slate-100 flex flex-col font-sans text-xs select-none space-y-2">
        {/* WINDOW TITLE BAR */}
        <div className="bg-slate-200 border border-slate-300 rounded-t-lg px-4 py-2 flex items-center justify-between text-slate-800 font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-bold">
              {editingProduct ? `Edit Product: ${formData.name || editingProduct.sku}` : 'New Product'} - DART POS
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(false)}
            className="text-slate-500 hover:text-slate-900 font-bold px-2 py-0.5 rounded"
          >
            ✕
          </button>
        </div>

        {/* TOP SUB-RIBBON ACTION TOOLBAR */}
        <div className="bg-slate-200 border-x border-b border-slate-300 px-3 py-1.5 flex items-center justify-between shadow-inner">
          {/* Left Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSaveProduct}
              className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-white text-slate-800 font-bold text-xs rounded border border-slate-400 shadow-2xs"
            >
              <Save className="w-3.5 h-3.5 text-blue-600" />
              <span>Save (Ctrl+S)</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                handleSaveProduct(e);
                handleOpenAddModal();
              }}
              className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-white text-slate-800 font-bold text-xs rounded border border-slate-400 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Save & New (Ctrl+N)</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                handleSaveProduct(e);
                setIsAddModalOpen(false);
              }}
              className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-white text-slate-800 font-bold text-xs rounded border border-slate-400 shadow-2xs"
            >
              <X className="w-3.5 h-3.5 text-rose-600" />
              <span>Save & Close (Ctrl+L)</span>
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => alert('📊 Stock Movement history opened.')}
              className="flex items-center gap-1 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded font-bold text-xs shadow-2xs"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              <span>Stock Movement</span>
            </button>
            <button
              type="button"
              onClick={() => alert('🛒 Purchase History opened (F11)')}
              className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-white text-slate-800 font-bold text-xs rounded border border-slate-400 shadow-2xs"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-sky-600" />
              <span>Purchase History-F11</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenAddModal()}
              className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-white text-slate-800 font-bold text-xs rounded border border-slate-400 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>Reset Fields-F5</span>
            </button>
          </div>
        </div>

        {/* FULL SCREEN FORM BODY */}
        <form onSubmit={handleSaveProduct} className="p-3 space-y-3 bg-slate-100 rounded-b-lg border-x border-b border-slate-300 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-5 space-y-3">
              {/* 1. GENERAL PANEL */}
              <div className="bg-slate-200 border border-slate-300 rounded-lg p-2.5 space-y-2 shadow-xs">
                <div className="bg-slate-300 px-2 py-0.5 font-bold text-slate-800 text-[11px] border-b border-slate-400 -mx-2.5 -mt-2.5 mb-2 rounded-t-lg">
                  General
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-32 font-bold text-slate-700">Code</label>
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-28 px-2 py-1 border border-slate-400 rounded font-mono font-bold bg-white"
                    required
                  />
                  <button type="button" className="px-2 py-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded font-bold text-[10px] text-blue-800">
                    F4 Refno
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-32 font-bold text-slate-700">Product Name</label>
                  <input
                    type="text"
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
                    className="flex-1 px-2 py-1 border border-slate-400 rounded font-bold bg-white"
                    required
                  />
                  <span className="text-slate-500 cursor-pointer">📁</span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-32 font-bold text-slate-700">Local Description</label>
                  <input
                    type="text"
                    value={formData.nameAr || formData.localDescription || ''}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value, localDescription: e.target.value })}
                    className="flex-1 px-2 py-1 border border-slate-400 rounded font-arabic bg-white"
                    dir="rtl"
                  />
                  <button type="button" className="px-1.5 py-0.5 bg-slate-300 border border-slate-400 rounded font-bold text-[10px]">F4</button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-32 font-bold text-slate-700">Short Description</label>
                  <input
                    type="text"
                    value={formData.shortDescription || ''}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="flex-1 px-2 py-1 border border-slate-400 rounded font-mono bg-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-32 font-bold text-slate-700">Barcode</label>
                  <input
                    type="text"
                    value={formData.barcode || ''}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="flex-1 px-2 py-1 border border-slate-400 rounded font-mono bg-white"
                    required
                  />
                  <button type="button" className="px-1.5 py-0.5 bg-slate-300 border border-slate-400 rounded font-bold text-[10px]">F4</button>
                  <Barcode className="w-4 h-4 text-slate-600" />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-32 font-bold text-slate-700">Units</label>
                  <select
                    value={formData.unit || 'Pcs'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="flex-1 px-2 py-1 border border-slate-400 rounded font-semibold bg-white"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Box">Box</option>
                    <option value="Kg">Kg</option>
                    <option value="Pack">Pack</option>
                    <option value="apple">apple</option>
                  </select>
                  <button type="button" className="px-1.5 py-0.5 bg-slate-300 border border-slate-400 rounded font-bold text-[10px] text-emerald-800">⊕ F4</button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-32 font-bold text-slate-700">Default Vendor</label>
                  <select
                    value={formData.defaultVendor || 'Almarai Food Qatar W.L.L'}
                    onChange={(e) => setFormData({ ...formData, defaultVendor: e.target.value })}
                    className="flex-1 px-2 py-1 border border-slate-400 rounded font-semibold bg-white"
                  >
                    <option value="Almarai Food Qatar W.L.L">Almarai Food Qatar W.L.L</option>
                    <option value="Doha Wholesale Trading W.L.L">Doha Wholesale Trading W.L.L</option>
                    <option value="Rayyan Water Company W.L.L">Rayyan Water Company W.L.L</option>
                    <option value="aaa">aaa</option>
                  </select>
                  <button type="button" className="px-1.5 py-0.5 bg-slate-300 border border-slate-400 rounded font-bold text-[10px] text-emerald-800">⊕ F4</button>
                </div>

                <div className="flex items-start gap-2">
                  <label className="w-32 font-bold text-slate-700 pt-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="flex-1 px-2 py-1 border border-slate-400 rounded bg-white text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-32 font-bold text-slate-700">Additional Description</label>
                  <input
                    type="text"
                    value={formData.additionalDescription || ''}
                    onChange={(e) => setFormData({ ...formData, additionalDescription: e.target.value })}
                    className="flex-1 px-2 py-1 border border-slate-400 rounded bg-white"
                  />
                </div>
              </div>

              {/* 2. CLASSIFICATIONS & PROPERTIES TABS */}
              <div className="bg-slate-200 border border-slate-300 rounded-lg p-2 space-y-2 shadow-xs">
                <div className="flex items-center gap-1 border-b border-slate-300 pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveClassTab('Classifications')}
                    className={`px-3 py-1 rounded-t font-bold text-xs ${
                      activeClassTab === 'Classifications'
                        ? 'bg-white border-t-2 border-emerald-600 text-slate-900 shadow-2xs'
                        : 'bg-slate-300 text-slate-600 hover:bg-slate-300/80'
                    }`}
                  >
                    Classifications
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveClassTab('Properties')}
                    className={`px-3 py-1 rounded-t font-bold text-xs ${
                      activeClassTab === 'Properties'
                        ? 'bg-white border-t-2 border-emerald-600 text-slate-900 shadow-2xs'
                        : 'bg-slate-300 text-slate-600 hover:bg-slate-300/80'
                    }`}
                  >
                    Properties
                  </button>
                </div>

                {activeClassTab === 'Classifications' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <label className="w-28 font-bold text-slate-700">Brand</label>
                      <select
                        value={formData.brandName || 'Almarai'}
                        onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                        className="flex-1 px-2 py-1 border border-slate-400 rounded font-semibold bg-white"
                      >
                        <option value="Almarai">Almarai</option>
                        <option value="Khabari">Khabari</option>
                        <option value="Rayyan">Rayyan</option>
                        <option value="APPLE">APPLE</option>
                      </select>
                      <button type="button" className="px-1.5 py-0.5 bg-slate-300 border border-slate-400 rounded font-bold text-[10px] text-emerald-800">⊕ F4</button>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="w-28 font-bold text-slate-700">Department</label>
                      <select
                        value={formData.categoryName || 'Dairy & Eggs'}
                        onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                        className="flex-1 px-2 py-1 border border-slate-400 rounded font-semibold bg-white"
                      >
                        {categoriesList.map((c) => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                        <option value="GSDUYGYG">GSDUYGYG</option>
                      </select>
                      <button type="button" className="px-1.5 py-0.5 bg-slate-300 border border-slate-400 rounded font-bold text-[10px] text-emerald-800">⊕ F4</button>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="w-28 font-bold text-slate-700">Sub Department</label>
                      <input
                        type="text"
                        value={formData.subDepartment || 'GSFDGVFF'}
                        onChange={(e) => setFormData({ ...formData, subDepartment: e.target.value })}
                        className="flex-1 px-2 py-1 border border-slate-400 rounded font-mono bg-white"
                      />
                      <button type="button" className="px-1.5 py-0.5 bg-slate-300 border border-slate-400 rounded font-bold text-[10px] text-emerald-800">⊕ F4</button>
                    </div>
                  </div>
                )}

                {activeClassTab === 'Properties' && (
                  <div className="p-2 bg-white border border-slate-300 rounded text-slate-600 text-xs">
                    Product Custom Master Attributes & ERP Field Properties
                  </div>
                )}
              </div>

              {/* 3. OPTIONS / ADD. FEATURES / RE ORDER / ACCOUNTS TABS */}
              <div className="bg-slate-200 border border-slate-300 rounded-lg p-2 space-y-2 shadow-xs">
                <div className="flex items-center gap-1 border-b border-slate-300 pb-1 overflow-x-auto">
                  {(['Options', 'Add. Features', 'Re Order', 'Accounts'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveOptionsTab(tab)}
                      className={`px-2.5 py-0.5 rounded-t font-bold text-[11px] whitespace-nowrap ${
                        activeOptionsTab === tab
                          ? 'bg-white border-t-2 border-emerald-600 text-slate-900 shadow-2xs'
                          : 'bg-slate-300 text-slate-600 hover:bg-slate-300/80'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {activeOptionsTab === 'Options' && (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={formData.weighingProductType !== 'None'}
                          onChange={(e) => setFormData({ ...formData, weighingProductType: e.target.checked ? 'Amount In Barcode' : 'None' })}
                        />
                        <span>Weighing Product</span>
                      </label>
                      <select
                        value={formData.weighingProductType || 'Amount In Barcode'}
                        onChange={(e) => setFormData({ ...formData, weighingProductType: e.target.value as any })}
                        className="px-2 py-0.5 border border-slate-400 rounded bg-white text-xs"
                      >
                        <option value="Amount In Barcode">Amount In Barcode</option>
                        <option value="Weight In Barcode">Weight In Barcode</option>
                        <option value="Quantity In Barcode">Quantity In Barcode</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={formData.isActive === false}
                          onChange={(e) => setFormData({ ...formData, isActive: !e.target.checked })}
                          className="rounded text-rose-600"
                        />
                        <span>Inactive (For Sale)</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={formData.nonInventory || false}
                          onChange={(e) => setFormData({ ...formData, nonInventory: e.target.checked })}
                          className="rounded text-emerald-600"
                        />
                        <span>Non Inventory Product</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div></div>
                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={formData.autoProductionWhileSale || false}
                          onChange={(e) => setFormData({ ...formData, autoProductionWhileSale: e.target.checked })}
                        />
                        <span>Auto Production While Sale</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-300">
                      <div>
                        <span className="block font-bold text-slate-700 text-[10px]">Procurement Type</span>
                        <select
                          value={formData.procurementType || 'Normal Purchase'}
                          onChange={(e) => setFormData({ ...formData, procurementType: e.target.value as any })}
                          className="w-full px-2 py-0.5 border border-slate-400 rounded bg-white"
                        >
                          <option value="Normal Purchase">Normal Purchase</option>
                          <option value="Consignment">Consignment</option>
                          <option value="Internal Production">Internal Production</option>
                        </select>
                      </div>
                      <div>
                        <span className="block font-bold text-slate-700 text-[10px]">Division Factor</span>
                        <input
                          type="number"
                          step="0.001"
                          value={formData.divisionFactor ?? 1.000}
                          onChange={(e) => setFormData({ ...formData, divisionFactor: parseFloat(e.target.value) || 1.0 })}
                          className="w-full px-2 py-0.5 border border-slate-400 rounded bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-1">
                      <span className="block font-bold text-slate-700 text-[10px]">Max Discount Rate ℹ️</span>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue="0.00"
                        className="w-full max-w-[180px] px-2 py-0.5 border border-slate-400 rounded bg-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {activeOptionsTab !== 'Options' && (
                  <div className="p-2 bg-white border border-slate-300 rounded text-slate-600 text-xs">
                    Advanced ERP Settings: {activeOptionsTab} configuration matrix
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-7 space-y-3">
              {/* 1. COST, TAX AND PRICING CARD */}
              <div className="bg-slate-200 border border-slate-300 rounded-lg p-2.5 space-y-2 shadow-xs">
                <div className="bg-slate-300 px-2 py-0.5 font-bold text-slate-800 text-[11px] border-b border-slate-400 -mx-2.5 -mt-2.5 mb-2 rounded-t-lg flex items-center justify-between">
                  <span>Cost, Tax and Pricing</span>
                </div>

                <div className="flex items-center gap-1 border-b border-slate-300 pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveCostingSubTab('Costing & Pricing')}
                    className={`px-3 py-0.5 rounded-t font-bold text-xs ${
                      activeCostingSubTab === 'Costing & Pricing'
                        ? 'bg-white border-t-2 border-emerald-600 text-slate-900 shadow-2xs'
                        : 'bg-slate-300 text-slate-600 hover:bg-slate-300/80'
                    }`}
                  >
                    💲 Costing & Pricing
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCostingSubTab('Barcode Printing')}
                    className={`px-3 py-0.5 rounded-t font-bold text-xs ${
                      activeCostingSubTab === 'Barcode Printing'
                        ? 'bg-white border-t-2 border-emerald-600 text-slate-900 shadow-2xs'
                        : 'bg-slate-300 text-slate-600 hover:bg-slate-300/80'
                    }`}
                  >
                    📊 Barcode Printing
                  </button>
                </div>

                {activeCostingSubTab === 'Costing & Pricing' && (
                  <div className="space-y-3 pt-1">
                    {/* Costing Row */}
                    <div className="grid grid-cols-7 gap-1.5 text-xs bg-white p-2 rounded border border-slate-300">
                      <div>
                        <span className="block font-bold text-slate-700 text-[10px]">Cost <span className="text-emerald-700 font-mono">F10</span></span>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.costPrice ?? 0.00}
                          onChange={(e) => updatePricingCalculations('costPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono font-bold"
                        />
                      </div>
                      <div>
                        <span className="block font-bold text-slate-700 text-[10px]">Cost Incl.</span>
                        <input
                          type="number"
                          readOnly
                          value={formData.costInclTax ?? formData.costPrice ?? 0.00}
                          className="w-full px-1.5 py-0.5 border border-slate-200 rounded font-mono bg-slate-100 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <span className="block font-bold text-slate-700 text-[10px]">Lnd. Cost</span>
                        <input
                          type="text"
                          value={`${(formData.landedCost ?? 0.00).toFixed(6)}X`}
                          onChange={(e) => setFormData({ ...formData, landedCost: parseFloat(e.target.value) || 0 })}
                          className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono text-[10px]"
                        />
                      </div>
                      <div>
                        <span className="block font-bold text-slate-700 text-[10px]">Costing Method ℹ️</span>
                        <select
                          value={formData.costingMethod || 'Purchase Cost'}
                          onChange={(e) => setFormData({ ...formData, costingMethod: e.target.value as any })}
                          className="w-full px-1 py-0.5 border border-slate-300 rounded text-[10px] font-semibold"
                        >
                          <option value="Purchase Cost">Purchase Cost</option>
                          <option value="Weighted Average">Weighted Average</option>
                          <option value="FIFO">FIFO</option>
                        </select>
                      </div>
                      <div>
                        <span className="block font-bold text-slate-700 text-[10px]">Gross</span>
                        <input type="number" readOnly value="0.00" className="w-full px-1.5 py-0.5 border border-slate-200 rounded font-mono bg-slate-100" />
                      </div>
                      <div>
                        <span className="block font-bold text-slate-700 text-[10px]">Avg</span>
                        <input type="text" readOnly value="0.000000..." className="w-full px-1 py-0.5 border border-slate-200 rounded font-mono text-[9px] bg-slate-100" />
                      </div>
                      <div>
                        <span className="block font-bold text-slate-700 text-[10px]">First Cost <span className="text-slate-500 font-mono">F8</span></span>
                        <input type="number" readOnly value="0.00" className="w-full px-1.5 py-0.5 border border-slate-200 rounded font-mono bg-slate-100" />
                      </div>
                    </div>

                    {/* Taxes Row */}
                    <div className="bg-white p-2 rounded border border-slate-300 space-y-1">
                      <span className="block font-bold text-emerald-800 text-[10px]">💲 Taxes</span>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-20 font-bold text-slate-700">Sale Tax 1</span>
                          <select
                            value={formData.vatRate || 0.15}
                            onChange={(e) => setFormData({ ...formData, vatRate: parseFloat(e.target.value) || 0 })}
                            className="flex-1 px-2 py-0.5 border border-slate-300 rounded font-semibold text-xs"
                          >
                            <option value={0.15}>STANDARD RATE 15% VAT</option>
                            <option value={0.00}>STANDARD RATE 0% (Zero VAT)</option>
                          </select>
                          <span className="font-mono text-slate-600 font-bold">Tax 1 %</span>
                          <input type="text" readOnly value="15.00%" className="w-16 px-1.5 py-0.5 border border-slate-200 rounded font-mono text-center bg-slate-100 font-bold text-emerald-700" />
                          <button type="button" className="px-1 py-0.5 bg-slate-200 border border-slate-300 rounded font-bold text-[10px]">⊕ F4</button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="w-24 font-bold text-slate-700">Purchase Tax</span>
                          <select
                            value={formData.purchaseTaxRate || 0.15}
                            onChange={(e) => setFormData({ ...formData, purchaseTaxRate: parseFloat(e.target.value) || 0 })}
                            className="flex-1 px-2 py-0.5 border border-slate-300 rounded font-semibold text-xs"
                          >
                            <option value={0.15}>STANDARD RATE 15% VAT</option>
                            <option value={0.00}>STANDARD RATE 0% (Zero VAT)</option>
                          </select>
                          <span className="font-mono text-slate-600 font-bold">Tax %</span>
                          <input type="text" readOnly value="15.00%" className="w-16 px-1.5 py-0.5 border border-slate-200 rounded font-mono text-center bg-slate-100 font-bold text-emerald-700" />
                        </div>
                      </div>
                    </div>

                    {/* Retail & Wholesale Pricing Matrix */}
                    <div className="bg-white p-2 rounded border border-slate-300 space-y-2">
                      {/* Retail Row */}
                      <div className="grid grid-cols-7 gap-1.5 text-xs">
                        <div>
                          <span className="block font-bold text-slate-700 text-[10px]">Price</span>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.retailPrice ?? 0.00}
                            onChange={(e) => updatePricingCalculations('retailPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono font-bold"
                          />
                        </div>
                        <div>
                          <span className="block font-bold text-slate-700 text-[10px]">Markup</span>
                          <input
                            type="number"
                            step="0.1"
                            value={formData.markupPercent ?? 0.00}
                            onChange={(e) => updatePricingCalculations('markupPercent', parseFloat(e.target.value) || 0)}
                            className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono"
                          />
                        </div>
                        <div>
                          <span className="block font-bold text-slate-700 text-[10px]">GP %</span>
                          <input
                            type="number"
                            step="0.1"
                            value={formData.grossProfitPercent ?? 0.00}
                            onChange={(e) => updatePricingCalculations('grossProfitPercent', parseFloat(e.target.value) || 0)}
                            className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono"
                          />
                        </div>
                        <div>
                          <span className="block font-bold text-slate-700 text-[10px]">Price Incl Tax</span>
                          <input
                            type="number"
                            readOnly
                            value={formData.priceInclTax ?? 0.00}
                            className="w-full px-1.5 py-0.5 border border-slate-200 rounded font-mono font-bold text-emerald-700 bg-slate-100"
                          />
                        </div>
                        <div>
                          <span className="block font-bold text-slate-700 text-[10px]">MSP</span>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.msp ?? 0.00}
                            onChange={(e) => setFormData({ ...formData, msp: parseFloat(e.target.value) || 0 })}
                            className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono"
                          />
                        </div>
                        <div>
                          <span className="block font-bold text-slate-700 text-[10px]">Was Price</span>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.wasPrice ?? 0.00}
                            onChange={(e) => setFormData({ ...formData, wasPrice: parseFloat(e.target.value) || 0 })}
                            className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono text-amber-700 font-bold"
                          />
                        </div>
                        <div className="flex items-center pt-3">
                          <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-700 text-[10px]">
                            <input
                              type="checkbox"
                              checked={formData.openPrice || false}
                              onChange={(e) => setFormData({ ...formData, openPrice: e.target.checked })}
                            />
                            <span>Open Price</span>
                          </label>
                        </div>
                      </div>

                      {/* Wholesale Row */}
                      <div className="pt-2 border-t border-slate-200">
                        <span className="block font-bold text-slate-700 text-[10px] mb-1">Wholesale Pricing</span>
                        <div className="grid grid-cols-5 gap-2 text-xs">
                          <div>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.wsPrice ?? 0.00}
                              onChange={(e) => setFormData({ ...formData, wsPrice: parseFloat(e.target.value) || 0 })}
                              className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono font-bold"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={formData.wsMarkupPercent ?? 0.00}
                              onChange={(e) => setFormData({ ...formData, wsMarkupPercent: parseFloat(e.target.value) || 0 })}
                              className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={formData.wsGrossProfitPercent ?? 0.00}
                              onChange={(e) => setFormData({ ...formData, wsGrossProfitPercent: parseFloat(e.target.value) || 0 })}
                              className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={formData.wsPriceInclTax ?? 0.00}
                              onChange={(e) => setFormData({ ...formData, wsPriceInclTax: parseFloat(e.target.value) || 0 })}
                              className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono font-bold text-emerald-600"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={formData.wsMsp ?? 0.00}
                              onChange={(e) => setFormData({ ...formData, wsMsp: parseFloat(e.target.value) || 0 })}
                              className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                  {/* 2. PACKINGS & STOCK LINK CARD */}
                  <div className="bg-slate-200 border border-slate-300 rounded-lg p-2.5 space-y-2 shadow-xs">
                    <div className="flex items-center gap-1 border-b border-slate-300 pb-1">
                      <button
                        type="button"
                        onClick={() => setActivePackingsSubTab('Packings')}
                        className={`px-3 py-0.5 rounded-t font-bold text-xs ${
                          activePackingsSubTab === 'Packings'
                            ? 'bg-white border-t-2 border-emerald-600 text-slate-900 shadow-2xs'
                            : 'bg-slate-300 text-slate-600 hover:bg-slate-300/80'
                        }`}
                      >
                        📦 Packings
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePackingsSubTab('Stock link')}
                        className={`px-3 py-0.5 rounded-t font-bold text-xs ${
                          activePackingsSubTab === 'Stock link'
                            ? 'bg-white border-t-2 border-emerald-600 text-slate-900 shadow-2xs'
                            : 'bg-slate-300 text-slate-600 hover:bg-slate-300/80'
                        }`}
                      >
                        🔗 Stock link
                      </button>
                    </div>

                    {activePackingsSubTab === 'Packings' && (
                      <div className="space-y-2 pt-1">
                        {/* Sub-Form Row 1 */}
                        <div className="flex items-center justify-between gap-2 bg-white p-2 rounded border border-slate-300">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="font-bold text-slate-700 text-[11px]">Barcode</span>
                            <input type="text" className="w-28 px-1.5 py-0.5 border border-slate-300 rounded font-mono" />
                            <Barcode className="w-4 h-4 text-slate-600" />

                            <span className="font-bold text-slate-700 text-[11px] ml-2">Units</span>
                            <select className="w-20 px-1 py-0.5 border border-slate-300 rounded text-xs">
                              <option>Unit</option>
                              <option>Box</option>
                              <option>Carton</option>
                            </select>

                            <span className="font-bold text-slate-700 text-[11px] ml-2">Pack Qty</span>
                            <input type="text" className="w-16 px-1.5 py-0.5 border border-slate-300 rounded font-mono" />

                            <span className="font-bold text-slate-700 text-[11px] ml-2">Cost</span>
                            <input type="text" className="w-20 px-1.5 py-0.5 border border-slate-300 rounded font-mono" />
                          </div>

                          <div className="flex items-center gap-1">
                            <button type="button" className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-bold text-[10px]">✏️ Edit</button>
                            <button type="button" className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-bold text-[10px] text-rose-700">❌ Delete</button>
                            <button type="button" className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-bold text-[10px] text-blue-800">📦 Raw Mater.</button>
                            <button type="button" onClick={handleAddPackingRow} className="px-3 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded font-bold text-[10px] text-emerald-800">➕ Add (F9)</button>
                          </div>
                        </div>

                        {/* Sub-Form Row 2 */}
                        <div className="grid grid-cols-6 gap-2 bg-white p-2 rounded border border-slate-300 text-xs">
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">Price</span>
                            <input type="text" defaultValue="0.0000" className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">Price Incl Tax</span>
                            <input type="text" defaultValue="0.00" className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono font-bold text-emerald-700" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">MSP</span>
                            <input type="text" className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">Product Name</span>
                            <input type="text" placeholder="eg: 1 X 12" className="w-full px-1.5 py-0.5 border border-slate-300 rounded" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">Add.Description</span>
                            <input type="text" className="w-full px-1.5 py-0.5 border border-slate-300 rounded" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">Was Price</span>
                            <input type="text" className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono text-amber-700" />
                          </div>
                        </div>

                        {/* Sub-Form Row 3 */}
                        <div className="grid grid-cols-8 gap-1.5 bg-white p-2 rounded border border-slate-300 text-xs items-center">
                          <div>
                            <span className="block font-bold text-slate-700 text-[9px]">WS. Price</span>
                            <input type="text" defaultValue="0.0000" className="w-full px-1 py-0.5 border border-slate-300 rounded font-mono" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[9px]">WS P Tax</span>
                            <input type="text" defaultValue="0.00" className="w-full px-1 py-0.5 border border-slate-300 rounded font-mono" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[9px]">MSP</span>
                            <input type="text" className="w-full px-1 py-0.5 border border-slate-300 rounded font-mono" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[9px]">Mark Up</span>
                            <input type="text" defaultValue="0.00" className="w-full px-1 py-0.5 border border-slate-300 rounded font-mono" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[9px]">GP %</span>
                            <input type="text" defaultValue="0.00" className="w-full px-1 py-0.5 border border-slate-300 rounded font-mono" />
                          </div>
                          <div className="col-span-3 flex items-center gap-3 pt-3">
                            <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800 text-[10px]">
                              <input type="checkbox" defaultChecked />
                              <span>Is Ecomm. Product</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800 text-[10px]">
                              <input type="checkbox" />
                              <span>Stock Unit</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800 text-[10px]">
                              <input type="checkbox" />
                              <span>Weighing</span>
                            </label>
                          </div>
                        </div>

                        {/* Packings Grid Table */}
                        <div className="overflow-x-auto bg-white rounded border border-slate-300 max-h-36">
                          <table className="w-full text-left text-[10px] border-collapse font-mono">
                            <thead className="bg-slate-100 font-bold uppercase text-slate-700 sticky top-0 border-b border-slate-300">
                              <tr>
                                <th className="p-1 border-r border-slate-200">Barcode</th>
                                <th className="p-1 border-r border-slate-200">Pack Qty</th>
                                <th className="p-1 border-r border-slate-200">Price</th>
                                <th className="p-1 border-r border-slate-200">Price Ind Tax</th>
                                <th className="p-1 border-r border-slate-200">Unit Code</th>
                                <th className="p-1 border-r border-slate-200">Pack Description</th>
                                <th className="p-1 border-r border-slate-200">MSP</th>
                                <th className="p-1 border-r border-slate-200">WS Price Ind Tax</th>
                                <th className="p-1 border-r border-slate-200">WS Price</th>
                                <th className="p-1 border-r border-slate-200">WSMSP</th>
                                <th className="p-1 border-r border-slate-200">Was Price</th>
                                <th className="p-1">Cost</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {packingsList.length === 0 ? (
                                <tr>
                                  <td colSpan={12} className="p-4 text-center text-slate-400 italic">
                                    No packings mapped. Fill row above and click "➕ Add (F9)"
                                  </td>
                                </tr>
                              ) : (
                                packingsList.map((pack, idx) => (
                                  <tr key={pack.id} className="hover:bg-slate-50">
                                    <td className="p-1 border-r border-slate-200 font-bold text-slate-800">{pack.barcode}</td>
                                    <td className="p-1 border-r border-slate-200 text-center font-bold">{pack.packQty}</td>
                                    <td className="p-1 border-r border-slate-200 text-right">{pack.price.toFixed(2)}</td>
                                    <td className="p-1 border-r border-slate-200 text-right font-bold text-emerald-700">{pack.priceInclTax.toFixed(2)}</td>
                                    <td className="p-1 border-r border-slate-200 font-sans">{pack.unit}</td>
                                    <td className="p-1 border-r border-slate-200 font-sans">{pack.unit} Pack</td>
                                    <td className="p-1 border-r border-slate-200 text-right">0.00</td>
                                    <td className="p-1 border-r border-slate-200 text-right">0.00</td>
                                    <td className="p-1 border-r border-slate-200 text-right">0.00</td>
                                    <td className="p-1 border-r border-slate-200 text-right">0.00</td>
                                    <td className="p-1 border-r border-slate-200 text-right text-amber-700">0.00</td>
                                    <td className="p-1 text-right">{pack.cost.toFixed(2)}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {activePackingsSubTab === 'Stock link' && (
                      <div className="space-y-3 pt-1 font-sans text-xs">
                        {/* Top Link Form Controls Row */}
                        <div className="bg-slate-100 p-3 rounded border border-slate-300 flex items-start justify-between gap-4">
                          <div className="space-y-2 flex-1 max-w-lg">
                            <div className="flex items-center gap-2">
                              <label className="w-20 font-bold text-slate-700">Code</label>
                              <input
                                type="text"
                                value={stockLinkCode}
                                onChange={(e) => setStockLinkCode(e.target.value)}
                                className="w-48 px-2 py-1 border border-slate-400 rounded font-mono bg-white text-xs"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <label className="w-20 font-bold text-slate-700">Barcode</label>
                              <input
                                type="text"
                                value={stockLinkBarcode}
                                onChange={(e) => setStockLinkBarcode(e.target.value)}
                                className="w-48 px-2 py-1 border border-slate-400 rounded font-mono bg-white text-xs"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <label className="w-20 font-bold text-slate-700">Product</label>
                              <input
                                type="text"
                                value={stockLinkProduct}
                                onChange={(e) => setStockLinkProduct(e.target.value)}
                                className="flex-1 px-2 py-1 border border-slate-400 rounded bg-white text-xs"
                              />
                            </div>
                          </div>

                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => alert(`🔗 Product stock linked successfully for ${stockLinkProduct || 'selected item'}!`)}
                              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold border border-slate-400 rounded text-xs shadow-2xs transition-all"
                            >
                              Link Product Stock
                            </button>
                          </div>
                        </div>

                        {/* Stock Links Data Grid Table */}
                        <div className="overflow-x-auto bg-white rounded border border-slate-300 min-h-[160px]">
                          <table className="w-full text-left text-xs border-collapse font-mono">
                            <thead className="bg-slate-100 font-bold uppercase text-slate-700 sticky top-0 border-b border-slate-300">
                              <tr>
                                <th className="p-2 border-r border-slate-200">Code</th>
                                <th className="p-2 border-r border-slate-200">Barcode</th>
                                <th className="p-2 border-r border-slate-200">Linked Product Name</th>
                                <th className="p-2 border-r border-slate-200">Branch / Location</th>
                                <th className="p-2 border-r border-slate-200 text-right">Available Stock</th>
                                <th className="p-2 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                                  No stock links mapped. Fill Code/Barcode above and click "Link Product Stock".
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        );
      }

      return (
    <div className="flex flex-col gap-4 font-sans text-xs">
      {/* 1. TOP DART POS SUB-RIBBON ACTION TOOLBAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-white shadow-sm flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setActiveView('StockReport')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold ${
              activeView === 'StockReport'
                ? 'bg-sky-600 text-white border-sky-500 font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
            <span>Stock Report</span>
          </button>

          <button
            onClick={() => setIsScaleModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-semibold"
          >
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Scale File</span>
          </button>

          <button
            onClick={() => {
              setLogsFilterType('Price');
              setIsLogsModalOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-semibold"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Price Adj Logs</span>
          </button>

          <button
            onClick={() => {
              setLogsFilterType('Cost');
              setIsLogsModalOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-semibold"
          >
            <DollarSign className="w-3.5 h-3.5 text-yellow-400" />
            <span>Cost Adj Logs</span>
          </button>

          <button
            onClick={() => {
              setLogsFilterType('Stock');
              setIsLogsModalOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-semibold"
          >
            <Boxes className="w-3.5 h-3.5 text-purple-400" />
            <span>Stock Movement</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Import Products</span>
          </button>

          <button
            onClick={() => setIsBatchBarcodeModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-semibold"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            <span>Barcode Printing</span>
          </button>

          <button
            onClick={() => setIsPriceEmbeddedModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-semibold"
          >
            <Barcode className="w-3.5 h-3.5 text-pink-400" />
            <span>Price Embedded Barcode</span>
          </button>

          <button
            onClick={() => setIsQuickPrintModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-semibold"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Quick Print</span>
          </button>

          <button
            onClick={() => setActiveView('PriceChange')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold ${
              activeView === 'PriceChange'
                ? 'bg-rose-600 text-white border-rose-500 font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Percent className="w-3.5 h-3.5 text-rose-400" />
            <span>Price Chng By GP</span>
          </button>
        </div>

        <span className="text-[10px] text-slate-400 font-mono shrink-0">Catalog Items: {products.length}</span>
      </div>

      {/* 2. DART POS SECOND SUB-RIBBON ACTION TOOLBAR (Matching User's Screenshot) */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm flex items-center justify-between gap-2 overflow-x-auto text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setIsPromotionsModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold shadow-xs"
          >
            <Tag className="w-3.5 h-3.5 text-amber-600" />
            <span>Active Promotions</span>
          </button>

          <button
            onClick={handleCreateSimilarProduct}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-600" />
            <span>Create A Similar Product</span>
          </button>

          <button
            onClick={() => setIsSortOrderModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Sort Order</span>
          </button>

          <button
            onClick={() => setIsSerialHistoryModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold"
          >
            <Barcode className="w-3.5 h-3.5 text-sky-600" />
            <span>Product History By Serial</span>
          </button>

          <button
            onClick={() => setIsActionHistoryModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold"
          >
            <History className="w-3.5 h-3.5 text-purple-600" />
            <span>Action History</span>
          </button>
        </div>

        {/* Right Aligned Quick Tools */}
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <button
            onClick={() => setIsPurchaseHistoryModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded-lg font-bold"
          >
            <TrendingUp className="w-3.5 h-3.5 text-red-600" />
            <span>Purchase History</span>
          </button>

          <button
            onClick={() => setIsDeptShiftingModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold"
          >
            <Boxes className="w-3.5 h-3.5 text-teal-600" />
            <span>Department/Brand Shifting</span>
          </button>

          <button
            onClick={() => setIsDeptShiftingModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-semibold"
          >
            <Boxes className="w-3.5 h-3.5 text-teal-600" />
            <span>Department/Brand Shifting</span>
          </button>
        </div>
      </div>

      {/* CONDITIONAL CONTENT VIEW: STOCK REPORT SCREEN (Image 2) VS PRODUCTS CATALOG (Image 1) */}
      {activeView === 'StockReport' ? (
        <div className="space-y-3">
          {/* Top Sub-Tabs Bar (Matching Image 2 Top) */}
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setStockReportSubTab('Single Location')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  stockReportSubTab === 'Single Location'
                    ? 'bg-slate-900 text-emerald-400 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Single Location
              </button>
              <button
                onClick={() => setStockReportSubTab('Location - Stock Matrix')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  stockReportSubTab === 'Location - Stock Matrix'
                    ? 'bg-slate-900 text-emerald-400 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Location - Stock Matrix
              </button>
            </div>

            <button
              onClick={() => setActiveView('Catalog')}
              className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg border border-slate-300 text-xs"
            >
              ← Back to Products Catalog
            </button>
          </div>

          {/* Filters Card (Matching Image 2 Filters Panel) */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1">
              Filters & Stock Ledger Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Report Type</label>
                <select
                  value={stockReportFilter.reportType}
                  onChange={(e) => setStockReportFilter({ ...stockReportFilter, reportType: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-semibold bg-white"
                >
                  <option value="All Products">All Products</option>
                  <option value="Active Products">Active Products</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Location</label>
                <select
                  value={stockReportFilter.location}
                  onChange={(e) => setStockReportFilter({ ...stockReportFilter, location: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold bg-white text-slate-900"
                >
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Doha Main Branch">Doha Main Branch</option>
                  <option value="Industrial Area Warehouse">Industrial Area Warehouse</option>
                  <option value="Salwa Road Showroom">Salwa Road Showroom</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Stock Date</label>
                <input
                  type="date"
                  value={stockReportFilter.stockDate}
                  onChange={(e) => setStockReportFilter({ ...stockReportFilter, stockDate: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Procurement Type</label>
                <select
                  value={stockReportFilter.procurementType}
                  onChange={(e) => setStockReportFilter({ ...stockReportFilter, procurementType: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-semibold bg-white"
                >
                  <option value="Normal Purchase">Normal Purchase</option>
                  <option value="Consignment">Consignment</option>
                  <option value="Import">Import</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Default Vendor</label>
                <div className="flex items-center gap-1">
                  <select
                    value={stockReportFilter.defaultVendor}
                    onChange={(e) => setStockReportFilter({ ...stockReportFilter, defaultVendor: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded font-semibold bg-white"
                  >
                    <option value="[Select a Vendor]">[Select a Vendor]</option>
                    <option value="Almarai Food Qatar W.L.L">Almarai Food Qatar W.L.L</option>
                    <option value="Doha Wholesale Trading W.L.L">Doha Wholesale Trading W.L.L</option>
                    <option value="Rayyan Water Company W.L.L">Rayyan Water Company W.L.L</option>
                  </select>
                  <button onClick={() => alert('+ F4 Vendor master lookup')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded border font-bold text-[10px]">
                    + F4
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Vendor Group</label>
                <select
                  value={stockReportFilter.vendorGroup}
                  onChange={(e) => setStockReportFilter({ ...stockReportFilter, vendorGroup: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-semibold bg-white"
                >
                  <option value="[Select a Group]">[Select a Group]</option>
                  <option value="General FMCG">General FMCG</option>
                  <option value="Wholesale Grains">Wholesale Grains</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>
            </div>

            {/* Checkboxes Grid (Matching Image 2) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-[11px] font-bold text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stockReportFilter.showDeptWiseStock}
                  onChange={(e) => setStockReportFilter({ ...stockReportFilter, showDeptWiseStock: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                <span>Show Department Wise Stock</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stockReportFilter.showVariantStock}
                  onChange={(e) => setStockReportFilter({ ...stockReportFilter, showVariantStock: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                <span>Show Varient Stock</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stockReportFilter.includeVanStock}
                  onChange={(e) => setStockReportFilter({ ...stockReportFilter, includeVanStock: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                <span>Include Van Stock</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stockReportFilter.inStockOnly}
                  onChange={(e) => setStockReportFilter({ ...stockReportFilter, inStockOnly: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                <span>InStock Only</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stockReportFilter.negativeStock}
                  onChange={(e) => setStockReportFilter({ ...stockReportFilter, negativeStock: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                <span>Negative Stock</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stockReportFilter.showLastPurchaseDetail}
                  onChange={(e) => setStockReportFilter({ ...stockReportFilter, showLastPurchaseDetail: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                <span>Show Last Purchase Detail</span>
              </label>
            </div>

            {/* Actions Toolbar */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => alert('💾 Layout saved successfully!')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-300"
              >
                Save Layout
              </button>
              <button
                onClick={() => alert(`👁️ Querying stock report for location ${stockReportFilter.location}...`)}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Show</span>
              </button>
              <button
                onClick={() => alert(`🖨️ Printing Stock Ledger Report for ${stockReportFilter.location}`)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Stock Report Data Grid (Matching Image 2 Table) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-800 text-xs">
              Stock Report Data Grid ({stockReportFilter.location})
            </div>
            <div className="overflow-x-auto max-h-[50vh]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Product Code</th>
                    <th className="py-2.5 px-3">Barcode</th>
                    <th className="py-2.5 px-3">Product Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3 text-right">Current Stock</th>
                    <th className="py-2.5 px-3 text-right">Unit Cost</th>
                    <th className="py-2.5 px-3 text-right">Stock Value</th>
                    <th className="py-2.5 px-3">Last Supplier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{p.sku}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{p.barcode}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{p.name}</td>
                      <td className="py-2.5 px-3 text-slate-700">{p.categoryName || 'General'}</td>
                      <td className="py-2.5 px-3 text-slate-700">{stockReportFilter.location}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">{p.stockQuantity || 100} {p.unit}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-800">{formatQAR(p.costPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatQAR((p.costPrice || 0) * (p.stockQuantity || 100))}</td>
                      <td className="py-2.5 px-3 text-slate-600">{p.defaultVendor || 'General'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeView === 'PriceChange' ? (
        <div className="space-y-3 font-sans text-xs">
          {/* PRICE CHANGE SCREEN (Matching Target Image 2) */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-3">
            {/* Top Row Search & Mode Bar */}
            <div className="flex items-center gap-3 flex-wrap justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                <span className="font-bold text-slate-700">Product Search:</span>
                <input
                  type="text"
                  placeholder="Scan or enter product name..."
                  value={priceChangeKeyword}
                  onChange={(e) => setPriceChangeKeyword(e.target.value)}
                  className="flex-1 px-2.5 py-1 border border-slate-300 rounded font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Search By:</span>
                <select
                  value={priceChangeSearchBy}
                  onChange={(e) => setPriceChangeSearchBy(e.target.value as any)}
                  className="px-2.5 py-1 border border-slate-300 rounded font-semibold bg-white text-xs"
                >
                  <option value="Description">Description</option>
                  <option value="Barcode">Barcode</option>
                  <option value="Product Code">Product Code</option>
                  <option value="Department">Department</option>
                </select>
              </div>

              <div className="flex items-center gap-3 font-bold text-slate-700">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="priceSearchMode"
                    checked={priceChangeSearchMode === 'Begin With'}
                    onChange={() => setPriceChangeSearchMode('Begin With')}
                  />
                  <span>Begin With (F4)</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="priceSearchMode"
                    checked={priceChangeSearchMode === 'Contains'}
                    onChange={() => setPriceChangeSearchMode('Contains')}
                  />
                  <span>Contains (F5)</span>
                </label>
              </div>

              <div className="flex items-center gap-3 font-bold text-slate-700 border-l border-slate-300 pl-3">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="priceTypeMode"
                    checked={priceChangePriceType === 'Retail Price'}
                    onChange={() => setPriceChangePriceType('Retail Price')}
                  />
                  <span>Retail Price</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="priceTypeMode"
                    checked={priceChangePriceType === 'Wholesale Price'}
                    onChange={() => setPriceChangePriceType('Wholesale Price')}
                  />
                  <span>Wholesale Price</span>
                </label>
              </div>

              <div className="flex items-center gap-1.5 ml-auto">
                <button onClick={() => alert('All products selected')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded border text-xs">
                  Select All [F6]
                </button>
                <button onClick={() => alert('All products deselected')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded border text-xs">
                  Deselect All [F7]
                </button>
                <button onClick={() => alert('Selection inverted')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded border text-xs">
                  Select Inverse [F8]
                </button>
              </div>
            </div>

            {/* Middle Section: Filters Box + Markup/GP Box + Update Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
              {/* Filters Box */}
              <div className="lg:col-span-5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                <div className="font-bold text-[11px] text-slate-700 uppercase tracking-wide">Filters</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-16 font-semibold text-slate-600">Department</span>
                    <select
                      value={priceChangeDept}
                      onChange={(e) => setPriceChangeDept(e.target.value)}
                      className="flex-1 px-2 py-0.5 border border-slate-300 rounded bg-white"
                    >
                      <option value="ALL">ALL</option>
                      <option value="Fresh Food">Fresh Food</option>
                      <option value="Beverages">Beverages</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-16 font-semibold text-slate-600">Sub Dept.</span>
                    <select
                      value={priceChangeSubDept}
                      onChange={(e) => setPriceChangeSubDept(e.target.value)}
                      className="flex-1 px-2 py-0.5 border border-slate-300 rounded bg-white"
                    >
                      <option value="ALL">ALL</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Juices">Juices</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-16 font-semibold text-slate-600">Brand</span>
                    <select
                      value={priceChangeBrand}
                      onChange={(e) => setPriceChangeBrand(e.target.value)}
                      className="flex-1 px-2 py-0.5 border border-slate-300 rounded bg-white"
                    >
                      <option value="ALL">ALL</option>
                      <option value="Almarai">Almarai</option>
                      <option value="Rayyan">Rayyan</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-16 font-semibold text-slate-600">Vendor</span>
                    <select
                      value={priceChangeVendor}
                      onChange={(e) => setPriceChangeVendor(e.target.value)}
                      className="flex-1 px-2 py-0.5 border border-slate-300 rounded bg-white text-[11px]"
                    >
                      <option value="[Select a Vendor]">[Select a Vendor]</option>
                      <option value="Almarai Food Qatar W.L.L">Almarai Food Qatar W.L.L</option>
                      <option value="Rayyan Water Company">Rayyan Water Company</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Markup / GP Calculation Box */}
              <div className="lg:col-span-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                <div className="font-bold text-[11px] text-slate-700 uppercase tracking-wide">Markup / GP</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-600">Markup %</span>
                    <input
                      type="text"
                      placeholder="e.g. 30.43%"
                      value={priceChangeMarkupPercent}
                      onChange={(e) => setPriceChangeMarkupPercent(e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded font-mono font-bold bg-white text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-600">Gross Profit %</span>
                    <input
                      type="text"
                      placeholder="e.g. 23.33%"
                      value={priceChangeGrossProfitPercent}
                      onChange={(e) => setPriceChangeGrossProfitPercent(e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded font-mono font-bold bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Actions & Show Stock Checkbox */}
              <div className="lg:col-span-3 flex flex-col items-end gap-2">
                <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={priceChangeShowStock}
                    onChange={(e) => setPriceChangeShowStock(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Show Stock</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert('✅ Retail prices updated across selected products!')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow flex items-center gap-1 text-xs"
                  >
                    <span>Update [F3]</span>
                  </button>
                  <button
                    onClick={() => setActiveView('Catalog')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg flex items-center gap-1 text-xs"
                  >
                    <span>Cancel [ESC]</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Warning Message Bar (Matching Image 2 Warning) */}
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 font-medium text-[11px] flex items-center gap-2">
              <span className="font-bold">⚠️</span>
              <span>
                Product with zero cost will become zero price if Markup or GP applied. GP/MarkUp % may have small variation due to final price rounding.
              </span>
            </div>

            {/* Product List Grid (Matching Image 2 Table) */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 border-b border-slate-200">
                Product List
              </div>
              <div className="overflow-x-auto max-h-[50vh]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 font-bold uppercase text-[10px] text-slate-600 sticky top-0 z-10">
                    <tr>
                      <th className="p-2 text-center w-8">Select</th>
                      <th className="p-2 font-mono">Code</th>
                      <th className="p-2">Product Description</th>
                      <th className="p-2 font-mono">Barcode</th>
                      <th className="p-2">Unit</th>
                      <th className="p-2">Department</th>
                      <th className="p-2 font-mono text-center">UOM</th>
                      <th className="p-2 text-right">Cost</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-right">Price Incl Tax</th>
                      <th className="p-2 text-right">MSP</th>
                      <th className="p-2 text-right">GP%</th>
                      <th className="p-2 text-right">Markup%</th>
                      <th className="p-2 text-right">New Price</th>
                      <th className="p-2 text-right font-bold text-emerald-700">New Price Incl Tax</th>
                      <th className="p-2 text-right font-mono">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-amber-50/40">
                        <td className="p-2 text-center">
                          <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                        </td>
                        <td className="p-2 font-mono font-bold text-slate-900">{p.sku}</td>
                        <td className="p-2 font-bold text-slate-900">{p.name}</td>
                        <td className="p-2 font-mono text-slate-600">{p.barcode}</td>
                        <td className="p-2 font-mono">{p.unit}</td>
                        <td className="p-2 text-slate-700">{p.categoryName || 'General'}</td>
                        <td className="p-2 font-mono text-center">1</td>
                        <td className="p-2 text-right font-mono">{formatQAR(p.costPrice)}</td>
                        <td className="p-2 text-right font-mono text-slate-800">{formatQAR(p.retailPrice)}</td>
                        <td className="p-2 text-right font-mono text-slate-800">{formatQAR(p.priceInclTax || p.retailPrice)}</td>
                        <td className="p-2 text-right font-mono">{formatQAR(p.msp || p.retailPrice)}</td>
                        <td className="p-2 text-right font-mono text-emerald-700 font-bold">{p.grossProfitPercent || 23.33}%</td>
                        <td className="p-2 text-right font-mono text-indigo-700 font-bold">{p.markupPercent || 30.43}%</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">{formatQAR(p.retailPrice)}</td>
                        <td className="p-2 text-right font-mono font-black text-emerald-700">{formatQAR(p.priceInclTax || p.retailPrice)}</td>
                        <td className="p-2 text-right font-mono font-bold">{p.stockQuantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
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

      {/* 3. DART POS MASTER PRODUCTS DATA TABLE WITH RIGHT VERTICAL SHORTCUT STRIP (Matching Target Screenshot 100%) */}
      <div className="bg-slate-200 border border-slate-300 rounded-xl overflow-hidden shadow-sm flex">
        {/* Left: Master Table Data Container */}
        <div className="flex-1 overflow-x-auto max-h-[55vh] bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 uppercase font-bold text-[10px] tracking-wider sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="py-2 px-2 border-r border-slate-200">Product Code</th>
                <th className="py-2 px-2 border-r border-slate-200">Product Description</th>
                <th className="py-2 px-2 border-r border-slate-200">Barcode</th>
                <th className="py-2 px-2 border-r border-slate-200">Unit Code</th>
                <th className="py-2 px-2 border-r border-slate-200">Department</th>
                <th className="py-2 px-2 border-r border-slate-200">Sub Department</th>
                <th className="py-2 px-2 border-r border-slate-200">Category</th>
                <th className="py-2 px-2 border-r border-slate-200">Brand</th>
                <th className="py-2 px-2 border-r border-slate-200">Tax Code</th>
                <th className="py-2 px-2 border-r border-slate-200 text-right">Cost</th>
                <th className="py-2 px-2 border-r border-slate-200 text-right">Cost Incl.Tax</th>
                <th className="py-2 px-2 border-r border-slate-200 text-right">Avg Cost</th>
                <th className="py-2 px-2 border-r border-slate-200 text-right">Last Sup. Cost</th>
                <th className="py-2 px-2 border-r border-slate-200 text-right">Price</th>
                <th className="py-2 px-2 border-r border-slate-200 text-right text-emerald-700">Price Incl.Tax</th>
                <th className="py-2 px-2 border-r border-slate-200 text-right">Exp Days</th>
                <th className="py-2 px-2 border-r border-slate-200 text-right">WS Price</th>
                <th className="py-2 px-2 border-r border-slate-200 text-right">WS Price Incl.Tax</th>
                <th className="py-2 px-2 border-r border-slate-200">Vendor Name</th>
                <th className="py-2 px-2 border-r border-slate-200 text-center">Inactive</th>
                <th className="py-2 px-2 border-r border-slate-200 text-right">Markup %</th>
                <th className="py-2 px-2 border-r border-slate-200 text-right">Gross Profit %</th>
                <th className="py-2 px-2">Short Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={23} className="py-8 text-center text-slate-500">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-bold text-sm">No Products Found</p>
                    <p className="text-xs text-slate-400">Click "+ Add Product" to create a new master item.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isSelected = selectedProduct?.id === p.id;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      onDoubleClick={() => handleOpenEditModal(p)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-navy-900 bg-blue-900 text-white font-bold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2 px-2 border-r border-slate-200 font-mono font-bold">{p.sku}</td>
                      <td className="py-2 px-2 border-r border-slate-200 font-bold">{p.name}</td>
                      <td className="py-2 px-2 border-r border-slate-200 font-mono">{p.barcode}</td>
                      <td className="py-2 px-2 border-r border-slate-200 font-mono">{p.unit}</td>
                      <td className="py-2 px-2 border-r border-slate-200">{p.categoryName || 'General'}</td>
                      <td className="py-2 px-2 border-r border-slate-200 text-slate-500">{p.subDepartment || 'GSFDGVFF'}</td>
                      <td className="py-2 px-2 border-r border-slate-200">{p.categoryName}</td>
                      <td className="py-2 px-2 border-r border-slate-200">{p.brandName || 'Mango'}</td>
                      <td className="py-2 px-2 border-r border-slate-200 font-bold">{p.vatRate === 0 ? 'SR' : 'VAT'}</td>
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono">{formatQAR(p.costPrice)}</td>
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono">{formatQAR(p.costInclTax || p.costPrice)}</td>
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono">{formatQAR(p.avgCost || p.costPrice)}</td>
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono">{formatQAR(p.lastSupplierCost || p.costPrice)}</td>
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono font-bold">{formatQAR(p.retailPrice)}</td>
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono font-bold text-emerald-600">{formatQAR(p.priceInclTax || p.retailPrice)}</td>
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono">{p.expDays || 0}</td>
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono">{formatQAR(p.wsPrice || p.retailPrice * 0.9)}</td>
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono">{formatQAR(p.wsPriceInclTax || p.retailPrice * 0.9)}</td>
                      <td className="py-2 px-2 border-r border-slate-200">{p.defaultVendor || 'General'}</td>
                      <td className="py-2 px-2 border-r border-slate-200 text-center">
                        <input type="checkbox" checked={!p.isActive} readOnly className="rounded text-rose-600" />
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono font-bold">{p.markupPercent || 30.43}%</td>
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono font-bold">{p.grossProfitPercent || 23.08}%</td>
                      <td className="py-2 px-2 font-mono font-bold">{p.shortDescription || 'xcvb'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Right Vertical Action Shortcut Strip (Matching Target DART POS Screenshot 100%) */}
        <div className="w-11 bg-slate-300 border-l border-slate-400 p-1 flex flex-col items-center gap-2 shrink-0 select-none shadow-inner justify-start pt-2">
          {/* Button 1: Add Product (Green Plus Circle - Ctrl+A) */}
          <button
            onClick={handleOpenAddModal}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs group transition-all"
            title="Add Product (Ctrl + A)"
          >
            <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs leading-none shadow-2xs">
              +
            </div>
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+A</span>
          </button>

          {/* Button 2: Edit Product (Pencil Icon - Ctrl+E) */}
          <button
            onClick={() => {
              if (!selectedProduct) {
                alert('Please select a product first to edit.');
                return;
              }
              handleOpenEditModal(selectedProduct);
            }}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Edit Selected Product (Ctrl + E)"
          >
            <Edit className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+E</span>
          </button>

          {/* Button 3: Delete Product (Red Cross Icon - Ctrl+D) */}
          <button
            onClick={() => {
              if (!selectedProduct) {
                alert('Please select a product first to delete.');
                return;
              }
              handleDeleteProduct(selectedProduct.id);
            }}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Delete Selected Product (Ctrl + D)"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+D</span>
          </button>

          {/* Button 4: Refresh List (Blue Circular Arrow Icon - Ctrl+R) */}
          <button
            onClick={loadProducts}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Refresh List (Ctrl + R)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+R</span>
          </button>

          {/* Button 5: Search / Print (Magnifying Glass Icon - Ctrl+P) */}
          <button
            onClick={() => setIsQuickPrintModalOpen(true)}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Search / Print Product (Ctrl + P)"
          >
            <Search className="w-3.5 h-3.5 text-slate-700" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+P</span>
          </button>
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
                value={bottomWasPrice}
                onChange={(e) => setBottomWasPrice(e.target.value)}
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono font-bold text-amber-700"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-1">
            <button
              onClick={() => alert(`🖨️ Thermal Shelf Label Printed! (Was Price: QAR ${bottomWasPrice})`)}
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
    </>
  )}

      {/* 5. DART POS COMPREHENSIVE NEW/EDIT PRODUCT MODAL (Matching Screenshot media_1787034154403.png 100%) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 overflow-y-auto">
          <div className="bg-slate-100 rounded-xl shadow-2xl border border-slate-300 w-full max-w-7xl overflow-hidden my-4 text-xs font-sans select-none">
            {/* WINDOW TITLE BAR */}
            <div className="bg-slate-200 border-b border-slate-300 px-4 py-2 flex items-center justify-between text-slate-800 font-bold shadow-xs">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold">
                  {editingProduct ? `Edit Product: ${formData.name || editingProduct.sku}` : 'New Product'} - DART POS
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 font-bold px-2 py-0.5 rounded"
              >
                ✕
              </button>
            </div>

            {/* TOP SUB-RIBBON ACTION TOOLBAR */}
            <div className="bg-slate-200 border-b border-slate-300 px-3 py-1.5 flex items-center justify-between shadow-inner">
              {/* Left Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSaveProduct}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-white text-slate-800 font-bold text-xs rounded border border-slate-400 shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5 text-blue-600" />
                  <span>Save (Ctrl+S)</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    handleSaveProduct(e);
                    handleOpenAddModal();
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-white text-slate-800 font-bold text-xs rounded border border-slate-400 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Save & New (Ctrl+N)</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    handleSaveProduct(e);
                    setIsAddModalOpen(false);
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-white text-slate-800 font-bold text-xs rounded border border-slate-400 shadow-2xs"
                >
                  <X className="w-3.5 h-3.5 text-rose-600" />
                  <span>Save & Close (Ctrl+L)</span>
                </button>
              </div>

              {/* Right Action Tools */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => alert('📊 Stock Movement history opened.')}
                  className="flex items-center gap-1 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded font-bold text-xs shadow-2xs"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                  <span>Stock Movement</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert('🛒 Purchase History opened (F11)')}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-white text-slate-800 font-bold text-xs rounded border border-slate-400 shadow-2xs"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-sky-600" />
                  <span>Purchase History-F11</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal()}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-white text-slate-800 font-bold text-xs rounded border border-slate-400 shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Reset Fields-F5</span>
                </button>
              </div>
            </div>

            {/* FORM BODY GRID (2 Main Columns: Left 5 Cols, Right 7 Cols) */}
            <form onSubmit={handleSaveProduct} className="p-3 space-y-3 max-h-[82vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                
                {/* ================= LEFT COLUMN ================= */}
                <div className="lg:col-span-5 space-y-3">
                  
                  {/* 1. GENERAL PANEL */}
                  <div className="bg-slate-200 border border-slate-300 rounded-lg p-2.5 space-y-2 shadow-xs">
                    <div className="bg-slate-300 px-2 py-0.5 font-bold text-slate-800 text-[11px] border-b border-slate-400 -mx-2.5 -mt-2.5 mb-2 rounded-t-lg">
                      General
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="w-32 font-bold text-slate-700">Code</label>
                      <input
                        type="text"
                        value={formData.sku || ''}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-28 px-2 py-1 border border-slate-400 rounded font-mono font-bold bg-white"
                        required
                      />
                      <button type="button" className="px-2 py-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded font-bold text-[10px] text-blue-800">
                        F4 Refno
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="w-32 font-bold text-slate-700">Product Name</label>
                      <input
                        type="text"
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
                        className="flex-1 px-2 py-1 border border-slate-400 rounded font-bold bg-white"
                        required
                      />
                      <span className="text-slate-500 cursor-pointer">📁</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="w-32 font-bold text-slate-700">Local Description</label>
                      <input
                        type="text"
                        value={formData.nameAr || formData.localDescription || ''}
                        onChange={(e) => setFormData({ ...formData, nameAr: e.target.value, localDescription: e.target.value })}
                        className="flex-1 px-2 py-1 border border-slate-400 rounded font-arabic bg-white"
                        dir="rtl"
                      />
                      <button type="button" className="px-1.5 py-0.5 bg-slate-300 border border-slate-400 rounded font-bold text-[10px]">F4</button>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="w-32 font-bold text-slate-700">Short Description</label>
                      <input
                        type="text"
                        value={formData.shortDescription || ''}
                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                        className="flex-1 px-2 py-1 border border-slate-400 rounded font-mono bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="w-32 font-bold text-slate-700">Barcode</label>
                      <input
                        type="text"
                        value={formData.barcode || ''}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        className="flex-1 px-2 py-1 border border-slate-400 rounded font-mono bg-white"
                        required
                      />
                      <button type="button" className="px-1.5 py-0.5 bg-slate-300 border border-slate-400 rounded font-bold text-[10px]">F4</button>
                      <Barcode className="w-4 h-4 text-slate-600" />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="w-32 font-bold text-slate-700">Units</label>
                      <select
                        value={formData.unit || 'Pcs'}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="flex-1 px-2 py-1 border border-slate-400 rounded font-semibold bg-white"
                      >
                        <option value="Pcs">Pcs</option>
                        <option value="Box">Box</option>
                        <option value="Kg">Kg</option>
                        <option value="Pack">Pack</option>
                        <option value="apple">apple</option>
                      </select>
                      <button type="button" className="px-1.5 py-0.5 bg-slate-300 border border-slate-400 rounded font-bold text-[10px] text-emerald-800">⊕ F4</button>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="w-32 font-bold text-slate-700">Default Vendor</label>
                      <select
                        value={formData.defaultVendor || 'Almarai Food Qatar W.L.L'}
                        onChange={(e) => setFormData({ ...formData, defaultVendor: e.target.value })}
                        className="flex-1 px-2 py-1 border border-slate-400 rounded font-semibold bg-white"
                      >
                        <option value="Almarai Food Qatar W.L.L">Almarai Food Qatar W.L.L</option>
                        <option value="Doha Wholesale Trading W.L.L">Doha Wholesale Trading W.L.L</option>
                        <option value="Rayyan Water Company W.L.L">Rayyan Water Company W.L.L</option>
                        <option value="aaa">aaa</option>
                      </select>
                      <button type="button" className="px-1.5 py-0.5 bg-slate-300 border border-slate-400 rounded font-bold text-[10px] text-emerald-800">⊕ F4</button>
                    </div>

                    <div className="flex items-start gap-2">
                      <label className="w-32 font-bold text-slate-700 pt-1">Description</label>
                      <textarea
                        rows={2}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="flex-1 px-2 py-1 border border-slate-400 rounded bg-white text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="w-32 font-bold text-slate-700">Additional Description</label>
                      <input
                        type="text"
                        value={formData.additionalDescription || ''}
                        onChange={(e) => setFormData({ ...formData, additionalDescription: e.target.value })}
                        className="flex-1 px-2 py-1 border border-slate-400 rounded bg-white"
                      />
                    </div>
                  </div>

                  {/* 2. CLASSIFICATIONS & PROPERTIES TABS */}
                  <div className="bg-slate-200 border border-slate-300 rounded-lg p-2 space-y-2 shadow-xs">
                    <div className="flex items-center gap-1 border-b border-slate-300 pb-1">
                      <button
                        type="button"
                        onClick={() => setActiveClassTab('Classifications')}
                        className={`px-3 py-1 rounded-t font-bold text-xs ${
                          activeClassTab === 'Classifications'
                            ? 'bg-white border-t-2 border-emerald-600 text-slate-900 shadow-2xs'
                            : 'bg-slate-300 text-slate-600 hover:bg-slate-300/80'
                        }`}
                      >
                        Classifications
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveClassTab('Properties')}
                        className={`px-3 py-1 rounded-t font-bold text-xs ${
                          activeClassTab === 'Properties'
                            ? 'bg-white border-t-2 border-emerald-600 text-slate-900 shadow-2xs'
                            : 'bg-slate-300 text-slate-600 hover:bg-slate-300/80'
                        }`}
                      >
                        Properties
                      </button>
                    </div>

                    {activeClassTab === 'Classifications' && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-2">
                          <label className="w-28 font-bold text-slate-700">Brand</label>
                          <select
                            value={formData.brandName || 'Almarai'}
                            onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                            className="flex-1 px-2 py-1 border border-slate-400 rounded font-semibold bg-white"
                          >
                            <option value="Almarai">Almarai</option>
                            <option value="Khabari">Khabari</option>
                            <option value="Rayyan">Rayyan</option>
                            <option value="APPLE">APPLE</option>
                          </select>
                          <button type="button" className="px-1.5 py-0.5 bg-slate-300 border border-slate-400 rounded font-bold text-[10px] text-emerald-800">⊕ F4</button>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="w-28 font-bold text-slate-700">Department</label>
                          <select
                            value={formData.categoryName || 'Dairy & Eggs'}
                            onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                            className="flex-1 px-2 py-1 border border-slate-400 rounded font-semibold bg-white"
                          >
                            {categoriesList.map((c) => (
                              <option key={c.name} value={c.name}>{c.name}</option>
                            ))}
                            <option value="GSDUYGYG">GSDUYGYG</option>
                          </select>
                          <button type="button" className="px-1.5 py-0.5 bg-slate-300 border border-slate-400 rounded font-bold text-[10px] text-emerald-800">⊕ F4</button>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="w-28 font-bold text-slate-700">Sub Department</label>
                          <input
                            type="text"
                            value={formData.subDepartment || 'GSFDGVFF'}
                            onChange={(e) => setFormData({ ...formData, subDepartment: e.target.value })}
                            className="flex-1 px-2 py-1 border border-slate-400 rounded font-mono bg-white"
                          />
                          <button type="button" className="px-1.5 py-0.5 bg-slate-300 border border-slate-400 rounded font-bold text-[10px] text-emerald-800">⊕ F4</button>
                        </div>
                      </div>
                    )}

                    {activeClassTab === 'Properties' && (
                      <div className="p-2 bg-white border border-slate-300 rounded text-slate-600 text-xs">
                        Product Custom Master Attributes & ERP Field Properties
                      </div>
                    )}
                  </div>

                  {/* 3. OPTIONS / ADD. FEATURES / RE ORDER / ACCOUNTS TABS */}
                  <div className="bg-slate-200 border border-slate-300 rounded-lg p-2 space-y-2 shadow-xs">
                    <div className="flex items-center gap-1 border-b border-slate-300 pb-1 overflow-x-auto">
                      {(['Options', 'Add. Features', 'Re Order', 'Accounts'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveOptionsTab(tab)}
                          className={`px-2.5 py-0.5 rounded-t font-bold text-[11px] whitespace-nowrap ${
                            activeOptionsTab === tab
                              ? 'bg-white border-t-2 border-emerald-600 text-slate-900 shadow-2xs'
                              : 'bg-slate-300 text-slate-600 hover:bg-slate-300/80'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {activeOptionsTab === 'Options' && (
                      <div className="space-y-2 pt-1">
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                            <input
                              type="checkbox"
                              checked={formData.weighingProductType !== 'None'}
                              onChange={(e) => setFormData({ ...formData, weighingProductType: e.target.checked ? 'Amount In Barcode' : 'None' })}
                            />
                            <span>Weighing Product</span>
                          </label>
                          <select
                            value={formData.weighingProductType || 'Amount In Barcode'}
                            onChange={(e) => setFormData({ ...formData, weighingProductType: e.target.value as any })}
                            className="px-2 py-0.5 border border-slate-400 rounded bg-white text-xs"
                          >
                            <option value="Amount In Barcode">Amount In Barcode</option>
                            <option value="Weight In Barcode">Weight In Barcode</option>
                            <option value="Quantity In Barcode">Quantity In Barcode</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                            <input
                              type="checkbox"
                              checked={formData.isActive === false}
                              onChange={(e) => setFormData({ ...formData, isActive: !e.target.checked })}
                              className="rounded text-rose-600"
                            />
                            <span>Inactive (For Sale)</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                            <input
                              type="checkbox"
                              checked={formData.nonInventory || false}
                              onChange={(e) => setFormData({ ...formData, nonInventory: e.target.checked })}
                              className="rounded text-emerald-600"
                            />
                            <span>Non Inventory Product</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div></div>
                          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                            <input
                              type="checkbox"
                              checked={formData.autoProductionWhileSale || false}
                              onChange={(e) => setFormData({ ...formData, autoProductionWhileSale: e.target.checked })}
                            />
                            <span>Auto Production While Sale</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-300">
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">Procurement Type</span>
                            <select
                              value={formData.procurementType || 'Normal Purchase'}
                              onChange={(e) => setFormData({ ...formData, procurementType: e.target.value as any })}
                              className="w-full px-2 py-0.5 border border-slate-400 rounded bg-white"
                            >
                              <option value="Normal Purchase">Normal Purchase</option>
                              <option value="Consignment">Consignment</option>
                              <option value="Internal Production">Internal Production</option>
                            </select>
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">Division Factor</span>
                            <input
                              type="number"
                              step="0.001"
                              value={formData.divisionFactor ?? 1.000}
                              onChange={(e) => setFormData({ ...formData, divisionFactor: parseFloat(e.target.value) || 1.0 })}
                              className="w-full px-2 py-0.5 border border-slate-400 rounded bg-white font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeOptionsTab !== 'Options' && (
                      <div className="p-2 bg-white border border-slate-300 rounded text-slate-600 text-xs">
                        Advanced ERP Settings: {activeOptionsTab} configuration matrix
                      </div>
                    )}
                  </div>
                </div>

                {/* ================= RIGHT COLUMN ================= */}
                <div className="lg:col-span-7 space-y-3">
                  
                  {/* 1. COST, TAX AND PRICING CARD */}
                  <div className="bg-slate-200 border border-slate-300 rounded-lg p-2.5 space-y-2 shadow-xs">
                    <div className="bg-slate-300 px-2 py-0.5 font-bold text-slate-800 text-[11px] border-b border-slate-400 -mx-2.5 -mt-2.5 mb-2 rounded-t-lg flex items-center justify-between">
                      <span>Cost, Tax and Pricing</span>
                    </div>

                    <div className="flex items-center gap-1 border-b border-slate-300 pb-1">
                      <button
                        type="button"
                        onClick={() => setActiveCostingSubTab('Costing & Pricing')}
                        className={`px-3 py-0.5 rounded-t font-bold text-xs ${
                          activeCostingSubTab === 'Costing & Pricing'
                            ? 'bg-white border-t-2 border-emerald-600 text-slate-900 shadow-2xs'
                            : 'bg-slate-300 text-slate-600 hover:bg-slate-300/80'
                        }`}
                      >
                        💲 Costing & Pricing
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCostingSubTab('Barcode Printing')}
                        className={`px-3 py-0.5 rounded-t font-bold text-xs ${
                          activeCostingSubTab === 'Barcode Printing'
                            ? 'bg-white border-t-2 border-emerald-600 text-slate-900 shadow-2xs'
                            : 'bg-slate-300 text-slate-600 hover:bg-slate-300/80'
                        }`}
                      >
                        📊 Barcode Printing
                      </button>
                    </div>

                    {activeCostingSubTab === 'Costing & Pricing' && (
                      <div className="space-y-3 pt-1">
                        {/* COSTING ROW */}
                        <div className="grid grid-cols-7 gap-1.5 text-xs bg-white p-2 rounded border border-slate-300">
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">Cost <span className="text-emerald-700 font-mono">F10</span></span>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.costPrice ?? 0.00}
                              onChange={(e) => updatePricingCalculations('costPrice', parseFloat(e.target.value) || 0)}
                              className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono font-bold"
                            />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">Cost Incl.</span>
                            <input
                              type="number"
                              readOnly
                              value={formData.costInclTax ?? formData.costPrice ?? 0.00}
                              className="w-full px-1.5 py-0.5 border border-slate-200 rounded font-mono bg-slate-100 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">Lnd. Cost</span>
                            <input
                              type="text"
                              value={`${(formData.landedCost ?? 0.00).toFixed(6)}X`}
                              onChange={(e) => setFormData({ ...formData, landedCost: parseFloat(e.target.value) || 0 })}
                              className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono text-[10px]"
                            />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">Costing Method ℹ️</span>
                            <select
                              value={formData.costingMethod || 'Purchase Cost'}
                              onChange={(e) => setFormData({ ...formData, costingMethod: e.target.value as any })}
                              className="w-full px-1 py-0.5 border border-slate-300 rounded text-[10px] font-semibold"
                            >
                              <option value="Purchase Cost">Purchase Cost</option>
                              <option value="Weighted Average">Weighted Average</option>
                              <option value="FIFO">FIFO</option>
                            </select>
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">Gross</span>
                            <input type="number" readOnly value="0.00" className="w-full px-1.5 py-0.5 border border-slate-200 rounded font-mono bg-slate-100" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">Avg</span>
                            <input type="text" readOnly value="0.000000..." className="w-full px-1 py-0.5 border border-slate-200 rounded font-mono text-[9px] bg-slate-100" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">First Cost <span className="text-slate-500 font-mono">F8</span></span>
                            <input type="number" readOnly value="0.00" className="w-full px-1.5 py-0.5 border border-slate-200 rounded font-mono bg-slate-100" />
                          </div>
                        </div>

                        {/* TAXES ROW */}
                        <div className="bg-white p-2 rounded border border-slate-300 space-y-1">
                          <span className="block font-bold text-emerald-800 text-[10px]">💲 Taxes</span>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-20 font-bold text-slate-700">Sale Tax 1</span>
                              <select
                                value={formData.vatRate || 0.15}
                                onChange={(e) => setFormData({ ...formData, vatRate: parseFloat(e.target.value) || 0 })}
                                className="flex-1 px-2 py-0.5 border border-slate-300 rounded font-semibold text-xs"
                              >
                                <option value={0.15}>STANDARD RATE 15% VAT</option>
                                <option value={0.00}>STANDARD RATE 0% (Zero VAT)</option>
                              </select>
                              <span className="font-mono text-slate-600 font-bold">Tax 1 %</span>
                              <input type="text" readOnly value="15.00%" className="w-16 px-1.5 py-0.5 border border-slate-200 rounded font-mono text-center bg-slate-100 font-bold text-emerald-700" />
                              <button type="button" className="px-1 py-0.5 bg-slate-200 border border-slate-300 rounded font-bold text-[10px]">⊕ F4</button>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="w-24 font-bold text-slate-700">Purchase Tax</span>
                              <select
                                value={formData.purchaseTaxRate || 0.15}
                                onChange={(e) => setFormData({ ...formData, purchaseTaxRate: parseFloat(e.target.value) || 0 })}
                                className="flex-1 px-2 py-0.5 border border-slate-300 rounded font-semibold text-xs"
                              >
                                <option value={0.15}>STANDARD RATE 15% VAT</option>
                                <option value={0.00}>STANDARD RATE 0% (Zero VAT)</option>
                              </select>
                              <span className="font-mono text-slate-600 font-bold">Tax %</span>
                              <input type="text" readOnly value="15.00%" className="w-16 px-1.5 py-0.5 border border-slate-200 rounded font-mono text-center bg-slate-100 font-bold text-emerald-700" />
                            </div>
                          </div>
                        </div>

                        {/* RETAIL & WHOLESALE PRICING MATRIX */}
                        <div className="bg-white p-2 rounded border border-slate-300 space-y-2">
                          {/* Retail Row */}
                          <div className="grid grid-cols-7 gap-1.5 text-xs">
                            <div>
                              <span className="block font-bold text-slate-700 text-[10px]">Price</span>
                              <input
                                type="number"
                                step="0.01"
                                value={formData.retailPrice ?? 0.00}
                                onChange={(e) => updatePricingCalculations('retailPrice', parseFloat(e.target.value) || 0)}
                                className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono font-bold"
                              />
                            </div>
                            <div>
                              <span className="block font-bold text-slate-700 text-[10px]">Markup</span>
                              <input
                                type="number"
                                step="0.1"
                                value={formData.markupPercent ?? 0.00}
                                onChange={(e) => updatePricingCalculations('markupPercent', parseFloat(e.target.value) || 0)}
                                className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono"
                              />
                            </div>
                            <div>
                              <span className="block font-bold text-slate-700 text-[10px]">GP %</span>
                              <input
                                type="number"
                                step="0.1"
                                value={formData.grossProfitPercent ?? 0.00}
                                onChange={(e) => updatePricingCalculations('grossProfitPercent', parseFloat(e.target.value) || 0)}
                                className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono"
                              />
                            </div>
                            <div>
                              <span className="block font-bold text-slate-700 text-[10px]">Price Incl Tax</span>
                              <input
                                type="number"
                                readOnly
                                value={formData.priceInclTax ?? 0.00}
                                className="w-full px-1.5 py-0.5 border border-slate-200 rounded font-mono font-bold text-emerald-700 bg-slate-100"
                              />
                            </div>
                            <div>
                              <span className="block font-bold text-slate-700 text-[10px]">MSP</span>
                              <input
                                type="number"
                                step="0.01"
                                value={formData.msp ?? 0.00}
                                onChange={(e) => setFormData({ ...formData, msp: parseFloat(e.target.value) || 0 })}
                                className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono"
                              />
                            </div>
                            <div>
                              <span className="block font-bold text-slate-700 text-[10px]">Was Price</span>
                              <input
                                type="number"
                                step="0.01"
                                value={formData.wasPrice ?? 0.00}
                                onChange={(e) => setFormData({ ...formData, wasPrice: parseFloat(e.target.value) || 0 })}
                                className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono text-amber-700 font-bold"
                              />
                            </div>
                            <div className="flex items-center pt-3">
                              <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-700 text-[10px]">
                                <input
                                  type="checkbox"
                                  checked={formData.openPrice || false}
                                  onChange={(e) => setFormData({ ...formData, openPrice: e.target.checked })}
                                />
                                <span>Open Price</span>
                              </label>
                            </div>
                          </div>

                          {/* Wholesale Row */}
                          <div className="pt-2 border-t border-slate-200">
                            <span className="block font-bold text-slate-700 text-[10px] mb-1">Wholesale Pricing</span>
                            <div className="grid grid-cols-5 gap-2 text-xs">
                              <div>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={formData.wsPrice ?? 0.00}
                                  onChange={(e) => setFormData({ ...formData, wsPrice: parseFloat(e.target.value) || 0 })}
                                  className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono font-bold"
                                />
                              </div>
                              <div>
                                <input
                                  type="number"
                                  value={formData.wsMarkupPercent ?? 0.00}
                                  onChange={(e) => setFormData({ ...formData, wsMarkupPercent: parseFloat(e.target.value) || 0 })}
                                  className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono"
                                />
                              </div>
                              <div>
                                <input
                                  type="number"
                                  value={formData.wsGrossProfitPercent ?? 0.00}
                                  onChange={(e) => setFormData({ ...formData, wsGrossProfitPercent: parseFloat(e.target.value) || 0 })}
                                  className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono"
                                />
                              </div>
                              <div>
                                <input
                                  type="number"
                                  value={formData.wsPriceInclTax ?? 0.00}
                                  onChange={(e) => setFormData({ ...formData, wsPriceInclTax: parseFloat(e.target.value) || 0 })}
                                  className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono font-bold text-emerald-600"
                                />
                              </div>
                              <div>
                                <input
                                  type="number"
                                  value={formData.wsMsp ?? 0.00}
                                  onChange={(e) => setFormData({ ...formData, wsMsp: parseFloat(e.target.value) || 0 })}
                                  className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeCostingSubTab === 'Barcode Printing' && (
                      <div className="p-3 bg-white border border-slate-300 rounded text-slate-600 text-xs">
                        Barcode label printing template settings & barcode scale parameters.
                      </div>
                    )}
                  </div>

                  {/* 2. PACKINGS & STOCK LINK CARD */}
                  <div className="bg-slate-200 border border-slate-300 rounded-lg p-2.5 space-y-2 shadow-xs">
                    <div className="flex items-center gap-1 border-b border-slate-300 pb-1">
                      <button
                        type="button"
                        onClick={() => setActivePackingsSubTab('Packings')}
                        className={`px-3 py-0.5 rounded-t font-bold text-xs ${
                          activePackingsSubTab === 'Packings'
                            ? 'bg-white border-t-2 border-emerald-600 text-slate-900 shadow-2xs'
                            : 'bg-slate-300 text-slate-600 hover:bg-slate-300/80'
                        }`}
                      >
                        📦 Packings
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePackingsSubTab('Stock link')}
                        className={`px-3 py-0.5 rounded-t font-bold text-xs ${
                          activePackingsSubTab === 'Stock link'
                            ? 'bg-white border-t-2 border-emerald-600 text-slate-900 shadow-2xs'
                            : 'bg-slate-300 text-slate-600 hover:bg-slate-300/80'
                        }`}
                      >
                        🔗 Stock link
                      </button>
                    </div>

                    {activePackingsSubTab === 'Packings' && (
                      <div className="space-y-2 pt-1">
                        {/* Sub-Form Row 1 */}
                        <div className="flex items-center justify-between gap-2 bg-white p-2 rounded border border-slate-300">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="font-bold text-slate-700 text-[11px]">Barcode</span>
                            <input type="text" className="w-28 px-1.5 py-0.5 border border-slate-300 rounded font-mono" />
                            <Barcode className="w-4 h-4 text-slate-600" />

                            <span className="font-bold text-slate-700 text-[11px] ml-2">Units</span>
                            <select className="w-20 px-1 py-0.5 border border-slate-300 rounded text-xs">
                              <option>Unit</option>
                              <option>Box</option>
                              <option>Carton</option>
                            </select>

                            <span className="font-bold text-slate-700 text-[11px] ml-2">Pack Qty</span>
                            <input type="text" className="w-16 px-1.5 py-0.5 border border-slate-300 rounded font-mono" />

                            <span className="font-bold text-slate-700 text-[11px] ml-2">Cost</span>
                            <input type="text" className="w-20 px-1.5 py-0.5 border border-slate-300 rounded font-mono" />
                          </div>

                          <div className="flex items-center gap-1">
                            <button type="button" className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-bold text-[10px]">✏️ Edit</button>
                            <button type="button" className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-bold text-[10px] text-rose-700">❌ Delete</button>
                            <button type="button" className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-bold text-[10px] text-blue-800">📦 Raw Mater.</button>
                            <button type="button" onClick={handleAddPackingRow} className="px-3 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded font-bold text-[10px] text-emerald-800">➕ Add (F9)</button>
                          </div>
                        </div>

                        {/* Sub-Form Row 2 */}
                        <div className="grid grid-cols-6 gap-2 bg-white p-2 rounded border border-slate-300 text-xs">
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">Price</span>
                            <input type="text" defaultValue="0.0000" className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">Price Incl Tax</span>
                            <input type="text" defaultValue="0.00" className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono font-bold text-emerald-700" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">MSP</span>
                            <input type="text" className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">Product Name</span>
                            <input type="text" placeholder="eg: 1 X 12" className="w-full px-1.5 py-0.5 border border-slate-300 rounded" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">Add.Description</span>
                            <input type="text" className="w-full px-1.5 py-0.5 border border-slate-300 rounded" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[10px]">Was Price</span>
                            <input type="text" className="w-full px-1.5 py-0.5 border border-slate-300 rounded font-mono text-amber-700" />
                          </div>
                        </div>

                        {/* Sub-Form Row 3 */}
                        <div className="grid grid-cols-8 gap-1.5 bg-white p-2 rounded border border-slate-300 text-xs items-center">
                          <div>
                            <span className="block font-bold text-slate-700 text-[9px]">WS. Price</span>
                            <input type="text" defaultValue="0.0000" className="w-full px-1 py-0.5 border border-slate-300 rounded font-mono" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[9px]">WS P Tax</span>
                            <input type="text" defaultValue="0.00" className="w-full px-1 py-0.5 border border-slate-300 rounded font-mono" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[9px]">MSP</span>
                            <input type="text" className="w-full px-1 py-0.5 border border-slate-300 rounded font-mono" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[9px]">Mark Up</span>
                            <input type="text" defaultValue="0.00" className="w-full px-1 py-0.5 border border-slate-300 rounded font-mono" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 text-[9px]">GP %</span>
                            <input type="text" defaultValue="0.00" className="w-full px-1 py-0.5 border border-slate-300 rounded font-mono" />
                          </div>
                          <div className="col-span-3 flex items-center gap-3 pt-3">
                            <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800 text-[10px]">
                              <input type="checkbox" defaultChecked />
                              <span>Is Ecomm. Product</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800 text-[10px]">
                              <input type="checkbox" />
                              <span>Stock Unit</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800 text-[10px]">
                              <input type="checkbox" />
                              <span>Weighing</span>
                            </label>
                          </div>
                        </div>

                        {/* Packings Grid Table */}
                        <div className="overflow-x-auto bg-white rounded border border-slate-300 max-h-36">
                          <table className="w-full text-left text-[10px] border-collapse font-mono">
                            <thead className="bg-slate-100 font-bold uppercase text-slate-700 sticky top-0 border-b border-slate-300">
                              <tr>
                                <th className="p-1 border-r border-slate-200">Barcode</th>
                                <th className="p-1 border-r border-slate-200">Pack Qty</th>
                                <th className="p-1 border-r border-slate-200">Price</th>
                                <th className="p-1 border-r border-slate-200">Price Ind Tax</th>
                                <th className="p-1 border-r border-slate-200">Unit Code</th>
                                <th className="p-1 border-r border-slate-200">Pack Description</th>
                                <th className="p-1 border-r border-slate-200">MSP</th>
                                <th className="p-1 border-r border-slate-200">WS Price Ind Tax</th>
                                <th className="p-1 border-r border-slate-200">WS Price</th>
                                <th className="p-1 border-r border-slate-200">WSMSP</th>
                                <th className="p-1 border-r border-slate-200">Was Price</th>
                                <th className="p-1">Cost</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {packingsList.length === 0 ? (
                                <tr>
                                  <td colSpan={12} className="p-4 text-center text-slate-400 italic">
                                    No packings mapped. Fill row above and click "➕ Add (F9)"
                                  </td>
                                </tr>
                              ) : (
                                packingsList.map((pack, idx) => (
                                  <tr key={pack.id} className="hover:bg-slate-50">
                                    <td className="p-1 border-r border-slate-200 font-bold text-slate-800">{pack.barcode}</td>
                                    <td className="p-1 border-r border-slate-200 text-center font-bold">{pack.packQty}</td>
                                    <td className="p-1 border-r border-slate-200 text-right">{pack.price.toFixed(2)}</td>
                                    <td className="p-1 border-r border-slate-200 text-right font-bold text-emerald-700">{pack.priceInclTax.toFixed(2)}</td>
                                    <td className="p-1 border-r border-slate-200 font-sans">{pack.unit}</td>
                                    <td className="p-1 border-r border-slate-200 font-sans">{pack.unit} Pack</td>
                                    <td className="p-1 border-r border-slate-200 text-right">0.00</td>
                                    <td className="p-1 border-r border-slate-200 text-right">0.00</td>
                                    <td className="p-1 border-r border-slate-200 text-right">0.00</td>
                                    <td className="p-1 border-r border-slate-200 text-right">0.00</td>
                                    <td className="p-1 border-r border-slate-200 text-right text-amber-700">0.00</td>
                                    <td className="p-1 text-right">{pack.cost.toFixed(2)}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {activePackingsSubTab === 'Stock link' && (
                      <div className="p-3 bg-white border border-slate-300 rounded text-slate-600 text-xs">
                        Stock link and branch warehouse allocation mapping.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. GENERATE SCALE FILES MODAL (Matching Image 3) */}
      {isScaleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden font-sans">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold">Generate Scale Files - DART POS</h2>
              </div>
              <button onClick={() => setIsScaleModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              {/* Inner Action Bar (Matching Image 3) */}
              <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg border border-slate-200">
                <button
                  onClick={() => alert('✏️ Edit PLU scale file settings opened')}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded border border-slate-300"
                >
                  Edit PLU File
                </button>
                <button
                  onClick={() => alert('⚡ Scale PLU file generated for selected scales!')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded"
                >
                  Generate For Selected
                </button>
                <button
                  onClick={() => alert('🚀 Scale PLU files generated for all weighing scales!')}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-sm"
                >
                  Generate For All
                </button>
              </div>

              {/* Data Table */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-3 py-2 font-bold border-b border-slate-200 text-slate-700">Files</div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-600">
                    <tr>
                      <th className="p-2 text-center w-12">Select</th>
                      <th className="p-2">Description</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {scaleFilesList.map((file, idx) => (
                      <tr key={file.id} className="hover:bg-slate-50">
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={file.select}
                            onChange={(e) => {
                              const updated = [...scaleFilesList];
                              updated[idx].select = e.target.checked;
                              setScaleFilesList(updated);
                            }}
                            className="rounded text-emerald-600"
                          />
                        </td>
                        <td className="p-2 font-bold text-slate-900">{file.description}</td>
                        <td className="p-2 font-mono font-semibold text-emerald-700">{file.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end">
                <button onClick={() => setIsScaleModalOpen(false)} className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. LOGS & AUDIT MODAL (Matching Image 4) */}
      {isLogsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden font-sans">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold">Logs - DART POS</h2>
              </div>
              <button onClick={() => setIsLogsModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              {/* Filters Header (Matching Image 4) */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1">
                  Filters
                </h3>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-700 text-[11px]">From Date:</span>
                    <input
                      type="datetime-local"
                      value={logsFromDate}
                      onChange={(e) => setLogsFromDate(e.target.value)}
                      className="px-2 py-1 border border-slate-300 rounded font-mono text-[11px] bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-700 text-[11px]">To Date:</span>
                    <input
                      type="datetime-local"
                      value={logsToDate}
                      onChange={(e) => setLogsToDate(e.target.value)}
                      className="px-2 py-1 border border-slate-300 rounded font-mono text-[11px] bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="logsRadioMode"
                        checked={logsRadioMode === 'User Log'}
                        onChange={() => setLogsRadioMode('User Log')}
                      />
                      <span>User Log</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="logsRadioMode"
                        checked={logsRadioMode === 'Barcode Print Log'}
                        onChange={() => setLogsRadioMode('Barcode Print Log')}
                      />
                      <span>Barcode Print Log</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={() => alert('👁️ Logs queried')}
                      className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded text-xs"
                    >
                      Show
                    </button>
                    <button
                      onClick={() => alert('🖨️ Logs report printed')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs"
                    >
                      Print
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-slate-200">
                  <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                    <span className="font-bold text-slate-700 text-[11px]">Product:</span>
                    <input
                      type="text"
                      placeholder="Search product code / name"
                      value={logsSearchProduct}
                      onChange={(e) => setLogsSearchProduct(e.target.value)}
                      className="flex-1 px-2.5 py-1 border border-slate-300 rounded text-xs bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="logsFilterType"
                        checked={logsFilterType === 'Cost'}
                        onChange={() => setLogsFilterType('Cost')}
                      />
                      <span>Cost</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="logsFilterType"
                        checked={logsFilterType === 'Price'}
                        onChange={() => setLogsFilterType('Price')}
                      />
                      <span>Price</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="logsFilterType"
                        checked={logsFilterType === 'Stock'}
                        onChange={() => setLogsFilterType('Stock')}
                      />
                      <span>Stock</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-700 text-[11px]">Default Vendor:</span>
                    <select
                      value={logsDefaultVendor}
                      onChange={(e) => setLogsDefaultVendor(e.target.value)}
                      className="px-2 py-1 border border-slate-300 rounded text-xs font-semibold bg-white"
                    >
                      <option value="[Select a Vendor]">[Select a Vendor]</option>
                      <option value="Almarai Food Qatar W.L.L">Almarai Food Qatar W.L.L</option>
                      <option value="Doha Wholesale Trading W.L.L">Doha Wholesale Trading W.L.L</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Table (Matching Image 4 Table) */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 font-bold border-b border-slate-200 text-slate-800">
                  Stock Movement & Price Audit Report ({logsFilterType} Filter)
                </div>
                <div className="overflow-x-auto max-h-[45vh]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 font-bold uppercase text-[10px] text-slate-600">
                      <tr>
                        <th className="p-2">Date & Time</th>
                        <th className="p-2">Product Code</th>
                        <th className="p-2">Product Description</th>
                        <th className="p-2">Log Type</th>
                        <th className="p-2 text-right">Old Value</th>
                        <th className="p-2 text-right">New Value</th>
                        <th className="p-2">User</th>
                        <th className="p-2">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr className="hover:bg-slate-50">
                        <td className="p-2 font-mono text-slate-600">17/08/2026 09:52:14 AM</td>
                        <td className="p-2 font-mono font-bold text-slate-900">123</td>
                        <td className="p-2 font-bold text-slate-900">Almarai Full Cream Fresh Milk 1L</td>
                        <td className="p-2 font-bold text-emerald-700">Retail Price Change</td>
                        <td className="p-2 text-right font-mono text-slate-600">14.00 QAR</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">15.00 QAR</td>
                        <td className="p-2 text-slate-700 font-semibold">Administrator</td>
                        <td className="p-2 text-slate-600">Price Adjustment by Margin GP%</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-2 font-mono text-slate-600">16/08/2026 04:30:10 PM</td>
                        <td className="p-2 font-mono font-bold text-slate-900">123</td>
                        <td className="p-2 font-bold text-slate-900">Almarai Full Cream Fresh Milk 1L</td>
                        <td className="p-2 font-bold text-blue-700">Stock Movement</td>
                        <td className="p-2 text-right font-mono text-slate-600">85 Pcs</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">120 Pcs</td>
                        <td className="p-2 text-slate-700 font-semibold">Inventory Manager</td>
                        <td className="p-2 text-slate-600">GRN Receipt #GRN-2026-0891</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-2 font-mono text-slate-600">15/08/2026 11:15:00 AM</td>
                        <td className="p-2 font-mono font-bold text-slate-900">124</td>
                        <td className="p-2 font-bold text-slate-900">Rayyan Natural Water 500ml Pack x24</td>
                        <td className="p-2 font-bold text-amber-700">Landed Cost Adjustment</td>
                        <td className="p-2 text-right font-mono text-slate-600">9.50 QAR</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">10.00 QAR</td>
                        <td className="p-2 text-slate-700 font-semibold">Administrator</td>
                        <td className="p-2 text-slate-600">Supplier Cost Increase Revision</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end">
                <button onClick={() => setIsLogsModalOpen(false)} className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. IMPORT PRODUCTS MODAL (Matching Target Image 1) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden font-sans">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-teal-400" />
                <h2 className="text-sm font-bold">Import Products - DART POS</h2>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs">
              {/* Top Controls Area (Matching Image 1) */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                    <span className="font-bold text-slate-700 text-[11px] w-20">Select File</span>
                    <input
                      type="text"
                      value={importFilePath}
                      onChange={(e) => setImportFilePath(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white text-xs"
                    />
                    <button
                      onClick={() => alert('📁 File Browser opened to select Excel/CSV file')}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded border border-slate-300"
                    >
                      Browse
                    </button>
                    <button
                      onClick={() => alert('📄 Excel Template downloaded: Products_Import_Template.xlsx')}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded"
                    >
                      Download Template
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap pt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 text-[11px] w-20">Select Sheet</span>
                    <select
                      value={importSheetName}
                      onChange={(e) => setImportSheetName(e.target.value)}
                      className="px-3 py-1 border border-slate-300 rounded font-semibold bg-white text-xs w-40"
                    >
                      <option value="Sheet1">Sheet1</option>
                      <option value="Sheet2">Sheet2</option>
                      <option value="Products_Catalog">Products_Catalog</option>
                    </select>
                    <button
                      onClick={() => alert('🔄 Refreshed sheet structure')}
                      className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded border border-slate-300"
                    >
                      Refresh
                    </button>
                    <button
                      onClick={() => alert('✅ Sheet data loaded into table grid')}
                      className="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Data Table Area (Matching Image 1 Table Grid) */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 font-bold border-b border-slate-200 text-slate-800">
                  Excel Data Preview Grid
                </div>
                <div className="overflow-x-auto max-h-[45vh]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 font-bold uppercase text-[10px] text-slate-600">
                      <tr>
                        <th className="p-2">Product Code</th>
                        <th className="p-2">Product Description</th>
                        <th className="p-2">Barcode</th>
                        <th className="p-2">Category</th>
                        <th className="p-2 text-right">Cost Price</th>
                        <th className="p-2 text-right">Retail Price</th>
                        <th className="p-2 text-right">Price Incl Tax</th>
                        <th className="p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {importExcelData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-mono font-bold text-slate-900">{row.code}</td>
                          <td className="p-2 font-bold text-slate-900">{row.description}</td>
                          <td className="p-2 font-mono text-slate-600">{row.barcode}</td>
                          <td className="p-2 text-slate-700">{row.category}</td>
                          <td className="p-2 text-right font-mono">{formatQAR(row.cost)}</td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900">{formatQAR(row.price)}</td>
                          <td className="p-2 text-right font-mono font-bold text-emerald-700">{formatQAR(row.priceInclTax)}</td>
                          <td className="p-2 text-center font-bold text-emerald-600">{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Controls Area (Matching Image 1 Bottom) */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div className="text-slate-500 text-[11px] font-medium">
                  Status: 3 valid Excel records ready for import.
                </div>

                <div className="flex items-center gap-4">
                  <div className="space-y-1 text-[11px] font-bold text-slate-700">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkDuplicateDescription}
                        onChange={(e) => setCheckDuplicateDescription(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>Check for Duplicate Description</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkDuplicateProductCode}
                        onChange={(e) => setCheckDuplicateProductCode(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>Check For Duplicate Product Code</span>
                    </label>
                  </div>

                  <button
                    onClick={() => {
                      alert('✅ Bulk products imported successfully!');
                      setIsImportModalOpen(false);
                    }}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                  >
                    Import
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. BATCH BARCODE PRINTING MODAL (Matching Target Image 2) */}
      {isBatchBarcodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-6xl overflow-hidden font-sans">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold">Batch Barcode Printing - DART POS</h2>
              </div>
              <button onClick={() => setIsBatchBarcodeModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              {/* Top Controls Toolbar (Matching Image 2 Top Toolbar) */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Barcode Printing Group */}
                  <div className="flex items-center gap-1.5 bg-white p-1.5 rounded border border-slate-300">
                    <span className="font-bold text-slate-700 text-[10px] uppercase">Barcode Printing:</span>
                    <button
                      onClick={() => alert('🖨️ Quick Print (Ctrl + A) initiated')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded text-xs flex items-center gap-1"
                    >
                      <span>Quick Print</span>
                      <span className="text-[9px] text-slate-400">Ctrl + A</span>
                    </button>
                    <button
                      onClick={() => alert('💾 PDT Download (Ctrl + P) export initiated')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded border text-xs flex items-center gap-1"
                    >
                      <span>PDT</span>
                      <span className="text-[9px] text-slate-500">Ctrl + P</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-700">Records:</span>
                    <input
                      type="number"
                      value={batchBarcodeRecordsLimit}
                      onChange={(e) => setBatchBarcodeRecordsLimit(parseInt(e.target.value) || 100)}
                      className="w-16 px-2 py-1 border border-slate-300 rounded font-mono font-bold bg-white text-center"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-700">Product Created/Modified Date From and To:</span>
                    <input
                      type="date"
                      value={batchBarcodeFromDate}
                      onChange={(e) => setBatchBarcodeFromDate(e.target.value)}
                      className="px-2 py-1 border border-slate-300 rounded font-mono bg-white text-[11px]"
                    />
                    <span>-</span>
                    <input
                      type="date"
                      value={batchBarcodeToDate}
                      onChange={(e) => setBatchBarcodeToDate(e.target.value)}
                      className="px-2 py-1 border border-slate-300 rounded font-mono bg-white text-[11px]"
                    />
                    <button onClick={() => alert('🔍 Querying records...')} className="px-3 py-1 bg-sky-600 text-white font-bold rounded text-xs">
                      Search
                    </button>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={batchBarcodePriceChangedOnly}
                      onChange={(e) => setBatchBarcodePriceChangedOnly(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Price Changed Only</span>
                  </label>

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={() => alert('All items selected')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded border border-slate-300 font-bold text-[11px]"
                    >
                      Select All (Ctrl + A)
                    </button>
                    <button
                      onClick={() => alert('All items deselected')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded border border-slate-300 font-bold text-[11px]"
                    >
                      Deselect All (Ctrl + D)
                    </button>
                    <button
                      onClick={() => alert('Selection inverted')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded border border-slate-300 font-bold text-[11px]"
                    >
                      Select Inverse (Ctrl + I)
                    </button>
                  </div>
                </div>

                {/* Search Row (Matching Image 2 Row 2) */}
                <div className="flex items-center gap-3 pt-1 border-t border-slate-200 flex-wrap">
                  <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                    <span className="font-bold text-slate-700">Product Search (F1):</span>
                    <input
                      type="text"
                      placeholder="Enter Keyword"
                      value={batchBarcodeKeyword}
                      onChange={(e) => setBatchBarcodeKeyword(e.target.value)}
                      className="flex-1 px-2.5 py-1 border border-slate-300 rounded bg-white text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Search By:</span>
                    <select
                      value={batchBarcodeSearchBy}
                      onChange={(e) => setBatchBarcodeSearchBy(e.target.value as any)}
                      className="px-2.5 py-1 border border-slate-300 rounded font-semibold bg-white text-xs"
                    >
                      <option value="Description">Description</option>
                      <option value="Barcode">Barcode</option>
                      <option value="Product Code">Product Code</option>
                      <option value="Department">Department</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 font-bold text-slate-700">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="batchSearchMode"
                        checked={batchBarcodeSearchMode === 'Begin With'}
                        onChange={() => setBatchBarcodeSearchMode('Begin With')}
                      />
                      <span>Begin With (F4)</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="batchSearchMode"
                        checked={batchBarcodeSearchMode === 'Contains'}
                        onChange={() => setBatchBarcodeSearchMode('Contains')}
                      />
                      <span>Contains (F5)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Data Table Grid (All 16 Columns Matching Image 2) */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[45vh]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-700 sticky top-0 z-10">
                      <tr>
                        <th className="p-2 text-center w-10">Select</th>
                        <th className="p-2 font-mono">Pack ID</th>
                        <th className="p-2 font-mono text-center">Qty</th>
                        <th className="p-2">Product Description</th>
                        <th className="p-2">Local Name</th>
                        <th className="p-2 font-mono">Barcode</th>
                        <th className="p-2 font-mono">Product Code</th>
                        <th className="p-2">Department Name</th>
                        <th className="p-2">Unit</th>
                        <th className="p-2 font-mono text-center">UOM</th>
                        <th className="p-2 text-right">Cost</th>
                        <th className="p-2 text-right">Price</th>
                        <th className="p-2 text-right">Price Incl Tax</th>
                        <th className="p-2 text-right">MSP</th>
                        <th className="p-2 text-right">Was Price</th>
                        <th className="p-2">Vendor Name</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-2 text-center">
                            <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                          </td>
                          <td className="p-2 font-mono text-center">0</td>
                          <td className="p-2 font-mono font-bold text-center">1</td>
                          <td className="p-2 font-bold text-slate-900">{p.name}</td>
                          <td className="p-2 font-arabic text-slate-600">{p.nameAr || p.name}</td>
                          <td className="p-2 font-mono text-slate-600">{p.barcode}</td>
                          <td className="p-2 font-mono font-bold text-slate-900">{p.sku}</td>
                          <td className="p-2 text-slate-700">{p.categoryName || 'General'}</td>
                          <td className="p-2 font-mono text-slate-700">{p.unit}</td>
                          <td className="p-2 font-mono text-center">1</td>
                          <td className="p-2 text-right font-mono text-slate-800">{formatQAR(p.costPrice)}</td>
                          <td className="p-2 text-right font-mono text-slate-800">{formatQAR(p.retailPrice)}</td>
                          <td className="p-2 text-right font-mono font-bold text-emerald-700">{formatQAR(p.priceInclTax || p.retailPrice)}</td>
                          <td className="p-2 text-right font-mono">{formatQAR(p.msp || p.retailPrice)}</td>
                          <td className="p-2 text-right font-mono text-slate-500">{formatQAR(p.wasPrice || p.retailPrice)}</td>
                          <td className="p-2 text-slate-600">{p.defaultVendor || 'General'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Control Strip (Matching Image 2 Bottom Panel) */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                {/* Left Panel Settings */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 font-bold text-slate-700">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="batchTaxMode"
                        checked={batchBarcodeTaxMode === 'Incl. Tax'}
                        onChange={() => setBatchBarcodeTaxMode('Incl. Tax')}
                      />
                      <span>Incl. Tax</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="batchTaxMode"
                        checked={batchBarcodeTaxMode === 'Excl. Tax'}
                        onChange={() => setBatchBarcodeTaxMode('Excl. Tax')}
                      />
                      <span>Excl. Tax</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2 font-bold text-slate-700 border-l border-slate-300 pl-3">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="batchDesignMode"
                        checked={batchBarcodeDesignMode === 'Default Design'}
                        onChange={() => setBatchBarcodeDesignMode('Default Design')}
                      />
                      <span>Default Design</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="batchDesignMode"
                        checked={batchBarcodeDesignMode === 'PRN Template'}
                        onChange={() => setBatchBarcodeDesignMode('PRN Template')}
                      />
                      <span>PRN Template</span>
                    </label>
                    <select
                      value={batchBarcodeTemplate}
                      onChange={(e) => setBatchBarcodeTemplate(e.target.value)}
                      className="px-2 py-1 border border-slate-300 rounded font-semibold bg-white text-xs"
                    >
                      <option value="Choose a Template">Choose a Template</option>
                      <option value="Standard Thermal 50x25mm">Standard Thermal 50x25mm</option>
                      <option value="Shelf Tag 60x40mm">Shelf Tag 60x40mm</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 font-bold text-slate-700 border-l border-slate-300 pl-3">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={batchBarcodePrintPrice}
                        onChange={(e) => setBatchBarcodePrintPrice(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>Print Price</span>
                    </label>

                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={batchBarcodeShowPackings}
                        onChange={(e) => setBatchBarcodeShowPackings(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>Show Packings</span>
                    </label>

                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={batchBarcodePrintExpDate}
                        onChange={(e) => setBatchBarcodePrintExpDate(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>Print Exp. Date</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2 font-bold text-slate-700 border-l border-slate-300 pl-3">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="batchQtyMode"
                        checked={batchBarcodeQtyMode === 'Stock Qty'}
                        onChange={() => setBatchBarcodeQtyMode('Stock Qty')}
                      />
                      <span>Stock Qty</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="batchQtyMode"
                        checked={batchBarcodeQtyMode === 'Manual Qty'}
                        onChange={() => setBatchBarcodeQtyMode('Manual Qty')}
                      />
                      <span>Manual Qty</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="batchQtyMode"
                        checked={batchBarcodeQtyMode === 'One Each'}
                        onChange={() => setBatchBarcodeQtyMode('One Each')}
                      />
                      <span>One Each</span>
                    </label>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => alert('🖨️ Printing selected product barcode label (F1)...')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Selected Product Print (F1)</span>
                  </button>
                  <button
                    onClick={() => alert('🖨️ Printing batch barcode labels (Ctrl + P)...')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Batch Print (Ctrl + P)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. BARCODE QUICK PRINT MODAL (Matching Target Image 3) */}
      {isQuickPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden font-sans">
            <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold">Barcode Quick Print</h2>
              </div>
              <button onClick={() => setIsQuickPrintModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              {/* Barcode Scanner Box */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Barcode</label>
                <input
                  type="text"
                  placeholder="Scan or enter barcode..."
                  value={quickPrintBarcodeScan}
                  onChange={(e) => {
                    setQuickPrintBarcodeScan(e.target.value);
                    const found = products.find((p) => p.barcode === e.target.value || p.sku === e.target.value);
                    if (found) {
                      setQuickPrintCode(found.sku);
                      setQuickPrintProductDesc(found.name);
                      setQuickPrintPriceInclTax(found.priceInclTax || found.retailPrice);
                    }
                  }}
                  className="w-full px-3 py-2 border-2 border-slate-400 focus:border-cyan-600 rounded font-mono text-sm font-bold bg-white"
                  autoFocus
                />
              </div>

              {/* Product Details Group Box */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="font-bold text-slate-700 text-[11px] border-b border-slate-200 pb-1">Product Details</div>
                
                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="font-semibold text-slate-600">Code</span>
                  <input
                    type="text"
                    value={quickPrintCode}
                    onChange={(e) => setQuickPrintCode(e.target.value)}
                    className="col-span-2 px-2.5 py-1 border border-slate-300 rounded font-mono bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="font-semibold text-slate-600">Barcode</span>
                  <input
                    type="text"
                    value={quickPrintBarcodeScan || '346578'}
                    onChange={(e) => setQuickPrintBarcodeScan(e.target.value)}
                    className="col-span-2 px-2.5 py-1 border border-slate-300 rounded font-mono bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="font-semibold text-slate-600">Product Description</span>
                  <input
                    type="text"
                    value={quickPrintProductDesc}
                    onChange={(e) => setQuickPrintProductDesc(e.target.value)}
                    className="col-span-2 px-2.5 py-1 border border-slate-300 rounded bg-white font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="font-semibold text-slate-600">Price Incl. Tax</span>
                  <input
                    type="number"
                    value={quickPrintPriceInclTax}
                    onChange={(e) => setQuickPrintPriceInclTax(parseFloat(e.target.value) || 0)}
                    className="col-span-2 px-2.5 py-1 border border-slate-300 rounded font-mono font-bold text-emerald-700 bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={quickPrintWasPriceEnabled}
                      onChange={(e) => setQuickPrintWasPriceEnabled(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Was Price</span>
                  </label>
                  <input
                    type="number"
                    disabled={!quickPrintWasPriceEnabled}
                    value={quickPrintWasPrice}
                    onChange={(e) => setQuickPrintWasPrice(parseFloat(e.target.value) || 0)}
                    className={`col-span-2 px-2.5 py-1 border border-slate-300 rounded font-mono ${
                      quickPrintWasPriceEnabled ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Printing Group Box */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="font-bold text-slate-700 text-[11px] border-b border-slate-200 pb-1">Printing</div>
                
                <div className="flex items-center gap-4 font-bold text-slate-700">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="quickTaxMode"
                      checked={quickPrintTaxMode === 'Incl. Tax'}
                      onChange={() => setQuickPrintTaxMode('Incl. Tax')}
                    />
                    <span>Incl. Tax</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="quickTaxMode"
                      checked={quickPrintTaxMode === 'Excl. Tax'}
                      onChange={() => setQuickPrintTaxMode('Excl. Tax')}
                    />
                    <span>Excl. Tax</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="quickDesignMode"
                      checked={quickPrintDesignMode === 'Default Design'}
                      onChange={() => setQuickPrintDesignMode('Default Design')}
                    />
                    <span>Default Design</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="quickDesignMode"
                      checked={quickPrintDesignMode === 'PRN Template'}
                      onChange={() => setQuickPrintDesignMode('PRN Template')}
                    />
                    <span>PRN Template</span>
                  </label>
                  <select
                    value={quickPrintTemplate}
                    onChange={(e) => setQuickPrintTemplate(e.target.value)}
                    className="flex-1 px-2 py-1 border border-slate-300 rounded font-semibold bg-white"
                  >
                    <option value="Standard Thermal 50x25mm">Standard Thermal 50x25mm</option>
                    <option value="Shelf Label 60x40mm">Shelf Label 60x40mm</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 flex-wrap font-bold text-slate-700">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quickPrintPrintPrice}
                      onChange={(e) => setQuickPrintPrintPrice(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Print Price</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={quickPrintAutoPrint}
                        onChange={(e) => setQuickPrintAutoPrint(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>Auto print</span>
                    </label>
                    <input
                      type="number"
                      value={quickPrintAutoPrintQty}
                      onChange={(e) => setQuickPrintAutoPrintQty(parseInt(e.target.value) || 1)}
                      className="w-12 px-1.5 py-0.5 border border-slate-300 rounded font-mono text-center bg-white"
                    />
                  </div>

                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quickPrintQtyOnScan}
                      onChange={(e) => setQuickPrintQtyOnScan(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Qty on scan</span>
                  </label>
                </div>
              </div>

              {/* Bottom Row Qty Box & Print (F1) Button */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex-1 bg-slate-100 p-3 rounded-lg border border-slate-300 flex items-center justify-between">
                  <span className="font-bold text-slate-600 text-sm">Qty</span>
                  <input
                    type="number"
                    value={quickPrintQty}
                    onChange={(e) => setQuickPrintQty(parseInt(e.target.value) || 1)}
                    className="w-24 px-3 py-1 border-2 border-slate-400 rounded font-mono text-xl font-black text-center bg-white"
                  />
                </div>

                <button
                  onClick={() => alert(`🖨️ Quick Printing ${quickPrintQty} barcode label(s) for ${quickPrintProductDesc}`)}
                  className="px-6 py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg shadow-md flex items-center gap-2 text-sm"
                >
                  <Printer className="w-5 h-5 text-cyan-400" />
                  <span>Print (F1)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. PRICE EMBEDDED BARCODE PRINTING MODAL (Matching Target Image 4) */}
      {isPriceEmbeddedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden font-sans">
            <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Barcode className="w-4 h-4 text-pink-400" />
                <h2 className="text-sm font-bold">Price Embedded Barcode Printing</h2>
              </div>
              <button onClick={() => setIsPriceEmbeddedModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              {/* Product Details Group Box */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="font-bold text-slate-700 text-[11px] border-b border-slate-200 pb-1">Product Details</div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="font-semibold text-slate-600">Product</span>
                  <select
                    value={embeddedSelectedProductId}
                    onChange={(e) => {
                      setEmbeddedSelectedProductId(e.target.value);
                      const found = products.find((p) => p.id === e.target.value);
                      if (found) {
                        setEmbeddedCode(found.sku);
                        setEmbeddedBarcode(found.barcode);
                        setEmbeddedCost(found.costPrice);
                        setEmbeddedPrice(found.retailPrice);
                        setEmbeddedPriceInclTax(found.priceInclTax || found.retailPrice);
                      }
                    }}
                    className="col-span-2 px-2.5 py-1 border border-slate-300 rounded font-semibold bg-white text-xs"
                  >
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="font-semibold text-slate-600">Code</span>
                  <input
                    type="text"
                    value={embeddedCode}
                    onChange={(e) => setEmbeddedCode(e.target.value)}
                    className="col-span-2 px-2.5 py-1 border border-slate-300 rounded font-mono bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="font-semibold text-slate-600">Barcode</span>
                  <input
                    type="text"
                    value={embeddedBarcode}
                    onChange={(e) => setEmbeddedBarcode(e.target.value)}
                    className="col-span-2 px-2.5 py-1 border border-slate-300 rounded font-mono bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="font-semibold text-slate-600">Add. Description</span>
                  <input
                    type="text"
                    value={embeddedAddDescription}
                    onChange={(e) => setEmbeddedAddDescription(e.target.value)}
                    className="col-span-2 px-2.5 py-1 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>

              {/* Printing Group Box */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="font-bold text-slate-700 text-[11px] border-b border-slate-200 pb-1">Printing</div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="font-semibold text-slate-600">Vendor</span>
                  <select
                    value={embeddedVendor}
                    onChange={(e) => setEmbeddedVendor(e.target.value)}
                    className="col-span-2 px-2.5 py-1 border border-slate-300 rounded font-semibold bg-white text-xs"
                  >
                    <option value="[Select a Vendor]">[Select a Vendor]</option>
                    <option value="Almarai Food Qatar W.L.L">Almarai Food Qatar W.L.L</option>
                    <option value="Rayyan Water Company">Rayyan Water Company</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="font-semibold text-slate-600">Cost</span>
                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      type="number"
                      value={embeddedCost}
                      onChange={(e) => setEmbeddedCost(parseFloat(e.target.value) || 0)}
                      className="flex-1 px-2.5 py-1 border border-slate-300 rounded font-mono bg-white"
                    />
                    <span className="text-[11px] font-bold text-slate-500 shrink-0">Cost Code: {embeddedCostCode}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="font-semibold text-slate-600">Price</span>
                  <input
                    type="number"
                    value={embeddedPrice}
                    onChange={(e) => setEmbeddedPrice(parseFloat(e.target.value) || 0)}
                    className="col-span-2 px-2.5 py-1 border border-slate-300 rounded font-mono bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="font-semibold text-slate-600">Price Incl. Tax</span>
                  <div className="col-span-2 flex items-center gap-3">
                    <input
                      type="number"
                      value={embeddedPriceInclTax}
                      onChange={(e) => setEmbeddedPriceInclTax(parseFloat(e.target.value) || 0)}
                      className="flex-1 px-2.5 py-1 border border-slate-300 rounded font-mono font-bold text-emerald-700 bg-white"
                    />
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 shrink-0">
                      <input
                        type="checkbox"
                        checked={embeddedPrintPrice}
                        onChange={(e) => setEmbeddedPrintPrice(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>Print Price</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={embeddedWasPriceEnabled}
                      onChange={(e) => setEmbeddedWasPriceEnabled(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Was Price</span>
                  </label>
                  <input
                    type="number"
                    disabled={!embeddedWasPriceEnabled}
                    value={embeddedWasPrice}
                    onChange={(e) => setEmbeddedWasPrice(parseFloat(e.target.value) || 0)}
                    className={`col-span-2 px-2.5 py-1 border border-slate-300 rounded font-mono ${
                      embeddedWasPriceEnabled ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-400'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-3 font-bold text-slate-700 pt-1 border-t border-slate-200">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="embeddedDesignMode"
                      checked={embeddedDesignMode === 'Default Design'}
                      onChange={() => setEmbeddedDesignMode('Default Design')}
                    />
                    <span>Default Design</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="embeddedDesignMode"
                      checked={embeddedDesignMode === 'PRN Template'}
                      onChange={() => setEmbeddedDesignMode('PRN Template')}
                    />
                    <span>PRN Template</span>
                  </label>
                  <select
                    value={embeddedTemplate}
                    onChange={(e) => setEmbeddedTemplate(e.target.value)}
                    className="flex-1 px-2 py-1 border border-slate-300 rounded font-semibold bg-white"
                  >
                    <option value="Choose a Template">Choose a Template</option>
                    <option value="Price Embedded EAN13 Scale Template">Price Embedded EAN13 Scale Template</option>
                  </select>
                </div>
              </div>

              {/* Bottom Row Qty Box & Print (F1) Button */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex-1 bg-slate-100 p-3 rounded-lg border border-slate-300 flex items-center justify-between">
                  <span className="font-bold text-slate-600 text-sm">Qty</span>
                  <input
                    type="number"
                    value={embeddedQty}
                    onChange={(e) => setEmbeddedQty(parseInt(e.target.value) || 1)}
                    className="w-24 px-3 py-1 border-2 border-slate-400 rounded font-mono text-xl font-black text-center bg-white"
                  />
                </div>

                <button
                  onClick={() => alert(`🖨️ Price Embedded Barcode printed for product ${embeddedCode} (${embeddedQty} label(s))`)}
                  className="px-6 py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg shadow-md flex items-center gap-2 text-sm"
                >
                  <Printer className="w-5 h-5 text-pink-400" />
                  <span>Print (F1)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12. ACTIVE PROMOTIONS MODAL */}
      {isPromotionsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden font-sans">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold">Active Promotions Catalog</h2>
              </div>
              <button onClick={() => setIsPromotionsModalOpen(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Promotions:</span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">2 Active Offers</span>
                </div>
                <button onClick={() => alert('➕ Create New Promotional Offer modal opened')} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded">
                  + Add Promotion
                </button>
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-700">
                    <tr>
                      <th className="p-2">Promotion Name</th>
                      <th className="p-2 font-mono">Product SKU</th>
                      <th className="p-2">Description</th>
                      <th className="p-2 text-right">Normal Price</th>
                      <th className="p-2 text-right">Promo Price</th>
                      <th className="p-2 text-right">Discount</th>
                      <th className="p-2 text-center">Valid Until</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-amber-900">Summer Super Deal 2026</td>
                      <td className="p-2 font-mono font-bold">123</td>
                      <td className="p-2 font-bold">Almarai Full Cream Milk 1L</td>
                      <td className="p-2 text-right font-mono text-slate-500 line-through">15.00 QAR</td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-700">12.50 QAR</td>
                      <td className="p-2 text-right font-mono font-bold text-amber-600">16.6% OFF</td>
                      <td className="p-2 text-center font-mono">31/08/2026</td>
                      <td className="p-2 text-center font-bold text-emerald-600">Active</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-amber-900">Water Hydration Pack Offer</td>
                      <td className="p-2 font-mono font-bold">124</td>
                      <td className="p-2 font-bold">Rayyan Natural Water 500ml Pack x24</td>
                      <td className="p-2 text-right font-mono text-slate-500 line-through">12.00 QAR</td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-700">9.99 QAR</td>
                      <td className="p-2 text-right font-mono font-bold text-amber-600">16.7% OFF</td>
                      <td className="p-2 text-center font-mono">15/09/2026</td>
                      <td className="p-2 text-center font-bold text-emerald-600">Active</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 13. SORT ORDER MODAL */}
      {isSortOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden font-sans">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold">Product Display Sort Order</h2>
              </div>
              <button onClick={() => setIsSortOrderModalOpen(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="text-slate-600 font-medium">Set numerical priority index to rearrange product position in POS touchscreen register.</div>
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[50vh] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 font-bold text-slate-700 uppercase text-[10px]">
                    <tr>
                      <th className="p-2 w-20 text-center">Sort Index</th>
                      <th className="p-2 font-mono">SKU</th>
                      <th className="p-2">Product Name</th>
                      <th className="p-2">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {products.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-2 text-center">
                          <input type="number" defaultValue={idx + 1} className="w-14 px-2 py-0.5 border border-slate-300 rounded font-mono font-bold text-center" />
                        </td>
                        <td className="p-2 font-mono font-bold text-slate-900">{p.sku}</td>
                        <td className="p-2 font-bold text-slate-900">{p.name}</td>
                        <td className="p-2 text-slate-600">{p.categoryName || 'General'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button onClick={() => setIsSortOrderModalOpen(false)} className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded">Cancel</button>
                <button onClick={() => { alert('✅ Product sort order updated!'); setIsSortOrderModalOpen(false); }} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded">Save Sort Order</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 14. PRODUCT HISTORY BY SERIAL MODAL */}
      {isSerialHistoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden font-sans">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Barcode className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm font-bold">Product History By Serial Number / IMEI</h2>
              </div>
              <button onClick={() => setIsSerialHistoryModalOpen(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700">Serial Number / IMEI:</span>
                <input type="text" placeholder="Enter Serial No (e.g. SN-8921002931)" value={serialSearchKeyword} onChange={(e) => setSerialSearchKeyword(e.target.value)} className="flex-1 px-3 py-1 border border-slate-300 rounded font-mono text-xs" />
                <button onClick={() => alert('🔍 Searching serial history...')} className="px-4 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded">Search</button>
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-700">
                    <tr>
                      <th className="p-2 font-mono">Serial Number</th>
                      <th className="p-2 font-mono">SKU</th>
                      <th className="p-2">Description</th>
                      <th className="p-2">Transaction Event</th>
                      <th className="p-2 font-mono">Doc No</th>
                      <th className="p-2 font-mono">Date & Time</th>
                      <th className="p-2">Party</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 font-mono font-bold text-slate-900">SN-8921002931</td>
                      <td className="p-2 font-mono font-bold">123</td>
                      <td className="p-2 font-bold">Almarai Full Cream Milk 1L</td>
                      <td className="p-2 font-bold text-emerald-700">POS Sale Invoice</td>
                      <td className="p-2 font-mono text-slate-700">INV-2026-9012</td>
                      <td className="p-2 font-mono text-slate-600">17/08/2026 11:20 AM</td>
                      <td className="p-2 text-slate-800">Walk-in Customer</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 font-mono font-bold text-slate-900">SN-8921002931</td>
                      <td className="p-2 font-mono font-bold">123</td>
                      <td className="p-2 font-bold">Almarai Full Cream Milk 1L</td>
                      <td className="p-2 font-bold text-blue-700">Goods Receipt (GRN)</td>
                      <td className="p-2 font-mono text-slate-700">GRN-2026-0891</td>
                      <td className="p-2 font-mono text-slate-600">16/08/2026 04:15 PM</td>
                      <td className="p-2 text-slate-800">Almarai Food Qatar W.L.L</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 15. ACTION HISTORY MODAL */}
      {isActionHistoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden font-sans">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold">System Master Action History Log</h2>
              </div>
              <button onClick={() => setIsActionHistoryModalOpen(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[50vh] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-700 sticky top-0">
                    <tr>
                      <th className="p-2 font-mono">Date & Time</th>
                      <th className="p-2 font-mono">SKU</th>
                      <th className="p-2">Description</th>
                      <th className="p-2">Action Performed</th>
                      <th className="p-2 font-semibold">User</th>
                      <th className="p-2">Terminal / IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 font-mono text-slate-600">17/08/2026 10:34:42 AM</td>
                      <td className="p-2 font-mono font-bold text-slate-900">123</td>
                      <td className="p-2 font-bold text-slate-900">Almarai Full Cream Fresh Milk 1L</td>
                      <td className="p-2 font-bold text-emerald-700">Retail Price Update (QAR 15.00)</td>
                      <td className="p-2 text-slate-800 font-semibold">Administrator</td>
                      <td className="p-2 font-mono text-slate-500">POS-TERM-01 (192.168.1.10)</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 font-mono text-slate-600">16/08/2026 03:10:00 PM</td>
                      <td className="p-2 font-mono font-bold text-slate-900">124</td>
                      <td className="p-2 font-bold text-slate-900">Rayyan Natural Water 500ml Pack x24</td>
                      <td className="p-2 font-bold text-blue-700">Stock Receipt Adjustment (+100 Units)</td>
                      <td className="p-2 text-slate-800 font-semibold">Inventory Specialist</td>
                      <td className="p-2 font-mono text-slate-500">BACKOFFICE-PC (192.168.1.15)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 16. PURCHASE HISTORY MODAL */}
      {isPurchaseHistoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden font-sans">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-400" />
                <h2 className="text-sm font-bold">Supplier Purchase History</h2>
              </div>
              <button onClick={() => setIsPurchaseHistoryModalOpen(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-700">
                    <tr>
                      <th className="p-2 font-mono">GRN Date</th>
                      <th className="p-2 font-mono">GRN No</th>
                      <th className="p-2">Supplier Name</th>
                      <th className="p-2 text-center font-mono">Qty</th>
                      <th className="p-2 text-right font-mono">Unit Cost</th>
                      <th className="p-2 text-right font-mono">Total Amount</th>
                      <th className="p-2 font-mono">Supplier Inv No</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 font-mono text-slate-600">16/08/2026</td>
                      <td className="p-2 font-mono font-bold text-slate-900">GRN-2026-0891</td>
                      <td className="p-2 font-bold text-slate-900">Almarai Food Qatar W.L.L</td>
                      <td className="p-2 font-mono text-center font-bold">500</td>
                      <td className="p-2 text-right font-mono text-slate-800">10.00 QAR</td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-700">5,000.00 QAR</td>
                      <td className="p-2 font-mono text-slate-600">INV-ALM-8892</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 17. DEPARTMENT & BRAND SHIFTING MODAL */}
      {isDeptShiftingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden font-sans">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-teal-400" />
                <h2 className="text-sm font-bold">Bulk Department & Brand Shifting</h2>
              </div>
              <button onClick={() => setIsDeptShiftingModalOpen(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>
            <div className="p-4 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                <div className="font-bold text-slate-700 border-b border-slate-200 pb-1">Source Selection</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="font-semibold text-slate-600 block mb-1">From Department</span>
                    <select className="w-full px-2.5 py-1 border border-slate-300 rounded font-semibold bg-white">
                      <option value="Fresh Food">Fresh Food</option>
                      <option value="Beverages">Beverages</option>
                    </select>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600 block mb-1">From Brand</span>
                    <select className="w-full px-2.5 py-1 border border-slate-300 rounded font-semibold bg-white">
                      <option value="Mango">Mango</option>
                      <option value="Almarai">Almarai</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                <div className="font-bold text-slate-700 border-b border-slate-200 pb-1">Target Destination</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="font-semibold text-slate-600 block mb-1">To Department</span>
                    <select className="w-full px-2.5 py-1 border border-slate-300 rounded font-semibold bg-white">
                      <option value="Dairy & Chilled">Dairy & Chilled</option>
                      <option value="Packaged Foods">Packaged Foods</option>
                    </select>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600 block mb-1">To Brand</span>
                    <select className="w-full px-2.5 py-1 border border-slate-300 rounded font-semibold bg-white">
                      <option value="Almarai Premium">Almarai Premium</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button onClick={() => setIsDeptShiftingModalOpen(false)} className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded">Cancel</button>
                <button onClick={() => { alert('✅ Products shifted to new Department & Brand!'); setIsDeptShiftingModalOpen(false); }} className="px-6 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-sm">Perform Bulk Shift</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
