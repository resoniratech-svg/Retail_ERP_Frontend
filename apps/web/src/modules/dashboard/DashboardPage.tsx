import React from 'react';
import { Card, Badge } from '@qatar-erp/ui';
import { formatQAR } from '@qatar-erp/utils';
import { TrendingUp, ShoppingBag, Box, Users, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const chartData = [
  { name: 'Sun', sales: 42000 },
  { name: 'Mon', sales: 58000 },
  { name: 'Tue', sales: 65000 },
  { name: 'Wed', sales: 72000 },
  { name: 'Thu', sales: 89000 },
  { name: 'Fri', sales: 110000 },
  { name: 'Sat', sales: 95000 },
];

export const DashboardPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Executive Dashboard</h1>
        <p className="text-sm text-slate-500">Real-time revenue, inventory velocity, and operational KPIs.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <p className="text-xs font-semibold text-slate-500">Today's Sales</p>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{formatQAR(110000)}</p>
            <span className="text-xs text-emerald-600 font-medium inline-flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3 h-3" /> +14.2% vs yesterday
            </span>
          </div>
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950 rounded-xl text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-l-4 border-l-sky-500">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Transactions</p>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">1,428</p>
            <span className="text-xs text-sky-600 font-medium inline-flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3 h-3" /> Across 4 branches
            </span>
          </div>
          <div className="p-3 bg-sky-100 dark:bg-sky-950 rounded-xl text-sky-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <p className="text-xs font-semibold text-slate-500">Low Stock Items</p>
            <p className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">12 SKU</p>
            <span className="text-xs text-amber-600 font-medium inline-flex items-center gap-0.5 mt-1">
              <AlertTriangle className="w-3 h-3" /> Reorder needed
            </span>
          </div>
          <div className="p-3 bg-amber-100 dark:bg-amber-950 rounded-xl text-amber-600">
            <Box className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-l-4 border-l-purple-500">
          <div>
            <p className="text-xs font-semibold text-slate-500">Active Customers</p>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">8,420</p>
            <span className="text-xs text-purple-600 font-medium inline-flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3 h-3" /> +120 this week
            </span>
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-950 rounded-xl text-purple-600">
            <Users className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Sales Trend Chart */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Weekly Sales Performance (QAR)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip formatter={(value: any) => formatQAR(Number(value))} />
              <Area type="monotone" dataKey="sales" stroke="#10b981" fill="#10b98120" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
