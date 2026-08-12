import React from 'react';
import { Card, Button, Badge } from '@qatar-erp/ui';
import { formatQAR } from '@qatar-erp/utils';
import { Plus, UserCheck } from 'lucide-react';

export const HRPage: React.FC = () => {
  const employees = [
    { id: 'emp-01', empNo: 'EMP-QTR-001', name: 'Ahmed Al-Mansouri', dept: 'Management', qid: '28439201923', qidExpiry: '2027-05-15', salary: 22000 },
    { id: 'emp-02', empNo: 'EMP-QTR-002', name: 'Tariq Mahmood', dept: 'Retail Sales', qid: '29104820194', qidExpiry: '2026-11-20', salary: 6500 },
    { id: 'emp-03', empNo: 'EMP-QTR-003', name: 'Fatima Al-Kuwari', dept: 'Accounting', qid: '29503920183', qidExpiry: '2028-01-10', salary: 14000 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Directory (HR)</h1>
          <p className="text-sm text-slate-500">Staff records, Qatar QID ID expiry alerts, and WPS salary structures.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2 font-bold"><Plus className="w-4 h-4" /> Add Employee</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-[11px] font-semibold">
            <tr>
              <th className="p-3">Emp #</th>
              <th className="p-3">Full Name</th>
              <th className="p-3">Department</th>
              <th className="p-3">Qatar ID (QID)</th>
              <th className="p-3">QID Expiry</th>
              <th className="p-3 text-right">Basic Salary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {employees.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3 font-mono font-bold text-xs">{e.empNo}</td>
                <td className="p-3 font-medium">{e.name}</td>
                <td className="p-3 text-xs">{e.dept}</td>
                <td className="p-3 font-mono text-xs">{e.qid}</td>
                <td className="p-3 text-xs"><Badge variant="info">{e.qidExpiry}</Badge></td>
                <td className="p-3 text-right font-bold text-emerald-600">{formatQAR(e.salary)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
