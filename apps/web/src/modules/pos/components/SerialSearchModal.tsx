import React, { useState } from 'react';
import { Printer, Eye } from 'lucide-react';

export interface SerialSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSerial: (item: { serialNo: string; name: string; price: number }) => void;
}

export const SerialSearchModal: React.FC<SerialSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectSerial,
}) => {
  const [serialInput, setSerialInput] = useState('');
  const [matchMode, setMatchMode] = useState<'contains' | 'begin'>('contains');

  // Sample Serial items matching screenshot columns
  const [serialItems] = useState([
    {
      invoiceNo: 'INV-2026-901',
      counter: 'Counter #1',
      invDate: '18/08/2026',
      serialNo: 'SN-9988776655',
      description: 'Apple iPhone 15 Pro 256GB Natural Titanium',
      priceIncludeTax: 4299.00,
      serialNo1: 'IMEI-354920192837192',
      warrantyMonths: '12',
    },
    {
      invoiceNo: 'INV-2026-902',
      counter: 'Counter #1',
      invDate: '17/08/2026',
      serialNo: 'SN-8877665544',
      description: 'Samsung Galaxy S24 Ultra 512GB Gray',
      priceIncludeTax: 4899.00,
      serialNo1: 'IMEI-359182736451029',
      warrantyMonths: '24',
    },
  ]);

  const [selectedSerial, setSelectedSerial] = useState(serialItems[0]);

  if (!isOpen) return null;

  const handleConfirmSelect = () => {
    if (selectedSerial) {
      onSelectSerial({
        serialNo: selectedSerial.serialNo,
        name: `${selectedSerial.description} (SN: ${selectedSerial.serialNo})`,
        price: selectedSerial.priceIncludeTax,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 select-none font-sans text-xs">
      <div className="bg-slate-200 rounded-xl shadow-2xl border border-slate-400 w-full max-w-5xl overflow-hidden flex flex-col h-[560px]">
        {/* 1. TITLE BAR (Matching Serial Search Screenshot 3) */}
        <div className="bg-slate-300 text-slate-900 px-3 py-1.5 flex items-center justify-between border-b border-slate-400 shrink-0">
          <h2 className="text-xs font-bold tracking-wide">Serial Search</h2>
          <div className="flex items-center gap-1">
            <button className="text-slate-600 hover:text-slate-900 font-bold px-1.5 py-0.5 rounded hover:bg-slate-400/50">_</button>
            <button className="text-slate-600 hover:text-slate-900 font-bold px-1.5 py-0.5 rounded hover:bg-slate-400/50">□</button>
            <button onClick={onClose} className="text-slate-600 hover:text-slate-900 font-bold px-1.5 py-0.5 rounded hover:bg-slate-400/50">✕</button>
          </div>
        </div>

        {/* 2. TOP FILTER ROW */}
        <div className="bg-slate-100 p-2.5 border-b border-slate-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-slate-700">Enter Serial #</span>
            <input
              type="text"
              value={serialInput}
              onChange={(e) => setSerialInput(e.target.value)}
              placeholder="Type Serial / IMEI..."
              className="w-56 px-2.5 py-1 border border-slate-400 rounded bg-white text-xs font-mono font-bold focus:border-cyan-600 focus:outline-none"
              autoFocus
            />

            <button
              onClick={() => alert('Filtered Serial List')}
              className="px-3 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded font-bold text-slate-900 shadow-2xs"
            >
              Show
            </button>

            <div className="flex items-center gap-3 font-semibold text-slate-700 pl-2">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="serialMatch"
                  checked={matchMode === 'contains'}
                  onChange={() => setMatchMode('contains')}
                />
                <span>Contains</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="serialMatch"
                  checked={matchMode === 'begin'}
                  onChange={() => setMatchMode('begin')}
                />
                <span>Begin</span>
              </label>
            </div>
          </div>

          {/* Top Right Action Buttons matching screenshot */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Previewing Serial Tracking Report')}
              className="px-3 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded font-bold text-slate-900 flex items-center gap-1 shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Preview (F2)</span>
            </button>

            <button
              onClick={() => alert('Printing Serial Tracking Report')}
              className="px-3 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded font-bold text-slate-900 flex items-center gap-1 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-700" />
              <span>Print (F1)</span>
            </button>
          </div>
        </div>

        {/* 3. SERIAL LIST TABLE GRID */}
        <div className="flex-1 overflow-auto bg-white p-1">
          <div className="bg-slate-300 py-1 text-center font-bold text-slate-800 text-xs border-b border-slate-400 shadow-inner">
            Serial List
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-200 font-bold text-slate-700 uppercase text-[10px] sticky top-0 border-b border-slate-300">
              <tr>
                <th className="p-2 border-r border-slate-300">Invoice No</th>
                <th className="p-2 border-r border-slate-300">Counter</th>
                <th className="p-2 border-r border-slate-300">Inv Date</th>
                <th className="p-2 border-r border-slate-300 font-mono">Serial No</th>
                <th className="p-2 border-r border-slate-300">Description</th>
                <th className="p-2 border-r border-slate-300 text-right">Price Include Tax</th>
                <th className="p-2 border-r border-slate-300 font-mono">Serial No1</th>
                <th className="p-2 text-center">Warranty(Months)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {serialItems.map((item) => {
                const isSelected = selectedSerial.serialNo === item.serialNo;
                return (
                  <tr
                    key={item.serialNo}
                    onClick={() => setSelectedSerial(item)}
                    onDoubleClick={handleConfirmSelect}
                    className={`cursor-pointer hover:bg-sky-50 ${
                      isSelected ? 'bg-navy-900 bg-blue-900 text-white font-bold' : ''
                    }`}
                  >
                    <td className="p-2 border-r border-slate-200 font-mono font-bold">{item.invoiceNo}</td>
                    <td className="p-2 border-r border-slate-200">{item.counter}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{item.invDate}</td>
                    <td className="p-2 border-r border-slate-200 font-mono font-bold text-blue-900">{item.serialNo}</td>
                    <td className="p-2 border-r border-slate-200 font-bold">{item.description}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono font-bold">{item.priceIncludeTax.toFixed(2)}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{item.serialNo1}</td>
                    <td className="p-2 text-center font-bold text-slate-700">{item.warrantyMonths}</td>
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

export default SerialSearchModal;
