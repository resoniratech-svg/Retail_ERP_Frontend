import React, { useState } from 'react';
import { Flag, Check, X, RotateCcw } from 'lucide-react';
import { formatQAR } from '@qatar-erp/utils';

export interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  taxAmount: number;
  taxableAmt: number;
  onFinishSettlement: (print: boolean) => void;
  onOpenCreditCustomerSearch: () => void;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({
  isOpen,
  onClose,
  grandTotal,
  taxAmount,
  taxableAmt,
  onFinishSettlement,
  onOpenCreditCustomerSearch,
}) => {
  const [paymode, setPaymode] = useState<'cash' | 'card' | 'credit' | 'voucher' | 'multi'>('multi');
  const [cashAmount, setCashAmount] = useState(grandTotal);
  const [cardAmount, setCardAmount] = useState(0);
  const [voucherAmount, setVoucherAmount] = useState(0);
  const [creditAmount, setCreditAmount] = useState(0);
  const [tenderedAmount, setTenderedAmount] = useState(grandTotal);
  const [refLpoNumber, setRefLpoNumber] = useState('');
  const [isWalkIn, setIsWalkIn] = useState(true);

  if (!isOpen) return null;

  const balanceAmount = Math.max(0, tenderedAmount - grandTotal);

  const handleNumpadKey = (key: string) => {
    if (key === 'C') {
      setTenderedAmount(0);
    } else if (key === '◄') {
      const str = tenderedAmount.toString();
      setTenderedAmount(str.length > 1 ? parseFloat(str.slice(0, -1)) || 0 : 0);
    } else if (key === '00') {
      setTenderedAmount((prev) => parseFloat(prev.toString() + '00') || 0);
    } else if (key === '.') {
      // Decimal point handler if needed
    } else if (key === '↵') {
      onFinishSettlement(true);
    } else {
      const str = tenderedAmount === 0 ? key : tenderedAmount.toString() + key;
      setTenderedAmount(parseFloat(str) || 0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 select-none font-sans text-xs">
      <div className="bg-slate-200 rounded-xl shadow-2xl border border-slate-400 w-full max-w-4xl overflow-hidden flex flex-col h-[560px]">
        {/* 1. TITLE BAR (Matching Screenshot 100%) */}
        <div className="bg-slate-300 text-slate-900 px-3 py-1.5 flex items-center justify-between border-b border-slate-400 shrink-0">
          <h2 className="text-xs font-bold tracking-wide">Payment</h2>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold text-sm px-1.5 py-0.5 rounded hover:bg-slate-400/50"
          >
            ✕
          </button>
        </div>

        {/* 2. MAIN MODAL BODY */}
        <div className="flex-1 flex overflow-hidden p-2 gap-2">
          {/* LEFT SIDEBAR: PAYMENT TYPE BUTTONS & EXTRA TOOLS */}
          <div className="w-48 flex flex-col gap-1.5 shrink-0">
            {/* Top 4 Payment Mode Buttons */}
            <div className="space-y-1">
              <button
                onClick={() => setPaymode('cash')}
                className={`w-full p-2 border rounded text-left flex items-center justify-between shadow-2xs ${
                  paymode === 'cash' ? 'bg-emerald-100 border-emerald-500 ring-1 ring-emerald-500' : 'bg-slate-100 hover:bg-white border-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900">Cash [F1]</div>
                  <div className="font-mono text-emerald-700 font-bold text-xs">{cashAmount.toFixed(2)}</div>
                </div>
                <span className="text-lg">💵</span>
              </button>

              <button
                onClick={() => setPaymode('card')}
                className={`w-full p-2 border rounded text-left flex items-center justify-between shadow-2xs ${
                  paymode === 'card' ? 'bg-sky-100 border-sky-500 ring-1 ring-sky-500' : 'bg-slate-100 hover:bg-white border-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900">Credit Card [F2]</div>
                  <div className="font-mono text-sky-700 font-bold text-xs">{cardAmount.toFixed(2)}</div>
                </div>
                <span className="text-lg">💳</span>
              </button>

              <button
                onClick={() => setPaymode('voucher')}
                className={`w-full p-2 border rounded text-left flex items-center justify-between shadow-2xs ${
                  paymode === 'voucher' ? 'bg-amber-100 border-amber-500 ring-1 ring-amber-500' : 'bg-slate-100 hover:bg-white border-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900">Voucher [F3]</div>
                  <div className="font-mono text-amber-700 font-bold text-xs">{voucherAmount.toFixed(2)}</div>
                </div>
                <span className="text-lg">🧾</span>
              </button>

              <button
                onClick={() => {
                  setPaymode('credit');
                  onOpenCreditCustomerSearch();
                }}
                className={`w-full p-2 border rounded text-left flex items-center justify-between shadow-2xs ${
                  paymode === 'credit' ? 'bg-purple-100 border-purple-500 ring-1 ring-purple-500' : 'bg-slate-100 hover:bg-white border-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900">Credit [F4]</div>
                  <div className="font-mono text-purple-700 font-bold text-xs">{creditAmount.toFixed(2)}</div>
                </div>
                <span className="text-lg">👥</span>
              </button>
            </div>

            {/* Bottom 7 Feature Buttons matching screenshot */}
            <div className="flex-1 bg-slate-100 p-1 border border-slate-300 rounded space-y-1 overflow-y-auto">
              <button onClick={() => alert('Foreign Currencies Modal')} className="w-full py-1 px-2 bg-slate-200 hover:bg-slate-300 rounded border border-slate-400 font-bold text-[11px] text-slate-800 flex items-center justify-between">
                <span>Foreign Currencies</span>
                <span>💱</span>
              </button>
              <button onClick={() => alert('Delivery Agents Setup')} className="w-full py-1 px-2 bg-slate-200 hover:bg-slate-300 rounded border border-slate-400 font-bold text-[11px] text-slate-800 flex items-center justify-between">
                <span>Delivery Agents</span>
                <span>🛵</span>
              </button>
              <button onClick={() => alert('Loyalty Rewards Check')} className="w-full py-1 px-2 bg-slate-200 hover:bg-slate-300 rounded border border-slate-400 font-bold text-[11px] text-slate-800 flex items-center justify-between">
                <span>Loyalty</span>
                <span>⭐</span>
              </button>
              <button onClick={() => alert('Hold Invoice')} className="w-full py-1 px-2 bg-slate-200 hover:bg-slate-300 rounded border border-slate-400 font-bold text-[11px] text-slate-800 flex items-center justify-between">
                <span>Hold</span>
                <span>📎</span>
              </button>
              <button onClick={() => alert('Salesman Assignment')} className="w-full py-1 px-2 bg-slate-200 hover:bg-slate-300 rounded border border-slate-400 font-bold text-[11px] text-slate-800 flex items-center justify-between">
                <span>Salesman</span>
                <span>👤</span>
              </button>
              <button onClick={() => alert('Pre-Defined Discounts')} className="w-full py-1 px-2 bg-slate-200 hover:bg-slate-300 rounded border border-slate-400 font-bold text-[11px] text-slate-800 flex items-center justify-between">
                <span>Pre-Defined Discounts</span>
                <span>💲</span>
              </button>
              <button onClick={() => alert('Discount Applied')} className="w-full py-1 px-2 bg-amber-400 hover:bg-amber-500 rounded border border-amber-600 font-bold text-[11px] text-slate-950 flex items-center justify-between shadow-2xs">
                <span>Discount</span>
                <span>💲</span>
              </button>
            </div>
          </div>

          {/* MIDDLE SECTION: LIVE CALCULATIONS TABLE & FINISH BUTTONS */}
          <div className="flex-1 border border-slate-300 rounded bg-white p-2.5 flex flex-col justify-between shadow-xs">
            <div className="space-y-1.5 text-xs font-semibold text-slate-700">
              <div className="flex items-center justify-between">
                <span>Total</span>
                <input type="text" value={taxableAmt.toFixed(2)} readOnly className="w-32 px-2 py-0.5 border border-slate-300 rounded font-mono font-bold text-right bg-slate-100" />
              </div>

              <div className="flex items-center justify-between">
                <span>+ Tax Amount</span>
                <input type="text" value={taxAmount.toFixed(4)} readOnly className="w-32 px-2 py-0.5 border border-slate-300 rounded font-mono text-right bg-slate-100" />
              </div>

              <div className="flex items-center justify-between">
                <span>- Discount</span>
                <input type="text" value="0.00" readOnly className="w-32 px-2 py-0.5 border border-slate-300 rounded font-mono text-right bg-slate-100" />
              </div>

              <div className="flex items-center justify-between">
                <span>- Discount Tax</span>
                <input type="text" value="0.00" readOnly className="w-32 px-2 py-0.5 border border-slate-300 rounded font-mono text-right bg-slate-100" />
              </div>

              <div className="flex items-center justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                <span>= Net Total</span>
                <input type="text" value={grandTotal.toFixed(2)} readOnly className="w-32 px-2 py-0.5 border border-slate-400 rounded font-mono font-bold text-right bg-slate-200 text-slate-900" />
              </div>

              <div className="flex items-center justify-between">
                <span>+/- Round Off</span>
                <input type="text" value="0.0000" readOnly className="w-32 px-2 py-0.5 border border-slate-300 rounded font-mono text-right bg-slate-100" />
              </div>

              <div className="flex items-center justify-between">
                <span>+ Delivery Charge</span>
                <input type="text" value="0.00" readOnly className="w-32 px-2 py-0.5 border border-slate-300 rounded font-mono text-right bg-slate-100" />
              </div>

              <div className="flex items-center justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                <span>Payable</span>
                <input type="text" value={grandTotal.toFixed(2)} readOnly className="w-32 px-2 py-0.5 border border-slate-400 rounded font-mono font-bold text-right bg-slate-200 text-slate-900" />
              </div>

              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>Tendered Amount</span>
                <input
                  type="number"
                  value={tenderedAmount}
                  onChange={(e) => setTenderedAmount(parseFloat(e.target.value) || 0)}
                  className="w-32 px-2 py-0.5 border border-slate-400 rounded font-mono font-bold text-right bg-white text-slate-900"
                />
              </div>

              <div className="flex items-center justify-between font-bold text-rose-700">
                <span>Balance Amount</span>
                <input type="text" value={balanceAmount.toFixed(2)} readOnly className="w-32 px-2 py-0.5 border border-rose-300 rounded font-mono font-bold text-right bg-rose-50 text-rose-700" />
              </div>
            </div>

            {/* Status indicators list below table */}
            <div className="bg-slate-100 p-1.5 border border-slate-300 rounded text-[11px] space-y-1">
              <div className="flex items-center justify-between text-slate-700 font-medium">
                <span>💵 Multiple</span>
                <span>👤 N/A</span>
                <span>⭐ N/A</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 font-medium">
                <span>🛵 N/A</span>
                <span>💱 N/A</span>
                <label className="flex items-center gap-1 cursor-pointer font-bold">
                  <input type="checkbox" checked={isWalkIn} onChange={(e) => setIsWalkIn(e.target.checked)} className="rounded border-slate-300" />
                  <span>WalkIn Customer</span>
                </label>
              </div>
            </div>

            {/* Middle-Bottom 2 Large Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onFinishSettlement(false)}
                className="py-2 px-3 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded font-bold text-slate-900 flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>Finish Settlement(F5)</span>
                <Flag className="w-4 h-4 text-slate-800" />
              </button>

              <button
                onClick={() => onFinishSettlement(true)}
                className="py-2 px-3 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded font-bold text-slate-950 flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>Finish Settlement And Print(F6)</span>
                <Flag className="w-4 h-4 text-emerald-800 fill-emerald-700" />
              </button>
            </div>
          </div>

          {/* RIGHT SECTION: CHANGE PAYMODE RADIOS + REF # TEXTAREA + NUMPAD */}
          <div className="w-[340px] border border-slate-300 rounded bg-slate-200 p-2 flex flex-col gap-2 shrink-0 shadow-xs">
            {/* Radio Group matching screenshot */}
            <div className="bg-slate-100 p-2 border border-slate-300 rounded space-y-1 text-[11px] font-semibold text-slate-800">
              <div className="font-bold text-slate-700 pb-0.5 border-b border-slate-200">Change Paymode</div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="paymodeRadio" checked={paymode === 'cash'} onChange={() => setPaymode('cash')} />
                  <span>Cash (F7)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="paymodeRadio" checked={paymode === 'voucher'} onChange={() => setPaymode('voucher')} />
                  <span>Voucher (F10)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="paymodeRadio" checked={paymode === 'card'} onChange={() => setPaymode('card')} />
                  <span>Credit Card (F8)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="paymodeRadio" checked={paymode === 'multi'} onChange={() => setPaymode('multi')} />
                  <span>Multi Paymode (F11)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="paymodeRadio"
                    checked={paymode === 'credit'}
                    onChange={() => {
                      setPaymode('credit');
                      onOpenCreditCustomerSearch();
                    }}
                  />
                  <span>Credit (F9)</span>
                </label>
              </div>
            </div>

            {/* Reference # / LPO # Textarea matching screenshot */}
            <div className="bg-slate-100 p-1.5 border border-slate-300 rounded space-y-1">
              <label className="font-bold text-slate-700 text-[11px] block">Reference # / LPO #</label>
              <textarea
                rows={2}
                value={refLpoNumber}
                onChange={(e) => setRefLpoNumber(e.target.value)}
                placeholder="Enter Ref # or LPO # Here"
                className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white resize-none font-mono"
              />
            </div>

            {/* Touch Numpad Grid matching screenshot layout */}
            <div className="bg-slate-300 p-1.5 border border-slate-400 rounded grid grid-cols-4 gap-1 font-bold text-lg select-none flex-1">
              {/* Row 1 */}
              <button onClick={() => handleNumpadKey('1')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">1</button>
              <button onClick={() => handleNumpadKey('2')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">2</button>
              <button onClick={() => handleNumpadKey('3')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">3</button>
              <button onClick={() => handleNumpadKey('◄')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">◄</button>

              {/* Row 2 */}
              <button onClick={() => handleNumpadKey('4')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">4</button>
              <button onClick={() => handleNumpadKey('5')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">5</button>
              <button onClick={() => handleNumpadKey('6')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">6</button>
              <button onClick={() => handleNumpadKey('C')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">C</button>

              {/* Row 3 & 4 */}
              <button onClick={() => handleNumpadKey('7')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">7</button>
              <button onClick={() => handleNumpadKey('8')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">8</button>
              <button onClick={() => handleNumpadKey('9')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">9</button>
              
              {/* Tall Enter key */}
              <button
                onClick={() => handleNumpadKey('↵')}
                className="row-span-2 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-900 flex items-center justify-center font-bold text-2xl"
              >
                ↵
              </button>

              {/* Row 4 */}
              <button onClick={() => handleNumpadKey('00')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold text-sm">00</button>
              <button onClick={() => handleNumpadKey('0')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">0</button>
              <button onClick={() => handleNumpadKey('.')} className="h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded shadow-2xs text-slate-800 flex items-center justify-center font-bold">.</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementModal;
