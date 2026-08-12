import React, { useState } from 'react';
import { formatQAR } from '@qatar-erp/utils';
import {
  ShoppingBag, RotateCcw, DollarSign, Lock, RefreshCw, Search, Trash2, PauseCircle, Tag, Truck, CreditCard, CheckCircle, Wifi, WifiOff
} from 'lucide-react';
import { PaymentModal } from '../../components/PaymentModal';
import { HoldRecallModal } from '../../components/HoldRecallModal';
import { CashDropModal } from '../../components/CashDropModal';
import { syncManager } from '../../offline/syncManager';

export interface CartRow {
  id: string;
  barcode: string;
  name: string;
  description?: string;
  qty: number;
  unitPrice: number;
  tax: number;
  discount: number;
  lineTotal: number;
}

export const POSLayout: React.FC = () => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
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

  const handleKeypadClick = (val: string) => {
    if (val === 'Clear') {
      setBarcodeInput('');
    } else if (val === 'Enter') {
      if (barcodeInput === '6251034000012') {
        setCart([
          ...cart,
          {
            id: `item-${Date.now()}`,
            barcode: '6251034000012',
            name: 'Rayyan Water 500ml',
            description: 'Pack of 24',
            qty: 1,
            unitPrice: 18.00,
            tax: 0.00,
            discount: 0.00,
            lineTotal: 18.00,
          },
        ]);
        setBarcodeInput('');
      } else {
        setBarcodeInput('');
      }
    } else {
      setBarcodeInput((prev) => prev + val);
    }
  };

  const handleCompleteSale = () => {
    syncManager.enqueueTransaction({ cart, grandTotal, date: new Date().toISOString() });
    setPendingSync(syncManager.getPendingCount());
    setCart([]);
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col select-none overflow-hidden font-sans">
      {/* TOP ACTION BAR */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-bold text-white shadow">
            <ShoppingBag className="w-4 h-4" />
            <span>POS Sale</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-200 border border-slate-700">
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Recall Invoice</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-200 border border-slate-700">
            <DollarSign className="w-4 h-4 text-sky-400" />
            <span>Cash Drop</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-200 border border-slate-700">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Open Drawer</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-200 border border-slate-700">
            <RefreshCw className="w-4 h-4 text-rose-400" />
            <span>Sale / Return</span>
          </button>
        </div>

        {/* Offline Status Pill & Cashier Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isOnline
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                : 'bg-amber-950/80 text-amber-400 border-amber-800'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online - Synced' : `Offline (${pendingSync} Pending)`}</span>
          </button>

          <div className="text-right">
            <p className="text-xs font-bold text-emerald-400 leading-none">REG-01 (Main Register)</p>
            <p className="text-[11px] text-slate-400">Cashier: Ahmed Al-Mansoori</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-emerald-400">
            AM
          </div>
        </div>
      </header>

      {/* MAIN SPLIT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDE: TAX INVOICE / CART TABLE */}
        <div className="flex-1 flex flex-col border-r border-slate-800 bg-slate-900/50">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">TAX INVOICE</span>
            <span className="text-xs text-slate-400 font-mono">Invoice #: QTR-2026-0891</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-semibold uppercase sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="p-3">Barcode</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-right">Tax</th>
                  <th className="p-3 text-right">Discount</th>
                  <th className="p-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {cart.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40">
                    <td className="p-3 text-slate-400">{row.barcode}</td>
                    <td className="p-3 font-semibold text-white font-sans">{row.name}</td>
                    <td className="p-3 text-slate-400 font-sans">{row.description || '-'}</td>
                    <td className="p-3 text-center font-bold text-emerald-400 text-sm">{row.qty}</td>
                    <td className="p-3 text-right">{formatQAR(row.unitPrice)}</td>
                    <td className="p-3 text-right">{formatQAR(row.tax)}</td>
                    <td className="p-3 text-right">{formatQAR(row.discount)}</td>
                    <td className="p-3 text-right font-bold text-white text-sm">{formatQAR(row.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDE: BARCODE SCANNER & TOUCH KEYPAD */}
        <div className="w-[380px] bg-slate-900 flex flex-col p-4 gap-4 border-l border-slate-800">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400">Scan Barcode / Product Search</label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan barcode or type..."
                className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-lg font-mono text-emerald-400 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '.'].map((key) => (
              <button
                key={key}
                onClick={() => handleKeypadClick(key)}
                className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl text-2xl font-bold text-white flex items-center justify-center shadow-sm border border-slate-700"
              >
                {key}
              </button>
            ))}
            <button
              onClick={() => handleKeypadClick('Clear')}
              className="col-span-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm uppercase py-3 border border-rose-500"
            >
              Clear
            </button>
            <button
              onClick={() => handleKeypadClick('Enter')}
              className="col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-base uppercase py-3 border border-emerald-500"
            >
              Enter
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="h-16 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => setCart([])} className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold rounded-lg text-xs border border-rose-800">
            Clear
          </button>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs border border-slate-700">
            Remove
          </button>
          <button className="px-4 py-2 bg-amber-950/80 hover:bg-amber-900 text-amber-300 font-medium rounded-lg text-xs border border-amber-800">
            Hold
          </button>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs border border-slate-700">
            Discount
          </button>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs border border-slate-700">
            Change Price
          </button>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs border border-slate-700">
            Delivery
          </button>
        </div>

        {/* TOTAL DISPLAY BANNER */}
        <div className="flex items-center gap-4 bg-emerald-950/80 border border-emerald-500/50 px-6 py-2 rounded-xl">
          <div className="text-right">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">GRAND TOTAL</span>
            <span className="text-2xl font-black text-emerald-300 font-mono tracking-tight">{formatQAR(grandTotal)}</span>
          </div>
          <button
            onClick={() => setIsPaymentOpen(true)}
            disabled={cart.length === 0}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-lg uppercase shadow-lg flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>PAY NOW</span>
          </button>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        grandTotal={grandTotal}
        onCompleteSale={handleCompleteSale}
      />
    </div>
  );
};
