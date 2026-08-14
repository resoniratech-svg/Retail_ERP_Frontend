import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const HourlyReportPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Hourly Report" 
      subtitle="Hourly sales data" 
      entityName="Report" 
      items={[]} 
    />
  );
};

