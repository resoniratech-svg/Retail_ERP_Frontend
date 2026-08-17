import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const OtherPaymentsPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Other Payments" 
      subtitle="Miscellaneous payments" 
      entityName="Accounting Record" 
      items={[]} 
    />
  );
};

