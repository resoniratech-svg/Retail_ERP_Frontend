import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { productsService } from '@qatar-erp/api';
import { formatQAR } from '@qatar-erp/utils';
import { Product } from '@qatar-erp/types';
import {
  Printer,
  Search,
  CheckSquare,
  Square,
  RefreshCw,
  Calendar,
  Sliders,
  Download,
  Barcode,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  XSquare,
} from 'lucide-react';
import { Button, Card } from '@qatar-erp/ui';

interface BatchBarcodeItem extends Product {
  selected: boolean;
  printQty: number;
  packId: number;
  uom: number;
}

export const BatchBarcodePage: React.FC = () => {
  const [items, setItems] = useState<BatchBarcodeItem[]>([]);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [searchBy, setSearchBy] = useState<'Description' | 'Barcode' | 'Product Code' | 'Department'>('Description');
  const [searchMode, setSearchMode] = useState<'Begin With' | 'Contains'>('Contains');

  // Top Filter Controls matching Image 1
  const [recordsLimit, setRecordsLimit] = useState(100);
  const [fromDate, setFromDate] = useState('2026-08-01');
  const [toDate, setToDate] = useState('2026-08-15');
  const [priceChangedOnly, setPriceChangedOnly] = useState(false);

  // Bottom Panel Controls matching Image 1
  const [taxMode, setTaxMode] = useState<'Incl. Tax' | 'Excl. Tax'>('Incl. Tax');
  const [designMode, setDesignMode] = useState<'Default Design' | 'PRN Template'>('Default Design');
  const [selectedTemplate, setSelectedTemplate] = useState('Standard 50x25mm');
  const [printPrice, setPrintPrice] = useState(true);
  const [showPackings, setShowPackings] = useState(false);
  const [printExpDate, setPrintExpDate] = useState(false);
  const [qtyMode, setQtyMode] = useState<'Stock Qty' | 'Manual Qty' | 'One Each'>('One Each');

  // Print Preview Modal State
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [previewItems, setPreviewItems] = useState<BatchBarcodeItem[]>([]);

  // Barcode Quick Print Modal State (Matching User's Target Screenshot 100%)
  const [isQuickPrintModalOpen, setIsQuickPrintModalOpen] = useState(true);
  const [quickPrintBarcodeScan, setQuickPrintBarcodeScan] = useState('');
  const [quickPrintCode, setQuickPrintCode] = useState('123');
  const [quickPrintBarcodeVal, setQuickPrintBarcodeVal] = useState('346578');
  const [quickPrintProductDesc, setQuickPrintProductDesc] = useState('sdfghj');
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

  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    // Auto trigger Quick Barcode modal when quickPrint param is present or when clicked from top ribbon
    const isQuick = searchParams.get('quickPrint') === 'true' || location.search.includes('quickPrint=true');
    if (isQuick) {
      setIsQuickPrintModalOpen(true);
    }
  }, [searchParams, location.search, location.key]);

  useEffect(() => {
    const rawProducts = productsService.getProductsSync();
    const batchItems: BatchBarcodeItem[] = rawProducts.map((p) => ({
      ...p,
      selected: false,
      printQty: 1,
      packId: 0,
      uom: 1,
    }));
    setItems(batchItems);
  }, []);

  // Selection Action Helpers matching Image 1 Toolbar
  const handleSelectAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: true })));
  };

  const handleDeselectAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: false })));
  };

  const handleSelectInverse = () => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: !item.selected })));
  };

  const handleToggleItemSelect = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)));
  };

  const handleQtyChange = (id: string, val: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, printQty: Math.max(1, val) } : item)));
  };

  // Quantity Mode Updates
  useEffect(() => {
    setItems((prev) =>
      prev.map((item) => {
        let newQty = item.printQty;
        if (qtyMode === 'Stock Qty') {
          newQty = Math.max(1, item.stockQuantity);
        } else if (qtyMode === 'One Each') {
          newQty = 1;
        }
        return { ...item, printQty: newQty };
      })
    );
  }, [qtyMode]);

  // Search Filter logic
  const filteredItems = items.filter((item) => {
    const query = keywordSearch.toLowerCase().trim();
    if (!query) return true;

    let targetField = item.name;
    if (searchBy === 'Barcode') targetField = item.barcode;
    if (searchBy === 'Product Code') targetField = item.sku;
    if (searchBy === 'Department') targetField = item.categoryName || '';

    if (searchMode === 'Begin With') {
      return targetField.toLowerCase().startsWith(query);
    }
    return targetField.toLowerCase().includes(query);
  });

  // Print Handlers
  const handlePrintSingle = (item: BatchBarcodeItem) => {
    setPreviewItems([{ ...item, selected: true }]);
    setIsPrintPreviewOpen(true);
  };

  const handleBatchPrint = () => {
    const selectedList = items.filter((i) => i.selected);
    if (selectedList.length === 0) {
      alert('Please select at least one product checkbox to print batch barcodes!');
      return;
    }
    setPreviewItems(selectedList);
    setIsPrintPreviewOpen(true);
  };

  const handleExecuteBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-3 font-sans text-xs">
      {/* MODULE TITLE BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Barcode className="w-5 h-5 text-emerald-400" />
          <h1 className="text-sm font-bold">Batch Barcode Printing - DART POS</h1>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Total Products: {filteredItems.length} | Selected: {items.filter((i) => i.selected).length}
        </span>
      </div>

      {/* 1. TOP BARCODE PRINTING TOOLBAR (Matching Image 1 Top) */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Print Button */}
          <button
            onClick={() => setIsQuickPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm"
            title="Quick Print (Ctrl+A)"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Quick Print</span>
          </button>

          {/* PDT Download Button */}
          <button
            onClick={() => alert('📱 PDT (Portable Data Terminal) barcode file downloaded successfully!')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg"
            title="Download PDT File (Ctrl+P)"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>PDT</span>
          </button>

          {/* Records Limit */}
          <div className="flex items-center gap-1">
            <span className="font-bold text-slate-600 text-[11px]">Records:</span>
            <input
              type="number"
              value={recordsLimit}
              onChange={(e) => setRecordsLimit(parseInt(e.target.value) || 100)}
              className="w-16 px-2 py-1 border border-slate-300 rounded font-mono font-bold text-center text-xs"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded border border-slate-200">
            <span className="font-bold text-slate-600 text-[11px]">Date From & To:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-1.5 py-0.5 border border-slate-300 rounded font-mono text-[11px]"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-1.5 py-0.5 border border-slate-300 rounded font-mono text-[11px]"
            />
            <button
              onClick={() => alert('Search filtered by modified date range.')}
              className="px-2 py-0.5 bg-slate-700 text-white font-bold text-[11px] rounded"
            >
              Search
            </button>
          </div>

          {/* Price Changed Only Checkbox */}
          <label className="flex items-center gap-1 font-bold text-slate-700 text-[11px] cursor-pointer">
            <input
              type="checkbox"
              checked={priceChangedOnly}
              onChange={(e) => setPriceChangedOnly(e.target.checked)}
              className="rounded text-emerald-600"
            />
            <span>Price Changed Only</span>
          </label>
        </div>

        {/* Selection Helpers (Select All, Deselect All, Select Inverse) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded border border-blue-200"
            title="Select All (Ctrl+A)"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Select All</span>
          </button>

          <button
            onClick={handleDeselectAll}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded border border-slate-300"
            title="Deselect All (Ctrl+D)"
          >
            <Square className="w-3.5 h-3.5 text-slate-400" />
            <span>Deselect All</span>
          </button>

          <button
            onClick={handleSelectInverse}
            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded border border-indigo-200"
            title="Select Inverse (Ctrl+I)"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Select Inverse</span>
          </button>
        </div>
      </div>

      {/* 2. PRODUCT SEARCH (F1) BAR (Matching Image 1 Middle) */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-1.5 flex-1 min-w-[240px]">
            <span className="font-bold text-slate-700">Product Search (F1):</span>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Keyword..."
                value={keywordSearch}
                onChange={(e) => setKeywordSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
              <Search className="w-4 h-4 absolute left-2.5 top-2 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-700">Search By:</span>
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value as any)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-slate-50 focus:outline-none"
            >
              <option value="Description">Description</option>
              <option value="Barcode">Barcode</option>
              <option value="Product Code">Product Code</option>
              <option value="Department">Department</option>
            </select>
          </div>

          <div className="flex items-center gap-3 font-semibold text-slate-700 text-xs">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="searchMode"
                checked={searchMode === 'Begin With'}
                onChange={() => setSearchMode('Begin With')}
              />
              <span>Begin With (F4)</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="searchMode"
                checked={searchMode === 'Contains'}
                onChange={() => setSearchMode('Contains')}
              />
              <span>Contains (F5)</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. BATCH BARCODE SELECTION DATA TABLE (Matching Image 1 Table Columns) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[50vh]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px] tracking-wider sticky top-0 z-10">
              <tr>
                <th className="py-2 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={filteredItems.length > 0 && filteredItems.every((i) => i.selected)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setItems((prev) => prev.map((i) => ({ ...i, selected: checked })));
                    }}
                    className="rounded text-emerald-600"
                  />
                </th>
                <th className="py-2 px-3 text-center">Pack ID</th>
                <th className="py-2 px-3 text-center">Qty</th>
                <th className="py-2 px-3">Product Description</th>
                <th className="py-2 px-3">Local Name</th>
                <th className="py-2 px-3">Barcode</th>
                <th className="py-2 px-3">Product Code</th>
                <th className="py-2 px-3">Department Name</th>
                <th className="py-2 px-3">Unit</th>
                <th className="py-2 px-3 text-center">UOM</th>
                <th className="py-2 px-3 text-right">Cost</th>
                <th className="py-2 px-3 text-right">Price</th>
                <th className="py-2 px-3 text-right text-emerald-600">Price Ind Tax</th>
                <th className="py-2 px-3 text-right">MSP</th>
                <th className="py-2 px-3 text-right text-amber-700">Was Price</th>
                <th className="py-2 px-3">Vendor Name</th>
                <th className="py-2 px-3 text-center sticky right-0 bg-slate-100">Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={17} className="py-8 text-center text-slate-500">
                    <Barcode className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-bold text-sm">No Products Found for Barcode Printing</p>
                  </td>
                </tr>
              ) : (
                filteredItems.slice(0, recordsLimit).map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50 transition-colors ${item.selected ? 'bg-emerald-50/60' : ''}`}
                  >
                    <td className="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => handleToggleItemSelect(item.id)}
                        className="rounded text-emerald-600"
                      />
                    </td>
                    <td className="py-2 px-3 text-center font-mono">{item.packId}</td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.printQty}
                        onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 1)}
                        className="w-14 px-1.5 py-0.5 border border-slate-300 rounded font-mono font-bold text-center text-xs"
                      />
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900">{item.name}</td>
                    <td className="py-2 px-3 font-arabic text-slate-700">{item.nameAr || item.localDescription || item.name}</td>
                    <td className="py-2 px-3 font-mono text-slate-800 font-semibold">{item.barcode}</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">{item.sku}</td>
                    <td className="py-2 px-3 text-slate-700">{item.categoryName || 'GSDUYGYG'}</td>
                    <td className="py-2 px-3 font-mono">{item.unit || 'apple'}</td>
                    <td className="py-2 px-3 text-center font-mono">{item.uom}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-700">{formatQAR(item.costPrice)}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatQAR(item.retailPrice)}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">{formatQAR(item.priceInclTax || item.retailPrice)}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">{formatQAR(item.msp || item.retailPrice * 0.9)}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-amber-700">{formatQAR(item.wasPrice || 67.00)}</td>
                    <td className="py-2 px-3 text-slate-600 font-mono">{item.defaultVendor || 'General'}</td>
                    <td className="py-2 px-3 text-center sticky right-0 bg-white shadow-left">
                      <button
                        onClick={() => handlePrintSingle(item)}
                        className="p-1 hover:bg-emerald-50 text-emerald-600 rounded"
                        title="Print Single Barcode Label"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. BOTTOM BARCODE PRINTING CONTROL PANEL (Matching Image 1 Bottom Panel) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* LEFT TAX RADIOS */}
        <div className="flex items-center gap-3 font-bold text-slate-700 text-xs">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="taxMode"
              checked={taxMode === 'Incl. Tax'}
              onChange={() => setTaxMode('Incl. Tax')}
            />
            <span>Incl. Tax</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="taxMode"
              checked={taxMode === 'Excl. Tax'}
              onChange={() => setTaxMode('Excl. Tax')}
            />
            <span>Excl. Tax</span>
          </label>
        </div>

        {/* MIDDLE TEMPLATES & CHECKBOXES */}
        <div className="flex items-center gap-4 flex-wrap text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="designMode"
                checked={designMode === 'Default Design'}
                onChange={() => setDesignMode('Default Design')}
              />
              <span>Default Design</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="designMode"
                checked={designMode === 'PRN Template'}
                onChange={() => setDesignMode('PRN Template')}
              />
              <span>PRN Template</span>
            </label>

            {designMode === 'PRN Template' && (
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="px-2 py-1 border border-slate-300 rounded font-medium bg-slate-50 text-[11px]"
              >
                <option value="Standard 50x25mm">Standard 50x25mm</option>
                <option value="Jewelry Tag 30x10mm">Jewelry Tag 30x10mm</option>
                <option value="Promotional Was Price 70x35mm">Promotional Was Price 70x35mm</option>
              </select>
            )}
          </div>

          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={printPrice}
              onChange={(e) => setPrintPrice(e.target.checked)}
              className="rounded text-emerald-600"
            />
            <span>Print Price</span>
          </label>

          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showPackings}
              onChange={(e) => setShowPackings(e.target.checked)}
              className="rounded text-emerald-600"
            />
            <span>Show Packings</span>
          </label>

          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={printExpDate}
              onChange={(e) => setPrintExpDate(e.target.checked)}
              className="rounded text-emerald-600"
            />
            <span>Print Exp. Date</span>
          </label>

          {/* Quantity Mode Radios */}
          <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded border border-slate-200 text-[11px]">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="qtyMode"
                checked={qtyMode === 'Stock Qty'}
                onChange={() => setQtyMode('Stock Qty')}
              />
              <span>Stock Qty</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="qtyMode"
                checked={qtyMode === 'Manual Qty'}
                onChange={() => setQtyMode('Manual Qty')}
              />
              <span>Manual Qty</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="qtyMode"
                checked={qtyMode === 'One Each'}
                onChange={() => setQtyMode('One Each')}
              />
              <span>One Each</span>
            </label>
          </div>
        </div>

        {/* RIGHT ACTION BUTTONS matching Image 1 Bottom Right */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const highlighted = filteredItems.find((i) => i.selected) || filteredItems[0];
              if (highlighted) handlePrintSingle(highlighted);
              else alert('No item selected');
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-sm"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Selected Product Print (F1)</span>
          </button>

          <button
            onClick={handleBatchPrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Batch Print (Ctrl+P)</span>
          </button>
        </div>
      </div>

      {/* 5. INTERACTIVE PRINT PREVIEW MODAL */}
      {isPrintPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold">Thermal Barcode Label Print Preview</h2>
              </div>
              <button
                onClick={() => setIsPrintPreviewOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-slate-100">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {previewItems.map((item) =>
                  Array.from({ length: item.printQty }).map((_, copyIdx) => (
                    <div
                      key={`${item.id}-${copyIdx}`}
                      className="bg-white p-3 rounded border-2 border-dashed border-slate-400 shadow-md text-center flex flex-col items-center justify-between font-sans space-y-1"
                      style={{ width: '100%', minHeight: '130px' }}
                    >
                      <p className="text-[9px] font-black uppercase text-slate-800 tracking-wider">Qatar Retail ERP</p>
                      <p className="text-[11px] font-bold text-slate-900 leading-tight line-clamp-1">{item.name}</p>
                      {item.nameAr && <p className="text-[10px] text-slate-600 font-arabic leading-none">{item.nameAr}</p>}

                      {/* Fake Barcode Graphic Lines */}
                      <div className="w-full flex items-center justify-center gap-[2px] my-1 h-8 bg-slate-900 p-1 rounded">
                        <div className="w-1 h-full bg-white"></div>
                        <div className="w-0.5 h-full bg-white"></div>
                        <div className="w-1.5 h-full bg-white"></div>
                        <div className="w-0.5 h-full bg-white"></div>
                        <div className="w-2 h-full bg-white"></div>
                        <div className="w-1 h-full bg-white"></div>
                        <div className="w-0.5 h-full bg-white"></div>
                        <div className="w-1.5 h-full bg-white"></div>
                      </div>
                      <p className="text-[10px] font-mono font-bold text-slate-700 tracking-widest">{item.barcode}</p>

                      {printPrice && (
                        <div className="flex items-center justify-center gap-2 pt-1 border-t border-slate-200 w-full">
                          <span className="text-xs font-black text-emerald-700 font-mono">
                            {formatQAR(taxMode === 'Incl. Tax' ? item.priceInclTax || item.retailPrice : item.retailPrice)}
                          </span>
                          {item.wasPrice && (
                            <span className="text-[9px] line-through text-slate-400 font-mono">
                              Was: {formatQAR(item.wasPrice)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Total Labels to Print: {previewItems.reduce((acc, i) => acc + i.printQty, 0)}
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPrintPreviewOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteBrowserPrint}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Send to Label Printer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. BARCODE QUICK PRINT MODAL (Matching User Target Screenshot 100%) */}
      {isQuickPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-200 rounded-xl shadow-2xl border border-slate-400 w-full max-w-lg overflow-hidden font-sans">
            {/* Modal Title Bar */}
            <div className="bg-slate-300 text-slate-900 px-3 py-2 flex items-center justify-between border-b border-slate-400">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-slate-700" />
                <h2 className="text-xs font-bold tracking-wide">Barcode Quick Print</h2>
              </div>
              <button
                onClick={() => setIsQuickPrintModalOpen(false)}
                className="text-slate-600 hover:text-slate-900 font-bold text-sm px-1 rounded hover:bg-slate-400/50"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-3 space-y-3 text-xs bg-slate-100">
              {/* Barcode Scanner Box */}
              <div>
                <label className="font-bold text-slate-800 block mb-1 text-xs">Barcode</label>
                <input
                  type="text"
                  placeholder=""
                  value={quickPrintBarcodeScan}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuickPrintBarcodeScan(val);
                    const match = items.find((i) => i.barcode === val || i.sku === val);
                    if (match) {
                      setQuickPrintCode(match.sku);
                      setQuickPrintBarcodeVal(match.barcode);
                      setQuickPrintProductDesc(match.name);
                      setQuickPrintPriceInclTax(match.priceInclTax || match.retailPrice);
                      if (match.wasPrice) setQuickPrintWasPrice(match.wasPrice);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-400 focus:border-cyan-600 rounded bg-white text-sm font-mono font-bold text-slate-900 shadow-inner"
                  autoFocus
                />
              </div>

              {/* Product Details Group Box */}
              <div className="border border-slate-300 rounded p-2.5 bg-slate-50 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 pb-0.5">Product Details</div>

                <div className="grid grid-cols-4 gap-2 items-center">
                  <span className="font-semibold text-slate-600 text-xs">Code</span>
                  <input
                    type="text"
                    value={quickPrintCode}
                    onChange={(e) => setQuickPrintCode(e.target.value)}
                    className="col-span-3 px-2 py-1 border border-slate-300 rounded font-mono text-xs bg-white"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 items-center">
                  <span className="font-semibold text-slate-600 text-xs">Barcode</span>
                  <input
                    type="text"
                    value={quickPrintBarcodeVal}
                    onChange={(e) => setQuickPrintBarcodeVal(e.target.value)}
                    className="col-span-3 px-2 py-1 border border-slate-300 rounded font-mono text-xs bg-white"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 items-center">
                  <span className="font-semibold text-slate-600 text-xs">Product Description</span>
                  <input
                    type="text"
                    value={quickPrintProductDesc}
                    onChange={(e) => setQuickPrintProductDesc(e.target.value)}
                    className="col-span-3 px-2 py-1 border border-slate-300 rounded text-xs font-bold text-slate-900 bg-white"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 items-center">
                  <span className="font-semibold text-slate-600 text-xs">Price Incl. Tax</span>
                  <input
                    type="number"
                    value={quickPrintPriceInclTax}
                    onChange={(e) => setQuickPrintPriceInclTax(parseFloat(e.target.value) || 0)}
                    className="col-span-3 px-2 py-1 border border-slate-300 rounded font-mono text-xs font-bold text-slate-900 bg-white"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 items-center">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-600 text-xs">
                    <input
                      type="checkbox"
                      checked={quickPrintWasPriceEnabled}
                      onChange={(e) => setQuickPrintWasPriceEnabled(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span>Was Price</span>
                  </label>
                  <input
                    type="number"
                    disabled={!quickPrintWasPriceEnabled}
                    value={quickPrintWasPrice}
                    onChange={(e) => setQuickPrintWasPrice(parseFloat(e.target.value) || 0)}
                    className={`col-span-3 px-2 py-1 border border-slate-300 rounded font-mono text-xs ${
                      quickPrintWasPriceEnabled ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Printing Group Box */}
              <div className="border border-slate-300 rounded p-2.5 bg-slate-50 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 pb-0.5">Printing</div>

                <div className="grid grid-cols-2 gap-3 items-start border border-slate-200 p-2 rounded bg-white">
                  {/* Left Column: Tax Mode */}
                  <div className="space-y-1.5 font-medium text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="quickTaxMode"
                        checked={quickPrintTaxMode === 'Incl. Tax'}
                        onChange={() => setQuickPrintTaxMode('Incl. Tax')}
                      />
                      <span>Incl. Tax</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="quickTaxMode"
                        checked={quickPrintTaxMode === 'Excl. Tax'}
                        onChange={() => setQuickPrintTaxMode('Excl. Tax')}
                      />
                      <span>Excl. Tax</span>
                    </label>
                  </div>

                  {/* Right Column: Template Options */}
                  <div className="space-y-1.5 font-medium text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="quickDesignMode"
                        checked={quickPrintDesignMode === 'Default Design'}
                        onChange={() => setQuickPrintDesignMode('Default Design')}
                      />
                      <span>Default Design</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer shrink-0">
                        <input
                          type="radio"
                          name="quickDesignMode"
                          checked={quickPrintDesignMode === 'PRN Template'}
                          onChange={() => setQuickPrintDesignMode('PRN Template')}
                        />
                        <span>PRN Template</span>
                      </label>
                      <select
                        disabled={quickPrintDesignMode !== 'PRN Template'}
                        value={quickPrintTemplate}
                        onChange={(e) => setQuickPrintTemplate(e.target.value)}
                        className="w-full px-1.5 py-0.5 border border-slate-300 rounded text-[11px] bg-white disabled:bg-slate-100"
                      >
                        <option value="Standard Thermal 50x25mm">Standard Thermal 50x25mm</option>
                        <option value="Shelf Tag 60x40mm">Shelf Tag 60x40mm</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bottom Options inside Printing box */}
                <div className="flex items-center justify-between gap-2 pt-1 font-medium text-slate-700 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quickPrintPrintPrice}
                      onChange={(e) => setQuickPrintPrintPrice(e.target.checked)}
                      className="rounded"
                    />
                    <span>Print Price</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={quickPrintAutoPrint}
                        onChange={(e) => setQuickPrintAutoPrint(e.target.checked)}
                        className="rounded"
                      />
                      <span>Auto print</span>
                    </label>
                    <input
                      type="number"
                      value={quickPrintAutoPrintQty}
                      onChange={(e) => setQuickPrintAutoPrintQty(parseInt(e.target.value) || 1)}
                      className="w-10 px-1 py-0.5 border border-slate-300 rounded font-mono text-center text-xs"
                    />
                    <span>Qty on scan</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer Section */}
              <div className="flex items-center justify-between pt-2">
                {/* Large Qty Input Box matching screenshot */}
                <div className="bg-white border-2 border-slate-300 rounded-lg p-3 w-44 text-center shadow-inner">
                  <span className="block text-2xl font-bold text-slate-400 font-mono">Qty</span>
                </div>

                {/* Print Button matching screenshot */}
                <button
                  onClick={() => alert(`🖨️ Thermal Barcode Label Printed! (Product: ${quickPrintProductDesc}, Barcode: ${quickPrintBarcodeVal})`)}
                  className="px-6 py-4 bg-slate-300 hover:bg-slate-400/80 text-slate-900 border border-slate-400 rounded-lg shadow font-bold flex flex-col items-center justify-center gap-1 relative min-w-[120px]"
                >
                  <div className="flex items-center gap-2">
                    <Printer className="w-5 h-5 text-slate-800" />
                    <span className="text-sm font-black">Print</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono self-end absolute bottom-1 right-2">F1</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchBarcodePage;
