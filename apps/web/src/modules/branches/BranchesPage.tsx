import React from 'react';
import { Card, Button, Badge } from '@qatar-erp/ui';
import { Plus, MapPin, Phone } from 'lucide-react';

export const BranchesPage: React.FC = () => {
  const branches = [
    { id: 'br-01', code: 'BR-DOH-01', name: 'Doha Main Superstore', city: 'Doha', zone: 'West Bay', phone: '+974 4411 1100', isMain: true },
    { id: 'br-02', code: 'BR-RAY-02', name: 'Al Rayyan Mall Branch', city: 'Al Rayyan', zone: 'Zone 52', phone: '+974 4422 2200', isMain: false },
    { id: 'br-03', code: 'BR-WAK-03', name: 'Al Wakrah Retail Hub', city: 'Al Wakrah', zone: 'Zone 90', phone: '+974 4433 3300', isMain: false },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Branches Management</h1>
          <p className="text-sm text-slate-500">Control multi-branch locations across Qatar.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2 font-bold">
          <Plus className="w-4 h-4" /> Add Branch
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branches.map((b) => (
          <Card key={b.id} className="p-5 flex flex-col justify-between gap-4 border-t-4 border-t-emerald-500">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-slate-500">{b.code}</span>
                {b.isMain && <Badge variant="success">Headquarters</Badge>}
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{b.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.city}, {b.zone}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {b.phone}
              </p>
            </div>
            <Button variant="outline" className="w-full text-xs">Manage Branch Settings</Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
