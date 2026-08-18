import React, { useState } from 'react';
import { Search, CheckSquare, FileText, Trash2, X } from 'lucide-react';

interface PDTListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export const PDTListModal: React.FC<PDTListModalProps> = ({ isOpen, onClose, title }) => {
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-[800px] h-[500px] bg-[#f0f0f0] border border-slate-400 shadow-2xl rounded-sm overflow-hidden">
        
        {/* Native-like Window Header */}
        <div className="flex items-center justify-between px-2 py-1.5 bg-gradient-to-b from-[#e4e6ea] to-[#d4d6db] border-b border-slate-400 select-none">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 bg-orange-400 rounded-sm border border-orange-600 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white"></div>
            </div>
            <span className="text-xs font-semibold text-slate-800">PDT Data</span>
          </div>
          <button onClick={onClose} className="hover:bg-red-500 hover:text-white text-slate-600 rounded px-1.5 py-0.5 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Inner Content Area */}
        <div className="flex flex-col flex-1 min-h-0 bg-[#f0f0f0]">
          
          {/* Title Bar */}
          <div className="bg-[#e2e8f0] px-3 py-1.5 border-b border-slate-300 font-bold text-xs text-slate-800">
            {title}
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Left Sidebar */}
            <div className="w-[250px] flex flex-col border-r border-slate-300 bg-white">
              <div className="p-1.5 border-b border-slate-300 bg-[#f0f0f0]">
                <select className="w-full px-1.5 py-0.5 text-xs border border-slate-300 bg-white">
                  <option>Saudi Arabia</option>
                </select>
              </div>
              
              <div className="flex-1 overflow-auto bg-white">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-[#f0f0f0] border-b border-slate-300">
                    <tr>
                      <th className="px-2 py-1 font-normal text-slate-700 border-r border-slate-300">PDT Name</th>
                      <th className="px-2 py-1 font-normal text-slate-700">PDTID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Empty rows space */}
                  </tbody>
                </table>
              </div>

              <div className="px-1.5 py-1 text-[10px] text-slate-500 bg-[#f0f0f0] flex items-center gap-1.5 border-t border-slate-300">
                 <button className="hover:text-slate-800">|&lt;&lt;</button>
                 <button className="hover:text-slate-800">&lt;&lt;</button>
                 <span className="mx-1">Record 0 of 0</span>
                 <button className="hover:text-slate-800">&gt;&gt;</button>
                 <button className="hover:text-slate-800">&gt;&gt;|</button>
              </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col bg-white">
              {/* Top Date Bar */}
              <div className="flex items-center gap-3 px-2 py-1.5 bg-[#f0f0f0] border-b border-slate-300 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-700">Date From</span>
                  <input 
                    type="date" 
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="px-1 py-0.5 border border-slate-300 bg-white w-28"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-700">To</span>
                  <input 
                    type="date" 
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="px-1 py-0.5 border border-slate-300 bg-white w-28"
                  />
                </div>
                <div className="flex items-center ml-2 bg-white border border-slate-300 shadow-sm h-[22px]">
                  <div className="flex items-center justify-center w-6 bg-white">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <input type="text" className="w-40 px-1 py-0 text-xs bg-transparent focus:outline-none h-full" />
                  <button className="flex items-center gap-1 px-3 h-full text-xs font-bold text-blue-700 bg-[#f0f0f0] border-l border-slate-300 hover:bg-[#e4e6ea]">
                    Show F7
                  </button>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-[#e2e8f0] border-b border-slate-300">
                <button className="p-0.5 border border-slate-300 bg-[#f0f0f0] hover:bg-slate-200 shadow-sm text-blue-600">
                  <CheckSquare className="w-4 h-4" />
                </button>
                <button className="p-0.5 border border-slate-300 bg-[#f0f0f0] hover:bg-slate-200 shadow-sm text-slate-600">
                  <FileText className="w-4 h-4" />
                </button>
                <button className="p-0.5 border border-slate-300 bg-[#f0f0f0] hover:bg-slate-200 shadow-sm text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
                
                {/* Remove Selected Button */}
                <button className="flex items-center gap-1.5 ml-2 px-2 py-0.5 text-xs text-red-600 bg-[#f0f0f0] border border-slate-300 hover:bg-slate-200 shadow-sm">
                  <div className="flex items-center justify-center w-4 h-4 bg-red-500 rounded-sm">
                    <X className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  Remove Selected From List F7
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 bg-white">
                {/* Empty state or table would go here */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
