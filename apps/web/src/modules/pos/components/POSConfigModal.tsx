import React, { useState } from 'react';
import { Printer, QrCode, Monitor, Key, Scale, Star, Phone, Save, Check, Layout } from 'lucide-react';

export interface POSConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const POSConfigModal: React.FC<POSConfigModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'printer' | 'barcode' | 'display' | 'security' | 'scale' | 'loyalty' | 'delivery'>('printer');
  const [activeSubTab, setActiveSubTab] = useState<'print-settings' | 'designs'>('print-settings');

  // Print Settings State
  const [receiptPrinter, setReceiptPrinter] = useState('Microsoft Print to PDF');
  const [invoiceCopies, setInvoiceCopies] = useState(1);
  const [heldCopies, setHeldCopies] = useState(1);
  const [deliveryCopies, setDeliveryCopies] = useState(1);

  // Checkbox behaviors matching screenshot 100%
  const [printReturnWithVoucher, setPrintReturnWithVoucher] = useState(false);
  const [askCustomerReceiptVoucher, setAskCustomerReceiptVoucher] = useState(false);
  const [askHoldInvoicePrint, setAskHoldInvoicePrint] = useState(false);
  const [printSoldDetailDayclose, setPrintSoldDetailDayclose] = useState(false);
  const [disableCreditVoucher, setDisableCreditVoucher] = useState(false);
  const [askDeliveryReceiptPrint, setAskDeliveryReceiptPrint] = useState(false);

  // Designs State
  const [receiptWidth, setReceiptWidth] = useState('80mm');
  const [headerGreeting, setHeaderGreeting] = useState('Welcome to Qatar Retail ERP!');
  const [footerMessage, setFooterMessage] = useState('Thank you for shopping! Please visit again.');
  const [showVatTrn, setShowVatTrn] = useState(true);

  if (!isOpen) return null;

  const handleSave = () => {
    alert('💾 POS Configurations saved successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 select-none font-sans text-xs">
      <div className="bg-slate-200 rounded-xl shadow-2xl border border-slate-400 w-full max-w-3xl overflow-hidden flex flex-col h-[520px]">
        {/* 1. MODAL TITLE BAR (Matching Screenshot) */}
        <div className="bg-slate-300 text-slate-900 px-3 py-1.5 flex items-center justify-between border-b border-slate-400 shrink-0">
          <h2 className="text-xs font-bold tracking-wide">POS Configurations</h2>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold text-sm px-1.5 py-0.5 rounded hover:bg-slate-400/50"
          >
            ✕
          </button>
        </div>

        {/* 2. MODAL MAIN BODY (LEFT ICON BAR + RIGHT CONTENT) */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT VERTICAL ICON TOOLBAR (Matching Screenshot Left Strip) */}
          <div className="w-12 bg-slate-300 border-r border-slate-400 flex flex-col items-center py-3 gap-2.5 shrink-0 shadow-inner">
            <button
              onClick={() => setActiveCategory('printer')}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                activeCategory === 'printer'
                  ? 'bg-slate-100 text-slate-900 border border-slate-400 shadow-md scale-105'
                  : 'text-slate-700 hover:bg-slate-400/50'
              }`}
              title="Printer Settings"
            >
              <Printer className="w-4 h-4 text-slate-900" />
            </button>

            <button
              onClick={() => setActiveCategory('barcode')}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                activeCategory === 'barcode'
                  ? 'bg-slate-100 text-slate-900 border border-slate-400 shadow-md scale-105'
                  : 'text-slate-700 hover:bg-slate-400/50'
              }`}
              title="Barcode Scanner & Labels"
            >
              <span className="font-bold text-sm">Ⅰ</span>
            </button>

            <button
              onClick={() => setActiveCategory('display')}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                activeCategory === 'display'
                  ? 'bg-slate-100 text-slate-900 border border-slate-400 shadow-md scale-105'
                  : 'text-slate-700 hover:bg-slate-400/50'
              }`}
              title="Pole Display & Terminal Screen"
            >
              <Monitor className="w-4 h-4 text-sky-700" />
            </button>

            <button
              onClick={() => setActiveCategory('security')}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                activeCategory === 'security'
                  ? 'bg-slate-100 text-slate-900 border border-slate-400 shadow-md scale-105'
                  : 'text-slate-700 hover:bg-slate-400/50'
              }`}
              title="Manager Key Security"
            >
              <Key className="w-4 h-4 text-amber-700" />
            </button>

            <button
              onClick={() => setActiveCategory('scale')}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                activeCategory === 'scale'
                  ? 'bg-slate-100 text-slate-900 border border-slate-400 shadow-md scale-105'
                  : 'text-slate-700 hover:bg-slate-400/50'
              }`}
              title="Weighing Scale Integration"
            >
              <Scale className="w-4 h-4 text-emerald-700" />
            </button>

            <button
              onClick={() => setActiveCategory('loyalty')}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                activeCategory === 'loyalty'
                  ? 'bg-slate-100 text-slate-900 border border-slate-400 shadow-md scale-105'
                  : 'text-slate-700 hover:bg-slate-400/50'
              }`}
              title="Loyalty Rewards & Points"
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            </button>

            <button
              onClick={() => setActiveCategory('delivery')}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                activeCategory === 'delivery'
                  ? 'bg-slate-100 text-slate-900 border border-slate-400 shadow-md scale-105'
                  : 'text-slate-700 hover:bg-slate-400/50'
              }`}
              title="Delivery Customer Address Setup"
            >
              <Phone className="w-4 h-4 text-indigo-700" />
            </button>
          </div>

          {/* RIGHT MAIN PANEL */}
          <div className="flex-1 flex flex-col bg-white p-3 overflow-y-auto">
            {/* SUB-TABS STRIP matching screenshot */}
            <div className="flex items-center gap-1 border-b border-slate-300 pb-2 mb-3">
              <button
                onClick={() => setActiveSubTab('print-settings')}
                className={`px-3 py-1 rounded-t flex items-center gap-1.5 font-bold text-xs border transition-colors ${
                  activeSubTab === 'print-settings'
                    ? 'bg-slate-100 border-slate-300 border-b-white text-slate-900 -mb-px'
                    : 'bg-slate-200 border-transparent text-slate-600 hover:bg-slate-300'
                }`}
              >
                <Printer className="w-3.5 h-3.5 text-slate-700" />
                <span>Print Settings</span>
              </button>

              <button
                onClick={() => setActiveSubTab('designs')}
                className={`px-3 py-1 rounded-t flex items-center gap-1.5 font-bold text-xs border transition-colors ${
                  activeSubTab === 'designs'
                    ? 'bg-slate-100 border-slate-300 border-b-white text-slate-900 -mb-px'
                    : 'bg-slate-200 border-transparent text-slate-600 hover:bg-slate-300'
                }`}
              >
                <Layout className="w-3.5 h-3.5 text-amber-600" />
                <span>Designs</span>
              </button>
            </div>

            {/* SUB-TAB 1: PRINT SETTINGS (Matching Screenshot Exactly) */}
            {activeSubTab === 'print-settings' && (
              <div className="space-y-4 text-xs font-sans text-slate-800">
                {/* Receipt Printer Row */}
                <div className="flex items-center gap-4">
                  <label className="w-28 font-semibold text-slate-700 shrink-0">Receipt Printer</label>
                  <select
                    value={receiptPrinter}
                    onChange={(e) => setReceiptPrinter(e.target.value)}
                    className="w-72 px-2 py-1 border border-slate-300 rounded font-semibold bg-white text-xs"
                  >
                    <option value="Microsoft Print to PDF">Microsoft Print to PDF</option>
                    <option value="Epson TM-T20III Thermal Receipt Printer">Epson TM-T20III Thermal Receipt Printer</option>
                    <option value="Star TSP143III USB Thermal">Star TSP143III USB Thermal</option>
                    <option value="Custom POS Printer">Custom POS Printer</option>
                  </select>
                </div>

                {/* Copy Counters Row matching screenshot */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Invoice Copies</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={invoiceCopies}
                      onChange={(e) => setInvoiceCopies(parseInt(e.target.value, 10) || 1)}
                      className="w-14 px-2 py-0.5 border border-slate-300 rounded text-center font-mono font-bold bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Held Copies</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={heldCopies}
                      onChange={(e) => setHeldCopies(parseInt(e.target.value, 10) || 1)}
                      className="w-14 px-2 py-0.5 border border-slate-300 rounded text-center font-mono font-bold bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Delivery Copies</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={deliveryCopies}
                      onChange={(e) => setDeliveryCopies(parseInt(e.target.value, 10) || 1)}
                      className="w-14 px-2 py-0.5 border border-slate-300 rounded text-center font-mono font-bold bg-white"
                    />
                  </div>
                </div>

                {/* Checkbox Options List matching screenshot 100% */}
                <div className="space-y-2.5 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={printReturnWithVoucher}
                      onChange={(e) => setPrintReturnWithVoucher(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span>Print Sales Return Receipt With Voucher</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={askCustomerReceiptVoucher}
                      onChange={(e) => setAskCustomerReceiptVoucher(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span>Ask For Customer Receipt Voucher Print</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={askHoldInvoicePrint}
                      onChange={(e) => setAskHoldInvoicePrint(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span>Ask For Hold Invoice Print</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={printSoldDetailDayclose}
                      onChange={(e) => setPrintSoldDetailDayclose(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span>Print Sold Product Detail In Dayclose Report</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={disableCreditVoucher}
                      onChange={(e) => setDisableCreditVoucher(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span>Disable Printing Credit Voucher</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={askDeliveryReceiptPrint}
                      onChange={(e) => setAskDeliveryReceiptPrint(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span>Ask For Delivery Receipt Print</span>
                  </label>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: DESIGNS */}
            {activeSubTab === 'designs' && (
              <div className="space-y-4 text-xs font-sans text-slate-800">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Thermal Receipt Format</label>
                  <select
                    value={receiptWidth}
                    onChange={(e) => setReceiptWidth(e.target.value)}
                    className="w-64 px-2.5 py-1 border border-slate-300 rounded font-semibold bg-white"
                  >
                    <option value="80mm">80mm Standard Thermal Paper</option>
                    <option value="58mm">58mm Compact Receipt Paper</option>
                    <option value="A4">A4 Full Page Tax Invoice</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Receipt Header Greeting Text</label>
                  <input
                    type="text"
                    value={headerGreeting}
                    onChange={(e) => setHeaderGreeting(e.target.value)}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Receipt Footer Message</label>
                  <input
                    type="text"
                    value={footerMessage}
                    onChange={(e) => setFooterMessage(e.target.value)}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded font-medium bg-white"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={showVatTrn}
                      onChange={(e) => setShowVatTrn(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span>Show Qatar VAT TRN Number (30000001) & QR Code on Receipt</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. MODAL FOOTER (Matching Save Diskette Button) */}
        <div className="bg-slate-200 border-t border-slate-300 px-3 py-2 flex items-center justify-end shrink-0">
          <button
            onClick={handleSave}
            className="px-5 py-1.5 bg-slate-300 hover:bg-slate-400/80 text-slate-900 font-bold border border-slate-400 rounded shadow-xs flex items-center gap-1.5 active:bg-slate-400"
          >
            <Save className="w-4 h-4 text-slate-800" />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSConfigModal;
