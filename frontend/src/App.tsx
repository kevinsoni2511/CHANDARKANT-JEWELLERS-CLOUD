import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#24060B] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F2]">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
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
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
