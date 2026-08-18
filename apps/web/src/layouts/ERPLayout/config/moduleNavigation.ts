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
          { id: 'pos-dayclose', label: 'Day Close', labelAr: 'إغلاق اليوم', iconName: 'Lock', route: '/day-close' },
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
          { id: 'reg-barcode', label: 'Barcode', labelAr: 'الباركود', iconName: 'Barcode', route: '/batch-barcode' },
          { id: 'reg-quick-barcode', label: 'Quick Barcode', labelAr: 'باركود سريع', iconName: 'Printer', route: '/batch-barcode?quickPrint=true' },
          { id: 'reg-price-update', label: 'Price Update', labelAr: 'تحديث الأسعار', iconName: 'TrendingUp', route: '/price-updates' },
        ],
      },
      {
        title: 'Category Hierarchy',
        titleAr: 'هيكل الفئات',
        actions: [
          { id: 'reg-dept', label: 'Department', labelAr: 'الأقسام الرئيسية', iconName: 'Grid', route: '/departments' },
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
          { id: 'reg-loc-access', label: 'Location Access', labelAr: 'صلاحيات الفروع', iconName: 'Lock', route: '/roles-permissions?locationAccess=true' },
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
          { id: 'reg-loc', label: 'Location', labelAr: 'الفروع والأنشطة', iconName: 'MapPin', route: '/locations' },
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
          { id: 'inv-grn', label: 'GRN', labelAr: 'إيصال استلام البضائع', iconName: 'Inbox', route: '/grn' },
          { id: 'inv-pur', label: 'Purchase', labelAr: 'مشتريات', iconName: 'ShoppingCart', route: '/purchase' },
          { id: 'inv-grtn', label: 'GRTN', labelAr: 'مرتجع استلام', iconName: 'ArrowUpRight', route: '/grtn' },
          { id: 'inv-pret', label: 'Purchase Return', labelAr: 'مرتجع مشتريات', iconName: 'CornerUpLeft', route: '/purchase-returns' },
          { id: 'inv-consig', label: 'Consignment', labelAr: 'أمانة', iconName: 'Package', route: '/consignment' },
          { id: 'inv-cret', label: 'Consignment Return', labelAr: 'مرتجع أمانة', iconName: 'RotateCcw', route: '/consignment-return' },
          { id: 'inv-stock', label: 'Stock Overview', labelAr: 'نظرة المخزون', iconName: 'Box', route: '/stock' },
          { id: 'inv-wh', label: 'Warehouses', labelAr: 'المستودعات', iconName: 'Warehouse', route: '/warehouses' },
          { id: 'inv-trf', label: 'Stock Transfers', labelAr: 'التحويلات المخزنية', iconName: 'Repeat', route: '/stock-transfers' },
        ],
      },
      {
        title: 'Inventory Operations',
        titleAr: 'عمليات المخزون',
        actions: [
          { id: 'inv-st', label: 'Stock Taking', labelAr: 'جرد المخزون', iconName: 'ClipboardList', route: '/stock-taking' },
          { id: 'inv-sa', label: 'Stock Adjustments', labelAr: 'تسويات المخزون', iconName: 'SlidersHorizontal', route: '/stock-adjustments' },
          { id: 'inv-sav', label: 'Stock Adj Verification', labelAr: 'تأكيد التسويات', iconName: 'CheckSquare', route: '/stock-adjustment-verification' },
          { id: 'inv-wastage', label: 'Wastage', labelAr: 'الهالك', iconName: 'Trash2', route: '/wastage' },
          { id: 'inv-sreq', label: 'Stock Requisition', labelAr: 'طلب مخزون', iconName: 'HandMetal', route: '/stock-requisitions' },
        ],
      },
      {
        title: 'Production',
        titleAr: 'الإنتاج',
        actions: [
          { id: 'inv-pconv', label: 'Product Conversions', labelAr: 'تحويل المنتجات', iconName: 'RefreshCw', route: '/product-conversions' },
          { id: 'inv-preq', label: 'Production Request', labelAr: 'طلب إنتاج', iconName: 'Factory', route: '/production-requests' },
          { id: 'inv-pplan', label: 'Production Plan', labelAr: 'خطة الإنتاج', iconName: 'CalendarDays', route: '/production-plans' },
          { id: 'inv-prod', label: 'Production', labelAr: 'الإنتاج الفعلي', iconName: 'Hammer', route: '/production' },
          { id: 'inv-icons', label: 'Internal Consumptions', labelAr: 'استهلاك داخلي', iconName: 'Flame', route: '/internal-consumptions' },
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
      {
        title: 'Delivery / Order Operations',
        titleAr: 'التوصيل والعمليات',
        actions: [
          { id: 'trd-del', label: 'Delivery Receipts', labelAr: 'إيصالات التوصيل', iconName: 'Truck', route: '/delivery-receipts' },
          { id: 'trd-route', label: 'Routes', labelAr: 'المسارات', iconName: 'Route', route: '/routes' },
          { id: 'trd-cpl', label: 'Customer Price List', labelAr: 'قائمة أسعار العملاء', iconName: 'Tags', route: '/customer-price-list' },
          { id: 'trd-load', label: 'Loading Form', labelAr: 'نموذج التحميل', iconName: 'PackageCheck', route: '/loading-confirmation' },
          { id: 'trd-pick', label: 'Pick List', labelAr: 'قائمة الانتقاء', iconName: 'ListChecks', route: '/pick-list' },
        ],
      },
      {
        title: 'Coupons',
        titleAr: 'الكوبونات',
        actions: [
          { id: 'trd-coup', label: 'Coupon Master', labelAr: 'إدارة الكوبونات', iconName: 'Ticket', route: '/coupon-master' },
          { id: 'trd-pcoup', label: 'Printed Coupons', labelAr: 'الكوبونات المطبوعة', iconName: 'Printer', route: '/printed-coupons' },
        ],
      },
      {
        title: 'Sales / Fleet Operations',
        titleAr: 'عمليات الأسطول',
        actions: [
          { id: 'trd-ssn', label: 'Sale Sessions', labelAr: 'جلسات البيع', iconName: 'Clock', route: '/sale-sessions' },
          { id: 'trd-fleet', label: 'Fleet', labelAr: 'الأسطول', iconName: 'Car', route: '/fleet' },
          { id: 'trd-sol', label: 'Stock OnLoad-ReLoad', labelAr: 'تحميل المخزون', iconName: 'PackagePlus', route: '/stock-onload-reload' },
          { id: 'trd-soff', label: 'Stock Off Load', labelAr: 'تنزيل المخزون', iconName: 'PackageMinus', route: '/stock-offload' },
          { id: 'trd-sreq', label: 'Stock Request', labelAr: 'طلب مخزون', iconName: 'ClipboardRequest', route: '/stock-requisitions' },
        ],
      },
      {
        title: 'Van / Field Sales',
        titleAr: 'مبيعات التوزيع',
        actions: [
          { id: 'trd-vs', label: 'Live Van Stock', labelAr: 'مخزون الشاحنة المباشر', iconName: 'Boxes', route: '/van-stock' },
          { id: 'trd-vsrep', label: 'Sale & Stock Reports', labelAr: 'تقارير المبيعات', iconName: 'BarChart3', route: '/sale-stock-reports' },
          { id: 'trd-votp', label: 'Van Discount OTP', labelAr: 'رمز خصم الشاحنة', iconName: 'ShieldCheck', route: '/van-discount-otp' },
          { id: 'trd-vtrck', label: 'Van Route Track', labelAr: 'تتبع المسار', iconName: 'Map', route: '/van-route-track' },
          { id: 'trd-vast', label: 'Van Asset', labelAr: 'أصول الشاحنة', iconName: 'CarFront', route: '/van-asset' },
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
        title: 'Account / Master',
        titleAr: 'دليل الحسابات',
        actions: [
          { id: 'acc-coa', label: 'Chart of Accounts', labelAr: 'دليل الحسابات', iconName: 'BookOpen', route: '/accounting' },
          { id: 'acc-ag', label: 'Account Groups', labelAr: 'مجموعات الحسابات', iconName: 'FolderTree', route: '/accounting/account-groups' },
          { id: 'acc-lg', label: 'Ledger Groups', labelAr: 'مجموعات الأستاذ', iconName: 'Layers', route: '/accounting/ledger-groups' },
          { id: 'acc-cc', label: 'Cost Centers', labelAr: 'مراكز التكلفة', iconName: 'Building2', route: '/accounting/cost-centers' },
          { id: 'acc-ledgers', label: 'Ledgers', labelAr: 'الدفاتر', iconName: 'BookOpen', route: '/accounting/ledgers' },
        ],
      },
      {
        title: 'Vouchers',
        titleAr: 'السندات',
        actions: [
          { id: 'acc-jv', label: 'Journal Vchrs', labelAr: 'قيود اليومية', iconName: 'FileText', route: '/accounting/journal-vouchers' },
          { id: 'acc-pv', label: 'Payment Vchrs', labelAr: 'سندات الصرف', iconName: 'Banknote', route: '/payments' },
          { id: 'acc-mpv', label: 'Multiple Pay. Vcher', labelAr: 'صرف متعدد', iconName: 'Files', route: '/accounting/multiple-payment-vouchers' },
          { id: 'acc-advr', label: 'Adv. Receipts', labelAr: 'مقبوضات مقدمة', iconName: 'Wallet', route: '/accounting/advance-receipts' },
          { id: 'acc-rv', label: 'Receipt Vchrs', labelAr: 'سندات القبض', iconName: 'Receipt', route: '/accounting/receipt-vouchers' },
          { id: 'acc-cv', label: 'Contra Vchrs', labelAr: 'قيود عكسية', iconName: 'ArrowLeftRight', route: '/accounting/contra-vouchers' },
          { id: 'acc-op', label: 'Other Payments', labelAr: 'مدفوعات أخرى', iconName: 'CreditCard', route: '/accounting/other-payments' },
          { id: 'acc-or', label: 'Other Receipts', labelAr: 'مقبوضات أخرى', iconName: 'ReceiptText', route: '/accounting/other-receipts' },
        ],
      },
      {
        title: 'Finance Operations',
        titleAr: 'العمليات المالية',
        actions: [
          { id: 'acc-cn', label: 'Credit Notes', labelAr: 'إشعارات دائنة', iconName: 'FileMinus', route: '/reports/credit-note' },
          { id: 'acc-br', label: 'Bank Reconciliation', labelAr: 'مطابقة البنك', iconName: 'Landmark', route: '/accounting/bank-reconciliation' },
          { id: 'acc-cm', label: 'Credit Memo', labelAr: 'مذكرة ائتمان', iconName: 'FilePen', route: '/accounting/credit-memo' },
          { id: 'acc-de', label: 'Deferred Exp.', labelAr: 'مصروفات مؤجلة', iconName: 'CalendarClock', route: '/accounting/deferred-expenses' },
          { id: 'acc-depr', label: 'Depreciation Entry', labelAr: 'قيد إهلاك', iconName: 'TrendingDown', route: '/accounting/depreciation-entry' },
          { id: 'acc-rc', label: 'Rebate Calculation', labelAr: 'حساب الخصم', iconName: 'Calculator', route: '/accounting/rebate-calculation' },
          { id: 'acc-ict', label: 'Inter Costcenter Transfers', labelAr: 'تحويلات مراكز', iconName: 'ArrowLeftRight', route: '/accounting/inter-costcenter-transfers' },
          { id: 'acc-exp', label: 'Expenses', labelAr: 'المصروفات', iconName: 'Receipt', route: '/accounting/expenses' },
          { id: 'acc-opurch', label: 'Other Purchases', labelAr: 'مشتريات أخرى', iconName: 'ShoppingBag', route: '/accounting/other-purchases' },
        ],
      },
      {
        title: 'Operations',
        titleAr: 'العمليات',
        actions: [],
      },
      {
        title: 'Reports',
        titleAr: 'التقارير',
        actions: [
          { id: 'acc-rep', label: 'P&L Reports', labelAr: 'الأرباح والخسائر', iconName: 'PieChart', route: '/accounting/pnl-reports' },
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
    labelAr: 'إدارة الرموز والانتظار',
    iconName: 'Key',
    defaultRoute: '/token-management',
    ribbonGroups: [
      {
        title: 'Token & Queue Operations',
        titleAr: 'إدارة الدور والانتظار',
        actions: [
          { id: 'tkn-actions', label: 'Token Actions', labelAr: 'إجراءات الدور', iconName: 'Target', route: '/token-actions' },
          { id: 'tkn-announcement', label: 'Announcement Config', labelAr: 'إعداد الإعلانات', iconName: 'Volume2', route: '/announcement-config' },
          { id: 'tkn-reports', label: 'Token Reports', labelAr: 'تقارير الدور', iconName: 'FileBarChart', route: '/token-reports' },
          { id: 'tkn-manage', label: 'Manage Tokens', labelAr: 'إدارة المفاتيح', iconName: 'Key', route: '/token-management' },
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
