import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const DeferredExpensesPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Deferred Exp." 
      subtitle="Deferred expenses tracking" 
      entityName="Accounting Record" 
      items={[]} 
    />
  );
};

