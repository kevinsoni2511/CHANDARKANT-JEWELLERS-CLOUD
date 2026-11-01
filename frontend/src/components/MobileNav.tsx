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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 dark:bg-[#111318]/95 backdrop-blur-lg border-t border-[#E3DFD7] dark:border-white/10 px-2 py-1 shadow-2xl transition-colors safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isAi = item.to === '/zero-capture';
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-[#C9A34A] font-semibold'
                    : 'text-[#5A5E6B] dark:text-[#A6AAB6] hover:text-[#111318] dark:hover:text-[#F6F5F1]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1.5 rounded-lg transition-transform ${
                      item.highlight && !isActive
                        ? 'bg-[#8B7CF6]/15 text-[#8B7CF6]'
                        : isActive
                        ? 'scale-110 bg-[#C9A34A]/15 text-[#C9A34A]'
                        : ''
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5">{item.name}</span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-[#C9A34A] absolute -bottom-0.5" />
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
          className="flex flex-col items-center justify-center py-1.5 px-2 text-[#5A5E6B] dark:text-[#A6AAB6] hover:text-[#C9A34A] transition-colors"
        >
          <div className="p-1.5 rounded-lg bg-[#111318]/5 dark:bg-white/5">
            <Search className="w-5 h-5 text-[#C9A34A]" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Search</span>
        </button>
      </div>
    </nav>
  );
};
