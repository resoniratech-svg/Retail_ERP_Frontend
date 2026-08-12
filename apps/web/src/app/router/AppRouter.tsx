import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { POSPage } from '../../modules/pos/POSPage';
import { GenericModulePage } from '../../modules/common/GenericModulePage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone POS Route */}
        <Route path="/pos" element={<POSPage />} />

        {/* Web ERP Layout Routes */}
        <Route
          path="/*"
          element={
            <ERPLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/auth" element={<AuthPage />} />
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

                {/* CRM, Commerce & Enterprise */}
                <Route path="/suppliers" element={<GenericModulePage title="Suppliers" subtitle="Vendor registry & payment terms" entityName="Supplier" items={[{ id: '1', code: 'SUP-01', name: 'Almarai Food Qatar W.L.L', status: 'ACTIVE' }]} />} />
                <Route path="/loyalty" element={<GenericModulePage title="Loyalty Program" subtitle="Qatar points tiers" entityName="Loyalty Tier" items={[{ id: '1', code: 'LOY-GOLD', name: 'Gold Customer Tier (2x Points)', status: 'ACTIVE' }]} />} />
                <Route path="/promotions" element={<GenericModulePage title="Promotions" subtitle="Discount campaigns" entityName="Promotion" items={[{ id: '1', code: 'PRO-RAMADAN', name: 'Ramadan Special Offer 15%', amount: 15.00, status: 'ACTIVE' }]} />} />
                <Route path="/purchasing" element={<GenericModulePage title="Purchasing & POs" subtitle="Purchase Orders & GRN" entityName="PO" items={[{ id: '1', code: 'PO-2026-001', name: 'PO - Almarai Foods Qatar', amount: 85000.00, status: 'APPROVED' }]} />} />
                <Route path="/trading" element={<GenericModulePage title="Trading & B2B" subtitle="Wholesale Quotations" entityName="Quotation" items={[{ id: '1', code: 'QT-2026-44', name: 'B2B Offer - Doha Hotel Group', amount: 120000.00, status: 'CONFIRMED' }]} />} />
                <Route path="/sales" element={<GenericModulePage title="Sales Orders" subtitle="Sales invoices" entityName="Sales Order" items={[{ id: '1', code: 'SO-991', name: 'Retail Order - Walk-in POS', amount: 245.50, status: 'COMPLETED' }]} />} />
                <Route path="/payments" element={<GenericModulePage title="Payments" subtitle="Payment receipts" entityName="Payment" items={[{ id: '1', code: 'PAY-881', name: 'Bank Transfer - Doha Hypermarket', amount: 32500.00, status: 'CLEARED' }]} />} />
                <Route path="/returns" element={<GenericModulePage title="Returns & RMA" subtitle="Customer return credit" entityName="RMA" items={[{ id: '1', code: 'RMA-12', name: 'Customer Refund Voucher', amount: 45.00, status: 'ISSUED' }]} />} />

                {/* ERP Operations & Admin */}
                <Route path="/stock-adjustments" element={<GenericModulePage title="Stock Adjustments" subtitle="Stock take count & shrinkage" entityName="Adjustment" items={[{ id: '1', code: 'ADJ-88', name: 'Damaged Goods Write-off', amount: 350.00, status: 'APPROVED' }]} />} />
                <Route path="/attendance" element={<GenericModulePage title="Attendance" subtitle="Biometric timecards" entityName="Timecard" items={[{ id: '1', code: 'ATT-001', name: 'Ahmed Al-Mansouri - Check-in 08:00', status: 'PRESENT' }]} />} />
                <Route path="/leave" element={<GenericModulePage title="Leave Management" subtitle="Annual leave requests" entityName="Leave Request" items={[{ id: '1', code: 'LEV-04', name: 'Annual Leave - Tariq Mahmood', status: 'APPROVED' }]} />} />
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
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
