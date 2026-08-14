import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const DaySummaryPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Day Summary" 
      subtitle="Daily closing summary" 
      entityName="Report" 
      items={[]} 
    />
  );
};

