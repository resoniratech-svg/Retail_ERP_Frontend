import React, { useState } from 'react';
import { Play, Ban, Search } from 'lucide-react';

export interface PriceLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProductToCart: (product: { barcode: string; name: string; price: number }) => void;
}

export const PriceLookupModal: React.FC<PriceLookupModalProps> = ({
  isOpen,
  onClose,
  onAddProductToCart,
}) => {
  const [barcodeQuery, setBarcodeQuery] = useState('346578');
  const [showCost, setShowCost] = useState(false);

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
      <div className="bg-slate-200 rounded-xl shadow-2xl border border-slate-400 w-full max-w-3xl overflow-hidden flex flex-col h-[520px]">
        {/* 1. TITLE BAR (Matching Price Look Up Screenshot) */}
        <div className="bg-slate-300 text-slate-900 px-3 py-1.5 flex items-center justify-between border-b border-slate-400 shrink-0">
          <h2 className="text-xs font-bold tracking-wide">Price Look Up</h2>
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

        {/* 3. MAIN SPLIT BODY (PRODUCT DETAILS LEFT + UNITS AVAILABLE RIGHT) */}
        <div className="flex-1 flex overflow-hidden p-2 gap-2">
          {/* LEFT SUB-PANEL: PRODUCT DETAILS */}
          <div className="w-1/2 border border-slate-300 rounded bg-white p-2.5 flex flex-col gap-2 shadow-xs">
            <div className="bg-slate-200 px-2 py-0.5 font-bold text-slate-700 border-b border-slate-300 rounded-t">
              Product Details
            </div>

            <div className="space-y-2 text-xs font-semibold text-slate-700 pt-1">
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
                    <th className="p-2 border-r border-slate-200">UOM / Unit</th>
                    <th className="p-2 border-r border-slate-200 text-right">Retail Price</th>
                    <th className="p-2 text-right">Qty Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  <tr className="hover:bg-slate-50">
                    <td className="p-2 border-r border-slate-200 font-bold">123 (PCS)</td>
                    <td className="p-2 border-r border-slate-200 font-mono text-right font-bold">{productDetails.priceInclTax}</td>
                    <td className="p-2 font-mono text-right font-bold text-emerald-700">120.000</td>
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

export default PriceLookupModal;
