export interface Organization {
  id: string;
  name: string;
  nameAr?: string;
  taxRegistrationNo: string; // Qatar QTR / VAT ID
  baseCurrency: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
}

export interface Company {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  nameAr?: string;
  isParent: boolean;
  active: boolean;
}

export interface Branch {
  id: string;
  companyId: string;
  code: string;
  name: string;
  nameAr?: string;
  city: string;
  zone: string;
  street: string;
  phone: string;
  isMain: boolean;
  active: boolean;
}

export interface Warehouse {
  id: string;
  branchId: string;
  code: string;
  name: string;
  nameAr?: string;
  location: string;
  capacitySqFt: number;
  managerName: string;
  active: boolean;
}

export interface StockItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  quantityOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderLevel: number;
  unitCost: number;
}

export interface StockTransfer {
  id: string;
  transferNo: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  requestedBy: string;
  status: 'PENDING' | 'DISPATCHED' | 'RECEIVED' | 'CANCELLED';
  itemCount: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  phone: string;
  email?: string;
  taxNo?: string;
  customerType: 'RETAIL' | 'WHOLESALE' | 'CORPORATE';
  creditLimit: number;
  outstandingBalance: number;
  loyaltyPoints: number;
  loyaltyTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  active: boolean;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  contactPerson: string;
  phone: string;
  email: string;
  taxNo?: string;
  paymentTerms: string;
  active: boolean;
}

export interface PurchaseOrder {
  id: string;
  poNo: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  orderDate: string;
  expectedDate: string;
  totalAmount: number;
  status: 'DRAFT' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
}

export interface SalesOrder {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  branchId: string;
  orderDate: string;
  totalAmount: number;
  status: 'QUOTATION' | 'CONFIRMED' | 'INVOICED' | 'CANCELLED';
}

export interface Account {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  balance: number;
  isHeader: boolean;
  parentId?: string;
}

export interface Employee {
  id: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  nameAr?: string;
  department: string;
  designation: string;
  qidNumber: string; // Qatar ID
  qidExpiry: string;
  mobile: string;
  basicSalary: number;
  allowances: number;
  active: boolean;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
  overtimeHours: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'ANNUAL' | 'SICK' | 'EMERGENCY' | 'UNPAID';
  startDate: string;
  endDate: string;
  daysCount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  ipAddress: string;
  details: string;
}
