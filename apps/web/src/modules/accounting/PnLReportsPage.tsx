import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const PnLReportsPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="P&L Reports" 
      subtitle="Profit and loss reporting" 
      entityName="Accounting Record" 
      items={[]} 
    />
  );
};

