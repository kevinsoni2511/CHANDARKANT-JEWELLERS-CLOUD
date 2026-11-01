import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('cjc_sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('cjc_sidebar_collapsed', String(next));
      return next;
    });
  };

  const role = user?.role || 'owner';

  const sections = [
    {
      title: 'Core Operations',
      items: [
        { name: 'Showroom Dashboard', shortName: 'Dashboard', to: '/', icon: LayoutDashboard, roles: ['*'] },
        { name: 'Point of Sale (POS)', shortName: 'POS Billing', to: '/pos', icon: ShoppingCart, roles: ['owner', 'manager', 'sales', 'accountant', 'super_admin'] },
        { name: 'Zero-Manual Capture', shortName: 'AI Capture', to: '/zero-capture', icon: Sparkles, roles: ['*'], badge: 'AI' },
      ],
    },
    {
      title: 'Vault & Bullion',
      items: [
        { name: 'Jewellery Inventory', shortName: 'Inventory', to: '/inventory', icon: Boxes, roles: ['owner', 'manager', 'stock', 'super_admin'] },
        { name: 'Precious Metal Rates', shortName: 'Metal Rates', to: '/rates', icon: TrendingUp, roles: ['owner', 'manager', 'sales', 'stock', 'accountant', 'karigar', 'super_admin'] },
        { name: 'Karigar Workshop', shortName: 'Karigar', to: '/karigar', icon: Hammer, roles: ['owner', 'manager', 'stock', 'karigar', 'super_admin'] },
      ],
    },
    {
      title: 'Finance & CRM',
      items: [
        { name: 'Financial Accounting', shortName: 'Accounting', to: '/accounting', icon: BookOpen, roles: ['owner', 'accountant', 'super_admin'] },
        { name: 'Customer CRM', shortName: 'Customers', to: '/customers', icon: Users, roles: ['owner', 'manager', 'sales', 'accountant', 'super_admin'] },
        { name: 'Saving Schemes (Kitty)', shortName: 'Saving Kitty', to: '/saving-schemes', icon: PiggyBank, roles: ['owner', 'manager', 'sales', 'accountant', 'super_admin'] },
        { name: 'AI Business Copilot', shortName: 'AI Copilot', to: '/ai', icon: ShieldCheck, roles: ['*'] },
      ],
    },
  ];

  const roleLabelMap: Record<string, string> = {
    owner: 'Owner',
    manager: 'Manager',
    sales: 'Sales Exe',
    accountant: 'Accountant',
    stock: 'Vault Head',
    karigar: 'Karigar',
    super_admin: 'Super Admin',
  };

  return (
    <aside
      className={`hidden md:flex flex-col bg-[#1A0306] dark:bg-[#0C0C12] text-zinc-300 border-r border-[#D4AF37]/20 dark:border-white/10 transition-all duration-300 select-none min-h-[calc(100vh-4rem)] relative z-20 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header with Collapse Button */}
      <div className="p-3 border-b border-[#D4AF37]/15 dark:border-white/5 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden pl-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80 font-mono">
              Role:
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold uppercase tracking-wider border border-amber-500/25 truncate">
              {roleLabelMap[role] || role}
            </span>
          </div>
        )}

        <button
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`p-1.5 rounded-lg text-amber-300/70 hover:text-amber-200 hover:bg-white/5 transition-colors ${
            isCollapsed ? 'mx-auto' : ''
          }`}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 py-3 overflow-y-auto space-y-4 px-2.5">
        {sections.map((section, idx) => {
          const visibleItems = section.items.filter(
            (item) => item.roles.includes('*') || item.roles.includes(role)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold text-amber-400/50 uppercase tracking-widest font-mono">
                  {section.title}
                </p>
              )}

              {visibleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={isCollapsed ? item.name : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                        isActive
                          ? 'gold-gradient text-[#200408] font-bold shadow-md shadow-amber-500/10'
                          : 'text-zinc-300 hover:text-white hover:bg-white/5'
                      } ${isCollapsed ? 'justify-center' : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                            isActive ? 'text-[#200408]' : 'text-amber-400/80 group-hover:text-amber-300 group-hover:scale-110'
                          }`}
                        />
                        {!isCollapsed && (
                          <div className="flex-1 flex items-center justify-between truncate">
                            <span className="truncate">{item.shortName}</span>
                            {item.badge && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold tracking-wider ${
                                  isActive
                                    ? 'bg-[#200408] text-amber-300'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Collapsed Hover Tooltip */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#111118] text-white text-xs rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                            {item.name}
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-[#D4AF37]/15 dark:border-white/5 bg-black/20">
        {!isCollapsed ? (
          <div className="space-y-1 text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5 text-amber-300/80">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">BIS HUID & GST Ready</span>
            </div>
            <p className="text-[10px] text-zinc-500 truncate">
              Store: {user?.branch?.name || 'Surat Flagship'}
            </p>
          </div>
        ) : (
          <div className="flex justify-center" title="BIS HUID & GST System Ready">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
        )}
      </div>
    </aside>
  );
};
