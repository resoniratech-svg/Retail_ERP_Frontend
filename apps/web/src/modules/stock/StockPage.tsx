import React from 'react';
import { Card, Button, Badge } from '@qatar-erp/ui';
import { AlertTriangle, TrendingDown } from 'lucide-react';

export const StockPage: React.FC = () => {
  const alerts = [
    { id: 'stk-1', sku: 'MILK-ALM-1L', name: 'Almarai Fresh Milk 1L', minLevel: 20, current: 142, status: 'NORMAL' },
    { id: 'stk-2', sku: 'RICE-KAH-5KG', name: 'Khabari Basmati Rice 5kg', minLevel: 10, current: 8, status: 'LOW_STOCK' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stock Thresholds & Reorder Alerts</h1>
        <p className="text-sm text-slate-500">Monitor minimum stock levels and automate reorder points.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((a) => (
          <Card key={a.id} className={`p-4 border-l-4 ${a.status === 'LOW_STOCK' ? 'border-l-rose-500' : 'border-l-emerald-500'}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400">{a.sku}</span>
                <h3 className="font-bold text-base">{a.name}</h3>
                <p className="text-xs text-slate-500 mt-1">Min Level: {a.minLevel} | Current: <span className="font-bold text-slate-900 dark:text-slate-100">{a.current}</span></p>
              </div>
              <Badge variant={a.status === 'LOW_STOCK' ? 'danger' : 'success'}>{a.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
