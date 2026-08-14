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
          { id: 'inv-po', label: 'Purchase Orders', labelAr: 'أوامر الشراء', iconName: 'ShoppingCart', route: '/purchasing' },
          { id: 'inv-grn', label: 'GRN', labelAr: 'استلام البضائع', iconName: 'FileBox', route: '/grn' },
          { id: 'inv-pur', label: 'Purchase', labelAr: 'المشتريات', iconName: 'Receipt', route: '/purchase' },
          { id: 'inv-grtn', label: 'GRTN', labelAr: 'إرجاع البضائع', iconName: 'Undo2', route: '/grtn' },
          { id: 'inv-pur-ret', label: 'Purchase Return', labelAr: 'إرجاع المشتريات', iconName: 'Undo2', route: '/purchase-returns' },
          { id: 'inv-csgn', label: 'Consignment', labelAr: 'بضاعة أمانة', iconName: 'Package', route: '/consignment' },
          { id: 'inv-csgn-ret', label: 'Consignment Return', labelAr: 'إرجاع بضاعة الأمانة', iconName: 'PackageMinus', route: '/consignment-return' },
          { id: 'inv-st', label: 'Stock Taking', labelAr: 'جرد المخزون', iconName: 'ClipboardList', route: '/stock-taking' },
          { id: 'inv-sa', label: 'Stock Adjustments', labelAr: 'تسويات المخزون', iconName: 'SlidersHorizontal', route: '/stock-adjustments' },
          { id: 'inv-sa-ver', label: 'Stock Adj Verification', labelAr: 'التحقق من التسويات', iconName: 'ShieldCheck', route: '/stock-adjustment-verification' },
        ],
      },
      {
        title: 'Operations',
        titleAr: 'العمليات',
        actions: [
          { id: 'inv-was', label: 'Wastage', labelAr: 'التالف والمهدر', iconName: 'Trash2', route: '/wastage' },
          { id: 'inv-req', label: 'Stock Requisition', labelAr: 'طلبات المخزون', iconName: 'ClipboardList', route: '/stock-requisitions' },
          { id: 'inv-trf', label: 'Stock Transfers', labelAr: 'التحويلات المخزنية', iconName: 'Repeat', route: '/stock-transfers' },
          { id: 'inv-pc', label: 'Product Conversions', labelAr: 'تحويلات المنتجات', iconName: 'Repeat', route: '/product-conversions' },
          { id: 'inv-prq', label: 'Production Request', labelAr: 'طلب الإنتاج', iconName: 'ClipboardList', route: '/production-requests' },
          { id: 'inv-ppl', label: 'Production Plan', labelAr: 'خطة الإنتاج', iconName: 'CheckSquare', route: '/production-plans' },
          { id: 'inv-prd', label: 'Production', labelAr: 'الإنتاج', iconName: 'FileBox', route: '/production' },
          { id: 'inv-inc', label: 'Internal Consumptions', labelAr: 'الاستهلاكات الداخلية', iconName: 'Trash2', route: '/internal-consumptions' },
          { id: 'inv-cpl', label: 'Customer Price List', labelAr: 'قائمة أسعار العملاء', iconName: 'Tag', route: '/customer-price-list' },
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
        title: 'Sales / Customer',
        titleAr: 'المبيعات والعملاء',
        actions: [
          { id: 'trd-rfq', label: 'Customer RFQ', labelAr: 'طلب تسعير', iconName: 'UserRound', route: '/customers' },
          { id: 'trd-job', label: 'Job Orders', labelAr: 'أوامر العمل', iconName: 'ClipboardList', route: '/job-orders' },
          { id: 'trd-so', label: 'Sales Order', labelAr: 'أوامر البيع', iconName: 'ShoppingCart', route: '/sales' },
          { id: 'trd-quote', label: 'Quotations', labelAr: 'عروض الأسعار', iconName: 'FileText', route: '/trading' },
          { id: 'trd-inv', label: 'Sales Invoices', labelAr: 'فواتير المبيعات', iconName: 'Receipt', route: '/sales-invoices' },
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
    defaultRoute: '/reports/all',
    ribbonGroups: [
      {
        title: 'Group 1',
        titleAr: 'المجموعة الأولى',
        actions: [
          { id: 'rep-all', label: 'All Reports', labelAr: 'كل التقارير', iconName: 'FileBarChart', route: '/reports/all' },
          { id: 'rep-cust', label: 'Custom Reports', labelAr: 'تقارير مخصصة', iconName: 'SlidersHorizontal', route: '/reports/custom' },
          { id: 'rep-sls', label: 'Sales Reports', labelAr: 'تقارير المبيعات', iconName: 'ShoppingCart', route: '/reports/sales-reports' },
          { id: 'rep-s', label: 'Sales', labelAr: 'المبيعات', iconName: 'Receipt', route: '/reports/sales' },
          { id: 'rep-sprf', label: 'Sales Profit', labelAr: 'أرباح المبيعات', iconName: 'TrendingUp', route: '/reports/sales-profit' },
        ],
      },
      {
        title: 'Group 2',
        titleAr: 'المجموعة الثانية',
        actions: [
          { id: 'rep-ds', label: 'Day Summary', labelAr: 'ملخص اليوم', iconName: 'CalendarDays', route: '/reports/day-summary' },
          { id: 'rep-hrly', label: 'Hourly Report', labelAr: 'تقرير كل ساعة', iconName: 'Clock3', route: '/reports/hourly' },
          { id: 'rep-cdp', label: 'CashDrop & Payout', labelAr: 'السحوبات والدفعات', iconName: 'Banknote', route: '/reports/cash-drop-payout' },
          { id: 'rep-disc', label: 'Discounts', labelAr: 'الخصومات', iconName: 'BadgePercent', route: '/reports/discounts' },
          { id: 'rep-loy', label: 'Loyalty', labelAr: 'الولاء', iconName: 'Star', route: '/loyalty' },
        ],
      },
      {
        title: 'Group 3',
        titleAr: 'المجموعة الثالثة',
        actions: [
          { id: 'rep-posret', label: 'POS Return', labelAr: 'مرتجع نقاط البيع', iconName: 'RotateCcw', route: '/reports/pos-return' },
          { id: 'rep-cn', label: 'Credit Note', labelAr: 'إشعار دائن', iconName: 'FileMinus', route: '/reports/credit-note' },
          { id: 'rep-mis', label: 'MIS Report', labelAr: 'تقرير النظام', iconName: 'BarChart3', route: '/reports/mis' },
        ],
      },
      {
        title: 'Group 4',
        titleAr: 'المجموعة الرابعة',
        actions: [
          { id: 'rep-prod', label: 'Production Report', labelAr: 'تقرير الإنتاج', iconName: 'Factory', route: '/reports/production' },
          { id: 'rep-pwc', label: 'Product Wise Commission Report', labelAr: 'عمولة المنتجات', iconName: 'Percent', route: '/reports/product-wise-commission' },
        ],
      },
      {
        title: 'Group 5',
        titleAr: 'المجموعة الخامسة',
        actions: [
          { id: 'rep-wsr', label: 'Wholesale Reports', labelAr: 'تقارير الجملة', iconName: 'Building2', route: '/reports/wholesale' },
        ],
      },
      {
        title: 'Group 6',
        titleAr: 'المجموعة السادسة',
        actions: [
          { id: 'rep-pr', label: 'Purchase Reports', labelAr: 'تقارير المشتريات', iconName: 'FileText', route: '/reports/purchase-reports' },
          { id: 'rep-pur', label: 'Purchases', labelAr: 'المشتريات', iconName: 'ShoppingBag', route: '/purchase' },
          { id: 'rep-pret', label: 'Purchase Returns', labelAr: 'مرتجع المشتريات', iconName: 'Undo2', route: '/purchase-returns' },
        ],
      },
      {
        title: 'Group 7',
        titleAr: 'المجموعة السابعة',
        actions: [
          { id: 'rep-tax', label: 'Taxes', labelAr: 'الضرائب', iconName: 'ReceiptTax', route: '/reports/taxes' },
          { id: 'rep-log', label: 'Logs', labelAr: 'السجلات', iconName: 'ScrollText', route: '/audit' },
        ],
      },
      {
        title: 'Group 8',
        titleAr: 'المجموعة الثامنة',
        actions: [
          { id: 'rep-lsr', label: 'Location Sale Return Report', labelAr: 'مرتجعات المواقع', iconName: 'MapPin', route: '/reports/location-sale-return' },
          { id: 'rep-lpr', label: 'Location Pur.Return Report', labelAr: 'مرتجع مشتريات المواقع', iconName: 'MapPin', route: '/reports/location-purchase-return' },
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
