import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const BankReconciliationPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Bank Reconciliation" 
      subtitle="Reconcile bank accounts" 
      entityName="Accounting Record" 
      items={[]} 
    />
  );
};

