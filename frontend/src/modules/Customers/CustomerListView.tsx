import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  Plus,
  Award,
  Phone,
  MapPin,
  CreditCard,
  X,
  Printer,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { Customer } from '../../types';
import { DataTable, Column } from '../../components/DataTable';

export const CustomerListView: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeCustomerStatement, setActiveCustomerStatement] = useState<Customer | null>(null);

  const [newCust, setNewCust] = useState({
    name: '',
    phone: '',
    email: '',
    pan_number: '',
    city: 'Surat',
    state: 'Gujarat',
    birthday: '',
    anniversary: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers');
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/customers', newCust);
      if (res.data.success) {
        setShowModal(false);
        fetchCustomers();
        setNewCust({
          name: '',
          phone: '',
          email: '',
          pan_number: '',
          city: 'Surat',
          state: 'Gujarat',
          birthday: '',
          anniversary: '',
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating customer');
    }
  };

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Patron Name',
      sortable: true,
      accessor: (c: Customer) => (
        <span className="font-semibold text-[#111318] dark:text-[#F6F5F1] flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-[#C9A34A] shrink-0" /> {c.name}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Contact Phone',
      sortable: true,
      accessor: (c: Customer) => <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{c.phone}</span>,
    },
    {
      key: 'pan_number',
      header: 'PAN / Tax ID',
      sortable: true,
      accessor: (c: Customer) => (
        <span className="font-mono text-xs uppercase text-slate-700 dark:text-slate-300">
          {c.pan_number || <span className="text-slate-400 italic">None</span>}
        </span>
      ),
    },
    {
      key: 'city',
      header: 'City',
      sortable: true,
      accessor: (c: Customer) => <span className="text-slate-600 dark:text-slate-400">{c.city || 'Surat'}</span>,
    },
    {
      key: 'loyalty_tier',
      header: 'Loyalty Tier',
      sortable: true,
      accessor: (c: Customer) => (
        <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-[#C9A34A]/15 text-[#C9A34A] border border-[#C9A34A]/25">
          {c.loyalty_tier || 'standard'}
        </span>
      ),
    },
    {
      key: 'loyalty_points',
      header: 'Points',
      align: 'right',
      sortable: true,
      accessor: (c: Customer) => (
        <span className="font-mono text-[#35BFA0] font-bold">
          {c.loyalty_points} pts
        </span>
      ),
    },
    {
      key: 'outstanding_balance',
      header: 'Outstanding (₹)',
      align: 'right',
      sortable: true,
      accessor: (c: Customer) => (
        <span className="font-mono font-bold text-[#111318] dark:text-[#F6F5F1]">
          ₹{Number(c.outstanding_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Statement / Slip',
      align: 'center',
      accessor: (c: Customer) => (
        <button
          onClick={() => setActiveCustomerStatement(c)}
          title="Print Patron Account Statement / PDF"
          className="px-2.5 py-1 text-[11px] rounded bg-slate-100 hover:bg-[#C9A34A]/20 dark:bg-white/5 dark:hover:bg-[#C9A34A]/20 text-[#C9A34A] border border-[#C9A34A]/30 inline-flex items-center gap-1 transition-all cursor-pointer font-medium"
        >
          <Printer className="w-3 h-3" /> Ledger
        </button>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#111318] dark:text-[#F6F5F1]">
            Customer CRM & Patron Ledgers
          </h2>
          <p className="text-xs text-[#5A5E6B] dark:text-[#A6AAB6] mt-0.5">
            KYC compliance, statutory PAN records, loyalty reward tiers, and statement printouts
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl gold-gradient text-[#111318] font-bold text-xs shadow hover:brightness-105 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#111318]" /> + Register New Patron
        </button>
      </div>

      {/* Main Luxury DataTable */}
      <DataTable<Customer>
        data={customers}
        columns={columns}
        title="Patron CRM Ledger & KYC Compliance Directory"
        subtitle="Sortable, filterable client ledger with Microsoft Excel (.xlsx) export, auto-filters, and A4 print"
        searchPlaceholder="Search patrons by name, phone, PAN card, or city..."
        searchKeys={['name', 'phone', 'pan_number', 'city', 'loyalty_tier']}
        exportFileName="cjc-patrons-ledger"
        loading={loading}
      />

      {/* Register Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#181A22] border border-[#E3DFD7] dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E3DFD7] dark:border-white/10 pb-3">
              <h3 className="font-serif font-bold text-sm text-[#111318] dark:text-[#F6F5F1]">
                Register New Jewellery Customer
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#8E929E] hover:text-[#111318] dark:hover:text-[#F6F5F1] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#5A5E6B] dark:text-[#A6AAB6] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  className="w-full bg-[#ECEAE4]/40 dark:bg-[#111318] border border-[#E3DFD7] dark:border-white/10 rounded-xl px-3 py-1.5 text-[#111318] dark:text-[#F6F5F1] outline-none focus:border-[#C9A34A]"
                />
              </div>

              <div>
                <label className="block text-[#5A5E6B] dark:text-[#A6AAB6] mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={newCust.phone}
                  onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                  className="w-full bg-[#ECEAE4]/40 dark:bg-[#111318] border border-[#E3DFD7] dark:border-white/10 rounded-xl px-3 py-1.5 font-mono text-[#111318] dark:text-[#F6F5F1] outline-none focus:border-[#C9A34A]"
                />
              </div>

              <div>
                <label className="block text-[#5A5E6B] dark:text-[#A6AAB6] mb-1">PAN Card Number</label>
                <input
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  value={newCust.pan_number}
                  onChange={(e) => setNewCust({ ...newCust, pan_number: e.target.value.toUpperCase() })}
                  className="w-full bg-[#ECEAE4]/40 dark:bg-[#111318] border border-[#E3DFD7] dark:border-white/10 rounded-xl px-3 py-1.5 font-mono uppercase text-[#111318] dark:text-[#F6F5F1] outline-none focus:border-[#C9A34A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#5A5E6B] dark:text-[#A6AAB6] mb-1">City</label>
                  <input
                    type="text"
                    value={newCust.city}
                    onChange={(e) => setNewCust({ ...newCust, city: e.target.value })}
                    className="w-full bg-[#ECEAE4]/40 dark:bg-[#111318] border border-[#E3DFD7] dark:border-white/10 rounded-xl px-3 py-1.5 text-[#111318] dark:text-[#F6F5F1] outline-none focus:border-[#C9A34A]"
                  />
                </div>
                <div>
                  <label className="block text-[#5A5E6B] dark:text-[#A6AAB6] mb-1">Email</label>
                  <input
                    type="email"
                    value={newCust.email}
                    onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                    className="w-full bg-[#ECEAE4]/40 dark:bg-[#111318] border border-[#E3DFD7] dark:border-white/10 rounded-xl px-3 py-1.5 text-[#111318] dark:text-[#F6F5F1] outline-none focus:border-[#C9A34A]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 border border-[#E3DFD7] dark:border-white/10 rounded-xl text-[#5A5E6B] dark:text-[#A6AAB6] hover:bg-[#111318]/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 gold-gradient text-[#111318] font-bold rounded-xl shadow cursor-pointer hover:brightness-105"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Individual Patron Statement / Ledger PDF Frame */}
      {activeCustomerStatement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#181A22] rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden my-8">
            {/* Screen Toolbar */}
            <div className="no-print flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C9A34A]" />
                <span className="font-semibold text-sm">Patron Account Statement</span>
                <span className="text-xs font-mono text-[#C9A34A]">({activeCustomerStatement.name})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 gold-gradient text-[#111318] font-bold rounded-lg text-xs shadow-md hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCustomerStatement(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Statement Sheet */}
            <div className="p-6 bg-slate-100 dark:bg-[#111318]/50 overflow-y-auto max-h-[80vh] flex justify-center">
              <div
                id="printable-receipt"
                className="printable-sheet bg-white text-[#111318] p-8 rounded-lg shadow-md w-full max-w-lg border-2 border-[#C9A34A] relative"
                style={{
                  boxShadow: '0 0 0 4px rgba(201,163,74,0.15)',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <div className="border border-[#C9A34A]/40 p-6 rounded">
                  {/* Header */}
                  <div className="text-center pb-4 border-b border-dashed border-[#C9A34A]/60">
                    <div className="inline-block px-3 py-0.5 mb-1.5 rounded-full bg-[#C9A34A]/10 border border-[#C9A34A]/30 text-[10px] font-bold tracking-widest text-[#C9A34A] uppercase">
                      Patron Account Statement & Loyalty Ledger
                    </div>
                    <h2 className="font-serif font-black text-2xl tracking-wider text-[#111318]">
                      CHANDARKANT JEWELLERS
                    </h2>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Flagship Showroom • Choksi Bazar, Surat, Gujarat - 395003
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      GSTIN: 24AAACC1234M1Z8 • BIS Lic: HM/SUR/2026/01
                    </p>
                  </div>

                  {/* Customer Meta */}
                  <div className="grid grid-cols-2 gap-3 py-3 text-xs border-b border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Patron Name</span>
                      <span className="font-bold text-slate-900 text-sm">{activeCustomerStatement.name}</span>
                      <span className="text-[11px] text-slate-600 block font-mono">{activeCustomerStatement.phone}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Statement Date</span>
                      <span className="font-medium text-slate-900">{new Date().toLocaleDateString('en-IN')}</span>
                      <span className="text-[10px] text-slate-500 block font-mono">City: {activeCustomerStatement.city || 'Surat'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider">PAN / Statutory Tax ID</span>
                      <span className="font-mono font-bold text-slate-800">
                        {activeCustomerStatement.pan_number || 'NOT SUBMITTED'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Loyalty Membership</span>
                      <span className="font-bold text-[#C9A34A] uppercase">
                        {activeCustomerStatement.loyalty_tier || 'Standard'} Tier ({activeCustomerStatement.loyalty_points || 0} Pts)
                      </span>
                    </div>
                  </div>

                  {/* Balance Summary Card */}
                  <div className="my-4 p-4 rounded-lg bg-amber-50/60 border border-amber-200/70 text-center">
                    <span className="text-[11px] uppercase tracking-wider text-amber-900/70 font-semibold block">
                      Current Outstanding Balance
                    </span>
                    <div className="text-3xl font-serif font-bold text-[#111318] my-1">
                      ₹{Number(activeCustomerStatement.outstanding_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-white border border-amber-300 text-amber-900">
                      {Number(activeCustomerStatement.outstanding_balance) > 0 ? 'Payment Due' : 'Account in Good Standing'}
                    </span>
                  </div>

                  {/* Highlights */}
                  <div className="py-2.5 px-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Reward Points Redeemable:</span>
                      <span className="font-bold font-mono text-emerald-700">
                        {activeCustomerStatement.loyalty_points || 0} Points (≈ ₹{((activeCustomerStatement.loyalty_points || 0) * 0.25).toFixed(2)})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">KYC Status:</span>
                      <span className="font-semibold text-slate-900">
                        {activeCustomerStatement.pan_number ? 'Verified via CBDT PAN' : 'Pending PAN Update for Purchases > ₹2 Lakhs'}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-5 pt-3 border-t border-dashed border-slate-300 text-[9px] text-slate-500 leading-tight">
                    <p className="italic">
                      • Computer-generated patron statement. Valid for statutory bullion compliance.
                      <br />• Cheques / UPI receipts subject to realisation. All disputes subject to Surat jurisdiction.
                    </p>
                    <div className="mt-6 flex justify-between items-end">
                      <div className="text-center">
                        <div className="h-7 border-b border-slate-400 w-28"></div>
                        <span className="text-[9px] text-slate-600">Patron Signature</span>
                      </div>
                      <div className="text-center">
                        <div className="font-serif font-bold text-[10px] text-[#C9A34A] uppercase">
                          For Chandarkant Jewellers
                        </div>
                        <div className="h-6"></div>
                        <span className="text-[9px] text-slate-600">Authorized Accountant</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CustomerListView;
