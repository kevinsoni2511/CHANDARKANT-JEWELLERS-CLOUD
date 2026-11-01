import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  TrendingUp,
  BookOpen,
  Users,
  Hammer,
  PiggyBank,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Point of Sale (POS)', to: '/pos', icon: ShoppingCart },
    { name: 'Jewellery Inventory', to: '/inventory', icon: Boxes },
    { name: 'Precious Metal Rates', to: '/rates', icon: TrendingUp },
    { name: 'Financial Accounting', to: '/accounting', icon: BookOpen },
    { name: 'Customer CRM', to: '/customers', icon: Users },
    { name: 'Karigar Management', to: '/karigar', icon: Hammer },
    { name: 'Saving Schemes (Kitty)', to: '/saving-schemes', icon: PiggyBank },
    { name: 'AI Business Copilot', to: '/ai', icon: Sparkles },
  ];

  return (
    <aside className="w-64 bg-[#2C070C] text-amber-100 flex flex-col border-r border-[#D4AF37]/20 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1 space-y-1">
        <p className="text-[11px] font-semibold text-amber-400/60 uppercase tracking-wider px-3 mb-2">
          Enterprise Operations
        </p>

        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'gold-gradient text-[#380810] font-semibold shadow-md'
                    : 'text-amber-200/80 hover:bg-[#56111C] hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-amber-500/15 text-[11px] text-amber-200/50">
        <div className="flex items-center gap-1.5 text-amber-300/80 mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>BIS & GST Compliant</span>
        </div>
        <p>Tenant: {user?.branch?.name || 'Surat Flagship'}</p>
        <p className="text-[9px] mt-1 text-amber-400/40">CJC Enterprise v0.1.0</p>
      </div>
    </aside>
  );
};
