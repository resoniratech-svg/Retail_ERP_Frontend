import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const CreditMemoPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Credit Memo" 
      subtitle="Credit memorandums" 
      entityName="Accounting Record" 
      items={[]} 
    />
  );
};

