import React, { useState } from 'react';
import { Card, Button, Input, Badge, Modal } from '@qatar-erp/ui';
import { Plus, Search, Building2, ShieldCheck } from 'lucide-react';

export const CompaniesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const companies = [
    { id: 'cmp-01', code: 'CMP-QTR-01', name: 'Qatar Retail Holding Parent W.L.L', nameAr: 'شركة قطر القابضة للتجزئة ذ.م.م', crNo: 'CR-104928', vatNo: 'QTR-998877', branches: 4, status: 'ACTIVE' },
    { id: 'cmp-02', code: 'CMP-QTR-02', name: 'Doha Superstores Subsidiary W.L.L', nameAr: 'شركة سوبرماركت الدوحة الفرعية ذ.م.م', crNo: 'CR-104929', vatNo: 'QTR-998878', branches: 2, status: 'ACTIVE' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies Management</h1>
          <p className="text-sm text-slate-500">Parent and subsidiary legal entities across Qatar.</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 font-bold">
          <Plus className="w-4 h-4" /> Add Company
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map((c) => (
          <Card key={c.id} className="p-5 flex flex-col justify-between gap-4 border-t-4 border-t-emerald-500">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-slate-500">{c.code}</span>
                <Badge variant="success">{c.status}</Badge>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{c.name}</h3>
              <p className="text-xs font-arabic text-slate-500 mt-1">{c.nameAr}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 mt-4 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg">
                <div>CR No: <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{c.crNo}</span></div>
                <div>VAT No: <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{c.vatNo}</span></div>
                <div className="col-span-2">Branches: <span className="font-bold text-emerald-600">{c.branches} Active Branches</span></div>
              </div>
            </div>
            <Button variant="outline" className="w-full text-xs">Edit Company Setup</Button>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Company Entity">
        <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
          <Input label="Company Name (English)" placeholder="e.g. Qatar Fresh Foods W.L.L" required />
          <Input label="Company Name (Arabic)" placeholder="اسم الشركة بالعربية" required />
          <Input label="Commercial Register (CR No.)" placeholder="CR-XXXXXX" required />
          <Input label="Qatar Tax Card (QTR / VAT No.)" placeholder="QTR-XXXXXX" required />
          <Button type="submit" variant="primary" className="w-full font-bold mt-2">Create Entity</Button>
        </form>
      </Modal>
    </div>
  );
};
