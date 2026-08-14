import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const SalesInvoicesPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Sales Invoices" 
      subtitle="Issued sales invoices" 
      entityName="Invoice" 
      items={[{ id: '1', code: 'INV-991', name: 'Retail Order - Walk-in POS', amount: 245.50, status: 'COMPLETED' }]} 
    />
  );
};
