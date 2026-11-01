import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { TrendingUp, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { MetalRate } from '../../types';

export const MetalRatesView: React.FC = () => {
  const [rates, setRates] = useState<MetalRate[]>([]);
  const [editingRates, setEditingRates] = useState<{ [id: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await api.get('/metal-rates');
      if (res.data.success) {
        setRates(res.data.data);
        const map: any = {};
        res.data.data.forEach((r: MetalRate) => {
          map[r.id] = r.rate_per_gram;
        });
        setEditingRates(map);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        rates: rates.map((r) => ({
          metal_type: r.metal_type,
          purity_karat: r.purity_karat,
          purity_percentage: Number(r.purity_percentage),
          rate_per_gram: Number(editingRates[r.id] || r.rate_per_gram),
        })),
      };

      const res = await api.post('/metal-rates', payload);
      if (res.data.success) {
        setMessage("Today's retail board rates updated successfully!");
        fetchRates();
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update rates.');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-serif font-bold text-[#111318] dark:text-[#F6F5F1]">
          Precious Metal Rate Board Management
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure daily showroom retail selling rates for gold (24K, 22K, 20K, 18K, 14K), silver, and platinum.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-[#35BFA0]/10 border border-[#35BFA0]/30 text-[#35BFA0] rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#35BFA0]" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="bg-white dark:bg-[#181A22] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-4 bg-[#F6F5F1] dark:bg-[#111318] border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
          <span className="font-serif font-bold text-xs text-[#111318] dark:text-[#F6F5F1] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#C9A34A]" /> Active Bullion Rates (Indian Rupee per Gram)
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Date: {new Date().toLocaleDateString('en-IN')}</span>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rates.map((rate) => (
              <div
                key={rate.id}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-white/10 bg-[#F6F5F1] dark:bg-[#111318] flex items-center justify-between"
              >
                <div>
                  <h4 className="font-semibold text-[#111318] dark:text-[#F6F5F1] text-xs">
                    {rate.metal_type.toUpperCase()} {rate.purity_karat}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Fineness: {rate.purity_percentage}% fine metal
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingRates[rate.id] || ''}
                    onChange={(e) =>
                      setEditingRates({ ...editingRates, [rate.id]: e.target.value })
                    }
                    className="w-28 border border-slate-300 dark:border-white/10 bg-white dark:bg-[#181A22] rounded px-2.5 py-1 text-xs font-mono font-bold text-[#C9A34A] focus:border-[#C9A34A] focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400">/g</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex justify-between items-center">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-[#C9A34A]" />
              Historical invoices preserve immutable rate snapshots at time of sale.
            </p>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg gold-gradient text-[#111318] font-bold text-xs shadow-md hover:brightness-105 transition-all cursor-pointer"
            >
              Save & Broadcast Daily Board Rates
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
