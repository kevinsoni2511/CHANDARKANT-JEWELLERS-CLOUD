import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Gem, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('owner@chandarkantjewellers.com');
  const [password, setPassword] = useState('OwnerSecure@2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    { label: 'Business Owner', email: 'owner@chandarkantjewellers.com', pass: 'OwnerSecure@2026' },
    { label: 'Sales Staff (POS)', email: 'sales@chandarkantjewellers.com', pass: 'SalesSecure@2026' },
    { label: 'Chief Accountant', email: 'accountant@chandarkantjewellers.com', pass: 'AccountantSecure@2026' },
    { label: 'Branch Manager', email: 'manager.surat@chandarkantjewellers.com', pass: 'ManagerSecure@2026' },
    { label: 'Inventory Head', email: 'stock@chandarkantjewellers.com', pass: 'StockSecure@2026' },
    { label: 'Super Admin', email: 'superadmin@chandarkantjewellers.com', pass: 'SuperSecure@2026' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const ok = await login(email, password);
      if (ok) {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  const selectDemo = (demo: typeof demoAccounts[0]) => {
    setEmail(demo.email);
    setPassword(demo.pass);
  };

  return (
    <div className="min-h-screen bg-[#24060B] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gold Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="w-16 h-16 rounded-2xl gold-gradient mx-auto flex items-center justify-center shadow-2xl text-[#380810] mb-4">
          <Gem className="w-9 h-9" />
        </div>
        <h1 className="font-serif font-bold text-3xl tracking-wide text-[#F4E297]">
          CHANDARKANT
        </h1>
        <p className="text-xs tracking-widest uppercase text-amber-200/70 font-sans mt-0.5">
          Jewellers Cloud Enterprise ERP
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-[#D4AF37]/40 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Authorized Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-600 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg gold-gradient text-[#380810] font-serif font-bold text-xs shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Terminal'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center mb-2.5">
              1-Click Demo Staff Role Switcher
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {demoAccounts.map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => selectDemo(d)}
                  className={`text-[11px] text-left p-2 rounded border transition-all ${
                    email === d.email
                      ? 'border-amber-600 bg-amber-50 font-bold text-[#56111C]'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-[11px] text-amber-200/50 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Multi-Tenant PostgreSQL Cloud Isolation</span>
        </div>
      </div>
    </div>
  );
};
