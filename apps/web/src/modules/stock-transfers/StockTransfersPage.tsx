import React from 'react';
import { Card, Button, Badge } from '@qatar-erp/ui';
import { Plus, ArrowRight } from 'lucide-react';

export const StockTransfersPage: React.FC = () => {
  const transfers = [
    { id: 'trf-1', transferNo: 'TRF-2026-101', from: 'Doha Central Depot', to: 'Al Rayyan Mall Storage', requester: 'Nasser Al-Kaabi', itemsCount: 15, status: 'DISPATCHED', date: '2026-08-11' },
    { id: 'trf-2', transferNo: 'TRF-2026-102', from: 'Doha Central Depot', to: 'Al Wakrah Storage', requester: 'Salim Al-Hajri', itemsCount: 40, status: 'RECEIVED', date: '2026-08-10' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inter-Warehouse Stock Transfers</h1>
          <p className="text-sm text-slate-500">Request, approve, dispatch, and receive stock transfers.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2 font-bold"><Plus className="w-4 h-4" /> New Transfer Request</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <tr>
              <th className="p-3">Transfer #</th>
              <th className="p-3">Source Warehouse</th>
              <th className="p-3">Destination Warehouse</th>
              <th className="p-3">Requested By</th>
              <th className="p-3 text-right">SKU Count</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {transfers.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3 font-mono font-bold text-xs">{t.transferNo}</td>
                <td className="p-3 font-medium">{t.from}</td>
                <td className="p-3 font-medium">{t.to}</td>
                <td className="p-3 text-xs">{t.requester}</td>
                <td className="p-3 text-right font-bold">{t.itemsCount} SKU</td>
                <td className="p-3 text-center"><Badge variant={t.status === 'RECEIVED' ? 'success' : 'warning'}>{t.status}</Badge></td>
                <td className="p-3 text-center"><Button variant="outline" className="py-1 px-2.5 text-xs">View Details</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
