import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const LedgersPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Ledgers" 
      subtitle="Financial ledgers" 
      entityName="Accounting Record" 
      items={[]} 
    />
  );
};

