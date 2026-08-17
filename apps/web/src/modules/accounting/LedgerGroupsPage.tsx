import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const LedgerGroupsPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Ledger Groups" 
      subtitle="Manage ledger groups" 
      entityName="Accounting Record" 
      items={[]} 
    />
  );
};

