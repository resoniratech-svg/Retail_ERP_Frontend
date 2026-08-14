import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const LoadingConfirmationPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Loading Confirmation" 
      subtitle="Manage Loading Confirmations" 
      entityName="Record" 
      items={[]} 
    />
  );
};

