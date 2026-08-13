import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@qatar-erp/ui';
import { formatQAR } from '@qatar-erp/utils';
import { Plus, UserCheck, X, Edit, Trash2, Users, Calendar, CreditCard, Building2 } from 'lucide-react';

const STORAGE_KEY = 'qatar_erp_employees';

export interface Employee {
  id: string;
  empNo: string;
  name: string;
  dept: string;
  role: string;
  qid: string;
  qidExpiry: string;
  salary: number;
  isActive: boolean;
}

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-01',
    empNo: 'EMP-QTR-001',
    name: 'Ahmed Al-Mansouri',
    dept: 'Management',
    role: 'General Manager',
    qid: '28439201923',
    qidExpiry: '2027-05-15',
    salary: 22000,
    isActive: true,
  },
  {
    id: 'emp-02',
    empNo: 'EMP-QTR-002',
    name: 'Tariq Mahmood',
    dept: 'Retail Sales',
    role: 'Lead Cashier',
    qid: '29104820194',
    qidExpiry: '2026-11-20',
    salary: 6500,
    isActive: true,
  },
  {
    id: 'emp-03',
    empNo: 'EMP-QTR-003',
    name: 'Fatima Al-Kuwari',
    dept: 'Accounting',
    role: 'Senior Accountant',
    qid: '29503920183',
    qidExpiry: '2028-01-10',
    salary: 14000,
    isActive: true,
  },
];

const loadStoredEmployees = (): Employee[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EMPLOYEES));
      return INITIAL_EMPLOYEES;
    }
    return JSON.parse(raw) as Employee[];
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

  const [formData, setFormData] = useState({
    empNo: '',
    name: '',
    dept: 'Retail Sales',
    role: 'Cashier',
    qid: '',
    qidExpiry: '',
    salary: '',
  });

  useEffect(() => {
    setEmployees(loadStoredEmployees());
  }, []);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      empNo: `EMP-QTR-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      dept: 'Retail Sales',
      role: 'Cashier',
      qid: `2900${Math.floor(1000000 + Math.random() * 9000000)}`,
      qidExpiry: '2027-12-31',
      salary: '6000',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      empNo: emp.empNo,
      name: emp.name,
      dept: emp.dept,
      role: emp.role,
      qid: emp.qid,
      qidExpiry: emp.qidExpiry,
      salary: emp.salary.toString(),
    });
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

    if (!formData.name.trim()) {
      alert('Please enter employee full name.');
      return;
    }

    let updated: Employee[];
    if (editingEmployee) {
      updated = employees.map((emp) =>
        emp.id === editingEmployee.id
          ? {
              ...emp,
              empNo: formData.empNo,
              name: formData.name,
              dept: formData.dept,
              role: formData.role,
              qid: formData.qid,
              qidExpiry: formData.qidExpiry,
              salary: parseFloat(formData.salary) || 0,
            }
          : emp
      );
    } else {
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        empNo: formData.empNo,
        name: formData.name,
        dept: formData.dept,
        role: formData.role,
        qid: formData.qid,
        qidExpiry: formData.qidExpiry,
        salary: parseFloat(formData.salary) || 0,
        isActive: true,
      };
      updated = [newEmp, ...employees];
    }

    setEmployees(updated);
    saveStoredEmployees(updated);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Employee Directory (HR)
          </h1>
          <p className="text-sm text-slate-500">
            Staff records, Qatar QID ID expiry alerts, and WPS salary structures.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Employee</span>
        </Button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Employees</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{employees.length}</p>
          </div>
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </Card>
        <Card className="p-4 border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Monthly Payroll</p>
            <p className="text-2xl font-black text-emerald-600">
              {formatQAR(employees.reduce((sum, e) => sum + e.salary, 0))}
            </p>
          </div>
          <div className="p-3 bg-sky-100 dark:bg-sky-950/60 text-sky-600 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </Card>
        <Card className="p-4 border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Active QID Compliant</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">100%</p>
          </div>
          <div className="p-3 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* TABLE */}
      <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Emp #</th>
                <th className="p-3">Full Name</th>
                <th className="p-3">Department & Role</th>
                <th className="p-3">Qatar ID (QID)</th>
                <th className="p-3">QID Expiry</th>
                <th className="p-3 text-right">Basic Salary</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {employees.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                    {e.empNo}
                  </td>
                  <td className="p-3 font-medium text-slate-900 dark:text-slate-100">
                    {e.name}
                  </td>
                  <td className="p-3 text-xs">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{e.dept}</p>
                    <p className="text-slate-400">{e.role || 'Staff'}</p>
                  </td>
                  <td className="p-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                    {e.qid}
                  </td>
                  <td className="p-3 text-xs">
                    <Badge variant="info">{e.qidExpiry}</Badge>
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {formatQAR(e.salary)}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(e)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 transition-colors"
                        title="Edit Employee"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(e.id)}
                        className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-950 rounded text-rose-600 transition-colors"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD / EDIT EMPLOYEE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden font-sans">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-lg">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>{editingEmployee ? 'Edit Employee Record' : 'Add New Employee'}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Employee No
                  </label>
                  <input
                    type="text"
                    value={formData.empNo}
                    onChange={(e) => setFormData({ ...formData, empNo: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mohammed Al-Kuwari"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.dept}
                    onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Retail Sales">Retail Sales</option>
                    <option value="Management">Management</option>
                    <option value="Accounting">Accounting</option>
                    <option value="Inventory & Logistics">Inventory & Logistics</option>
                    <option value="HR & Administration">HR & Administration</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Designation / Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Cashier"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Qatar ID (QID)
                  </label>
                  <input
                    type="text"
                    placeholder="29012345678"
                    value={formData.qid}
                    onChange={(e) => setFormData({ ...formData, qid: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    QID Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.qidExpiry}
                    onChange={(e) => setFormData({ ...formData, qidExpiry: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Basic Salary (QAR)
                </label>
                <input
                  type="number"
                  placeholder="6000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingEmployee ? 'Update Record' : 'Save Employee'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRPage;
