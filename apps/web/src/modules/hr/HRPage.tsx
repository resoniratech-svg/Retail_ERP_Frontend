import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@qatar-erp/ui';
import { formatQAR } from '@qatar-erp/utils';
import {
  Plus,
  UserCheck,
  X,
  Edit,
  Trash2,
  Users,
  CreditCard,
  Phone,
  Landmark,
  Shield,
  Key,
  Fingerprint,
  FileText,
  Building,
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  Heart,
  Upload,
  Download,
  Printer,
  Search,
  CheckSquare,
  RotateCcw,
  XCircle,
} from 'lucide-react';

const STORAGE_KEY = 'qatar_erp_employees';

export interface Employee {
  id: string;
  empNo: string;
  fileNumber: string;
  username: string;
  firstName: string;
  lastName: string;
  name: string;
  dept: string;
  role: string;
  designation: string;
  accountType: 'Admin' | 'User' | 'Cashier' | 'Manager';
  currentStatus: 'On Service' | 'On Leave' | 'Resigned' | 'Terminated';
  joinedOn: string;
  discontinuedOn?: string;
  dob: string;
  worksAt: string;
  visaFrom: string;
  empLevel: string;
  gender: 'Male' | 'Female';
  country: string;
  bloodGroup: string;
  phone: string;
  accountNo: string;
  qid: string;
  salary: number;
  isActive: boolean;

  // Additional Fields from DART POS Modal (Images 2 & 3)
  isDeliveryPerson?: boolean;
  isSalesman?: boolean;
  language?: string;
  commissionLevel?: string;
  mngrLevel?: number;
  operatorCode?: string;
  operatorPin?: string;
  accessCardNo?: string;
  biometricEnrolled?: boolean;
  
  fatherName?: string;
  motherName?: string;
  maritalStatus?: string;
  spouseName?: string;
  childrenCount?: number;
  marriageDate?: string;
  passportNo?: string;
  visaFileNo?: string;
  uidNo?: string;
  religion?: string;
  medicalConditions?: string;

  casualSickLeaveDays?: number;
  annualLeaveDays?: number;

  basicSalary?: number;
  hraAllowance?: number;
  transportAllowance?: number;
  otherAllowance?: number;
  bankName?: string;
  swiftCode?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
}

const DEFAULT_DEPARTMENTS = [
  'Retail Sales',
  'Management',
  'Accounting',
  'Inventory & Logistics',
  'HR & Administration',
  'Security & Maintenance',
  'Bakery & Fresh Food',
];

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-00',
    empNo: '-',
    fileNumber: '-',
    username: 'Administrator',
    firstName: 'Administrator',
    lastName: '',
    name: 'Administrator',
    dept: 'Management',
    role: 'Admin',
    designation: 'System Administrator',
    accountType: 'Admin',
    currentStatus: 'On Service',
    joinedOn: '01/01/2020',
    dob: '01/01/1990',
    worksAt: 'Saudi Arabia',
    visaFrom: 'Saudi Arabia',
    empLevel: 'A',
    gender: 'Male',
    country: 'Saudi Arabia',
    bloodGroup: 'N/A',
    phone: '+966 50 000 0000',
    accountNo: 'SA00 0000 0000',
    qid: '1000000000',
    salary: 25000,
    isActive: true,
    casualSickLeaveDays: 14,
    annualLeaveDays: 30,
    basicSalary: 20000,
    hraAllowance: 4000,
    transportAllowance: 1000,
    bankName: 'Al Rajhi Bank',
  },
  {
    id: 'emp-01',
    empNo: '123',
    fileNumber: 'rtrey',
    username: 'Sai',
    firstName: 'Sai',
    lastName: 'ewrer',
    name: 'Sai ewrer',
    dept: 'Sales',
    role: 'User',
    designation: 'Cashier',
    accountType: 'User',
    currentStatus: 'On Service',
    joinedOn: '03/01/2026',
    dob: '06/08/2001',
    worksAt: 'Saudi Arabia',
    visaFrom: 'Saudi Arabia',
    empLevel: 'A',
    gender: 'Male',
    country: 'Afghanistan',
    bloodGroup: 'N/A',
    phone: '+966 55 123 4567',
    accountNo: 'SA55 1234 5678',
    qid: '2000000123',
    salary: 8000,
    isActive: true,
    casualSickLeaveDays: 14,
    annualLeaveDays: 30,
    basicSalary: 6000,
    hraAllowance: 1500,
    transportAllowance: 500,
    bankName: 'NCB Bank',
  },
  {
    id: 'emp-02',
    empNo: '124',
    fileNumber: 'FL-992',
    username: 'tariq.m',
    firstName: 'Tariq',
    lastName: 'Mahmood',
    name: 'Tariq Mahmood',
    dept: 'Retail Sales',
    role: 'Cashier',
    designation: 'Lead Cashier',
    accountType: 'Cashier',
    currentStatus: 'On Service',
    joinedOn: '2025-06-15',
    dob: '1995-11-20',
    worksAt: 'Qatar Doha Main',
    visaFrom: 'Qatar',
    empLevel: 'B',
    gender: 'Male',
    country: 'Pakistan',
    bloodGroup: 'O+',
    phone: '+974 6623 9876',
    accountNo: 'QA88 CBQK 0000 0008 9012 34',
    qid: '29104820194',
    salary: 6500,
    isActive: true,
    casualSickLeaveDays: 14,
    annualLeaveDays: 30,
    basicSalary: 5000,
    hraAllowance: 1000,
    transportAllowance: 500,
    bankName: 'Commercial Bank of Qatar',
  },
  {
    id: 'emp-03',
    empNo: '125',
    fileNumber: 'FL-993',
    username: 'fatima.k',
    firstName: 'Fatima',
    lastName: 'Al-Kuwari',
    name: 'Fatima Al-Kuwari',
    dept: 'Accounting',
    role: 'User',
    designation: 'Senior Accountant',
    accountType: 'User',
    currentStatus: 'On Service',
    joinedOn: '2024-03-01',
    dob: '1992-04-12',
    worksAt: 'Qatar Doha Main',
    visaFrom: 'Qatar',
    empLevel: 'A',
    gender: 'Female',
    country: 'Qatar',
    bloodGroup: 'A+',
    phone: '+974 3345 7890',
    accountNo: 'QA12 QIBK 0000 0003 4567 89',
    qid: '29503920183',
    salary: 14000,
    isActive: true,
    casualSickLeaveDays: 14,
    annualLeaveDays: 30,
    basicSalary: 11000,
    hraAllowance: 2000,
    transportAllowance: 1000,
    bankName: 'Qatar Islamic Bank',
  },
];

const loadStoredEmployees = (): Employee[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EMPLOYEES));
      return INITIAL_EMPLOYEES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as Employee[];
    }
    return INITIAL_EMPLOYEES;
  } catch (e) {
    return INITIAL_EMPLOYEES;
  }
};

const saveStoredEmployees = (list: Employee[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save employees to localStorage:', e);
  }
};

export const HRPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Modal Main Tab State matching Images 2 & 3
  const [mainModalTab, setMainModalTab] = useState<'Details' | 'HR & Payroll'>('Details');
  const [hrSubTab, setHrSubTab] = useState<'Basic Details' | 'Contact Details' | 'Salary & Allowances' | 'Documents' | 'Experience'>('Basic Details');

  const [searchQuery, setSearchQuery] = useState('');
  const [isManualDeptInput, setIsManualDeptInput] = useState(false);

  // Comprehensive Form State matching Images 2 & 3
  const [formData, setFormData] = useState<Partial<Employee>>({
    empNo: '',
    fileNumber: '',
    username: '',
    firstName: '',
    lastName: '',
    name: '',
    dept: 'Retail Sales',
    role: 'Cashier',
    designation: 'Cashier',
    accountType: 'User',
    currentStatus: 'On Service',
    joinedOn: new Date().toISOString().split('T')[0],
    dob: '2000-01-01',
    worksAt: 'Qatar Doha Main',
    visaFrom: 'Qatar',
    empLevel: 'A',
    gender: 'Male',
    country: 'Qatar',
    bloodGroup: 'N/A',
    phone: '+974 ',
    accountNo: '',
    qid: '',
    salary: 6000,
    isActive: true,

    isDeliveryPerson: false,
    isSalesman: false,
    language: 'English',
    commissionLevel: 'Standard Level 01',
    mngrLevel: 10,
    operatorCode: '101',
    operatorPin: '1234',
    accessCardNo: 'RF-99120',
    biometricEnrolled: false,

    fatherName: '',
    motherName: '',
    maritalStatus: "Don't disclosed",
    spouseName: '',
    childrenCount: 0,
    marriageDate: '',
    passportNo: '',
    visaFileNo: '',
    uidNo: '',
    religion: 'Islam',
    medicalConditions: '',

    casualSickLeaveDays: 14,
    annualLeaveDays: 30,

    basicSalary: 5000,
    hraAllowance: 1000,
    transportAllowance: 500,
    otherAllowance: 0,
    bankName: 'QNB Qatar National Bank',
    swiftCode: 'QNBAQAQA',
    email: '',
    address: 'Doha, Qatar',
    emergencyContact: '+974 5500 0000',
  });

  useEffect(() => {
    setEmployees(loadStoredEmployees());
  }, []);

  const availableDepartments = Array.from(
    new Set([...DEFAULT_DEPARTMENTS, ...employees.map((e) => e.dept).filter(Boolean)])
  );

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      empNo: `${Math.floor(100 + Math.random() * 900)}`,
      fileNumber: `FL-${Math.floor(100 + Math.random() * 900)}`,
      username: `user.${Math.floor(100 + Math.random() * 900)}`,
      firstName: '',
      lastName: '',
      name: '',
      dept: 'Retail Sales',
      role: 'Cashier',
      designation: 'Cashier',
      accountType: 'User',
      currentStatus: 'On Service',
      joinedOn: new Date().toISOString().split('T')[0],
      dob: '2000-01-01',
      worksAt: 'Qatar Doha Main',
      visaFrom: 'Qatar',
      empLevel: 'A',
      gender: 'Male',
      country: 'Qatar',
      bloodGroup: 'N/A',
      phone: '+974 5512 3456',
      accountNo: `QA${Math.floor(10 + Math.random() * 89)} QNBA 0000 000${Math.floor(100 + Math.random() * 899)} ${Math.floor(1000 + Math.random() * 8999)} ${Math.floor(10 + Math.random() * 89)}`,
      qid: `2900${Math.floor(1000000 + Math.random() * 9000000)}`,
      salary: 6000,
      isActive: true,

      isDeliveryPerson: false,
      isSalesman: true,
      language: 'English',
      commissionLevel: 'Standard Level 01',
      mngrLevel: 10,
      operatorCode: `${Math.floor(100 + Math.random() * 899)}`,
      operatorPin: '1234',
      accessCardNo: `RF-${Math.floor(10000 + Math.random() * 89999)}`,
      biometricEnrolled: false,

      fatherName: '',
      motherName: '',
      maritalStatus: "Don't disclosed",
      spouseName: '',
      childrenCount: 0,
      passportNo: `N${Math.floor(1000000 + Math.random() * 8999999)}`,
      visaFileNo: `V-${Math.floor(100000 + Math.random() * 899999)}`,
      uidNo: `UID-${Math.floor(100000 + Math.random() * 899999)}`,
      religion: 'Islam',
      medicalConditions: '',

      casualSickLeaveDays: 14,
      annualLeaveDays: 30,

      basicSalary: 5000,
      hraAllowance: 1000,
      transportAllowance: 500,
      otherAllowance: 0,
      bankName: 'QNB Qatar National Bank',
    });
    setMainModalTab('Details');
    setHrSubTab('Basic Details');
    setIsManualDeptInput(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({ ...emp });
    setMainModalTab('Details');
    setHrSubTab('Basic Details');
    setIsManualDeptInput(!availableDepartments.includes(emp.dept));
    setIsModalOpen(true);
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm('Are you sure you want to delete this employee record?')) {
      const updated = employees.filter((e) => e.id !== id);
      setEmployees(updated);
      saveStoredEmployees(updated);
    }
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();

    const fullName = formData.name?.trim() || `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'New Employee';

    const payload: Employee = {
      id: editingEmployee ? editingEmployee.id : `emp-${Date.now()}`,
      empNo: formData.empNo || `${Math.floor(100 + Math.random() * 900)}`,
      fileNumber: formData.fileNumber || 'FL-000',
      username: formData.username || fullName.toLowerCase().replace(/\s+/g, '.'),
      firstName: formData.firstName || fullName.split(' ')[0],
      lastName: formData.lastName || fullName.split(' ').slice(1).join(' ') || 'Staff',
      name: fullName,
      dept: formData.dept?.trim() || 'Retail Sales',
      role: formData.role || 'Staff',
      designation: formData.designation || 'Staff',
      accountType: formData.accountType || 'User',
      currentStatus: formData.currentStatus || 'On Service',
      joinedOn: formData.joinedOn || new Date().toISOString().split('T')[0],
      dob: formData.dob || '2000-01-01',
      worksAt: formData.worksAt || 'Qatar Doha Main',
      visaFrom: formData.visaFrom || 'Qatar',
      empLevel: formData.empLevel || 'A',
      gender: formData.gender || 'Male',
      country: formData.country || 'Qatar',
      bloodGroup: formData.bloodGroup || 'N/A',
      phone: formData.phone || '+974 5512 3456',
      accountNo: formData.accountNo || 'QA00 QNBA 0000 0000 0000 00',
      qid: formData.qid || '29000000000',
      salary: (formData.basicSalary || 5000) + (formData.hraAllowance || 0) + (formData.transportAllowance || 0),
      isActive: formData.isActive !== false,

      isDeliveryPerson: formData.isDeliveryPerson,
      isSalesman: formData.isSalesman,
      language: formData.language,
      commissionLevel: formData.commissionLevel,
      mngrLevel: formData.mngrLevel,
      operatorCode: formData.operatorCode,
      operatorPin: formData.operatorPin,
      accessCardNo: formData.accessCardNo,
      biometricEnrolled: formData.biometricEnrolled,

      fatherName: formData.fatherName,
      motherName: formData.motherName,
      maritalStatus: formData.maritalStatus,
      spouseName: formData.spouseName,
      childrenCount: formData.childrenCount,
      marriageDate: formData.marriageDate,
      passportNo: formData.passportNo,
      visaFileNo: formData.visaFileNo,
      uidNo: formData.uidNo,
      religion: formData.religion,
      medicalConditions: formData.medicalConditions,

      casualSickLeaveDays: formData.casualSickLeaveDays || 14,
      annualLeaveDays: formData.annualLeaveDays || 30,

      basicSalary: formData.basicSalary || 5000,
      hraAllowance: formData.hraAllowance || 1000,
      transportAllowance: formData.transportAllowance || 500,
      otherAllowance: formData.otherAllowance || 0,
      bankName: formData.bankName || 'QNB Qatar National Bank',
    };

    let updated: Employee[];
    if (editingEmployee) {
      updated = employees.map((emp) => (emp.id === editingEmployee.id ? payload : emp));
    } else {
      updated = [payload, ...employees];
    }

    setEmployees(updated);
    saveStoredEmployees(updated);
    setIsModalOpen(false);
  };

  const filteredEmployees = employees.filter((e) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      e.empNo.toLowerCase().includes(q) ||
      e.name.toLowerCase().includes(q) ||
      e.dept.toLowerCase().includes(q) ||
      e.phone.includes(q) ||
      e.qid.includes(q) ||
      e.country.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-4 font-sans text-xs">
      {/* 1. TOP DART POS SUB-RIBBON ACTION TOOLBAR (Matching Screenshot 100%) */}
      <div className="bg-slate-200 border border-slate-300 rounded-xl p-1.5 text-slate-900 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => alert('📄 Printing full employee detail cards report.')}
            className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-white text-slate-800 font-bold text-xs rounded border border-slate-400 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-sky-600" />
            <span>Print Employee Detail</span>
          </button>

          <button
            onClick={() => alert('📥 Importing staff directory from Excel file.')}
            className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-white text-slate-800 font-bold text-xs rounded border border-slate-400 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Import From Excel</span>
          </button>

          <button
            onClick={() => alert('⚡ Syncing staff face/fingerprint data to ZKTEco Biometric Attendance Terminal.')}
            className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-white text-slate-800 font-bold text-xs rounded border border-slate-400 shadow-2xs"
          >
            <Fingerprint className="w-3.5 h-3.5 text-indigo-600" />
            <span>Sync Data To Biometric Device</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH FILTER BAR MATCHING SCREENSHOT */}
      <div className="bg-slate-100 p-2 rounded-xl border border-slate-300 shadow-xs flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Enter text to search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1 text-xs font-semibold border border-slate-400 rounded bg-white focus:outline-none focus:border-cyan-600"
          />
        </div>

        <button
          onClick={() => alert('Filter applied')}
          className="px-4 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded font-bold text-slate-800 text-xs shadow-2xs"
        >
          Find
        </button>

        <button
          onClick={() => setSearchQuery('')}
          className="px-4 py-1 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded font-bold text-slate-800 text-xs shadow-2xs"
        >
          Clear
        </button>
      </div>

      {/* 3. DART POS USER ACCOUNTS DATA TABLE WITH RIGHT VERTICAL SHORTCUT STRIP (Matching Screenshot 100%) */}
      <div className="bg-slate-200 border border-slate-300 rounded-xl overflow-hidden shadow-sm flex">
        {/* Left: Master Employees Table */}
        <div className="flex-1 overflow-x-auto max-h-[60vh] bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 uppercase font-bold text-[10px] tracking-wider sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="py-2 px-2 border-r border-slate-200">Employee Code</th>
                <th className="py-2 px-2 border-r border-slate-200">User Name</th>
                <th className="py-2 px-2 border-r border-slate-200">First Name</th>
                <th className="py-2 px-2 border-r border-slate-200">Last Name</th>
                <th className="py-2 px-2 border-r border-slate-200">File Number</th>
                <th className="py-2 px-2 border-r border-slate-200 text-center">Current Status</th>
                <th className="py-2 px-2 border-r border-slate-200">Department</th>
                <th className="py-2 px-2 border-r border-slate-200">Designation</th>
                <th className="py-2 px-2 border-r border-slate-200 font-mono">DOB</th>
                <th className="py-2 px-2 border-r border-slate-200 font-mono">Joined On</th>
                <th className="py-2 px-2 border-r border-slate-200">Works At</th>
                <th className="py-2 px-2 border-r border-slate-200">Visa From</th>
                <th className="py-2 px-2 border-r border-slate-200 text-center">Emp Level</th>
                <th className="py-2 px-2 border-r border-slate-200 text-center">Gender</th>
                <th className="py-2 px-2 border-r border-slate-200">Country</th>
                <th className="py-2 px-2 text-center">Blood Group</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-8 text-center text-slate-500">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-bold text-sm">No Employee Records Found</p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((e) => {
                  const isSelected = selectedEmployee?.id === e.id;
                  return (
                    <tr
                      key={e.id}
                      onClick={() => setSelectedEmployee(e)}
                      onDoubleClick={() => handleOpenEditModal(e)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-navy-900 bg-blue-900 text-white font-bold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2 px-2 border-r border-slate-200 font-mono font-bold">{e.empNo}</td>
                      <td className="py-2 px-2 border-r border-slate-200 font-bold">{e.username}</td>
                      <td className="py-2 px-2 border-r border-slate-200">{e.firstName || e.name.split(' ')[0]}</td>
                      <td className="py-2 px-2 border-r border-slate-200">{e.lastName || e.name.split(' ')[1] || ''}</td>
                      <td className="py-2 px-2 border-r border-slate-200 font-mono text-slate-600">{e.fileNumber || '-'}</td>
                      <td className="py-2 px-2 border-r border-slate-200 text-center">
                        <span className="font-bold text-slate-800">{e.currentStatus || 'On Service'}</span>
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200">{e.dept}</td>
                      <td className="py-2 px-2 border-r border-slate-200">{e.designation || e.role}</td>
                      <td className="py-2 px-2 border-r border-slate-200 font-mono">{e.dob}</td>
                      <td className="py-2 px-2 border-r border-slate-200 font-mono">{e.joinedOn}</td>
                      <td className="py-2 px-2 border-r border-slate-200">{e.worksAt}</td>
                      <td className="py-2 px-2 border-r border-slate-200">{e.visaFrom}</td>
                      <td className="py-2 px-2 border-r border-slate-200 text-center font-bold">{e.empLevel}</td>
                      <td className="py-2 px-2 border-r border-slate-200 text-center">{e.gender}</td>
                      <td className="py-2 px-2 border-r border-slate-200">{e.country}</td>
                      <td className="py-2 px-2 text-center font-mono font-bold">{e.bloodGroup || 'N/A'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Right Vertical Action Shortcut Strip (Matching Target DART POS Screenshot 100%) */}
        <div className="w-11 bg-slate-300 border-l border-slate-400 p-1 flex flex-col items-center gap-2 shrink-0 select-none shadow-inner justify-start pt-2">
          {/* Button 1: Add User/Employee (Green Plus Circle - Ctrl+A) */}
          <button
            onClick={handleOpenAddModal}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs group transition-all"
            title="Add Employee (Ctrl + A)"
          >
            <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs leading-none shadow-2xs">
              +
            </div>
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+A</span>
          </button>

          {/* Button 2: Edit Employee (Pencil Icon - Ctrl+E) */}
          <button
            onClick={() => {
              if (!selectedEmployee) {
                alert('Please select an employee record first to edit.');
                return;
              }
              handleOpenEditModal(selectedEmployee);
            }}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Edit Selected Employee (Ctrl + E)"
          >
            <Edit className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+E</span>
          </button>

          {/* Button 3: Delete Employee (Red Cross Icon - Ctrl+D) */}
          <button
            onClick={() => {
              if (!selectedEmployee) {
                alert('Please select an employee record first to delete.');
                return;
              }
              handleDeleteEmployee(selectedEmployee.id);
            }}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Delete Selected Employee (Ctrl + D)"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+D</span>
          </button>

          {/* Button 4: Refresh List (Blue Circular Arrow Icon - Ctrl+R) */}
          <button
            onClick={() => setEmployees(loadStoredEmployees())}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Refresh List (Ctrl + R)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+R</span>
          </button>

          {/* Button 5: Print / Search (Magnifying Glass Icon - Ctrl+P) */}
          <button
            onClick={() => alert('📄 Printing selected employee detail card...')}
            className="w-9 h-10 bg-slate-100 hover:bg-white border border-slate-400 rounded flex flex-col items-center justify-center shadow-2xs transition-all"
            title="Print / Search Employee (Ctrl + P)"
          >
            <Search className="w-3.5 h-3.5 text-slate-700" />
            <span className="text-[7px] text-slate-600 font-mono font-bold mt-0.5">Ctrl+P</span>
          </button>
        </div>
      </div>

      {/* 4. COMPREHENSIVE ADD / EDIT EMPLOYEE MODAL WITH ALL TABS (Matching Images 2 & 3) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-4">
            {/* MODAL TITLE BAR */}
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold">
                  {editingEmployee ? `Edit Employee: ${editingEmployee.empNo}` : 'New Employee - DART POS'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveEmployee}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded"
                >
                  Save (Ctrl+S)
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* MAIN TWO TABS STRIP (Details vs HR & Payroll - Images 2 & 3) */}
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 border-b border-slate-200">
              <button
                type="button"
                onClick={() => setMainModalTab('Details')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mainModalTab === 'Details'
                    ? 'bg-slate-900 text-emerald-400 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Details (General & Login)
              </button>
              <button
                type="button"
                onClick={() => setMainModalTab('HR & Payroll')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mainModalTab === 'HR & Payroll'
                    ? 'bg-slate-900 text-emerald-400 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                HR & Payroll (Personal, Visa & Salary)
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-4 space-y-4 max-h-[78vh] overflow-y-auto text-xs">
              {/* TAB 1: DETAILS TAB (Matching Image 2) */}
              {mainModalTab === 'Details' && (
                <div className="space-y-4">
                  {/* GENERAL SECTION (Image 2 Top) */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                    <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1">
                      General Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Name *</label>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-semibold text-slate-900 bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Designation</label>
                        <input
                          type="text"
                          placeholder="e.g. Lead Cashier"
                          value={formData.designation || ''}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Account Type</label>
                        <select
                          value={formData.accountType || 'User'}
                          onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-semibold"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Manager">Manager</option>
                          <option value="Cashier">Cashier</option>
                          <option value="User">User</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Govt. ID No. (QID / Iqama)</label>
                        <input
                          type="text"
                          placeholder="29012345678"
                          value={formData.qid || ''}
                          onChange={(e) => setFormData({ ...formData, qid: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Role</label>
                        <select
                          value={formData.role || 'Cashier'}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium"
                        >
                          <option value="General Manager">General Manager</option>
                          <option value="Cashier">Cashier</option>
                          <option value="Senior Accountant">Senior Accountant</option>
                          <option value="Store Keeper">Store Keeper</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Language</label>
                        <select
                          value={formData.language || 'English'}
                          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        >
                          <option value="English">English</option>
                          <option value="Arabic">Arabic</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">DOB Date</label>
                        <input
                          type="date"
                          value={formData.dob || '2000-01-01'}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Phone Number</label>
                        <input
                          type="text"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Commission Level</label>
                        <select
                          value={formData.commissionLevel || 'Standard Level 01'}
                          onChange={(e) => setFormData({ ...formData, commissionLevel: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        >
                          <option value="Standard Level 01">Standard Level 01</option>
                          <option value="Senior Sales Commission 2%">Senior Sales Commission 2%</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={formData.isActive === false}
                          onChange={(e) => setFormData({ ...formData, isActive: !e.target.checked })}
                          className="rounded text-rose-600"
                        />
                        <span>In active (Disabled)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={formData.isDeliveryPerson || false}
                          onChange={(e) => setFormData({ ...formData, isDeliveryPerson: e.target.checked })}
                          className="rounded text-emerald-600"
                        />
                        <span>Delivery Person</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={formData.isSalesman || false}
                          onChange={(e) => setFormData({ ...formData, isSalesman: e.target.checked })}
                          className="rounded text-emerald-600"
                        />
                        <span>Salesman</span>
                      </label>
                    </div>
                  </div>

                  {/* LOG IN DETAILS SECTION (Image 2 Bottom) */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                    <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1">
                      POS & ERP System Login Credentials
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Username</label>
                        <input
                          type="text"
                          value={formData.username || ''}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Operator Code</label>
                        <input
                          type="text"
                          value={formData.operatorCode || '101'}
                          onChange={(e) => setFormData({ ...formData, operatorCode: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Operator PIN (POS Quick Login)</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={formData.operatorPin || '1234'}
                          onChange={(e) => setFormData({ ...formData, operatorPin: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white tracking-widest font-bold text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Access Card # (RFID Badge)</label>
                        <input
                          type="text"
                          value={formData.accessCardNo || 'RF-99120'}
                          onChange={(e) => setFormData({ ...formData, accessCardNo: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white"
                        />
                      </div>

                      <div className="md:col-span-2 bg-white p-2.5 rounded border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="block font-bold text-slate-800 text-xs">Biometric Data Enrollment</span>
                          <span className="text-[10px] text-slate-500">Status: {formData.biometricEnrolled ? 'ENROLLED' : 'NOT ASSIGNED'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, biometricEnrolled: true });
                              alert('👆 Place finger on USB Biometric Scanner... Fingerprint enrolled successfully!');
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-sm flex items-center gap-1"
                          >
                            <Fingerprint className="w-3.5 h-3.5" />
                            <span>Enroll Finger</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: HR & PAYROLL TAB (Matching Image 3) */}
              {mainModalTab === 'HR & Payroll' && (
                <div className="space-y-4">
                  {/* TOP MAIN HR FIELDS (Image 3 Top) */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                    <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1">
                      Employment Service & Department Placement
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Employee Code</label>
                        <input
                          type="text"
                          value={formData.empNo || ''}
                          onChange={(e) => setFormData({ ...formData, empNo: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">File Number</label>
                        <input
                          type="text"
                          value={formData.fileNumber || ''}
                          onChange={(e) => setFormData({ ...formData, fileNumber: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">First Name *</label>
                        <input
                          type="text"
                          value={formData.firstName || ''}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-semibold bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Last Name *</label>
                        <input
                          type="text"
                          value={formData.lastName || ''}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-semibold bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Current Status</label>
                        <select
                          value={formData.currentStatus || 'On Service'}
                          onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold bg-white text-emerald-800"
                        >
                          <option value="On Service">On Service</option>
                          <option value="On Leave">On Leave</option>
                          <option value="Resigned">Resigned</option>
                          <option value="Terminated">Terminated</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Joined On</label>
                        <input
                          type="date"
                          value={formData.joinedOn || ''}
                          onChange={(e) => setFormData({ ...formData, joinedOn: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Department</label>
                        <select
                          value={formData.dept || 'Retail Sales'}
                          onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-semibold"
                        >
                          {availableDepartments.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Works At Location</label>
                        <select
                          value={formData.worksAt || 'Qatar Doha Main'}
                          onChange={(e) => setFormData({ ...formData, worksAt: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-semibold"
                        >
                          <option value="Qatar Doha Main">Qatar Doha Main Branch</option>
                          <option value="Saudi Arabia">Saudi Arabia Regional</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Casual/Sick Leave</label>
                        <input
                          type="number"
                          value={formData.casualSickLeaveDays || 14}
                          onChange={(e) => setFormData({ ...formData, casualSickLeaveDays: parseInt(e.target.value) || 14 })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Annual Leave Days</label>
                        <input
                          type="number"
                          value={formData.annualLeaveDays || 30}
                          onChange={(e) => setFormData({ ...formData, annualLeaveDays: parseInt(e.target.value) || 30 })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PERSONAL DATA SECTION (Image 3 Middle) */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                    <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1">
                      Personal Data & Passport Records
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Father Name</label>
                        <input
                          type="text"
                          value={formData.fatherName || ''}
                          onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Mother Name</label>
                        <input
                          type="text"
                          value={formData.motherName || ''}
                          onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Marital Status</label>
                        <select
                          value={formData.maritalStatus || "Don't disclosed"}
                          onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        >
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Don't disclosed">Don't disclosed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Gender</label>
                        <select
                          value={formData.gender || 'Male'}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-semibold"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Country (Nationality)</label>
                        <select
                          value={formData.country || 'Qatar'}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-semibold"
                        >
                          <option value="Qatar">Qatar</option>
                          <option value="India">India</option>
                          <option value="Pakistan">Pakistan</option>
                          <option value="Philippines">Philippines</option>
                          <option value="Nepal">Nepal</option>
                          <option value="Afghanistan">Afghanistan</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Religion</label>
                        <select
                          value={formData.religion || 'Islam'}
                          onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        >
                          <option value="Islam">Islam</option>
                          <option value="Christianity">Christianity</option>
                          <option value="Hinduism">Hinduism</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Blood Group</label>
                        <select
                          value={formData.bloodGroup || 'N/A'}
                          onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold text-rose-700 bg-white"
                        >
                          <option value="N/A">N/A</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Passport No</label>
                        <input
                          type="text"
                          value={formData.passportNo || ''}
                          onChange={(e) => setFormData({ ...formData, passportNo: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM SUB-TABS (Basic Details, Contact Details, Salary & Allowances - Image 3 Bottom) */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                      {(['Basic Details', 'Contact Details', 'Salary & Allowances', 'Documents', 'Experience'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setHrSubTab(tab)}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            hrSubTab === tab ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-300'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {hrSubTab === 'Salary & Allowances' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Basic Salary (QAR) *</label>
                          <input
                            type="number"
                            value={formData.basicSalary ?? 5000}
                            onChange={(e) => setFormData({ ...formData, basicSalary: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold text-emerald-700 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">HRA Housing Allowance</label>
                          <input
                            type="number"
                            value={formData.hraAllowance ?? 1000}
                            onChange={(e) => setFormData({ ...formData, hraAllowance: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Transport Allowance</label>
                          <input
                            type="number"
                            value={formData.transportAllowance ?? 500}
                            onChange={(e) => setFormData({ ...formData, transportAllowance: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">WPS Bank IBAN Account No *</label>
                          <input
                            type="text"
                            placeholder="QA55 QNBA 0000 0001 2345 67"
                            value={formData.accountNo || ''}
                            onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold text-slate-900 bg-white"
                          />
                        </div>
                      </div>
                    )}

                    {hrSubTab === 'Contact Details' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Email Address</label>
                          <input
                            type="email"
                            placeholder="employee@qatar-erp.com"
                            value={formData.email || ''}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Emergency Contact Phone</label>
                          <input
                            type="text"
                            value={formData.emergencyContact || ''}
                            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {hrSubTab === 'Basic Details' && (
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <span className="text-slate-600 font-medium">
                          Basic Salary: <strong>{formatQAR(formData.basicSalary || 5000)}</strong> | Bank Account: <strong>{formData.accountNo || 'QA55 QNBA 0000 0001 2345 67'}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MODAL FOOTER */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  {editingEmployee ? 'Update Employee Record' : 'Save Employee Master'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRPage;
