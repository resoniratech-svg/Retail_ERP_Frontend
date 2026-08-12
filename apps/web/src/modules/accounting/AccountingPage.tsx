import React from 'react';
import { Card, Button, Badge } from '@qatar-erp/ui';
import { formatQAR } from '@qatar-erp/utils';
import { Plus, BookOpen } from 'lucide-react';

export const AccountingPage: React.FC = () => {
  const coa = [
    { code: '1000', name: 'Assets', type: 'ASSET', balance: 4500000 },
    { code: '1100', name: 'Petty Cash - Doha Main', type: 'ASSET', balance: 25000 },
    { code: '1200', name: 'Accounts Receivable', type: 'ASSET', balance: 145000 },
    { code: '2000', name: 'Liabilities', type: 'LIABILITY', balance: 120000 },
    { code: '4000', name: 'Retail Sales Revenue', type: 'REVENUE', balance: 1850000 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chart of Accounts & General Ledger</h1>
          <p className="text-sm text-slate-500">Financial ledgers, Journal entries, and P&L accounting reports.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2 font-bold"><Plus className="w-4 h-4" /> New Journal Entry</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-[11px] font-semibold">
            <tr>
              <th className="p-3">Account Code</th>
              <th className="p-3">Account Name</th>
              <th className="p-3">Type</th>
              <th className="p-3 text-right">Current Balance (QAR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {coa.map((a) => (
              <tr key={a.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3 font-mono font-bold">{a.code}</td>
                <td className="p-3 font-medium">{a.name}</td>
                <td className="p-3"><Badge variant="info">{a.type}</Badge></td>
                <td className="p-3 text-right font-bold text-emerald-600">{formatQAR(a.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
