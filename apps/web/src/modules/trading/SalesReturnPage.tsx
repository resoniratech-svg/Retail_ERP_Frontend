import React from 'react';
import { GenericModulePage } from '../common/GenericModulePage';

export const SalesReturnPage: React.FC = () => {
  return (
    <GenericModulePage 
      title="Returns & RMA" 
      subtitle="Customer return credit" 
      entityName="RMA" 
      items={[{ id: '1', code: 'RMA-12', name: 'Customer Refund Voucher', amount: 45.00, status: 'ISSUED' }]} 
    />
  );
};
