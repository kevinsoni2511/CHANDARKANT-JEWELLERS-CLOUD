import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PiggyBank, Plus, CheckCircle2, User, CreditCard, X, Receipt } from 'lucide-react';

export const SavingSchemesView: React.FC = () => {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [activeEnrollment, setActiveEnrollment] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('5000');
  const [payMode, setPayMode] = useState('upi');

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
        alert(res.data.message);
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
          <h2 className="text-2xl font-serif font-bold text-[#380810]">
            Swarna Nidhi & Kitty Saving Schemes
          </h2>
          <p className="text-xs text-gray-600">
            Gold installment accumulation schemes (11+1), passbook registers, and maturity bonus tracking
          </p>
        </div>
      </div>

      {/* Scheme Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {schemes.map((s) => (
          <div key={s.id} className="bg-white rounded-xl p-5 border border-amber-300 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif font-bold text-base text-[#380810] flex items-center gap-2">
                  <PiggyBank className="w-5 h-5 text-amber-600" /> {s.name}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Duration: {s.duration_months} Months Customer + 1 Month Jeweller Bonus
                </p>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                {s.enrollments_count || 0} Enrolled
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
              <div>
                <span className="text-gray-500">Monthly Contribution:</span>
                <p className="font-serif font-bold text-sm text-[#56111C]">
                  ₹{Number(s.monthly_installment).toLocaleString('en-IN')}/mo
                </p>
              </div>
              <div>
                <span className="text-gray-500">Maturity Benefit:</span>
                <p className="font-serif font-bold text-sm text-emerald-800">
                  ₹{(Number(s.monthly_installment) * (s.duration_months + 1)).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Passbooks Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-[#FAF8F5] border-b border-gray-200 font-serif font-bold text-xs text-gray-800 flex justify-between items-center">
          <span>Active Customer Passbooks & Installment Status</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-gray-600 font-semibold border-b border-gray-200">
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
            <tbody className="divide-y divide-gray-100">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No active saving scheme enrollments.
                  </td>
                </tr>
              ) : (
                enrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-amber-50/20">
                    <td className="py-2.5 px-4 font-mono font-semibold text-[#56111C]">
                      {e.passbook_number}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-gray-800">
                      {e.customer?.name} ({e.customer?.phone})
                    </td>
                    <td className="py-2.5 px-4 text-gray-700">{e.scheme?.name}</td>
                    <td className="py-2.5 px-4 text-gray-500">{e.start_date}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-emerald-800">
                      {e.installments?.length || 0} / {e.scheme?.duration_months || 11}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-gray-900">
                      ₹{Number(e.total_paid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[#56111C]">
                      ₹{Number(e.maturity_value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => {
                          setActiveEnrollment(e);
                          setPayAmount(String(e.scheme?.monthly_installment || 5000));
                          setShowPayModal(true);
                        }}
                        className="px-2.5 py-1 bg-[#56111C] hover:bg-[#380810] text-amber-100 text-[11px] font-semibold rounded shadow"
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
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-serif font-bold text-sm text-[#380810]">
                Collect Monthly Installment
              </h3>
              <button onClick={() => setShowPayModal(false)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handlePay} className="space-y-3 text-xs">
              <p className="text-gray-600">
                <strong>Passbook:</strong> {activeEnrollment.passbook_number} (
                {activeEnrollment.customer?.name})
              </p>

              <div>
                <label className="block text-gray-600 mb-1">Installment Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full border rounded px-3 py-1.5 font-mono text-sm font-bold text-[#56111C]"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Payment Mode</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value)}
                  className="w-full border rounded px-3 py-1.5"
                >
                  <option value="upi">UPI / QR Code</option>
                  <option value="cash">Cash Counter</option>
                  <option value="card">Card POS</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-3 py-1.5 border rounded text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#56111C] text-amber-100 font-semibold rounded shadow flex items-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5" /> Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
