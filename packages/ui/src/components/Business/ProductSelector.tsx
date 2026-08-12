import React from 'react';
import { Select, SelectOption } from '../Select/Select';

export interface ProductSelectorProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label?: string;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({ value, onChange, label = 'Select Product' }) => {
  const mockOptions: SelectOption[] = [
    { value: '', label: '-- Choose Product --' },
    { value: 'prod-001', label: 'Almarai Fresh Milk 1L (QAR 7.50)' },
    { value: 'prod-002', label: 'Khabari Basmati Rice 5kg (QAR 45.00)' },
    { value: 'prod-003', label: 'Rayyan Water 500ml Pack (QAR 18.00)' },
  ];

  return <Select label={label} options={mockOptions} value={value} onChange={onChange} />;
};
