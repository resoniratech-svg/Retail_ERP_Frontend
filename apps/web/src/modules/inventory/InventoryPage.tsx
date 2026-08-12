import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@qatar-erp/ui';
import { Plus, ClipboardCheck, X, Search, Warehouse } from 'lucide-react';
import { productsService } from '@qatar-erp/api';

export interface StockItem {
  id: string;
  sku: string;
  name: string;
  warehouse: string;
  onHand: number;
  reserved: number;
  available: number;
  status: string;
}

const INITIAL_STOCK_ITEMS: StockItem[] = [
  { id: 'inv-1', sku: 'MILK-ALM-1L', name: 'Almarai Fresh Milk 1L', warehouse: 'Doha Central Depot', onHand: 142, reserved: 10, available: 132, status: 'IN_STOCK' },
  { id: 'inv-2', sku: 'RICE-KAH-5KG', name: 'Khabari Rice 5kg', warehouse: 'Al Rayyan Warehouse', onHand: 58, reserved: 5, available: 53, status: 'IN_STOCK' },
  { id: 'inv-3', sku: 'WAT-RAY-500ML', name: 'Rayyan Water 500ml Pack', warehouse: 'Doha Central Depot', onHand: 210, reserved: 0, available: 210, status: 'IN_STOCK' },
];

export const InventoryPage: React.FC = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>(() => {
    try {
      const stored = localStorage.getItem('qatar_erp_stock_items');
      return stored ? JSON.parse(stored) : INITIAL_STOCK_ITEMS;
    } catch {
      return INITIAL_STOCK_ITEMS;
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    sku: 'MILK-ALM-1L',
    name: 'Almarai Fresh Milk 1L',
    warehouse: 'Doha Central Depot',
    onHand: '150',
    reserved: '5',
  });

  const saveStockToStorage = (items: StockItem[]) => {
    try {
      localStorage.setItem('qatar_erp_stock_items', JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSaveStockTake = (e: React.FormEvent) => {
    e.preventDefault();

    const onHandQty = parseInt(formData.onHand, 10) || 0;
    const reservedQty = parseInt(formData.reserved, 10) || 0;
    const availableQty = Math.max(0, onHandQty - reservedQty);

    const existingIdx = stockItems.findIndex(
      (item) => item.sku.toLowerCase() === formData.sku.toLowerCase() && item.warehouse === formData.warehouse
    );

    let updatedList: StockItem[];

    if (existingIdx >= 0) {
      updatedList = stockItems.map((item, idx) =>
        idx === existingIdx
          ? {
              ...item,
              onHand: onHandQty,
              reserved: reservedQty,
              available: availableQty,
              status: availableQty > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
            }
          : item
      );
    } else {
      const newItem: StockItem = {
        id: `inv-${Date.now()}`,
        sku: formData.sku,
        name: formData.name || formData.sku,
        warehouse: formData.warehouse,
        onHand: onHandQty,
        reserved: reservedQty,
        available: availableQty,
        status: availableQty > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
      };
      updatedList = [newItem, ...stockItems];
    }

    setStockItems(updatedList);
    saveStockToStorage(updatedList);
    setIsModalOpen(false);
  };

  const filteredItems = stockItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouse.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Inventory Stock Locator</h1>
          <p className="text-sm text-slate-500">Real-time warehouse stock balances, reserved, and available quantities.</p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenModal}
          className="flex items-center gap-2 font-bold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Stock Take Count</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-3 flex items-center justify-between gap-4 border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU, product description, warehouse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>
      </Card>

      {/* Stock Data Table */}
      <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-[11px] font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3">SKU</th>
              <th className="p-3">Product Description</th>
              <th className="p-3">Warehouse Location</th>
              <th className="p-3 text-right">On Hand</th>
              <th className="p-3 text-right">Reserved</th>
              <th className="p-3 text-right">Available</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-3 font-mono font-bold text-xs text-slate-900 dark:text-slate-100">{item.sku}</td>
                <td className="p-3 font-medium text-slate-900 dark:text-slate-100">{item.name}</td>
                <td className="p-3 text-xs text-slate-500">{item.warehouse}</td>
                <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">{item.onHand}</td>
                <td className="p-3 text-right text-amber-600 font-semibold">{item.reserved}</td>
                <td className="p-3 text-right font-bold text-emerald-600">{item.available}</td>
                <td className="p-3 text-center">
                  <Badge variant={item.available > 0 ? 'success' : 'neutral'}>{item.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Stock Take Count Audit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden font-sans">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-lg">
                <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                <span>Perform Physical Stock Take Count</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStockTake} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Select Product / SKU</label>
                <select
                  value={formData.sku}
                  onChange={(e) => {
                    const selectedSku = e.target.value;
                    const matched = stockItems.find((s) => s.sku === selectedSku);
                    setFormData({
                      ...formData,
                      sku: selectedSku,
                      name: matched ? matched.name : selectedSku,
                    });
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="MILK-ALM-1L">MILK-ALM-1L - Almarai Fresh Milk 1L</option>
                  <option value="RICE-KAH-5KG">RICE-KAH-5KG - Khabari Rice 5kg</option>
                  <option value="WAT-RAY-500ML">WAT-RAY-500ML - Rayyan Water 500ml Pack</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Warehouse Location</label>
                <select
                  value={formData.warehouse}
                  onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Doha Central Depot">Doha Central Depot</option>
                  <option value="Al Rayyan Warehouse">Al Rayyan Warehouse</option>
                  <option value="Industrial Area Depot">Industrial Area Depot</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Physical On Hand Count</label>
                  <input
                    type="number"
                    value={formData.onHand}
                    onChange={(e) => setFormData({ ...formData, onHand: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Reserved Quantity</label>
                  <input
                    type="number"
                    value={formData.reserved}
                    onChange={(e) => setFormData({ ...formData, reserved: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    required
                  />
                </div>
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
                  Update Audit Count
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
