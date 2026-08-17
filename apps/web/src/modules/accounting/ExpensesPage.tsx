import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const ExpensesPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Expenses" 
      subtitle="Operating expenses" 
      entityName="Accounting Record" 
      items={[]} 
    />
  );
};

