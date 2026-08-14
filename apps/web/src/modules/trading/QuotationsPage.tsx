import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const QuotationsPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Trading & B2B" 
      subtitle="Wholesale Quotations" 
      entityName="Quotation" 
      items={[{ id: '1', code: 'QT-2026-44', name: 'B2B Offer - Doha Hotel Group', amount: 120000.00, status: 'CONFIRMED' }]} 
    />
  );
};
