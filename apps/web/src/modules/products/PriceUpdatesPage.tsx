import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, RefreshCw, Printer, X, Check } from 'lucide-react';

interface PriceUpdateRecord {
  id: string;
  refNo: string;
  extRef: string;
  location: string;
  notes: string;
  createdOn: string;
  posted: boolean;
}

export const PriceUpdatesPage: React.FC = () => {
  const [records, setRecords] = useState<PriceUpdateRecord[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    refNo: `PU-${Math.floor(10000 + Math.random() * 90000)}`,
    extRef: '',
    location: 'Doha Main Branch',
    notes: '',
  });

  const handleFind = () => {
    if (!searchText.trim()) return;
    alert(`🔍 Searching PriceUpdates for: "${searchText}"`);
  };

  const handleClear = () => {
    setSearchText('');
  };

  const handleAddRecord = () => {
    const newRec: PriceUpdateRecord = {
      id: Date.now().toString(),
      refNo: formData.refNo || `PU-${Math.floor(10000 + Math.random() * 90000)}`,
      extRef: formData.extRef || 'EXT-REF-01',
      location: formData.location,
      notes: formData.notes || 'Retail Price Adjustment Log',
      createdOn: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      posted: true,
    };
    setRecords([newRec, ...records]);
    setIsAddModalOpen(false);
    setFormData({
      refNo: `PU-${Math.floor(10000 + Math.random() * 90000)}`,
      extRef: '',
      location: 'Doha Main Branch',
      notes: '',
    });
  };

  const handleDeleteRecord = () => {
    if (!selectedRecordId) {
      alert('Please select a row to delete.');
      return;
    }
    setRecords(records.filter((r) => r.id !== selectedRecordId));
    setSelectedRecordId(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-100 font-sans text-xs select-none">
      {/* 1. TOP TITLE HEADER */}
      <div className="bg-slate-200 border-b border-slate-300 px-3 py-1.5 flex items-center justify-between shadow-xs">
        <h1 className="text-sm font-bold text-slate-800 tracking-tight">PriceUpdates - DART POS</h1>
        <span className="text-[11px] text-slate-500 font-mono">Total Records: {records.length}</span>
      </div>

      {/* 2. INNER CENTERED TITLE BAR (Matching Target Image 1) */}
      <div className="bg-slate-300 py-1 border-b border-slate-400 text-center font-bold text-slate-800 text-xs shadow-inner">
        PriceUpdates
      </div>

      {/* 3. SEARCH BAR ROW (Matching Target Image 1) */}
      <div className="bg-slate-200 p-2 border-b border-slate-300 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Enter text to search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-2 pr-6 py-1 border border-slate-400 rounded bg-white text-xs font-mono focus:border-cyan-600 focus:outline-none shadow-xs"
          />
          <span className="absolute right-2 top-1.5 text-slate-400 text-[10px]">▼</span>
        </div>

        <button
          onClick={handleFind}
          className="px-4 py-1 bg-slate-300 hover:bg-slate-400/80 text-slate-900 font-bold border border-slate-400 rounded shadow-xs active:bg-slate-400"
        >
          Find
        </button>

        <button
          onClick={handleClear}
          className="px-4 py-1 bg-slate-300 hover:bg-slate-400/80 text-slate-900 font-bold border border-slate-400 rounded shadow-xs active:bg-slate-400"
        >
          Clear
        </button>
      </div>

      {/* 4. MAIN CONTENT GRID & RIGHT TOOLBAR */}
      <div className="flex-1 flex overflow-hidden">
        {/* DATA GRID TABLE */}
        <div className="flex-1 overflow-auto bg-white border-r border-slate-300">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-200 font-bold text-slate-700 uppercase text-[11px] sticky top-0 border-b border-slate-300 shadow-xs">
              <tr>
                <th className="p-2 border-r border-slate-300 w-32 font-mono">Ref No</th>
                <th className="p-2 border-r border-slate-300 w-36 font-mono">Ext Ref</th>
                <th className="p-2 border-r border-slate-300 w-44">Location</th>
                <th className="p-2 border-r border-slate-300">Notes</th>
                <th className="p-2 border-r border-slate-300 w-44 font-mono">Created On</th>
                <th className="p-2 w-20 text-center">Posted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 italic">
                    No PriceUpdate records found. Click ➕ (Ctrl+A) on the right toolbar to add new record.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRecordId(r.id)}
                    className={`cursor-pointer hover:bg-sky-50 ${selectedRecordId === r.id ? 'bg-sky-100 font-bold text-slate-900' : 'text-slate-800'}`}
                  >
                    <td className="p-2 border-r border-slate-200 font-mono">{r.refNo}</td>
                    <td className="p-2 border-r border-slate-200 font-mono text-slate-600">{r.extRef}</td>
                    <td className="p-2 border-r border-slate-200">{r.location}</td>
                    <td className="p-2 border-r border-slate-200">{r.notes}</td>
                    <td className="p-2 border-r border-slate-200 font-mono text-slate-600">{r.createdOn}</td>
                    <td className="p-2 text-center">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" title="Posted"></span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT FLOATING ACTION TOOLBAR (Matching Target Image 1 Right Strip) */}
        <div className="w-12 bg-slate-200 border-l border-slate-300 flex flex-col items-center py-2 gap-2 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-emerald-700 shadow-xs relative group"
            title="New Record (Ctrl+A)"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">A</span>
          </button>

          <button
            onClick={() => {
              if (!selectedRecordId) alert('Please select a record to edit.');
              else alert('✏️ Edit PriceUpdate modal opened');
            }}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-amber-700 shadow-xs relative group"
            title="Edit Record (Ctrl+E)"
          >
            <Edit className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">E</span>
          </button>

          <button
            onClick={handleDeleteRecord}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-rose-700 shadow-xs relative group"
            title="Delete Record (Ctrl+D)"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">D</span>
          </button>

          <button
            onClick={() => alert('🔄 Grid data refreshed!')}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-sky-700 shadow-xs relative group"
            title="Refresh (Ctrl+R)"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">R</span>
          </button>

          <button
            onClick={() => alert('🖨️ PriceUpdate Summary Report Preview (Ctrl+P)')}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-indigo-700 shadow-xs relative group"
            title="Print Preview (Ctrl+P)"
          >
            <Printer className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">P</span>
          </button>
        </div>
      </div>

      {/* 5. BOTTOM STATUS PAGINATION FOOTER (Matching Target Image 1 Bottom) */}
      <div className="bg-slate-200 border-t border-slate-300 px-3 py-1 flex items-center justify-between text-[11px] text-slate-600 font-mono">
        <div className="flex items-center gap-1.5">
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">|◄</button>
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">◄</button>
          <span className="font-bold text-slate-800 px-2">PriceUpdates {records.length === 0 ? '0 of 0' : `1 of ${records.length}`}</span>
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">►</button>
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">►|</button>
        </div>
        <div>Status: Ready | Server: Connected</div>
      </div>

      {/* 6. ADD PRICE UPDATE RECORD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-200 rounded-xl shadow-2xl border border-slate-400 w-full max-w-md overflow-hidden font-sans">
            <div className="bg-slate-300 text-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-400">
              <h2 className="text-xs font-bold">New PriceUpdate Log Record</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-600 hover:text-slate-900 font-bold">✕</button>
            </div>
            <div className="p-4 space-y-3 bg-slate-100 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ref No</label>
                <input
                  type="text"
                  value={formData.refNo}
                  onChange={(e) => setFormData({ ...formData, refNo: e.target.value })}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded font-mono bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ext Ref</label>
                <input
                  type="text"
                  placeholder="Optional External Reference"
                  value={formData.extRef}
                  onChange={(e) => setFormData({ ...formData, extRef: e.target.value })}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded font-mono bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Location</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded font-semibold bg-white"
                >
                  <option value="Doha Main Branch">Doha Main Branch</option>
                  <option value="Al Rayyan Outlet">Al Rayyan Outlet</option>
                  <option value="Wakra Distribution Hub">Wakra Distribution Hub</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes</label>
                <textarea
                  rows={3}
                  placeholder="Enter change log rationale or price revision note..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white font-sans text-xs"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-300">
                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-1.5 bg-slate-300 hover:bg-slate-400/80 text-slate-800 font-bold border border-slate-400 rounded">
                  Cancel
                </button>
                <button onClick={handleAddRecord} className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceUpdatesPage;
