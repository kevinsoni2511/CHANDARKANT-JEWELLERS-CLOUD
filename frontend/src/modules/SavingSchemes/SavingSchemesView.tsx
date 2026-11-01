import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PiggyBank, Plus, CheckCircle2, User, CreditCard, X, Receipt, Printer } from 'lucide-react';

export const SavingSchemesView: React.FC = () => {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [activeEnrollment, setActiveEnrollment] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('5000');
  const [payMode, setPayMode] = useState('upi');
  const [completedPayment, setCompletedPayment] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sRes, eRes] = await Promise.all([
        api.get('/saving-schemes'),
        api.get('/saving-schemes/enrollments'),
      ]);
      if (sRes.data.success) setSchemes(sRes.data.data);
      if (eRes.data.success) setEnrollments(eRes.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEnrollment) return;

    try {
      const res = await api.post('/saving-schemes/pay', {
        enrollment_id: activeEnrollment.id,
        amount_paid: Number(payAmount),
        payment_mode: payMode,
      });

      if (res.data.success) {
        setCompletedPayment({
          enrollment: activeEnrollment,
          amount_paid: Number(payAmount),
          payment_mode: payMode,
          date: new Date().toLocaleDateString('en-IN'),
          receipt_no: `SN-${Date.now().toString().slice(-6)}`,
        });
        setShowPayModal(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error recording installment');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#111318] dark:text-[#F6F5F1]">
            Swarna Nidhi & Kitty Saving Schemes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gold installment accumulation schemes (11+1), passbook registers, and maturity bonus tracking
          </p>
        </div>
      </div>

      {/* Scheme Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {schemes.map((s) => (
          <div key={s.id} className="bg-white dark:bg-[#181A22] rounded-xl p-5 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif font-bold text-base text-[#111318] dark:text-[#F6F5F1] flex items-center gap-2">
                  <PiggyBank className="w-5 h-5 text-[#C9A34A]" /> {s.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Duration: {s.duration_months} Months Customer + 1 Month Jeweller Bonus
                </p>
              </div>
              <span className="text-xs font-bold text-[#C9A34A] bg-[#C9A34A]/10 border border-[#C9A34A]/20 px-2.5 py-1 rounded-full">
                {s.enrollments_count || 0} Enrolled
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Monthly Contribution:</span>
                <p className="font-serif font-bold text-sm text-[#C9A34A]">
                  ₹{Number(s.monthly_installment).toLocaleString('en-IN')}/mo
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Maturity Benefit:</span>
                <p className="font-serif font-bold text-sm text-[#35BFA0]">
                  ₹{(Number(s.monthly_installment) * (s.duration_months + 1)).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Passbooks Table */}
      <div className="bg-white dark:bg-[#181A22] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-4 bg-[#F6F5F1] dark:bg-[#111318] border-b border-slate-200 dark:border-white/10 font-serif font-bold text-xs text-[#111318] dark:text-[#F6F5F1] flex justify-between items-center">
          <span>Active Customer Passbooks & Installment Status</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F5F1] dark:bg-[#111318] text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="py-2.5 px-4">Passbook #</th>
                <th className="py-2.5 px-4">Patron Name</th>
                <th className="py-2.5 px-4">Enrolled Scheme</th>
                <th className="py-2.5 px-4">Start Date</th>
                <th className="py-2.5 px-4 text-center">Paid Installments</th>
                <th className="py-2.5 px-4 text-right">Total Deposited</th>
                <th className="py-2.5 px-4 text-right">Maturity Value</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No active saving scheme enrollments.
                  </td>
                </tr>
              ) : (
                enrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-[#C9A34A]/5">
                    <td className="py-2.5 px-4 font-mono font-semibold text-[#C9A34A]">
                      {e.passbook_number}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {e.customer?.name} ({e.customer?.phone})
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">{e.scheme?.name}</td>
                    <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{e.start_date}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-[#35BFA0]">
                      {e.installments?.length || 0} / {e.scheme?.duration_months || 11}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      ₹{Number(e.total_paid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[#35BFA0]">
                      ₹{Number(e.maturity_value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => {
                          setActiveEnrollment(e);
                          setPayAmount(String(e.scheme?.monthly_installment || 5000));
                          setShowPayModal(true);
                        }}
                        className="px-2.5 py-1 gold-gradient text-[#111318] text-[11px] font-bold rounded shadow-md hover:brightness-105 transition-all cursor-pointer"
                      >
                        + Collect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Installment Modal */}
      {showPayModal && activeEnrollment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#181A22] rounded-xl max-w-sm w-full p-5 shadow-2xl space-y-3 border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
              <h3 className="font-serif font-bold text-sm text-[#111318] dark:text-[#F6F5F1]">
                Collect Monthly Installment
              </h3>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePay} className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                <strong>Passbook:</strong> {activeEnrollment.passbook_number} (
                {activeEnrollment.customer?.name})
              </p>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Installment Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full border border-slate-300 dark:border-white/10 bg-white dark:bg-[#111318] text-[#111318] dark:text-[#F6F5F1] rounded px-3 py-1.5 font-mono text-sm font-bold text-[#C9A34A] focus:border-[#C9A34A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Payment Mode</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value)}
                  className="w-full border border-slate-300 dark:border-white/10 bg-white dark:bg-[#111318] text-[#111318] dark:text-[#F6F5F1] rounded px-3 py-1.5 font-medium"
                >
                  <option value="upi">UPI / QR Code</option>
                  <option value="cash">Cash Counter</option>
                  <option value="card">Card POS</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-3 py-1.5 border border-slate-300 dark:border-white/10 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 gold-gradient text-[#111318] font-bold rounded shadow-md hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" /> Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Swarna Nidhi Deposit Receipt Modal / PDF Frame */}
      {completedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#181A22] rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden my-8">
            {/* Top Toolbar (Screen Only) */}
            <div className="no-print flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white border-b border-white/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#35BFA0]" />
                <span className="font-semibold text-sm">Installment Recorded Successfully</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 gold-gradient text-[#111318] font-bold rounded-lg text-xs shadow-md hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setCompletedPayment(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Frame */}
            <div className="p-6 bg-slate-100 dark:bg-[#111318]/50 overflow-y-auto max-h-[80vh] flex justify-center">
              <div
                id="printable-receipt"
                className="printable-sheet bg-white text-[#111318] p-8 rounded-lg shadow-md w-full max-w-lg border-2 border-[#C9A34A] relative"
                style={{
                  boxShadow: '0 0 0 4px rgba(201,163,74,0.15)',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                {/* Decorative Inner Border */}
                <div className="border border-[#C9A34A]/40 p-6 rounded">
                  {/* Letterhead */}
                  <div className="text-center pb-4 border-b border-dashed border-[#C9A34A]/60">
                    <div className="inline-block px-3 py-0.5 mb-1.5 rounded-full bg-[#C9A34A]/10 border border-[#C9A34A]/30 text-[10px] font-bold tracking-widest text-[#C9A34A] uppercase">
                      Swarna Nidhi Kitty Deposit
                    </div>
                    <h2 className="font-serif font-black text-2xl tracking-wider text-[#111318]">
                      CHANDARKANT JEWELLERS
                    </h2>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Flagship Showroom • Choksi Bazar, Surat, Gujarat - 395003
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      GSTIN: 24AAACC1234M1Z8 • BIS Lic: HM/SUR/2026/01
                    </p>
                  </div>

                  {/* Receipt Meta */}
                  <div className="grid grid-cols-2 gap-3 py-3 text-xs border-b border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Receipt Number</span>
                      <span className="font-mono font-bold text-slate-900">{completedPayment.receipt_no}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Date & Time</span>
                      <span className="font-medium text-slate-900">{completedPayment.date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Patron / Customer</span>
                      <span className="font-bold text-slate-900">{completedPayment.enrollment?.customer?.name || 'Valued Patron'}</span>
                      <span className="text-[11px] text-slate-500 block font-mono">{completedPayment.enrollment?.customer?.phone || ''}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Scheme Plan</span>
                      <span className="font-bold text-[#C9A34A]">{completedPayment.enrollment?.scheme?.name || 'Swarna Nidhi (11+1)'}</span>
                    </div>
                  </div>

                  {/* Payment Details Card */}
                  <div className="my-4 p-4 rounded-lg bg-amber-50/60 border border-amber-200/70 text-center">
                    <span className="text-[11px] uppercase tracking-wider text-amber-900/70 font-semibold block">
                      Installment Deposited
                    </span>
                    <div className="text-3xl font-serif font-bold text-[#111318] my-1">
                      ₹{Number(completedPayment.amount_paid).toLocaleString('en-IN')}.00
                    </div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-white border border-amber-300 text-amber-900">
                      Payment Mode: {completedPayment.payment_mode.toUpperCase()}
                    </span>
                  </div>

                  {/* Cumulative Status */}
                  <div className="py-2.5 px-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Accumulated Balance:</span>
                      <span className="font-bold font-mono text-slate-900">
                        ₹{(Number(completedPayment.enrollment?.total_paid || 0) + Number(completedPayment.amount_paid)).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Maturity Entitlement:</span>
                      <span className="font-semibold text-emerald-700">1 Month Extra Jeweller Bonus on Completion</span>
                    </div>
                  </div>

                  {/* Terms & Footer */}
                  <div className="mt-5 pt-3 border-t border-dashed border-slate-300 text-[9px] text-slate-500 leading-tight">
                    <p className="italic">
                      • Installment is valid for 100% redemption against BIS Hallmarked Gold / Diamond Jewellery.
                      <br />• Retain this computer-generated receipt for maturity settlement. No cash refunds.
                    </p>
                    <div className="mt-6 flex justify-between items-end">
                      <div className="text-center">
                        <div className="h-7 border-b border-slate-400 w-24"></div>
                        <span className="text-[9px] text-slate-600">Customer Signature</span>
                      </div>
                      <div className="text-center">
                        <div className="font-serif font-bold text-[10px] text-[#C9A34A] uppercase">For Chandarkant Jewellers</div>
                        <div className="h-6"></div>
                        <span className="text-[9px] text-slate-600">Authorized Cashier Stamp</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
