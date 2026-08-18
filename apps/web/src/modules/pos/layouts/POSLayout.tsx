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
  ChevronDown,
  List,
  Flag,
  Calendar,
  Layers,
  ChevronUp,
  X,
  XCircle,
  HelpCircle,
  PackageCheck,
  QrCode,
} from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';
import { HoldRecallModal } from '../components/HoldRecallModal';
import { CashDropModal } from '../components/CashDropModal';
import { POSConfigModal } from '../components/POSConfigModal';
import { SettlementModal } from '../components/SettlementModal';
import { CustomerSearchModal } from '../components/CustomerSearchModal';
import { ProductLookupModal } from '../components/ProductLookupModal';
import { PriceLookupModal } from '../components/PriceLookupModal';
import { StockLookupModal } from '../components/StockLookupModal';
import { QuickListModal } from '../components/QuickListModal';
import { AddProductByNameModal } from '../components/AddProductByNameModal';
import { SerialSearchModal } from '../components/SerialSearchModal';
import { CartRow } from '../types/posModule.types';
import { Product } from '@qatar-erp/types';

export const POSLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [barcodeInput, setBarcodeInput] = useState('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isHoldOpen, setIsHoldOpen] = useState(false);
  const [isCashDropOpen, setIsCashDropOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [isProductLookupOpen, setIsProductLookupOpen] = useState(false);
  const [isPriceLookupOpen, setIsPriceLookupOpen] = useState(false);
  const [isStockLookupOpen, setIsStockLookupOpen] = useState(false);
  const [isQuickListOpen, setIsQuickListOpen] = useState(false);
  const [isAddProductByNameOpen, setIsAddProductByNameOpen] = useState(false);
  const [isSerialSearchOpen, setIsSerialSearchOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);

  // Customer & Mode states
  const [selectedCustomer, setSelectedCustomer] = useState<{ name: string; code: string } | null>(null);
  const [isReturnMode, setIsReturnMode] = useState(false);
  const [isDeliveryMode, setIsDeliveryMode] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(0);
  const [invoiceCount, setInvoiceCount] = useState(0);

  // Default Cart matching target screenshot (346578, sdfghj, Qty 5, Price 13.04, Tax 9.78, Total 75.00)
  const [cart, setCart] = useState<CartRow[]>([
    {
      id: 'item-1',
      barcode: '346578',
      name: 'sdfghj',
      description: 'General Item',
      qty: 5,
      unitPrice: 13.04,
      tax: 9.78,
      discount: 0,
      lineTotal: 75.00,
    },
  ]);

  // Calculated Totals
  const totalItemCount = cart.length;
  const totalQty = cart.reduce((acc, i) => acc + i.qty, 0);
  const taxableAmt = cart.reduce((acc, i) => acc + i.qty * i.unitPrice, 0);
  const totalDiscount = cart.reduce((acc, i) => acc + (i.discount || 0), 0);
  const taxAmount = cart.reduce((acc, i) => acc + (i.tax || 0), 0);
  const grandTotal = cart.reduce((acc, i) => acc + i.lineTotal, 0);

  const addProductToCart = (prod: Product) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.barcode === prod.barcode);
      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.qty + 1;
        const disc = existing.discount || 0;
        const tx = (newQty * existing.unitPrice) * (prod.vatRate || 0.05);
        updated[existingIndex] = {
          ...existing,
          qty: newQty,
          tax: tx,
          lineTotal: newQty * existing.unitPrice - disc + tx,
        };
        return updated;
      }
      const disc = prod.discount || 0;
      const tx = prod.retailPrice * (prod.vatRate || 0.05);
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
    setSelectedRowIndex(cart.length);
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
        // Add sample item if search doesn't match master
        const sampleItem: CartRow = {
          id: `item-${Date.now()}`,
          barcode: term,
          name: `Scanned Item (${term})`,
          description: 'General Retail Item',
          qty: 1,
          unitPrice: 15.00,
          tax: 0.75,
          discount: 0,
          lineTotal: 15.75,
        };
        setCart((prev) => [...prev, sampleItem]);
      }
    }
    setBarcodeInput('');
  };

  const handleNumpadClick = (key: string) => {
    if (key === 'C') {
      setBarcodeInput('');
    } else if (key === '◄') {
      setBarcodeInput((prev) => (prev.length > 1 ? prev.slice(0, -1) : ''));
    } else if (key === '↵') {
      processBarcodeSearch(barcodeInput);
    } else {
      setBarcodeInput((prev) => prev + key);
    }
  };

  const handleRemoveSelected = () => {
    if (selectedRowIndex !== null && cart[selectedRowIndex]) {
      setCart((prev) => prev.filter((_, idx) => idx !== selectedRowIndex));
      setSelectedRowIndex(null);
    } else if (cart.length > 0) {
      setCart((prev) => prev.slice(0, -1));
    }
  };

  const handleApplyItemDiscount = () => {
    const targetIndex = selectedRowIndex !== null ? selectedRowIndex : cart.length - 1;
    if (targetIndex < 0 || !cart[targetIndex]) return;

    const discStr = prompt('Enter item discount amount (QAR):', '2.00');
    if (discStr !== null) {
      const discVal = parseFloat(discStr) || 0;
      setCart((prev) =>
        prev.map((item, idx) =>
          idx === targetIndex
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

  const handleChangeQuantity = () => {
    const targetIndex = selectedRowIndex !== null ? selectedRowIndex : cart.length - 1;
    if (targetIndex < 0 || !cart[targetIndex]) return;

    const qtyStr = prompt('Enter new Quantity:', cart[targetIndex].qty.toString());
    if (qtyStr !== null) {
      const newQty = parseFloat(qtyStr) || 1;
      setCart((prev) =>
        prev.map((item, idx) =>
          idx === targetIndex
            ? {
                ...item,
                qty: newQty,
                lineTotal: Math.max(0, newQty * item.unitPrice - (item.discount || 0) + item.tax),
              }
            : item
        )
      );
    }
  };

  const handleChangePrice = () => {
    const targetIndex = selectedRowIndex !== null ? selectedRowIndex : cart.length - 1;
    if (targetIndex < 0 || !cart[targetIndex]) return;

    const priceStr = prompt('Override item retail unit price (QAR):', cart[targetIndex].unitPrice.toString());
    if (priceStr !== null) {
      const newPrice = parseFloat(priceStr) || 0;
      setCart((prev) =>
        prev.map((item, idx) =>
          idx === targetIndex
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

  const handleCompleteSale = (method: string) => {
    if (cart.length === 0) return;
    setInvoiceCount((prev) => prev + 1);
    alert(`✅ Payment Processed via ${method}!\nReceipt Printed.\nTotal: ${grandTotal.toFixed(2)} QAR`);
    setCart([]);
  };

  return (
    <div className="w-full h-[calc(100vh-120px)] bg-slate-100 text-slate-800 flex flex-col select-none overflow-hidden font-sans text-xs">
      {/* 1. TOP SUB-RIBBON QUICK ACTION BAR (Matching Target Screenshot 100%) */}
      <div className="bg-slate-200 border-b border-slate-300 p-1 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setIsHoldOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-white text-slate-800 border border-slate-400 rounded font-semibold shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
            <span>Recall Invoice</span>
          </button>

          <button
            onClick={() => setIsCashDropOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-white text-slate-800 border border-slate-400 rounded font-semibold shadow-2xs"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cash Drop/Out</span>
          </button>

          <button
            onClick={() => alert('📥 Cash Drawer Triggered & Opened!')}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-white text-slate-800 border border-slate-400 rounded font-semibold shadow-2xs"
          >
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Open Drawer</span>
          </button>

          <button
            onClick={() => alert('🖨️ Thermal Receipt: Invoice reprinted successfully.')}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-white text-slate-800 border border-slate-400 rounded font-semibold shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-amber-600" />
            <span>Invoice Reprint</span>
          </button>

          <button
            onClick={() => setIsReturnMode(!isReturnMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold border shadow-2xs ${
              isReturnMode ? 'bg-amber-500 text-white border-amber-600 font-bold' : 'bg-slate-100 hover:bg-white text-slate-800 border-slate-400'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
            <span>{isReturnMode ? 'Mode: Return' : 'Sale / Return'}</span>
          </button>

          <button
            onClick={() => setIsCustomerSearchOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-white text-slate-800 border border-slate-400 rounded font-semibold shadow-2xs"
          >
            <User className="w-3.5 h-3.5 text-purple-600" />
            <span>Customer</span>
          </button>

          <button
            onClick={() => navigate('/day-close')}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-white text-slate-800 border border-slate-400 rounded font-semibold shadow-2xs"
          >
            <Flag className="w-3.5 h-3.5 text-emerald-700 fill-emerald-600" />
            <span>End Session</span>
          </button>

          <button
            onClick={() => alert('📊 Session Sales Summary Report Generated!')}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-white text-slate-800 border border-slate-400 rounded font-semibold shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            <span>Session Report</span>
          </button>

          <button
            onClick={() => alert('⭐ Loyalty Points Balance: 450 Points (45 QAR Equivalent)')}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-white text-slate-800 border border-slate-400 rounded font-semibold shadow-2xs"
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>Loyalty Check</span>
          </button>

          <button
            onClick={() => setIsDeliveryMode(!isDeliveryMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold border shadow-2xs ${
              isDeliveryMode ? 'bg-rose-600 text-white border-rose-700 font-bold' : 'bg-slate-100 hover:bg-white text-slate-800 border-slate-400'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-rose-600" />
            <span>Delivery List</span>
          </button>
        </div>

        {/* Far Right Red Tab Close Button matching target screenshot */}
        <button onClick={() => navigate('/')} className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded border border-rose-700 shrink-0">
          ✕
        </button>
      </div>

      {/* 2. MAIN POS BODY LAYOUT (GRID TABLE + NUMPAD/LOOKUPS + SETTLEMENT BAR) */}
      <div className="flex-1 flex overflow-hidden p-1.5 gap-1.5">
        {/* LEFT SECTION: CART GRID & SUMMARY FOOTER */}
        <div className="flex-1 flex flex-col border border-slate-300 rounded bg-white overflow-hidden shadow-xs">
          {/* INNER HEADER: SALE MODE */}
          <div className="bg-slate-300 py-1 border-b border-slate-400 text-center font-bold text-slate-800 text-xs shadow-inner">
            {isReturnMode ? 'Return Mode' : 'Sale Mode'}
          </div>

          {/* INVOICE TYPE INDICATOR */}
          <div className="bg-slate-200 px-3 py-1 border-b border-slate-300 font-bold text-[11px] text-slate-700">
            TAX INVOICE
          </div>

          {/* CART ITEMS TABLE (Matching Target Image Columns Exactly) */}
          <div className="flex-1 overflow-auto bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-200 font-bold text-slate-700 uppercase text-[10px] sticky top-0 border-b border-slate-300 shadow-2xs">
                <tr>
                  <th className="p-1 border-r border-slate-300 w-8 text-center">#</th>
                  <th className="p-1.5 border-r border-slate-300 font-mono w-24">Barcode</th>
                  <th className="p-1.5 border-r border-slate-300">Product Name</th>
                  <th className="p-1.5 border-r border-slate-300 w-16 text-right font-mono">Qty</th>
                  <th className="p-1.5 border-r border-slate-300 w-16 text-right font-mono">Price</th>
                  <th className="p-1.5 border-r border-slate-300 w-16 text-right font-mono">Disc.</th>
                  <th className="p-1.5 border-r border-slate-300 w-16 text-right font-mono">Amt</th>
                  <th className="p-1.5 border-r border-slate-300 w-16 text-right font-mono">Tax</th>
                  <th className="p-1.5 border-r border-slate-300 w-16 text-right font-mono">InclTax</th>
                  <th className="p-1.5 w-16 text-right font-mono">Service</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-slate-400 italic">
                      No items in cart. Scan barcode or search product on right keypad.
                    </td>
                  </tr>
                ) : (
                  cart.map((row, idx) => {
                    const isSelected = selectedRowIndex === idx;
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedRowIndex(idx)}
                        className={`cursor-pointer ${
                          isSelected ? 'bg-navy-900 bg-blue-900 text-white font-bold' : 'hover:bg-sky-50'
                        }`}
                      >
                        <td className="p-1 border-r border-slate-200 text-center font-mono text-[10px]">
                          {isSelected ? '▶ ' + (idx + 1) : idx + 1}
                        </td>
                        <td className="p-1.5 border-r border-slate-200 font-mono font-bold">{row.barcode}</td>
                        <td className="p-1.5 border-r border-slate-200 font-bold">{row.name}</td>
                        <td className="p-1.5 border-r border-slate-200 text-right font-mono">{row.qty.toFixed(3)}</td>
                        <td className="p-1.5 border-r border-slate-200 text-right font-mono">{row.unitPrice.toFixed(2)}</td>
                        <td className="p-1.5 border-r border-slate-200 text-right font-mono">{row.discount ? row.discount.toFixed(2) : '0.00'}</td>
                        <td className="p-1.5 border-r border-slate-200 text-right font-mono">{(row.qty * row.unitPrice).toFixed(2)}</td>
                        <td className="p-1.5 border-r border-slate-200 text-right font-mono">{row.tax.toFixed(2)}</td>
                        <td className="p-1.5 border-r border-slate-200 text-right font-mono font-bold">{row.lineTotal.toFixed(2)}</td>
                        <td className="p-1.5 text-right font-mono">0.00</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 8 ROW ACTION BUTTONS BELOW TABLE GRID (Matching Target Image 100%) */}
          <div className="bg-slate-200 border-t border-slate-300 p-1.5 grid grid-cols-5 gap-1 text-xs">
            {/* Column 1: Line / Qty Adjusters */}
            <div className="flex flex-col gap-1 justify-center">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedRowIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : 0))}
                  className="flex-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded py-0.5 font-bold text-emerald-800 flex items-center justify-center gap-0.5"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Line</span>
                </button>
                <button
                  onClick={handleChangeQuantity}
                  className="flex-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded py-0.5 font-bold text-emerald-800 flex items-center justify-center gap-0.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Qty</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedRowIndex((prev) => (prev !== null && prev < cart.length - 1 ? prev + 1 : prev))}
                  className="flex-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded py-0.5 font-bold text-rose-800 flex items-center justify-center gap-0.5"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Line</span>
                </button>
                <button
                  onClick={() => {
                    const targetIndex = selectedRowIndex !== null ? selectedRowIndex : cart.length - 1;
                    if (targetIndex >= 0 && cart[targetIndex] && cart[targetIndex].qty > 1) {
                      setCart((prev) =>
                        prev.map((item, idx) =>
                          idx === targetIndex
                            ? {
                                ...item,
                                qty: item.qty - 1,
                                lineTotal: Math.max(0, (item.qty - 1) * item.unitPrice - (item.discount || 0) + item.tax),
                              }
                            : item
                        )
                      );
                    }
                  }}
                  className="flex-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded py-0.5 font-bold text-rose-800 flex items-center justify-center gap-0.5"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Qty</span>
                </button>
              </div>
            </div>

            {/* Column 2: Clear List & Change Quantity */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setCart([])}
                className="flex-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded px-2 py-1 font-bold text-slate-800 flex items-center justify-between"
              >
                <span>🧹 Clear List</span>
                <span className="text-[9px] text-slate-500 font-mono">Ctrl + L</span>
              </button>
              <button
                onClick={handleChangeQuantity}
                className="flex-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded px-2 py-1 font-bold text-slate-800 flex items-center justify-between"
              >
                <span>⚡ Change Quantity</span>
                <span className="text-[9px] text-slate-500 font-mono">F5</span>
              </button>
            </div>

            {/* Column 3: Remove Selected & Add List Note */}
            <div className="flex flex-col gap-1">
              <button
                onClick={handleRemoveSelected}
                className="flex-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded px-2 py-1 font-bold text-slate-800 flex items-center justify-between"
              >
                <span>🗑️ Remove Selected</span>
                <span className="text-[9px] text-slate-500 font-mono">F6</span>
              </button>
              <button
                onClick={() => {
                  const note = prompt('Enter Add List Note / Remark for bill:');
                  if (note) alert(`Note added: ${note}`);
                }}
                className="flex-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded px-2 py-1 font-bold text-slate-800 flex items-center justify-between"
              >
                <span>📝 Add List Note</span>
                <span className="text-[9px] text-slate-500 font-mono">Ctrl+N</span>
              </button>
            </div>

            {/* Column 4: Hold Invoice & Change Price */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setIsHoldOpen(true)}
                className="flex-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded px-2 py-1 font-bold text-slate-800 flex items-center justify-between"
              >
                <span>📎 Hold Invoice</span>
                <span className="text-[9px] text-slate-500 font-mono">F7</span>
              </button>
              <button
                onClick={handleChangePrice}
                className="flex-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded px-2 py-1 font-bold text-slate-800 flex items-center justify-between"
              >
                <span>🏷️ Change Price</span>
                <span className="text-[9px] text-slate-500 font-mono">F12</span>
              </button>
            </div>

            {/* Column 5: Item Discount & Delivery */}
            <div className="flex flex-col gap-1">
              <button
                onClick={handleApplyItemDiscount}
                className="flex-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded px-2 py-1 font-bold text-slate-800 flex items-center justify-between"
              >
                <span>📊 Item Discount</span>
              </button>
              <button
                onClick={() => setIsDeliveryMode(!isDeliveryMode)}
                className="flex-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded px-2 py-1 font-bold text-slate-800 flex items-center justify-between"
              >
                <span>🛵 Delivery</span>
              </button>
            </div>
          </div>

          {/* BOTTOM SUMMARY & TOTAL INCL TAX DISPLAY BOX (Matching Target Image 100%) */}
          <div className="bg-slate-200 border-t border-slate-300 p-2 flex items-center justify-between gap-2">
            {/* Left Summary Labels */}
            <div className="space-y-1 text-slate-700 font-medium text-xs">
              <div className="flex items-center gap-4">
                <span>Taxable Amt: <strong className="font-mono font-bold text-slate-900">{taxableAmt.toFixed(2)}</strong></span>
              </div>
              <div className="flex items-center gap-4">
                <span>Item Count: <strong className="font-mono font-bold text-slate-900">{totalItemCount}</strong></span>
                <span>Total Qty: <strong className="font-mono font-bold text-slate-900">{totalQty.toFixed(3)}</strong></span>
              </div>
              <div className="flex items-center gap-4">
                <span>Item Disc.: <strong className="font-mono font-bold text-slate-900">{totalDiscount.toFixed(2)}</strong></span>
                <span className="font-mono text-slate-500">m∑</span>
              </div>
              <div className="flex items-center gap-1 pt-0.5">
                <button
                  onClick={() => setIsCustomerSearchOpen(true)}
                  className="px-1.5 py-0.5 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded font-bold text-emerald-800 text-[10px]"
                >
                  💲 Alt+X
                </button>
                <span className="font-bold text-slate-900">{selectedCustomer ? selectedCustomer.name : 'No Customer Selected'}</span>
              </div>
            </div>

            {/* Right Big Totals Box matching target screenshot */}
            <div className="text-right flex flex-col items-end gap-1">
              <div className="text-[11px] font-bold text-slate-700 space-y-0.5">
                <div>Total Excl Tax: <span className="font-mono font-bold text-slate-900">{taxableAmt.toFixed(2)}</span></div>
                <div>Tax Amount: <span className="font-mono font-bold text-slate-900">{taxAmount.toFixed(2)}</span></div>
              </div>

              <div className="bg-white border-2 border-slate-400 rounded px-6 py-2 shadow-inner text-center min-w-[160px]">
                <span className="block text-[9px] uppercase font-bold text-slate-500">Total Incl Tax</span>
                <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                  {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* MORE OPTIONS DROPDOWN BUTTON */}
          <div className="bg-slate-300 border-t border-slate-400 px-2 py-1 flex items-center justify-between text-[11px] shrink-0">
            <button onClick={() => alert('More Options Menu Opened')} className="font-bold text-slate-800 flex items-center gap-1">
              <span>▼ More Options</span>
            </button>
            <span className="font-mono text-slate-600 text-[10px]">Connected To Server :(Localhost:5173)</span>
          </div>
        </div>

        {/* CENTER COLUMN: SCANNER, TOUCH NUMPAD & QUICK LOOKUP SHORTCUTS */}
        <div className="w-[360px] border border-slate-300 rounded bg-slate-200 p-1.5 flex flex-col gap-1.5 shadow-xs shrink-0">
          {/* Language Selector & Barcode Scan Box */}
          <div className="space-y-1 bg-slate-100 p-2 border border-slate-300 rounded">
            <div className="flex items-center justify-end">
              <select className="px-2 py-0.5 border border-slate-300 rounded bg-white text-xs font-semibold">
                <option value="en">English</option>
                <option value="ar">العربية (Arabic)</option>
              </select>
            </div>

            <div className="text-center font-bold text-slate-800 text-xs py-0.5">
              ▼ Scan Barcode Here ▼
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                processBarcodeSearch(barcodeInput);
              }}
              className="flex items-center gap-1"
            >
              <input
                type="text"
                placeholder="Scan barcode or type item code..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="flex-1 px-2.5 py-1.5 border border-slate-400 rounded bg-white text-sm font-mono font-bold focus:border-cyan-600 focus:outline-none shadow-xs text-center"
                autoFocus
              />
              <button
                type="submit"
                className="p-1.5 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded shrink-0"
              >
                <Search className="w-4 h-4 text-blue-600" />
              </button>
            </form>
          </div>

          {/* 4x4 TOUCH KEYPAD GRID (Matching Target Screenshot Layout Exactly) */}
          <div className="bg-slate-300 p-1.5 border border-slate-400 rounded grid grid-cols-4 gap-1 font-bold text-lg select-none flex-1">
            {/* Row 1 */}
            <button onClick={() => handleNumpadClick('1')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">1</button>
            <button onClick={() => handleNumpadClick('2')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">2</button>
            <button onClick={() => handleNumpadClick('3')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">3</button>
            <button onClick={() => handleNumpadClick('◄')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">◄</button>

            {/* Row 2 */}
            <button onClick={() => handleNumpadClick('4')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">4</button>
            <button onClick={() => handleNumpadClick('5')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">5</button>
            <button onClick={() => handleNumpadClick('6')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">6</button>
            <button onClick={() => handleNumpadClick('C')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">C</button>

            {/* Row 3 & 4 (Span Enter key across 2 rows vertically) */}
            <button onClick={() => handleNumpadClick('7')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">7</button>
            <button onClick={() => handleNumpadClick('8')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">8</button>
            <button onClick={() => handleNumpadClick('9')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">9</button>
            
            {/* Big Enter Key spanning 2 rows vertically */}
            <button
              onClick={() => handleNumpadClick('↵')}
              className="row-span-2 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-900 flex items-center justify-center font-bold text-2xl"
            >
              ↵
            </button>

            {/* Row 4 */}
            <button onClick={() => handleNumpadClick('*')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">*</button>
            <button onClick={() => handleNumpadClick('0')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">0</button>
            <button onClick={() => handleNumpadClick('.')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">.</button>
          </div>

          {/* 6 QUICK LOOKUP ACTION BUTTONS (2x3 Grid matching target screenshot) */}
          <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
            <button
              onClick={() => setIsProductLookupOpen(true)}
              className="p-1 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs flex flex-col items-center justify-center text-slate-800 text-center"
            >
              <Search className="w-3.5 h-3.5 text-blue-600 mb-0.5" />
              <span>Product LookUp</span>
              <span className="text-[8px] text-slate-500 font-mono">F9</span>
            </button>

            <button
              onClick={() => setIsPriceLookupOpen(true)}
              className="p-1 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs flex flex-col items-center justify-center text-slate-800 text-center"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-600 mb-0.5" />
              <span>Price LookUp</span>
              <span className="text-[8px] text-slate-500 font-mono">Ctrl+F7</span>
            </button>

            <button
              onClick={() => setIsStockLookupOpen(true)}
              className="p-1 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs flex flex-col items-center justify-center text-slate-800 text-center"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-600 mb-0.5" />
              <span>Stock LookUp</span>
              <span className="text-[8px] text-slate-500 font-mono">Ctrl+F8</span>
            </button>

            <button
              onClick={() => setIsQuickListOpen(true)}
              className="p-1 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs flex flex-col items-center justify-center text-slate-800 text-center"
            >
              <List className="w-3.5 h-3.5 text-indigo-600 mb-0.5" />
              <span>Quick List</span>
              <span className="text-[8px] text-slate-500 font-mono">Ctrl+Q</span>
            </button>

            <button
              onClick={() => setIsAddProductByNameOpen(true)}
              className="p-1 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs flex flex-col items-center justify-center text-slate-800 text-center"
            >
              <Plus className="w-3.5 h-3.5 text-purple-600 mb-0.5" />
              <span>Add Product By Name</span>
              <span className="text-[8px] text-slate-500 font-mono">Ctrl+F10</span>
            </button>

            <button
              onClick={() => setIsSerialSearchOpen(true)}
              className="p-1 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs flex flex-col items-center justify-center text-slate-800 text-center"
            >
              <QrCode className="w-3.5 h-3.5 text-teal-600 mb-0.5" />
              <span>Serial/IMEI Search</span>
              <span className="text-[8px] text-slate-500 font-mono">Ctrl+F11</span>
            </button>
          </div>

          {/* SESSION INFO BAR AT BOTTOM OF NUMPAD */}
          <div className="bg-slate-100 p-1.5 border border-slate-300 rounded text-[10px] font-mono text-slate-700 flex items-center justify-between">
            <div>Session # : <strong>1</strong></div>
            <div>Counter # : <strong>1</strong></div>
          </div>
        </div>

        {/* FAR RIGHT EDGE SETTLEMENT VERTICAL STRIP (Matching Target Image 100%) */}
        <div className="w-28 border border-slate-300 rounded bg-slate-200 flex flex-col justify-between p-1.5 shadow-xs shrink-0">
          <div className="space-y-1.5">
            <button
              onClick={() => setIsSettlementOpen(true)}
              className="w-full bg-slate-300 hover:bg-slate-400 py-1 border border-slate-400 rounded text-center font-bold text-slate-800 text-xs shadow-inner cursor-pointer"
            >
              Settlement
            </button>

            <button
              onClick={() => setIsSettlementOpen(true)}
              className="w-full py-2 bg-slate-100 hover:bg-white border border-slate-400 rounded font-semibold text-slate-800 text-center shadow-2xs"
            >
              <span className="block text-[10px] text-slate-500 font-mono">Alt + F3</span>
            </button>

            <button
              onClick={() => setIsSettlementOpen(true)}
              className="w-full py-2 bg-slate-100 hover:bg-white border border-slate-400 rounded font-semibold text-slate-800 text-center shadow-2xs flex flex-col items-center justify-center"
            >
              <span className="font-bold text-xs">Voucher</span>
              <span className="text-[10px] text-slate-500 font-mono">F4</span>
            </button>

            <button
              onClick={() => setIsCustomerSearchOpen(true)}
              className="w-full py-2 bg-slate-100 hover:bg-white border border-slate-400 rounded font-semibold text-slate-800 text-center shadow-2xs flex flex-col items-center justify-center"
            >
              <span className="font-bold text-xs text-purple-800">Credit</span>
              <span className="text-[10px] text-slate-500 font-mono">F3</span>
            </button>

            <button
              onClick={() => setIsSettlementOpen(true)}
              className="w-full py-2 bg-slate-100 hover:bg-white border border-slate-400 rounded font-semibold text-slate-800 text-center shadow-2xs flex flex-col items-center justify-center"
            >
              <span className="font-bold text-xs text-sky-800">Credit Card</span>
              <span className="text-[10px] text-slate-500 font-mono">F2</span>
            </button>

            <button
              onClick={() => setIsSettlementOpen(true)}
              className="w-full py-2 bg-slate-100 hover:bg-white border border-slate-400 rounded font-semibold text-slate-800 text-center shadow-2xs flex flex-col items-center justify-center"
            >
              <span className="font-bold text-xs text-emerald-800">Cash</span>
              <span className="text-[10px] text-slate-500 font-mono">F1</span>
            </button>
          </div>

          <div className="bg-slate-100 p-1.5 border border-slate-300 rounded text-center text-[10px] font-bold text-slate-700">
            Invoice Count : <span className="font-mono text-slate-900">{invoiceCount}</span>
          </div>
        </div>
      </div>

      {/* 3. MODALS INTEGRATION */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        grandTotal={grandTotal}
        onCompleteSale={() => handleCompleteSale('Standard Checkout')}
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

      <POSConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />

      <SettlementModal
        isOpen={isSettlementOpen}
        onClose={() => setIsSettlementOpen(false)}
        grandTotal={grandTotal}
        taxAmount={taxAmount}
        taxableAmt={taxableAmt}
        onFinishSettlement={(print) => {
          setIsSettlementOpen(false);
          handleCompleteSale(print ? 'Settlement & Print' : 'Settlement');
        }}
        onOpenCreditCustomerSearch={() => {
          setIsSettlementOpen(false);
          setIsCustomerSearchOpen(true);
        }}
      />

      <CustomerSearchModal
        isOpen={isCustomerSearchOpen}
        onClose={() => setIsCustomerSearchOpen(false)}
        onSelectCustomer={(cust) => {
          setSelectedCustomer({ name: cust.name, code: cust.code });
          setIsCustomerSearchOpen(false);
        }}
      />

      <ProductLookupModal
        isOpen={isProductLookupOpen}
        onClose={() => setIsProductLookupOpen(false)}
        onSelectProduct={(p) => {
          processBarcodeSearch(p.barcode);
          setIsProductLookupOpen(false);
        }}
      />

      <PriceLookupModal
        isOpen={isPriceLookupOpen}
        onClose={() => setIsPriceLookupOpen(false)}
        onAddProductToCart={(p) => {
          processBarcodeSearch(p.barcode);
          setIsPriceLookupOpen(false);
        }}
      />

      <StockLookupModal
        isOpen={isStockLookupOpen}
        onClose={() => setIsStockLookupOpen(false)}
        onAddProductToCart={(p) => {
          processBarcodeSearch(p.barcode);
          setIsStockLookupOpen(false);
        }}
      />

      <QuickListModal
        isOpen={isQuickListOpen}
        onClose={() => setIsQuickListOpen(false)}
        onSelectProduct={(p) => {
          processBarcodeSearch(p.barcode);
          setIsQuickListOpen(false);
        }}
      />

      <AddProductByNameModal
        isOpen={isAddProductByNameOpen}
        onClose={() => setIsAddProductByNameOpen(false)}
        onAddProduct={(name) => {
          processBarcodeSearch(name);
          setIsAddProductByNameOpen(false);
        }}
      />

      <SerialSearchModal
        isOpen={isSerialSearchOpen}
        onClose={() => setIsSerialSearchOpen(false)}
        onSelectSerial={(item) => {
          processBarcodeSearch(item.serialNo);
          setIsSerialSearchOpen(false);
        }}
      />
    </div>
  );
};

export default POSLayout;
