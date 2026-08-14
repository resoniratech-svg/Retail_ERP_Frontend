import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const JobOrdersPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Job Orders" 
      subtitle="Manage Job Orders" 
      entityName="Record" 
      items={[]} 
    />
  );
};

