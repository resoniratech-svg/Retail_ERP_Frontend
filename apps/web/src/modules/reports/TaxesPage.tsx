import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const TaxesPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Reports Center" 
      subtitle="Qatar VAT & Sales Reports" 
      entityName="Report" 
      items={[{ id: '1', code: 'REP-VAT', name: 'Qatar VAT Tax Summary Q3 2026', status: 'READY' }]} 
    />
  );
};
