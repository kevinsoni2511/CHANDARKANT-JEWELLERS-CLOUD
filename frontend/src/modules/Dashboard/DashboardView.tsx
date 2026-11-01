import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Coins,
  DollarSign,
  TrendingUp,
  Users,
  Boxes,
  ArrowUpRight,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#380810]">
            Showroom Executive Overview
          </h2>
          <p className="text-xs text-gray-600">
            Real-time bullion stock holding, sales telemetry, and accounting reconciliations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/pos"
            className="px-4 py-2 rounded-lg gold-gradient text-[#380810] font-semibold text-xs shadow hover:brightness-105 transition-all flex items-center gap-2"
          >
            <Receipt className="w-4 h-4" /> New POS Billing
          </a>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Today's Sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#380810] mt-2 font-serif">
            ₹{Number(data?.today_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">{data?.today_invoices_count || 0}</span> invoices settled today
          </p>
        </div>

        {/* Monthly Sales */}
        <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              This Month Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#380810] mt-2 font-serif">
            ₹{Number(data?.month_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">
            Active GST Return Period
          </p>
        </div>

        {/* Gold Stock (Grams) */}
        <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Fine Gold Stock
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#380810] mt-2 font-serif">
            {Number(data?.gold_gross_stock || 0).toFixed(3)} <span className="text-xs font-sans text-gray-500">grams</span>
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            Net metal: <strong>{Number(data?.gold_net_stock || 0).toFixed(3)}g</strong> across {data?.total_items_in_stock || 0} items
          </p>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Customer Receivables
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#380810] mt-2 font-serif">
            ₹{Number(data?.outstanding_receivables || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            Total {data?.total_customers || 0} registered patrons
          </p>
        </div>
      </div>

      {/* Middle Row: Revenue Trend & Live Rate Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6-Month Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-gray-800 text-sm">
                Revenue Trajectory (Last 6 Months)
              </h3>
              <p className="text-[11px] text-gray-500">
                Monthly billed turnover inclusive of 3% GST
              </p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.sales_trend || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#56111C" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#56111C"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Metal Rate Board */}
        <div className="bg-[#380810] text-amber-100 rounded-xl p-5 border border-[#D4AF37]/30 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <h3 className="font-serif font-bold text-amber-200 text-sm flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" /> Today's Retail Rates
              </h3>
              <span className="text-[10px] text-amber-300/60 uppercase">Live INR / g</span>
            </div>

            <div className="mt-4 space-y-2.5">
              {data?.metal_rates?.map((rate: any) => (
                <div
                  key={rate.id}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-black/20 border border-amber-500/10"
                >
                  <span className="font-medium text-amber-200">
                    {rate.metal_type.toUpperCase()} {rate.purity_karat} ({rate.purity_percentage}%)
                  </span>
                  <strong className="text-amber-300 font-mono text-sm">
                    ₹{Number(rate.rate_per_gram).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-amber-500/20 text-center">
            <a
              href="/rates"
              className="text-xs text-amber-300 hover:text-amber-100 font-semibold underline underline-offset-4"
            >
              Adjust Daily Board Rates →
            </a>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-serif font-bold text-gray-800 text-sm">
            Recent Showroom Invoices
          </h3>
          <a href="/pos" className="text-xs text-[#56111C] font-semibold hover:underline">
            View All POS Billing →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.recent_invoices?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No recent invoices found. Settle your first sale from POS Billing.
                  </td>
                </tr>
              ) : (
                data?.recent_invoices?.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-[#56111C]">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3 px-4 text-gray-500">{inv.invoice_date}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {inv.customer?.name || 'Walk-in Patron'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{inv.branch?.name}</td>
                    <td className="py-3 px-4">{inv.items_count} pcs</td>
                    <td className="py-3 px-4 font-bold text-gray-900 text-right font-serif">
                      ₹{Number(inv.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
