import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
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
  SlidersHorizontal,
  Settings2,
  Check,
  Mic,
  PlusCircle,
  Eye,
  EyeOff,
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
  const { user } = useAuth();
  const { theme } = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeRoleView, setActiveRoleView] = useState<string>('');
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Widget visibility state
  const [widgets, setWidgets] = useState({
    kpis: true,
    quickActions: true,
    charts: true,
    rates: true,
    branches: true,
    crm: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem('cjc_dashboard_widgets_v2');
    if (saved) {
      try {
        setWidgets(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const toggleWidget = (key: keyof typeof widgets) => {
    setWidgets((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('cjc_dashboard_widgets_v2', JSON.stringify(next));
      return next;
    });
  };

  const actualRole = user?.role || 'owner';
  const displayRole = activeRoleView || actualRole;

  useEffect(() => {
    fetchDashboard();
  }, [activeRoleView]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
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
        <div className="w-10 h-10 border-4 border-[#C9A34A] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium font-mono uppercase tracking-wider">
          Syncing {displayRole} telemetry stream...
        </p>
      </div>
    );
  }

  const isPrivileged = ['owner', 'manager', 'super_admin'].includes(actualRole);

  const formatDate = (val: string) => {
    if (!val) return '—';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return val;
    }
  };

  const quickActionItems = [
    { title: 'POS Billing', href: '/pos', icon: Receipt, badge: 'Fast' },
    { title: 'Voice AI', href: '/zero-capture', icon: Mic, badge: 'AI' },
    { title: 'Smart OCR', href: '/zero-capture', icon: Sparkles, badge: 'OCR' },
    { title: 'Tag Vault Piece', href: '/inventory', icon: Boxes },
    { title: 'Bullion Board', href: '/rates', icon: TrendingUp },
    { title: 'Day Book Ledger', href: '/accounting', icon: FileSpreadsheet },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Banner & Optional Role Switcher for Management */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E3DFD7] dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#111318] dark:text-[#F6F5F1]">
              {displayRole === 'sales' && 'Sales Executive Counter Terminal'}
              {displayRole === 'accountant' && 'Chief Financial & Tax Accounting Command'}
              {displayRole === 'stock' && 'Jewellery Vault & Inventory Telemetry'}
              {displayRole === 'karigar' && 'Artisan Workshop & Job Work Terminal'}
              {displayRole === 'manager' && 'Showroom Branch Operations Dashboard'}
              {displayRole === 'owner' && 'Showroom Executive Overview'}
              {displayRole === 'super_admin' && 'CJC Multi-Tenant SaaS Command'}
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#C9A34A]/15 text-[#C9A34A] border border-[#C9A34A]/30">
              {displayRole.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            {displayRole === 'sales' && 'Personal sales performance, live board rates, and customer birthday/anniversary follow-ups'}
            {displayRole === 'accountant' && 'Double-entry cash/bank balances, monthly GST liabilities, and voucher ledger stream'}
            {displayRole === 'stock' && 'Precious metal gross & net inventory holding, HUID compliance, and category breakdown'}
            {displayRole === 'karigar' && 'Active workshop job cards, issued pure gold tracking, and manufacturing turnaround'}
            {displayRole === 'manager' && 'Branch-level sales footfall, staff performance leaderboard, and vault metrics'}
            {displayRole === 'owner' && 'Consolidated enterprise revenue, multi-branch comparisons, and bullion reserves'}
            {displayRole === 'super_admin' && 'Global jewellery SaaS subscription telemetry, tenant counts, and active stores'}
          </p>
        </div>

        {/* Dashboard Customization & Primary Trigger */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowCustomizer(!showCustomizer)}
            title="Customize Dashboard Layout"
            className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Settings2 className="w-4 h-4 text-[#C9A34A]" />
            <span className="hidden sm:inline">Customize Widgets</span>
          </button>

          <a
            href="/pos"
            className="px-4 py-2 rounded-xl gold-gradient text-[#111318] font-bold text-xs shadow-md hover:brightness-105 transition-all flex items-center gap-2"
          >
            <Receipt className="w-4 h-4 text-[#111318]" /> Instant POS Bill
          </a>
        </div>
      </div>

      {/* Widget Customizer Dropdown Drawer */}
      {showCustomizer && (
        <div className="p-4 bg-[#FFFFFF] dark:bg-[#181A22] border border-[#E3DFD7] dark:border-white/10 rounded-2xl shadow-lg space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#E3DFD7] dark:border-white/5 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#111318] dark:text-[#F6F5F1]">
              <SlidersHorizontal className="w-4 h-4 text-[#C9A34A]" />
              <span>Personalize Your Dashboard Grid</span>
            </div>
            <span className="text-[10px] text-[#8E929E] font-mono">Changes persist automatically</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { id: 'kpis', label: 'Metric KPIs' },
              { id: 'quickActions', label: 'Quick Actions' },
              { id: 'charts', label: 'Revenue Chart' },
              { id: 'rates', label: 'Metal Rates Board' },
              { id: 'branches', label: 'Branch Compare' },
              { id: 'crm', label: 'Patron CRM' },
            ].map((w) => {
              const active = widgets[w.id as keyof typeof widgets];
              return (
                <button
                  key={w.id}
                  onClick={() => toggleWidget(w.id as keyof typeof widgets)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-between transition-all ${
                    active
                      ? 'bg-[#C9A34A]/15 border-[#C9A34A]/30 text-[#C9A34A] font-semibold'
                      : 'border-[#E3DFD7] dark:border-white/10 text-[#8E929E] opacity-60'
                  }`}
                >
                  <span>{w.label}</span>
                  {active ? <Eye className="w-3.5 h-3.5 text-[#C9A34A]" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Role Switcher Toolbar for Showroom Owners / Administrators */}
      {isPrivileged && (
        <div className="bg-[#FFFFFF] dark:bg-[#181A22] border border-[#E3DFD7] dark:border-white/10 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2 text-[#111318] dark:text-[#F6F5F1] font-semibold">
            <Sparkles className="w-4 h-4 text-[#C9A34A]" />
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
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  displayRole === r.id
                    ? 'gold-gradient text-[#111318] shadow font-bold'
                    : 'bg-[#ECEAE4]/50 dark:bg-white/5 text-[#5A5E6B] dark:text-[#A6AAB6] hover:bg-[#ECEAE4] dark:hover:bg-white/10 border border-[#E3DFD7] dark:border-white/5'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions Bar */}
      {widgets.quickActions && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Quick Actions Bar
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3">
            {quickActionItems.map((act) => {
              const Icon = act.icon;
              const isAi = act.badge === 'AI' || act.badge === 'OCR';
              return (
                <a
                  key={act.title}
                  href={act.href}
                  className="bg-white dark:bg-[#181A22] border border-[#E3DFD7] dark:border-white/10 hover:border-[#C9A34A]/50 rounded-xl p-3 flex items-center justify-between group shadow-sm hover:shadow transition-all min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <div className={`p-1.5 rounded-lg shrink-0 ${isAi ? 'bg-[#8B7CF6]/15 text-[#8B7CF6]' : 'bg-[#C9A34A]/10 text-[#C9A34A]'} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-[#111318] dark:text-[#F6F5F1] truncate">
                      {act.title}
                    </span>
                  </div>
                  {act.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ml-1.5 ${
                      isAi
                        ? 'bg-[#8B7CF6]/15 text-[#8B7CF6] border border-[#8B7CF6]/30'
                        : 'bg-[#C9A34A]/15 text-[#C9A34A] border border-[#C9A34A]/30'
                    }`}>
                      {act.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          ROLE 1: COUNTER SALES EXECUTIVE DASHBOARD
         ========================================================================= */}
      {displayRole === 'sales' && (
        <div className="space-y-6">
          {widgets.kpis && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-[#E3DFD7] dark:border-white/10 shadow-sm">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  My Sales Today
                </span>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-serif">
                  ₹{Number(data?.my_today_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-[#35BFA0] mt-1 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#35BFA0] inline-block" />
                  {data?.my_today_invoices_count || 0} customer bills generated
                </p>
              </div>

              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-[#E3DFD7] dark:border-white/10 shadow-sm">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  My Month Sales
                </span>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-serif">
                  ₹{Number(data?.my_month_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <div className="mt-2 w-full bg-zinc-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="gold-gradient h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(100, ((data?.my_month_sales || 0) / (data?.sales_target_month || 1500000)) * 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Target: ₹15.0 Lakhs ({Math.round(((data?.my_month_sales || 0) / (data?.sales_target_month || 1500000)) * 100)}% achieved)
                </p>
              </div>

              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-[#E3DFD7] dark:border-white/10 shadow-sm">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Gold 22K Retail Rate
                </span>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-mono">
                  ₹{Number(data?.metal_rates?.find((r: any) => r.metal_type === 'gold' && r.purity_karat === '22K')?.rate_per_gram || 7350).toFixed(2)}
                  <span className="text-xs font-sans text-zinc-500"> /g</span>
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Live board rate + 3% GST</p>
              </div>

              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-[#E3DFD7] dark:border-white/10 shadow-sm">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Silver 99.9% Rate
                </span>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-mono">
                  ₹{Number(data?.metal_rates?.find((r: any) => r.metal_type === 'silver')?.rate_per_gram || 88.5).toFixed(2)}
                  <span className="text-xs font-sans text-zinc-500"> /g</span>
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Bullion exchange ready</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CRM Birthday & Anniversary Alerts */}
            {widgets.crm && (
              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-[#E3DFD7] dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#E3DFD7] dark:border-white/5">
                  <h3 className="font-serif font-bold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#C9A34A]" /> CRM Patron Events
                  </h3>
                  <span className="text-[10px] text-[#C9A34A] font-semibold uppercase">Follow Up</span>
                </div>
                <div className="mt-3 space-y-3">
                  {data?.crm_alerts?.length === 0 ? (
                    <p className="text-xs text-zinc-400 py-4 text-center">No upcoming birthdays or anniversaries today.</p>
                  ) : (
                    data?.crm_alerts?.map((cust: any) => (
                      <div key={cust.id} className="p-2.5 rounded-xl bg-[#C9A34A]/5 border border-[#C9A34A]/20 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">{cust.name}</p>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">Phone: {cust.phone}</p>
                        </div>
                        <a
                          href={`https://wa.me/${cust.phone?.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-[#25D366] text-white text-[10px] font-semibold hover:brightness-105 flex items-center gap-1 shadow-sm"
                        >
                          <PhoneCall className="w-3 h-3" /> Wish
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* My Recent Invoices */}
            <div className={`${widgets.crm ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-[#E3DFD7] dark:border-white/10 shadow-sm`}>
              <div className="flex items-center justify-between pb-3 border-b border-[#E3DFD7] dark:border-white/5">
                <h3 className="font-serif font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  My Counter Sales (Recent)
                </h3>
                <a href="/pos" className="text-xs text-[#C9A34A] font-semibold hover:underline">
                  Open Billing →
                </a>
              </div>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className="bg-[#FAF8F5] dark:bg-[#111318] text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-white/10">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">Invoice #</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Customer</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Amount</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                    {data?.recent_invoices?.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-[#C9A34A]/5 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold text-[#C9A34A] whitespace-nowrap">{inv.invoice_number}</td>
                        <td className="py-2.5 px-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap font-mono text-[11px]">{formatDate(inv.invoice_date)}</td>
                        <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap truncate max-w-[130px]" title={inv.customer?.name || 'Walk-in'}>
                          {inv.customer?.name || 'Walk-in'}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-right font-serif whitespace-nowrap text-[#111318] dark:text-[#F6F5F1]">
                          ₹{Number(inv.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            String(inv.status).toLowerCase().includes('paid') || String(inv.status).toLowerCase().includes('settled')
                              ? 'bg-[#35BFA0]/15 text-[#35BFA0] border border-[#35BFA0]/30'
                              : 'bg-[#C9A34A]/15 text-[#C9A34A] border border-[#C9A34A]/30'
                          }`}>
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
          {widgets.kpis && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-zinc-200 dark:border-white/10 shadow-sm">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Showroom Cash in Hand
                </span>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-serif">
                  ₹{Number(data?.cash_in_hand || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-mono">GL A/c: 1001</p>
              </div>

              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-zinc-200 dark:border-white/10 shadow-sm">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Bank & UPI Balance
                </span>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-serif">
                  ₹{Number(data?.bank_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Reconciled Current A/c</p>
              </div>

              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-zinc-200 dark:border-white/10 shadow-sm">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Output GST (Current Month)
                </span>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-serif">
                  ₹{Number(data?.month_output_gst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-[#C9A34A] mt-1 font-mono">
                  CGST: ₹{Number(data?.output_cgst || 0).toFixed(2)} | SGST: ₹{Number(data?.output_sgst || 0).toFixed(2)}
                </p>
              </div>

              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-zinc-200 dark:border-white/10 shadow-sm">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Customer Debtors
                </span>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-serif">
                  ₹{Number(data?.customer_receivables || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">Active ledger accounts</p>
              </div>
            </div>
          )}

          {/* Double-Entry Vouchers Stream */}
          <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-zinc-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/5 mb-3">
              <div>
                <h3 className="font-serif font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  Recent Double-Entry Vouchers Stream
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Strictly balanced ledger entries for real-time audit</p>
              </div>
              <a href="/accounting" className="text-xs text-[#C9A34A] font-semibold hover:underline">
                Open Full Chart of Accounts →
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead className="bg-[#FAF8F5] dark:bg-[#111318] text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-white/10">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">Voucher #</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Type</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Narration</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Debit</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Credit</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                  {data?.recent_vouchers?.map((v: any) => {
                    const totalDebit = v.entries?.reduce((sum: number, e: any) => sum + Number(e.debit), 0);
                    const totalCredit = v.entries?.reduce((sum: number, e: any) => sum + Number(e.credit), 0);
                    return (
                      <tr key={v.id} className="hover:bg-[#C9A34A]/5 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold text-[#C9A34A] whitespace-nowrap">{v.voucher_number}</td>
                        <td className="py-2.5 px-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap font-mono text-[11px]">{formatDate(v.voucher_date)}</td>
                        <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{v.voucher_type}</td>
                        <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400 truncate max-w-xs">{v.narration}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">₹{Number(totalDebit).toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">₹{Number(totalCredit).toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#35BFA0]/15 text-[#35BFA0] border border-[#35BFA0]/30">
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
          {widgets.kpis && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-zinc-200 dark:border-white/10 shadow-sm">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Fine Gold Gross Stock
                </span>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-serif">
                  {Number(data?.gold_gross_stock || 0).toFixed(3)} <span className="text-xs font-sans text-zinc-500">grams</span>
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Net metal: <strong>{Number(data?.gold_net_stock || 0).toFixed(3)}g</strong>
                </p>
              </div>

              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-zinc-200 dark:border-white/10 shadow-sm">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Silver Bullion Stock
                </span>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-serif">
                  {Number(data?.silver_gross_stock || 0).toFixed(3)} <span className="text-xs font-sans text-zinc-500">grams</span>
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Purity 92.5% - 99.9%</p>
              </div>

              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-zinc-200 dark:border-white/10 shadow-sm">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Total Tagged Pieces
                </span>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-serif">
                  {data?.total_items_in_stock || 0} <span className="text-xs font-sans text-zinc-500">items</span>
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">In Showroom Trays</p>
              </div>

              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-zinc-200 dark:border-white/10 shadow-sm">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  BIS HUID Compliance
                </span>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-2 font-serif">
                  {Math.round(((data?.huid_verified_count || 0) / Math.max(1, data?.total_items_in_stock || 1)) * 100)}%
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  {data?.huid_verified_count || 0} items verified with 6-digit HUID
                </p>
              </div>
            </div>
          )}

          {/* Category Breakdown & Recent Items */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-zinc-200 dark:border-white/10 shadow-sm">
              <h3 className="font-serif font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-3">
                Vault Stock by Category
              </h3>
              <div className="space-y-2.5">
                {data?.category_breakdown?.map((cat: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{cat.category_name}</span>
                    <span className="text-zinc-600 dark:text-zinc-400 font-mono">
                      {cat.item_count} pcs ({Number(cat.total_gross_weight).toFixed(2)}g)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-[#E3DFD7] dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#E3DFD7] dark:border-white/5">
                <h3 className="font-serif font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  Recent Tagged Inventory
                </h3>
                <a href="/inventory" className="text-xs text-[#C9A34A] font-semibold hover:underline">
                  Manage Vault →
                </a>
              </div>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left text-xs min-w-[550px]">
                  <thead className="bg-[#FAF8F5] dark:bg-[#111318] text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-white/10">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">SKU / Tag</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Name</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Purity</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Gross Wt</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">HUID</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                    {data?.recent_items?.map((it: any) => (
                      <tr key={it.id} className="hover:bg-[#C9A34A]/5 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold text-[#C9A34A] whitespace-nowrap">{it.sku || it.item_code}</td>
                        <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap truncate max-w-[150px]">{it.name}</td>
                        <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{it.purity_karat}</td>
                        <td className="py-2.5 px-3 font-mono whitespace-nowrap">{Number(it.gross_weight).toFixed(3)}g</td>
                        <td className="py-2.5 px-3 font-mono text-[#35BFA0] font-semibold whitespace-nowrap">{it.huid || '—'}</td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#35BFA0]/15 text-[#35BFA0] border border-[#35BFA0]/30">
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
          {widgets.kpis && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-[#E3DFD7] dark:border-white/10 shadow-sm">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Active Job Cards
                </span>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-serif">
                  {data?.active_jobs_count || 0} <span className="text-xs font-sans text-zinc-500">jobs</span>
                </p>
                <p className="text-[11px] text-[#C9A34A] mt-1 font-medium">Currently in manufacturing</p>
              </div>

              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-[#E3DFD7] dark:border-white/10 shadow-sm">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Pure Gold Issued
                </span>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-serif">
                  {Number(data?.gold_issued_in_workshop || 0).toFixed(3)} <span className="text-xs font-sans text-zinc-500">grams</span>
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">24K fine metal with artisans</p>
              </div>

              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-[#E3DFD7] dark:border-white/10 shadow-sm">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Completed Jobs
                </span>
                <p className="text-2xl font-bold text-[#35BFA0] mt-2 font-serif">
                  {data?.completed_jobs_count || 0} <span className="text-xs font-sans text-zinc-500">pieces</span>
                </p>
                <p className="text-[11px] text-[#35BFA0] mt-1 font-medium">Quality hallmarked & returned</p>
              </div>

              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-[#E3DFD7] dark:border-white/10 shadow-sm">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Master Artisans
                </span>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-serif">
                  {data?.karigars?.length || 0} <span className="text-xs font-sans text-zinc-500">specialists</span>
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Filigree, Setting, Casting</p>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-[#E3DFD7] dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DFD7] dark:border-white/5 mb-3">
              <h3 className="font-serif font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                Active Workshop Job Work Cards
              </h3>
              <a href="/karigar" className="text-xs text-[#C9A34A] font-semibold hover:underline">
                View Karigar Ledger →
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="bg-[#FAF8F5] dark:bg-[#111318] text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-white/10">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">Job Card #</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Karigar</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Description</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Issued Pure Gold</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                  {data?.active_jobs?.map((j: any) => (
                    <tr key={j.id} className="hover:bg-[#C9A34A]/5 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-semibold text-[#C9A34A] whitespace-nowrap">{j.job_number}</td>
                      <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{j.karigar?.name}</td>
                      <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{j.item_description}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-[#C9A34A] whitespace-nowrap">{Number(j.gold_issued_pure).toFixed(3)}g</td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          j.status === 'completed'
                            ? 'bg-[#35BFA0]/15 text-[#35BFA0] border border-[#35BFA0]/30'
                            : 'bg-[#C9A34A]/15 text-[#C9A34A] border border-[#C9A34A]/30'
                        }`}>
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
          {widgets.kpis && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-zinc-200 dark:border-white/10 shadow-sm">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Branch Sales Today
                </span>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-serif">
                  ₹{Number(data?.branch_today_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  {data?.branch_today_invoices_count || 0} bills in this showroom
                </p>
              </div>

              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-zinc-200 dark:border-white/10 shadow-sm">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Branch Month Revenue
                </span>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-serif">
                  ₹{Number(data?.branch_month_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Showroom target on track</p>
              </div>

              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-zinc-200 dark:border-white/10 shadow-sm">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Branch Stock In Trays
                </span>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-serif">
                  {data?.branch_items_in_stock || 0} <span className="text-xs font-sans text-zinc-500">pieces</span>
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Gold weight: <strong>{Number(data?.branch_gold_weight || 0).toFixed(2)}g</strong>
                </p>
              </div>

              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-zinc-200 dark:border-white/10 shadow-sm">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Active Sales Team
                </span>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-serif">
                  {data?.staff_performance?.length || 0} <span className="text-xs font-sans text-zinc-500">staff</span>
                </p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">Counter attendance 100%</p>
              </div>
            </div>
          )}

          {/* Staff Performance Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-zinc-200 dark:border-white/10 shadow-sm">
              <h3 className="font-serif font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-3">
                Staff Sales Leaderboard
              </h3>
              <div className="space-y-3">
                {data?.staff_performance?.map((s: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#C9A34A]/5 border border-[#C9A34A]/20 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">{s.staff_name}</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">{s.bills_count} bills settled</p>
                    </div>
                    <span className="font-bold text-xs text-[#C9A34A] font-serif">
                      ₹{Number(s.total_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-[#E3DFD7] dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#E3DFD7] dark:border-white/5">
                <h3 className="font-serif font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  Recent Branch Invoices
                </h3>
                <a href="/pos" className="text-xs text-[#C9A34A] font-semibold hover:underline">
                  View All POS Billing →
                </a>
              </div>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className="bg-[#FAF8F5] dark:bg-[#111318] text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-white/10">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">Invoice #</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Customer</th>
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">Grand Total</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                    {data?.recent_invoices?.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-[#C9A34A]/5 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold text-[#C9A34A] whitespace-nowrap">{inv.invoice_number}</td>
                        <td className="py-2.5 px-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap font-mono text-[11px]">{formatDate(inv.invoice_date)}</td>
                        <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap truncate max-w-[130px]" title={inv.customer?.name || 'Walk-in'}>
                          {inv.customer?.name || 'Walk-in'}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-right font-serif whitespace-nowrap text-[#111318] dark:text-[#F6F5F1]">
                          ₹{Number(inv.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            String(inv.status).toLowerCase().includes('paid') || String(inv.status).toLowerCase().includes('settled')
                              ? 'bg-[#35BFA0]/15 text-[#35BFA0] border border-[#35BFA0]/30'
                              : 'bg-[#C9A34A]/15 text-[#C9A34A] border border-[#C9A34A]/30'
                          }`}>
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
          {widgets.kpis && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-[#E3DFD7] dark:border-white/10 shadow-sm transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Today's Consolidated Sales
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#C9A34A]/10 text-[#C9A34A] flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-serif">
                  ₹{Number(data?.today_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
                  <span className="text-[#35BFA0] font-semibold">{data?.today_invoices_count || 0}</span> invoices settled today
                </p>
              </div>

              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-[#E3DFD7] dark:border-white/10 shadow-sm transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    This Month Revenue
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#35BFA0]/15 text-[#35BFA0] flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-serif">
                  ₹{Number(data?.month_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-[#35BFA0] mt-1 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#35BFA0] inline-block" />
                  Active GST Return Period
                </p>
              </div>

              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-[#E3DFD7] dark:border-white/10 shadow-sm transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Fine Gold Reserves
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#C9A34A]/10 text-[#C9A34A] flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-serif">
                  {Number(data?.gold_gross_stock || 0).toFixed(3)} <span className="text-xs font-sans text-zinc-500">grams</span>
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Net metal: <strong className="text-[#C9A34A]">{Number(data?.gold_net_stock || 0).toFixed(3)}g</strong> across {data?.total_items_in_stock || 0} items
                </p>
              </div>

              <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-[#E3DFD7] dark:border-white/10 shadow-sm transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Customer Receivables
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#111318] dark:text-[#F6F5F1] mt-2 font-serif">
                  ₹{Number(data?.outstanding_receivables || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Total {data?.total_customers || 0} registered patrons
                </p>
              </div>
            </div>
          )}

          {/* Revenue Trajectory & Branch Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {widgets.charts && (
              <div className={`${widgets.rates ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-zinc-200 dark:border-white/10 shadow-sm transition-colors`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                      Enterprise Revenue Trajectory (6 Months)
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Consolidated billed turnover inclusive of 3% GST
                    </p>
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.sales_trend || []}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C9A34A" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#8B7CF6" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#27272A' : '#E4E4E7'} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: theme === 'dark' ? '#A1A1AA' : '#71717A' }} />
                      <YAxis
                        tick={{ fontSize: 11, fill: theme === 'dark' ? '#A1A1AA' : '#71717A' }}
                        tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#181822' : '#FFFFFF',
                          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E4E4E7',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: theme === 'dark' ? '#FFFFFF' : '#000000',
                        }}
                        formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#C9A34A"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorRev)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Live Metal Rate Board */}
            {widgets.rates && (
              <div className="bg-[#FFFFFF] dark:bg-[#181A22] text-[#111318] dark:text-[#F6F5F1] rounded-2xl p-5 border border-[#E3DFD7] dark:border-white/10 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#E3DFD7] dark:border-white/10">
                    <h3 className="font-serif font-bold text-[#C9A34A] text-sm flex items-center gap-2">
                      <Coins className="w-4 h-4 text-[#C9A34A]" /> Today's Retail Rates
                    </h3>
                    <span className="text-[10px] text-[#8E929E] uppercase font-mono">Live INR / g</span>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {data?.metal_rates?.map((rate: any) => (
                      <div
                        key={rate.id}
                        className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-[#ECEAE4]/40 dark:bg-[#111318] border border-[#E3DFD7] dark:border-white/5"
                      >
                        <span className="font-medium text-[#5A5E6B] dark:text-[#A6AAB6]">
                          {rate.metal_type.toUpperCase()} {rate.purity_karat} ({rate.purity_percentage}%)
                        </span>
                        <strong className="text-[#C9A34A] font-mono text-sm">
                          ₹{Number(rate.rate_per_gram).toFixed(2)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E3DFD7] dark:border-white/10 text-center">
                  <a
                    href="/rates"
                    className="text-xs text-[#C9A34A] hover:underline font-semibold underline-offset-4"
                  >
                    Adjust Daily Board Rates →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Multi-Branch Showroom Breakdown */}
          {widgets.branches && data?.branch_comparison && data.branch_comparison.length > 0 && (
            <div className="bg-white dark:bg-[#181A22] rounded-2xl p-5 border border-zinc-200 dark:border-white/10 shadow-sm transition-colors">
              <h3 className="font-serif font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-3">
                Multi-Branch Showroom Performance (Month to Date)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.branch_comparison.map((b: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#C9A34A]/5 border border-[#C9A34A]/20 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-[#111318] dark:text-[#F6F5F1] flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#C9A34A]" /> {b.branch_name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{b.invoices_count} invoices generated</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold font-serif text-[#C9A34A]">
                        ₹{Number(b.month_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      <span className="text-[10px] text-[#35BFA0] font-semibold">3% GST Included</span>
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
