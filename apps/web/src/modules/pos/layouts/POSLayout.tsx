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
  Wifi,
  WifiOff,
  DollarSign,
  Printer,
  Key,
  User,
  Star,
  Truck,
  Percent,
  Edit2,
  FileText,
  Tag,
  CreditCard,
  Banknote,
  Award,
  BookOpen,
  QrCode,
  Sparkles,
  ChevronDown,
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

  // Customer & Mode states
  const [selectedCustomer, setSelectedCustomer] = useState<{ name: string; code: string } | null>(null);
  const [isReturnMode, setIsReturnMode] = useState(false);
  const [isDeliveryMode, setIsDeliveryMode] = useState(false);

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

  // Derived Summary Metrics
  const totalItemCount = cart.length;
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + (item.discount || 0), 0);
  const taxableAmt = cart.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxAmount = cart.reduce((sum, item) => sum + (item.tax || 0), 0);
  const grandTotal = taxableAmt + taxAmount - totalDiscount;

  const addProductToCart = (prod: Product) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.barcode.toLowerCase() === prod.barcode.toLowerCase()
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.qty + 1;
        const disc = existing.discount || 0;
        const tx = (newQty * existing.unitPrice) * (prod.vatRate || 0);
        updated[existingIndex] = {
          ...existing,
          qty: newQty,
          tax: tx,
          lineTotal: newQty * existing.unitPrice - disc + tx,
        };
        return updated;
      }
      const disc = prod.discount || 0;
      const tx = prod.retailPrice * (prod.vatRate || 0);
      return [
        ...prev,
        {
          id: `item-${Date.now()}`,
          barcode: prod.barcode,
          name: prod.name,
          description: prod.categoryName || 'General Item',
          qty: 1,
          unitPrice: prod.retailPrice,
          tax: tx,
          discount: disc,
          lineTotal: prod.retailPrice - disc + tx,
        },
      ];
    });
  };

  const processBarcodeSearch = async (term: string) => {
    if (!term.trim()) return;

    const product = await productsService.getProductByBarcode(term);
    if (product) {
      addProductToCart(product);
    } else {
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

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleApplyItemDiscount = (id: string) => {
    const discStr = prompt('Enter item discount amount (QAR):', '2.00');
    if (discStr !== null) {
      const discVal = parseFloat(discStr) || 0;
      setCart((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                discount: discVal,
                lineTotal: Math.max(0, item.qty * item.unitPrice - discVal + item.tax),
              }
            : item
        )
      );
    }
  };

  const handleChangePrice = (id: string) => {
    const priceStr = prompt('Override item retail unit price (QAR):');
    if (priceStr !== null) {
      const newPrice = parseFloat(priceStr) || 0;
      setCart((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                unitPrice: newPrice,
                lineTotal: Math.max(0, item.qty * newPrice - (item.discount || 0) + item.tax),
              }
            : item
        )
      );
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

  const handleOpenDrawer = () => {
    alert('🔑 Signal sent to Cash Drawer: RJ11 Pulse Triggered (Drawer Opened).');
  };

  const handleReprintInvoice = () => {
    alert('🖨️ Thermal Receipt Printing: Last tax invoice reprinted successfully.');
  };

  const handleSelectCustomer = () => {
    const name = prompt('Enter Customer Name or Phone Number (QAR Loyalty):', 'Walk-in Retail Customer');
    if (name) {
      setSelectedCustomer({ name, code: `CUST-${Math.floor(1000 + Math.random() * 9000)}` });
    }
  };

  return (
    <div className="w-full h-[calc(100vh-190px)] min-h-[580px] bg-slate-950 text-white flex flex-col select-none overflow-hidden font-sans rounded-xl border border-slate-800 shadow-2xl">
      {/* TOP SECONDARY QUICK ACTION TOOLBAR */}
      <header className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 text-xs gap-2">
        {/* LEFT ACTION BUTTONS */}
        <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto">
          <button className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold text-white shadow">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>POS Sale</span>
          </button>

          <button
            onClick={() => setIsHoldOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-slate-300 border border-slate-700"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Recall Invoice</span>
          </button>

          <button
            onClick={() => setIsCashDropOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-sky-400 border border-slate-700"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Cash Drop/Out</span>
          </button>

          <button
            onClick={handleOpenDrawer}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-indigo-400 border border-slate-700"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Open Drawer</span>
          </button>

          <button
            onClick={handleReprintInvoice}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-teal-400 border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Invoice Reprint</span>
          </button>

          <button
            onClick={() => setIsReturnMode(!isReturnMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold border ${
              isReturnMode ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isReturnMode ? 'Mode: Return' : 'Sale / Return'}</span>
          </button>

          <button
            onClick={handleSelectCustomer}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-purple-400 border border-slate-700"
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          <button
            onClick={() => alert('⭐ Loyalty Check: Customer points balance: 450 QAR Points.')}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-amber-300 border border-slate-700"
          >
            <Star className="w-3.5 h-3.5" />
            <span>Loyalty Check</span>
          </button>

          <button
            onClick={() => setIsDeliveryMode(!isDeliveryMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold border ${
              isDeliveryMode ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-800 hover:bg-slate-700 text-rose-400 border-slate-700'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Delivery List</span>
          </button>
        </div>

        {/* RIGHT STATUS & CASHIER PILL */}
        <div className="flex items-center gap-3 font-medium shrink-0">
          <div
            className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold ${
              isOnline ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online - Synced' : `Offline (${pendingSync})`}</span>
          </div>

          <span className="text-slate-400 text-xs">
            Cashier: <strong className="text-white">{user?.firstName || 'Ahmed'}</strong>
          </span>
        </div>
      </header>

      {/* MAIN POS BODY */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT AREA: CART & SUMMARY */}
        <div className="flex-1 flex flex-col bg-slate-900 border-r border-slate-800">
          {/* TAX INVOICE HEADER BAR */}
          <div className="p-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300">Sale Mode: TAX INVOICE</span>
              {isReturnMode && <span className="bg-amber-950 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-800">RETURN INVOICE</span>}
              {isDeliveryMode && <span className="bg-rose-950 text-rose-400 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-800">HOME DELIVERY</span>}
            </div>

            {/* CUSTOMER DISPLAY PILL */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectCustomer}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-slate-800"
              >
                <User className="w-3 h-3 text-sky-400" />
                <span>{selectedCustomer ? `${selectedCustomer.name}` : 'Customer: No Customer Selected (Alt+X)'}</span>
              </button>

              <button
                onClick={() => setCart([])}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* CART ITEMS TABLE */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <ShoppingBag className="w-12 h-12 mb-2 opacity-30" />
                <p className="text-sm font-semibold">Cart is empty</p>
                <p className="text-xs">Scan a barcode or search products on the right keypad.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px] sticky top-0 bg-slate-900 z-10">
                  <tr>
                    <th className="py-2 pr-2">Item Details</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right text-amber-400">Disc.</th>
                    <th className="py-2 text-right text-slate-400">Tax</th>
                    <th className="py-2 text-right text-emerald-400">Incl.Tax</th>
                    <th className="py-2 text-center w-10">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {cart.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/60 transition-colors">
                      <td className="py-2.5 pr-2">
                        <p className="font-bold text-white text-sm">{row.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{row.barcode}</p>
                      </td>
                      <td className="py-2.5 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          <button
                            onClick={() =>
                              setCart((prev) =>
                                prev
                                  .map((item) =>
                                    item.id === row.id
                                      ? {
                                          ...item,
                                          qty: item.qty - 1,
                                          lineTotal: Math.max(0, (item.qty - 1) * item.unitPrice - (item.discount || 0) + item.tax),
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
                                        lineTotal: Math.max(0, (item.qty + 1) * item.unitPrice - (item.discount || 0) + item.tax),
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
                      <td className="py-2.5 text-right font-mono text-slate-300">
                        {formatQAR(row.unitPrice)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-amber-400">
                        {row.discount ? formatQAR(row.discount) : '-'}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-400">
                        {formatQAR(row.tax || 0)}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-emerald-400">
                        {formatQAR(row.lineTotal)}
                      </td>
                      <td className="py-2.5 text-center">
                        <button
                          onClick={() => handleRemoveItem(row.id)}
                          className="p-1 hover:bg-rose-950 rounded text-rose-400 hover:text-rose-300 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* QUICK CART ACTION BUTTONS BAR (Below Cart Table) */}
          <div className="grid grid-cols-6 gap-1 p-2 bg-slate-950 border-t border-slate-800 text-[11px] font-semibold text-slate-300">
            <button
              onClick={() => setCart([])}
              className="flex items-center justify-center gap-1 py-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-rose-400"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear List</span>
            </button>

            <button
              onClick={() => setIsHoldOpen(true)}
              className="flex items-center justify-center gap-1 py-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-amber-400"
            >
              <Lock className="w-3 h-3" />
              <span>Hold Invoice</span>
            </button>

            <button
              onClick={() => {
                if (cart.length > 0) handleApplyItemDiscount(cart[cart.length - 1].id);
              }}
              className="flex items-center justify-center gap-1 py-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-sky-400"
            >
              <Percent className="w-3 h-3" />
              <span>Item Disc.</span>
            </button>

            <button
              onClick={() => {
                if (cart.length > 0) handleChangePrice(cart[cart.length - 1].id);
              }}
              className="flex items-center justify-center gap-1 py-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-emerald-400"
            >
              <Tag className="w-3 h-3" />
              <span>Change Price</span>
            </button>

            <button
              onClick={() => {
                const note = prompt('Enter List Note / Remark for this order:');
                if (note) alert(`Note saved: ${note}`);
              }}
              className="flex items-center justify-center gap-1 py-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-purple-400"
            >
              <FileText className="w-3 h-3" />
              <span>Add Note</span>
            </button>

            <button
              onClick={() => setIsDeliveryMode(!isDeliveryMode)}
              className={`flex items-center justify-center gap-1 py-1.5 rounded border text-xs font-bold ${
                isDeliveryMode ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <Truck className="w-3 h-3" />
              <span>Delivery</span>
            </button>
          </div>

          {/* CART METRICS & TOTAL PAYABLE FOOTER */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="grid grid-cols-4 gap-4 text-slate-400">
              <div>
                <span className="block text-[10px] uppercase font-semibold">Item Count</span>
                <strong className="text-white font-mono">{totalItemCount} SKU</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-semibold">Total Qty</span>
                <strong className="text-white font-mono">{totalQty} Pcs</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-semibold">Item Disc.</span>
                <strong className="text-amber-400 font-mono">{formatQAR(totalDiscount)}</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-semibold">Qatar VAT</span>
                <strong className="text-slate-300 font-mono">{formatQAR(taxAmount)}</strong>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Total Payable Amount</span>
              <span className="text-3xl font-black text-emerald-400 font-mono">
                {formatQAR(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT AREA: SCANNER, KEYPAD & QUICK LOOKUPS */}
        <div className="w-[430px] bg-slate-950 flex flex-col p-3 gap-3">
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
                placeholder="▼ Scan Barcode Here ▼ (or type SKU)..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs rounded-xl shadow text-white"
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

          {/* QUICK LOOKUP SHORTCUT BUTTONS */}
          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
            <button
              onClick={() => alert('F9 Product LookUp: Master catalog filter.')}
              className="py-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-sky-400 flex items-center justify-center gap-1"
            >
              <Search className="w-3 h-3" />
              <span>Product LookUp (F9)</span>
            </button>

            <button
              onClick={() => alert('F7 Price LookUp: Retail QAR pricing query.')}
              className="py-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-amber-400 flex items-center justify-center gap-1"
            >
              <Tag className="w-3 h-3" />
              <span>Price LookUp (F7)</span>
            </button>

            <button
              onClick={() => alert('F8 Stock LookUp: Warehouse inventory balance.')}
              className="py-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-emerald-400 flex items-center justify-center gap-1"
            >
              <ShoppingBag className="w-3 h-3" />
              <span>Stock LookUp (F8)</span>
            </button>
          </div>

          {/* SETTLEMENT PAYMENT SHORTCUT BUTTONS */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              disabled={cart.length === 0}
              onClick={() => setIsPaymentOpen(true)}
              className="py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-white text-xs shadow flex items-center justify-center gap-1.5"
            >
              <Banknote className="w-4 h-4" />
              <span>Cash (F1)</span>
            </button>

            <button
              disabled={cart.length === 0}
              onClick={() => setIsPaymentOpen(true)}
              className="py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-white text-xs shadow flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>Credit Card (F2)</span>
            </button>
          </div>

          {/* MAIN CHECKOUT BUTTON */}
          <button
            disabled={cart.length === 0}
            onClick={() => setIsPaymentOpen(true)}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-black text-slate-950 text-sm shadow-lg tracking-wide uppercase flex items-center justify-center gap-2"
          >
            <span>CHECKOUT / PAYMENT ({formatQAR(grandTotal)})</span>
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
