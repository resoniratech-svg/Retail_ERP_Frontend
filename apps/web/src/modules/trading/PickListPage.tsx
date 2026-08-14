import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const PickListPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Pick List" 
      subtitle="Manage Pick Lists" 
      entityName="Record" 
      items={[]} 
    />
  );
};

