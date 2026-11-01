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

  const role = user?.role || 'owner';

  const allNavigation = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard, roles: ['*'] },
    { name: 'Point of Sale (POS)', to: '/pos', icon: ShoppingCart, roles: ['owner', 'manager', 'sales', 'accountant', 'super_admin'] },
    { name: 'Zero-Manual Capture', to: '/zero-capture', icon: Sparkles, roles: ['*'] },
    { name: 'Jewellery Inventory', to: '/inventory', icon: Boxes, roles: ['owner', 'manager', 'stock', 'super_admin'] },
    { name: 'Precious Metal Rates', to: '/rates', icon: TrendingUp, roles: ['owner', 'manager', 'sales', 'stock', 'accountant', 'karigar', 'super_admin'] },
    { name: 'Financial Accounting', to: '/accounting', icon: BookOpen, roles: ['owner', 'accountant', 'super_admin'] },
    { name: 'Customer CRM', to: '/customers', icon: Users, roles: ['owner', 'manager', 'sales', 'accountant', 'super_admin'] },
    { name: 'Karigar Management', to: '/karigar', icon: Hammer, roles: ['owner', 'manager', 'stock', 'karigar', 'super_admin'] },
    { name: 'Saving Schemes (Kitty)', to: '/saving-schemes', icon: PiggyBank, roles: ['owner', 'manager', 'sales', 'accountant', 'super_admin'] },
    { name: 'AI Business Copilot', to: '/ai', icon: ShieldCheck, roles: ['*'] },
  ];

  const navigation = allNavigation.filter(
    (item) => item.roles.includes('*') || item.roles.includes(role)
  );

  const roleLabelMap: Record<string, string> = {
    owner: 'Showroom Owner',
    manager: 'Branch Manager',
    sales: 'Sales Executive',
    accountant: 'Chief Accountant',
    stock: 'Inventory Head',
    karigar: 'Master Karigar',
    super_admin: 'Super Admin',
  };

  return (
    <aside className="w-64 bg-[#2C070C] text-amber-100 flex flex-col border-r border-[#D4AF37]/20 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1 space-y-1">
        <div className="px-3 mb-3 flex items-center justify-between">
          <p className="text-[10px] font-semibold text-amber-400/60 uppercase tracking-wider">
            Enterprise Operations
          </p>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold uppercase tracking-wider border border-amber-500/20">
            {roleLabelMap[role] || role}
          </span>
        </div>

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
        <p className="text-[10px] text-amber-300/70 mt-0.5 font-medium">Signed in: {user?.name}</p>
      </div>
    </aside>
  );
};
