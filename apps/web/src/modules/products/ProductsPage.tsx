import React, { useState } from 'react';
import { MOCK_PRODUCTS } from '@qatar-erp/api';
import { formatQAR } from '@qatar-erp/utils';
import { Plus, Search, Filter, Download, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button, Input, Badge, Card } from '@qatar-erp/ui';

export const ProductsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = MOCK_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm)
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-slate-500">Manage master product catalog, barcodes, and QAR pricing.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="flex flex-wrap items-center justify-between gap-4 p-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search product SKU, barcode, name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
            <option value="">All Categories</option>
            <option value="dairy">Dairy & Eggs</option>
            <option value="beverages">Beverages</option>
            <option value="rice">Rice & Grains</option>
          </select>
          <select className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
            <option value="">All Brands</option>
            <option value="almarai">Almarai</option>
            <option value="rayyan">Rayyan</option>
            <option value="khabari">Khabari</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-1.5 text-xs py-1.5">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
          <Button variant="outline" className="p-1.5">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Products Data Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">SKU / Barcode</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right">Price (QAR)</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{product.sku}</p>
                    <p className="text-slate-400">{product.barcode}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{product.name}</p>
                    {product.nameAr && <p className="text-xs text-slate-500 font-arabic">{product.nameAr}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                    {product.categoryName || 'General'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    <span className={product.stockQuantity < product.minStockLevel ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}>
                      {product.stockQuantity} {product.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {formatQAR(product.retailPrice)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={product.isActive ? 'success' : 'neutral'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950 rounded text-rose-600">
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
    </div>
  );
};
