import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const OtherPurchasesPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Other Purchases" 
      subtitle="Miscellaneous purchases" 
      entityName="Accounting Record" 
      items={[]} 
    />
  );
};

