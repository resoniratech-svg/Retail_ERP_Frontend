import React from 'react';
import { Plus, Edit, Trash2, RefreshCw, Search, Printer } from 'lucide-react';

export const RightActionToolbar: React.FC = () => {
  return (
    <aside className="w-14 bg-slate-100 border-l border-slate-300 flex flex-col items-center py-2 gap-3 text-slate-700 select-none">
      <button className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-slate-200 text-[10px] font-semibold text-emerald-600" title="Add New (Ctrl + N)">
        <Plus className="w-4 h-4" />
        <span>Add</span>
      </button>
      <button className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-slate-200 text-[10px] font-semibold text-slate-700" title="Edit (Ctrl + E)">
        <Edit className="w-4 h-4" />
        <span>Edit</span>
      </button>
      <button className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-slate-200 text-[10px] font-semibold text-rose-600" title="Delete (Ctrl + D)">
        <Trash2 className="w-4 h-4" />
        <span>Delete</span>
      </button>
      <button className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-slate-200 text-[10px] font-semibold text-sky-600" title="Refresh (Ctrl + R)">
        <RefreshCw className="w-4 h-4" />
        <span>Refresh</span>
      </button>
      <button className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-slate-200 text-[10px] font-semibold text-purple-600" title="Search (Ctrl + F)">
        <Search className="w-4 h-4" />
        <span>Search</span>
      </button>
      <button className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-slate-200 text-[10px] font-semibold text-slate-800" title="Print (Ctrl + P)">
        <Printer className="w-4 h-4" />
        <span>Print</span>
      </button>
    </aside>
  );
};
