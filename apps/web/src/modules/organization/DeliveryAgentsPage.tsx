import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, RefreshCw, Printer, Check } from 'lucide-react';

interface DeliveryAgentRecord {
  id: string;
  agentName: string;
  commissionPerc: string;
  commissionAmount: string;
}

export const DeliveryAgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<DeliveryAgentRecord[]>([
    { id: '1', agentName: 'Kassim Express Driver', commissionPerc: '5.00 %', commissionAmount: '12.50 QAR' },
    { id: '2', agentName: 'Talabat Fleet Agent', commissionPerc: '7.50 %', commissionAmount: '24.00 QAR' },
    { id: '3', agentName: 'Snoonu Logistics Rider', commissionPerc: '6.00 %', commissionAmount: '18.75 QAR' },
  ]);

  const [searchText, setSearchText] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>('1');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    agentName: '',
    commissionPerc: '5.00',
    commissionAmount: '0.00',
  });

  const filteredAgents = agents.filter((a) => {
    const query = searchText.toLowerCase().trim();
    if (!query) return true;
    return (
      a.agentName.toLowerCase().includes(query) ||
      a.commissionPerc.toLowerCase().includes(query)
    );
  });

  const handleClear = () => {
    setSearchText('');
  };

  const handleAddAgent = () => {
    if (!formData.agentName.trim()) {
      alert('Please enter Agent Name');
      return;
    }
    const newAgent: DeliveryAgentRecord = {
      id: Date.now().toString(),
      agentName: formData.agentName,
      commissionPerc: `${formData.commissionPerc} %`,
      commissionAmount: `${formData.commissionAmount} QAR`,
    };
    setAgents([newAgent, ...agents]);
    setIsAddModalOpen(false);
    setFormData({ agentName: '', commissionPerc: '5.00', commissionAmount: '0.00' });
  };

  const handleDeleteAgent = () => {
    if (!selectedAgentId) {
      alert('Please select a delivery agent to delete.');
      return;
    }
    setAgents(agents.filter((a) => a.id !== selectedAgentId));
    setSelectedAgentId(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-100 font-sans text-xs select-none">
      {/* 1. TOP TITLE HEADER */}
      <div className="bg-slate-200 border-b border-slate-300 px-3 py-1.5 flex items-center justify-between shadow-xs">
        <h1 className="text-sm font-bold text-slate-800 tracking-tight">DeliveryAgents - DART POS</h1>
        <span className="text-[11px] text-slate-500 font-mono">Total Agents: {filteredAgents.length}</span>
      </div>

      {/* 2. INNER CENTERED TITLE BAR (Matching Target Image 1) */}
      <div className="bg-slate-300 py-1 border-b border-slate-400 text-center font-bold text-slate-800 text-xs shadow-inner">
        Delivery Agents
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
          onClick={() => alert(`🔍 Searching Delivery Agents for "${searchText}"`)}
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
                <th className="p-2 border-r border-slate-300 w-80">Agent Name</th>
                <th className="p-2 border-r border-slate-300 w-64">Commission Perc</th>
                <th className="p-2 border-r border-slate-300">Commission Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-slate-400 italic">
                    No Delivery Agent records found. Click ➕ (Ctrl+A) to register a delivery driver.
                  </td>
                </tr>
              ) : (
                filteredAgents.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setSelectedAgentId(a.id)}
                    className={`cursor-pointer hover:bg-sky-50 ${selectedAgentId === a.id ? 'bg-sky-100 font-bold text-slate-900' : 'text-slate-800'}`}
                  >
                    <td className="p-2 border-r border-slate-200 font-bold text-slate-900">{a.agentName}</td>
                    <td className="p-2 border-r border-slate-200 font-mono text-slate-700">{a.commissionPerc}</td>
                    <td className="p-2 border-r border-slate-200 font-mono text-slate-700">{a.commissionAmount}</td>
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
            title="New Agent (Ctrl+A)"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">A</span>
          </button>

          <button
            onClick={() => {
              if (!selectedAgentId) alert('Please select an agent to edit.');
              else alert('✏️ Edit Agent modal opened');
            }}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-amber-700 shadow-xs relative group"
            title="Edit Agent (Ctrl+E)"
          >
            <Edit className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">E</span>
          </button>

          <button
            onClick={handleDeleteAgent}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-rose-700 shadow-xs relative group"
            title="Delete Agent (Ctrl+D)"
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
            onClick={() => alert('🖨️ Delivery Agents Report Preview (Ctrl+P)')}
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
          <span className="font-bold text-slate-800 px-2">Delivery Agent {filteredAgents.length === 0 ? '0 of 0' : `1 of ${filteredAgents.length}`}</span>
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">►</button>
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">►|</button>
        </div>
        <div>Status: Ready | Server: Connected</div>
      </div>

      {/* 6. ADD AGENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-200 rounded-xl shadow-2xl border border-slate-400 w-full max-w-md overflow-hidden font-sans">
            <div className="bg-slate-300 text-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-400">
              <h2 className="text-xs font-bold">New Delivery Agent</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-600 hover:text-slate-900 font-bold">✕</button>
            </div>
            <div className="p-4 space-y-3 bg-slate-100 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Agent Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kassim Express Driver"
                  value={formData.agentName}
                  onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded font-bold bg-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Commission Percentage (%)</label>
                <input
                  type="text"
                  placeholder="e.g. 5.00"
                  value={formData.commissionPerc}
                  onChange={(e) => setFormData({ ...formData, commissionPerc: e.target.value })}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded font-mono bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Fixed Commission Amount (QAR)</label>
                <input
                  type="text"
                  placeholder="e.g. 10.00"
                  value={formData.commissionAmount}
                  onChange={(e) => setFormData({ ...formData, commissionAmount: e.target.value })}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded font-mono bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-300">
                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-1.5 bg-slate-300 hover:bg-slate-400/80 text-slate-800 font-bold border border-slate-400 rounded">
                  Cancel
                </button>
                <button onClick={handleAddAgent} className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Agent</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryAgentsPage;
