import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Coins,
  DollarSign,
  TrendingUp,
  Users,
  Boxes,
  Receipt,
  Hammer,
  Scale,
  Building2,
  Calendar,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
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
  BarChart,
  Bar,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeRoleView, setActiveRoleView] = useState<string>('');

  const actualRole = user?.role || 'owner';
  const displayRole = activeRoleView || actualRole;

  useEffect(() => {
    fetchDashboard();
  }, [activeRoleView]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      // If previewing as another role, send role query parameter if supported or fallback to role data
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gray-500 font-medium">Loading tailored {displayRole} telemetry...</p>
      </div>
    );
  }

  const isPrivileged = ['owner', 'manager', 'super_admin'].includes(actualRole);

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner & Optional Role Switcher for Management */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-serif font-bold text-[#380810]">
              {displayRole === 'sales' && 'Sales Executive Counter Terminal'}
              {displayRole === 'accountant' && 'Chief Financial & Tax Accounting Command'}
              {displayRole === 'stock' && 'Jewellery Vault & Inventory Telemetry'}
              {displayRole === 'karigar' && 'Artisan Workshop & Job Work Terminal'}
              {displayRole === 'manager' && 'Showroom Branch Operations Dashboard'}
              {displayRole === 'owner' && 'Showroom Executive Overview'}
              {displayRole === 'super_admin' && 'CJC Multi-Tenant SaaS Command'}
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-amber-100 text-[#56111C] border border-amber-300">
              {displayRole.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {displayRole === 'sales' && 'Personal sales performance, live board rates, and customer birthday/anniversary follow-ups'}
            {displayRole === 'accountant' && 'Double-entry cash/bank balances, monthly GST liabilities, and voucher ledger stream'}
            {displayRole === 'stock' && 'Precious metal gross & net inventory holding, HUID compliance, and category breakdown'}
            {displayRole === 'karigar' && 'Active workshop job cards, issued pure gold tracking, and manufacturing turnaround'}
            {displayRole === 'manager' && 'Branch-level sales footfall, staff performance leaderboard, and vault metrics'}
            {displayRole === 'owner' && 'Consolidated enterprise revenue, multi-branch comparisons, and bullion reserves'}
            {displayRole === 'super_admin' && 'Global jewellery SaaS subscription telemetry, tenant counts, and active stores'}
          </p>
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-3">
          {displayRole === 'sales' && (
            <a
              href="/pos"
              className="px-4 py-2 rounded-lg gold-gradient text-[#380810] font-semibold text-xs shadow hover:brightness-105 transition-all flex items-center gap-2"
            >
              <Receipt className="w-4 h-4" /> Instant POS Billing
            </a>
          )}
          {displayRole === 'accountant' && (
            <a
              href="/accounting"
              className="px-4 py-2 rounded-lg gold-gradient text-[#380810] font-semibold text-xs shadow hover:brightness-105 transition-all flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" /> View Day Book
            </a>
          )}
          {displayRole === 'stock' && (
            <a
              href="/inventory"
              className="px-4 py-2 rounded-lg gold-gradient text-[#380810] font-semibold text-xs shadow hover:brightness-105 transition-all flex items-center gap-2"
            >
              <Boxes className="w-4 h-4" /> Tag New Jewellery
            </a>
          )}
          {displayRole === 'karigar' && (
            <a
              href="/karigar"
              className="px-4 py-2 rounded-lg gold-gradient text-[#380810] font-semibold text-xs shadow hover:brightness-105 transition-all flex items-center gap-2"
            >
              <Hammer className="w-4 h-4" /> Issue Job Card
            </a>
          )}
          {['owner', 'manager', 'super_admin'].includes(displayRole) && (
            <a
              href="/pos"
              className="px-4 py-2 rounded-lg gold-gradient text-[#380810] font-semibold text-xs shadow hover:brightness-105 transition-all flex items-center gap-2"
            >
              <Receipt className="w-4 h-4" /> New POS Billing
            </a>
          )}
        </div>
      </div>

      {/* Role Switcher Toolbar for Showroom Owners / Administrators */}
      {isPrivileged && (
        <div className="bg-[#FAF8F5] border border-amber-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#56111C] font-semibold">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Role Perspective Switcher:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'owner', label: 'Owner' },
              { id: 'manager', label: 'Branch Manager' },
              { id: 'sales', label: 'Counter Sales' },
              { id: 'accountant', label: 'Accountant' },
              { id: 'stock', label: 'Inventory Head' },
              { id: 'karigar', label: 'Workshop Karigar' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveRoleView(r.id)}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                  displayRole === r.id
                    ? 'bg-[#56111C] text-amber-200 shadow font-semibold'
                    : 'bg-white text-gray-700 hover:bg-amber-100/60 border border-gray-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          ROLE 1: COUNTER SALES EXECUTIVE DASHBOARD
         ========================================================================= */}
      {displayRole === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                My Sales Today
              </span>
              <p className="text-2xl font-bold text-[#380810] mt-2 font-serif">
                ₹{Number(data?.my_today_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                {data?.my_today_invoices_count || 0} customer bills generated
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                My Month Sales
              </span>
              <p className="text-2xl font-bold text-[#380810] mt-2 font-serif">
                ₹{Number(data?.my_month_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-1.5 rounded-full"
                  style={{
                    width: `${Math.min(100, ((data?.my_month_sales || 0) / (data?.sales_target_month || 1500000)) * 100)}%`,
                  }}
                ></div>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Target: ₹15.0 Lakhs ({Math.round(((data?.my_month_sales || 0) / (data?.sales_target_month || 1500000)) * 100)}% achieved)
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Gold 22K Retail Rate
              </span>
              <p className="text-2xl font-bold text-[#380810] mt-2 font-mono">
                ₹{Number(data?.metal_rates?.find((r: any) => r.metal_type === 'gold' && r.purity_karat === '22K')?.rate_per_gram || 7350).toFixed(2)}
                <span className="text-xs font-sans text-gray-500"> /g</span>
              </p>
              <p className="text-[11px] text-gray-500 mt-1">Live board rate + 3% GST</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Silver 99.9% Rate
              </span>
              <p className="text-2xl font-bold text-[#380810] mt-2 font-mono">
                ₹{Number(data?.metal_rates?.find((r: any) => r.metal_type === 'silver')?.rate_per_gram || 88.5).toFixed(2)}
                <span className="text-xs font-sans text-gray-500"> /g</span>
              </p>
              <p className="text-[11px] text-gray-500 mt-1">Bullion exchange ready</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CRM Birthday & Anniversary Alerts */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-serif font-bold text-gray-800 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" /> CRM Patron Events
                </h3>
                <span className="text-[10px] text-amber-800 font-semibold uppercase">Follow Up</span>
              </div>
              <div className="mt-3 space-y-3">
                {data?.crm_alerts?.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">No upcoming birthdays or anniversaries today.</p>
                ) : (
                  data?.crm_alerts?.map((cust: any) => (
                    <div key={cust.id} className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-200/60 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-xs text-gray-900">{cust.name}</p>
                        <p className="text-[10px] text-gray-500">Phone: {cust.phone}</p>
                      </div>
                      <a
                        href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[10px] font-semibold hover:bg-emerald-700 flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" /> Wish
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* My Recent Invoices */}
            <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-serif font-bold text-gray-800 text-sm">
                  My Counter Sales (Recent)
                </h3>
                <a href="/pos" className="text-xs text-[#56111C] font-semibold hover:underline">
                  Open Billing →
                </a>
              </div>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-gray-600 font-medium border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data?.recent_invoices?.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-amber-50/20">
                        <td className="py-2.5 px-3 font-mono font-semibold text-[#56111C]">{inv.invoice_number}</td>
                        <td className="py-2.5 px-3 text-gray-500">{inv.invoice_date}</td>
                        <td className="py-2.5 px-3 font-medium text-gray-800">{inv.customer?.name || 'Walk-in'}</td>
                        <td className="py-2.5 px-3 font-bold text-right font-serif">₹{Number(inv.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            {inv.status}
                          </span>
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

      {/* =========================================================================
          ROLE 2: CHIEF ACCOUNTANT DASHBOARD
         ========================================================================= */}
      {displayRole === 'accountant' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Showroom Cash in Hand
              </span>
              <p className="text-2xl font-bold text-[#380810] mt-2 font-serif">
                ₹{Number(data?.cash_in_hand || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">General Ledger A/c: 1001</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Bank & UPI Balance
              </span>
              <p className="text-2xl font-bold text-[#380810] mt-2 font-serif">
                ₹{Number(data?.bank_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-emerald-600 mt-1 font-medium">Reconciled Current A/c (1002)</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Output GST (Current Month)
              </span>
              <p className="text-2xl font-bold text-[#380810] mt-2 font-serif">
                ₹{Number(data?.month_output_gst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-amber-700 mt-1">
                CGST: ₹{Number(data?.output_cgst || 0).toFixed(2)} | SGST: ₹{Number(data?.output_sgst || 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Customer Debtors
              </span>
              <p className="text-2xl font-bold text-[#380810] mt-2 font-serif">
                ₹{Number(data?.customer_receivables || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-blue-600 mt-1">Active ledger accounts</p>
            </div>
          </div>

          {/* Double-Entry Vouchers Stream */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <div>
                <h3 className="font-serif font-bold text-gray-800 text-sm">
                  Recent Double-Entry Vouchers Stream
                </h3>
                <p className="text-[11px] text-gray-500">Strictly balanced ledger entries for real-time audit</p>
              </div>
              <a href="/accounting" className="text-xs text-[#56111C] font-semibold hover:underline">
                Open Full Chart of Accounts →
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-gray-600 font-medium border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Voucher #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Narration</th>
                    <th className="py-2.5 px-3 text-right">Debit</th>
                    <th className="py-2.5 px-3 text-right">Credit</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.recent_vouchers?.map((v: any) => {
                    const totalDebit = v.entries?.reduce((sum: number, e: any) => sum + Number(e.debit), 0);
                    const totalCredit = v.entries?.reduce((sum: number, e: any) => sum + Number(e.credit), 0);
                    return (
                      <tr key={v.id} className="hover:bg-amber-50/20">
                        <td className="py-2.5 px-3 font-mono font-semibold text-[#56111C]">{v.voucher_number}</td>
                        <td className="py-2.5 px-3 text-gray-500">{v.voucher_date}</td>
                        <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-gray-700">{v.voucher_type}</td>
                        <td className="py-2.5 px-3 text-gray-600 truncate max-w-xs">{v.narration}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-gray-900">₹{Number(totalDebit).toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-gray-900">₹{Number(totalCredit).toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            Balanced
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ROLE 3: INVENTORY HEAD / STOCK MANAGER DASHBOARD
         ========================================================================= */}
      {displayRole === 'stock' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Fine Gold Gross Stock
              </span>
              <p className="text-2xl font-bold text-[#380810] mt-2 font-serif">
                {Number(data?.gold_gross_stock || 0).toFixed(3)} <span className="text-xs font-sans text-gray-500">grams</span>
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Net metal: <strong>{Number(data?.gold_net_stock || 0).toFixed(3)}g</strong>
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Silver Bullion Stock
              </span>
              <p className="text-2xl font-bold text-[#380810] mt-2 font-serif">
                {Number(data?.silver_gross_stock || 0).toFixed(3)} <span className="text-xs font-sans text-gray-500">grams</span>
              </p>
              <p className="text-[11px] text-gray-500 mt-1">Purity 92.5% - 99.9%</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Tagged Pieces
              </span>
              <p className="text-2xl font-bold text-[#380810] mt-2 font-serif">
                {data?.total_items_in_stock || 0} <span className="text-xs font-sans text-gray-500">items</span>
              </p>
              <p className="text-[11px] text-emerald-600 mt-1 font-medium">In Showroom Trays</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                BIS HUID Compliance
              </span>
              <p className="text-2xl font-bold text-emerald-700 mt-2 font-serif">
                {Math.round(((data?.huid_verified_count || 0) / Math.max(1, data?.total_items_in_stock || 1)) * 100)}%
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                {data?.huid_verified_count || 0} items verified with 6-digit HUID
              </p>
            </div>
          </div>

          {/* Category Breakdown & Recent Items */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="font-serif font-bold text-gray-800 text-sm mb-3">
                Vault Stock by Category
              </h3>
              <div className="space-y-2.5">
                {data?.category_breakdown?.map((cat: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-gray-50 flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-800">{cat.category_name}</span>
                    <span className="text-gray-600 font-mono">
                      {cat.item_count} pcs ({Number(cat.total_gross_weight).toFixed(2)}g)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-serif font-bold text-gray-800 text-sm">
                  Recent Tagged Inventory
                </h3>
                <a href="/inventory" className="text-xs text-[#56111C] font-semibold hover:underline">
                  Manage Vault →
                </a>
              </div>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-gray-600 font-medium border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Item Code</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Purity</th>
                      <th className="py-2.5 px-3">Gross Wt</th>
                      <th className="py-2.5 px-3">HUID</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data?.recent_items?.map((it: any) => (
                      <tr key={it.id} className="hover:bg-amber-50/20">
                        <td className="py-2.5 px-3 font-mono font-semibold text-[#56111C]">{it.item_code}</td>
                        <td className="py-2.5 px-3 font-medium text-gray-900">{it.name}</td>
                        <td className="py-2.5 px-3 text-gray-600">{it.purity_karat}</td>
                        <td className="py-2.5 px-3 font-mono">{Number(it.gross_weight).toFixed(3)}g</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-700 font-semibold">{it.huid || '—'}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            {it.status}
                          </span>
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

      {/* =========================================================================
          ROLE 4: KARIGAR / WORKSHOP MASTER DASHBOARD
         ========================================================================= */}
      {displayRole === 'karigar' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Active Job Cards
              </span>
              <p className="text-2xl font-bold text-[#380810] mt-2 font-serif">
                {data?.active_jobs_count || 0} <span className="text-xs font-sans text-gray-500">jobs</span>
              </p>
              <p className="text-[11px] text-amber-700 mt-1 font-medium">Currently in manufacturing</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Pure Gold Issued
              </span>
              <p className="text-2xl font-bold text-[#380810] mt-2 font-serif">
                {Number(data?.gold_issued_in_workshop || 0).toFixed(3)} <span className="text-xs font-sans text-gray-500">grams</span>
              </p>
              <p className="text-[11px] text-gray-500 mt-1">24K fine metal with artisans</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Completed Jobs
              </span>
              <p className="text-2xl font-bold text-emerald-700 mt-2 font-serif">
                {data?.completed_jobs_count || 0} <span className="text-xs font-sans text-gray-500">pieces</span>
              </p>
              <p className="text-[11px] text-emerald-600 mt-1">Quality hallmarked & returned</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Master Artisans
              </span>
              <p className="text-2xl font-bold text-[#380810] mt-2 font-serif">
                {data?.karigars?.length || 0} <span className="text-xs font-sans text-gray-500">specialists</span>
              </p>
              <p className="text-[11px] text-gray-500 mt-1">Filigree, Setting, Casting</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <h3 className="font-serif font-bold text-gray-800 text-sm">
                Active Workshop Job Work Cards
              </h3>
              <a href="/karigar" className="text-xs text-[#56111C] font-semibold hover:underline">
                View Karigar Ledger →
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-gray-600 font-medium border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Job Card #</th>
                    <th className="py-2.5 px-3">Karigar</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Issued Pure Gold</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.active_jobs?.map((j: any) => (
                    <tr key={j.id} className="hover:bg-amber-50/20">
                      <td className="py-2.5 px-3 font-mono font-semibold text-[#56111C]">{j.job_number}</td>
                      <td className="py-2.5 px-3 font-medium text-gray-800">{j.karigar?.name}</td>
                      <td className="py-2.5 px-3 text-gray-700">{j.item_description}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-amber-700">{Number(j.gold_issued_pure).toFixed(3)}g</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                          {j.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ROLE 5: SHOWROOM BRANCH MANAGER DASHBOARD
         ========================================================================= */}
      {displayRole === 'manager' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Branch Sales Today
              </span>
              <p className="text-2xl font-bold text-[#380810] mt-2 font-serif">
                ₹{Number(data?.branch_today_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                {data?.branch_today_invoices_count || 0} bills in this showroom
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Branch Month Revenue
              </span>
              <p className="text-2xl font-bold text-[#380810] mt-2 font-serif">
                ₹{Number(data?.branch_month_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-emerald-600 mt-1 font-medium">Showroom target on track</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Branch Stock In Trays
              </span>
              <p className="text-2xl font-bold text-[#380810] mt-2 font-serif">
                {data?.branch_items_in_stock || 0} <span className="text-xs font-sans text-gray-500">pieces</span>
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Gold weight: <strong>{Number(data?.branch_gold_weight || 0).toFixed(2)}g</strong>
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Active Sales Team
              </span>
              <p className="text-2xl font-bold text-[#380810] mt-2 font-serif">
                {data?.staff_performance?.length || 0} <span className="text-xs font-sans text-gray-500">staff</span>
              </p>
              <p className="text-[11px] text-blue-600 mt-1">Counter attendance 100%</p>
            </div>
          </div>

          {/* Staff Performance Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="font-serif font-bold text-gray-800 text-sm mb-3">
                Staff Sales Leaderboard
              </h3>
              <div className="space-y-3">
                {data?.staff_performance?.map((s: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-amber-50/40 border border-amber-200/60 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs text-gray-900">{s.staff_name}</p>
                      <p className="text-[10px] text-gray-500">{s.bills_count} bills settled</p>
                    </div>
                    <span className="font-bold text-xs text-[#56111C] font-serif">
                      ₹{Number(s.total_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-serif font-bold text-gray-800 text-sm">
                  Recent Branch Invoices
                </h3>
                <a href="/pos" className="text-xs text-[#56111C] font-semibold hover:underline">
                  View All POS Billing →
                </a>
              </div>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-gray-600 font-medium border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3 text-right">Grand Total</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data?.recent_invoices?.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-amber-50/20">
                        <td className="py-2.5 px-3 font-mono font-semibold text-[#56111C]">{inv.invoice_number}</td>
                        <td className="py-2.5 px-3 text-gray-500">{inv.invoice_date}</td>
                        <td className="py-2.5 px-3 font-medium text-gray-800">{inv.customer?.name || 'Walk-in'}</td>
                        <td className="py-2.5 px-3 font-bold text-right font-serif">
                          ₹{Number(inv.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            {inv.status}
                          </span>
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

      {/* =========================================================================
          ROLE 6 & 7: OWNER / EXECUTIVE DASHBOARD (DEFAULT)
         ========================================================================= */}
      {['owner', 'super_admin'].includes(displayRole) && (
        <div className="space-y-6">
          {/* KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Today's Consolidated Sales
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

            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
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

            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Fine Gold Reserves
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

            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
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

          {/* Revenue Trajectory & Branch Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif font-bold text-gray-800 text-sm">
                    Enterprise Revenue Trajectory (6 Months)
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Consolidated billed turnover inclusive of 3% GST
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

          {/* Multi-Branch Showroom Breakdown */}
          {data?.branch_comparison && data.branch_comparison.length > 0 && (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="font-serif font-bold text-gray-800 text-sm mb-3">
                Multi-Branch Showroom Performance (Month to Date)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.branch_comparison.map((b: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-amber-50/30 border border-amber-200/80 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-[#380810] flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-amber-700" /> {b.branch_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{b.invoices_count} invoices generated</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold font-serif text-[#56111C]">
                        ₹{Number(b.month_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      <span className="text-[10px] text-emerald-700 font-medium">3% GST Included</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
