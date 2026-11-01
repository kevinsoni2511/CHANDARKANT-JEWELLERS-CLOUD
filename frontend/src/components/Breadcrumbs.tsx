import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNames: Record<string, string> = {
  pos: 'Point of Sale (POS)',
  'zero-capture': 'Zero-Manual Capture & AI Scanner',
  inventory: 'Jewellery Vault & Inventory',
  rates: 'Precious Metal Rates',
  accounting: 'Financial Accounting & Day Book',
  customers: 'Customer CRM & Patrons',
  karigar: 'Karigar Management & Job Work',
  'saving-schemes': 'Gold Saving Schemes (Kitty)',
  ai: 'AI Business Copilot',
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-zinc-500 dark:text-zinc-400 py-2.5 px-6 border-b border-amber-900/10 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-md sticky top-16 z-30 transition-colors">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1.5 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
          >
            <Home className="w-3.5 h-3.5" />
            <span>HQ Showroom</span>
          </Link>
        </li>

        {pathnames.map((segment, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayName = routeNames[segment] || segment.replace(/-/g, ' ');

          return (
            <li key={to} className="flex items-center space-x-2">
              <ChevronRight className="w-3 h-3 text-zinc-400 dark:text-zinc-600 shrink-0" />
              {isLast ? (
                <span className="font-semibold text-zinc-900 dark:text-amber-300 capitalize truncate max-w-[200px] sm:max-w-none">
                  {displayName}
                </span>
              ) : (
                <Link
                  to={to}
                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors capitalize"
                >
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
