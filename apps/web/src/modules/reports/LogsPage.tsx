import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const LogsPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Audit Logs" 
      subtitle="Security audit trail" 
      entityName="Audit Log" 
      items={[{ id: '1', code: 'LOG-889', name: 'User admin updated product cost price', status: 'LOGGED' }]} 
    />
  );
};
