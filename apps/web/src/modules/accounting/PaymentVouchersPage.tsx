import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const PaymentVouchersPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Payments" 
      subtitle="Payment receipts" 
      entityName="Payment" 
      items={[{ id: '1', code: 'PAY-881', name: 'Bank Transfer - Doha Hypermarket', amount: 32500.00, status: 'CLEARED' }]} 
    />
  );
};
