import { Supplier } from '@qatar-erp/types';

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'supp-001',
    code: 'SUPP-QTR-501',
    name: 'Almarai Food Qatar W.L.L',
    nameAr: 'شركة المراعي للأغذية قطر ذ.م.م',
    contactPerson: 'Tariq Mansoor',
    phone: '+974 4455 9900',
    email: 'orders.qatar@almarai.com',
    taxNo: 'QTR-123456',
    paymentTerms: 'NET 30',
    active: true,
  },
];

export const suppliersService = {
  async getSuppliers(): Promise<Supplier[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_SUPPLIERS]), 100));
  },
};
