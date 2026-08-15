import React, { useState } from 'react';
import {
  Key,
  Volume2,
  FileBarChart,
  Target,
  Plus,
  Search,
  Download,
  CheckCircle2,
  Clock,
  UserCheck,
  Megaphone,
  ChevronRight,
  Eye,
  Trash2,
  Edit2,
  RefreshCw,
  Sliders,
  ShieldCheck,
} from 'lucide-react';

export interface APIToken {
  id: string;
  code: string;
  name: string;
  serviceType: string;
  issueDate: string;
  expiryDate?: string;
  counterNo?: string;
  status: 'ACTIVE' | 'INACTIVE';
  tokenSecret?: string;
}

const DEFAULT_TOKENS: APIToken[] = [
  {
    id: '1',
    code: 'TKN-KEY',
    name: 'POS Hardware Integration Secret Token',
    serviceType: 'POS Hardware Kiosk',
    issueDate: '2026-08-10',
    expiryDate: '2027-08-10',
    counterNo: 'Counter 01',
    status: 'ACTIVE',
    tokenSecret: 'qatar_erp_live_sec_99182374182379',
  },
  {
    id: '2',
    code: 'TKN-002',
    name: 'Customer Queue Ticket Dispenser Token',
    serviceType: 'Queue Dispenser',
    issueDate: '2026-08-12',
    expiryDate: '2027-08-12',
    counterNo: 'Kiosk 01',
    status: 'ACTIVE',
    tokenSecret: 'qatar_erp_live_sec_88273641231212',
  },
  {
    id: '3',
    code: 'TKN-003',
    name: 'Thermal Printer Network Relay Key',
    serviceType: 'Network Hardware',
    issueDate: '2026-08-14',
    expiryDate: '2027-08-14',
    counterNo: 'Counter 02',
    status: 'ACTIVE',
    tokenSecret: 'qatar_erp_live_sec_55412399128374',
  },
];

export const TokenManagementPage: React.FC = () => {
  const [tokens, setTokens] = useState<APIToken[]>(DEFAULT_TOKENS);
  const [activeTab, setActiveTab] = useState<'TOKENS' | 'ANNOUNCEMENT' | 'REPORTS' | 'ACTIONS'>('TOKENS');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Queue Live State
  const [currentToken, setCurrentToken] = useState<number>(104);
  const [waitingQueueCount, setWaitingQueueCount] = useState<number>(5);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingToken, setViewingToken] = useState<APIToken | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<APIToken>>({
    code: '',
    name: '',
    serviceType: 'POS Hardware Kiosk',
    counterNo: 'Counter 01',
    status: 'ACTIVE',
  });

  const handleOpenAddModal = () => {
    setFormData({
      code: `TKN-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      serviceType: 'POS Hardware Kiosk',
      counterNo: 'Counter 01',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Token Name / Description is required');
      return;
    }

    const newToken: APIToken = {
      id: `tkn-${Date.now()}`,
      code: formData.code?.toUpperCase() || `TKN-${Date.now()}`,
      name: formData.name.trim(),
      serviceType: formData.serviceType || 'POS Hardware Kiosk',
      counterNo: formData.counterNo || 'Counter 01',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: formData.status || 'ACTIVE',
      tokenSecret: `qatar_erp_sec_${Math.random().toString(36).substring(2, 15)}`,
    };

    setTokens((prev) => [newToken, ...prev]);
    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    setTokens((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : t))
    );
  };

  const handleDeleteToken = (id: string) => {
    if (confirm('Are you sure you want to delete this API Token?')) {
      setTokens((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const filteredTokens = tokens.filter((t) => {
    const matchesSearch =
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.serviceType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = ['Reference Code', 'Description/Name', 'Service Type', 'Counter', 'Issue Date', 'Expiry Date', 'Status'];
    const rows = filteredTokens.map((t) => [
      t.code,
      `"${t.name}"`,
      t.serviceType,
      t.counterNo || 'N/A',
      t.issueDate,
      t.expiryDate || 'N/A',
      t.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Qatar_ERP_Tokens_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* MODULE HEADER & QUICK SUB-NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Key className="w-6 h-6 text-emerald-600" />
            <span>Token Management & Customer Queue System</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage POS API integration tokens, hardware kiosk secrets, LED announcement audio, and customer queue calling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-200"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Report</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add API Token</span>
          </button>
        </div>
      </div>

      {/* DART POS FOUR MODULE TABS RIBBON STRIP */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('TOKENS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'TOKENS' ? 'bg-slate-900 text-emerald-400 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Manage Tokens</span>
        </button>

        <button
          onClick={() => setActiveTab('ACTIONS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'ACTIONS' ? 'bg-slate-900 text-emerald-400 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Token Actions (Queue Call)</span>
        </button>

        <button
          onClick={() => setActiveTab('ANNOUNCEMENT')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'ANNOUNCEMENT' ? 'bg-slate-900 text-emerald-400 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Announcement Config</span>
        </button>

        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'REPORTS' ? 'bg-slate-900 text-emerald-400 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileBarChart className="w-4 h-4" />
          <span>Token Reports</span>
        </button>
      </div>

      {/* METRICS & KIOSK STATUS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Now Serving Token</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1 font-mono">TKN-{currentToken}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Megaphone className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Waiting Queue</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{waitingQueueCount} Customers</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Active API Tokens</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{tokens.filter((t) => t.status === 'ACTIVE').length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Key className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Avg Wait Time</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">4.2 Mins</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* TAB CONTENT: MANAGE TOKENS */}
      {activeTab === 'TOKENS' && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS TOOLBAR */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search api token code, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-bold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* MAIN TOKENS TABLE */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Reference Code</th>
                    <th className="py-3 px-4">Description / Name</th>
                    <th className="py-3 px-4">Service Type / Counter</th>
                    <th className="py-3 px-4">Issued Date</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {filteredTokens.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        <Key className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                        <p className="font-bold text-sm">No API Tokens Found</p>
                        <p className="text-xs text-slate-400 mt-1">Click "Add API Token" to generate a hardware key.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTokens.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 bg-slate-900 text-emerald-400 font-mono font-bold text-xs rounded border border-slate-800">
                            {t.code}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{t.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Secret: {t.tokenSecret?.substring(0, 18)}...</p>
                        </td>

                        <td className="py-3 px-4 text-slate-700">
                          <p className="font-semibold">{t.serviceType}</p>
                          <span className="text-[10px] text-slate-500">{t.counterNo}</span>
                        </td>

                        <td className="py-3 px-4 text-slate-500 font-mono">{t.issueDate}</td>

                        <td className="py-3 px-4 text-slate-500 font-mono">{t.expiryDate || 'Never'}</td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStatus(t.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              t.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            <span>{t.status}</span>
                          </button>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setViewingToken(t)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded"
                              title="View Token Secret & Details"
                            >
                              <Eye className="w-4 h-4 text-slate-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteToken(t.id)}
                              className="p-1.5 hover:bg-rose-50 text-rose-600 rounded"
                              title="Delete Token"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TOKEN ACTIONS (QUEUE CALLING) */}
      {activeTab === 'ACTIONS' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Counter 01 Queue Calling Console</span>
              </h2>
              <p className="text-xs text-slate-500">Call next customer, skip token, or broadcast audio announcement.</p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              Kiosk Online - Audio Connected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <button
              onClick={() => {
                setCurrentToken((prev) => prev + 1);
                setWaitingQueueCount((prev) => Math.max(0, prev - 1));
                alert(`📢 Audio Broadcast: "Now Serving Token Number TKN-${currentToken + 1} at Counter 01"`);
              }}
              className="p-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex flex-col items-center justify-center gap-2"
            >
              <Megaphone className="w-8 h-8" />
              <span className="text-base uppercase tracking-wider">Call Next Token</span>
              <span className="text-xs font-mono text-emerald-200">Trigger TKN-{currentToken + 1}</span>
            </button>

            <button
              onClick={() => alert(`📢 Repeat Call: "Calling again Token TKN-${currentToken} to Counter 01"`)}
              className="p-6 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex flex-col items-center justify-center gap-2"
            >
              <RefreshCw className="w-8 h-8" />
              <span className="text-base uppercase tracking-wider">Recall Token</span>
              <span className="text-xs text-sky-200">Re-announce current</span>
            </button>

            <button
              onClick={() => {
                setCurrentToken((prev) => prev + 1);
                alert(`Token TKN-${currentToken} skipped!`);
              }}
              className="p-6 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex flex-col items-center justify-center gap-2"
            >
              <Clock className="w-8 h-8" />
              <span className="text-base uppercase tracking-wider">Skip Token</span>
              <span className="text-xs text-amber-200">Mark No-Show</span>
            </button>

            <button
              onClick={() => alert('Customer service completed!')}
              className="p-6 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex flex-col items-center justify-center gap-2 border border-slate-800"
            >
              <CheckCircle2 className="w-8 h-8" />
              <span className="text-base uppercase tracking-wider">Complete Ticket</span>
              <span className="text-xs text-slate-400">Close session</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ANNOUNCEMENT CONFIG */}
      {activeTab === 'ANNOUNCEMENT' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>Voice & LED Display Announcement Rules</span>
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">English Voice Broadcast Template</label>
                <input
                  type="text"
                  defaultValue="Now serving token number {TOKEN} at Counter {COUNTER}"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Arabic Voice Broadcast Template</label>
                <input
                  type="text"
                  defaultValue="الرجاء التوجه إلى الشباك رقم {COUNTER} للرمز رقم {TOKEN}"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => alert('Announcement configuration template saved successfully!')}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg"
              >
                Save Announcement Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TOKEN REPORTS */}
      {activeTab === 'REPORTS' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileBarChart className="w-4 h-4 text-emerald-600" />
            <span>Daily Queue Analytics & Wait Time Audit</span>
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Total Tickets Issued</span>
              <strong className="text-xl font-bold font-mono text-slate-900">142 Tokens</strong>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Total Served</span>
              <strong className="text-xl font-bold font-mono text-emerald-600">137 Tokens</strong>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px]">No-Show / Skipped</span>
              <strong className="text-xl font-bold font-mono text-amber-600">5 Tokens</strong>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TO ADD API TOKEN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <span>Create Hardware Integration Token</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveToken} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reference Code</label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Counter 03 Display Kiosk Secret"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Type</label>
                  <select
                    value={formData.serviceType || 'POS Hardware Kiosk'}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="POS Hardware Kiosk">POS Hardware Kiosk</option>
                    <option value="Queue Dispenser">Queue Dispenser</option>
                    <option value="Network Hardware">Network Hardware</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Counter No</label>
                  <input
                    type="text"
                    value={formData.counterNo || 'Counter 01'}
                    onChange={(e) => setFormData({ ...formData, counterNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm">
                  Generate Token Secret
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SECRET MODAL */}
      {viewingToken && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">{viewingToken.code} Token Details</h3>
            </div>

            <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p>
                <span className="text-slate-400 block text-[10px]">Name:</span> <strong>{viewingToken.name}</strong>
              </p>
              <p>
                <span className="text-slate-400 block text-[10px]">API Secret Key (Keep Confidential):</span>
                <code className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 block font-mono text-[11px] mt-0.5">
                  {viewingToken.tokenSecret}
                </code>
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setViewingToken(null)} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenManagementPage;
