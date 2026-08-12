export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  CASHIER = 'CASHIER',
  INVENTORY_MANAGER = 'INVENTORY_MANAGER',
  PURCHASE_MANAGER = 'PURCHASE_MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
  HR_MANAGER = 'HR_MANAGER',
  SALES_MANAGER = 'SALES_MANAGER',
  SALES_STAFF = 'SALES_STAFF',
  AUDITOR = 'AUDITOR',
}

export const ROLE_LABELS: Record<UserRole, { en: string; ar: string }> = {
  [UserRole.SUPER_ADMIN]: { en: 'Super Admin', ar: 'مسؤول رئيسي' },
  [UserRole.COMPANY_ADMIN]: { en: 'Company Admin', ar: 'مسؤول الشركة' },
  [UserRole.BRANCH_MANAGER]: { en: 'Branch Manager', ar: 'مدير الفرع' },
  [UserRole.CASHIER]: { en: 'Cashier', ar: 'أمين الصندوق' },
  [UserRole.INVENTORY_MANAGER]: { en: 'Inventory Manager', ar: 'مدير المخزون' },
  [UserRole.PURCHASE_MANAGER]: { en: 'Purchase Manager', ar: 'مدير المشتريات' },
  [UserRole.ACCOUNTANT]: { en: 'Accountant', ar: 'محاسب' },
  [UserRole.HR_MANAGER]: { en: 'HR Manager', ar: 'مدير الموارد البشرية' },
  [UserRole.SALES_MANAGER]: { en: 'Sales Manager', ar: 'مدير المبيعات' },
  [UserRole.SALES_STAFF]: { en: 'Sales Staff', ar: 'موظف مبيعات' },
  [UserRole.AUDITOR]: { en: 'Auditor', ar: 'مدقق حسابات' },
};
