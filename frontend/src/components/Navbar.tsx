import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Gem,
  MapPin,
  Search,
  Bell,
  LogOut,
  TrendingUp,
  Sun,
  Moon,
  Sparkles,
  Command,
} from 'lucide-react';
import api from '../services/api';
import { MetalRate } from '../types';

interface NavbarProps {
  onOpenCommandPalette?: () => void;
  onOpenActivityFeed?: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommandPalette,
  onOpenActivityFeed,
  unreadCount = 2,
}) => {
  const { user, tenant, logout, switchBranch } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [rates, setRates] = useState<MetalRate[]>([]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await api.get('/metal-rates');
        if (res.data.success) {
          setRates(res.data.data);
        }
      } catch (e) {
        // Fallback gracefully
      }
    };
    fetchRates();
  }, []);

  const rate24K = rates.find((r) => r.metal_type === 'gold' && r.purity_karat === '24K')?.rate_per_gram || '7950.00';
  const rate22K = rates.find((r) => r.metal_type === 'gold' && r.purity_karat === '22K')?.rate_per_gram || '7287.50';
  const rateSilver = rates.find((r) => r.metal_type === 'silver' && r.purity_karat === '999')?.rate_per_gram || '98.50';

  return (
    <header className="h-16 bg-[#200408] dark:bg-[#09090D] text-white border-b border-[#D4AF37]/25 dark:border-white/10 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 backdrop-blur-md shadow-lg transition-colors">
      {/* Brand & Ticker */}
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => (window.location.href = '/')}>
          <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center shadow-md text-[#200408] transform group-hover:scale-105 transition-transform duration-200">
            <Gem className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-base sm:text-lg tracking-wider text-[#F4E297] dark:text-[#E5C358] leading-tight">
              CHANDARKANT
            </h1>
            <p className="text-[9px] sm:text-[10px] tracking-widest uppercase text-amber-200/70 dark:text-zinc-400 font-sans font-medium">
              Jewellers Cloud
            </p>
          </div>
        </div>

        {/* Live Metal Rate Ticker Bar (Desktop) */}
        <div className="hidden xl:flex items-center gap-3 bg-black/30 dark:bg-white/5 px-3 py-1.5 rounded-full border border-[#D4AF37]/20 dark:border-white/10 text-xs">
          <span className="flex items-center gap-1.5 text-amber-300 dark:text-amber-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <TrendingUp className="w-3.5 h-3.5" /> Bullion:
          </span>
          <span className="text-zinc-300">
            Gold 24K: <strong className="text-amber-300 font-mono">₹{rate24K}</strong>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-300">
            Gold 22K (916): <strong className="text-amber-300 font-mono">₹{rate22K}</strong>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-300">
            Silver 999: <strong className="text-zinc-100 font-mono">₹{rateSilver}</strong>
          </span>
        </div>
      </div>

      {/* Center Command Palette Search Trigger (Linear/Vercel Inspired) */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between bg-black/25 dark:bg-white/5 hover:bg-black/35 dark:hover:bg-white/10 border border-[#D4AF37]/30 dark:border-white/10 text-zinc-300 px-3.5 py-1.5 rounded-xl text-xs transition-all duration-150 group shadow-inner"
        >
          <div className="flex items-center gap-2.5 text-zinc-300 dark:text-zinc-400 group-hover:text-amber-200">
            <Search className="w-3.5 h-3.5 text-amber-400/80" />
            <span className="text-xs">Quick search items, HUID, bills, patrons...</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="kbd-badge">Ctrl</span>
            <span className="kbd-badge">K</span>
          </div>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Mobile Search Button */}
        <button
          onClick={onOpenCommandPalette}
          title="Search (Ctrl + K)"
          className="md:hidden p-2 text-amber-200/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Theme Toggle (Dark / Light) */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light Mode' : 'Dark Mode'}`}
          className="p-2 text-amber-200/80 hover:text-amber-300 hover:bg-white/10 rounded-lg transition-colors relative"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-300 transition-transform rotate-0 scale-100" />
          ) : (
            <Moon className="w-4 h-4 text-amber-100 transition-transform rotate-0 scale-100" />
          )}
        </button>

        {/* Activity & Notifications Feed Trigger */}
        <button
          onClick={onOpenActivityFeed}
          title="Activity Feed & Notifications"
          className="p-2 text-amber-200/80 hover:text-amber-300 hover:bg-white/10 rounded-lg transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#200408] dark:ring-[#09090D] animate-pulse" />
          )}
        </button>

        {/* Branch Selector */}
        {tenant?.branches && tenant.branches.length > 1 && (
          <div className="hidden sm:flex items-center gap-1.5 bg-black/25 dark:bg-white/5 px-2.5 py-1.5 rounded-lg border border-[#D4AF37]/25 dark:border-white/10 text-xs">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={user?.branch_id || ''}
              onChange={(e) => switchBranch(Number(e.target.value))}
              aria-label="Active showroom branch"
              className="bg-transparent text-amber-200 dark:text-zinc-200 focus:outline-none cursor-pointer text-xs"
            >
              {tenant.branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#200408] dark:bg-[#111118] text-white">
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-amber-500/20 dark:border-white/10">
          <div className="w-8 h-8 rounded-full gold-gradient text-[#200408] font-bold text-xs flex items-center justify-center shadow">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-amber-100 dark:text-zinc-100 leading-tight">
              {user?.name}
            </p>
            <span className="text-[9px] uppercase font-bold tracking-wider text-amber-300/90 dark:text-amber-400/90 bg-amber-500/10 dark:bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/20">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>

          <button
            onClick={logout}
            title="Sign out of CJC"
            className="p-1.5 text-amber-300/70 hover:text-amber-200 hover:bg-white/10 rounded-lg transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
