import React from 'react';
import { Card, Button, Badge } from '@qatar-erp/ui';
import { Plus } from 'lucide-react';

export const BrandsPage: React.FC = () => {
  const brands = [
    { id: 'b-1', code: 'BRD-ALM', name: 'Almarai', nameAr: 'المراعي', productsCount: 42 },
    { id: 'b-2', code: 'BRD-RAY', name: 'Rayyan Water', nameAr: 'مياه الريان', productsCount: 18 },
    { id: 'b-3', code: 'BRD-KAH', name: 'Khabari Foods', nameAr: 'أغذية خاري', productsCount: 12 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brands Registry</h1>
          <p className="text-sm text-slate-500">Manufacturer and brand registry management.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2 font-bold"><Plus className="w-4 h-4" /> Add Brand</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {brands.map((b) => (
          <Card key={b.id} className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-slate-400 block">{b.code}</span>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{b.name}</h3>
              <p className="text-xs font-arabic text-slate-500">{b.nameAr}</p>
            </div>
            <Badge variant="info">{b.productsCount} Products</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
};
