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

  const handlePrintDayBook = () => {
    const printWindow = window.open('', '_blank', 'width=980,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    const summary = dayBook?.summary || {};
    const cashRec = Number(summary.cash_received || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const cashPaid = Number(summary.cash_paid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const netCash = Number(summary.net_cash || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

    const bankRec = Number(summary.bank_received || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const bankPaid = Number(summary.bank_paid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const netBank = Number(summary.net_bank || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Day Register (${date}) - Chandarkant Jewellers</title>
          <style>
            @page { size: A4 portrait; margin: 8mm; }
            * { box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
              color: #111318; 
              margin: 0; 
              padding: 0; 
              background: #EAE8E3; 
              font-size: 11px; 
            }
            .screen-toolbar {
              position: sticky; top: 0; z-index: 100;
              background: #111318; color: #F6F5F1;
              padding: 10px 18px; display: flex; align-items: center; justify-content: space-between;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .btn-print {
              background: linear-gradient(135deg, #DFBE6F 0%, #C9A34A 100%);
              color: #111318; border: none; border-radius: 6px; padding: 7px 16px;
              font-weight: 700; font-size: 11.5px; cursor: pointer;
            }
            .btn-print:hover { opacity: 0.92; }
            .sheet-canvas { max-width: 194mm; margin: 16px auto; background: #FFFFFF; }
            .report-outer-frame {
              border: 2px solid #C9A34A; border-radius: 8px; padding: 4px;
              background: #FFFFFF; box-shadow: 0 6px 20px rgba(0,0,0,0.08);
            }
            .report-inner-frame {
              border: 1px solid rgba(201, 163, 74, 0.45); border-radius: 6px;
              padding: 16px 18px; background: #FFFFFF;
            }
            .header-bar {
              display: flex; justify-content: space-between; align-items: flex-start;
              border-bottom: 2px solid #C9A34A; padding-bottom: 10px; margin-bottom: 12px;
            }
            .brand-name { font-size: 18px; font-weight: 800; color: #111318; font-family: serif; letter-spacing: 0.5px; }
            .report-title { font-size: 13px; font-weight: 700; color: #92400e; margin-top: 2px; }
            .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
            .summary-card { background: #FAF9F5; border: 1px solid #E3DFD7; border-radius: 6px; padding: 10px 12px; font-size: 10.5px; }
            .summary-title { font-weight: 700; font-size: 11px; text-transform: uppercase; color: #92400e; border-bottom: 1px solid #E3DFD7; padding-bottom: 4px; margin-bottom: 6px; }
            .stat-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .stat-total { display: flex; justify-content: space-between; border-top: 1px solid #E3DFD7; padding-top: 5px; font-weight: 700; color: #111318; }
            @media print {
              body { padding: 0 !important; margin: 0 !important; background: #FFFFFF !important; }
              .screen-toolbar { display: none !important; }
              .sheet-canvas { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
              .report-outer-frame { border: 2px solid #C9A34A !important; box-shadow: none !important; width: 100% !important; }
            }
          </style>
        </head>
        <body>
          <div class="screen-toolbar">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="color:#C9A34A; font-weight:bold;">&#10022; Chandarkant Jewellers Cloud</span>
              <span style="color:#71717A;">|</span>
              <span style="color:#A1A1AA; font-size:11px;">Day Register Audit Report (${date})</span>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <button onclick="window.print()" class="btn-print">&#128424; Print / Save PDF</button>
              <button onclick="window.close()" style="background:#27272A; color:#E4E4E7; border:none; border-radius:6px; padding:7px 12px; font-size:11px; cursor:pointer;">Close</button>
            </div>
          </div>

          <div class="sheet-canvas">
            <div class="report-outer-frame">
              <div class="report-inner-frame">
                <div class="header-bar">
                  <div>
                    <div style="display:flex; align-items:center;">
                      <span style="background:linear-gradient(135deg,#DFBE6F,#C9A34A); color:#111318; font-weight:900; font-size:10px; padding:2px 6px; border-radius:4px; margin-right:6px;">&#10022;</span>
                      <span class="brand-name">CHANDARKANT JEWELLERS PVT LTD</span>
                    </div>
                    <div class="report-title">Daily Financial Register & Cash Audit Report</div>
                    <div style="font-size: 9.5px; color: #6b7280; margin-top: 2px;">
                      Ghanshyam Nagar, Varachha Main Road, Surat &bull; GSTIN: 24AAACC1234M1Z8
                    </div>
                  </div>
                  <div style="text-align: right; font-size: 10px; color: #6b7280; line-height: 1.4;">
                    <div><strong>Register Date:</strong> <span style="color:#92400e; font-weight:bold;">${date}</span></div>
                    <div><strong>Print Timestamp:</strong> ${new Date().toLocaleString()}</div>
                    <div><strong>Status:</strong> Reconciled & Balanced</div>
                  </div>
                </div>

                <div class="summary-grid">
                  <div class="summary-card">
                    <div class="summary-title">Physical Counter Cash Flow</div>
                    <div class="stat-row"><span>Cash Inflow:</span><span style="color:#15803d; font-family:monospace; font-weight:600;">₹${cashRec}</span></div>
                    <div class="stat-row"><span>Cash Outflow:</span><span style="color:#dc2626; font-family:monospace; font-weight:600;">₹${cashPaid}</span></div>
                    <div class="stat-total"><span>Closing Cash Position:</span><span style="color:#92400e; font-family:monospace;">₹${netCash}</span></div>
                  </div>

                  <div class="summary-card">
                    <div class="summary-title">Bank & Electronic Clearing</div>
                    <div class="stat-row"><span>Bank Inflow (UPI/Card):</span><span style="color:#15803d; font-family:monospace; font-weight:600;">₹${bankRec}</span></div>
                    <div class="stat-row"><span>Bank Outflow (Vendor/Expense):</span><span style="color:#dc2626; font-family:monospace; font-weight:600;">₹${bankPaid}</span></div>
                    <div class="stat-total"><span>Net Electronic Position:</span><span style="color:#92400e; font-family:monospace;">₹${netBank}</span></div>
                  </div>
                </div>

                <div style="border-top:1px solid #E3DFD7; padding-top:12px; margin-top:8px; display:flex; justify-content:space-between; align-items:flex-end; font-size:9.5px; color:#6b7280;">
                  <div>
                    <strong>Statutory Auditor Note:</strong> All retail invoices posted with strict double-entry balancing. Subject to Surat jurisdiction.
                  </div>
                  <div style="text-align:center;">
                    <div style="width:140px; border-bottom:1px dashed #9ca3af; margin-bottom:4px;"></div>
                    <span>Chief Accountant / Manager</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
              onClick={handlePrintDayBook}
              className="px-3.5 py-1.5 rounded-xl gold-gradient text-[#111318] font-bold text-xs shadow-sm hover:brightness-105 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#111318]" /> Print Day Register / PDF
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
