import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Hammer, Plus, Scale, CheckCircle2, User, X } from 'lucide-react';

export const KarigarView: React.FC = () => {
  const [karigars, setKarigars] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    karigar_id: '',
    item_description: '',
    gold_issued_gross: '',
    gold_issued_purity: '99.900',
    allowed_wastage: '0.250',
    labour_charges: '850.00',
  });

  useEffect(() => {
    fetchKarigars();
    fetchJobs();
  }, []);

  const fetchKarigars = async () => {
    try {
      const res = await api.get('/karigars');
      if (res.data.success) {
        setKarigars(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get('/karigar-jobs');
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleIssueJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/karigar-jobs', {
        ...form,
        karigar_id: Number(form.karigar_id),
        gold_issued_gross: Number(form.gold_issued_gross),
        gold_issued_purity: Number(form.gold_issued_purity),
        allowed_wastage: Number(form.allowed_wastage || 0),
        labour_charges: Number(form.labour_charges),
      });

      if (res.data.success) {
        setShowModal(false);
        fetchJobs();
        fetchKarigars();
        setForm({
          karigar_id: '',
          item_description: '',
          gold_issued_gross: '',
          gold_issued_purity: '99.900',
          allowed_wastage: '0.250',
          labour_charges: '850.00',
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error issuing job card');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#380810]">
            Karigar & Goldsmith Job Management
          </h2>
          <p className="text-xs text-gray-600">
            Raw bullion issuance, fine gold reconciliation, scrap accounting, and artisan labour settlements
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg gold-gradient text-[#380810] font-semibold text-xs shadow hover:brightness-105 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> + Issue New Job Card
        </button>
      </div>

      {/* Artisan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {karigars.map((k) => (
          <div key={k.id} className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-[#380810] flex items-center gap-2">
                <User className="w-4 h-4 text-amber-600" /> {k.name}
              </h3>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                {k.jobs_count || 0} active jobs
              </span>
            </div>
            <p className="text-xs text-gray-500">{k.specialization || 'Master Artisan'}</p>
            <p className="text-xs text-gray-600 font-mono">Mobile: {k.phone}</p>
            <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
              <span className="text-gray-500">Unreturned Pure Gold:</span>
              <strong className="font-mono text-[#56111C] font-bold">
                {Number(k.pure_gold_balance).toFixed(3)}g
              </strong>
            </div>
          </div>
        ))}
      </div>

      {/* Job Cards Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-[#FAF8F5] border-b border-gray-200 font-serif font-bold text-xs text-gray-800 flex justify-between items-center">
          <span>Active Manufacturing & Repair Job Sheets</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-4">Job Number</th>
                <th className="py-2.5 px-4">Artisan</th>
                <th className="py-2.5 px-4">Item Description</th>
                <th className="py-2.5 px-4 text-right">Gold Issued (Gross)</th>
                <th className="py-2.5 px-4 text-right">Fine Gold (Pure)</th>
                <th className="py-2.5 px-4 text-right">Labour (₹)</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No active job cards found. Issue raw metal to create a job card.
                  </td>
                </tr>
              ) : (
                jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-amber-50/20">
                    <td className="py-2.5 px-4 font-mono font-semibold text-[#56111C]">{j.job_number}</td>
                    <td className="py-2.5 px-4 font-semibold text-gray-800">{j.karigar?.name}</td>
                    <td className="py-2.5 px-4 text-gray-700">{j.item_description}</td>
                    <td className="py-2.5 px-4 text-right font-mono">{Number(j.gold_issued_gross).toFixed(3)}g</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-900">{Number(j.gold_issued_pure).toFixed(3)}g</td>
                    <td className="py-2.5 px-4 text-right font-mono">₹{Number(j.labour_charges).toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                        {j.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-sm text-[#380810]">
                Issue Metal & Job Card to Artisan
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleIssueJob} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 mb-1">Select Karigar *</label>
                <select
                  required
                  value={form.karigar_id}
                  onChange={(e) => setForm({ ...form, karigar_id: e.target.value })}
                  className="w-full border rounded px-3 py-2 font-medium"
                >
                  <option value="">Choose Karigar...</option>
                  {karigars.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name} (Balance: {k.pure_gold_balance}g)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Jewellery Item Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 22K 45g Antique Choker Crafting"
                  value={form.item_description}
                  onChange={(e) => setForm({ ...form, item_description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 mb-1">Gross Issued (g) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={form.gold_issued_gross}
                    onChange={(e) => setForm({ ...form, gold_issued_gross: e.target.value })}
                    className="w-full border rounded px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-1">Purity Fineness (%)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={form.gold_issued_purity}
                    onChange={(e) => setForm({ ...form, gold_issued_purity: e.target.value })}
                    className="w-full border rounded px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 mb-1">Permissible Wastage (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={form.allowed_wastage}
                    onChange={(e) => setForm({ ...form, allowed_wastage: e.target.value })}
                    className="w-full border rounded px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-1">Artisan Labour Charge (₹)</label>
                  <input
                    type="number"
                    value={form.labour_charges}
                    onChange={(e) => setForm({ ...form, labour_charges: e.target.value })}
                    className="w-full border rounded px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 border rounded text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#56111C] text-amber-100 font-semibold rounded shadow"
                >
                  Confirm Issue & Debit Gold Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
