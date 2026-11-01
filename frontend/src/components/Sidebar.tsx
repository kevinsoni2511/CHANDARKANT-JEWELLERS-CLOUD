import React, { useState } from 'react';
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

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
}) => {
  const { user } = useAuth();
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('cjc_sidebar_collapsed') === 'true';
  });

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => {
        const next = !prev;
        localStorage.setItem('cjc_sidebar_collapsed', String(next));
        return next;
      });
    }
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
      className={`hidden md:flex flex-col bg-[#F6F5F1] dark:bg-[#111318] text-[#111318] dark:text-[#F6F5F1] border-r border-[#E3DFD7] dark:border-white/10 transition-all duration-300 select-none h-full shrink-0 relative z-20 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header with Role & Collapse Button */}
      <div className="p-3 border-b border-[#E3DFD7] dark:border-white/5 flex items-center justify-between shrink-0 h-14">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2 overflow-hidden pl-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C9A34A] font-mono">
                Role:
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A34A]/15 text-[#C9A34A] font-bold uppercase tracking-wider border border-[#C9A34A]/25 truncate">
                {roleLabelMap[role] || role}
              </span>
            </div>

            <button
              onClick={toggleCollapse}
              title="Collapse sidebar (Ctrl + B)"
              className="p-1.5 rounded-lg text-[#5A5E6B] dark:text-[#A6AAB6] hover:text-[#C9A34A] hover:bg-[#111318]/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={toggleCollapse}
            title="Expand sidebar (Ctrl + B)"
            className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl text-[#5A5E6B] dark:text-[#A6AAB6] hover:text-[#C9A34A] hover:bg-[#C9A34A]/10 transition-colors cursor-pointer"
          >
            <PanelLeftOpen className="w-4 h-4 text-[#C9A34A]" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div
        className={`flex-1 py-2 overflow-y-auto ${
          isCollapsed
            ? 'space-y-1.5 px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
            : 'space-y-3.5 px-3'
        }`}
      >
        {sections.map((section) => {
          const visibleItems = section.items.filter(
            (item) => item.roles.includes('*') || item.roles.includes(role)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold text-[#C9A34A]/70 uppercase tracking-widest font-mono">
                  {section.title}
                </p>
              )}

              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isAiItem = item.to === '/zero-capture' || item.to === '/ai';
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={isCollapsed ? item.name : undefined}
                    className={({ isActive }) =>
                      `flex items-center rounded-xl text-xs font-medium transition-all group relative ${
                        isCollapsed
                          ? 'w-12 h-11 mx-auto justify-center'
                          : 'gap-3 px-3 py-2.5'
                      } ${
                        isActive
                          ? 'gold-gradient text-[#111318] font-bold shadow-md shadow-[#C9A34A]/15'
                          : 'text-[#5A5E6B] dark:text-[#A6AAB6] hover:text-[#111318] dark:hover:text-[#F6F5F1] hover:bg-[#111318]/5 dark:hover:bg-white/5'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                            isActive
                              ? 'text-[#111318]'
                              : isAiItem
                              ? 'text-[#8B7CF6] group-hover:scale-110'
                              : 'text-[#C9A34A] group-hover:scale-110'
                          }`}
                        />
                        {!isCollapsed && (
                          <div className="flex-1 flex items-center justify-between truncate">
                            <span className="truncate">{item.shortName}</span>
                            {item.badge && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold tracking-wider ${
                                  isActive
                                    ? 'bg-[#111318] text-[#8B7CF6]'
                                    : 'bg-[#8B7CF6]/15 text-[#8B7CF6] border border-[#8B7CF6]/30'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Collapsed Hover Tooltip */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#181A22] text-[#F6F5F1] text-xs font-semibold rounded-xl shadow-2xl border border-white/10 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 flex items-center gap-2">
                            <span>{item.name}</span>
                            {item.badge && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-[#8B7CF6]/20 text-[#8B7CF6] border border-[#8B7CF6]/30">
                                {item.badge}
                              </span>
                            )}
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

      {/* Dedicated Collapse / Expand Bar */}
      <div className="p-2 border-t border-[#E3DFD7] dark:border-white/5 shrink-0">
        <button
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expand sidebar (Ctrl + B)' : 'Collapse sidebar (Ctrl + B)'}
          className={`w-full flex items-center rounded-xl py-2 text-xs font-semibold text-[#5A5E6B] dark:text-[#A6AAB6] hover:text-[#C9A34A] hover:bg-[#C9A34A]/10 transition-all cursor-pointer ${
            isCollapsed ? 'justify-center px-0' : 'justify-between px-3'
          }`}
        >
          {!isCollapsed ? (
            <>
              <span className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4 text-[#C9A34A]" />
                <span>Collapse Sidebar</span>
              </span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#8E929E]">
                Ctrl+B
              </kbd>
            </>
          ) : (
            <ChevronRight className="w-4 h-4 text-[#C9A34A]" />
          )}
        </button>
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-[#E3DFD7] dark:border-white/5 bg-[#111318]/5 dark:bg-white/5 shrink-0">
        {!isCollapsed ? (
          <div className="space-y-1 text-[11px] text-[#5A5E6B] dark:text-[#A6AAB6]">
            <div className="flex items-center gap-1.5 text-[#35BFA0]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#35BFA0] shrink-0" />
              <span className="truncate font-medium">BIS HUID & GST Ready</span>
            </div>
            <p className="text-[10px] text-[#8E929E] truncate">
              Store: {user?.branch?.name || 'Surat Flagship'}
            </p>
          </div>
        ) : (
          <div className="flex justify-center" title="BIS HUID & GST System Ready">
            <ShieldCheck className="w-4 h-4 text-[#35BFA0]" />
          </div>
        )}
      </div>
    </aside>
  );
};
