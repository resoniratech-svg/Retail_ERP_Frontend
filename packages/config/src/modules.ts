export interface ERPModuleDefinition {
  id: string;
  name: string;
  nameAr: string;
  category: 'core' | 'inventory' | 'crm' | 'commerce' | 'erp' | 'admin';
  icon?: string;
  path: string;
}

export const ERP_MODULES: ERPModuleDefinition[] = [
  // Core & Admin
  { id: 'auth', name: 'Authentication', nameAr: 'المصادقة', category: 'core', path: '/auth' },
  { id: 'dashboard', name: 'Dashboard', nameAr: 'لوحة التحكم', category: 'core', path: '/dashboard' },
  { id: 'organization', name: 'Organization', nameAr: 'الهيكل التنظيمي', category: 'core', path: '/organization' },
  { id: 'companies', name: 'Companies', nameAr: 'الشركات', category: 'core', path: '/companies' },
  { id: 'branches', name: 'Branches', nameAr: 'الفروع', category: 'core', path: '/branches' },
  { id: 'users', name: 'Users', nameAr: 'المستخدمين', category: 'core', path: '/users' },
  { id: 'roles-permissions', name: 'Roles & Permissions', nameAr: 'الأدوار والصلاحيات', category: 'core', path: '/roles-permissions' },
  { id: 'control-panel', name: 'Control Panel', nameAr: 'لوحة الإعدادات', category: 'core', path: '/control-panel' },

  // Inventory
  { id: 'products', name: 'Products', nameAr: 'المنتجات', category: 'inventory', path: '/products' },
  { id: 'categories', name: 'Categories', nameAr: 'الفئات', category: 'inventory', path: '/categories' },
  { id: 'brands', name: 'Brands', nameAr: 'العلامات التجارية', category: 'inventory', path: '/brands' },
  { id: 'inventory', name: 'Inventory', nameAr: 'المخزون', category: 'inventory', path: '/inventory' },
  { id: 'stock', name: 'Stock Overview', nameAr: 'نظرة عامة على المخزون', category: 'inventory', path: '/stock' },
  { id: 'warehouses', name: 'Warehouses', nameAr: 'المستودعات', category: 'inventory', path: '/warehouses' },
  { id: 'stock-transfers', name: 'Stock Transfers', nameAr: 'تحويلات المخزون', category: 'inventory', path: '/stock-transfers' },
  { id: 'stock-adjustments', name: 'Stock Adjustments', nameAr: 'تعديلات المخزون', category: 'inventory', path: '/stock-adjustments' },

  // CRM
  { id: 'customers', name: 'Customers', nameAr: 'العملاء', category: 'crm', path: '/customers' },
  { id: 'suppliers', name: 'Suppliers', nameAr: 'الموردين', category: 'crm', path: '/suppliers' },
  { id: 'loyalty', name: 'Loyalty Program', nameAr: 'برنامج الولاء', category: 'crm', path: '/loyalty' },
  { id: 'promotions', name: 'Promotions', nameAr: 'العروض الترويجية', category: 'crm', path: '/promotions' },

  // Commerce
  { id: 'purchasing', name: 'Purchasing', nameAr: 'المشتريات', category: 'commerce', path: '/purchasing' },
  { id: 'trading', name: 'Trading & B2B', nameAr: 'التجارة والجملة', category: 'commerce', path: '/trading' },
  { id: 'sales', name: 'Sales Orders', nameAr: 'أوامر المبيعات', category: 'commerce', path: '/sales' },
  { id: 'payments', name: 'Payments', nameAr: 'الدفعات', category: 'commerce', path: '/payments' },
  { id: 'returns', name: 'Returns & RMA', nameAr: 'الإرجاع والارتجاع', category: 'commerce', path: '/returns' },

  // ERP Operations
  { id: 'accounting', name: 'Accounting & Finance', nameAr: 'المحاسبة والمالية', category: 'erp', path: '/accounting' },
  { id: 'hr', name: 'Human Resources', nameAr: 'الموارد البشرية', category: 'erp', path: '/hr' },
  { id: 'attendance', name: 'Attendance', nameAr: 'الحضور والإنصراف', category: 'erp', path: '/attendance' },
  { id: 'leave', name: 'Leave Management', nameAr: 'إدارة الإجازات', category: 'erp', path: '/leave' },
  { id: 'payroll', name: 'Payroll & WPS', nameAr: 'الرواتب والأجور', category: 'erp', path: '/payroll' },
  { id: 'assets', name: 'Asset Management', nameAr: 'إدارة الأصول', category: 'erp', path: '/assets' },

  // Administration
  { id: 'reports', name: 'Reports Center', nameAr: 'مركز التقارير', category: 'admin', path: '/reports' },
  { id: 'notifications', name: 'Notifications', nameAr: 'الإشعارات', category: 'admin', path: '/notifications' },
  { id: 'audit', name: 'Audit Logs', nameAr: 'سجلات التدقيق', category: 'admin', path: '/audit' },
  { id: 'approvals', name: 'Approvals Queue', nameAr: 'طابور الموافقات', category: 'admin', path: '/approvals' },
  { id: 'token-management', name: 'Token Management', nameAr: 'إدارة الرموز والربط', category: 'admin', path: '/token-management' },
];
