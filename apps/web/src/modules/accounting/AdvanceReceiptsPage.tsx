import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const AdvanceReceiptsPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Adv. Receipts" 
      subtitle="Advance payments received" 
      entityName="Accounting Record" 
      items={[]} 
    />
  );
};

