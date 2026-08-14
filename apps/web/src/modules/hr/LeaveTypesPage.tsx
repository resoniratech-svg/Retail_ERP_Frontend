import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Check,
  Users,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Briefcase,
  Paperclip,
  CheckSquare,
  HelpCircle,
  Layers,
} from 'lucide-react';

export interface LeaveType {
  id: string;
  code: string;
  name: string;
  description?: string;
  isPaid: boolean;
  annualEntitlement: number;
  accrualType: 'Monthly' | 'Yearly' | 'None';
  accrualDays: number;
  carryForwardAllowed: boolean;
  maxCarryForwardDays?: number;
  encashmentAllowed: 'Allowed' | 'Not Allowed';
  requiresApproval: boolean;
  requiresAttachment: boolean;
  applicableType: 'All Employees' | 'Department' | 'Designation' | 'Specific Employees';
  applicableTarget?: string;
  genderEligibility: 'All' | 'Male' | 'Female';
  status: 'Active' | 'Inactive';
  createdAt?: string;
}

const STORAGE_KEY = 'qatar_erp_leave_types';

const DEFAULT_LEAVE_TYPES: LeaveType[] = [
  {
    id: 'lt-1',
    code: 'AL',
    name: 'Annual Paid Leave',
    description: 'Qatar Labor Law Article 79 standard 30 days annual paid vacation leave',
    isPaid: true,
    annualEntitlement: 30,
    accrualType: 'Monthly',
    accrualDays: 2.5,
    carryForwardAllowed: true,
    maxCarryForwardDays: 10,
    encashmentAllowed: 'Allowed',
    requiresApproval: true,
    requiresAttachment: false,
    applicableType: 'All Employees',
    genderEligibility: 'All',
    status: 'Active',
    createdAt: '2026-01-01',
  },
  {
    id: 'lt-2',
    code: 'SL',
    name: 'Sick Leave (Medical)',
    description: 'Paid medical leave requiring Qatar Ministry of Public Health doctor certificate',
    isPaid: true,
    annualEntitlement: 14,
    accrualType: 'Yearly',
    accrualDays: 14,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    encashmentAllowed: 'Not Allowed',
    requiresApproval: true,
    requiresAttachment: true,
    applicableType: 'All Employees',
    genderEligibility: 'All',
    status: 'Active',
    createdAt: '2026-01-01',
  },
  {
    id: 'lt-3',
    code: 'ML',
    name: 'Maternity Leave',
    description: 'Qatar Labor Law Article 96 fully paid maternity leave for female employees after 1 year service',
    isPaid: true,
    annualEntitlement: 50,
    accrualType: 'None',
    accrualDays: 0,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    encashmentAllowed: 'Not Allowed',
    requiresApproval: true,
    requiresAttachment: true,
    applicableType: 'All Employees',
    genderEligibility: 'Female',
    status: 'Active',
    createdAt: '2026-01-01',
  },
  {
    id: 'lt-4',
    code: 'EL',
    name: 'Emergency Unpaid Leave',
    description: 'Unpaid compassionate & emergency leave subject to HR & Management approval',
    isPaid: false,
    annualEntitlement: 10,
    accrualType: 'None',
    accrualDays: 0,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    encashmentAllowed: 'Not Allowed',
    requiresApproval: true,
    requiresAttachment: false,
    applicableType: 'All Employees',
    genderEligibility: 'All',
    status: 'Active',
    createdAt: '2026-01-01',
  },
  {
    id: 'lt-5',
    code: 'HJJ',
    name: 'Hajj Pilgrimage Leave',
    description: 'Special 21-day un-paid Hajj pilgrimage leave granted once during employment tenure',
    isPaid: false,
    annualEntitlement: 21,
    accrualType: 'None',
    accrualDays: 0,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    encashmentAllowed: 'Not Allowed',
    requiresApproval: true,
    requiresAttachment: true,
    applicableType: 'All Employees',
    genderEligibility: 'All',
    status: 'Active',
    createdAt: '2026-01-01',
  },
];

export const LeaveTypesPage: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load leave types from localStorage', e);
    }
    return DEFAULT_LEAVE_TYPES;
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [paidFilter, setPaidFilter] = useState<'All' | 'Paid' | 'Unpaid'>('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState<LeaveType | null>(null);
  const [editingItem, setEditingItem] = useState<LeaveType | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<LeaveType>>({
    code: '',
    name: '',
    description: '',
    isPaid: true,
    annualEntitlement: 30,
    accrualType: 'Monthly',
    accrualDays: 2.5,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    encashmentAllowed: 'Not Allowed',
    requiresApproval: true,
    requiresAttachment: false,
    applicableType: 'All Employees',
    applicableTarget: '',
    genderEligibility: 'All',
    status: 'Active',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leaveTypes));
    } catch (e) {
      console.error('Failed to save leave types to localStorage', e);
    }
  }, [leaveTypes]);

  // Filtered List
  const filteredLeaveTypes = leaveTypes.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesPaid =
      paidFilter === 'All' ||
      (paidFilter === 'Paid' && item.isPaid) ||
      (paidFilter === 'Unpaid' && !item.isPaid);

    return matchesSearch && matchesStatus && matchesPaid;
  });

  // Reset Form
  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      isPaid: true,
      annualEntitlement: 30,
      accrualType: 'Monthly',
      accrualDays: 2.5,
      carryForwardAllowed: false,
      maxCarryForwardDays: 0,
      encashmentAllowed: 'Not Allowed',
      requiresApproval: true,
      requiresAttachment: false,
      applicableType: 'All Employees',
      applicableTarget: '',
      genderEligibility: 'All',
      status: 'Active',
    });
    setFormErrors({});
    setEditingItem(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: LeaveType) => {
    setEditingItem(item);
    setFormData({ ...item });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Form Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code || !formData.code.trim()) {
      errors.code = 'Leave Type Code is required';
    } else {
      const codeUpper = formData.code.trim().toUpperCase();
      const existing = leaveTypes.find(
        (lt) => lt.code.toUpperCase() === codeUpper && lt.id !== editingItem?.id
      );
      if (existing) {
        errors.code = `Code "${codeUpper}" is already in use by ${existing.name}`;
      }
    }

    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Leave Type Name is required';
    }

    if (formData.annualEntitlement === undefined || formData.annualEntitlement < 0) {
      errors.annualEntitlement = 'Annual entitlement must be 0 or greater';
    }

    if (formData.accrualDays === undefined || formData.accrualDays < 0) {
      errors.accrualDays = 'Accrual days must be 0 or greater';
    }

    if (formData.carryForwardAllowed) {
      if (
        formData.maxCarryForwardDays === undefined ||
        formData.maxCarryForwardDays < 0 ||
        isNaN(formData.maxCarryForwardDays)
      ) {
        errors.maxCarryForwardDays = 'Max carry forward days must be 0 or greater';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formattedCode = (formData.code || '').trim().toUpperCase();

    if (editingItem) {
      setLeaveTypes((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                ...(formData as LeaveType),
                code: formattedCode,
              }
            : item
        )
      );
    } else {
      const newItem: LeaveType = {
        id: `lt-${Date.now()}`,
        code: formattedCode,
        name: formData.name!.trim(),
        description: formData.description || '',
        isPaid: formData.isPaid ?? true,
        annualEntitlement: Number(formData.annualEntitlement) || 0,
        accrualType: formData.accrualType || 'Monthly',
        accrualDays: Number(formData.accrualDays) || 0,
        carryForwardAllowed: formData.carryForwardAllowed ?? false,
        maxCarryForwardDays: formData.carryForwardAllowed
          ? Number(formData.maxCarryForwardDays) || 0
          : 0,
        encashmentAllowed: formData.encashmentAllowed || 'Not Allowed',
        requiresApproval: formData.requiresApproval ?? true,
        requiresAttachment: formData.requiresAttachment ?? false,
        applicableType: formData.applicableType || 'All Employees',
        applicableTarget: formData.applicableTarget || '',
        genderEligibility: formData.genderEligibility || 'All',
        status: formData.status || 'Active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setLeaveTypes((prev) => [newItem, ...prev]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  // Toggle Active / Inactive
  const handleToggleStatus = (id: string) => {
    setLeaveTypes((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
          : item
      )
    );
  };

  // Delete Handler
  const handleDelete = (id: string) => {
    setLeaveTypes((prev) => prev.filter((item) => item.id !== id));
    setDeleteConfirmId(null);
  };

  // Export Report
  const handleExportCSV = () => {
    const headers = [
      'Code',
      'Name',
      'Paid Leave',
      'Annual Entitlement (Days)',
      'Accrual Type',
      'Accrual Days',
      'Carry Forward Allowed',
      'Max Carry Forward (Days)',
      'Encashment Allowed',
      'Requires Approval',
      'Requires Attachment',
      'Applicable To',
      'Gender Eligibility',
      'Status',
    ];

    const rows = filteredLeaveTypes.map((lt) => [
      lt.code,
      `"${lt.name.replace(/"/g, '""')}"`,
      lt.isPaid ? 'Yes (Paid)' : 'No (Unpaid)',
      lt.annualEntitlement,
      lt.accrualType,
      lt.accrualDays,
      lt.carryForwardAllowed ? 'Yes' : 'No',
      lt.carryForwardAllowed ? lt.maxCarryForwardDays || 0 : 0,
      lt.encashmentAllowed,
      lt.requiresApproval ? 'Yes' : 'No',
      lt.requiresAttachment ? 'Yes' : 'No',
      lt.applicableType,
      lt.genderEligibility,
      lt.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Qatar_ERP_Leave_Types_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics
  const totalCount = leaveTypes.length;
  const activePaidCount = leaveTypes.filter((l) => l.status === 'Active' && l.isPaid).length;
  const unpaidCount = leaveTypes.filter((l) => !l.isPaid).length;
  const requireAttachmentCount = leaveTypes.filter((l) => l.requiresAttachment).length;

  return (
    <div className="space-y-6">
      {/* HEADER & TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-600" />
            <span>Leave Type Configuration</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise leave policy setup, annual entitlement parameters, accrual schedules, and Qatar Labor Law compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors border border-slate-200"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Leave Type</span>
          </button>
        </div>
      </div>

      {/* HR LEAVE WORKFLOW STAGE PIPELINE BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-4 text-white shadow-sm border border-slate-800">
        <div className="flex items-center justify-between mb-3 border-b border-slate-700/60 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Qatar ERP Enterprise HR Leave & Payroll Workflow</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Workflow Pipeline Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-2 text-center text-[11px]">
          <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-lg p-2 flex flex-col items-center justify-center">
            <span className="font-bold text-emerald-300">1. Leave Type Setup</span>
            <span className="text-[10px] text-emerald-400/80">Active Configuration</span>
          </div>
          <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-2 flex flex-col items-center justify-center">
            <span className="font-bold text-slate-300">2. Leave Allocation</span>
            <span className="text-[10px] text-slate-400">Annual Accrual Balance</span>
          </div>
          <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-2 flex flex-col items-center justify-center">
            <span className="font-bold text-slate-300">3. Application</span>
            <span className="text-[10px] text-slate-400">Employee Self-Service</span>
          </div>
          <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-2 flex flex-col items-center justify-center">
            <span className="font-bold text-slate-300">4. Approval</span>
            <span className="text-[10px] text-slate-400">Manager / HR Sign-off</span>
          </div>
          <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-2 flex flex-col items-center justify-center">
            <span className="font-bold text-slate-300">5. Balance Deducted</span>
            <span className="text-[10px] text-slate-400">Real-time Ledger</span>
          </div>
          <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-2 flex flex-col items-center justify-center">
            <span className="font-bold text-slate-300">6. Attendance Sync</span>
            <span className="text-[10px] text-slate-400">Biometric Timecard</span>
          </div>
          <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-2 flex flex-col items-center justify-center">
            <span className="font-bold text-slate-300">7. Payroll Impact</span>
            <span className="text-[10px] text-slate-400">Salary Calculation</span>
          </div>
        </div>
      </div>

      {/* METRICS SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Leave Types</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Active Paid Leaves</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{activePaidCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Unpaid Leave Types</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{unpaidCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Requires Attachment</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">{requireAttachmentCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Paperclip className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code, leave name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold">Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>

          <select
            value={paidFilter}
            onChange={(e) => setPaidFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Leave Compensation</option>
            <option value="Paid">Paid Leave Only</option>
            <option value="Unpaid">Unpaid Leave Only</option>
          </select>
        </div>
      </div>

      {/* MAIN DATA TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Leave Type Name</th>
                <th className="py-3 px-4">Compensation</th>
                <th className="py-3 px-4">Entitlement</th>
                <th className="py-3 px-4">Accrual</th>
                <th className="py-3 px-4">Carry Forward</th>
                <th className="py-3 px-4">Rules</th>
                <th className="py-3 px-4">Eligibility</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredLeaveTypes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-bold text-sm">No Leave Types Found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search filters or click "Add Leave Type" to create one.</p>
                  </td>
                </tr>
              ) : (
                filteredLeaveTypes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 bg-slate-900 text-emerald-400 font-mono font-bold text-xs rounded border border-slate-800">
                        {item.code}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 text-xs">{item.name}</p>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5" title={item.description}>
                          {item.description}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {item.isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Paid Leave</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <span>Unpaid Leave</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <strong className="text-slate-900 font-mono text-sm">{item.annualEntitlement}</strong>
                      <span className="text-[10px] text-slate-500 ml-1">Days/Year</span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{item.accrualType}</span>
                        {item.accrualType !== 'None' && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {item.accrualDays} days/{item.accrualType.toLowerCase()}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {item.carryForwardAllowed ? (
                        <span className="text-emerald-700 font-semibold text-xs">
                          Yes <span className="text-[10px] text-slate-500 font-mono">(Max {item.maxCarryForwardDays}d)</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.requiresApproval && (
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-200" title="Requires Manager Approval">
                            Approval
                          </span>
                        )}
                        {item.requiresAttachment && (
                          <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded border border-purple-200" title="Requires Attachment Document">
                            Doc Req.
                          </span>
                        )}
                        {item.encashmentAllowed === 'Allowed' && (
                          <span className="px-1.5 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded border border-teal-200" title="Encashable">
                            Encashable
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex flex-col">
                        <span className="font-semibold">{item.applicableType}</span>
                        <span className="text-[10px] text-slate-400">Gender: {item.genderEligibility}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(item.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                          item.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Click to toggle status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        <span>{item.status}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewItem(item)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                          title="View Leave Type Details"
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                          title="Edit Leave Type"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded transition-colors"
                          title="Delete Leave Type"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT LEAVE TYPE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>{editingItem ? `Edit Leave Type: ${editingItem.code}` : 'Add Enterprise Leave Type'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* SECTION 1: BASIC INFORMATION */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>1. Basic Identification</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Leave Type Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AL, SL, ML, EL"
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className={`w-full px-3 py-2 border rounded-lg text-xs font-mono text-slate-900 uppercase font-bold focus:outline-none ${
                        formErrors.code ? 'border-rose-500 bg-rose-50' : 'border-slate-300 focus:border-emerald-500'
                      }`}
                    />
                    {formErrors.code && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.code}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Leave Type Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Annual Paid Leave"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg text-xs font-medium text-slate-900 focus:outline-none ${
                        formErrors.name ? 'border-rose-500 bg-rose-50' : 'border-slate-300 focus:border-emerald-500'
                      }`}
                    />
                    {formErrors.name && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.name}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Enter compliance details or notes e.g., Qatar Labor Law Article 79..."
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Paid / Unpaid Radio Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Leave Compensation (Paid / Unpaid)
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="isPaid"
                        checked={formData.isPaid === true}
                        onChange={() => setFormData({ ...formData, isPaid: true })}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-emerald-700 font-bold">Paid Leave</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="isPaid"
                        checked={formData.isPaid === false}
                        onChange={() => setFormData({ ...formData, isPaid: false })}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-amber-700 font-bold">Unpaid Leave</span>
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    * Leave financial calculations are automatically processed during Payroll generation based on employee salary structure.
                  </p>
                </div>
              </div>

              {/* SECTION 2: ENTITLEMENT & ACCRUAL RULES */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>2. Entitlement & Accrual Rules</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Annual Entitlement (Days/Year) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.annualEntitlement ?? 30}
                      onChange={(e) => setFormData({ ...formData, annualEntitlement: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Accrual Type</label>
                    <select
                      value={formData.accrualType || 'Monthly'}
                      onChange={(e) => setFormData({ ...formData, accrualType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Yearly">Yearly</option>
                      <option value="None">None</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Accrual Days (Per Period)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.accrualDays ?? 2.5}
                      onChange={(e) => setFormData({ ...formData, accrualDays: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Carry Forward Allowed?</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="carryForwardAllowed"
                          checked={formData.carryForwardAllowed === true}
                          onChange={() => setFormData({ ...formData, carryForwardAllowed: true })}
                        />
                        <span className="font-semibold text-slate-800">Yes</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="carryForwardAllowed"
                          checked={formData.carryForwardAllowed === false}
                          onChange={() => setFormData({ ...formData, carryForwardAllowed: false, maxCarryForwardDays: 0 })}
                        />
                        <span className="font-semibold text-slate-800">No</span>
                      </label>
                    </div>
                  </div>

                  {/* CONDITIONAL FIELD: Visible ONLY when carryForwardAllowed is true */}
                  {formData.carryForwardAllowed && (
                    <div className="animate-fadeIn">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Max Carry Forward Days <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.maxCarryForwardDays ?? 10}
                        onChange={(e) => setFormData({ ...formData, maxCarryForwardDays: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-emerald-400 bg-white rounded-lg text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Leave Encashment Policy</label>
                  <select
                    value={formData.encashmentAllowed || 'Not Allowed'}
                    onChange={(e) => setFormData({ ...formData, encashmentAllowed: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Allowed">Allowed (Encashable on Leave or Exit Settlement)</option>
                    <option value="Not Allowed">Not Allowed</option>
                  </select>
                </div>
              </div>

              {/* SECTION 3: APPROVAL & ATTACHMENT POLICIES */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>3. Approvals & Documentation</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Requires Manager Approval?</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="requiresApproval"
                          checked={formData.requiresApproval === true}
                          onChange={() => setFormData({ ...formData, requiresApproval: true })}
                        />
                        <span className="font-semibold text-slate-800">Yes</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="requiresApproval"
                          checked={formData.requiresApproval === false}
                          onChange={() => setFormData({ ...formData, requiresApproval: false })}
                        />
                        <span className="font-semibold text-slate-800">No (Auto-approved)</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Requires Attachment / Medical Doc?</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="requiresAttachment"
                          checked={formData.requiresAttachment === true}
                          onChange={() => setFormData({ ...formData, requiresAttachment: true })}
                        />
                        <span className="font-semibold text-slate-800">Yes (Mandatory)</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="requiresAttachment"
                          checked={formData.requiresAttachment === false}
                          onChange={() => setFormData({ ...formData, requiresAttachment: false })}
                        />
                        <span className="font-semibold text-slate-800">No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: ELIGIBILITY & STATUS */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>4. Employee Scope & Status</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Applicable Employees</label>
                    <select
                      value={formData.applicableType || 'All Employees'}
                      onChange={(e) => setFormData({ ...formData, applicableType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="All Employees">All Employees</option>
                      <option value="Department">By Department</option>
                      <option value="Designation">By Designation</option>
                      <option value="Specific Employees">Specific Employees</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender Eligibility</label>
                    <select
                      value={formData.genderEligibility || 'All'}
                      onChange={(e) => setFormData({ ...formData, genderEligibility: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="All">All Genders</option>
                      <option value="Male">Male Only</option>
                      <option value="Female">Female Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Policy Status</label>
                    <select
                      value={formData.status || 'Active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  {editingItem ? 'Update Leave Type' : 'Save Leave Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAIL MODAL */}
      {viewItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-600 text-white font-mono font-bold text-xs rounded">
                  {viewItem.code}
                </span>
                <h2 className="text-sm font-bold">{viewItem.name}</h2>
              </div>
              <button onClick={() => setViewItem(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <p className="text-slate-500 uppercase text-[10px] font-bold">Description</p>
                <p className="font-medium text-slate-800 mt-0.5">{viewItem.description || 'No description provided.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">Compensation</span>
                  <strong className={viewItem.isPaid ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                    {viewItem.isPaid ? 'Paid Leave' : 'Unpaid Leave'}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Annual Entitlement</span>
                  <strong className="text-slate-900 font-mono text-sm">{viewItem.annualEntitlement} Days/Yr</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Accrual Schedule</span>
                  <strong className="text-slate-800">{viewItem.accrualType} ({viewItem.accrualDays} days)</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Carry Forward</span>
                  <strong className="text-slate-800">
                    {viewItem.carryForwardAllowed ? `Allowed (Max ${viewItem.maxCarryForwardDays}d)` : 'Disabled'}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Leave Encashment</span>
                  <strong className="text-slate-800">{viewItem.encashmentAllowed}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Manager Approval</span>
                  <strong className="text-slate-800">{viewItem.requiresApproval ? 'Required' : 'Auto-Approved'}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Document Attachment</span>
                  <strong className="text-slate-800">{viewItem.requiresAttachment ? 'Mandatory' : 'Optional'}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Scope & Gender</span>
                  <strong className="text-slate-800">{viewItem.applicableType} ({viewItem.genderEligibility})</strong>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800">
                <p className="font-bold">✨ Payroll & Attendance Integration Ready</p>
                <p className="mt-0.5 text-emerald-700">
                  Approved leave days under this policy automatically update biometric attendance timecards and feed salary impact into the Qatar WPS Payroll engine.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewItem(null)}
                  className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-bold">Delete Leave Type Configuration?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this leave type policy? Existing leave applications and employee balances associated with this code will remain in audit history.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveTypesPage;
