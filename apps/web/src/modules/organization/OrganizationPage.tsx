import React from 'react';
import { Card, Button, Input } from '@qatar-erp/ui';

export const OrganizationPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organization Profile</h1>
        <p className="text-sm text-slate-500">Legal entity registration, Qatar Tax Card (QTR / VAT), and global settings.</p>
      </div>

      <Card className="p-6 max-w-2xl flex flex-col gap-4">
        <Input label="Organization Name (English)" defaultValue="Qatar Retail Enterprise Group W.L.L" />
        <Input label="Organization Name (Arabic)" defaultValue="مجموعة شركات التجزئة القطرية ذ.م.م" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Qatar Tax Card (QTR No.)" defaultValue="QTR-9988776655" />
          <Input label="Commercial Register (CR No.)" defaultValue="CR-104928" />
        </div>
        <Input label="Headquarters Address" defaultValue="Building 42, West Bay Commercial Tower, Doha, Qatar" />
        <Button variant="primary" className="w-fit self-end font-bold">Save Organization Details</Button>
      </Card>
    </div>
  );
};
