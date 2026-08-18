import React, { useState } from 'react';
import { XCircle, CheckCircle } from 'lucide-react';

export interface QuickListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: { barcode: string; name: string; price: number }) => void;
}

export const QuickListModal: React.FC<QuickListModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [matchMode, setMatchMode] = useState<'beginWith' | 'contains'>('beginWith');
  const [selectedListTab, setSelectedListTab] = useState('List 1');

  // Sample items per list tab
  const listItemsMap: Record<string, Array<{ barcode: string; name: string; price: number; category: string }>> = {
    'List 1': [
      { barcode: '6281007001015', name: 'Almarai Fresh Milk Full Cream 1L', price: 7.50, category: 'Dairy' },
      { barcode: '346578', name: 'sdfghj', price: 13.04, category: 'General' },
      { barcode: '6291001002025', name: 'Lipton Yellow Label Tea Bags 100s', price: 18.00, category: 'Beverages' },
    ],
    'List 2': [
      { barcode: '6281007002022', name: 'Nido Milk Powder 2.25kg', price: 65.00, category: 'Dairy' },
      { barcode: '6291003004044', name: 'Nestle Quality Street 850g', price: 42.00, category: 'Chocolates' },
    ],
    'List 3': [
      { barcode: '6281009003033', name: 'Pinar White Cheese 500g', price: 14.50, category: 'Cheese' },
    ],
  };

  const currentItems = listItemsMap[selectedListTab] || [];
  const [selectedProduct, setSelectedProduct] = useState(currentItems[0] || null);

  if (!isOpen) return null;

  const handleConfirmSelect = () => {
    if (selectedProduct) {
      onSelectProduct(selectedProduct);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 select-none font-sans text-xs">
      <div className="bg-slate-200 rounded-xl shadow-2xl border border-slate-400 w-full max-w-5xl overflow-hidden flex flex-col h-[560px]">
        {/* 1. TITLE BAR (Matching Screenshot 1) */}
        <div className="bg-slate-300 text-slate-900 px-3 py-1.5 flex items-center justify-between border-b border-slate-400 shrink-0">
          <h2 className="text-xs font-bold tracking-wide">Quick List Listing</h2>
          <div className="flex items-center gap-1">
            <button className="text-slate-600 hover:text-slate-900 font-bold px-1.5 py-0.5 rounded hover:bg-slate-400/50">_</button>
            <button className="text-slate-600 hover:text-slate-900 font-bold px-1.5 py-0.5 rounded hover:bg-slate-400/50">□</button>
            <button onClick={onClose} className="text-slate-600 hover:text-slate-900 font-bold px-1.5 py-0.5 rounded hover:bg-slate-400/50">✕</button>
          </div>
        </div>

        {/* 2. TOP FILTER & SEARCH ROW */}
        <div className="bg-slate-100 p-2.5 border-b border-slate-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter items..."
              className="w-48 px-2.5 py-1 border border-slate-400 rounded bg-white text-xs font-medium focus:border-cyan-600 focus:outline-none"
              autoFocus
            />

            <div className="flex items-center gap-3 font-semibold text-slate-700">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="qlMatch"
                  checked={matchMode === 'beginWith'}
                  onChange={() => setMatchMode('beginWith')}
                />
                <span>Begin With (F4)</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="qlMatch"
                  checked={matchMode === 'contains'}
                  onChange={() => setMatchMode('contains')}
                />
                <span>Contains (F5)</span>
              </label>
            </div>

            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <span>List</span>
              <select
                value={selectedListTab}
                onChange={(e) => setSelectedListTab(e.target.value)}
                className="w-40 px-2 py-1 border border-slate-400 rounded bg-white text-xs font-semibold"
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <option key={i} value={`List ${i + 1}`}>
                    List {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons matching screenshot */}
          <div className="flex items-center gap-2">
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
              <span>Select [F1]</span>
            </button>
          </div>
        </div>

        {/* 3. MAIN CONTENT (GRID CENTER + RIGHT VERTICAL TABS) */}
        <div className="flex-1 flex overflow-hidden p-1 gap-1">
          {/* CENTER PRODUCT LIST DATA GRID */}
          <div className="flex-1 border border-slate-300 rounded bg-white flex flex-col overflow-hidden shadow-xs">
            <div className="bg-slate-300 py-1 text-center font-bold text-slate-800 text-xs border-b border-slate-400 shadow-inner">
              Product List
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-200 font-bold text-slate-700 uppercase text-[10px] sticky top-0 border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300">Barcode</th>
                    <th className="p-2 border-r border-slate-300">Product Name</th>
                    <th className="p-2 border-r border-slate-300">Category</th>
                    <th className="p-2 text-right">Price (QAR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-slate-400 italic">
                        No products configured in {selectedListTab}. Select another list from the right panel.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((p) => {
                      const isSelected = selectedProduct?.barcode === p.barcode;
                      return (
                        <tr
                          key={p.barcode}
                          onClick={() => setSelectedProduct(p)}
                          onDoubleClick={handleConfirmSelect}
                          className={`cursor-pointer hover:bg-sky-50 ${
                            isSelected ? 'bg-navy-900 bg-blue-900 text-white font-bold' : ''
                          }`}
                        >
                          <td className="p-2 border-r border-slate-200 font-mono font-bold">{p.barcode}</td>
                          <td className="p-2 border-r border-slate-200 font-bold">{p.name}</td>
                          <td className="p-2 border-r border-slate-200">{p.category}</td>
                          <td className="p-2 text-right font-mono font-bold">{p.price.toFixed(2)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT VERTICAL TAB STRIP matching screenshot (List 1 to List 10) */}
          <div className="w-28 bg-slate-300 border border-slate-400 rounded p-1 flex flex-col gap-1 overflow-y-auto shrink-0 shadow-inner">
            {Array.from({ length: 10 }).map((_, i) => {
              const tabName = `List ${i + 1}`;
              const active = selectedListTab === tabName;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedListTab(tabName);
                    const newItems = listItemsMap[tabName] || [];
                    setSelectedProduct(newItems[0] || null);
                  }}
                  className={`w-full py-2.5 rounded font-bold text-xs border text-center transition-all ${
                    active
                      ? 'bg-slate-100 border-slate-400 text-slate-950 shadow-md scale-102 font-black'
                      : 'bg-slate-200 hover:bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                >
                  {tabName}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickListModal;
