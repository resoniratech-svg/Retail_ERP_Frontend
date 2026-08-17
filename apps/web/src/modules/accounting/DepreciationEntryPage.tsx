import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const DepreciationEntryPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Depreciation Entry" 
      subtitle="Asset depreciation" 
      entityName="Accounting Record" 
      items={[]} 
    />
  );
};

