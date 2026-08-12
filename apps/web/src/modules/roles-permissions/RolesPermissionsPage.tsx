import React, { useState } from 'react';
import { Card, Button, Badge } from '@qatar-erp/ui';
import { ShieldCheck, Plus, Check } from 'lucide-react';

export const RolesPermissionsPage: React.FC = () => {
  const roles = [
    { id: 'r-1', name: 'Super Admin', permissionsCount: 35, isSystem: true },
    { id: 'r-2', name: 'Branch Manager', permissionsCount: 22, isSystem: false },
    { id: 'r-3', name: 'POS Cashier', permissionsCount: 8, isSystem: false },
    { id: 'r-4', name: 'Accountant', permissionsCount: 14, isSystem: false },
  ];

  const modulesMatrix = [
    { module: 'Products Catalog', view: true, create: true, edit: true, delete: true },
    { module: 'Sales Orders & Invoices', view: true, create: true, edit: true, delete: false },
    { module: 'POS Terminal & Cart', view: true, create: true, edit: true, delete: false },
    { module: 'Accounting Ledgers', view: true, create: false, edit: false, delete: false },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles & Permissions Matrix</h1>
          <p className="text-sm text-slate-500">Configure action-based authorization rules (`product:create`, `sales:approve`).</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2 font-bold"><Plus className="w-4 h-4" /> Create Role</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {roles.map((r) => (
          <Card key={r.id} className="p-4 border-l-4 border-l-purple-500 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{r.name}</span>
                {r.isSystem && <Badge variant="neutral">System</Badge>}
              </div>
              <p className="text-xs text-slate-500">{r.permissionsCount} Action Permissions Granted</p>
            </div>
            <Button variant="outline" className="w-full text-xs py-1">Edit Matrix</Button>
          </Card>
        ))}
      </div>

      {/* Permissions Matrix Grid */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-slate-800 text-white font-bold text-sm flex items-center justify-between">
          <span>Active Matrix: POS Cashier Role</span>
          <Button variant="primary" className="text-xs py-1">Save Configuration</Button>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <tr>
              <th className="p-3">Module Name</th>
              <th className="p-3 text-center">View</th>
              <th className="p-3 text-center">Create</th>
              <th className="p-3 text-center">Edit</th>
              <th className="p-3 text-center">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {modulesMatrix.map((m, idx) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3 font-medium">{m.module}</td>
                <td className="p-3 text-center"><input type="checkbox" defaultChecked={m.view} className="w-4 h-4 text-emerald-600 rounded" /></td>
                <td className="p-3 text-center"><input type="checkbox" defaultChecked={m.create} className="w-4 h-4 text-emerald-600 rounded" /></td>
                <td className="p-3 text-center"><input type="checkbox" defaultChecked={m.edit} className="w-4 h-4 text-emerald-600 rounded" /></td>
                <td className="p-3 text-center"><input type="checkbox" defaultChecked={m.delete} className="w-4 h-4 text-emerald-600 rounded" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
