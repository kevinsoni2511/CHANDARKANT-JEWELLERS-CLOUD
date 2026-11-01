import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  TrendingUp,
  BookOpen,
  Users,
  Hammer,
  PiggyBank,
  Sparkles,
  Moon,
  Sun,
  PlusCircle,
  FileSpreadsheet,
  Mic,
  ArrowRight,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items = [
    // Navigation
    { id: 'dash', title: 'Showroom Dashboard', section: 'Navigation', icon: LayoutDashboard, path: '/' },
    { id: 'pos', title: 'Point of Sale (POS) Billing', section: 'Navigation', icon: ShoppingCart, path: '/pos' },
    { id: 'zero', title: 'Zero-Manual Capture & AI Scanner', section: 'Navigation', icon: Sparkles, path: '/zero-capture' },
    { id: 'inv', title: 'Jewellery Vault & Inventory', section: 'Navigation', icon: Boxes, path: '/inventory' },
    { id: 'rates', title: 'Precious Metal Rates Engine', section: 'Navigation', icon: TrendingUp, path: '/rates' },
    { id: 'acc', title: 'Financial Accounting & Day Book', section: 'Navigation', icon: BookOpen, path: '/accounting' },
    { id: 'cust', title: 'Customer CRM & Patrons', section: 'Navigation', icon: Users, path: '/customers' },
    { id: 'kar', title: 'Karigar Management & Job Work', section: 'Navigation', icon: Hammer, path: '/karigar' },
    { id: 'kitty', title: 'Gold Saving Schemes (Kitty)', section: 'Navigation', icon: PiggyBank, path: '/saving-schemes' },
    { id: 'ai', title: 'AI Business Copilot Query', section: 'Navigation', icon: Sparkles, path: '/ai' },

    // Quick Actions
    { id: 'act-pos', title: 'New Sales Invoice', section: 'Quick Actions', icon: PlusCircle, path: '/pos' },
    { id: 'act-voice', title: 'Trigger Voice Command Studio', section: 'Quick Actions', icon: Mic, path: '/zero-capture' },
    { id: 'act-rates', title: 'Update Daily Bullion Board Rates', section: 'Quick Actions', icon: TrendingUp, path: '/rates' },
    { id: 'act-daybook', title: 'View Today\'s Double-Entry Day Book', section: 'Quick Actions', icon: FileSpreadsheet, path: '/accounting' },
    {
      id: 'act-theme',
      title: `Switch to ${theme === 'dark' ? 'Light Mode' : 'Dark Mode'}`,
      section: 'Preferences',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => toggleTheme(),
    },
  ];

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.section.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          if (selected.action) {
            selected.action();
          } else if (selected.path) {
            navigate(selected.path);
          }
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl bg-[#FFFFFF] dark:bg-[#111318] border border-[#E3DFD7] dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E3DFD7] dark:border-white/10">
          <Search className="w-5 h-5 text-[#C9A34A]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or jump to module..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm text-[#111318] dark:text-[#F6F5F1] placeholder-[#8E929E] outline-none"
          />
          <span className="kbd-badge">ESC</span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8E929E]">
              No matching commands found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              const isAi = item.id.includes('zero') || item.id.includes('ai') || item.id.includes('voice');
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else if (item.path) {
                      navigate(item.path);
                    }
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#C9A34A]/15 text-[#111318] dark:text-[#F6F5F1] font-semibold border border-[#C9A34A]/30'
                      : 'text-[#5A5E6B] dark:text-[#A6AAB6] hover:bg-[#111318]/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isAi ? 'text-[#8B7CF6]' : 'text-[#C9A34A]'}`} />
                    <span>{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#8E929E] uppercase font-mono">{item.section}</span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-[#C9A34A]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 bg-[#ECEAE4]/50 dark:bg-white/5 border-t border-[#E3DFD7] dark:border-white/10 flex items-center justify-between text-[11px] text-[#5A5E6B] dark:text-[#A6AAB6]">
          <div className="flex items-center gap-3">
            <span>
              <span className="kbd-badge">↑</span> <span className="kbd-badge">↓</span> Navigate
            </span>
            <span>
              <span className="kbd-badge">↵</span> Select
            </span>
          </div>
          <span className="text-[10px] text-[#C9A34A] font-medium font-luxury">
            Chandarkant Jewellers Cloud
          </span>
        </div>
      </div>
    </div>
  );
};
