export const PERMISSIONS = {
  // Product permissions
  PRODUCT_VIEW: 'product:view',
  PRODUCT_CREATE: 'product:create',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',

  // Inventory permissions
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_ADJUST: 'inventory:adjust',
  INVENTORY_TRANSFER: 'inventory:transfer',

  // Sales permissions
  SALES_VIEW: 'sales:view',
  SALES_CREATE: 'sales:create',
  SALES_RETURN: 'sales:return',
  SALES_APPROVE: 'sales:approve',

  // POS permissions
  POS_SALE: 'pos:sale',
  POS_CART: 'pos:cart',
  POS_DISCOUNT: 'pos:discount',
  POS_PRICE_OVERRIDE: 'pos:price_override',
  POS_DRAWER_OPEN: 'pos:drawer_open',

  // Purchase permissions
  PURCHASE_VIEW: 'purchase:view',
  PURCHASE_CREATE: 'purchase:create',
  PURCHASE_APPROVE: 'purchase:approve',

  // Accounting permissions
  ACCOUNTING_VIEW: 'accounting:view',
  ACCOUNTING_CREATE: 'accounting:create',

  // HR permissions
  HR_VIEW: 'hr:view',
  HR_MANAGE: 'hr:manage',

  // Admin permissions
  USER_MANAGE: 'user:manage',
  ROLE_MANAGE: 'role:manage',
  SETTINGS_MANAGE: 'settings:manage',
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];
