import React, { useState, useEffect } from 'react';
import { formatQAR } from '@qatar-erp/utils';
import { productsService } from '@qatar-erp/api';
import {
  ShoppingBag, RotateCcw, DollarSign, Lock, RefreshCw, Search, CreditCard, Wifi, WifiOff, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaymentModal } from '../components/PaymentModal';
import { HoldRecallModal } from '../components/HoldRecallModal';
import { CashDropModal } from '../components/CashDropModal';
import { syncManager } from '../services/syncManager';
import { CartRow } from '../types/posModule.types';
import { useAuth } from '../../../app/providers/AuthProvider';

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
      name: 'Almarai Fresh Milk 1L',
      description: 'Full Cream',
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
      description: 'Premium White',
      qty: 1,
      unitPrice: 45.00,
      tax: 0.00,
      discount: 0.00,
      lineTotal: 45.00,
    },
  ]);

  const grandTotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);

  const processBarcodeSearch = async (term: string) => {
    if (!term.trim()) return;

    // Search by barcode / SKU / name in productsService (localStorage)
    const product = await productsService.getProductByBarcode(term);
    
    if (product) {
      // Product found in localStorage store!
      setCart((prev) => [
        ...prev,
        {
          id: `item-${Date.now()}`,
          barcode: product.barcode,
          name: product.name,
          description: product.categoryName || 'General Item',
          qty: 1,
          unitPrice: product.retailPrice,
          tax: 0.00,
          discount: 0.00,
          lineTotal: product.retailPrice,
        },
      ]);
    } else {
      // Search partial match in localStorage products
      const allProducts = productsService.getProductsSync();
      const match = allProducts.find(
        (p) =>
          p.name.toLowerCase().includes(term.toLowerCase()) ||
          p.sku.toLowerCase().includes(term.toLowerCase())
      );

      if (match) {
        setCart((prev) => [
          ...prev,
          {
            id: `item-${Date.now()}`,
            barcode: match.barcode,
            name: match.name,
            description: match.categoryName || 'General Item',
            qty: 1,
            unitPrice: match.retailPrice,
            tax: 0.00,
            discount: 0.00,
            lineTotal: match.retailPrice,
          },
        ]);
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
              className="text-xs font-semibold text-rose-400 hover:text-rose-300"
            >
              Clear Cart
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950/50 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">Item Details</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {cart.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-sans">
                      <p className="font-bold text-white text-sm">{item.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{item.barcode}</p>
                    </td>
                    <td className="p-3 text-center font-bold text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            setCart(
                              cart
                                .map((c) => (c.id === item.id ? { ...c, qty: c.qty - 1, lineTotal: (c.qty - 1) * c.unitPrice } : c))
                                .filter((c) => c.qty > 0)
                            )
                          }
                          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span>{item.qty}</span>
                        <button
                          onClick={() =>
                            setCart(
                              cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1, lineTotal: (c.qty + 1) * c.unitPrice } : c))
                            )
                          }
                          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-3 text-right font-semibold">{formatQAR(item.unitPrice)}</td>
                    <td className="p-3 text-right font-bold text-emerald-400 text-sm">{formatQAR(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTAL BANNER */}
          <div className="h-20 bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Payable Amount</span>
              <p className="text-xs text-slate-500">Includes 0% Qatar VAT</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-emerald-400 tracking-tight font-mono">{formatQAR(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* RIGHT: TOUCH NUMERIC KEYPAD & BARCODE INPUT */}
        <div className="w-[420px] bg-slate-950 p-4 flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Barcode / Item Search</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      processBarcodeSearch(barcodeInput);
                    }
                  }}
                  placeholder="Scan barcode or type SKU..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                onClick={() => processBarcodeSearch(barcodeInput)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
              >
                Find
              </button>
            </div>

            {/* NUMERIC TOUCH KEYPAD GRID */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {['7', '8', '9', '4', '5', '6', '1', '2', '3', 'Clear', '0', 'Enter'].map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeypadClick(key)}
                  className={`h-14 rounded-xl text-lg font-bold transition-colors flex items-center justify-center ${
                    key === 'Enter'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white col-span-1'
                      : key === 'Clear'
                      ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800'
                      : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-800'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* BOTTOM ACTIONS & CHECKOUT */}
          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={() => setIsPaymentOpen(true)}
              disabled={cart.length === 0}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-lg rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              <CreditCard className="w-5 h-5" />
              <span>Checkout / Payment ({formatQAR(grandTotal)})</span>
            </button>
          </div>
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
        onRecallInvoice={() => setIsHoldOpen(false)}
      />

      <CashDropModal
        isOpen={isCashDropOpen}
        onClose={() => setIsCashDropOpen(false)}
      />
    </div>
  );
};
