import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const OtherReceiptsPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Other Receipts" 
      subtitle="Miscellaneous receipts" 
      entityName="Accounting Record" 
      items={[]} 
    />
  );
};

