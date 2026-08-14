import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const SalesOrdersPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Sales Orders" 
      subtitle="Sales invoices" 
      entityName="Sales Order" 
      items={[{ id: '1', code: 'SO-991', name: 'Retail Order - Walk-in POS', amount: 245.50, status: 'COMPLETED' }]} 
    />
  );
};
