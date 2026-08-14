export interface RibbonActionItem {
  id: string;
  label: string;
  labelAr?: string;
  iconName: string;
  route: string;
  shortcut?: string;
  permission?: string;
}

export interface RibbonGroupItem {
  title: string;
  titleAr?: string;
  actions: RibbonActionItem[];
}

export interface TopModuleItem {
  id: string;
  label: string;
  labelAr: string;
  iconName: string;
  defaultRoute: string;
  ribbonGroups: RibbonGroupItem[];
}

export const ERP_TOP_MODULES: TopModuleItem[] = [
  {
    id: 'pos-sales',
    label: 'POS Sales',
    labelAr: 'مبيعات نقاط البيع',
    iconName: 'ShoppingBag',
    defaultRoute: '/pos',
    ribbonGroups: [
      {
        title: 'POS Terminal',
        titleAr: 'جهاز النقطة',
        actions: [
          { id: 'pos-main', label: 'POS Terminal', labelAr: 'شاشة النقطة', iconName: 'ShoppingBag', route: '/pos', shortcut: 'F2' },
          { id: 'pos-config', label: 'Configuration', labelAr: 'الإعدادات', iconName: 'Sliders', route: '/control-panel' },
          { id: 'pos-dayclose', label: 'Day Close', labelAr: 'إغلاق اليوم', iconName: 'Lock', route: '/reports' },
        ],
      },
    ],
  },
  {
    id: 'register',
    label: 'Register',
    labelAr: 'السجل والتعريفات',
    iconName: 'Database',
    defaultRoute: '/products',
    ribbonGroups: [
      {
        title: 'Product Masters',
        titleAr: 'سجلات المنتجات',
        actions: [
          { id: 'reg-prod', label: 'Product', labelAr: 'المنتجات', iconName: 'Package', route: '/products' },
          { id: 'reg-barcode', label: 'Barcode', labelAr: 'الباركود', iconName: 'Barcode', route: '/products' },
          { id: 'reg-quick-barcode', label: 'Quick Barcode', labelAr: 'باركود سريع', iconName: 'Printer', route: '/batch-barcode' },
          { id: 'reg-price-update', label: 'Price Update', labelAr: 'تحديث الأسعار', iconName: 'TrendingUp', route: '/price-updates' },
        ],
      },
      {
        title: 'Category Hierarchy',
        titleAr: 'هيكل الفئات',
        actions: [
          { id: 'reg-dept', label: 'Department', labelAr: 'الأقسام الرئيسية', iconName: 'Grid', route: '/categories' },
          { id: 'reg-subdept', label: 'Sub Department', labelAr: 'الأقسام الفرعية', iconName: 'Layers', route: '/subdepartments' },
          { id: 'reg-cat', label: 'Category', labelAr: 'الفئات', iconName: 'Tag', route: '/categories' },
          { id: 'reg-subcat', label: 'SubCategory', labelAr: 'الفئات الفرعية', iconName: 'ListFilter', route: '/subcategories' },
          { id: 'reg-brand', label: 'Brands', labelAr: 'العلامات التجارية', iconName: 'Award', route: '/brands' },
        ],
      },
      {
        title: 'Access & Security',
        titleAr: 'الصلاحيات والفروع',
        actions: [
          { id: 'reg-roles', label: 'Roles', labelAr: 'الأدوار والصلاحيات', iconName: 'Shield', route: '/roles-permissions' },
          { id: 'reg-loc-access', label: 'Location Access', labelAr: 'صلاحيات الفروع', iconName: 'Lock', route: '/branches' },
        ],
      },
      {
        title: 'Directory Masters',
        titleAr: 'سجل الكيانات',
        actions: [
          { id: 'reg-emp', label: 'Employees', labelAr: 'الموظفين', iconName: 'UserCheck', route: '/hr' },
          { id: 'reg-vendor', label: 'Vendors', labelAr: 'الموردين', iconName: 'Truck', route: '/suppliers' },
          { id: 'reg-cust', label: 'Customer', labelAr: 'العملاء', iconName: 'Users', route: '/customers' },
        ],
      },
      {
        title: 'Geography & Delivery',
        titleAr: 'المناطق والتوصيل',
        actions: [
          { id: 'reg-areas', label: 'Areas', labelAr: 'المناطق الجغرافية', iconName: 'Map', route: '/areas' },
          { id: 'reg-loc', label: 'Location', labelAr: 'الفروع والأنشطة', iconName: 'MapPin', route: '/branches' },
          { id: 'reg-del-agents', label: 'DeliveryAgents', labelAr: 'مندوبي التوصيل', iconName: 'Navigation', route: '/delivery-agents' },
        ],
      },
      {
        title: 'Shifts & Production',
        titleAr: 'الورديات والإنتاج',
        actions: [
          { id: 'reg-work-shift', label: 'Work Shift', labelAr: 'وردية العمل', iconName: 'Clock', route: '/shift-master' },
          { id: 'reg-shift-assign', label: 'Work Shift Assignment', labelAr: 'تعيين الورديات', iconName: 'Calendar', route: '/shift-assignment' },
          { id: 'reg-cust-biz-type', label: 'Customer Business Type', labelAr: 'نوع نشاط العميل', iconName: 'Briefcase', route: '/customer-types' },
          { id: 'reg-prod-mat', label: 'Production Material', labelAr: 'مواد الإنتاج', iconName: 'Boxes', route: '/production-material' },
        ],
      },
      {
        title: 'Taxes & Units',
        titleAr: 'الضرائب ووحدات القياس',
        actions: [
          { id: 'reg-taxes', label: 'Taxes', labelAr: 'الضرائب', iconName: 'Percent', route: '/taxes' },
          { id: 'reg-units', label: 'Units', labelAr: 'وحدات القياس', iconName: 'Scale', route: '/units' },
        ],
      },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    labelAr: 'المخزون والشراء',
    iconName: 'Box',
    defaultRoute: '/inventory',
    ribbonGroups: [
      {
        title: 'Purchasing & Stock',
        titleAr: 'الشراء والمخازن',
        actions: [
          { id: 'inv-po', label: 'Purchase Orders', labelAr: 'أوامر الشراء', iconName: 'FileText', route: '/purchasing' },
          { id: 'inv-grn', label: 'GRN Receipts', labelAr: 'استلام البضائع', iconName: 'Inbox', route: '/grn' },
          { id: 'inv-stock', label: 'Stock Overview', labelAr: 'نظرة المخزون', iconName: 'Box', route: '/stock' },
          { id: 'inv-wh', label: 'Warehouses', labelAr: 'المستودعات', iconName: 'Warehouse', route: '/warehouses' },
          { id: 'inv-trf', label: 'Stock Transfers', labelAr: 'التحويلات المخزنية', iconName: 'Repeat', route: '/stock-transfers' },
        ],
      },
    ],
  },
  {
    id: 'tradings',
    label: 'Tradings',
    labelAr: 'التجارة والمبيعات',
    iconName: 'TrendingUp',
    defaultRoute: '/trading',
    ribbonGroups: [
      {
        title: 'B2B Sales',
        titleAr: 'مبيعات الجملة',
        actions: [
          { id: 'trd-quote', label: 'Quotations', labelAr: 'عروض الأسعار', iconName: 'FileSpreadsheet', route: '/trading' },
          { id: 'trd-so', label: 'Sales Orders', labelAr: 'أوامر البيع', iconName: 'ShoppingCart', route: '/sales' },
          { id: 'trd-inv', label: 'Sales Invoices', labelAr: 'فواتير المبيعات', iconName: 'Receipt', route: '/sales' },
          { id: 'trd-ret', label: 'Sales Return', labelAr: 'مرتجعات المبيعات', iconName: 'RotateCcw', route: '/returns' },
        ],
      },
    ],
  },
  {
    id: 'hr-payroll',
    label: 'HR & Payroll',
    labelAr: 'الموارد البشرية والرواتب',
    iconName: 'Users',
    defaultRoute: '/hr',
    ribbonGroups: [
      {
        title: 'Job Masters & Allowances',
        titleAr: 'الوظائف والبدلات',
        actions: [
          { id: 'hr-allow-cat', label: 'Allowance Categories', labelAr: 'فئات البدلات', iconName: 'DollarSign', route: '/allowance-categories' },
          { id: 'hr-job-dept', label: 'Job Departments', labelAr: 'أقسام الوظائف', iconName: 'Briefcase', route: '/job-departments' },
          { id: 'hr-job-desig', label: 'Job Designations', labelAr: 'المسميات الوظيفية', iconName: 'Award', route: '/job-designations' },
        ],
      },
      {
        title: 'Payroll Operations',
        titleAr: 'مسير الرواتب',
        actions: [
          { id: 'hr-payroll', label: 'Generate Payroll', labelAr: 'مسير الرواتب', iconName: 'DollarSign', route: '/payroll' },
        ],
      },
      {
        title: 'Leave Management',
        titleAr: 'إدارة الإجازات',
        actions: [
          { id: 'hr-leave-type', label: 'Leave Type', labelAr: 'أنواع الإجازات', iconName: 'Calendar', route: '/leave-types' },
          { id: 'hr-leave-app', label: 'Leave Application', labelAr: 'طلب إجازة', iconName: 'FileText', route: '/leave' },
          { id: 'hr-leave-rep', label: 'Leave Report', labelAr: 'تقرير الإجازات', iconName: 'PieChart', route: '/leave-report' },
        ],
      },
      {
        title: 'Personnel & Attendance',
        titleAr: 'الموظفين والحضور',
        actions: [
          { id: 'hr-emp', label: 'Employee Register', labelAr: 'سجل الموظفين', iconName: 'Users', route: '/hr' },
          { id: 'hr-emp-status', label: 'Employee Status', labelAr: 'حالة الموظف', iconName: 'UserCheck', route: '/hr' },
          { id: 'hr-att', label: 'Attendance Log', labelAr: 'سجل الحضور', iconName: 'Clock', route: '/attendance' },
        ],
      },
    ],
  },
  {
    id: 'accounts',
    label: 'Accounts',
    labelAr: 'الحسابات والمالية',
    iconName: 'BookOpen',
    defaultRoute: '/accounting',
    ribbonGroups: [
      {
        title: 'Financial Ledger',
        titleAr: 'الدينار والدفاتر',
        actions: [
          { id: 'acc-coa', label: 'Chart of Accounts', labelAr: 'دليل الحسابات', iconName: 'BookOpen', route: '/accounting' },
          { id: 'acc-pay', label: 'Payments', labelAr: 'السندات والمدفوعات', iconName: 'CreditCard', route: '/payments' },
          { id: 'acc-rep', label: 'P&L Reports', labelAr: 'الأرباح والخسائر', iconName: 'PieChart', route: '/reports' },
        ],
      },
    ],
  },
  {
    id: 'asset-management',
    label: 'Asset Management',
    labelAr: 'إدارة الأصول',
    iconName: 'Building',
    defaultRoute: '/assets',
    ribbonGroups: [
      {
        title: 'Fixed Assets',
        titleAr: 'الأصول الثابتة',
        actions: [
          { id: 'ast-reg', label: 'Asset Register', labelAr: 'سجل الأصول', iconName: 'Building', route: '/assets' },
        ],
      },
    ],
  },
  {
    id: 'token-management',
    label: 'Token Management',
    labelAr: 'إدارة الرموز',
    iconName: 'Key',
    defaultRoute: '/token-management',
    ribbonGroups: [
      {
        title: 'API Integration Keys',
        titleAr: 'مفاتيح الربط البرمجي',
        actions: [
          { id: 'tkn-setup', label: 'Token Setup', labelAr: 'إعداد المفاتيح', iconName: 'Key', route: '/token-management' },
        ],
      },
    ],
  },
  {
    id: 'promotions',
    label: 'Promotions',
    labelAr: 'العروض الترويجية',
    iconName: 'Gift',
    defaultRoute: '/promotions',
    ribbonGroups: [
      {
        title: 'Campaigns',
        titleAr: 'الحملات والتخفيضات',
        actions: [
          { id: 'pro-main', label: 'Promotions List', labelAr: 'قائمة العروض', iconName: 'Gift', route: '/promotions' },
          { id: 'pro-loy', label: 'Loyalty Tiers', labelAr: 'مستويات الولاء', iconName: 'Award', route: '/loyalty' },
        ],
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    labelAr: 'التقارير الشاملة',
    iconName: 'FileBarChart',
    defaultRoute: '/reports',
    ribbonGroups: [
      {
        title: 'Analytical Center',
        titleAr: 'مركز التقارير',
        actions: [
          { id: 'rep-vat', label: 'Qatar VAT Tax Report', labelAr: 'تقرير ضريبة القيمة المضافة', iconName: 'FileCheck', route: '/reports' },
          { id: 'rep-audit', label: 'Security Audit Log', labelAr: 'سجل التدقيق الأمني', iconName: 'ShieldAlert', route: '/audit' },
        ],
      },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    labelAr: 'الإشعارات والتنبيهات',
    iconName: 'Bell',
    defaultRoute: '/notifications',
    ribbonGroups: [
      {
        title: 'System Inbox',
        titleAr: 'صندوق النظام',
        actions: [
          { id: 'ntf-inbox', label: 'Inbox Notifications', labelAr: 'وارد التنبيهات', iconName: 'Bell', route: '/notifications' },
          { id: 'ntf-app', label: 'Approvals Queue', labelAr: 'قائمة الموافقات', iconName: 'CheckSquare', route: '/approvals' },
        ],
      },
    ],
  },
  {
    id: 'dashboards',
    label: 'Dashboards',
    labelAr: 'لوحات القيادة',
    iconName: 'LayoutDashboard',
    defaultRoute: '/dashboard',
    ribbonGroups: [
      {
        title: 'Executive Overview',
        titleAr: 'النظرة التنفيذية',
        actions: [
          { id: 'dash-main', label: 'Executive Dashboard', labelAr: 'لوحة القيادة التنفيذية', iconName: 'LayoutDashboard', route: '/dashboard' },
        ],
      },
    ],
  },
  {
    id: 'control-panel',
    label: 'Control Panel',
    labelAr: 'لوحة التحكم بالنظام',
    iconName: 'Sliders',
    defaultRoute: '/control-panel',
    ribbonGroups: [
      {
        title: 'System Administration',
        titleAr: 'إدارة النظام الشاملة',
        actions: [
          { id: 'cp-settings', label: 'Company Settings', labelAr: 'إعدادات الشركة', iconName: 'Sliders', route: '/control-panel' },
          { id: 'cp-org', label: 'Organization Profile', labelAr: 'ملف المجموعة', iconName: 'Globe', route: '/organization' },
          { id: 'cp-comp', label: 'Companies List', labelAr: 'قائمة الشركات', iconName: 'Building', route: '/companies' },
          { id: 'cp-users', label: 'Users Directory', labelAr: 'سجل المستخدمين', iconName: 'Users', route: '/users' },
          { id: 'cp-roles', label: 'Roles Matrix', labelAr: 'مصفوفة الصلاحيات', iconName: 'Shield', route: '/roles-permissions' },
        ],
      },
    ],
  },
];
