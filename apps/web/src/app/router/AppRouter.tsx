import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { ERPLayout } from '../../layouts/ERPLayout/ERPLayout';
import { AuthPage } from '../../modules/auth/AuthPage';
import { DashboardPage } from '../../modules/dashboard/DashboardPage';
import { OrganizationPage } from '../../modules/organization/OrganizationPage';
import { CompaniesPage } from '../../modules/companies/CompaniesPage';
import { BranchesPage } from '../../modules/branches/BranchesPage';
import { UsersPage } from '../../modules/users/UsersPage';
import { RolesPermissionsPage } from '../../modules/roles-permissions/RolesPermissionsPage';
import { ControlPanelPage } from '../../modules/control-panel/ControlPanelPage';
import { ProductsPage } from '../../modules/products/ProductsPage';
import { CategoriesPage } from '../../modules/categories/CategoriesPage';
import { BrandsPage } from '../../modules/brands/BrandsPage';
import { InventoryPage } from '../../modules/inventory/InventoryPage';
import { StockPage } from '../../modules/stock/StockPage';
import { WarehousesPage } from '../../modules/warehouses/WarehousesPage';
import { StockTransfersPage } from '../../modules/stock-transfers/StockTransfersPage';
import { CustomersPage } from '../../modules/customers/CustomersPage';
import { AccountingPage } from '../../modules/accounting/AccountingPage';
import { HRPage } from '../../modules/hr/HRPage';
import { LeaveTypesPage } from '../../modules/hr/LeaveTypesPage';
import { LeaveApplicationsPage } from '../../modules/hr/LeaveApplicationsPage';
import { POSPage } from '../../modules/pos/POSPage';
import { GenericModulePage } from '../../modules/common/GenericModulePage';
import { PurchaseOrdersPage } from '../../modules/inventory/PurchaseOrdersPage';
import { GRNPage } from '../../modules/inventory/GRNPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Web ERP Layout Routes (Protected) */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <ERPLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/organization" element={<OrganizationPage />} />
                  <Route path="/companies" element={<CompaniesPage />} />
                  <Route path="/branches" element={<BranchesPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/roles-permissions" element={<RolesPermissionsPage />} />
                  <Route path="/control-panel" element={<ControlPanelPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/brands" element={<BrandsPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/stock" element={<StockPage />} />
                  <Route path="/warehouses" element={<WarehousesPage />} />
                  <Route path="/stock-transfers" element={<StockTransfersPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/accounting" element={<AccountingPage />} />
                  <Route path="/hr" element={<HRPage />} />
                  <Route path="/leave-types" element={<LeaveTypesPage />} />
                  <Route path="/leave" element={<LeaveApplicationsPage />} />
                  <Route path="/pos" element={<POSPage />} />

                  {/* Catalog & Register masters extensions */}
                  <Route path="/colors" element={<GenericModulePage title="Product Colors" subtitle="Color master attributes" entityName="Color" items={[{ id: '1', code: 'CLR-RED', name: 'Standard Red', status: 'ACTIVE' }]} />} />
                  <Route path="/subcategories" element={<GenericModulePage title="Sub Categories" subtitle="Secondary category hierarchy" entityName="Sub Category" items={[{ id: '1', code: 'SUB-BEV', name: 'Carbonated Drinks', status: 'ACTIVE' }]} />} />
                  <Route path="/subdepartments" element={<GenericModulePage title="Sub Departments" subtitle="Secondary department division" entityName="Sub Department" items={[{ id: '1', code: 'SDEP-RET', name: 'Fresh Counter Sales', status: 'ACTIVE' }]} />} />
                  <Route path="/batch-barcode" element={<GenericModulePage title="Batch Barcode Printing" subtitle="Print shelf & item barcodes" entityName="Barcode Batch" items={[{ id: '1', code: 'BAR-001', name: 'Milk & Beverage Shelf Labels Batch', status: 'PRINTED' }]} />} />
                  <Route path="/price-updates" element={<GenericModulePage title="Price Updates Register" subtitle="Bulk cost & retail price overrides" entityName="Price Change Log" items={[{ id: '1', code: 'PRC-991', name: 'Almarai Retail Price Adjustment', amount: 7.50, status: 'EFFECTIVE' }]} />} />
                  <Route path="/shift-master" element={<GenericModulePage title="Work Shift Master" subtitle="Cashier & store shift scheduling" entityName="Shift Schedule" items={[{ id: '1', code: 'SHF-MORNING', name: 'Morning Cashier Shift (07:00 - 15:00)', status: 'ACTIVE' }]} />} />
                  <Route path="/shift-assignment" element={<GenericModulePage title="Work Shift Assignment" subtitle="Employee shift roster" entityName="Shift Roster" items={[{ id: '1', code: 'ROST-01', name: 'Tariq Mahmood - Morning Shift', status: 'ASSIGNED' }]} />} />
                  <Route path="/areas" element={<GenericModulePage title="Geographical Areas" subtitle="Delivery zones & delivery areas" entityName="Area Zone" items={[{ id: '1', code: 'AREA-DOH', name: 'Doha West Bay & Pearl Zone', status: 'ACTIVE' }]} />} />
                  <Route path="/delivery-agents" element={<GenericModulePage title="Delivery Agents" subtitle="Store drivers & delivery fleet" entityName="Delivery Agent" items={[{ id: '1', code: 'DRV-01', name: 'Kassim Express Driver', status: 'ACTIVE' }]} />} />
                  <Route path="/customer-types" element={<GenericModulePage title="Customer Business Types" subtitle="Retail, Wholesale, & Hotel tiers" entityName="Business Type" items={[{ id: '1', code: 'BIZ-HTL', name: 'Hotel & Hospitality Corporate', status: 'ACTIVE' }]} />} />
                  <Route path="/production-material" element={<GenericModulePage title="Production Material" subtitle="Bakery & kitchen raw ingredients" entityName="Material" items={[{ id: '1', code: 'MAT-FLOUR', name: 'Wheat Flour 25kg Bag', amount: 45.00, status: 'ACTIVE' }]} />} />
                  <Route path="/taxes" element={<GenericModulePage title="Tax Setup & Rates" subtitle="Qatar VAT 0% & 5% Tax Rules" entityName="Tax Rate" items={[{ id: '1', code: 'VAT-0', name: 'Qatar Zero VAT (Essential Food)', amount: 0.00, status: 'ACTIVE' }]} />} />
                  <Route path="/units" element={<GenericModulePage title="Units of Measure" subtitle="Pcs, Kg, Box, Pack definitions" entityName="Unit" items={[{ id: '1', code: 'UOM-PCS', name: 'Pieces (Pcs)', status: 'ACTIVE' }, { id: '2', code: 'UOM-KG', name: 'Kilograms (Kg)', status: 'ACTIVE' }]} />} />

                  {/* HR & Job Masters Extensions */}
                  <Route path="/allowance-categories" element={<GenericModulePage title="Allowance Categories" subtitle="Housing, Transport, & Food Allowances" entityName="Allowance Category" items={[{ id: '1', code: 'ALL-HOU', name: 'Housing Allowance (Qatar Standard)', amount: 2500.00, status: 'ACTIVE' }, { id: '2', code: 'ALL-TRN', name: 'Transport Allowance', amount: 800.00, status: 'ACTIVE' }]} />} />
                  <Route path="/job-departments" element={<GenericModulePage title="Job Departments" subtitle="HR Department Structure" entityName="Job Department" items={[{ id: '1', code: 'DEPT-SALES', name: 'Retail Sales & POS Operations', status: 'ACTIVE' }, { id: '2', code: 'DEPT-ACCT', name: 'Accounting & Finance', status: 'ACTIVE' }, { id: '3', code: 'DEPT-LOG', name: 'Logistics & Warehouse', status: 'ACTIVE' }]} />} />
                  <Route path="/job-designations" element={<GenericModulePage title="Job Designations" subtitle="Employee Roles & Positions" entityName="Job Designation" items={[{ id: '1', code: 'DES-CASH', name: 'Senior Cashier', status: 'ACTIVE' }, { id: '2', code: 'DES-MGR', name: 'Store Operations Manager', status: 'ACTIVE' }, { id: '3', code: 'DES-ACCT', name: 'Staff Accountant', status: 'ACTIVE' }]} />} />
                  <Route path="/leave-report" element={<GenericModulePage title="Leave Audit Reports" subtitle="Staff leave balance & usage" entityName="Leave Audit" items={[{ id: '1', code: 'LVR-2026', name: 'Annual Staff Leave Summary August 2026', status: 'COMPLETED' }]} />} />

                  {/* CRM, Commerce & Enterprise */}
                  <Route path="/suppliers" element={<GenericModulePage title="Suppliers" subtitle="Vendor registry & payment terms" entityName="Supplier" items={[{ id: '1', code: 'SUP-01', name: 'Almarai Food Qatar W.L.L', status: 'ACTIVE' }]} />} />
                  <Route path="/loyalty" element={<GenericModulePage title="Loyalty Program" subtitle="Qatar points tiers" entityName="Loyalty Tier" items={[{ id: '1', code: 'LOY-GOLD', name: 'Gold Customer Tier (2x Points)', status: 'ACTIVE' }]} />} />
                  <Route path="/promotions" element={<GenericModulePage title="Promotions" subtitle="Discount campaigns" entityName="Promotion" items={[{ id: '1', code: 'PRO-RAMADAN', name: 'Ramadan Special Offer 15%', amount: 15.00, status: 'ACTIVE' }]} />} />
                  <Route path="/purchasing" element={<PurchaseOrdersPage />} />
                  <Route path="/grn" element={<GRNPage />} />
                  <Route path="/trading" element={<GenericModulePage title="Trading & B2B" subtitle="Wholesale Quotations" entityName="Quotation" items={[{ id: '1', code: 'QT-2026-44', name: 'B2B Offer - Doha Hotel Group', amount: 120000.00, status: 'CONFIRMED' }]} />} />
                  <Route path="/sales" element={<GenericModulePage title="Sales Orders" subtitle="Sales invoices" entityName="Sales Order" items={[{ id: '1', code: 'SO-991', name: 'Retail Order - Walk-in POS', amount: 245.50, status: 'COMPLETED' }]} />} />
                  <Route path="/payments" element={<GenericModulePage title="Payments" subtitle="Payment receipts" entityName="Payment" items={[{ id: '1', code: 'PAY-881', name: 'Bank Transfer - Doha Hypermarket', amount: 32500.00, status: 'CLEARED' }]} />} />
                  <Route path="/returns" element={<GenericModulePage title="Returns & RMA" subtitle="Customer return credit" entityName="RMA" items={[{ id: '1', code: 'RMA-12', name: 'Customer Refund Voucher', amount: 45.00, status: 'ISSUED' }]} />} />

                  {/* ERP Operations & Admin */}
                  <Route path="/stock-adjustments" element={<GenericModulePage title="Stock Adjustments" subtitle="Stock take count & shrinkage" entityName="Adjustment" items={[{ id: '1', code: 'ADJ-88', name: 'Damaged Goods Write-off', amount: 350.00, status: 'APPROVED' }]} />} />
                  <Route path="/attendance" element={<GenericModulePage title="Attendance" subtitle="Biometric timecards" entityName="Timecard" items={[{ id: '1', code: 'ATT-001', name: 'Ahmed Al-Mansouri - Check-in 08:00', status: 'PRESENT' }]} />} />
                  <Route path="/payroll" element={<GenericModulePage title="Payroll & WPS" subtitle="Qatar WPS Salary Generator" entityName="Payroll Run" items={[{ id: '1', code: 'PAY-2026-08', name: 'Monthly WPS Salary Sheet August 2026', amount: 185000.00, status: 'PROCESSED' }]} />} />
                  <Route path="/assets" element={<GenericModulePage title="Asset Management" subtitle="Fixed Assets" entityName="Asset" items={[{ id: '1', code: 'AST-01', name: 'Thermal Receipt Printer POS-01', amount: 1200.00, status: 'ACTIVE' }]} />} />
                  <Route path="/reports" element={<GenericModulePage title="Reports Center" subtitle="Qatar VAT & Sales Reports" entityName="Report" items={[{ id: '1', code: 'REP-VAT', name: 'Qatar VAT Tax Summary Q3 2026', status: 'READY' }]} />} />
                  <Route path="/notifications" element={<GenericModulePage title="Notifications Inbox" subtitle="System alerts" entityName="Notification" items={[{ id: '1', code: 'NTF-01', name: 'Low Stock Warning: Rayyan Water 500ml', status: 'UNREAD' }]} />} />
                  <Route path="/audit" element={<GenericModulePage title="Audit Logs" subtitle="Security audit trail" entityName="Audit Log" items={[{ id: '1', code: 'LOG-889', name: 'User admin updated product cost price', status: 'LOGGED' }]} />} />
                  <Route path="/approvals" element={<GenericModulePage title="Approvals Queue" subtitle="Authorization requests" entityName="Approval" items={[{ id: '1', code: 'APP-102', name: 'Approval Request: PO > QAR 50,000', amount: 85000.00, status: 'PENDING' }]} />} />
                  <Route path="/token-management" element={<GenericModulePage title="Token Management" subtitle="API Integration Keys" entityName="API Token" items={[{ id: '1', code: 'TKN-KEY', name: 'POS Hardware Integration Secret Token', status: 'ACTIVE' }]} />} />

                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </ERPLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
