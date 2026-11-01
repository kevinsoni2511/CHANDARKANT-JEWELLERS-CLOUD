import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BookOpen,
  Scale,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import { DataTable, Column } from '../../components/DataTable';

export const AccountingView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trial_balance' | 'day_book' | 'chart_of_accounts'>('trial_balance');
  const [trialBalance, setTrialBalance] = useState<any>(null);
  const [dayBook, setDayBook] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'trial_balance') {
      fetchTrialBalance();
    } else if (activeTab === 'day_book') {
      fetchDayBook();
    } else {
      fetchAccounts();
    }
  }, [activeTab, date]);

  const fetchTrialBalance = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounting/trial-balance');
      if (res.data.success) {
        setTrialBalance(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDayBook = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/accounting/day-book?date=${date}`);
      if (res.data.success) {
        setDayBook(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounting/chart-of-accounts');
      if (res.data.success) {
        setAccounts(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const trialBalanceColumns: Column<any>[] = [
    {
      key: 'code',
      header: 'Account Code',
      sortable: true,
      accessor: (r) => (
        <span className="font-mono font-semibold text-zinc-500 dark:text-zinc-400">{r.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Ledger Account Title',
      sortable: true,
      accessor: (r) => (
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{r.name}</span>
      ),
    },
    {
      key: 'type',
      header: 'Classification',
      sortable: true,
      accessor: (r) => (
        <span className="uppercase text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-300">
          {r.type}
        </span>
      ),
    },
    {
      key: 'debit',
      header: 'Debit Balance (₹)',
      sortable: true,
      align: 'right',
      accessor: (r) => (
        <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
          {Number(r.debit) > 0 ? `₹${Number(r.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
        </span>
      ),
    },
    {
      key: 'credit',
      header: 'Credit Balance (₹)',
      sortable: true,
      align: 'right',
      accessor: (r) => (
        <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
          {Number(r.credit) > 0 ? `₹${Number(r.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#111318] dark:text-[#F6F5F1]">
            Double-Entry Financial Accounting
          </h2>
          <p className="text-xs text-[#5A5E6B] dark:text-[#A6AAB6] mt-0.5">
            Automated journal vouchers, balanced trial balance, and statutory Indian GST registers
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-[#ECEAE4]/60 dark:bg-white/5 p-1 rounded-xl text-xs self-start sm:self-auto font-medium transition-colors">
          <button
            onClick={() => setActiveTab('trial_balance')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'trial_balance'
                ? 'gold-gradient text-[#111318] shadow font-bold'
                : 'text-[#5A5E6B] dark:text-[#A6AAB6] hover:text-[#111318] dark:hover:text-[#F6F5F1]'
            }`}
          >
            Trial Balance
          </button>
          <button
            onClick={() => setActiveTab('day_book')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'day_book'
                ? 'gold-gradient text-[#111318] shadow font-bold'
                : 'text-[#5A5E6B] dark:text-[#A6AAB6] hover:text-[#111318] dark:hover:text-[#F6F5F1]'
            }`}
          >
            Day Book Register
          </button>
          <button
            onClick={() => setActiveTab('chart_of_accounts')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'chart_of_accounts'
                ? 'gold-gradient text-[#111318] shadow font-bold'
                : 'text-[#5A5E6B] dark:text-[#A6AAB6] hover:text-[#111318] dark:hover:text-[#F6F5F1]'
            }`}
          >
            Chart of Accounts
          </button>
        </div>
      </div>

      {/* Trial Balance Tab */}
      {activeTab === 'trial_balance' && (
        <div className="space-y-4">
          {/* Balance Status Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] dark:bg-[#181A22] p-4 rounded-2xl border border-[#E3DFD7] dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#C9A34A]" />
              <div>
                <h4 className="font-semibold text-[#111318] dark:text-[#F6F5F1] text-xs sm:text-sm">
                  General Ledger Balance Verification
                </h4>
                <p className="text-[11px] text-[#5A5E6B] dark:text-[#A6AAB6]">
                  Total Debit: ₹{Number(trialBalance?.total_debit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} | Total Credit: ₹{Number(trialBalance?.total_credit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {trialBalance?.is_balanced ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#35BFA0]/15 text-[#35BFA0] border border-[#35BFA0]/30 self-start sm:self-auto">
                <CheckCircle2 className="w-4 h-4 text-[#35BFA0]" /> Strictly Balanced: Debit = Credit
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 self-start sm:self-auto">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Out of Balance Variance
              </span>
            )}
          </div>

          <DataTable
            columns={trialBalanceColumns}
            data={trialBalance?.rows || []}
            loading={loading}
            title="Trial Balance Ledger Stream"
            subtitle="Real-time multi-account double-entry audit balances"
            searchPlaceholder="Search account title or code..."
            exportFileName="cjc-trial-balance"
            emptyMessage="No financial ledger entries recorded."
          />
        </div>
      )}

      {/* Day Book Tab */}
      {activeTab === 'day_book' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] dark:bg-[#181A22] p-4 rounded-2xl border border-[#E3DFD7] dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#C9A34A]" />
              <span className="text-xs font-semibold text-[#111318] dark:text-[#F6F5F1]">
                Select Register Date:
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-[#ECEAE4]/40 dark:bg-[#111318] border border-[#E3DFD7] dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-[#111318] dark:text-[#F6F5F1] focus:outline-none focus:border-[#C9A34A]"
              />
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl border border-[#E3DFD7] dark:border-white/10 text-xs font-medium text-[#5A5E6B] dark:text-[#A6AAB6] hover:bg-[#111318]/5 dark:hover:bg-white/5 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Printer className="w-3.5 h-3.5 text-[#C9A34A]" /> Print Day Register
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FFFFFF] dark:bg-[#181A22] p-5 rounded-2xl border border-[#E3DFD7] dark:border-white/10 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-[#111318] dark:text-[#F6F5F1] uppercase tracking-wider font-mono">
                Cash in Hand Position
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5A5E6B] dark:text-[#A6AAB6]">Cash Inflow:</span>
                  <span className="font-mono text-[#35BFA0] font-semibold">
                    ₹{Number(dayBook?.summary?.cash_received || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A5E6B] dark:text-[#A6AAB6]">Cash Outflow:</span>
                  <span className="font-mono text-rose-500 font-semibold">
                    ₹{Number(dayBook?.summary?.cash_paid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#E3DFD7] dark:border-white/5 pt-2 font-bold">
                  <span className="text-[#111318] dark:text-[#F6F5F1]">Net Cash Flow:</span>
                  <span className="font-mono text-[#C9A34A]">
                    ₹{Number(dayBook?.summary?.net_cash || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#FFFFFF] dark:bg-[#181A22] p-5 rounded-2xl border border-[#E3DFD7] dark:border-white/10 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-[#111318] dark:text-[#F6F5F1] uppercase tracking-wider font-mono">
                Bank & UPI Clearing Position
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5A5E6B] dark:text-[#A6AAB6]">Bank Inflow:</span>
                  <span className="font-mono text-[#35BFA0] font-semibold">
                    ₹{Number(dayBook?.summary?.bank_received || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A5E6B] dark:text-[#A6AAB6]">Bank Outflow:</span>
                  <span className="font-mono text-rose-500 font-semibold">
                    ₹{Number(dayBook?.summary?.bank_paid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#E3DFD7] dark:border-white/5 pt-2 font-bold">
                  <span className="text-[#111318] dark:text-[#F6F5F1]">Net Bank Flow:</span>
                  <span className="font-mono text-[#C9A34A]">
                    ₹{Number(dayBook?.summary?.net_bank || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart of Accounts Tab */}
      {activeTab === 'chart_of_accounts' && (
        <div className="bg-[#FFFFFF] dark:bg-[#181A22] rounded-2xl border border-[#E3DFD7] dark:border-white/10 shadow-sm overflow-hidden transition-colors">
          <div className="p-4 bg-[#ECEAE4]/40 dark:bg-[#111318] border-b border-[#E3DFD7] dark:border-white/10 font-serif font-bold text-xs text-[#111318] dark:text-[#F6F5F1] flex items-center justify-between">
            <span>Enterprise Chart of Accounts</span>
            <span className="text-[10px] font-mono text-[#8E929E]">{accounts.length} Ledgers</span>
          </div>
          <div className="divide-y divide-[#E3DFD7]/60 dark:divide-white/5">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-3.5 flex items-center justify-between text-xs hover:bg-[#111318]/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#C9A34A]">
                    [{acc.code}]
                  </span>
                  <span className="font-semibold text-[#111318] dark:text-[#F6F5F1]">{acc.name}</span>
                </div>
                <span className="uppercase text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#ECEAE4] dark:bg-white/10 text-[#5A5E6B] dark:text-[#A6AAB6]">
                  {acc.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
