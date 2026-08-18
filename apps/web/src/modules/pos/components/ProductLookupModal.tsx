import React, { useState } from 'react';
import { Search, RefreshCw, XCircle, CheckCircle } from 'lucide-react';
import { Product } from '@qatar-erp/types';

export interface ProductLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: { barcode: string; name: string; price: number }) => void;
}

export const ProductLookupModal: React.FC<ProductLookupModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState<'Description' | 'Barcode' | 'Code' | 'Department' | 'Brand'>('Description');
  const [matchMode, setMatchMode] = useState<'contains' | 'beginWith'>('contains');

  // Sample Products matching screenshot (Code 123, sdfghj, Barcode 346578, Unit 123, Dept GSDUYGYG, Price 1.0000, MSP 15.00, Brand Mango)
  const [productList] = useState([
    {
      code: '123',
      name: 'sdfghj',
      barcode: '346578',
      unit: '123',
      department: 'GSDUYGYG',
      uom: 'PCS',
      priceInclTax: 1.0000,
      msp: 15.00,
      brand: 'Mango',
    },
    {
      code: '124',
      name: 'Almarai Fresh Milk Full Cream 1L',
      barcode: '6281007001015',
      unit: 'BTL',
      department: 'Dairy & Fresh',
      uom: 'BTL',
      priceInclTax: 7.50,
      msp: 7.50,
      brand: 'Almarai',
    },
    {
      code: '125',
      name: 'Lipton Yellow Label Tea Bags 100s',
      barcode: '6291001002025',
      unit: 'BOX',
      department: 'Beverages',
      uom: 'BOX',
      priceInclTax: 18.00,
      msp: 18.00,
      brand: 'Lipton',
    },
  ]);

  const [selectedProduct, setSelectedProduct] = useState(productList[0]);

  if (!isOpen) return null;

  const handleConfirmSelect = () => {
    if (selectedProduct) {
      onSelectProduct({
        barcode: selectedProduct.barcode,
        name: selectedProduct.name,
        price: selectedProduct.priceInclTax,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 select-none font-sans text-xs">
      <div className="bg-slate-200 rounded-xl shadow-2xl border border-slate-400 w-full max-w-5xl overflow-hidden flex flex-col h-[560px]">
        {/* 1. TITLE BAR (Matching Screenshot 1) */}
        <div className="bg-slate-300 text-slate-900 px-3 py-1.5 flex items-center justify-between border-b border-slate-400 shrink-0">
          <h2 className="text-xs font-bold tracking-wide">Product Listing</h2>
          <div className="flex items-center gap-1">
            <button className="text-slate-600 hover:text-slate-900 font-bold px-1.5 py-0.5 rounded hover:bg-slate-400/50">_</button>
            <button className="text-slate-600 hover:text-slate-900 font-bold px-1.5 py-0.5 rounded hover:bg-slate-400/50">□</button>
            <button onClick={onClose} className="text-slate-600 hover:text-slate-900 font-bold px-1.5 py-0.5 rounded hover:bg-slate-400/50">✕</button>
          </div>
        </div>

        {/* 2. TOP SEARCH & FILTER BAR */}
        <div className="bg-slate-100 p-2.5 border-b border-slate-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="space-y-0.5">
              <label className="font-bold text-slate-700 block text-[11px]">Product Search (F1)</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 px-2 py-1 border border-slate-400 rounded bg-white text-xs font-medium focus:border-cyan-600 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="space-y-0.5">
              <label className="font-bold text-slate-700 block text-[11px]">Search By</label>
              <select
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value as any)}
                className="w-36 px-2 py-1 border border-slate-400 rounded bg-white text-xs font-semibold"
              >
                <option value="Description">Description</option>
                <option value="Barcode">Barcode</option>
                <option value="Code">Code</option>
                <option value="Department">Department</option>
                <option value="Brand">Brand</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-3 font-semibold text-slate-700">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="matchMode"
                  checked={matchMode === 'beginWith'}
                  onChange={() => setMatchMode('beginWith')}
                />
                <span>Begin With (F4)</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="matchMode"
                  checked={matchMode === 'contains'}
                  onChange={() => setMatchMode('contains')}
                />
                <span>Contains (F5)</span>
              </label>
            </div>
          </div>

          {/* Top Right Action Buttons matching screenshot */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Product Catalog Refreshed')}
              className="px-3 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded font-bold text-slate-900 flex items-center gap-1 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Refresh [F2]</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded font-bold text-slate-900 flex items-center gap-1 shadow-2xs"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Cancel [ESC]</span>
            </button>

            <button
              onClick={handleConfirmSelect}
              className="px-4 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded font-bold text-slate-900 flex items-center gap-1 shadow-2xs"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-700 fill-emerald-600" />
              <span>Select [F3]</span>
            </button>
          </div>
        </div>

        {/* 3. PRODUCT LIST TABLE GRID (Matching Screenshot Columns) */}
        <div className="flex-1 overflow-auto bg-white p-1">
          <div className="bg-slate-300 py-1 text-center font-bold text-slate-800 text-xs border-b border-slate-400 shadow-inner">
            Product List
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-200 font-bold text-slate-700 uppercase text-[10px] sticky top-0 border-b border-slate-300">
              <tr>
                <th className="p-2 border-r border-slate-300">Code</th>
                <th className="p-2 border-r border-slate-300">Product ▲</th>
                <th className="p-2 border-r border-slate-300">Barcode</th>
                <th className="p-2 border-r border-slate-300">Unit</th>
                <th className="p-2 border-r border-slate-300">Department</th>
                <th className="p-2 border-r border-slate-300">UOM</th>
                <th className="p-2 border-r border-slate-300 text-right">Price Incl Tax</th>
                <th className="p-2 border-r border-slate-300 text-right">MSP</th>
                <th className="p-2">Brand</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {productList.map((p) => {
                const isSelected = selectedProduct.code === p.code;
                return (
                  <tr
                    key={p.code}
                    onClick={() => setSelectedProduct(p)}
                    onDoubleClick={handleConfirmSelect}
                    className={`cursor-pointer hover:bg-sky-50 ${
                      isSelected ? 'bg-navy-900 bg-blue-900 text-white font-bold' : ''
                    }`}
                  >
                    <td className="p-2 border-r border-slate-200 font-mono font-bold">{p.code}</td>
                    <td className="p-2 border-r border-slate-200 font-bold">{p.name}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{p.barcode}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{p.unit}</td>
                    <td className="p-2 border-r border-slate-200 font-bold">{p.department}</td>
                    <td className="p-2 border-r border-slate-200">{p.uom}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono font-bold">{p.priceInclTax.toFixed(4)}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono">{p.msp.toFixed(2)}</td>
                    <td className="p-2 font-bold">{p.brand}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductLookupModal;
