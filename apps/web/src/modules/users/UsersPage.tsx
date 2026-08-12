import React, { useState } from 'react';
import { Card, Button, Input, Badge, Modal, Select } from '@qatar-erp/ui';
import { Plus, Search, Shield, UserCheck } from 'lucide-react';
import { UserRole } from '@qatar-erp/config';

export const UsersPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    { id: 'u-1', name: 'Ahmed Al-Mansouri', email: 'ahmed@qatar-erp.qa', role: 'SUPER_ADMIN', branch: 'Doha Main Branch', status: 'ACTIVE', lastLogin: '2026-08-12 10:15' },
    { id: 'u-2', name: 'Tariq Mahmood', email: 'tariq@qatar-erp.qa', role: 'CASHIER', branch: 'Al Rayyan Mall Branch', status: 'ACTIVE', lastLogin: '2026-08-12 09:30' },
    { id: 'u-3', name: 'Fatima Al-Kuwari', email: 'fatima@qatar-erp.qa', role: 'ACCOUNTANT', branch: 'Doha Main Branch', status: 'ACTIVE', lastLogin: '2026-08-11 16:45' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users Directory</h1>
          <p className="text-sm text-slate-500">Manage user accounts, roles, and branch assignments.</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 font-bold">
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <Card className="p-3 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name, email, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-[11px] font-semibold">
            <tr>
              <th className="p-3">User Name</th>
              <th className="p-3">Email Address</th>
              <th className="p-3">Assigned Role</th>
              <th className="p-3">Branch Location</th>
              <th className="p-3">Last Login</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3 font-bold">{u.name}</td>
                <td className="p-3 text-slate-500 text-xs">{u.email}</td>
                <td className="p-3"><Badge variant="info">{u.role}</Badge></td>
                <td className="p-3 text-xs">{u.branch}</td>
                <td className="p-3 text-xs font-mono">{u.lastLogin}</td>
                <td className="p-3 text-center"><Badge variant="success">{u.status}</Badge></td>
                <td className="p-3 text-center"><Button variant="outline" className="py-1 px-2.5 text-xs">Edit</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create User Account">
        <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
          <Input label="Full Name" placeholder="e.g. Khalid Al-Sowaidi" required />
          <Input label="Email Address" type="email" placeholder="user@qatar-erp.qa" required />
          <Select label="User Role" options={[{ value: 'CASHIER', label: 'Cashier' }, { value: 'ACCOUNTANT', label: 'Accountant' }]} />
          <Button type="submit" variant="primary" className="w-full font-bold mt-2">Save User</Button>
        </form>
      </Modal>
    </div>
  );
};
