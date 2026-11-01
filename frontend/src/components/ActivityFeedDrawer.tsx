import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Bell,
  Receipt,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';

export interface ActivityItem {
  id: string;
  type: 'pos' | 'capture' | 'rates' | 'security' | 'inventory';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  link?: string;
  badge?: string;
  amount?: string;
}

interface ActivityFeedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityFeedDrawer: React.FC<ActivityFeedDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'pos' | 'capture' | 'rates'>('all');

  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: 'act-1',
      type: 'capture',
      title: 'AI Document Extracted: Purity 22K (916)',
      description: 'Document #DOC-9921 parsed with 99.2% confidence. Pending human approval.',
      timestamp: 'Just now',
      read: false,
      link: '/zero-capture',
      badge: 'Pending Review',
    },
    {
      id: 'act-2',
      type: 'pos',
      title: 'Tax Invoice #INV-2026-0889 Generated',
      description: 'Gold Bridal Necklace sold to Rajeshbhai Shah. Payment settled via NEFT.',
      timestamp: '8 mins ago',
      read: false,
      link: '/pos',
      amount: '₹3,45,200',
    },
    {
      id: 'act-3',
      type: 'rates',
      title: 'Bullion Rate Updated',
      description: 'Gold 24K updated to ₹7,950/g. Automatic recalculation synced to 1,480 catalog items.',
      timestamp: '25 mins ago',
      read: true,
      link: '/rates',
      badge: '+₹30/g',
    },
    {
      id: 'act-4',
      type: 'capture',
      title: 'Multilingual Voice Order Ingested',
      description: 'Hindi/Gujarati voice note transcribed: "22K gold chain 15.5g at today rate". Draft invoice created.',
      timestamp: '1 hour ago',
      read: true,
      link: '/zero-capture',
    },
    {
      id: 'act-5',
      type: 'security',
      title: 'Double-Entry Ledger Verified',
      description: 'Trial balance balanced with ₹0.00 discrepancy across 3 branch day books.',
      timestamp: '2 hours ago',
      read: true,
      link: '/accounting',
    },
  ]);

  if (!isOpen) return null;

  const filtered = filter === 'all' ? activities : activities.filter((a) => a.type === filter);
  const unreadCount = activities.filter((a) => !a.read).length;

  const markAllRead = () => {
    setActivities((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'pos':
        return <Receipt className="w-4 h-4 text-emerald-500" />;
      case 'capture':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'rates':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'security':
        return <ShieldCheck className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#111118] border-l border-zinc-200 dark:border-white/10 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                  Activity Feed & Alerts
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {unreadCount > 0 ? `${unreadCount} unread business notifications` : 'All caught up'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Mark read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-5 py-3 border-b border-zinc-200 dark:border-white/10 flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: 'capture', label: 'AI Capture' },
              { id: 'pos', label: 'POS Sales' },
              { id: 'rates', label: 'Rates' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  filter === tab.id
                    ? 'bg-amber-600 text-white dark:bg-amber-500/20 dark:text-amber-300 dark:border dark:border-amber-500/30 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Activity Stream */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-white/5">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                No telemetry events under this category.
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.link) {
                      navigate(item.link);
                      onClose();
                    }
                  }}
                  className={`p-4 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-start gap-3.5 relative ${
                    !item.read ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <div className="p-2 rounded-lg bg-zinc-100 dark:bg-white/10 shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1 shrink-0 font-mono">
                        <Clock className="w-2.5 h-2.5" /> {item.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            {item.badge}
                          </span>
                        )}
                        {item.amount && (
                          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {item.amount}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-0.5 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        View <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>

                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-4 right-3" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/20 flex items-center justify-between text-[11px] text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live WebSocket Stream Connected
            </span>
            <span className="font-mono text-[10px]">CJC Telemetry v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
