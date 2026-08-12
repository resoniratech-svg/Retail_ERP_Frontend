import { Customer } from '@qatar-erp/types';

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust-001',
    code: 'CUST-QTR-101',
    name: 'Doha Hypermarket Corp',
    nameAr: 'شركة لولو هايبرماركت الدوحة',
    phone: '+974 4411 2233',
    email: 'purchasing@dohahyper.qa',
    taxNo: 'QTR-998877',
    customerType: 'WHOLESALE',
    creditLimit: 150000,
    outstandingBalance: 32500,
    loyaltyPoints: 4200,
    loyaltyTier: 'GOLD',
    active: true,
  },
  {
    id: 'cust-002',
    code: 'CUST-QTR-102',
    name: 'Jassim Mohammed Al-Kuwari',
    nameAr: 'جاسم محمد الكواري',
    phone: '+974 5566 7788',
    customerType: 'RETAIL',
    creditLimit: 5000,
    outstandingBalance: 0,
    loyaltyPoints: 850,
    loyaltyTier: 'SILVER',
    active: true,
  },
];

export const customersService = {
  async getCustomers(): Promise<Customer[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_CUSTOMERS]), 100));
  },
};
