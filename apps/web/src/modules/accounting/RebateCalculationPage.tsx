import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const RebateCalculationPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Rebate Calculation" 
      subtitle="Vendor and customer rebates" 
      entityName="Accounting Record" 
      items={[]} 
    />
  );
};

