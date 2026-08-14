import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Paperclip,
  Check,
  X,
  UserCheck,
  Building,
  Layers,
  ArrowRight,
  ShieldCheck,
  Send,
  RotateCcw,
  User,
  Info,
  DollarSign,
} from 'lucide-react';
import { LeaveType } from './LeaveTypesPage';

export interface Employee {
  id: string;
  code: string;
  name: string;
  department: string;
  designation: string;
  branch: string;
  reportingManager: string;
  balances: Record<
    string,
    { entitlement: number; used: number; pending: number; available: number }
  >;
}

export interface LeaveApplication {
  id: string;
  code: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  branch: string;
  reportingManager: string;
  leaveTypeCode: string;
  leaveTypeName: string;
  isPaid: boolean;
  availableBalance: number;
  fromDate: string;
  toDate: string;
  durationDays: number;
  dayType: 'Full Day' | 'Half Day';
  halfDaySession?: 'First Half' | 'Second Half';
  reason: string;
  attachmentName?: string;
  appliedDate: string;
  approverName: string;
  status: 'DRAFT' | 'SUBMITTED' | 'PENDING APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  approvalComment?: string;
  cancellationReason?: string;
  history: {
    stage: string;
    actionBy: string;
    date: string;
    comment?: string;
  }[];
}

const STORAGE_LEAVE_TYPES = 'qatar_erp_leave_types';
const STORAGE_EMPLOYEES = 'qatar_erp_leave_employees';
const STORAGE_APPLICATIONS = 'qatar_erp_leave_applications';

const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-QTR-001',
    code: 'EMP-QTR-001',
    name: 'Ahmed Al-Mansouri',
    department: 'Management',
    designation: 'General Manager',
    branch: 'Doha Main Branch',
    reportingManager: 'Board Executive',
    balances: {
      AL: { entitlement: 30, used: 3, pending: 0, available: 27 },
      SL: { entitlement: 14, used: 1, pending: 0, available: 13 },
      EL: { entitlement: 10, used: 0, pending: 0, available: 10 },
    },
  },
  {
    id: 'EMP-QTR-002',
    code: 'EMP-QTR-002',
    name: 'Tariq Mahmood',
    department: 'Retail Sales',
    designation: 'Lead Cashier',
    branch: 'Doha Main Branch',
    reportingManager: 'Ahmed Al-Mansouri',
    balances: {
      AL: { entitlement: 30, used: 5, pending: 3, available: 22 },
      SL: { entitlement: 14, used: 0, pending: 0, available: 14 },
      EL: { entitlement: 10, used: 0, pending: 0, available: 10 },
    },
  },
  {
    id: 'EMP-QTR-003',
    code: 'EMP-QTR-003',
    name: 'Fatima Al Kuwari',
    department: 'Accounting',
    designation: 'Senior Accountant',
    branch: 'Doha Main Branch',
    reportingManager: 'Ahmed Al-Mansouri',
    balances: {
      AL: { entitlement: 30, used: 10, pending: 0, available: 20 },
      SL: { entitlement: 14, used: 1, pending: 1, available: 12 },
      ML: { entitlement: 50, used: 0, pending: 0, available: 50 },
    },
  },
  {
    id: 'EMP-QTR-134',
    code: 'EMP-QTR-134',
    name: 'Ashok Kumar',
    department: 'Cleaning',
    designation: 'Cleaner',
    branch: 'Doha Main Branch',
    reportingManager: 'Tariq Mahmood',
    balances: {
      AL: { entitlement: 30, used: 0, pending: 0, available: 30 },
      SL: { entitlement: 14, used: 0, pending: 0, available: 14 },
    },
  },
];

const DEFAULT_APPLICATIONS: LeaveApplication[] = [
  {
    id: 'lev-1',
    code: 'LEV-0001',
    employeeId: 'EMP-QTR-002',
    employeeName: 'Tariq Mahmood',
    department: 'Retail Sales',
    designation: 'Lead Cashier',
    branch: 'Doha Main Branch',
    reportingManager: 'Ahmed Al-Mansouri',
    leaveTypeCode: 'AL',
    leaveTypeName: 'Annual Paid Leave',
    isPaid: true,
    availableBalance: 25,
    fromDate: '2026-08-20',
    toDate: '2026-08-22',
    durationDays: 3,
    dayType: 'Full Day',
    reason: 'Annual personal family vacation in Qatar',
    appliedDate: '2026-08-14',
    approverName: 'Ahmed Al-Mansouri',
    status: 'APPROVED',
    approvalComment: 'Approved as per retail shift schedule',
    history: [
      { stage: 'Applied', actionBy: 'Tariq Mahmood', date: '2026-08-14 09:30' },
      { stage: 'Submitted', actionBy: 'Tariq Mahmood', date: '2026-08-14 09:31' },
      { stage: 'Pending Approval', actionBy: 'Ahmed Al-Mansouri', date: '2026-08-14 09:31' },
      { stage: 'Approved', actionBy: 'Ahmed Al-Mansouri', date: '2026-08-14 10:15', comment: 'Approved' },
    ],
  },
  {
    id: 'lev-2',
    code: 'LEV-0002',
    employeeId: 'EMP-QTR-003',
    employeeName: 'Fatima Al Kuwari',
    department: 'Accounting',
    designation: 'Senior Accountant',
    branch: 'Doha Main Branch',
    reportingManager: 'Ahmed Al-Mansouri',
    leaveTypeCode: 'SL',
    leaveTypeName: 'Sick Leave (Medical)',
    isPaid: true,
    availableBalance: 13,
    fromDate: '2026-08-18',
    toDate: '2026-08-18',
    durationDays: 1,
    dayType: 'Full Day',
    reason: 'Medical checkup at Hamad General Hospital',
    attachmentName: 'medical_certificate_qatar.pdf',
    appliedDate: '2026-08-14',
    approverName: 'Ahmed Al-Mansouri',
    status: 'PENDING APPROVAL',
    history: [
      { stage: 'Applied', actionBy: 'Fatima Al Kuwari', date: '2026-08-14 11:00' },
      { stage: 'Submitted', actionBy: 'Fatima Al Kuwari', date: '2026-08-14 11:02' },
      { stage: 'Pending Approval', actionBy: 'Ahmed Al-Mansouri', date: '2026-08-14 11:02' },
    ],
  },
];

export const LeaveApplicationsPage: React.FC = () => {
  // Load Leave Types from localStorage
  const [configuredLeaveTypes, setConfiguredLeaveTypes] = useState<LeaveType[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LEAVE_TYPES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load leave types', e);
    }
    return [
      {
        id: 'lt-1',
        code: 'AL',
        name: 'Annual Paid Leave',
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
      },
      {
        id: 'lt-2',
        code: 'SL',
        name: 'Sick Leave (Medical)',
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
      },
    ];
  });

  // State
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_EMPLOYEES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load employees', e);
    }
    return DEFAULT_EMPLOYEES;
  });

  const [applications, setApplications] = useState<LeaveApplication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_APPLICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load applications', e);
    }
    return DEFAULT_APPLICATIONS;
  });

  // Active Role State (For RBAC Testing: HR/Admin, Manager, Employee)
  const [currentRole, setCurrentRole] = useState<'HR/Admin' | 'Manager' | 'Employee'>('HR/Admin');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('All');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingApp, setViewingApp] = useState<LeaveApplication | null>(null);
  const [approvalModalApp, setApprovalModalApp] = useState<{
    app: LeaveApplication;
    action: 'APPROVE' | 'REJECT';
  } | null>(null);
  const [cancellationModalApp, setCancellationModalApp] = useState<LeaveApplication | null>(null);

  // Form State
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [selectedLeaveCode, setSelectedLeaveCode] = useState<string>('AL');
  const [fromDate, setFromDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dayType, setDayType] = useState<'Full Day' | 'Half Day'>('Full Day');
  const [halfDaySession, setHalfDaySession] = useState<'First Half' | 'Second Half'>('First Half');
  const [reason, setReason] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_EMPLOYEES, JSON.stringify(employees));
    } catch (e) {
      console.error('Failed to save employees', e);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_APPLICATIONS, JSON.stringify(applications));
    } catch (e) {
      console.error('Failed to save applications', e);
    }
  }, [applications]);

  // Derived selected Employee & Leave Type details
  const currentEmployee = employees.find((emp) => emp.id === selectedEmpId) || employees[0];
  const currentLeaveType =
    configuredLeaveTypes.find((lt) => lt.code === selectedLeaveCode) || configuredLeaveTypes[0];

  // Selected Employee's available balance for selected leave type
  const empBalanceObj = currentEmployee?.balances?.[selectedLeaveCode] || {
    entitlement: 30,
    used: 0,
    pending: 0,
    available: 30,
  };
  const availableBalance = empBalanceObj.available;

  // Calculate Duration Days
  const calculateDuration = (): number => {
    if (dayType === 'Half Day') return 0.5;
    if (!fromDate || !toDate) return 0;
    const d1 = new Date(fromDate);
    const d2 = new Date(toDate);
    if (d2 < d1) return 0;
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const durationDays = calculateDuration();
  const remainingBalance = availableBalance - durationDays;

  // Form Reset
  const handleOpenCreateModal = () => {
    setSelectedEmpId(employees[0]?.id || '');
    setSelectedLeaveCode(configuredLeaveTypes[0]?.code || 'AL');
    const today = new Date().toISOString().split('T')[0];
    setFromDate(today);
    setToDate(today);
    setDayType('Full Day');
    setHalfDaySession('First Half');
    setReason('');
    setAttachmentName('');
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  // Form Submit (Draft or Submitted)
  const handleSaveRequest = (isSubmitDirectly: boolean) => {
    const errors: Record<string, string> = {};

    if (!selectedEmpId) errors.selectedEmpId = 'Employee selection is required';
    if (!selectedLeaveCode) errors.selectedLeaveCode = 'Leave Type is required';
    if (!fromDate) errors.fromDate = 'From Date is required';
    if (!toDate) errors.toDate = 'To Date is required';

    if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
      errors.toDate = 'To Date cannot be before From Date';
    }

    if (durationDays <= 0) {
      errors.durationDays = 'Leave duration must be greater than 0';
    }

    if (durationDays > availableBalance) {
      errors.durationDays = `Requested duration (${durationDays} days) exceeds available balance (${availableBalance} days)!`;
    }

    // Attachment validation if configured by Leave Type
    if (currentLeaveType?.requiresAttachment && !attachmentName) {
      errors.attachmentName = `Attachment is required for ${currentLeaveType.name}`;
    }

    // Reason validation
    if (!reason.trim()) {
      errors.reason = 'Reason for leave is required';
    }

    // Prevent Overlapping Requests for same employee
    const overlapping = applications.find(
      (app) =>
        app.employeeId === selectedEmpId &&
        app.status !== 'CANCELLED' &&
        app.status !== 'REJECTED' &&
        ((fromDate >= app.fromDate && fromDate <= app.toDate) ||
          (toDate >= app.fromDate && toDate <= app.toDate) ||
          (fromDate <= app.fromDate && toDate >= app.toDate))
    );

    if (overlapping) {
      errors.fromDate = `Employee already has a ${overlapping.status} leave request (${overlapping.code}) during this date range!`;
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const newCode = `LEV-${String(applications.length + 1).padStart(4, '0')}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const initialStatus = isSubmitDirectly ? 'PENDING APPROVAL' : 'DRAFT';

    const newApp: LeaveApplication = {
      id: `lev-${Date.now()}`,
      code: newCode,
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      department: currentEmployee.department,
      designation: currentEmployee.designation,
      branch: currentEmployee.branch,
      reportingManager: currentEmployee.reportingManager,
      leaveTypeCode: currentLeaveType.code,
      leaveTypeName: currentLeaveType.name,
      isPaid: currentLeaveType.isPaid,
      availableBalance: availableBalance,
      fromDate: fromDate,
      toDate: toDate,
      durationDays: durationDays,
      dayType: dayType,
      halfDaySession: dayType === 'Half Day' ? halfDaySession : undefined,
      reason: reason.trim(),
      attachmentName: attachmentName || undefined,
      appliedDate: todayStr,
      approverName: currentEmployee.reportingManager,
      status: initialStatus,
      history: [
        { stage: 'Applied', actionBy: currentEmployee.name, date: `${todayStr} 12:00` },
        ...(isSubmitDirectly
          ? [
              { stage: 'Submitted', actionBy: currentEmployee.name, date: `${todayStr} 12:01` },
              { stage: 'Pending Approval', actionBy: currentEmployee.reportingManager, date: `${todayStr} 12:01` },
            ]
          : []),
      ],
    };

    setApplications((prev) => [newApp, ...prev]);
    setIsCreateModalOpen(false);
  };

  // Approval / Rejection Handler
  const handleExecuteApproval = (comment: string) => {
    if (!approvalModalApp) return;
    const { app, action } = approvalModalApp;
    const todayStr = new Date().toISOString().split('T')[0];

    if (action === 'APPROVE') {
      // Deduct balance from employee
      setEmployees((prevEmps) =>
        prevEmps.map((emp) => {
          if (emp.id === app.employeeId) {
            const currentBalance = emp.balances[app.leaveTypeCode] || {
              entitlement: 30,
              used: 0,
              pending: 0,
              available: 30,
            };
            const newUsed = currentBalance.used + app.durationDays;
            const newAvailable = Math.max(0, currentBalance.entitlement - newUsed);
            return {
              ...emp,
              balances: {
                ...emp.balances,
                [app.leaveTypeCode]: {
                  ...currentBalance,
                  used: newUsed,
                  available: newAvailable,
                },
              },
            };
          }
          return emp;
        })
      );

      // Update Application status
      setApplications((prevApps) =>
        prevApps.map((a) =>
          a.id === app.id
            ? {
                ...a,
                status: 'APPROVED',
                approvalComment: comment,
                history: [
                  ...a.history,
                  { stage: 'Approved', actionBy: a.approverName, date: `${todayStr} 14:00`, comment },
                ],
              }
            : a
        )
      );
    } else {
      // Reject Application
      setApplications((prevApps) =>
        prevApps.map((a) =>
          a.id === app.id
            ? {
                ...a,
                status: 'REJECTED',
                rejectionReason: comment,
                history: [
                  ...a.history,
                  { stage: 'Rejected', actionBy: a.approverName, date: `${todayStr} 14:00`, comment },
                ],
              }
            : a
        )
      );
    }

    setApprovalModalApp(null);
  };

  // Cancellation Handler
  const handleExecuteCancellation = (cancellationReasonStr: string) => {
    if (!cancellationModalApp) return;
    const app = cancellationModalApp;
    const todayStr = new Date().toISOString().split('T')[0];

    // If it was APPROVED, restore the balance!
    if (app.status === 'APPROVED') {
      setEmployees((prevEmps) =>
        prevEmps.map((emp) => {
          if (emp.id === app.employeeId) {
            const currentBalance = emp.balances[app.leaveTypeCode] || {
              entitlement: 30,
              used: 0,
              pending: 0,
              available: 30,
            };
            const newUsed = Math.max(0, currentBalance.used - app.durationDays);
            const newAvailable = currentBalance.entitlement - newUsed;
            return {
              ...emp,
              balances: {
                ...emp.balances,
                [app.leaveTypeCode]: {
                  ...currentBalance,
                  used: newUsed,
                  available: newAvailable,
                },
              },
            };
          }
          return emp;
        })
      );
    }

    // Update status to CANCELLED
    setApplications((prevApps) =>
      prevApps.map((a) =>
        a.id === app.id
          ? {
              ...a,
              status: 'CANCELLED',
              cancellationReason: cancellationReasonStr,
              history: [
                ...a.history,
                { stage: 'Cancelled', actionBy: 'System / User', date: `${todayStr} 15:00`, comment: cancellationReasonStr },
              ],
            }
          : a
      )
    );

    setCancellationModalApp(null);
  };

  // Filtered List
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.employeeId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLeaveType = leaveTypeFilter === 'All' || app.leaveTypeCode === leaveTypeFilter;
    const matchesDept = deptFilter === 'All' || app.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;

    return matchesSearch && matchesLeaveType && matchesDept && matchesStatus;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Request Code',
      'Employee ID',
      'Employee Name',
      'Department',
      'Leave Type',
      'From Date',
      'To Date',
      'Duration (Days)',
      'Day Type',
      'Applied Date',
      'Approver',
      'Status',
      'Reason',
    ];

    const rows = filteredApplications.map((app) => [
      app.code,
      app.employeeId,
      `"${app.employeeName}"`,
      app.department,
      app.leaveTypeName,
      app.fromDate,
      app.toDate,
      app.durationDays,
      app.dayType,
      app.appliedDate,
      app.approverName,
      app.status,
      `"${app.reason.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Qatar_ERP_Leave_Applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* TOP HEADER & WORKFLOW BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            <span>Leave Application & Workflow Engine</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit, review, and approve staff leave requests. Real-time balance ledger deduction, biometric timecard sync, and Qatar WPS payroll readiness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* RBAC ROLE SELECTOR FOR TESTING */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 pl-1">Role View:</span>
            {(['HR/Admin', 'Manager', 'Employee'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setCurrentRole(role)}
                className={`px-2.5 py-1 rounded font-bold text-[11px] transition-colors ${
                  currentRole === role
                    ? 'bg-slate-900 text-emerald-400 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors border border-slate-200"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Report</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Apply For Leave</span>
          </button>
        </div>
      </div>

      {/* WORKFLOW PIPELINE BANNER */}
      <div className="bg-slate-900 rounded-xl p-4 text-white shadow-sm border border-slate-800">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Enterprise Leave Lifecycle Pipeline</span>
          </div>
          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
            Active Role: {currentRole}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-center text-[11px]">
          <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-2 flex flex-col items-center justify-center">
            <span className="font-bold text-slate-300">1. Leave Request</span>
            <span className="text-[10px] text-slate-400">Employee Draft/Submit</span>
          </div>
          <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-2 flex flex-col items-center justify-center">
            <span className="font-bold text-slate-300">2. Balance Check</span>
            <span className="text-[10px] text-slate-400">Auto Entitlement Check</span>
          </div>
          <div className="bg-amber-950/80 border border-amber-600/50 rounded-lg p-2 flex flex-col items-center justify-center">
            <span className="font-bold text-amber-300">3. Manager Approval</span>
            <span className="text-[10px] text-amber-400">Pending Review</span>
          </div>
          <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-lg p-2 flex flex-col items-center justify-center">
            <span className="font-bold text-emerald-300">4. Balance Ledger</span>
            <span className="text-[10px] text-emerald-400">Auto Days Deducted</span>
          </div>
          <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-2 flex flex-col items-center justify-center">
            <span className="font-bold text-slate-300">5. Attendance Sync</span>
            <span className="text-[10px] text-slate-400">Timecard Status: Leave</span>
          </div>
          <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-2 flex flex-col items-center justify-center">
            <span className="font-bold text-slate-300">6. Payroll Impact</span>
            <span className="text-[10px] text-slate-400">Paid/Unpaid WPS Salary</span>
          </div>
        </div>
      </div>

      {/* METRICS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Requests</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{applications.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Pending Approval</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              {applications.filter((a) => a.status === 'PENDING APPROVAL').length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Approved Requests</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {applications.filter((a) => a.status === 'APPROVED').length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Approved Days</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">
              {applications
                .filter((a) => a.status === 'APPROVED')
                .reduce((sum, a) => sum + a.durationDays, 0)}{' '}
              <span className="text-xs font-normal">Days</span>
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, employee name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold">Filters:</span>
          </div>

          <select
            value={leaveTypeFilter}
            onChange={(e) => setLeaveTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Leave Types</option>
            {configuredLeaveTypes.map((lt) => (
              <option key={lt.code} value={lt.code}>
                {lt.code} - {lt.name}
              </option>
            ))}
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Departments</option>
            <option value="Retail Sales">Retail Sales</option>
            <option value="Management">Management</option>
            <option value="Accounting">Accounting</option>
            <option value="Cleaning">Cleaning</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="PENDING APPROVAL">PENDING APPROVAL</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* APPLICATIONS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Request Code</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Date Range</th>
                <th className="py-3 px-4 text-center">Days</th>
                <th className="py-3 px-4">Applied Date</th>
                <th className="py-3 px-4">Approver</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-bold text-sm">No Leave Applications Found</p>
                    <p className="text-xs text-slate-400 mt-1">Adjust filters or click "Apply For Leave" to submit a request.</p>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 bg-slate-900 text-emerald-400 font-mono font-bold text-xs rounded">
                        {app.code}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{app.employeeName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {app.employeeId} • {app.department}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-slate-800">{app.leaveTypeCode}</span>
                        <span className="text-slate-600 truncate max-w-[120px]">{app.leaveTypeName}</span>
                      </div>
                      <span className={`text-[10px] font-bold ${app.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {app.isPaid ? 'Paid Leave' : 'Unpaid Leave'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-mono text-slate-800">
                        {app.fromDate} <span className="text-slate-400">to</span> {app.toDate}
                      </p>
                      <p className="text-[10px] text-slate-400">Day Type: {app.dayType} {app.halfDaySession ? `(${app.halfDaySession})` : ''}</p>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {app.durationDays}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {app.appliedDate}
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {app.approverName}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          app.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : app.status === 'PENDING APPROVAL' || app.status === 'SUBMITTED'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : app.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : app.status === 'CANCELLED'
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          app.status === 'APPROVED' ? 'bg-emerald-500' :
                          app.status === 'PENDING APPROVAL' ? 'bg-amber-500' :
                          app.status === 'REJECTED' ? 'bg-rose-500' : 'bg-slate-400'
                        }`}></span>
                        <span>{app.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* VIEW */}
                        <button
                          onClick={() => setViewingApp(app)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                          title="View Request Details"
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                        </button>

                        {/* MANAGER APPROVE / REJECT */}
                        {(app.status === 'PENDING APPROVAL' || app.status === 'SUBMITTED') &&
                          (currentRole === 'HR/Admin' || currentRole === 'Manager') && (
                            <>
                              <button
                                onClick={() => setApprovalModalApp({ app, action: 'APPROVE' })}
                                className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded transition-colors"
                                title="Approve Leave Request"
                              >
                                <Check className="w-4 h-4 font-black" />
                              </button>
                              <button
                                onClick={() => setApprovalModalApp({ app, action: 'REJECT' })}
                                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded transition-colors"
                                title="Reject Leave Request"
                              >
                                <X className="w-4 h-4 font-black" />
                              </button>
                            </>
                          )}

                        {/* CANCEL */}
                        {app.status !== 'CANCELLED' && app.status !== 'REJECTED' && (
                          <button
                            onClick={() => setCancellationModalApp(app)}
                            className="p-1.5 hover:bg-amber-50 text-amber-600 rounded transition-colors"
                            title="Cancel Leave Request"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE LEAVE REQUEST MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Apply For Staff Leave Request</span>
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveRequest(true);
              }}
              className="p-6 space-y-6 max-h-[80vh] overflow-y-auto"
            >
              {/* SECTION A: REQUEST INFORMATION */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                  A. Request & System Metadata
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Leave Request Code</label>
                    <input
                      type="text"
                      readOnly
                      value={`LEV-${String(applications.length + 1).padStart(4, '0')} (Auto)`}
                      className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded-lg text-xs font-mono font-bold text-slate-600 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Application Date</label>
                    <input
                      type="text"
                      readOnly
                      value={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded-lg text-xs font-mono font-bold text-slate-600 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: EMPLOYEE INFORMATION */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                  B. Employee Information
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Employee <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.code}) — {emp.department}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Auto-populated Employee Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Employee ID</span>
                    <strong className="text-slate-800 font-mono">{currentEmployee?.code}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Department</span>
                    <strong className="text-slate-800">{currentEmployee?.department}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Designation</span>
                    <strong className="text-slate-800">{currentEmployee?.designation}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Reporting Manager</span>
                    <strong className="text-slate-800">{currentEmployee?.reportingManager}</strong>
                  </div>
                </div>
              </div>

              {/* SECTION C: LEAVE DETAILS */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                  C. Leave Information & Duration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Leave Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedLeaveCode}
                      onChange={(e) => setSelectedLeaveCode(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    >
                      {configuredLeaveTypes.map((lt) => (
                        <option key={lt.code} value={lt.code}>
                          {lt.code} - {lt.name} ({lt.isPaid ? 'Paid' : 'Unpaid'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Day Type</label>
                    <select
                      value={dayType}
                      onChange={(e) => setDayType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Full Day">Full Day</option>
                      <option value="Half Day">Half Day (0.5 Day)</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Half-Day Session Selection */}
                {dayType === 'Half Day' && (
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <label className="block text-xs font-bold text-amber-900 mb-1">Half-Day Session</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer font-bold text-amber-800">
                        <input
                          type="radio"
                          name="halfDaySession"
                          checked={halfDaySession === 'First Half'}
                          onChange={() => setHalfDaySession('First Half')}
                        />
                        <span>First Half (Morning Shift)</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer font-bold text-amber-800">
                        <input
                          type="radio"
                          name="halfDaySession"
                          checked={halfDaySession === 'Second Half'}
                          onChange={() => setHalfDaySession('Second Half')}
                        />
                        <span>Second Half (Afternoon Shift)</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      From Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                    {formErrors.fromDate && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.fromDate}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      To Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                    {formErrors.toDate && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.toDate}</p>}
                  </div>
                </div>

                {/* REAL-TIME BALANCE CALCULATION BANNER */}
                <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Available Balance</span>
                    <strong className="text-emerald-400 font-mono text-lg">{availableBalance} Days</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Requested Days</span>
                    <strong className="text-amber-400 font-mono text-lg">{durationDays} Days</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Remaining Balance</span>
                    <strong className={`font-mono text-lg ${remainingBalance < 0 ? 'text-rose-400' : 'text-white'}`}>
                      {remainingBalance} Days
                    </strong>
                  </div>
                </div>

                {formErrors.durationDays && (
                  <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200 font-bold">
                    {formErrors.durationDays}
                  </p>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reason / Comments <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide justification for leave request..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                  {formErrors.reason && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.reason}</p>}
                </div>

                {/* Attachment Input (Mandatory if configured by Leave Type) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Document Attachment{' '}
                    {currentLeaveType?.requiresAttachment ? (
                      <span className="text-rose-500">(Mandatory for {currentLeaveType.name})</span>
                    ) : (
                      <span className="text-slate-400">(Optional)</span>
                    )}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Upload PDF/JPG medical cert or document..."
                      value={attachmentName}
                      onChange={(e) => setAttachmentName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setAttachmentName(`document_${Date.now()}.pdf`)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-xs rounded-lg border border-slate-200"
                    >
                      Attach File
                    </button>
                  </div>
                  {formErrors.attachmentName && (
                    <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.attachmentName}</p>
                  )}
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveRequest(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg"
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Submit For Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILED REQUEST & APPROVAL TIMELINE MODAL */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-600 text-white font-mono font-bold text-xs rounded">
                  {viewingApp.code}
                </span>
                <h2 className="text-sm font-bold">Leave Application Details</h2>
              </div>
              <button onClick={() => setViewingApp(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
              {/* Employee Summary Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">Employee</span>
                  <strong className="text-slate-900">{viewingApp.employeeName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Employee ID</span>
                  <strong className="text-slate-800 font-mono">{viewingApp.employeeId}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Department</span>
                  <strong className="text-slate-800">{viewingApp.department}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Approver</span>
                  <strong className="text-slate-800">{viewingApp.approverName}</strong>
                </div>
              </div>

              {/* Leave Request Info */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">Leave Details</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Leave Type</span>
                    <strong className="text-slate-900">{viewingApp.leaveTypeName} ({viewingApp.leaveTypeCode})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Dates</span>
                    <strong className="text-slate-900 font-mono">{viewingApp.fromDate} to {viewingApp.toDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Duration</span>
                    <strong className="text-emerald-600 font-mono text-sm">{viewingApp.durationDays} Days</strong>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Reason</span>
                <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-medium text-slate-800">
                  {viewingApp.reason}
                </p>
              </div>

              {viewingApp.attachmentName && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Attached Document</span>
                  <div className="flex items-center gap-2 p-2 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg font-mono">
                    <Paperclip className="w-4 h-4 text-indigo-600" />
                    <span>{viewingApp.attachmentName}</span>
                  </div>
                </div>
              )}

              {/* APPROVAL AUDIT TIMELINE */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1">
                  Approval Audit Trail & Timeline
                </h4>
                <div className="space-y-2">
                  {viewingApp.history.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900">{step.stage}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">{step.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">By: {step.actionBy}</p>
                        {step.comment && (
                          <p className="text-[11px] text-emerald-700 font-semibold mt-1">"{step.comment}"</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={() => setViewingApp(null)} className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANAGER APPROVAL / REJECTION MODAL */}
      {approvalModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2">
              {approvalModalApp.action === 'APPROVE' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-600" />
              )}
              <h3 className="text-sm font-bold text-slate-900">
                {approvalModalApp.action === 'APPROVE' ? 'Approve Leave Request' : 'Reject Leave Request'}
              </h3>
            </div>

            <p className="text-xs text-slate-600">
              Request <strong className="font-mono">{approvalModalApp.app.code}</strong> for{' '}
              <strong>{approvalModalApp.app.employeeName}</strong> ({approvalModalApp.app.durationDays} Days of {approvalModalApp.app.leaveTypeName}).
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {approvalModalApp.action === 'APPROVE' ? 'Approval Comments (Optional)' : 'Rejection Reason (Required)'}
              </label>
              <textarea
                rows={3}
                id="approvalCommentInput"
                placeholder={
                  approvalModalApp.action === 'APPROVE'
                    ? 'Enter approval remarks...'
                    : 'Provide detailed reason for rejecting this leave request...'
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setApprovalModalApp(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('approvalCommentInput') as HTMLTextAreaElement;
                  const commentStr = el?.value || (approvalModalApp.action === 'APPROVE' ? 'Approved' : 'Rejected');
                  if (approvalModalApp.action === 'REJECT' && !el?.value.trim()) {
                    alert('Rejection reason is required!');
                    return;
                  }
                  handleExecuteApproval(commentStr);
                }}
                className={`px-5 py-2 text-white font-bold text-xs rounded-lg shadow-sm ${
                  approvalModalApp.action === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {approvalModalApp.action === 'APPROVE' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCELLATION MODAL */}
      {cancellationModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-bold">Cancel Leave Request?</h3>
            </div>

            <p className="text-xs text-slate-600">
              Cancel leave request <strong className="font-mono">{cancellationModalApp.code}</strong>.
              {cancellationModalApp.status === 'APPROVED' && (
                <span className="block mt-1 font-bold text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">
                  ✨ Restores {cancellationModalApp.durationDays} days back to employee leave balance.
                </span>
              )}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Cancellation</label>
              <textarea
                rows={2}
                id="cancellationReasonInput"
                placeholder="Enter cancellation reason..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCancellationModalApp(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg"
              >
                Keep Request
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('cancellationReasonInput') as HTMLTextAreaElement;
                  handleExecuteCancellation(el?.value || 'User Cancelled');
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApplicationsPage;
