import React from 'react';
import { Card, Button, Badge } from '@qatar-erp/ui';
import { Plus, Warehouse as WhIcon } from 'lucide-react';

export const WarehousesPage: React.FC = () => {
  const warehouses = [
    { id: 'wh-1', code: 'WH-DOH-01', name: 'Doha Central Logistics Depot', branch: 'Doha Main Branch', manager: 'Salim Al-Hajri', capacity: 25000, status: 'ACTIVE' },
    { id: 'wh-2', code: 'WH-RAY-02', name: 'Al Rayyan Mall Storage', branch: 'Al Rayyan Mall Branch', manager: 'Nasser Al-Kaabi', capacity: 10000, status: 'ACTIVE' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Warehouses & Storage Depots</h1>
          <p className="text-sm text-slate-500">Spatial warehouse layout, capacity, and bin assignments.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2 font-bold"><Plus className="w-4 h-4" /> Add Warehouse</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {warehouses.map((w) => (
          <Card key={w.id} className="p-5 flex flex-col justify-between gap-4 border-t-4 border-t-sky-500">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-slate-500">{w.code}</span>
                <Badge variant="success">{w.status}</Badge>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{w.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Branch: {w.branch}</p>
              <p className="text-xs text-slate-500">Manager: <span className="font-medium text-slate-800 dark:text-slate-200">{w.manager}</span></p>
              <p className="text-xs text-slate-500 mt-2 bg-slate-100 dark:bg-slate-800 p-2 rounded">
                Capacity: <span className="font-bold text-emerald-600">{w.capacity.toLocaleString()} Sq Ft</span>
              </p>
            </div>
            <Button variant="outline" className="w-full text-xs">Manage Aisles & Bins</Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
