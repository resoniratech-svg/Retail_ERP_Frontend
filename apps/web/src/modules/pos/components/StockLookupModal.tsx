import React, { useState } from 'react';
import { Play, Ban, Search } from 'lucide-react';

export interface StockLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProductToCart: (product: { barcode: string; name: string; price: number }) => void;
}

export const StockLookupModal: React.FC<StockLookupModalProps> = ({
  isOpen,
  onClose,
  onAddProductToCart,
}) => {
  const [barcodeQuery, setBarcodeQuery] = useState('346578');
  const [showCost, setShowCost] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Saudi Arabia');

  // Selected item state matching screenshot fields
  const [productDetails, setProductDetails] = useState({
    code: '123',
    description: 'sdfghj',
    arabicName: 'منتج تجريبي',
    priceExclTax: '13.0435',
    tax: '0.6522',
    priceInclTax: '13.6957',
    promoPrice: '0.00',
    barcode: '346578',
    stockCount: '120.000',
  });

  if (!isOpen) return null;

  const handleSearch = () => {
    if (barcodeQuery.trim() === '346578' || barcodeQuery.toLowerCase().includes('sdfghj')) {
      setProductDetails({
        code: '123',
        description: 'sdfghj',
        arabicName: 'منتج تجريبي',
        priceExclTax: '13.0435',
        tax: '0.6522',
        priceInclTax: '13.6957',
        promoPrice: '0.00',
        barcode: '346578',
        stockCount: '120.000',
      });
    } else {
      setProductDetails({
        code: '124',
        description: `Product (${barcodeQuery})`,
        arabicName: 'منتج محلي',
        priceExclTax: '15.0000',
        tax: '0.7500',
        priceInclTax: '15.7500',
        promoPrice: '0.00',
        barcode: barcodeQuery,
        stockCount: '45.000',
      });
    }
  };

  const handleConfirmAdd = () => {
    onAddProductToCart({
      barcode: productDetails.barcode,
      name: productDetails.description,
      price: parseFloat(productDetails.priceInclTax) || 13.04,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 select-none font-sans text-xs">
      <div className="bg-slate-200 rounded-xl shadow-2xl border border-slate-400 w-full max-w-3xl overflow-hidden flex flex-col h-[560px]">
        {/* 1. TITLE BAR (Matching Stock LookUp Screenshot 3) */}
        <div className="bg-slate-300 text-slate-900 px-3 py-1.5 flex items-center justify-between border-b border-slate-400 shrink-0">
          <h2 className="text-xs font-bold tracking-wide">Stock LookUp</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleConfirmAdd}
              className="px-3 py-1 bg-slate-100 hover:bg-white border border-slate-400 rounded font-bold text-slate-900 flex items-center gap-1.5 shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              <span>Add (F1)</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1 bg-slate-100 hover:bg-white border border-slate-400 rounded font-bold text-slate-900 flex items-center gap-1.5 shadow-2xs"
            >
              <Ban className="w-3.5 h-3.5 text-rose-600" />
              <span>Cancel</span>
            </button>

            <button onClick={onClose} className="text-slate-600 hover:text-slate-900 font-bold text-sm px-1.5 py-0.5 rounded hover:bg-slate-400/50">✕</button>
          </div>
        </div>

        {/* 2. SCAN BARCODE / SELECT PRODUCT TOP SECTION */}
        <div className="p-3 bg-slate-100 border-b border-slate-300 space-y-2">
          <div className="text-center font-bold text-slate-800 text-xs">
            Scan Barcode / Select Product
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={barcodeQuery}
                onChange={(e) => setBarcodeQuery(e.target.value)}
                placeholder="Scan or type barcode..."
                className="w-56 px-2.5 py-1 border border-slate-400 rounded bg-white text-xs font-mono font-bold focus:border-cyan-600 focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSearch}
                className="p-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded"
              >
                <Search className="w-4 h-4 text-blue-600" />
              </button>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={showCost}
                onChange={(e) => setShowCost(e.target.checked)}
                className="rounded border-slate-300"
              />
              <span>Show Cost</span>
            </label>
          </div>
        </div>

        {/* 3. MAIN SPLIT BODY (PRODUCT & STOCK DETAILS LEFT + UNITS AVAILABLE RIGHT) */}
        <div className="flex-1 flex overflow-hidden p-2 gap-2">
          {/* LEFT SUB-PANEL: PRODUCT & STOCK DETAILS */}
          <div className="w-1/2 border border-slate-300 rounded bg-white p-2.5 flex flex-col gap-2 shadow-xs overflow-y-auto">
            {/* Product Details Section */}
            <div className="bg-slate-200 px-2 py-0.5 font-bold text-slate-700 border-b border-slate-300 rounded-t">
              Product Details
            </div>

            <div className="space-y-1.5 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-24 shrink-0">Code</span>
                <input type="text" value={productDetails.code} readOnly className="w-full px-2 py-0.5 border border-slate-300 rounded font-mono bg-slate-100" />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-24 shrink-0">Description</span>
                <input type="text" value={productDetails.description} readOnly className="w-full px-2 py-0.5 border border-slate-300 rounded font-bold bg-slate-100" />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-24 shrink-0">Arabic Name</span>
                <input type="text" value={productDetails.arabicName} readOnly className="w-full px-2 py-0.5 border border-slate-300 rounded font-semibold bg-slate-100 text-right font-sans" />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-24 shrink-0">Price Excl. Tax</span>
                <input type="text" value={productDetails.priceExclTax} readOnly className="w-28 px-2 py-0.5 border border-slate-300 rounded font-mono bg-slate-100 text-right" />
                <span className="shrink-0 font-bold">Tax</span>
                <input type="text" value={productDetails.tax} readOnly className="w-full px-2 py-0.5 border border-slate-300 rounded font-mono bg-slate-100 text-right" />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-24 shrink-0">Price Incl. Tax</span>
                <input type="text" value={productDetails.priceInclTax} readOnly className="w-28 px-2 py-0.5 border border-slate-300 rounded font-mono font-bold bg-slate-200 text-right text-slate-900" />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-24 shrink-0">Promo Price</span>
                <input type="text" value={productDetails.promoPrice} readOnly className="w-28 px-2 py-0.5 border border-slate-300 rounded font-mono bg-slate-100 text-right" />
              </div>
            </div>

            {/* Stock Details Section matching Screenshot 3 */}
            <div className="bg-slate-200 px-2 py-0.5 font-bold text-slate-700 border-b border-slate-300 rounded-t mt-1">
              Stock Details
            </div>

            <div className="space-y-1.5 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-24 shrink-0">Location</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-2 py-0.5 border border-slate-300 rounded font-bold bg-white text-xs"
                >
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Doha Main Store">Doha Main Store</option>
                  <option value="All Locations">All Locations</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-24 shrink-0">Stock</span>
                <input
                  type="text"
                  value={productDetails.stockCount}
                  readOnly
                  className="w-full px-2 py-0.5 border border-slate-300 rounded font-mono font-bold text-right bg-slate-100 text-emerald-800"
                />
              </div>
            </div>
          </div>

          {/* RIGHT SUB-PANEL: UNITS AVAILABLE */}
          <div className="w-1/2 border border-slate-300 rounded bg-white p-2.5 flex flex-col gap-2 shadow-xs">
            <div className="bg-slate-200 px-2 py-0.5 font-bold text-slate-700 border-b border-slate-300 rounded-t">
              Units Available
            </div>

            <div className="flex-1 overflow-auto border border-slate-200 rounded">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 font-bold text-slate-600 uppercase text-[10px] border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="p-2 border-r border-slate-200">Location</th>
                    <th className="p-2 border-r border-slate-200">UOM</th>
                    <th className="p-2 text-right">Stock Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  <tr className="hover:bg-slate-50">
                    <td className="p-2 border-r border-slate-200 font-bold">Saudi Arabia</td>
                    <td className="p-2 border-r border-slate-200 font-mono">123 (PCS)</td>
                    <td className="p-2 font-mono text-right font-bold text-emerald-700">120.000</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2 border-r border-slate-200 font-bold">Doha Main Store</td>
                    <td className="p-2 border-r border-slate-200 font-mono">123 (PCS)</td>
                    <td className="p-2 font-mono text-right font-bold text-emerald-700">85.000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockLookupModal;
