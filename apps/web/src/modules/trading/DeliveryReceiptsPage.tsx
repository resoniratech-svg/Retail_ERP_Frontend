import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const DeliveryReceiptsPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Delivery Receipts" 
      subtitle="Manage Delivery Receipts" 
      entityName="Record" 
      items={[]} 
    />
  );
};

