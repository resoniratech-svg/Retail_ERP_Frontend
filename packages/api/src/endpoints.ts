export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    SESSION: '/auth/session',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAILS: (id: string) => `/products/${id}`,
    BARCODE: (code: string) => `/products/barcode/${code}`,
  },
  CUSTOMERS: {
    LIST: '/customers',
    DETAILS: (id: string) => `/customers/${id}`,
  },
  SALES: {
    LIST: '/sales',
    CREATE: '/sales',
  },
  SYNC: {
    PUSH: '/sync/push',
  },
} as const;
