import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsService, syncManager } from '@qatar-erp/api';
import { formatQAR } from '@qatar-erp/utils';
import { useAuth } from '../../../app/providers/AuthProvider';
import {
  ShoppingBag,
  RotateCcw,
  Search,
  Plus,
  Minus,
  Trash2,
  Lock,
  ArrowLeft,
  Wifi,
  WifiOff,
  DollarSign,
} from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';
import { HoldRecallModal } from '../components/HoldRecallModal';
import { CashDropModal } from '../components/CashDropModal';
import { CartRow } from '../types/posModule.types';
import { Product } from '@qatar-erp/types';

export const POSLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [barcodeInput, setBarcodeInput] = useState('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isHoldOpen, setIsHoldOpen] = useState(false);
  const [isCashDropOpen, setIsCashDropOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);

  const [cart, setCart] = useState<CartRow[]>([
    {
      id: 'item-1',
      barcode: '6281007001015',
      name: 'Almarai Fresh Milk Full Cream 1L',
      description: 'Dairy & Eggs',
      qty: 2,
      unitPrice: 7.50,
      tax: 0.00,
      discount: 0.00,
      lineTotal: 15.00,
    },
    {
      id: 'item-2',
      barcode: '8901234567890',
      name: 'Khabari Basmati Rice 5kg',
      description: 'Rice & Grains',
      qty: 1,
      unitPrice: 45.00,
      tax: 0.00,
      discount: 0.00,
      lineTotal: 45.00,
    },
  ]);

  const grandTotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);

  const addProductToCart = (prod: Product) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.barcode.toLowerCase() === prod.barcode.toLowerCase()
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.qty + 1;
        updated[existingIndex] = {
          ...existing,
          qty: newQty,
          lineTotal: newQty * existing.unitPrice,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: `item-${Date.now()}`,
          barcode: prod.barcode,
          name: prod.name,
          description: prod.categoryName || 'General Item',
          qty: 1,
          unitPrice: prod.retailPrice,
          tax: 0.00,
          discount: 0.00,
          lineTotal: prod.retailPrice,
        },
      ];
    });
  };

  const processBarcodeSearch = async (term: string) => {
    if (!term.trim()) return;

    // Search by barcode / SKU / name in productsService (localStorage)
    const product = await productsService.getProductByBarcode(term);
    
    if (product) {
      addProductToCart(product);
    } else {
      // Search partial match in localStorage products
      const allProducts = productsService.getProductsSync();
      const match = allProducts.find(
        (p) =>
          p.name.toLowerCase().includes(term.toLowerCase()) ||
          p.sku.toLowerCase().includes(term.toLowerCase())
      );

      if (match) {
        addProductToCart(match);
      } else {
        alert(`Product with Barcode / SKU "${term}" not found! Add it in Products master catalog first.`);
      }
    }
    setBarcodeInput('');
  };

  const handleKeypadClick = (val: string) => {
    if (val === 'Clear') {
      setBarcodeInput('');
    } else if (val === 'Enter') {
      processBarcodeSearch(barcodeInput);
    } else {
      setBarcodeInput((prev) => prev + val);
    }
  };

  const handleCompleteSale = async () => {
    const itemsToDeduct = cart.map((c) => ({
      id: c.id,
      barcode: c.barcode,
      sku: c.barcode,
      quantity: c.qty,
    }));
    await productsService.deductStock(itemsToDeduct);

    syncManager.enqueueTransaction({ cart, grandTotal, date: new Date().toISOString() });
    setPendingSync(syncManager.getPendingCount());
    setCart([]);
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col select-none overflow-hidden font-sans fixed inset-0 z-50">
      {/* TOP ACTION BAR */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to ERP</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white shadow">
            <ShoppingBag className="w-4 h-4" />
            <span>POS Sale</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-300 border border-slate-700">
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Return Mode</span>
          </button>
        </div>

        {/* STATUS & OFFLINE PILL */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <button
            onClick={() => setIsCashDropOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-sky-400 font-bold"
          >
            <DollarSign className="w-4 h-4" />
            <span>Cash Drop / Safe</span>
          </button>

          <button
            onClick={() => setIsHoldOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-amber-400 font-bold"
          >
            <Lock className="w-4 h-4" />
            <span>Recall Invoices</span>
          </button>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isOnline ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online - Synced' : `Offline (${pendingSync} Pending)`}</span>
          </div>

          <span className="text-slate-400">Cashier: <strong className="text-white">{user?.firstName || 'Ahmed'}</strong></span>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: CART TABLE */}
        <div className="flex-1 flex flex-col bg-slate-900 border-r border-slate-800">
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Tax Invoice Items</h2>
            <button
              onClick={() => setCart([])}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              Clear Cart
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <ShoppingBag className="w-12 h-12 mb-2 opacity-30" />
                <p className="text-sm font-semibold">Cart is empty</p>
                <p className="text-xs">Scan a barcode or search products on the right keypad.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-2">Item Details</th>
                    <th className="py-2 text-center">QTY</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {cart.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/50">
                      <td className="py-3 pr-2">
                        <p className="font-bold text-white text-sm">{row.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{row.barcode}</p>
                      </td>
                      <td className="py-3 text-center">
                        <div className="inline-flex items-center gap-2 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          <button
                            onClick={() =>
                              setCart((prev) =>
                                prev
                                  .map((item) =>
                                    item.id === row.id
                                      ? {
                                          ...item,
                                          qty: item.qty - 1,
                                          lineTotal: (item.qty - 1) * item.unitPrice,
                                        }
                                      : item
                                  )
                                  .filter((item) => item.qty > 0)
                              )
                            }
                            className="hover:text-rose-400"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold w-4 text-center">{row.qty}</span>
                          <button
                            onClick={() =>
                              setCart((prev) =>
                                prev.map((item) =>
                                  item.id === row.id
                                    ? {
                                        ...item,
                                        qty: item.qty + 1,
                                        lineTotal: (item.qty + 1) * item.unitPrice,
                                      }
                                    : item
                                )
                              )
                            }
                            className="hover:text-emerald-400"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-300">
                        {formatQAR(row.unitPrice)}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-400">
                        {formatQAR(row.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* CART SUMMARY FOOTER */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 block uppercase">Total Payable Amount</span>
              <span className="text-[10px] text-slate-500">Includes 0% Qatar VAT</span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-emerald-400 font-mono">
                {formatQAR(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: TOUCH KEYPAD & SCANNER */}
        <div className="w-[420px] bg-slate-950 flex flex-col p-4 gap-4">
          {/* BARCODE SEARCH INPUT */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              processBarcodeSearch(barcodeInput);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Scan barcode or type SKU..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs rounded-xl shadow"
            >
              Find
            </button>
          </form>

          {/* TOUCH NUMERIC KEYPAD */}
          <div className="grid grid-cols-3 gap-2 flex-1">
            {['7', '8', '9', '4', '5', '6', '1', '2', '3', 'Clear', '0', 'Enter'].map((btn) => (
              <button
                key={btn}
                onClick={() => handleKeypadClick(btn)}
                className={`rounded-xl font-bold text-lg flex items-center justify-center border transition-active active:scale-95 ${
                  btn === 'Enter'
                    ? 'bg-emerald-600 border-emerald-500 text-white font-black'
                    : btn === 'Clear'
                    ? 'bg-rose-950 border-rose-900 text-rose-400'
                    : 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800'
                }`}
              >
                {btn}
              </button>
            ))}
          </div>

          {/* CHECKOUT BUTTON */}
          <button
            disabled={cart.length === 0}
            onClick={() => setIsPaymentOpen(true)}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-black text-slate-950 text-base shadow-lg tracking-wide uppercase flex items-center justify-center gap-2"
          >
            <span>Checkout / Payment ({formatQAR(grandTotal)})</span>
          </button>
        </div>
      </div>

      {/* MODALS */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        grandTotal={grandTotal}
        onCompleteSale={handleCompleteSale}
      />

      <HoldRecallModal
        isOpen={isHoldOpen}
        onClose={() => setIsHoldOpen(false)}
        onRecallInvoice={(recalledItems) => {
          setCart(recalledItems);
          setIsHoldOpen(false);
        }}
      />

      <CashDropModal
        isOpen={isCashDropOpen}
        onClose={() => setIsCashDropOpen(false)}
      />
    </div>
  );
};

export default POSLayout;
