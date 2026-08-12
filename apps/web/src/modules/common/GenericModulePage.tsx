import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '@qatar-erp/ui';
import { Plus, Search, Filter, Download } from 'lucide-react';
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

export const GenericModulePage: React.FC<GenericModuleProps> = ({ title, subtitle, entityName, items }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = items.filter(
    (i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2 font-bold">
          <Plus className="w-4 h-4" /> Add {entityName}
        </Button>
      </div>

      <Card className="p-3 flex items-center justify-between gap-4">
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

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-[11px] font-semibold text-slate-700 dark:text-slate-300">
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
    </div>
  );
};
