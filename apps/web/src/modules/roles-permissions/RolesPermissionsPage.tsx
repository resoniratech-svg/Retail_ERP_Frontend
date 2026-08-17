import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, RefreshCw, Printer, Check, ShieldCheck, MapPin } from 'lucide-react';

interface RoleRecord {
  id: string;
  roleName: string;
}

export const RolesPermissionsPage: React.FC = () => {
  const [roles, setRoles] = useState<RoleRecord[]>([
    { id: '1', roleName: 'Administrator' },
    { id: '2', roleName: 'Branch Manager' },
    { id: '3', roleName: 'POS Cashier' },
    { id: '4', roleName: 'Inventory Specialist' },
    { id: '5', roleName: 'Accountant' },
  ]);

  const [searchText, setSearchText] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>('1');

  // Modal States
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [isLocationAccessModalOpen, setIsLocationAccessModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  // Location Access Modal State (Matching Image 3)
  const [accessMode, setAccessMode] = useState<'User' | 'Location'>('User');
  const [selectedUser, setSelectedUser] = useState('Sai');
  const [locationList, setLocationList] = useState([
    { id: 'loc-1', name: 'Saudi Arabia', active: false },
    { id: 'loc-2', name: 'Doha Main Branch', active: true },
    { id: 'loc-3', name: 'Al Rayyan Outlet', active: false },
    { id: 'loc-4', name: 'Wakra Logistics Hub', active: false },
  ]);

  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    // If URL contains locationAccess=true or when triggered via top ribbon
    const isLocAccessParam = searchParams.get('locationAccess') === 'true' || location.search.includes('locationAccess=true');
    if (isLocAccessParam) {
      setIsLocationAccessModalOpen(true);
    }
  }, [searchParams, location.search, location.key]);

  const filteredRoles = roles.filter((r) => {
    const query = searchText.toLowerCase().trim();
    if (!query) return true;
    return r.roleName.toLowerCase().includes(query);
  });

  const handleClear = () => {
    setSearchText('');
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) {
      alert('Please enter Role Name');
      return;
    }
    const newRole: RoleRecord = {
      id: Date.now().toString(),
      roleName: newRoleName,
    };
    setRoles([newRole, ...roles]);
    setIsAddRoleModalOpen(false);
    setNewRoleName('');
  };

  const handleDeleteRole = () => {
    if (!selectedRoleId) {
      alert('Please select a role to delete.');
      return;
    }
    setRoles(roles.filter((r) => r.id !== selectedRoleId));
    setSelectedRoleId(null);
  };

  const handleToggleLocationAccess = (id: string) => {
    setLocationList((prev) => prev.map((loc) => (loc.id === id ? { ...loc, active: !loc.active } : loc)));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-100 font-sans text-xs select-none relative">
      {/* 1. TOP TITLE HEADER */}
      <div className="bg-slate-200 border-b border-slate-300 px-3 py-1.5 flex items-center justify-between shadow-xs">
        <h1 className="text-sm font-bold text-slate-800 tracking-tight">Employee Roles - DART POS</h1>
        <span className="text-[11px] text-slate-500 font-mono">Total Roles: {filteredRoles.length}</span>
      </div>

      {/* 2. INNER CENTERED TITLE BAR (Matching Target Image 2) */}
      <div className="bg-slate-300 py-1 border-b border-slate-400 text-center font-bold text-slate-800 text-xs shadow-inner">
        Employee Roles
      </div>

      {/* 3. SEARCH BAR ROW (Matching Target Image 2) */}
      <div className="bg-slate-200 p-2 border-b border-slate-300 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Enter text to search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-2 pr-6 py-1 border border-slate-400 rounded bg-white text-xs font-mono focus:border-cyan-600 focus:outline-none shadow-xs"
            autoFocus
          />
          <span className="absolute right-2 top-1.5 text-slate-400 text-[10px]">▼</span>
        </div>

        <button
          onClick={() => alert(`🔍 Searching Employee Roles for "${searchText}"`)}
          className="px-4 py-1 bg-slate-300 hover:bg-slate-400/80 text-slate-900 font-bold border border-slate-400 rounded shadow-xs active:bg-slate-400"
        >
          Find
        </button>

        <button
          onClick={handleClear}
          className="px-4 py-1 bg-slate-300 hover:bg-slate-400/80 text-slate-900 font-bold border border-slate-400 rounded shadow-xs active:bg-slate-400"
        >
          Clear
        </button>
      </div>

      {/* 4. MAIN CONTENT GRID & RIGHT TOOLBAR */}
      <div className="flex-1 flex overflow-hidden">
        {/* DATA GRID TABLE */}
        <div className="flex-1 overflow-auto bg-white border-r border-slate-300">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-200 font-bold text-slate-700 uppercase text-[11px] sticky top-0 border-b border-slate-300 shadow-xs">
              <tr>
                <th className="p-2 border-r border-slate-300">Role Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredRoles.length === 0 ? (
                <tr>
                  <td className="p-12 text-center text-slate-400 italic">
                    No Role records found. Click ➕ (Ctrl+A) to create a role.
                  </td>
                </tr>
              ) : (
                filteredRoles.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRoleId(r.id)}
                    className={`cursor-pointer hover:bg-sky-50 ${selectedRoleId === r.id ? 'bg-sky-100 font-bold text-slate-900' : 'text-slate-800'}`}
                  >
                    <td className="p-2 border-r border-slate-200 font-bold">{r.roleName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT FLOATING ACTION TOOLBAR (Matching Target Image 2 Right Strip) */}
        <div className="w-12 bg-slate-200 border-l border-slate-300 flex flex-col items-center py-2 gap-2 shrink-0">
          <button
            onClick={() => setIsAddRoleModalOpen(true)}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-emerald-700 shadow-xs relative group"
            title="New Role (Ctrl+A)"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">A</span>
          </button>

          <button
            onClick={() => {
              if (!selectedRoleId) alert('Please select a role to edit.');
              else alert('✏️ Edit Role permissions modal opened');
            }}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-amber-700 shadow-xs relative group"
            title="Edit Role (Ctrl+E)"
          >
            <Edit className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">E</span>
          </button>

          <button
            onClick={handleDeleteRole}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-rose-700 shadow-xs relative group"
            title="Delete Role (Ctrl+D)"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">D</span>
          </button>

          <button
            onClick={() => setIsLocationAccessModalOpen(true)}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-sky-700 shadow-xs relative group"
            title="Location Access Setup (Ctrl+R)"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">R</span>
          </button>

          <button
            onClick={() => alert('🖨️ Employee Roles Summary Report Preview (Ctrl+P)')}
            className="w-8 h-8 bg-slate-300 hover:bg-slate-400/80 border border-slate-400 rounded flex flex-col items-center justify-center text-indigo-700 shadow-xs relative group"
            title="Print Preview (Ctrl+P)"
          >
            <Printer className="w-4 h-4" />
            <span className="text-[8px] font-mono text-slate-600 absolute bottom-0.5 right-0.5">P</span>
          </button>
        </div>
      </div>

      {/* 5. BOTTOM STATUS PAGINATION FOOTER (Matching Target Image 2 Bottom) */}
      <div className="bg-slate-200 border-t border-slate-300 px-3 py-1 flex items-center justify-between text-[11px] text-slate-600 font-mono">
        <div className="flex items-center gap-1.5">
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">|◄</button>
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">◄</button>
          <span className="font-bold text-slate-800 px-2">Users {filteredRoles.length === 0 ? '0 of 0' : `1 of 1`}</span>
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">►</button>
          <button className="px-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 rounded">►|</button>
        </div>
        <div>Status: Ready | Server: Connected</div>
      </div>

      {/* 6. LOCATION ACCESS MODAL (Matching Target Image 3 100%) */}
      {isLocationAccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-200 rounded-xl shadow-2xl border border-slate-400 w-full max-w-md overflow-hidden font-sans">
            {/* Modal Title Bar */}
            <div className="bg-slate-300 text-slate-900 px-3 py-2 flex items-center justify-between border-b border-slate-400">
              <h2 className="text-xs font-bold tracking-wide">Location Access</h2>
              <button
                onClick={() => setIsLocationAccessModalOpen(false)}
                className="text-slate-600 hover:text-slate-900 font-bold text-sm px-1 rounded hover:bg-slate-400/50"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-3 space-y-3 bg-slate-100 text-xs">
              {/* Radio Selector Row matching Image 3 */}
              <div className="flex items-center gap-6 font-bold text-slate-800 pt-1 px-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accessMode"
                    checked={accessMode === 'User'}
                    onChange={() => setAccessMode('User')}
                  />
                  <span>User</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accessMode"
                    checked={accessMode === 'Location'}
                    onChange={() => setAccessMode('Location')}
                  />
                  <span>Location</span>
                </label>
              </div>

              {/* User Dropdown & Update Button Row matching Image 3 */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-semibold text-slate-700 shrink-0">User Name</span>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded font-semibold bg-white text-xs"
                  >
                    <option value="Sai">Sai</option>
                    <option value="Ahmed Al-Mansouri">Ahmed Al-Mansouri (SUPER_ADMIN)</option>
                    <option value="Tariq Mahmood">Tariq Mahmood</option>
                    <option value="Kassim Express">Kassim Express</option>
                  </select>
                </div>

                <button
                  onClick={() => alert(`✅ Location Access Permissions updated for ${selectedUser}!`)}
                  className="px-3 py-1 bg-slate-300 hover:bg-slate-400/80 text-slate-900 font-bold border border-slate-400 rounded shadow-xs flex items-center gap-1 shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Update</span>
                </button>
              </div>

              {/* Access Grid Table matching Image 3 */}
              <div className="border border-slate-300 rounded bg-white overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-200 font-bold text-slate-700 uppercase text-[11px] border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">User Name</th>
                      <th className="p-2 w-20 text-center">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {locationList.map((loc) => (
                      <tr key={loc.id} className="hover:bg-slate-50">
                        <td className="p-2 border-r border-slate-200 font-bold text-slate-800">{loc.name}</td>
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={loc.active}
                            onChange={() => handleToggleLocationAccess(loc.id)}
                            className="rounded border-slate-300"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. ADD ROLE MODAL */}
      {isAddRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-200 rounded-xl shadow-2xl border border-slate-400 w-full max-w-md overflow-hidden font-sans">
            <div className="bg-slate-300 text-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-400">
              <h2 className="text-xs font-bold">New Employee Role</h2>
              <button onClick={() => setIsAddRoleModalOpen(false)} className="text-slate-600 hover:text-slate-900 font-bold">✕</button>
            </div>
            <div className="p-4 space-y-3 bg-slate-100 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Role Name</label>
                <input
                  type="text"
                  placeholder="e.g. Supervisor"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded font-bold bg-white"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-300">
                <button onClick={() => setIsAddRoleModalOpen(false)} className="px-4 py-1.5 bg-slate-300 hover:bg-slate-400/80 text-slate-800 font-bold border border-slate-400 rounded">
                  Cancel
                </button>
                <button onClick={handleAddRole} className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Role</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissionsPage;
