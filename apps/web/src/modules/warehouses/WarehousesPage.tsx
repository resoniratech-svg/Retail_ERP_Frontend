import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Input, Modal, Select } from '@qatar-erp/ui';
import { Plus, Warehouse as WhIcon, Search, Edit, Eye, Trash2, Settings2, X, ChevronRight, Power, PowerOff } from 'lucide-react';

// --- Types ---
type Bin = {
  id: string;
  code: string;
  notes?: string;
};

type Aisle = {
  id: string;
  code: string;
  bins: Bin[];
};

type Warehouse = {
  id: string;
  code: string;
  name: string;
  type: string;
  branch: string;
  manager: string;
  status: 'ACTIVE' | 'INACTIVE';
  address: string;
  city: string;
  country: string;
  capacity: number;
  capacityUnit: string;
  aisles: Aisle[];
};

// --- Seed Data ---
const initialWarehouses: Warehouse[] = [
  {
    id: 'wh-1',
    code: 'WH-DOH-01',
    name: 'Doha Central Logistics Depot',
    type: 'Main Depot',
    branch: 'Doha Main Branch',
    manager: 'Salim Al-Hajri',
    status: 'ACTIVE',
    address: 'Industrial Area, St 32',
    city: 'Doha',
    country: 'Qatar',
    capacity: 25000,
    capacityUnit: 'Sq Ft',
    aisles: [
      {
        id: 'a-1',
        code: 'A-01',
        bins: [
          { id: 'b-1', code: 'BIN-A01-001' },
          { id: 'b-2', code: 'BIN-A01-002' }
        ]
      }
    ]
  },
  {
    id: 'wh-2',
    code: 'WH-RAY-02',
    name: 'Al Rayyan Mall Storage',
    type: 'Store Room',
    branch: 'Al Rayyan Mall Branch',
    manager: 'Nasser Al-Kaabi',
    status: 'ACTIVE',
    address: 'Al Rayyan Mall Basement',
    city: 'Al Rayyan',
    country: 'Qatar',
    capacity: 10000,
    capacityUnit: 'Sq Ft',
    aisles: []
  }
];

// --- Storage Helper ---
const STORAGE_KEY = 'retail_erp_warehouses';

const getStoredWarehouses = (): Warehouse[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse warehouses from local storage', e);
  }
  return [];
};

const saveWarehouses = (warehouses: Warehouse[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(warehouses));
};

// --- Component ---
export const WarehousesPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAislesModalOpen, setIsAislesModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  const [activeWarehouse, setActiveWarehouse] = useState<Warehouse | null>(null);
  
  // Aisle & Bin Management state inside modal
  const [activeAisle, setActiveAisle] = useState<Aisle | null>(null);
  const [aisleFormMode, setAisleFormMode] = useState<'LIST' | 'AISLE_FORM' | 'BIN_FORM'>('LIST');
  const [aisleFormData, setAisleFormData] = useState({ id: '', code: '' });
  const [binFormData, setBinFormData] = useState({ id: '', code: '', notes: '' });
  
  // Form Data
  const initialFormData = {
    id: '',
    code: '',
    name: '',
    type: '',
    branch: '',
    manager: '',
    status: 'ACTIVE' as const,
    address: '',
    city: '',
    country: '',
    capacity: 0,
    capacityUnit: 'Sq Ft',
    aisles: [] as Aisle[]
  };
  
  const [formData, setFormData] = useState<Warehouse>(initialFormData);
  const [formError, setFormError] = useState('');

  // Initialization
  useEffect(() => {
    let data = getStoredWarehouses();
    if (data.length === 0) {
      saveWarehouses(initialWarehouses);
      data = initialWarehouses;
    }
    setWarehouses(data);
  }, []);

  // --- Handlers ---
  const handleOpenForm = (warehouse?: Warehouse) => {
    setFormError('');
    if (warehouse) {
      setFormData(warehouse);
    } else {
      setFormData(initialFormData);
    }
    setIsFormModalOpen(true);
  };

  const handleSaveWarehouse = () => {
    setFormError('');
    
    const code = formData.code.trim();
    const name = formData.name.trim();
    const branch = formData.branch.trim();
    
    if (!code) { setFormError('Warehouse Code is required'); return; }
    if (!name) { setFormError('Warehouse Name is required'); return; }
    if (!branch) { setFormError('Branch is required'); return; }
    if (formData.capacity < 0) { setFormError('Capacity cannot be negative'); return; }
    
    // Check uniqueness
    const exists = warehouses.find(w => w.code.toLowerCase() === code.toLowerCase() && w.id !== formData.id);
    if (exists) {
      setFormError('Warehouse Code already exists');
      return;
    }
    
    const newWarehouses = [...warehouses];
    
    if (formData.id) {
      // Update
      const index = newWarehouses.findIndex(w => w.id === formData.id);
      if (index > -1) {
        newWarehouses[index] = { ...formData, code, name, branch };
      }
    } else {
      // Create
      newWarehouses.push({
        ...formData,
        id: `wh-${Date.now()}`,
        code, name, branch
      });
    }
    
    setWarehouses(newWarehouses);
    saveWarehouses(newWarehouses);
    setIsFormModalOpen(false);
  };

  const handleToggleStatus = (warehouse: Warehouse) => {
    setActiveWarehouse(warehouse);
    setIsDeleteConfirmOpen(true);
  };

  const confirmToggleStatus = () => {
    if (activeWarehouse) {
      const newStatus: 'ACTIVE' | 'INACTIVE' = activeWarehouse.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const newWarehouses = warehouses.map(w => w.id === activeWarehouse.id ? { ...w, status: newStatus } : w);
      setWarehouses(newWarehouses);
      saveWarehouses(newWarehouses);
      
      // Update active warehouse if view modal is open
      if (isViewModalOpen) {
        setActiveWarehouse({ ...activeWarehouse, status: newStatus });
      }
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleOpenAisles = (warehouse: Warehouse) => {
    setActiveWarehouse(warehouse);
    setAisleFormMode('LIST');
    setActiveAisle(null);
    setIsAislesModalOpen(true);
  };

  // Aisle CRUD
  const handleSaveAisle = () => {
    if (!activeWarehouse) return;
    if (!aisleFormData.code.trim()) return;
    
    let updatedAisles = [...activeWarehouse.aisles];
    
    if (aisleFormData.id) {
      updatedAisles = updatedAisles.map(a => a.id === aisleFormData.id ? { ...a, code: aisleFormData.code.trim() } : a);
    } else {
      updatedAisles.push({
        id: `a-${Date.now()}`,
        code: aisleFormData.code.trim(),
        bins: []
      });
    }
    
    updateWarehouseAisles(updatedAisles);
    setAisleFormMode('LIST');
  };

  const handleDeleteAisle = (aisleId: string) => {
    if (!activeWarehouse) return;
    const updatedAisles = activeWarehouse.aisles.filter(a => a.id !== aisleId);
    updateWarehouseAisles(updatedAisles);
  };

  // Bin CRUD
  const handleSaveBin = () => {
    if (!activeWarehouse || !activeAisle) return;
    if (!binFormData.code.trim()) return;
    
    const updatedAisle = { ...activeAisle };
    let updatedBins = [...updatedAisle.bins];
    
    if (binFormData.id) {
      updatedBins = updatedBins.map(b => b.id === binFormData.id ? { ...b, code: binFormData.code.trim(), notes: binFormData.notes } : b);
    } else {
      updatedBins.push({
        id: `b-${Date.now()}`,
        code: binFormData.code.trim(),
        notes: binFormData.notes
      });
    }
    
    updatedAisle.bins = updatedBins;
    setActiveAisle(updatedAisle);
    
    const updatedAisles = activeWarehouse.aisles.map(a => a.id === updatedAisle.id ? updatedAisle : a);
    updateWarehouseAisles(updatedAisles);
    setAisleFormMode('LIST');
  };

  const handleDeleteBin = (binId: string) => {
    if (!activeWarehouse || !activeAisle) return;
    const updatedAisle = { ...activeAisle };
    updatedAisle.bins = updatedAisle.bins.filter(b => b.id !== binId);
    setActiveAisle(updatedAisle);
    
    const updatedAisles = activeWarehouse.aisles.map(a => a.id === updatedAisle.id ? updatedAisle : a);
    updateWarehouseAisles(updatedAisles);
  };

  const updateWarehouseAisles = (updatedAisles: Aisle[]) => {
    if (!activeWarehouse) return;
    const updatedWarehouse = { ...activeWarehouse, aisles: updatedAisles };
    setActiveWarehouse(updatedWarehouse);
    const newWarehouses = warehouses.map(w => w.id === updatedWarehouse.id ? updatedWarehouse : w);
    setWarehouses(newWarehouses);
    saveWarehouses(newWarehouses);
  };

  // --- Filtering ---
  const filteredWarehouses = warehouses.filter(w => {
    const matchesSearch = 
      w.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.manager.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'ALL' || w.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Warehouses & Storage Depots</h1>
          <p className="text-sm text-slate-500">Spatial warehouse layout, capacity, and bin assignments.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2 font-bold" onClick={() => handleOpenForm()}>
          <Plus className="w-4 h-4" /> Add Warehouse
        </Button>
      </div>

      <Card className="p-4 flex flex-wrap items-center justify-start gap-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code, name, branch or manager..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>
        <div className="w-full md:w-48">
          <Select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' }
            ]}
          />
        </div>
      </Card>

      {filteredWarehouses.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 border-2 border-dashed rounded-lg">
          <WhIcon className="w-12 h-12 mb-4 text-slate-300" />
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No warehouses found</h3>
          <p className="text-sm mt-1 text-center max-w-md">Try adjusting your filters or click "Add Warehouse" to create a new storage location.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Warehouse Code</th>
                <th className="px-4 py-3 whitespace-nowrap">Warehouse Name</th>
                <th className="px-4 py-3 whitespace-nowrap">Branch</th>
                <th className="px-4 py-3 whitespace-nowrap">Manager</th>
                <th className="px-4 py-3 whitespace-nowrap">Location</th>
                <th className="px-4 py-3 whitespace-nowrap">Capacity</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">Aisles</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">Bins</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {filteredWarehouses.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium">{w.code}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{w.name}</td>
                  <td className="px-4 py-3">{w.branch}</td>
                  <td className="px-4 py-3">{w.manager || '-'}</td>
                  <td className="px-4 py-3">{w.city ? `${w.city}, ${w.country}` : '-'}</td>
                  <td className="px-4 py-3 font-medium">{w.capacity.toLocaleString()} {w.capacityUnit}</td>
                  <td className="px-4 py-3">
                    <Badge variant={w.status === 'ACTIVE' ? 'success' : 'neutral'}>{w.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">{w.aisles.length}</td>
                  <td className="px-4 py-3 text-center">{w.aisles.reduce((acc, a) => acc + a.bins.length, 0)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600" onClick={() => { setActiveWarehouse(w); setIsViewModalOpen(true); }} title="View Details">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600" onClick={() => handleOpenForm(w)} title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${w.status === 'ACTIVE' ? 'text-rose-500 hover:text-rose-600' : 'text-emerald-500 hover:text-emerald-600'}`} onClick={() => handleToggleStatus(w)} title={w.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}>
                        {w.status === 'ACTIVE' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600" onClick={() => handleOpenAisles(w)} title="Manage Aisles & Bins">
                        <Settings2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- ADD / EDIT MODAL --- */}
      {isFormModalOpen && (
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={formData.id ? `Edit Warehouse: ${formData.code}` : "New Warehouse"}
          className="max-w-[1200px]"
        >
          <div className="w-full p-4 md:p-6 overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:hidden">
            {formError && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-md font-medium border border-rose-200">
                {formError}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Info */}
              <div className="space-y-4 lg:col-span-2">
                <h3 className="font-bold text-sm text-slate-800 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Warehouse Code *" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="e.g. WH-DOH-01" required />
                  <Input label="Warehouse Name *" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                  <Input label="Branch *" value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} required />
                  <Input label="Warehouse Type" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} />
                  <Input label="Manager" value={formData.manager} onChange={(e) => setFormData({...formData, manager: e.target.value})} />
                  <div>
                    <span className="text-slate-500 block mb-1.5 text-xs font-semibold uppercase">Status *</span>
                    <Select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE'})}
                      options={[
                        { value: 'ACTIVE', label: 'Active' },
                        { value: 'INACTIVE', label: 'Inactive' }
                      ]}
                    />
                  </div>
                </div>
              </div>
              
              {/* Sidebar Info */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-800 border-b pb-2">Location Details</h3>
                  <Input label="Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                    <Input label="Country" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-800 border-b pb-2">Storage Capacity</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Capacity" type="number" min="0" value={formData.capacity.toString()} onChange={(e) => setFormData({...formData, capacity: Number(e.target.value) || 0})} />
                    <Input label="Unit" value={formData.capacityUnit} onChange={(e) => setFormData({...formData, capacityUnit: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveWarehouse}>Save</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- VIEW MODAL --- */}
      {isViewModalOpen && activeWarehouse && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Warehouse Details: ${activeWarehouse.code}`}
          className="max-w-[900px]"
        >
          <div className="w-full p-4 md:p-6 overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">{activeWarehouse.name}</h2>
                <p className="text-slate-500">{activeWarehouse.type}</p>
              </div>
              <Badge variant={activeWarehouse.status === 'ACTIVE' ? 'success' : 'neutral'} className="text-sm px-3 py-1">
                {activeWarehouse.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="p-4 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Organization</h3>
                <div className="space-y-2">
                  <div className="flex flex-col"><span className="text-xs text-slate-500">Branch</span><span className="font-medium">{activeWarehouse.branch}</span></div>
                  <div className="flex flex-col"><span className="text-xs text-slate-500">Manager</span><span className="font-medium">{activeWarehouse.manager || 'Unassigned'}</span></div>
                </div>
              </Card>
              
              <Card className="p-4 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Location</h3>
                <div className="space-y-2">
                  <div className="flex flex-col"><span className="text-xs text-slate-500">Address</span><span className="font-medium">{activeWarehouse.address || '-'}</span></div>
                  <div className="flex flex-col"><span className="text-xs text-slate-500">City / Country</span><span className="font-medium">{activeWarehouse.city || '-'} / {activeWarehouse.country || '-'}</span></div>
                </div>
              </Card>

              <Card className="p-4 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Structure</h3>
                <div className="space-y-2">
                  <div className="flex flex-col"><span className="text-xs text-slate-500">Capacity</span><span className="font-medium text-emerald-600">{activeWarehouse.capacity.toLocaleString()} {activeWarehouse.capacityUnit}</span></div>
                  <div className="flex flex-col"><span className="text-xs text-slate-500">Aisles & Bins</span><span className="font-medium">{activeWarehouse.aisles.length} Aisles / {activeWarehouse.aisles.reduce((acc, a) => acc + a.bins.length, 0)} Bins</span></div>
                </div>
              </Card>
            </div>
            
            <div className="flex justify-between items-center mt-8 pt-4 border-t">
              <div className="flex gap-2">
                <Button variant="outline" className={activeWarehouse.status === 'ACTIVE' ? 'text-rose-500 hover:text-rose-600' : 'text-emerald-500 hover:text-emerald-600'} onClick={() => handleToggleStatus(activeWarehouse)}>
                  {activeWarehouse.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                <Button variant="primary" onClick={() => { setIsViewModalOpen(false); handleOpenForm(activeWarehouse); }}>Edit Warehouse</Button>
                <Button variant="primary" className="bg-slate-800 hover:bg-slate-700" onClick={() => { setIsViewModalOpen(false); handleOpenAisles(activeWarehouse); }}>Manage Aisles & Bins</Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* --- AISLES & BINS MODAL --- */}
      {isAislesModalOpen && activeWarehouse && (
        <Modal
          isOpen={isAislesModalOpen}
          onClose={() => setIsAislesModalOpen(false)}
          title={`Storage Structure: ${activeWarehouse.code}`}
          className="max-w-[1000px]"
        >
          <div className="w-full p-4 md:p-6 overflow-y-auto min-h-[500px] max-h-[75vh] [&::-webkit-scrollbar]:hidden flex flex-col">
            
            {/* Header/Nav inside modal */}
            <div className="flex items-center gap-2 mb-6 text-sm font-medium border-b pb-4">
              <button 
                className={`hover:text-blue-600 transition-colors ${aisleFormMode === 'LIST' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}
                onClick={() => setAisleFormMode('LIST')}
              >
                Aisles
              </button>
              {activeAisle && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-800 font-bold">Aisle {activeAisle.code} Bins</span>
                </>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1">
              {/* AISLE LIST */}
              {aisleFormMode === 'LIST' && !activeAisle && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800">Aisles ({activeWarehouse.aisles.length})</h3>
                    <Button variant="outline" size="sm" onClick={() => { setAisleFormData({ id: '', code: '' }); setAisleFormMode('AISLE_FORM'); }}><Plus className="w-3.5 h-3.5 mr-1"/> Add Aisle</Button>
                  </div>
                  
                  {activeWarehouse.aisles.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 border-2 border-dashed rounded bg-slate-50">
                      No aisles configured. Add one to start mapping storage.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {activeWarehouse.aisles.map(aisle => (
                        <Card key={aisle.id} className="p-3 flex justify-between items-center border hover:border-blue-400 transition-colors cursor-pointer" onClick={() => { setActiveAisle(aisle); setAisleFormMode('LIST'); }}>
                          <div>
                            <div className="font-bold text-sm text-slate-800">{aisle.code}</div>
                            <div className="text-xs text-slate-500">{aisle.bins.length} Bins</div>
                          </div>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex justify-center items-center text-slate-400 hover:text-blue-600" onClick={() => { setAisleFormData({ id: aisle.id, code: aisle.code }); setAisleFormMode('AISLE_FORM'); }}><Edit className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex justify-center items-center text-slate-400 hover:text-rose-600" onClick={() => handleDeleteAisle(aisle.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* BINS LIST (When an Aisle is selected) */}
              {aisleFormMode === 'LIST' && activeAisle && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800">Bins in {activeAisle.code} ({activeAisle.bins.length})</h3>
                    <Button variant="outline" size="sm" onClick={() => { setBinFormData({ id: '', code: '', notes: '' }); setAisleFormMode('BIN_FORM'); }}><Plus className="w-3.5 h-3.5 mr-1"/> Add Bin</Button>
                  </div>
                  
                  {activeAisle.bins.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 border-2 border-dashed rounded bg-slate-50">
                      No bins configured in this aisle.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activeAisle.bins.map(bin => (
                        <div key={bin.id} className="p-3 flex justify-between items-center border rounded bg-white hover:bg-slate-50">
                          <div className="flex gap-4 items-center">
                            <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">{bin.code}</span>
                            {bin.notes && <span className="text-xs text-slate-500 truncate max-w-[200px]">{bin.notes}</span>}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => { setBinFormData({ id: bin.id, code: bin.code, notes: bin.notes || '' }); setAisleFormMode('BIN_FORM'); }}>Edit</Button>
                            <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => handleDeleteBin(bin.id)}>Delete</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* AISLE FORM */}
              {aisleFormMode === 'AISLE_FORM' && (
                <div className="max-w-md mx-auto mt-8">
                  <h3 className="font-bold mb-4">{aisleFormData.id ? 'Edit Aisle' : 'New Aisle'}</h3>
                  <div className="space-y-4 mb-6">
                    <Input label="Aisle Code *" placeholder="e.g. A-01" value={aisleFormData.code} onChange={(e) => setAisleFormData({...aisleFormData, code: e.target.value})} autoFocus />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setAisleFormMode('LIST')}>Cancel</Button>
                    <Button variant="primary" onClick={handleSaveAisle}>Save Aisle</Button>
                  </div>
                </div>
              )}

              {/* BIN FORM */}
              {aisleFormMode === 'BIN_FORM' && (
                <div className="max-w-md mx-auto mt-8">
                  <h3 className="font-bold mb-4">{binFormData.id ? 'Edit Bin' : 'New Bin'}</h3>
                  <div className="space-y-4 mb-6">
                    <Input label="Bin Code *" placeholder="e.g. BIN-A01-001" value={binFormData.code} onChange={(e) => setBinFormData({...binFormData, code: e.target.value})} autoFocus />
                    <Input label="Notes" placeholder="Optional notes" value={binFormData.notes} onChange={(e) => setBinFormData({...binFormData, notes: e.target.value})} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setAisleFormMode('LIST')}>Cancel</Button>
                    <Button variant="primary" onClick={handleSaveBin}>Save Bin</Button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
              {activeAisle && aisleFormMode === 'LIST' && (
                <Button variant="outline" className="mr-auto" onClick={() => setActiveAisle(null)}>Back to Aisles</Button>
              )}
              <Button variant="outline" onClick={() => setIsAislesModalOpen(false)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- DELETE / STATUS CONFIRM MODAL --- */}
      {isDeleteConfirmOpen && activeWarehouse && (
        <Modal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          title="Confirm Action"
        >
          <div className="p-6">
            <p className="text-slate-700 mb-6">
              Are you sure you want to <strong>{activeWarehouse.status === 'ACTIVE' ? 'DEACTIVATE' : 'ACTIVATE'}</strong> warehouse <span className="font-bold">{activeWarehouse.code}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
              <Button variant="primary" className={activeWarehouse.status === 'ACTIVE' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'} onClick={confirmToggleStatus}>
                Yes, {activeWarehouse.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
