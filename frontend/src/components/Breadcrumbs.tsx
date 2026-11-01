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
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-[#5A5E6B] dark:text-[#A6AAB6] py-2 px-6 border-b border-[#E3DFD7] dark:border-white/5 bg-[#FFFFFF]/95 dark:bg-[#111318]/95 backdrop-blur-md sticky top-0 z-20 transition-colors">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1.5 hover:text-[#C9A34A] transition-colors font-medium"
          >
            <Home className="w-3.5 h-3.5 text-[#C9A34A]" />
            <span>HQ Showroom</span>
          </Link>
        </li>

        {pathnames.length === 0 ? (
          <li className="flex items-center space-x-2">
            <ChevronRight className="w-3 h-3 text-[#8E929E] shrink-0" />
            <span className="font-semibold text-[#111318] dark:text-[#C9A34A]">
              Dashboard Overview
            </span>
          </li>
        ) : (
          pathnames.map((segment, index) => {
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            const displayName = routeNames[segment] || segment.replace(/-/g, ' ');

            return (
              <li key={to} className="flex items-center space-x-2">
                <ChevronRight className="w-3 h-3 text-[#8E929E] shrink-0" />
                {isLast ? (
                  <span className="font-semibold text-[#111318] dark:text-[#C9A34A] capitalize truncate max-w-[200px] sm:max-w-none">
                    {displayName}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="hover:text-[#C9A34A] transition-colors capitalize"
                  >
                    {displayName}
                  </Link>
                )}
              </li>
            );
          })
        )}
      </ol>
    </nav>
  );
};
