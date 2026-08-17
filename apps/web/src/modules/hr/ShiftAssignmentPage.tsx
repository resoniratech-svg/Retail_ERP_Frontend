import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, RefreshCw, Printer, Check, RotateCcw, Copy } from 'lucide-react';

interface ShiftAssignmentRecord {
  id: string;
  refno: string;
  sDate: string;
  shiftName: string;
  locationName: string;
  timeIn: string;
  timeTo: string;
  isPosted: string;
}

export const ShiftAssignmentPage: React.FC = () => {
  const [assignments, setAssignments] = useState<ShiftAssignmentRecord[]>([
    {
      id: '1',
      refno: 'SHF-ASSIGN-001',
      sDate: '17/08/2026',
      shiftName: 'Morning Cashier Shift',
      locationName: 'Saudi Arabia',
      timeIn: '07:00:00 AM',
      timeTo: '03:00:00 PM',
      isPosted: 'Posted',
    },
    {
      id: '2',
      refno: 'SHF-ASSIGN-002',
      sDate: '17/08/2026',
      shiftName: 'Evening POS Shift',
      locationName: 'Doha Main Branch',
      timeIn: '03:00:00 PM',
      timeTo: '11:00:00 PM',
      isPosted: 'Posted',
    },
    {
      id: '3',
      refno: 'SHF-ASSIGN-003',
      sDate: '18/08/2026',
      shiftName: 'Night Store Inventory Shift',
      locationName: 'Wakra Warehouse',
      timeIn: '11:00:00 PM',
      timeTo: '07:00:00 AM',
      isPosted: 'Draft',
    },
  ]);

  const [searchText, setSearchText] = useState('');
  const [selectedAssignId, setSelectedAssignId] = useState<string | null>('1');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    refno: `SHF-ASSIGN-00${assignments.length + 1}`,
    sDate: '17/08/2026',
    shiftName: 'Morning Cashier Shift',
    locationName: 'Saudi Arabia',
    timeIn: '07:00:00 AM',
    timeTo: '03:00:00 PM',
  });

  const filteredAssignments = assignments.filter((a) => {
    const query = searchText.toLowerCase().trim();
    if (!query) return true;
    return (
      a.refno.toLowerCase().includes(query) ||
      a.shiftName.toLowerCase().includes(query) ||
      a.locationName.toLowerCase().includes(query) ||
      a.sDate.toLowerCase().includes(query)
    );
  });

  const handleClear = () => {
    setSearchText('');
  };

  const handleUnpost = () => {
    if (!selectedAssignId) {
      alert('Please select a shift assignment to Unpost.');
      return;
    }
    setAssignments((prev) =>
      prev.map((a) => (a.id === selectedAssignId ? { ...a, isPosted: 'Unposted / Draft' } : a))
    );
    alert('↩ Shift assignment successfully Unposted!');
  };

  const handleCopyShift = () => {
    if (!selectedAssignId) {
      alert('Please select a shift assignment to copy.');
      return;
    }
    const target = assignments.find((a) => a.id === selectedAssignId);
    if (!target) return;

    const copied: ShiftAssignmentRecord = {
      ...target,
      id: Date.now().toString(),
      refno: `SHF-ASSIGN-COPY-${Date.now().toString().slice(-4)}`,
      isPosted: 'Draft',
    };
    setAssignments([copied, ...assignments]);
    alert(`📋 Created copy of shift assignment: ${copied.refno}`);
  };

  const handleAddAssignment = () => {
    const newAssign: ShiftAssignmentRecord = {
      id: Date.now().toString(),
      refno: formData.refno,
      sDate: formData.sDate,
      shiftName: formData.shiftName,
      locationName: formData.locationName,
      timeIn: formData.timeIn,
      timeTo: formData.timeTo,
      isPosted: 'Posted',
    };
    setAssignments([newAssign, ...assignments]);
    setIsAddModalOpen(false);
  };

  const handleDeleteAssignment = () => {
    if (!selectedAssignId) {
      alert('Please select an assignment record to delete.');
      return;
    }
    setAssignments(assignments.filter((a) => a.id !== selectedAssignId));
    setSelectedAssignId(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-100 font-sans text-xs select-none">
      {/* 1. TOP SUB-RIBBON ACTION BAR (Matching Target Image 3 Top) */}
      <div className="bg-white border-b border-slate-300 p-1.5 flex items-center justify-between gap-1 overflow-x-auto text-[11px] font-semibold shrink-0 shadow-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={handleUnpost}
            className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
            <span>Un Post</span>
          </button>

          <button
            onClick={handleCopyShift}
            className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded font-bold"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-600" />
            <span>Create Copy of Shift</span>
          </button>
        </div>
      </div>

      {/* 2. INNER CENTERED TITLE BAR (Matching Target Image 3) */}
      <div className="bg-slate-300 py-1 border-b border-slate-400 text-center font-bold text-slate-800 text-xs shadow-inner shrink-0">
        Shift Employee
      </div>

      {/* 3. SEARCH BAR ROW (Matching Target Image 3) */}
      <div className="bg-slate-200 p-2 border-b border-slate-300 flex items-center gap-2 shrink-0">
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
          onClick={() => alert(`🔍 Searching Shift Employees for "${searchText}"`)}
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
          <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
            <thead className="bg-slate-200 font-bold text-slate-700 uppercase text-[11px] sticky top-0 border-b border-slate-300 shadow-xs">
              <tr>
                <th className="p-2 border-r border-slate-300 w-36 font-mono">Refno</th>
                <th className="p-2 border-r border-slate-300 w-28 font-mono">SDate</th>
                <th className="p-2 border-r border-slate-300 w-48">Shift Name</th>
                <th className="p-2 border-r border-slate-300 w-44">Location Name</th>
                <th className="p-2 border-r border-slate-300 w-32 font-mono">Time In</th>
                <th className="p-2 border-r border-slate-300 w-32 font-mono">Time To</th>
                <th className="p-2 w-28 text-center">Is Posted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 italic">
                    No Shift Employee assignments found. Click ➕ (Ctrl+A) to assign shift.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setSelectedAssignId(a.id)}
                    className={`cursor-pointer hover:bg-sky-50 ${selectedAssignId === a.id ? 'bg-sky-100 font-bold text-slate-900' : 'text-slate-800'}`}
                  >
                    <td className="p-2 border-r border-slate-200 font-mono font-bold text-slate-900">{a.refno}</td>
                    <td className="p-2 border-r border-slate-200 font-mono text-slate-600">{a.sDate}</td>
                    <td className="p-2 border-r border-slate-200 font-bold">{a.shiftName}</td>
                    <td className="p-2 border-r border-slate-200 text-slate-700">{a.locationName}</td>
                    <td className="p-2 border-r border-slate-200 font-mono text-emerald-700 font-bold">{a.timeIn}</td>
                    <td className="p-2 border-r border-slate-200 font-mono text-rose-700 font-bold">{a.timeTo}</td>
                    <td className="p-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${a.isPosted.includes('Posted') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {a.isPosted}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT FLOATING ACTION TOOLBAR (Matching Target Image 3 Right Strip) */}
        <div className="w-12 bg-slate-200 border-l border-slate-300 flex flex-col items-center py-2 gap-2 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-emerald-700 shadow-xs relative group"
            title="New Assignment (Ctrl+A)"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">A</span>
          </button>

          <button
            onClick={() => {
              if (!selectedAssignId) alert('Please select an assignment record to edit.');
              else alert('✏️ Edit Shift Employee Assignment modal opened');
            }}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-amber-700 shadow-xs relative group"
            title="Edit Assignment (Ctrl+E)"
          >
            <Edit className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">E</span>
          </button>

          <button
            onClick={handleDeleteAssignment}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-rose-700 shadow-xs relative group"
            title="Delete Assignment (Ctrl+D)"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">D</span>
          </button>

          <button
            onClick={() => alert('🔄 Grid refreshed!')}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-sky-700 shadow-xs relative group"
            title="Refresh (Ctrl+R)"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">R</span>
          </button>

          <button
            onClick={() => alert('🖨️ Shift Roster Report Preview (Ctrl+P)')}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-indigo-700 shadow-xs relative group"
            title="Print Preview (Ctrl+P)"
          >
            <Printer className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">P</span>
          </button>
        </div>
      </div>

      {/* 5. BOTTOM STATUS PAGINATION FOOTER (Matching Target Image 3 Bottom with + - ✓ x) */}
      <div className="bg-slate-200 border-t border-slate-300 px-3 py-1 flex items-center justify-between text-[11px] text-slate-600 font-mono shrink-0">
        <div className="flex items-center gap-1.5">
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">|◄</button>
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">◄</button>
          <span className="font-bold text-slate-800 px-2">Shift Employee {filteredAssignments.length === 0 ? '0 of 0' : `1 of ${filteredAssignments.length}`}</span>
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">►</button>
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">►|</button>
          <div className="flex items-center gap-1 ml-2 border-l border-slate-400 pl-2">
            <button onClick={() => setIsAddModalOpen(true)} className="px-1.5 py-0.5 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded font-bold text-emerald-700">+</button>
            <button onClick={handleDeleteAssignment} className="px-1.5 py-0.5 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded font-bold text-rose-700">-</button>
            <button onClick={() => alert('✓ Assignment confirmed!')} className="px-1.5 py-0.5 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded font-bold text-blue-700">✓</button>
            <button onClick={() => setSelectedAssignId(null)} className="px-1.5 py-0.5 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded font-bold text-slate-700">✕</button>
          </div>
        </div>
        <div>Status: Ready | Server: Connected</div>
      </div>

      {/* 6. ADD ASSIGNMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-200 rounded-xl shadow-2xl border border-slate-400 w-full max-w-md overflow-hidden font-sans">
            <div className="bg-slate-300 text-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-400">
              <h2 className="text-xs font-bold">New Shift Employee Roster Assignment</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-600 hover:text-slate-900 font-bold">✕</button>
            </div>
            <div className="p-4 space-y-3 bg-slate-100 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Refno</label>
                <input
                  type="text"
                  value={formData.refno}
                  onChange={(e) => setFormData({ ...formData, refno: e.target.value })}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded font-mono bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Shift Master Select</label>
                <select
                  value={formData.shiftName}
                  onChange={(e) => setFormData({ ...formData, shiftName: e.target.value })}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded font-semibold bg-white"
                >
                  <option value="Morning Cashier Shift">Morning Cashier Shift (07:00 AM - 03:00 PM)</option>
                  <option value="Evening POS Shift">Evening POS Shift (03:00 PM - 11:00 PM)</option>
                  <option value="Night Store Inventory Shift">Night Store Inventory Shift (11:00 PM - 07:00 AM)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Store Location</label>
                <select
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded font-semibold bg-white"
                >
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Doha Main Branch">Doha Main Branch</option>
                  <option value="Wakra Warehouse">Wakra Warehouse</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-300">
                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-1.5 bg-slate-300 hover:bg-slate-400/80 text-slate-800 font-bold border border-slate-400 rounded">
                  Cancel
                </button>
                <button onClick={handleAddAssignment} className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Assign Shift</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftAssignmentPage;
