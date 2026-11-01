import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, Plus, Award, Phone, MapPin, CreditCard, X } from 'lucide-react';
import { Customer } from '../../types';

export const CustomerListView: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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
  }, [search]);

  const fetchCustomers = async () => {
    try {
      const res = await api.get(`/customers?search=${encodeURIComponent(search)}`);
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

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#111318] dark:text-[#F6F5F1]">
            Customer CRM & Patron Ledgers
          </h2>
          <p className="text-xs text-[#5A5E6B] dark:text-[#A6AAB6] mt-0.5">
            KYC compliance, statutory PAN records, loyalty reward tiers, and purchase history
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl gold-gradient text-[#111318] font-bold text-xs shadow hover:brightness-105 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#111318]" /> + Register New Patron
        </button>
      </div>

      <div className="bg-[#FFFFFF] dark:bg-[#181A22] p-4 rounded-2xl border border-[#E3DFD7] dark:border-white/10 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8E929E] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by patron name, phone, PAN card, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#ECEAE4]/40 dark:bg-[#111318] border border-[#E3DFD7] dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-[#111318] dark:text-[#F6F5F1] placeholder-[#8E929E] focus:outline-none focus:border-[#C9A34A]"
          />
        </div>
      </div>

      <div className="bg-[#FFFFFF] dark:bg-[#181A22] rounded-2xl border border-[#E3DFD7] dark:border-white/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#ECEAE4]/50 dark:bg-[#111318]/60 text-[#5A5E6B] dark:text-[#A6AAB6] font-semibold border-b border-[#E3DFD7] dark:border-white/10">
              <tr>
                <th className="py-3 px-4">Patron Name</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">PAN / Tax ID</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Loyalty Tier</th>
                <th className="py-3 px-4 text-right">Points</th>
                <th className="py-3 px-4 text-right">Outstanding (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3DFD7]/60 dark:divide-white/5">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#8E929E]">
                    No customers found matching search criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#C9A34A]/5 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#111318] dark:text-[#F6F5F1]">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-[#5A5E6B] dark:text-[#A6AAB6]">{c.phone}</td>
                    <td className="py-3 px-4 font-mono uppercase text-[#5A5E6B] dark:text-[#A6AAB6]">
                      {c.pan_number || <span className="text-[#8E929E] italic">None</span>}
                    </td>
                    <td className="py-3 px-4 text-[#5A5E6B] dark:text-[#A6AAB6]">{c.city}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-[#C9A34A]/15 text-[#C9A34A] border border-[#C9A34A]/25">
                        {c.loyalty_tier || 'standard'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#35BFA0] font-bold">
                      {c.loyalty_points} pts
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#111318] dark:text-[#F6F5F1]">
                      ₹{Number(c.outstanding_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#181A22] border border-[#E3DFD7] dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E3DFD7] dark:border-white/10 pb-3">
              <h3 className="font-serif font-bold text-sm text-[#111318] dark:text-[#F6F5F1]">
                Register New Jewellery Customer
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#8E929E] hover:text-[#111318] dark:hover:text-[#F6F5F1]">
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
                  className="px-3 py-1.5 border border-[#E3DFD7] dark:border-white/10 rounded-xl text-[#5A5E6B] dark:text-[#A6AAB6] hover:bg-[#111318]/5 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 gold-gradient text-[#111318] font-bold rounded-xl shadow"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
