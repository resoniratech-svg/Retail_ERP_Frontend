import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Search, Eye, CheckSquare, XCircle, FileBox } from 'lucide-react';

const STORAGE_KEY = 'retail_erp_stock_adjustments';
const CURRENT_USER = 'Ahmed Al-Mansouri (SUPER_ADMIN)';

type StockAdjustmentStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'POSTED' | 'REJECTED' | 'CANCELLED';
type AdjustmentType = 'Increase' | 'Decrease';

interface StockAdjustmentItem {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  unit: string;
  systemQty: number;
  adjustmentQty: number;
  adjustedQty: number;
  unitCost: number;
  adjustmentValue: number;
  reason: string;
}

interface StockAdjustment {
  id: string;
  adjustmentNo: string;
  warehouseId: string;
  warehouseName: string;
  adjustmentDate: string;
  adjustmentType: AdjustmentType;
  reason: string;
  reference: string;
  notes: string;
  
  items: StockAdjustmentItem[];
  
  totalItems: number;
  totalAdjustmentValue: number;
  
  status: StockAdjustmentStatus;
  
  // Audit properties
  createdDate: string;
  createdBy: string;
  submittedDate?: string;
  submittedBy?: string;
  approvedDate?: string;
  approvedBy?: string;
  postedDate?: string;
  postedBy?: string;
  rejectedDate?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

export const StockAdjustmentVerificationPage: React.FC = () => {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<StockAdjustment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const saData = localStorage.getItem(STORAGE_KEY);
      if (saData) {
        setAdjustments(JSON.parse(saData));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveRecords = (data: StockAdjustment[]) => {
    setAdjustments(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const getStatusBadge = (status: StockAdjustmentStatus) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="neutral">Draft</Badge>;
      case 'PENDING_APPROVAL': return <Badge variant="warning">Pending Approval</Badge>;
      case 'APPROVED': return <Badge variant="info">Verified</Badge>;
      case 'POSTED': return <Badge variant="success">Posted</Badge>;
      case 'REJECTED': return <Badge variant="danger">Rejected</Badge>;
      case 'CANCELLED': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleStatusChange = (r: StockAdjustment, newStatus: StockAdjustmentStatus, reason?: string) => {
    if (newStatus === 'APPROVED' && !confirm(`Are you sure you want to verify adjustment ${r.adjustmentNo}?`)) {
      return;
    }

    const updated = adjustments.map(sa => {
      if (sa.id === r.id) {
        const copy = { ...sa, status: newStatus };
        const now = new Date().toISOString();
        if (newStatus === 'APPROVED') {
          copy.approvedBy = CURRENT_USER;
          copy.approvedDate = now;
        } else if (newStatus === 'REJECTED') {
          copy.rejectedBy = CURRENT_USER;
          copy.rejectedDate = now;
          copy.rejectionReason = reason;
        } else if (newStatus === 'POSTED') {
          copy.postedBy = CURRENT_USER;
          copy.postedDate = now;
        }
        return copy;
      }
      return sa;
    });
    saveRecords(updated);
    setIsViewModalOpen(false);
    setIsRejecting(false);
    setRejectionReason('');
  };

  const handleRejectSubmit = () => {
    if (!rejectionReason.trim()) {
      alert("Rejection reason is required.");
      return;
    }
    if (activeRecord) {
      handleStatusChange(activeRecord, 'REJECTED', rejectionReason);
    }
  };

  const filteredRecords = adjustments.filter(sa => {
    // Only show relevant statuses in verification queue by default if not 'ALL'
    // Specifically hide DRAFT and CANCELLED unless searched? Requirements: "intercept PENDING_APPROVAL"
    // We will show all, but PENDING_APPROVAL is the main actionable one.
    if (statusFilter !== 'ALL' && sa.status !== statusFilter) return false;
    
    // Default queue view might just be PENDING_APPROVAL if ALL is selected, but user asked for status filter.
    // Let's show everything so they can see past verified ones.

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return sa.adjustmentNo.toLowerCase().includes(q) || 
             sa.warehouseName.toLowerCase().includes(q) ||
             sa.reason.toLowerCase().includes(q) ||
             sa.createdBy.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Adjustment Verification</h1>
          <p className="text-sm text-slate-500">Review and verify stock adjustment transactions before posting.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={loadData}>
            Refresh
          </Button>
        </div>
      </div>

      <Card className="p-4 flex flex-wrap items-center justify-start gap-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search adjustment no, warehouse, reason, user..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>
        <div className="w-full md:w-48">
          <Select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'PENDING_APPROVAL', label: 'Pending Verification' },
              { value: 'APPROVED', label: 'Verified' },
              { value: 'POSTED', label: 'Posted' },
              { value: 'REJECTED', label: 'Rejected' }
            ]}
          />
        </div>
      </Card>

      <Card className="p-0 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-[11px] font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 whitespace-nowrap">Adjustment #</th>
              <th className="p-4 whitespace-nowrap">Warehouse</th>
              <th className="p-4 whitespace-nowrap">Adjustment Date</th>
              <th className="p-4 whitespace-nowrap">Reason</th>
              <th className="p-4 text-center whitespace-nowrap">SKU Count</th>
              <th className="p-4 text-right whitespace-nowrap">Adjustment Value</th>
              <th className="p-4 whitespace-nowrap">Created By</th>
              <th className="p-4 text-center whitespace-nowrap">Status</th>
              <th className="p-4 text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {filteredRecords.length > 0 ? filteredRecords.map((sa) => (
              <tr key={sa.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-mono font-bold text-xs">{sa.adjustmentNo}</td>
                <td className="p-4 font-medium">{sa.warehouseName}</td>
                <td className="p-4 text-xs">{sa.adjustmentDate}</td>
                <td className="p-4 text-slate-600">
                  {sa.adjustmentType === 'Increase' ? 
                    <span className="text-emerald-600 font-bold mr-1">↑</span> : 
                    <span className="text-rose-600 font-bold mr-1">↓</span>
                  }
                  {sa.reason}
                </td>
                <td className="p-4 text-center font-semibold">{sa.totalItems}</td>
                <td className="p-4 text-right font-bold text-slate-700">
                  ${sa.totalAdjustmentValue.toFixed(2)}
                </td>
                <td className="p-4 text-xs text-slate-500">{sa.createdBy}</td>
                <td className="p-4 text-center">{getStatusBadge(sa.status)}</td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600" onClick={() => { setActiveRecord(sa); setIsRejecting(false); setIsViewModalOpen(true); }} title={sa.status === 'PENDING_APPROVAL' ? 'Verify' : 'View'}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {sa.status === 'PENDING_APPROVAL' && (
                      <>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-600" onClick={() => handleStatusChange(sa, 'APPROVED')} title="Verify">
                          <CheckSquare className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600" onClick={() => { setActiveRecord(sa); setIsRejecting(true); setIsViewModalOpen(true); }} title="Reject">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {sa.status === 'APPROVED' && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700" onClick={() => handleStatusChange(sa, 'POSTED')} title="Post">
                        <FileBox className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500">
                  No stock adjustments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* --- VIEW / VERIFY MODAL --- */}
      {isViewModalOpen && activeRecord && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Stock Adjustment Verification: ${activeRecord.adjustmentNo}`}
          className="max-w-[1000px]"
        >
          <div className="w-full p-4 md:p-6 overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">{activeRecord.adjustmentNo}</h2>
                <p className="text-sm text-slate-500">Warehouse: <span className="font-semibold text-slate-700">{activeRecord.warehouseName}</span></p>
                <p className="text-xs text-slate-500">Adjustment Date: {activeRecord.adjustmentDate} | Type: {activeRecord.adjustmentType}</p>
                <p className="text-xs text-slate-800 font-semibold mt-2">Reason: {activeRecord.reason}</p>
              </div>
              {getStatusBadge(activeRecord.status)}
            </div>
            
            {(activeRecord.reference || activeRecord.notes || activeRecord.rejectionReason) && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                {activeRecord.reference && <p className="text-sm mb-2"><span className="font-bold">Reference:</span> {activeRecord.reference}</p>}
                {activeRecord.notes && <p className="text-sm"><span className="font-bold">Notes:</span> {activeRecord.notes}</p>}
                {activeRecord.rejectionReason && <p className="text-sm mt-2 pt-2 border-t border-rose-200 text-rose-700"><span className="font-bold">Rejection Reason:</span> {activeRecord.rejectionReason}</p>}
              </div>
            )}

            <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Adjustment Items</h3>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto mb-8">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="p-3">Product / SKU</th>
                    <th className="p-3 text-right">Sys Qty</th>
                    <th className="p-3 text-right">Adj Qty</th>
                    <th className="p-3 text-right">Adjusted Qty</th>
                    <th className="p-3 text-right">Unit Cost</th>
                    <th className="p-3 text-right">Adj Value</th>
                    <th className="p-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activeRecord.items.map(item => (
                    <tr key={item.id}>
                      <td className="p-3">
                        <div className="font-mono">{item.sku}</div>
                        <div className="font-medium text-slate-700">{item.productName}</div>
                      </td>
                      <td className="p-3 text-right">{item.systemQty}</td>
                      <td className="p-3 text-right font-bold">
                        <span className={activeRecord.adjustmentType === 'Decrease' ? "text-rose-600" : "text-emerald-600"}>
                          {activeRecord.adjustmentType === 'Increase' ? '+' : '-'}{item.adjustmentQty}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-800">{item.adjustedQty}</td>
                      <td className="p-3 text-right">${item.unitCost.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-slate-700">${item.adjustmentValue.toFixed(2)}</td>
                      <td className="p-3 text-slate-600">{item.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 font-bold text-slate-700">
                  <tr>
                    <td colSpan={5} className="p-3 text-right">Total Adjustment Value:</td>
                    <td className="p-3 text-right">${activeRecord.totalAdjustmentValue.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <h3 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">Audit Information</h3>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Created</span>
                <span className="font-medium">{activeRecord.createdBy} <span className="text-xs text-slate-400">({new Date(activeRecord.createdDate).toLocaleString()})</span></span>
              </div>
              {activeRecord.submittedBy && (
                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Submitted</span>
                  <span className="font-medium">{activeRecord.submittedBy} <span className="text-xs text-slate-400">({new Date(activeRecord.submittedDate!).toLocaleString()})</span></span>
                </div>
              )}
              {activeRecord.approvedBy && (
                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Verified By</span>
                  <span className="font-medium">{activeRecord.approvedBy} <span className="text-xs text-slate-400">({new Date(activeRecord.approvedDate!).toLocaleString()})</span></span>
                </div>
              )}
              {activeRecord.rejectedBy && (
                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Rejected By</span>
                  <span className="font-medium text-rose-600">{activeRecord.rejectedBy} <span className="text-xs text-rose-400">({new Date(activeRecord.rejectedDate!).toLocaleString()})</span></span>
                </div>
              )}
              {activeRecord.postedBy && (
                <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Posted By</span>
                  <span className="font-medium text-emerald-600">{activeRecord.postedBy} <span className="text-xs text-emerald-400">({new Date(activeRecord.postedDate!).toLocaleString()})</span></span>
                </div>
              )}
            </div>

            {isRejecting ? (
              <div className="mt-6 p-4 border border-rose-200 bg-rose-50 rounded-lg">
                <h4 className="font-bold text-rose-800 mb-2">Provide Rejection Reason</h4>
                <Input 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                />
                <div className="mt-4 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsRejecting(false)}>Cancel</Button>
                  <Button variant="primary" className="bg-rose-600 hover:bg-rose-700" onClick={handleRejectSubmit}>Confirm Reject</Button>
                </div>
              </div>
            ) : (
              <div className="mt-8 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                {activeRecord.status === 'PENDING_APPROVAL' && (
                  <>
                    <Button variant="primary" className="bg-rose-600 hover:bg-rose-700" onClick={() => setIsRejecting(true)}>Reject</Button>
                    <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusChange(activeRecord, 'APPROVED')}>Verify</Button>
                  </>
                )}
                {activeRecord.status === 'APPROVED' && (
                  <Button variant="primary" onClick={() => handleStatusChange(activeRecord, 'POSTED')}>Post Adjustment</Button>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

    </div>
  );
};
