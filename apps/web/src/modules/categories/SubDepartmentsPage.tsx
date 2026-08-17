import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, RefreshCw, Printer, Check, ListOrdered } from 'lucide-react';

interface SubDepartmentRecord {
  id: string;
  department: string;
  subDepartmentName: string;
  description: string;
}

export const SubDepartmentsPage: React.FC = () => {
  const [subDepartments, setSubDepartments] = useState<SubDepartmentRecord[]>([
    { id: '1', department: 'GSDUYGYG', subDepartmentName: 'GSFDGVFF', description: 'gsvdgsvdg' },
    { id: '2', department: 'Fresh Food & Produce', subDepartmentName: 'Organic Fruits & Veg', description: 'Fresh local organic produce' },
    { id: '3', department: 'Beverages & Soft Drinks', subDepartmentName: 'Energy & Health Drinks', description: 'Imported energy beverages' },
    { id: '4', department: 'Dairy & Chilled Goods', subDepartmentName: 'Qatar Local Milk & Laban', description: 'Daily fresh Almarai and Dandy' },
  ]);

  const [searchText, setSearchText] = useState('');
  const [selectedSubDeptId, setSelectedSubDeptId] = useState<string | null>('1');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSortOrderModalOpen, setIsSortOrderModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    department: 'GSDUYGYG',
    subDepartmentName: '',
    description: '',
  });

  const filteredSubDepts = subDepartments.filter((sd) => {
    const query = searchText.toLowerCase().trim();
    if (!query) return true;
    return (
      sd.department.toLowerCase().includes(query) ||
      sd.subDepartmentName.toLowerCase().includes(query) ||
      sd.description.toLowerCase().includes(query)
    );
  });

  const handleClear = () => {
    setSearchText('');
  };

  const handleAddSubDepartment = () => {
    if (!formData.subDepartmentName.trim()) {
      alert('Please enter Sub Department Name');
      return;
    }
    const newSubDept: SubDepartmentRecord = {
      id: Date.now().toString(),
      department: formData.department,
      subDepartmentName: formData.subDepartmentName,
      description: formData.description || 'N/A',
    };
    setSubDepartments([newSubDept, ...subDepartments]);
    setIsAddModalOpen(false);
    setFormData({ department: 'GSDUYGYG', subDepartmentName: '', description: '' });
  };

  const handleDeleteSubDepartment = () => {
    if (!selectedSubDeptId) {
      alert('Please select a sub department to delete.');
      return;
    }
    setSubDepartments(subDepartments.filter((sd) => sd.id !== selectedSubDeptId));
    setSelectedSubDeptId(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-100 font-sans text-xs select-none">
      {/* 1. TOP SUB-RIBBON ACTION BAR (Matching Target Image 3 Top Left) */}
      <div className="bg-slate-200 border-b border-slate-300 px-3 py-1 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSortOrderModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-0.5 bg-slate-300 hover:bg-slate-400/80 text-slate-800 font-bold border border-slate-400 rounded shadow-xs"
          >
            <ListOrdered className="w-3.5 h-3.5 text-indigo-700" />
            <span>Sort Order</span>
          </button>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">Sub Departments - DART POS</span>
      </div>

      {/* 2. INNER CENTERED TITLE BAR (Matching Target Image 3) */}
      <div className="bg-slate-300 py-1 border-b border-slate-400 text-center font-bold text-slate-800 text-xs shadow-inner">
        Sub Departments
      </div>

      {/* 3. SEARCH BAR ROW (Matching Target Image 3) */}
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
          onClick={() => alert(`🔍 Searching Sub Departments for "${searchText}"`)}
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
                <th className="p-2 w-64 border-r border-slate-300">Department</th>
                <th className="p-2 w-72 border-r border-slate-300">Sub Department Name</th>
                <th className="p-2 border-r border-slate-300">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredSubDepts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-slate-400 italic">
                    No Sub Department records found. Click ➕ (Ctrl+A) to create a sub department.
                  </td>
                </tr>
              ) : (
                filteredSubDepts.map((sd) => (
                  <tr
                    key={sd.id}
                    onClick={() => setSelectedSubDeptId(sd.id)}
                    className={`cursor-pointer hover:bg-sky-50 ${selectedSubDeptId === sd.id ? 'bg-sky-100 font-bold text-slate-900' : 'text-slate-800'}`}
                  >
                    <td className="p-2 border-r border-slate-200 font-semibold">{sd.department}</td>
                    <td className="p-2 border-r border-slate-200 font-bold">{sd.subDepartmentName}</td>
                    <td className="p-2 border-r border-slate-200 text-slate-600">{sd.description}</td>
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
            title="New Sub Department (Ctrl+A)"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">A</span>
          </button>

          <button
            onClick={() => {
              if (!selectedSubDeptId) alert('Please select a sub department to edit.');
              else alert('✏️ Edit Sub Department modal opened');
            }}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-amber-700 shadow-xs relative group"
            title="Edit Sub Department (Ctrl+E)"
          >
            <Edit className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">E</span>
          </button>

          <button
            onClick={handleDeleteSubDepartment}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-rose-700 shadow-xs relative group"
            title="Delete Sub Department (Ctrl+D)"
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
            onClick={() => alert('🖨️ Sub Departments Summary Report Preview (Ctrl+P)')}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-indigo-700 shadow-xs relative group"
            title="Print Preview (Ctrl+P)"
          >
            <Printer className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">P</span>
          </button>
        </div>
      </div>

      {/* 5. BOTTOM STATUS PAGINATION FOOTER (Matching Target Image 3 Bottom) */}
      <div className="bg-slate-200 border-t border-slate-300 px-3 py-1 flex items-center justify-between text-[11px] text-slate-600 font-mono">
        <div className="flex items-center gap-1.5">
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">|◄</button>
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">◄</button>
          <span className="font-bold text-slate-800 px-2">Sub Departments {filteredSubDepts.length === 0 ? '0 of 0' : `1 of ${filteredSubDepts.length}`}</span>
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">►</button>
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">►|</button>
        </div>
        <div>Status: Ready | Server: Connected</div>
      </div>

      {/* 6. ADD SUB DEPARTMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-200 rounded-xl shadow-2xl border border-slate-400 w-full max-w-md overflow-hidden font-sans">
            <div className="bg-slate-300 text-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-400">
              <h2 className="text-xs font-bold">New Sub Department</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-600 hover:text-slate-900 font-bold">✕</button>
            </div>
            <div className="p-4 space-y-3 bg-slate-100 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Parent Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded font-semibold bg-white"
                >
                  <option value="GSDUYGYG">GSDUYGYG</option>
                  <option value="Fresh Food & Produce">Fresh Food & Produce</option>
                  <option value="Beverages & Soft Drinks">Beverages & Soft Drinks</option>
                  <option value="Dairy & Chilled Goods">Dairy & Chilled Goods</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Sub Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Organic Fruits"
                  value={formData.subDepartmentName}
                  onChange={(e) => setFormData({ ...formData, subDepartmentName: e.target.value })}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded font-bold bg-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Sub department description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded font-sans text-xs bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-300">
                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-1.5 bg-slate-300 hover:bg-slate-400/80 text-slate-800 font-bold border border-slate-400 rounded">
                  Cancel
                </button>
                <button onClick={handleAddSubDepartment} className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Sub Department</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. SORT ORDER MODAL */}
      {isSortOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-200 rounded-xl shadow-2xl border border-slate-400 w-full max-w-md overflow-hidden font-sans">
            <div className="bg-slate-300 text-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-400">
              <h2 className="text-xs font-bold">Sub Department Display Sort Order</h2>
              <button onClick={() => setIsSortOrderModalOpen(false)} className="text-slate-600 hover:text-slate-900 font-bold">✕</button>
            </div>
            <div className="p-4 space-y-3 bg-slate-100 text-xs">
              <p className="text-slate-600">Re-order display priority index for POS touchscreen registers:</p>
              <div className="space-y-1.5 border border-slate-300 rounded p-2 bg-white max-h-60 overflow-y-auto">
                {subDepartments.map((sd, idx) => (
                  <div key={sd.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded font-medium">
                    <span>{sd.subDepartmentName} ({sd.department})</span>
                    <input type="number" defaultValue={idx + 1} className="w-12 px-1 py-0.5 border border-slate-300 rounded font-mono font-bold text-center" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-300">
                <button onClick={() => setIsSortOrderModalOpen(false)} className="px-4 py-1.5 bg-slate-300 hover:bg-slate-400/80 text-slate-800 font-bold border border-slate-400 rounded">
                  Cancel
                </button>
                <button onClick={() => { alert('✅ Sort order saved successfully!'); setIsSortOrderModalOpen(false); }} className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-xs">
                  Save Sort Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubDepartmentsPage;
