import React, { useState } from 'react';
import { Card, Button, Badge } from '@qatar-erp/ui';
import { Plus, Search, Download, X } from 'lucide-react';
import { formatQAR } from '@qatar-erp/utils';

export interface GenericModuleProps {
  title: string;
  subtitle: string;
  entityName: string;
  items: Array<{
    id: string;
    code: string;
    name: string;
    status: string;
    amount?: number;
    date?: string;
  }>;
}

export const GenericModulePage: React.FC<GenericModuleProps> = ({ title, subtitle, entityName, items: initialItems }) => {
  const [items, setItems] = useState(initialItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: `${entityName.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    amount: '1500.00',
    status: 'ACTIVE',
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      id: `item-${Date.now()}`,
      code: formData.code,
      name: formData.name,
      amount: parseFloat(formData.amount) || 0,
      status: formData.status,
      date: new Date().toISOString().split('T')[0],
    };
    setItems((prev) => [newItem, ...prev]);
    setIsAddModalOpen(false);
  };

  const filtered = items.filter(
    (i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setFormData({
              code: `${entityName.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
              name: '',
              amount: '1500.00',
              status: 'ACTIVE',
            });
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 font-bold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add {entityName}
        </Button>
      </div>

      <Card className="p-3 flex items-center justify-between gap-4 border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${entityName.toLowerCase()} code, description...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-1.5 text-xs py-1.5">
          <Download className="w-4 h-4" /> Export Report
        </Button>
      </Card>

      <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-[11px] font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3">Reference Code</th>
              <th className="p-3">Description / Name</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-right">Value (QAR)</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3 font-mono font-bold text-xs">{item.code}</td>
                <td className="p-3 font-medium">{item.name}</td>
                <td className="p-3 text-xs text-slate-500">{item.date || '2026-08-10'}</td>
                <td className="p-3 text-right font-bold text-emerald-600">
                  {item.amount !== undefined ? formatQAR(item.amount) : '-'}
                </td>
                <td className="p-3 text-center">
                  <Badge variant="success">{item.status}</Badge>
                </td>
                <td className="p-3 text-center">
                  <Button variant="outline" className="py-1 px-2.5 text-xs">View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden font-sans">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Add New {entityName}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Description / Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={`Enter ${entityName.toLowerCase()} description`}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Value (QAR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
              <div className="flex items-center justify-end gap-3 mt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Save {entityName}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
