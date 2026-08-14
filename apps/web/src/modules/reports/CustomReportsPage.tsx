import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const CustomReportsPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Custom Reports" 
      subtitle="Generate custom reports" 
      entityName="Report" 
      items={[]} 
    />
  );
};

