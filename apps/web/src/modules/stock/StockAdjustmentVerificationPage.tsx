import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@qatar-erp/ui';
import { Search, Eye, CheckSquare, XCircle, FileBox, Save, UploadCloud, X } from 'lucide-react';

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
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
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
    <div className="flex flex-col h-full bg-[#f0f4f8]">
        <div className="flex flex-col h-full gap-2">
          <div className="flex flex-col border border-slate-300 dark:border-slate-700 rounded-sm bg-[#f1f5f9] dark:bg-slate-800 shadow-sm">
            {/* Top Action Bar */}
            <div className="flex flex-wrap items-center justify-between p-1 border-b border-slate-300 dark:border-slate-700">
              <div className="flex items-center">
                <button className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <FileBox className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print</span>
                </button>
              </div>
              
              <div className="flex items-center gap-2 pr-2">
                <Button variant="outline" className="py-1 px-2 text-xs h-7 flex items-center gap-1 font-bold bg-white" onClick={loadData}>
                  Refresh
                </Button>
                <Button variant="primary" className="py-1 px-2 text-xs h-7 flex items-center gap-1 font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-0" onClick={() => setIsFormModalOpen(true)}>
                  <CheckSquare className="w-3.5 h-3.5" /> Stock Adjustment Verification
                </Button>
              </div>
            </div>

            {/* Header */}
            <div className="bg-slate-200 text-slate-700 text-center text-[11px] font-bold py-1 border-b border-slate-300">
              Stock Adjustments Verification
            </div>

            {/* Search Bar Row */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900 border-b border-slate-300">
              <input
                type="text"
                placeholder="Enter text to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-primary-500 ml-1"
              />
              <button className="px-4 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-50 shadow-sm text-slate-700 font-medium">
                Find
              </button>
              <button 
                className="px-4 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-50 shadow-sm text-slate-700 font-medium"
                onClick={() => setSearchTerm('')}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-300 rounded-sm relative">
            <div className="flex-1 overflow-auto flex flex-col relative">
              <table className="w-full h-full text-left text-[11px] whitespace-nowrap min-w-max border-collapse">
                <thead className="bg-slate-100 uppercase font-semibold text-slate-700 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="p-4">Ref No</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Location Name</th>
                    <th className="p-4">Narration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length > 0 ? filteredRecords.map((sa, idx) => (
                    <tr 
                      key={sa.id} 
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}
                    >
                      <td className="p-4 text-blue-600">{sa.adjustmentNo}</td>
                      <td className="p-4">{sa.adjustmentDate}</td>
                      <td className="p-4">{sa.warehouseName}</td>
                      <td className="p-4 truncate max-w-[300px]" title={sa.reason}>{sa.reason}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500 italic">No stock adjustments found.</td>
                    </tr>
                  )}
                  {/* Filler row to push empty space to bottom */}
                  <tr className="h-full">
                    <td colSpan={4}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {/* --- STOCK ADJUSTMENT VERIFICATION FORM MODAL --- */}
      {isFormModalOpen && (
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title="Stock Adjustment Verification"
          className="max-w-[1200px]"
        >
          <div className="relative bg-[#f0f4f8] flex flex-col h-[80vh] w-full border border-slate-300 dark:border-slate-800 shadow-sm">

          {/* Top Action Bar */}
          <div className="flex items-center gap-1 px-2 py-1 bg-[#f1f5f9] border-b border-slate-300">
            <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => setIsFormModalOpen(false)}>
              <Save className="w-4 h-4 text-blue-600 mb-0.5" />
              <span>Save</span>
            </button>
            <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => setIsFormModalOpen(false)}>
              <Save className="w-4 h-4 text-blue-600 mb-0.5" />
              <span>Save & New</span>
            </button>
            <button className="flex flex-col items-center px-3 py-1 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-sm text-[10px] text-slate-700" onClick={() => setIsFormModalOpen(false)}>
              <Save className="w-4 h-4 text-green-600 mb-0.5" />
              <span>Save & Close</span>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-2 bg-[#f0f4f8] flex flex-col gap-2 [&::-webkit-scrollbar]:hidden">
            
            {/* Details Section */}
            <div className="bg-[#f0f4f8] border-b border-slate-300 pb-2 flex flex-col gap-2">
              
              {/* Row 1 */}
              <div className="flex items-end gap-3 pl-1">
                <div className="flex flex-col gap-1 w-[130px]">
                  <label className="text-[11px] font-medium text-slate-700">Date</label>
                  <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full text-xs h-6 border border-slate-300 px-2 bg-white" />
                </div>
                <div className="flex flex-col gap-1 w-[200px]">
                  <label className="text-[11px] font-medium text-slate-700">Location</label>
                  <select className="w-full text-xs h-6 border border-slate-300 px-1 bg-white text-slate-600">
                    <option value="Saudi Arabia">Saudi Arabia</option>
                  </select>
                </div>
                <Button variant="outline" className="h-6 px-3 text-[11px] font-bold bg-white border-slate-300 flex items-center gap-1">
                   <UploadCloud className="w-3 h-3" /> Import from File
                </Button>
              </div>

              {/* Row 2 */}
              <div className="flex items-start gap-4 pl-1 mt-1">
                <div className="flex flex-col gap-1 flex-1 max-w-[500px]">
                  <label className="text-[11px] font-medium text-slate-700">Notes</label>
                  <textarea 
                    className="w-full text-xs border border-slate-300 p-1 bg-white min-h-[40px] resize-y" 
                  />
                </div>

                <div className="flex gap-4 items-end h-[40px] mt-auto pb-1 ml-auto">
                  <Button variant="outline" className="h-7 px-3 text-[11px] font-bold bg-white border-slate-300 flex items-center gap-1 text-rose-600">
                    <X className="w-3 h-3" /> Remove F2
                  </Button>
                </div>
              </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 min-h-[300px] bg-white border border-slate-300 rounded-sm relative flex flex-col">
              <div className="flex-1 overflow-auto flex flex-col relative">
                <table className="w-full h-full text-left text-[11px] whitespace-nowrap min-w-max border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-semibold text-slate-700 border-b border-slate-300 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="p-2 border-r border-slate-200">Code</th>
                      <th className="p-2 border-r border-slate-200">Barcode</th>
                      <th className="p-2 border-r border-slate-200">Product</th>
                      <th className="p-2 border-r border-slate-200">Unit</th>
                      <th className="p-2 border-r border-slate-200">UOM</th>
                      <th className="p-2 border-r border-slate-200 text-right">Cost</th>
                      <th className="p-2 border-r border-slate-200 text-right">Avg Cost</th>
                      <th className="p-2 border-r border-slate-200 text-right">Crnt Qty</th>
                      <th className="p-2 border-r border-slate-200 text-right">New Qty</th>
                      <th className="p-2 border-r border-slate-200 text-right">Difference</th>
                      <th className="p-2 border-r border-slate-200 text-right">Diff Value</th>
                      <th className="p-2 border-slate-200">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-white h-8">
                      <td className="p-1 px-2 border-r border-slate-200 font-bold text-slate-400"></td>
                      <td className="p-1 px-2 border-r border-slate-200"></td>
                      <td className="p-1 px-2 border-r border-slate-200"></td>
                      <td className="p-1 px-2 border-r border-slate-200"></td>
                      <td className="p-1 px-2 border-r border-slate-200"></td>
                      <td className="p-1 px-2 border-r border-slate-200"></td>
                      <td className="p-1 px-2 border-r border-slate-200"></td>
                      <td className="p-1 px-2 border-r border-slate-200"></td>
                      <td className="p-1 px-2 border-r border-slate-200"></td>
                      <td className="p-1 px-2 border-r border-slate-200"></td>
                      <td className="p-1 px-2 border-r border-slate-200"></td>
                      <td className="p-1 px-2 border-slate-200"></td>
                    </tr>
                    {/* Filler row */}
                    <tr className="h-full">
                      <td colSpan={12} className="border-r border-slate-200"></td>
                    </tr>
                  </tbody>
                  {/* Table Footer */}
                  <tfoot className="sticky bottom-0 bg-slate-100 dark:bg-slate-800 border-t border-slate-300 z-10 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
                    <tr>
                      <td colSpan={7}></td>
                      <td className="p-1 align-middle text-right border-r border-slate-200">
                        <input type="text" value="0.00" readOnly className="w-full min-w-[50px] max-w-[80px] ml-auto px-2 py-1 text-xs text-right border border-slate-300 bg-white font-bold text-slate-800" />
                      </td>
                      <td className="p-1 align-middle text-right border-r border-slate-200">
                        <input type="text" value="0.00" readOnly className="w-full min-w-[50px] max-w-[80px] ml-auto px-2 py-1 text-xs text-right border border-slate-300 bg-white font-bold text-slate-800" />
                      </td>
                      <td className="p-1 align-middle text-right border-r border-slate-200">
                        <input type="text" value="0.00" readOnly className="w-full min-w-[50px] max-w-[80px] ml-auto px-2 py-1 text-xs text-right border border-slate-300 bg-white font-bold text-slate-800" />
                      </td>
                      <td className="p-1 align-middle text-right border-r border-slate-200">
                        <input type="text" value="0.00" readOnly className="w-full min-w-[50px] max-w-[80px] ml-auto px-2 py-1 text-xs text-right border border-slate-300 bg-white font-bold text-slate-800" />
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          {/* Bottom Navigation Strip */}
          <div className="flex items-center gap-1 px-2 py-1 bg-[#e2e8f0] border-t border-slate-300 text-[11px] text-slate-700 shrink-0">
            <button className="px-1.5 hover:bg-slate-300 rounded font-bold">|&lt;&lt;</button>
            <button className="px-1.5 hover:bg-slate-300 rounded font-bold">&lt;&lt;</button>
            <span className="mx-1">Record 0 of 0</span>
            <button className="px-1.5 hover:bg-slate-300 rounded font-bold">&gt;&gt;</button>
            <button className="px-1.5 hover:bg-slate-300 rounded font-bold">&gt;&gt;|</button>
            <button className="px-1.5 hover:bg-slate-300 rounded font-bold ml-2">+</button>
            <button className="px-1.5 hover:bg-slate-300 rounded font-bold">-</button>
            <button className="px-1.5 hover:bg-slate-300 rounded text-emerald-600 font-bold ml-1">✓</button>
            <button className="px-1.5 hover:bg-slate-300 rounded text-slate-700 font-bold">✕</button>
          </div>
          </div>
        </Modal>
      )}

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
