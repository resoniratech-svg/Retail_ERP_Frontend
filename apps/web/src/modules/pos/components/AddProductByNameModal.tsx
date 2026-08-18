import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export interface AddProductByNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (productName: string) => void;
}

export const AddProductByNameModal: React.FC<AddProductByNameModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [selectedProduct, setSelectedProduct] = useState('sdfghj');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (selectedProduct.trim()) {
      onAddProduct(selectedProduct);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 select-none font-sans text-xs">
      <div className="bg-slate-200 rounded-xl shadow-2xl border border-slate-400 w-full max-w-md overflow-hidden flex flex-col">
        {/* 1. TITLE BAR (Matching Screenshot 2 - Notes) */}
        <div className="bg-slate-300 text-slate-900 px-3 py-1.5 flex items-center justify-between border-b border-slate-400 shrink-0">
          <h2 className="text-xs font-bold tracking-wide">Notes</h2>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-900 font-bold text-sm px-1.5 py-0.5 rounded hover:bg-slate-400/50">✕</button>
        </div>

        {/* 2. INNER BANNER */}
        <div className="bg-slate-300 py-1 text-center font-bold text-slate-800 text-xs border-b border-slate-400 shadow-inner">
          Add Products
        </div>

        {/* 3. MAIN FORM BODY */}
        <div className="p-4 bg-slate-100 space-y-4">
          <div className="flex items-center gap-2">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-slate-400 rounded bg-white text-xs font-semibold focus:border-cyan-600 focus:outline-none"
              autoFocus
            >
              <option value="sdfghj">sdfghj (346578)</option>
              <option value="Almarai Fresh Milk Full Cream 1L">Almarai Fresh Milk Full Cream 1L (6281007001015)</option>
              <option value="Lipton Yellow Label Tea Bags 100s">Lipton Yellow Label Tea Bags 100s (6291001002025)</option>
              <option value="Pinar White Cheese 500g">Pinar White Cheese 500g (6281009003033)</option>
            </select>

            <button
              onClick={handleAdd}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded font-bold text-slate-900 flex items-center gap-1 shadow-2xs"
            >
              <ArrowRight className="w-4 h-4 text-emerald-700 fill-emerald-600" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-1.5 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded font-bold text-slate-900 flex items-center gap-1.5 shadow-2xs"
            >
              <Check className="w-4 h-4 text-emerald-700" />
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductByNameModal;
