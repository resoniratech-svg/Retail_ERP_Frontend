import React, { useState } from 'react';
import { Flag, Unlock, Check, RefreshCw } from 'lucide-react';

interface DenominationItem {
  val: number;
  label: string;
  count: number;
}

export const DayClosePage: React.FC = () => {
  // Cash Denominations (Dirhams / Notes & Coins)
  const [dirhams, setDirhams] = useState<DenominationItem[]>([
    { val: 1000, label: '1000.... X', count: 0 },
    { val: 500, label: '500.... X', count: 0 },
    { val: 200, label: '200.... X', count: 0 },
    { val: 100, label: '100.... X', count: 0 },
    { val: 50, label: '50.0... X', count: 0 },
    { val: 20, label: '20.0... X', count: 0 },
    { val: 10, label: '10.0... X', count: 0 },
  ]);

  // Fils / Coins
  const [fils, setFils] = useState<DenominationItem[]>([
    { val: 1.0, label: '1.0000 X', count: 0 },
    { val: 0.5, label: '0.5000 X', count: 0 },
    { val: 0.25, label: '0.2500 X', count: 0 },
    { val: 0.1, label: '0.1000 X', count: 0 },
    { val: 0.05, label: '0.0500 X', count: 0 },
  ]);

  const [selectedCell, setSelectedCell] = useState<{ type: 'dirham' | 'fils'; index: number } | null>({
    type: 'dirham',
    index: 0,
  });

  const [cashierName, setCashierName] = useState('Ahmed Cashier (POS-01)');
  const [finishedSessions] = useState([
    { id: 'SESS-901', cashier: 'Harlesh Admin', opened: '07:00:00 AM', closed: '03:00:00 PM', openingCash: '500.00', closingCash: '2,450.00', status: 'Closed' },
  ]);
  const [activeSessions] = useState([
    { id: 'SESS-902', cashier: 'Ahmed Cashier', opened: '03:05:00 PM', currentCash: '1,820.00', terminal: 'POS-01', status: 'Active' },
  ]);

  // Numpad Key Press Handler
  const handleNumpadPress = (key: string) => {
    if (!selectedCell) return;

    const targetList = selectedCell.type === 'dirham' ? dirhams : fils;
    const setter = selectedCell.type === 'dirham' ? setDirhams : setFils;
    const currentItem = targetList[selectedCell.index];

    let newCountStr = currentItem.count.toString();

    if (key === 'C') {
      newCountStr = '0';
    } else if (key === '◄') {
      newCountStr = newCountStr.length > 1 ? newCountStr.slice(0, -1) : '0';
    } else if (key === '.') {
      // Ignore decimal for note counts
      return;
    } else if (key === '00') {
      newCountStr = currentItem.count === 0 ? '0' : currentItem.count.toString() + '00';
    } else if (key === '↵') {
      // Move to next field
      if (selectedCell.type === 'dirham') {
        if (selectedCell.index < dirhams.length - 1) {
          setSelectedCell({ type: 'dirham', index: selectedCell.index + 1 });
        } else {
          setSelectedCell({ type: 'fils', index: 0 });
        }
      } else {
        if (selectedCell.index < fils.length - 1) {
          setSelectedCell({ type: 'fils', index: selectedCell.index + 1 });
        }
      }
      return;
    } else {
      newCountStr = currentItem.count === 0 ? key : currentItem.count.toString() + key;
    }

    const updatedVal = parseInt(newCountStr, 10) || 0;
    setter(targetList.map((item, idx) => (idx === selectedCell.index ? { ...item, count: updatedVal } : item)));
  };

  // Calculate Totals
  const dirhamsTotal = dirhams.reduce((acc, d) => acc + d.val * d.count, 0);
  const filsTotal = fils.reduce((acc, f) => acc + f.val * f.count, 0);
  const grandTotal = dirhamsTotal + filsTotal;

  const handleDayCloseConfirm = () => {
    alert(`🏁 DAY CLOSE CONFIRMED!\nTotal Counted Cash: ${grandTotal.toFixed(2)} QAR\nSessions Closed Successfully.`);
  };

  const handleOpenDrawer = () => {
    alert('📥 Cash Drawer Triggered & Opened!');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-100 font-sans text-xs select-none">
      {/* 1. TOP TITLE HEADER */}
      <div className="bg-slate-200 border-b border-slate-300 px-3 py-1.5 flex items-center justify-between shadow-xs">
        <h1 className="text-sm font-bold text-slate-800 tracking-tight">Day Close - DART POS</h1>
        <span className="text-[11px] text-slate-500 font-mono">Date: {new Date().toLocaleDateString('en-GB')}</span>
      </div>

      {/* 2. INNER CENTERED TITLE BAR */}
      <div className="bg-slate-300 py-1 border-b border-slate-400 text-center font-bold text-slate-800 text-xs shadow-inner">
        Day Close
      </div>

      {/* 3. MAIN SPLIT BODY */}
      <div className="flex-1 flex overflow-hidden p-1.5 gap-2">
        {/* LEFT COLUMN: FINISHED & ACTIVE SESSIONS (Matching Screenshot Left side) */}
        <div className="flex-1 flex flex-col gap-2 overflow-hidden">
          {/* TOP BOX: FINISHED SESSIONS */}
          <div className="flex-1 border border-slate-300 rounded bg-white overflow-hidden flex flex-col shadow-xs">
            <div className="bg-slate-200 px-3 py-1 font-bold text-slate-700 border-b border-slate-300">
              Finished Sessions
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 font-bold text-slate-600 uppercase text-[10px] border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="p-2 border-r border-slate-200">Session ID</th>
                    <th className="p-2 border-r border-slate-200">Cashier</th>
                    <th className="p-2 border-r border-slate-200">Opened Time</th>
                    <th className="p-2 border-r border-slate-200">Closed Time</th>
                    <th className="p-2 border-r border-slate-200 text-right">Opening Cash</th>
                    <th className="p-2 border-r border-slate-200 text-right">Closing Cash</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  {finishedSessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-200 font-mono font-bold text-slate-900">{s.id}</td>
                      <td className="p-2 border-r border-slate-200">{s.cashier}</td>
                      <td className="p-2 border-r border-slate-200 font-mono">{s.opened}</td>
                      <td className="p-2 border-r border-slate-200 font-mono">{s.closed}</td>
                      <td className="p-2 border-r border-slate-200 font-mono text-right">{s.openingCash}</td>
                      <td className="p-2 border-r border-slate-200 font-mono text-right font-bold">{s.closingCash}</td>
                      <td className="p-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">{s.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* BOTTOM BOX: ACTIVE SESSIONS */}
          <div className="h-48 border border-slate-300 rounded bg-white overflow-hidden flex flex-col shadow-xs">
            <div className="bg-slate-200 px-3 py-1 font-bold text-slate-700 border-b border-slate-300">
              Active Sessions
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 font-bold text-slate-600 uppercase text-[10px] border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="p-2 border-r border-slate-200">Session ID</th>
                    <th className="p-2 border-r border-slate-200">Cashier</th>
                    <th className="p-2 border-r border-slate-200">Opened Time</th>
                    <th className="p-2 border-r border-slate-200 text-right">Current Cash</th>
                    <th className="p-2 border-r border-slate-200">Terminal</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  {activeSessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-200 font-mono font-bold text-slate-900">{s.id}</td>
                      <td className="p-2 border-r border-slate-200 font-bold">{s.cashier}</td>
                      <td className="p-2 border-r border-slate-200 font-mono">{s.opened}</td>
                      <td className="p-2 border-r border-slate-200 font-mono text-right font-bold text-emerald-700">{s.currentCash}</td>
                      <td className="p-2 border-r border-slate-200">{s.terminal}</td>
                      <td className="p-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">{s.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CASH DENOMINATION & NUMPAD (Matching Screenshot Right Side 100%) */}
        <div className="w-[450px] border border-slate-300 rounded bg-slate-200 p-2 flex flex-col gap-2 shadow-xs shrink-0">
          {/* Top Control Bar matching screenshot */}
          <div className="bg-slate-100 p-2 border border-slate-300 rounded space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-1">
                <span className="font-semibold text-slate-700 shrink-0">Cashier</span>
                <input
                  type="text"
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  className="w-full px-2 py-0.5 border border-slate-300 rounded font-semibold bg-white text-xs"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-semibold text-slate-700">Closing Cash</span>
                <input
                  type="text"
                  value={grandTotal.toFixed(2)}
                  readOnly
                  className="w-24 px-2 py-0.5 border border-slate-300 rounded font-mono font-bold text-right bg-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <div className="flex items-center gap-1">
                <span>Finished Sessions :</span>
                <button onClick={() => alert('Finished Sessions Enabled')} className="text-blue-600 underline">Enable</button>
              </div>

              <div className="flex items-center gap-1">
                <span>Active Sessions :</span>
                <span className="font-mono text-emerald-700">1</span>
              </div>
            </div>

            {/* Action Buttons matching screenshot */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={handleOpenDrawer}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold border border-slate-400 rounded shadow-xs flex items-center gap-1"
              >
                <span className="text-blue-600">📥</span>
                <span>Open Drawer</span>
              </button>

              <button
                onClick={handleDayCloseConfirm}
                className="px-3 py-1 bg-slate-300 hover:bg-slate-400 text-slate-900 font-bold border border-slate-400 rounded shadow-xs flex items-center gap-1"
              >
                <Flag className="w-4 h-4 text-emerald-700 fill-emerald-600" />
                <span>Day Close</span>
              </button>
            </div>
          </div>

          {/* Cash Denominations Table Grid (Dirhams & Fils matching screenshot) */}
          <div className="border border-slate-300 rounded bg-white overflow-hidden text-xs">
            <div className="grid grid-cols-2 bg-slate-200 font-bold text-slate-700 border-b border-slate-300 px-2 py-1">
              <span>Dirhams</span>
              <span className="pl-4">Fils</span>
            </div>

            <div className="grid grid-cols-2 p-1 gap-x-2 gap-y-1">
              {/* Dirhams (Notes) Left side */}
              <div className="space-y-1">
                {dirhams.map((item, idx) => {
                  const isSelected = selectedCell?.type === 'dirham' && selectedCell?.index === idx;
                  const itemTotal = (item.val * item.count).toFixed(2);
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedCell({ type: 'dirham', index: idx })}
                      className="flex items-center gap-1 text-[11px]"
                    >
                      <span className="w-16 font-mono text-slate-600 shrink-0">{item.label}</span>
                      <input
                        type="text"
                        value={item.count}
                        readOnly
                        className={`w-12 px-1 py-0.5 border text-center font-mono font-bold rounded cursor-pointer ${
                          isSelected ? 'bg-sky-100 border-cyan-600 ring-1 ring-cyan-500' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                      <span className="w-12 text-right font-mono text-slate-700 shrink-0">{itemTotal}</span>
                    </div>
                  );
                })}
              </div>

              {/* Fils (Coins) Right side */}
              <div className="space-y-1 border-l border-slate-200 pl-2">
                {fils.map((item, idx) => {
                  const isSelected = selectedCell?.type === 'fils' && selectedCell?.index === idx;
                  const itemTotal = (item.val * item.count).toFixed(2);
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedCell({ type: 'fils', index: idx })}
                      className="flex items-center gap-1 text-[11px]"
                    >
                      <span className="w-16 font-mono text-slate-600 shrink-0">{item.label}</span>
                      <input
                        type="text"
                        value={item.count}
                        readOnly
                        className={`w-12 px-1 py-0.5 border text-center font-mono font-bold rounded cursor-pointer ${
                          isSelected ? 'bg-sky-100 border-cyan-600 ring-1 ring-cyan-500' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                      <span className="w-12 text-right font-mono text-slate-700 shrink-0">{itemTotal}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Row */}
            <div className="bg-slate-100 px-3 py-1.5 border-t border-slate-300 flex items-center justify-between font-bold text-slate-800">
              <span>Total :</span>
              <span className="font-mono text-sm text-emerald-800">{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* TOUCH NUMPAD KEYPAD (Matching Screenshot Layout Exactly) */}
          <div className="bg-slate-300 p-2 border border-slate-400 rounded grid grid-cols-4 gap-1.5 font-bold text-lg select-none">
            {/* Row 1 */}
            <button onClick={() => handleNumpadPress('1')} className="h-10 bg-slate-100 hover:bg-white active:bg-slate-200 border border-slate-400 rounded shadow-xs text-slate-800 flex items-center justify-center font-bold">1</button>
            <button onClick={() => handleNumpadPress('2')} className="h-10 bg-slate-100 hover:bg-white active:bg-slate-200 border border-slate-400 rounded shadow-xs text-slate-800 flex items-center justify-center font-bold">2</button>
            <button onClick={() => handleNumpadPress('3')} className="h-10 bg-slate-100 hover:bg-white active:bg-slate-200 border border-slate-400 rounded shadow-xs text-slate-800 flex items-center justify-center font-bold">3</button>
            <button onClick={() => handleNumpadPress('◄')} className="h-10 bg-slate-100 hover:bg-white active:bg-slate-200 border border-slate-400 rounded shadow-xs text-slate-800 flex items-center justify-center font-bold">◄</button>

            {/* Row 2 */}
            <button onClick={() => handleNumpadPress('4')} className="h-10 bg-slate-100 hover:bg-white active:bg-slate-200 border border-slate-400 rounded shadow-xs text-slate-800 flex items-center justify-center font-bold">4</button>
            <button onClick={() => handleNumpadPress('5')} className="h-10 bg-slate-100 hover:bg-white active:bg-slate-200 border border-slate-400 rounded shadow-xs text-slate-800 flex items-center justify-center font-bold">5</button>
            <button onClick={() => handleNumpadPress('6')} className="h-10 bg-slate-100 hover:bg-white active:bg-slate-200 border border-slate-400 rounded shadow-xs text-slate-800 flex items-center justify-center font-bold">6</button>
            <button onClick={() => handleNumpadPress('C')} className="h-10 bg-slate-100 hover:bg-white active:bg-slate-200 border border-slate-400 rounded shadow-xs text-slate-800 flex items-center justify-center font-bold">C</button>

            {/* Row 3 & 4 (Span Enter key across 2 rows) */}
            <button onClick={() => handleNumpadPress('7')} className="h-10 bg-slate-100 hover:bg-white active:bg-slate-200 border border-slate-400 rounded shadow-xs text-slate-800 flex items-center justify-center font-bold">7</button>
            <button onClick={() => handleNumpadPress('8')} className="h-10 bg-slate-100 hover:bg-white active:bg-slate-200 border border-slate-400 rounded shadow-xs text-slate-800 flex items-center justify-center font-bold">8</button>
            <button onClick={() => handleNumpadPress('9')} className="h-10 bg-slate-100 hover:bg-white active:bg-slate-200 border border-slate-400 rounded shadow-xs text-slate-800 flex items-center justify-center font-bold">9</button>
            
            {/* Big Enter Key spanning 2 rows vertically */}
            <button
              onClick={() => handleNumpadPress('↵')}
              className="row-span-2 bg-slate-100 hover:bg-white active:bg-slate-200 border border-slate-400 rounded shadow-xs text-slate-900 flex items-center justify-center font-bold text-xl"
            >
              ↵
            </button>

            {/* Row 4 */}
            <button onClick={() => handleNumpadPress('00')} className="h-10 bg-slate-100 hover:bg-white active:bg-slate-200 border border-slate-400 rounded shadow-xs text-slate-800 flex items-center justify-center font-bold text-sm">00</button>
            <button onClick={() => handleNumpadPress('0')} className="h-10 bg-slate-100 hover:bg-white active:bg-slate-200 border border-slate-400 rounded shadow-xs text-slate-800 flex items-center justify-center font-bold">0</button>
            <button onClick={() => handleNumpadPress('.')} className="h-10 bg-slate-100 hover:bg-white active:bg-slate-200 border border-slate-400 rounded shadow-xs text-slate-800 flex items-center justify-center font-bold">.</button>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM STATUS FOOTER */}
      <div className="bg-slate-200 border-t border-slate-300 px-3 py-1 flex items-center justify-between text-[11px] text-slate-600 font-mono">
        <div>Day Close Status: Active Shift POS-01 | Terminal: Connected</div>
        <div>Server: Connected | Store: Doha Main Branch</div>
      </div>
    </div>
  );
};

export default DayClosePage;
