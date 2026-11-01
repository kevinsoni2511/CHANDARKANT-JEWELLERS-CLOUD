import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Breadcrumbs } from './components/Breadcrumbs';
import { CommandPalette } from './components/CommandPalette';
import { MobileNav } from './components/MobileNav';
import { ActivityFeedDrawer } from './components/ActivityFeedDrawer';
import { LoginView } from './modules/Auth/LoginView';
import { DashboardView } from './modules/Dashboard/DashboardView';
import { PosBillingView } from './modules/Pos/PosBillingView';
import { InventoryView } from './modules/Inventory/InventoryView';
import { MetalRatesView } from './modules/MetalRates/MetalRatesView';
import { AccountingView } from './modules/Accounting/AccountingView';
import { CustomerListView } from './modules/Customers/CustomerListView';
import { KarigarView } from './modules/Karigar/KarigarView';
import { SavingSchemesView } from './modules/SavingSchemes/SavingSchemesView';
import { AiCopilotView } from './modules/AiCopilot/AiCopilotView';
import { ZeroManualEntryView } from './modules/ZeroCapture/ZeroManualEntryView';

const ProtectedLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isActivityFeedOpen, setIsActivityFeedOpen] = useState(false);

  // Global Ctrl + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A0306] dark:bg-[#09090D] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-mono text-amber-200/80 tracking-widest uppercase">
            Loading Chandarkant Cloud...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F2] dark:bg-[#09090D] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Top Navigation */}
      <Navbar
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenActivityFeed={() => setIsActivityFeedOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Breadcrumbs Navigation */}
          <Breadcrumbs />

          {/* Module Views with bottom padding on mobile for MobileNav */}
          <main className="flex-1 pb-20 md:pb-6">
            <Routes>
              <Route path="/" element={<DashboardView />} />
              <Route path="/pos" element={<PosBillingView />} />
              <Route path="/zero-capture" element={<ZeroManualEntryView />} />
              <Route path="/inventory" element={<InventoryView />} />
              <Route path="/rates" element={<MetalRatesView />} />
              <Route path="/accounting" element={<AccountingView />} />
              <Route path="/customers" element={<CustomerListView />} />
              <Route path="/karigar" element={<KarigarView />} />
              <Route path="/saving-schemes" element={<SavingSchemesView />} />
              <Route path="/ai" element={<AiCopilotView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>

      {/* Global Interactive Overlays */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      <ActivityFeedDrawer
        isOpen={isActivityFeedOpen}
        onClose={() => setIsActivityFeedOpen(false)}
      />

      {/* Mobile-First Bottom Navigation */}
      <MobileNav onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
