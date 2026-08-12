import React from 'react';
import { Card, Button, Badge } from '@qatar-erp/ui';
import { Plus, Tag } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const categories = [
    { id: 'cat-1', code: 'CAT-DAIRY', name: 'Dairy & Eggs', nameAr: 'الألبان والبيض', items: 42 },
    { id: 'cat-2', code: 'CAT-BEV', name: 'Beverages', nameAr: 'المشروبات', items: 128 },
    { id: 'cat-3', code: 'CAT-RICE', name: 'Rice & Grains', nameAr: 'الأرز والحبوب', items: 35 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Categories</h1>
          <p className="text-sm text-slate-500">Hierarchy taxonomy for inventory grouping.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2 font-bold"><Plus className="w-4 h-4" /> Add Category</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-semibold">
            <tr>
              <th className="p-3">Category Code</th>
              <th className="p-3">English Name</th>
              <th className="p-3">Arabic Name</th>
              <th className="p-3 text-right">Items Count</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3 font-mono text-xs font-bold">{c.code}</td>
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 font-arabic">{c.nameAr}</td>
                <td className="p-3 text-right font-bold text-emerald-600">{c.items} SKU</td>
                <td className="p-3 text-center">
                  <Button variant="outline" className="py-1 px-2 text-xs">Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
