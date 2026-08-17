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
import { BatchBarcodePage } from '../../modules/products/BatchBarcodePage';
import { CategoriesPage } from '../../modules/categories/CategoriesPage';
import { SubCategoriesPage } from '../../modules/categories/SubCategoriesPage';
import { BrandsPage } from '../../modules/brands/BrandsPage';
import { InventoryPage } from '../../modules/inventory/InventoryPage';
import { StockPage } from '../../modules/stock/StockPage';
import { WarehousesPage } from '../../modules/warehouses/WarehousesPage';
import { StockTransfersPage } from '../../modules/stock-transfers/StockTransfersPage';
import { StockRequisitionsPage } from '../../modules/stock/StockRequisitionsPage';
import { CustomersPage } from '../../modules/customers/CustomersPage';
import { VendorsPage } from '../../modules/vendors/VendorsPage';
import { AccountingPage } from '../../modules/accounting/AccountingPage';
import { PaymentVouchersPage } from '../../modules/accounting/PaymentVouchersPage';
import { PnLReportsPage } from '../../modules/accounting/PnLReportsPage';
import { AccountGroupsPage } from '../../modules/accounting/AccountGroupsPage';
import { LedgerGroupsPage } from '../../modules/accounting/LedgerGroupsPage';
import { CostCentersPage } from '../../modules/accounting/CostCentersPage';
import { LedgersPage } from '../../modules/accounting/LedgersPage';
import { JournalVouchersPage } from '../../modules/accounting/JournalVouchersPage';
import { MultiplePaymentVouchersPage } from '../../modules/accounting/MultiplePaymentVouchersPage';
import { AdvanceReceiptsPage } from '../../modules/accounting/AdvanceReceiptsPage';
import { ReceiptVouchersPage } from '../../modules/accounting/ReceiptVouchersPage';
import { ContraVouchersPage } from '../../modules/accounting/ContraVouchersPage';
import { OtherPaymentsPage } from '../../modules/accounting/OtherPaymentsPage';
import { OtherReceiptsPage } from '../../modules/accounting/OtherReceiptsPage';
import { BankReconciliationPage } from '../../modules/accounting/BankReconciliationPage';
import { CreditMemoPage } from '../../modules/accounting/CreditMemoPage';
import { DeferredExpensesPage } from '../../modules/accounting/DeferredExpensesPage';
import { DepreciationEntryPage } from '../../modules/accounting/DepreciationEntryPage';
import { RebateCalculationPage } from '../../modules/accounting/RebateCalculationPage';
import { InterCostCenterTransfersPage } from '../../modules/accounting/InterCostCenterTransfersPage';
import { ExpensesPage } from '../../modules/accounting/ExpensesPage';
import { OtherPurchasesPage } from '../../modules/accounting/OtherPurchasesPage';
import { HRPage } from '../../modules/hr/HRPage';
import { LeaveTypesPage } from '../../modules/hr/LeaveTypesPage';
import { LeaveApplicationsPage } from '../../modules/hr/LeaveApplicationsPage';
import { POSPage } from '../../modules/pos/POSPage';
import { TokenManagementPage } from '../../modules/token-management/TokenManagementPage';
import { GenericModulePage } from '../../modules/common/GenericModulePage';
import { PurchaseOrdersPage } from '../../modules/inventory/PurchaseOrdersPage';
import { PurchasePage } from '../../modules/inventory/PurchasePage';
import { PurchaseReturnPage } from '../../modules/inventory/PurchaseReturnPage';
import { StockTakingPage } from '../../modules/stock/StockTakingPage';
import { StockAdjustmentsPage } from '../../modules/stock/StockAdjustmentsPage';
import { StockAdjustmentVerificationPage } from '../../modules/stock/StockAdjustmentVerificationPage';
import { WastagePage } from '../../modules/inventory/WastagePage';
import { GRNPage } from '../../modules/inventory/GRNPage';
import { GRTNPage } from '../../modules/inventory/GRTNPage';
import { ConsignmentPage } from '../../modules/inventory/ConsignmentPage';
import { ConsignmentReturnPage } from '../../modules/inventory/ConsignmentReturnPage';
import { ProductConversionsPage } from '../../modules/inventory/ProductConversionsPage';
import { ProductionRequestPage } from '../../modules/inventory/ProductionRequestPage';
import { ProductionPlanPage } from '../../modules/inventory/ProductionPlanPage';
import { ProductionPage } from '../../modules/inventory/ProductionPage';
import { InternalConsumptionsPage } from '../../modules/inventory/InternalConsumptionsPage';
import { CustomerPriceListPage } from '../../modules/inventory/CustomerPriceListPage';
import { QuotationsPage } from '../../modules/trading/QuotationsPage';
import { SalesOrdersPage } from '../../modules/trading/SalesOrdersPage';
import { SalesInvoicesPage } from '../../modules/trading/SalesInvoicesPage';
import { SalesReturnPage } from '../../modules/trading/SalesReturnPage';
import { JobOrdersPage } from '../../modules/trading/JobOrdersPage';
import { DeliveryReceiptsPage } from '../../modules/trading/DeliveryReceiptsPage';
import { RoutesPage } from '../../modules/trading/RoutesPage';
import { LoadingConfirmationPage } from '../../modules/trading/LoadingConfirmationPage';
import { PickListPage } from '../../modules/trading/PickListPage';
import { CouponMasterPage } from '../../modules/trading/CouponMasterPage';
import { PrintedCouponsPage } from '../../modules/trading/PrintedCouponsPage';
import { SaleSessionsPage } from '../../modules/trading/SaleSessionsPage';
import { FleetPage } from '../../modules/trading/FleetPage';
import { StockOnLoadReloadPage } from '../../modules/trading/StockOnLoadReloadPage';
import { StockOffLoadPage } from '../../modules/trading/StockOffLoadPage';
import { VanStockPage } from '../../modules/trading/VanStockPage';
import { SaleStockReportsPage } from '../../modules/trading/SaleStockReportsPage';
import { VanDiscountOTPPage } from '../../modules/trading/VanDiscountOTPPage';
import { VanRouteTrackPage } from '../../modules/trading/VanRouteTrackPage';
import { VanAssetPage } from '../../modules/trading/VanAssetPage';

import { TaxesPage } from '../../modules/reports/TaxesPage';
import { LogsPage } from '../../modules/reports/LogsPage';
import { AllReportsPage } from '../../modules/reports/AllReportsPage';
import { CustomReportsPage } from '../../modules/reports/CustomReportsPage';
import { SalesReportsPage } from '../../modules/reports/SalesReportsPage';
import { SalesPage } from '../../modules/reports/SalesPage';
import { SalesProfitPage } from '../../modules/reports/SalesProfitPage';
import { DaySummaryPage } from '../../modules/reports/DaySummaryPage';
import { HourlyReportPage } from '../../modules/reports/HourlyReportPage';
import { CashDropPayoutPage } from '../../modules/reports/CashDropPayoutPage';
import { DiscountsPage } from '../../modules/reports/DiscountsPage';
import { POSReturnPage } from '../../modules/reports/POSReturnPage';
import { CreditNotePage } from '../../modules/reports/CreditNotePage';
import { MISReportPage } from '../../modules/reports/MISReportPage';
import { ProductionReportPage } from '../../modules/reports/ProductionReportPage';
import { ProductWiseCommissionReportPage } from '../../modules/reports/ProductWiseCommissionReportPage';
import { WholesaleReportsPage } from '../../modules/reports/WholesaleReportsPage';
import { PurchaseReportsPage } from '../../modules/reports/PurchaseReportsPage';
import { LocationSaleReturnReportPage } from '../../modules/reports/LocationSaleReturnReportPage';
import { LocationPurchaseReturnReportPage } from '../../modules/reports/LocationPurchaseReturnReportPage';

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
                  <Route path="/batch-barcode" element={<BatchBarcodePage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/brands" element={<BrandsPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/stock" element={<StockPage />} />
                  <Route path="/warehouses" element={<WarehousesPage />} />
                  <Route path="/stock-transfers" element={<StockTransfersPage />} />
                  <Route path="/stock-requisitions" element={<StockRequisitionsPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/suppliers" element={<VendorsPage />} />
                  <Route path="/vendors" element={<VendorsPage />} />
                  <Route path="/accounting" element={<AccountingPage />} />
                  <Route path="/hr" element={<HRPage />} />
                  <Route path="/leave-types" element={<LeaveTypesPage />} />
                  <Route path="/leave" element={<LeaveApplicationsPage />} />
                  <Route path="/pos" element={<POSPage />} />

                  {/* Catalog & Register masters extensions */}
                  <Route path="/colors" element={<GenericModulePage title="Product Colors" subtitle="Color master attributes" entityName="Color" items={[{ id: '1', code: 'CLR-RED', name: 'Standard Red', status: 'ACTIVE' }]} />} />
                  <Route path="/subcategories" element={<SubCategoriesPage />} />
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
                  <Route path="/grtn" element={<GRTNPage />} />
                  <Route path="/purchase" element={<PurchasePage />} />
                  <Route path="/purchase-returns" element={<PurchaseReturnPage />} />
                  <Route path="/consignment" element={<ConsignmentPage />} />
                  <Route path="/consignment-return" element={<ConsignmentReturnPage />} />
                  <Route path="/stock-taking" element={<StockTakingPage />} />
                  <Route path="/stock-adjustments" element={<StockAdjustmentsPage />} />
                  <Route path="/stock-adjustment-verification" element={<StockAdjustmentVerificationPage />} />
                  <Route path="/wastage" element={<WastagePage />} />
                  <Route path="/product-conversions" element={<ProductConversionsPage />} />
                  <Route path="/production-requests" element={<ProductionRequestPage />} />
                  <Route path="/production-plans" element={<ProductionPlanPage />} />
                  <Route path="/production" element={<ProductionPage />} />
                  <Route path="/internal-consumptions" element={<InternalConsumptionsPage />} />
                  <Route path="/customer-price-list" element={<CustomerPriceListPage />} />
                  <Route path="/trading" element={<QuotationsPage />} />
                  <Route path="/sales" element={<SalesOrdersPage />} />
                  <Route path="/sales-invoices" element={<SalesInvoicesPage />} />
                  <Route path="/payments" element={<PaymentVouchersPage />} />
                  <Route path="/accounting/account-groups" element={<AccountGroupsPage />} />
                  <Route path="/accounting/ledger-groups" element={<LedgerGroupsPage />} />
                  <Route path="/accounting/cost-centers" element={<CostCentersPage />} />
                  <Route path="/accounting/ledgers" element={<LedgersPage />} />
                  <Route path="/accounting/journal-vouchers" element={<JournalVouchersPage />} />
                  <Route path="/accounting/multiple-payment-vouchers" element={<MultiplePaymentVouchersPage />} />
                  <Route path="/accounting/advance-receipts" element={<AdvanceReceiptsPage />} />
                  <Route path="/accounting/receipt-vouchers" element={<ReceiptVouchersPage />} />
                  <Route path="/accounting/contra-vouchers" element={<ContraVouchersPage />} />
                  <Route path="/accounting/other-payments" element={<OtherPaymentsPage />} />
                  <Route path="/accounting/other-receipts" element={<OtherReceiptsPage />} />
                  <Route path="/accounting/bank-reconciliation" element={<BankReconciliationPage />} />
                  <Route path="/accounting/credit-memo" element={<CreditMemoPage />} />
                  <Route path="/accounting/deferred-expenses" element={<DeferredExpensesPage />} />
                  <Route path="/accounting/depreciation-entry" element={<DepreciationEntryPage />} />
                  <Route path="/accounting/rebate-calculation" element={<RebateCalculationPage />} />
                  <Route path="/accounting/inter-costcenter-transfers" element={<InterCostCenterTransfersPage />} />
                  <Route path="/accounting/expenses" element={<ExpensesPage />} />
                  <Route path="/accounting/other-purchases" element={<OtherPurchasesPage />} />
                  <Route path="/accounting/pnl-reports" element={<PnLReportsPage />} />
                  <Route path="/returns" element={<SalesReturnPage />} />
                  <Route path="/job-orders" element={<JobOrdersPage />} />
                  <Route path="/delivery-receipts" element={<DeliveryReceiptsPage />} />
                  <Route path="/routes" element={<RoutesPage />} />
                  <Route path="/loading-confirmation" element={<LoadingConfirmationPage />} />
                  <Route path="/pick-list" element={<PickListPage />} />
                  <Route path="/coupon-master" element={<CouponMasterPage />} />
                  <Route path="/printed-coupons" element={<PrintedCouponsPage />} />
                  <Route path="/sale-sessions" element={<SaleSessionsPage />} />
                  <Route path="/fleet" element={<FleetPage />} />
                  <Route path="/stock-onload-reload" element={<StockOnLoadReloadPage />} />
                  <Route path="/stock-offload" element={<StockOffLoadPage />} />
                  <Route path="/van-stock" element={<VanStockPage />} />
                  <Route path="/sale-stock-reports" element={<SaleStockReportsPage />} />
                  <Route path="/van-discount-otp" element={<VanDiscountOTPPage />} />
                  <Route path="/van-route-track" element={<VanRouteTrackPage />} />
                  <Route path="/van-asset" element={<VanAssetPage />} />

                  {/* ERP Operations & Admin */}
                  <Route path="/stock-adjustments" element={<GenericModulePage title="Stock Adjustments" subtitle="Stock take count & shrinkage" entityName="Adjustment" items={[{ id: '1', code: 'ADJ-88', name: 'Damaged Goods Write-off', amount: 350.00, status: 'APPROVED' }]} />} />
                  <Route path="/attendance" element={<GenericModulePage title="Attendance" subtitle="Biometric timecards" entityName="Timecard" items={[{ id: '1', code: 'ATT-001', name: 'Ahmed Al-Mansouri - Check-in 08:00', status: 'PRESENT' }]} />} />
                  <Route path="/payroll" element={<GenericModulePage title="Payroll & WPS" subtitle="Qatar WPS Salary Generator" entityName="Payroll Run" items={[{ id: '1', code: 'PAY-2026-08', name: 'Monthly WPS Salary Sheet August 2026', amount: 185000.00, status: 'PROCESSED' }]} />} />
                  <Route path="/assets" element={<GenericModulePage title="Asset Management" subtitle="Fixed Assets" entityName="Asset" items={[{ id: '1', code: 'AST-01', name: 'Thermal Receipt Printer POS-01', amount: 1200.00, status: 'ACTIVE' }]} />} />
                  <Route path="/audit" element={<LogsPage />} />
                  <Route path="/reports/taxes" element={<TaxesPage />} />
                  <Route path="/reports/all" element={<AllReportsPage />} />
                  <Route path="/reports/custom" element={<CustomReportsPage />} />
                  <Route path="/reports/sales-reports" element={<SalesReportsPage />} />
                  <Route path="/reports/sales" element={<SalesPage />} />
                  <Route path="/reports/sales-profit" element={<SalesProfitPage />} />
                  <Route path="/reports/day-summary" element={<DaySummaryPage />} />
                  <Route path="/reports/hourly" element={<HourlyReportPage />} />
                  <Route path="/reports/cash-drop-payout" element={<CashDropPayoutPage />} />
                  <Route path="/reports/discounts" element={<DiscountsPage />} />
                  <Route path="/reports/pos-return" element={<POSReturnPage />} />
                  <Route path="/reports/credit-note" element={<CreditNotePage />} />
                  <Route path="/reports/mis" element={<MISReportPage />} />
                  <Route path="/reports/production" element={<ProductionReportPage />} />
                  <Route path="/reports/product-wise-commission" element={<ProductWiseCommissionReportPage />} />
                  <Route path="/reports/wholesale" element={<WholesaleReportsPage />} />
                  <Route path="/reports/purchase-reports" element={<PurchaseReportsPage />} />
                  <Route path="/reports/location-sale-return" element={<LocationSaleReturnReportPage />} />
                  <Route path="/reports/location-purchase-return" element={<LocationPurchaseReturnReportPage />} />
                  <Route path="/notifications" element={<GenericModulePage title="Notifications Inbox" subtitle="System alerts" entityName="Notification" items={[{ id: '1', code: 'NTF-01', name: 'Low Stock Warning: Rayyan Water 500ml', status: 'UNREAD' }]} />} />
                  <Route path="/approvals" element={<GenericModulePage title="Approvals Queue" subtitle="Authorization requests" entityName="Approval" items={[{ id: '1', code: 'APP-102', name: 'Approval Request: PO > QAR 50,000', amount: 85000.00, status: 'PENDING' }]} />} />
                  <Route path="/token-management" element={<TokenManagementPage />} />
                  <Route path="/token-actions" element={<TokenManagementPage />} />
                  <Route path="/announcement-config" element={<TokenManagementPage />} />
                  <Route path="/token-reports" element={<TokenManagementPage />} />

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

