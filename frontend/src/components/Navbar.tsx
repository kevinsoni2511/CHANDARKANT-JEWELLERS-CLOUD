import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Gem, MapPin, Search, Bell, LogOut, TrendingUp } from 'lucide-react';
import api from '../services/api';
import { MetalRate } from '../types';

export const Navbar: React.FC = () => {
  const { user, tenant, logout, switchBranch } = useAuth();
  const [rates, setRates] = useState<MetalRate[]>([]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await api.get('/metal-rates');
        if (res.data.success) {
          setRates(res.data.data);
        }
      } catch (e) {
        // Fallback
      }
    };
    fetchRates();
  }, []);

  const rate24K = rates.find((r) => r.metal_type === 'gold' && r.purity_karat === '24K')?.rate_per_gram || '7950.00';
  const rate22K = rates.find((r) => r.metal_type === 'gold' && r.purity_karat === '22K')?.rate_per_gram || '7287.50';
  const rateSilver = rates.find((r) => r.metal_type === 'silver' && r.purity_karat === '999')?.rate_per_gram || '98.50';

  return (
    <header className="h-16 bg-[#380810] text-white border-b border-[#D4AF37]/30 flex items-center justify-between px-6 sticky top-0 z-40 shadow-md">
      {/* Brand & Ticker */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center shadow-inner text-[#380810]">
            <Gem className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg tracking-wide text-[#F4E297]">
              CHANDARKANT
            </h1>
            <p className="text-[10px] tracking-widest uppercase text-amber-200/70 -mt-1 font-sans">
              Jewellers Cloud
            </p>
          </div>
        </div>

        {/* Live Metal Rate Ticker Bar */}
        <div className="hidden lg:flex items-center gap-3 bg-black/25 px-3 py-1.5 rounded-full border border-[#D4AF37]/20 text-xs">
          <span className="flex items-center gap-1 text-amber-300 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Live Rates:
          </span>
          <span className="text-gray-300">
            Gold 24K: <strong className="text-amber-300">₹{rate24K}</strong>
          </span>
          <span className="text-amber-500/40">|</span>
          <span className="text-gray-300">
            Gold 22K (916): <strong className="text-amber-300">₹{rate22K}</strong>
          </span>
          <span className="text-amber-500/40">|</span>
          <span className="text-gray-300">
            Silver 999: <strong className="text-gray-200">₹{rateSilver}</strong>
          </span>
        </div>
      </div>

      {/* Center Search */}
      <div className="hidden md:flex items-center relative w-72">
        <Search className="w-4 h-4 text-amber-300/50 absolute left-3" />
        <input
          type="text"
          placeholder="Search items, HUID, customers..."
          className="w-full bg-black/20 border border-[#D4AF37]/30 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-amber-200/40 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Branch Selector */}
        {tenant?.branches && tenant.branches.length > 1 && (
          <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg border border-[#D4AF37]/20 text-xs">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={user?.branch_id || ''}
              onChange={(e) => switchBranch(Number(e.target.value))}
              aria-label="Active showroom branch"
              className="bg-transparent text-amber-200 focus:outline-none cursor-pointer text-xs"
            >
              {tenant.branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#380810] text-white">
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* User Card */}
        <div className="flex items-center gap-3 pl-3 border-l border-amber-500/20">
          <div className="w-8 h-8 rounded-full gold-gradient text-[#380810] font-bold text-xs flex items-center justify-center">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-amber-100">{user?.name}</p>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-amber-300/80 bg-amber-500/10 px-1.5 py-0.5 rounded">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>

          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 text-amber-300/70 hover:text-amber-200 hover:bg-black/20 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
