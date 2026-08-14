import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const AllReportsPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="All Reports" 
      subtitle="View all reports" 
      entityName="Report" 
      items={[]} 
    />
  );
};

