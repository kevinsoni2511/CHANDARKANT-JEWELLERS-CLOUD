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
} from 'lucide-react';

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#380810]">
            Double-Entry Financial Accounting
          </h2>
          <p className="text-xs text-gray-600">
            Automated journal vouchers, balanced trial balance, and statutory Indian GST registers
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-gray-200 p-1 rounded-lg text-xs self-start sm:self-auto font-medium">
          <button
            onClick={() => setActiveTab('trial_balance')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'trial_balance'
                ? 'bg-white text-[#380810] shadow font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Trial Balance
          </button>
          <button
            onClick={() => setActiveTab('day_book')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'day_book'
                ? 'bg-white text-[#380810] shadow font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Day Book Register
          </button>
          <button
            onClick={() => setActiveTab('chart_of_accounts')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'chart_of_accounts'
                ? 'bg-white text-[#380810] shadow font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Chart of Accounts
          </button>
        </div>
      </div>

      {/* Trial Balance Tab */}
      {activeTab === 'trial_balance' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-[#FAF8F5] border-b border-gray-200 flex justify-between items-center">
              <span className="font-serif font-bold text-xs text-gray-800 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-600" /> General Ledger Trial Balance
              </span>

              {trialBalance?.is_balanced ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Strictly Balanced: Debit = Credit
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Out of Balance Variance
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-4">Code</th>
                    <th className="py-2.5 px-4">Ledger Account Name</th>
                    <th className="py-2.5 px-4">Classification</th>
                    <th className="py-2.5 px-4 text-right">Debit Balance (₹)</th>
                    <th className="py-2.5 px-4 text-right">Credit Balance (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {trialBalance?.rows?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        No financial transactions posted yet.
                      </td>
                    </tr>
                  ) : (
                    trialBalance?.rows?.map((r: any) => (
                      <tr key={r.account_id} className="hover:bg-amber-50/20">
                        <td className="py-2.5 px-4 font-mono font-semibold text-gray-500">{r.code}</td>
                        <td className="py-2.5 px-4 font-semibold text-gray-800">{r.name}</td>
                        <td className="py-2.5 px-4 uppercase text-[10px] text-gray-500 tracking-wider">
                          {r.type}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-medium">
                          {Number(r.debit) > 0 ? `₹${Number(r.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-medium">
                          {Number(r.credit) > 0 ? `₹${Number(r.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-[#FAF8F5] font-serif font-bold text-xs border-t-2 border-[#56111C]">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-right uppercase text-[#380810]">
                      Trial Balance Total:
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-800 text-sm">
                      ₹{Number(trialBalance?.total_debit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-800 text-sm">
                      ₹{Number(trialBalance?.total_credit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Day Book Tab */}
      {activeTab === 'day_book' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200">
            <span className="text-xs font-semibold text-gray-700">Select Register Date:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-xs font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h4 className="text-xs font-bold text-gray-700 mb-2 font-serif">Cash in Hand Position</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Cash Inflow:</span>
                  <span className="font-mono text-emerald-700 font-semibold">
                    ₹{Number(dayBook?.summary?.cash_received || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cash Outflow:</span>
                  <span className="font-mono text-red-600 font-semibold">
                    ₹{Number(dayBook?.summary?.cash_paid || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1 font-bold">
                  <span>Net Cash Flow:</span>
                  <span className="font-mono">
                    ₹{Number(dayBook?.summary?.net_cash || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h4 className="text-xs font-bold text-gray-700 mb-2 font-serif">Bank / UPI Position</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Bank Inflow:</span>
                  <span className="font-mono text-emerald-700 font-semibold">
                    ₹{Number(dayBook?.summary?.bank_received || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bank Outflow:</span>
                  <span className="font-mono text-red-600 font-semibold">
                    ₹{Number(dayBook?.summary?.bank_paid || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1 font-bold">
                  <span>Net Bank Flow:</span>
                  <span className="font-mono">
                    ₹{Number(dayBook?.summary?.net_bank || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart of Accounts Tab */}
      {activeTab === 'chart_of_accounts' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-[#FAF8F5] border-b border-gray-200 font-serif font-bold text-xs text-gray-800">
            System Chart of Accounts
          </div>
          <div className="divide-y divide-gray-100">
            {accounts.map((acc) => (
              <div key={acc.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-amber-50/20">
                <div>
                  <span className="font-mono font-bold text-[#56111C] mr-2">[{acc.code}]</span>
                  <span className="font-semibold text-gray-800">{acc.name}</span>
                </div>
                <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
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
