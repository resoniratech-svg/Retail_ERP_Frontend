import React from 'react';
import { MOCK_CUSTOMERS } from '@qatar-erp/api';
import { formatQAR } from '@qatar-erp/utils';
import { Card, Button, Badge } from '@qatar-erp/ui';
import { Plus, Phone, Mail } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Directory (CRM)</h1>
          <p className="text-sm text-slate-500">Retail & B2B Customer accounts, credit limits, and loyalty points.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2 font-bold"><Plus className="w-4 h-4" /> New Customer</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <tr>
              <th className="p-3">Customer Code</th>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Type</th>
              <th className="p-3 text-right">Credit Limit</th>
              <th className="p-3 text-right">Outstanding</th>
              <th className="p-3 text-center">Loyalty Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {MOCK_CUSTOMERS.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3 font-mono text-xs font-bold">{c.code}</td>
                <td className="p-3 font-medium">
                  <p>{c.name}</p>
                  {c.nameAr && <p className="text-xs text-slate-500 font-arabic">{c.nameAr}</p>}
                </td>
                <td className="p-3 text-xs">{c.phone}</td>
                <td className="p-3"><Badge variant="info">{c.customerType}</Badge></td>
                <td className="p-3 text-right font-semibold">{formatQAR(c.creditLimit)}</td>
                <td className="p-3 text-right font-bold text-rose-600">{formatQAR(c.outstandingBalance)}</td>
                <td className="p-3 text-center"><Badge variant="warning">{c.loyaltyTier}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
