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
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#380810]">
            Customer CRM & Patron Ledgers
          </h2>
          <p className="text-xs text-gray-600">
            KYC compliance, statutory PAN records, loyalty reward tiers, and purchase history
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg gold-gradient text-[#380810] font-semibold text-xs shadow hover:brightness-105 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> + Register New Patron
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by patron name, phone, PAN card, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:border-amber-600"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-gray-600 font-semibold border-b border-gray-200">
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
            <tbody className="divide-y divide-gray-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No customers found matching search criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-amber-50/20">
                    <td className="py-3 px-4 font-semibold text-gray-900">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-gray-700">{c.phone}</td>
                    <td className="py-3 px-4 font-mono uppercase text-gray-600">
                      {c.pan_number || <span className="text-gray-400 italic">None</span>}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{c.city}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {c.loyalty_tier || 'standard'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700 font-bold">
                      {c.loyalty_points} pts
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-sm text-[#380810]">
                Register New Jewellery Customer
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  className="w-full border rounded px-3 py-1.5 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={newCust.phone}
                  onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                  className="w-full border rounded px-3 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">PAN Card Number</label>
                <input
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  value={newCust.pan_number}
                  onChange={(e) => setNewCust({ ...newCust, pan_number: e.target.value.toUpperCase() })}
                  className="w-full border rounded px-3 py-1.5 font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 mb-1">City</label>
                  <input
                    type="text"
                    value={newCust.city}
                    onChange={(e) => setNewCust({ ...newCust, city: e.target.value })}
                    className="w-full border rounded px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={newCust.email}
                    onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                    className="w-full border rounded px-3 py-1.5"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 border rounded text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#56111C] text-amber-100 font-semibold rounded shadow"
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
