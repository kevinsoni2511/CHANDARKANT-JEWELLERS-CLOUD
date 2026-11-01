import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Sparkles,
  Boxes,
  TrendingUp,
  Search,
} from 'lucide-react';

interface MobileNavProps {
  onOpenCommandPalette: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenCommandPalette }) => {
  const navItems = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'POS', to: '/pos', icon: ShoppingCart },
    { name: 'AI Capture', to: '/zero-capture', icon: Sparkles, highlight: true },
    { name: 'Inventory', to: '/inventory', icon: Boxes },
    { name: 'Rates', to: '/rates', icon: TrendingUp },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111118]/95 backdrop-blur-lg border-t border-zinc-200 dark:border-white/10 px-2 py-1 shadow-2xl transition-colors safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-amber-600 dark:text-amber-400 font-semibold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1.5 rounded-lg transition-transform ${
                      item.highlight && !isActive
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : isActive
                        ? 'scale-110 bg-amber-500/15'
                        : ''
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5">{item.name}</span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-amber-500 absolute -bottom-0.5" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Global Search / Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          title="Open Command Palette (Ctrl+K)"
          className="flex flex-col items-center justify-center py-1.5 px-2 text-zinc-500 dark:text-zinc-400 hover:text-amber-500 transition-colors"
        >
          <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-white/5">
            <Search className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Search</span>
        </button>
      </div>
    </nav>
  );
};
