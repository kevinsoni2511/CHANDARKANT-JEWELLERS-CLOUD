import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Boxes,
  Plus,
  Search,
  Tag,
  ShieldCheck,
  Filter,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { InventoryItem } from '../../types';

export const InventoryView: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [metalFilter, setMetalFilter] = useState('');

  // New Item Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    metal_type: 'gold',
    purity_karat: '22K',
    gross_weight: '',
    stone_weight: '0',
    huid: '',
    wastage_percent: '2.50',
    making_charge_type: 'per_gram',
    making_charge_rate: '650.00',
    purchase_cost: '',
  });

  useEffect(() => {
    fetchItems();
  }, [search, statusFilter, metalFilter]);

  const fetchItems = async () => {
    try {
      let url = `/inventory?search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (metalFilter) url += `&metal_type=${metalFilter}`;

      const res = await api.get(url);
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory', {
        ...form,
        category_id: form.category_id ? Number(form.category_id) : undefined,
        gross_weight: Number(form.gross_weight),
        stone_weight: Number(form.stone_weight || 0),
        wastage_percent: Number(form.wastage_percent || 0),
        making_charge_rate: Number(form.making_charge_rate || 0),
        purchase_cost: Number(form.purchase_cost || 0),
      });

      if (res.data.success) {
        setShowModal(false);
        fetchItems();
        setForm({
          name: '',
          category_id: '',
          metal_type: 'gold',
          purity_karat: '22K',
          gross_weight: '',
          stone_weight: '0',
          huid: '',
          wastage_percent: '2.50',
          making_charge_type: 'per_gram',
          making_charge_rate: '650.00',
          purchase_cost: '',
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to tag item.');
    }
  };

  const netWeightCalc = Math.max(
    0,
    Number(form.gross_weight || 0) - Number(form.stone_weight || 0)
  ).toFixed(3);

  return (
    <div className="p-6 space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#380810]">
            Jewellery Stock & Tagging Inventory
          </h2>
          <p className="text-xs text-gray-600">
            Traceable tag-level stock management with BIS Hallmark Unique IDs (HUID) and precision weights
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg gold-gradient text-[#380810] font-semibold text-xs shadow hover:brightness-105 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> + Tag New Piece
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by SKU, Tag, HUID, or Item Description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter stock by status"
            className="bg-[#FAF8F5] border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-600"
          >
            <option value="">All Statuses</option>
            <option value="in_stock">In Stock Only</option>
            <option value="sold">Sold</option>
            <option value="in_repair">In Karigar Repair</option>
          </select>

          <select
            value={metalFilter}
            onChange={(e) => setMetalFilter(e.target.value)}
            aria-label="Filter stock by metal type"
            className="bg-[#FAF8F5] border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-600"
          >
            <option value="">All Metals</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="diamond">Diamond</option>
            <option value="platinum">Platinum</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Tag / SKU</th>
                <th className="py-3 px-4">Item Name & Category</th>
                <th className="py-3 px-4">BIS HUID</th>
                <th className="py-3 px-4">Purity</th>
                <th className="py-3 px-4 text-right">Gross Wt</th>
                <th className="py-3 px-4 text-right">Stone Wt</th>
                <th className="py-3 px-4 text-right">Net Wt</th>
                <th className="py-3 px-4 text-right">Making Charge</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    No jewellery items matched your query.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-[#56111C]">
                      {item.sku}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <span className="text-[10px] text-gray-500 uppercase">{item.metal_type}</span>
                    </td>
                    <td className="py-3 px-4">
                      {item.huid ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                          <ShieldCheck className="w-3 h-3 text-amber-600" />
                          {item.huid}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px]">Non-hallmark</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-amber-900">{item.purity_karat}</td>
                    <td className="py-3 px-4 text-right font-mono">{Number(item.gross_weight).toFixed(3)}g</td>
                    <td className="py-3 px-4 text-right font-mono text-gray-500">{Number(item.stone_weight).toFixed(3)}g</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">{Number(item.net_weight).toFixed(3)}g</td>
                    <td className="py-3 px-4 text-right font-mono">
                      ₹{Number(item.making_charge_rate).toFixed(2)} ({item.making_charge_type})
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'in_stock'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tag New Piece Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-sm text-[#380810] flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-600" /> Tag New Jewellery Item
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 mb-1">Item Title / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 22K Royal Calcutta Antique Necklace"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1">Metal Type *</label>
                  <select
                    value={form.metal_type}
                    onChange={(e) => setForm({ ...form, metal_type: e.target.value })}
                    className="w-full border rounded px-3 py-2 font-medium"
                  >
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="diamond">Diamond</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 mb-1">Purity Karat *</label>
                  <select
                    value={form.purity_karat}
                    onChange={(e) => setForm({ ...form, purity_karat: e.target.value })}
                    className="w-full border rounded px-3 py-2 font-medium"
                  >
                    <option value="22K">22K (916 Hallmark)</option>
                    <option value="18K">18K (750 Hallmark)</option>
                    <option value="20K">20K (833)</option>
                    <option value="24K">24K (Pure Bullion)</option>
                    <option value="14K">14K (585)</option>
                    <option value="999">Silver 999</option>
                    <option value="925">Silver 925</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1">Gross Wt (g) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={form.gross_weight}
                    onChange={(e) => setForm({ ...form, gross_weight: e.target.value })}
                    className="w-full border rounded px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-1">Stone Wt (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={form.stone_weight}
                    onChange={(e) => setForm({ ...form, stone_weight: e.target.value })}
                    className="w-full border rounded px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-1">Net Metal Wt (Auto)</label>
                  <div className="w-full bg-amber-50 border border-amber-300 rounded px-3 py-2 font-mono font-bold text-[#380810]">
                    {netWeightCalc}g
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1">BIS HUID (6 Characters)</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="e.g. HUID-8K2M9Q"
                    value={form.huid}
                    onChange={(e) => setForm({ ...form, huid: e.target.value.toUpperCase() })}
                    className="w-full border rounded px-3 py-2 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-1">Wastage %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.wastage_percent}
                    onChange={(e) => setForm({ ...form, wastage_percent: e.target.value })}
                    className="w-full border rounded px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1">Making Charge Type</label>
                  <select
                    value={form.making_charge_type}
                    onChange={(e) => setForm({ ...form, making_charge_type: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="per_gram">Per Gram (on Gross Wt)</option>
                    <option value="fixed">Fixed Lump Sum (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 mb-1">Making Charge Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.making_charge_rate}
                    onChange={(e) => setForm({ ...form, making_charge_rate: e.target.value })}
                    className="w-full border rounded px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 border rounded text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#56111C] hover:bg-[#380810] text-amber-100 font-semibold rounded shadow"
                >
                  Generate Barcode & Tag Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
