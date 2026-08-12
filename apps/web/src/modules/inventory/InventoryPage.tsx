import React from 'react';
import { Card, Button, Badge } from '@qatar-erp/ui';
import { formatQAR } from '@qatar-erp/utils';
import { Box, Plus } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const stockItems = [
    { id: 'inv-1', sku: 'MILK-ALM-1L', name: 'Almarai Fresh Milk 1L', warehouse: 'Doha Central Depot', onHand: 142, reserved: 10, available: 132, status: 'IN_STOCK' },
    { id: 'inv-2', sku: 'RICE-KAH-5KG', name: 'Khabari Rice 5kg', warehouse: 'Al Rayyan Warehouse', onHand: 58, reserved: 5, available: 53, status: 'IN_STOCK' },
    { id: 'inv-3', sku: 'WAT-RAY-500ML', name: 'Rayyan Water 500ml Pack', warehouse: 'Doha Central Depot', onHand: 210, reserved: 0, available: 210, status: 'IN_STOCK' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Stock Locator</h1>
          <p className="text-sm text-slate-500">Real-time warehouse stock balances, reserved, and available quantities.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2 font-bold"><Plus className="w-4 h-4" /> Stock Take Count</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <tr>
              <th className="p-3">SKU</th>
              <th className="p-3">Product Description</th>
              <th className="p-3">Warehouse Location</th>
              <th className="p-3 text-right">On Hand</th>
              <th className="p-3 text-right">Reserved</th>
              <th className="p-3 text-right">Available</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {stockItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3 font-mono font-bold text-xs">{item.sku}</td>
                <td className="p-3 font-medium">{item.name}</td>
                <td className="p-3 text-xs text-slate-500">{item.warehouse}</td>
                <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">{item.onHand}</td>
                <td className="p-3 text-right text-amber-600 font-semibold">{item.reserved}</td>
                <td className="p-3 text-right font-bold text-emerald-600">{item.available}</td>
                <td className="p-3 text-center"><Badge variant="success">{item.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
