import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Boxes,
  Plus,
  Tag,
  ShieldCheck,
  X,
  Sparkles,
  Download,
  Filter,
} from 'lucide-react';
import { InventoryItem } from '../../types';
import { DataTable, Column } from '../../components/DataTable';

export const InventoryView: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
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
  }, [statusFilter, metalFilter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      let url = '/inventory?search=';
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

  const columns: Column<InventoryItem>[] = [
    {
      key: 'sku',
      header: 'Tag / SKU',
      sortable: true,
      accessor: (item) => (
        <span className="font-mono font-semibold text-[#56111C] dark:text-amber-400">
          {item.sku}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Item Description',
      sortable: true,
      accessor: (item) => (
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</p>
          <span className="text-[10px] uppercase font-mono text-zinc-500 dark:text-zinc-400">
            {item.metal_type} • {item.category?.name || 'Jewellery'}
          </span>
        </div>
      ),
    },
    {
      key: 'huid',
      header: 'BIS HUID',
      sortable: true,
      accessor: (item) =>
        item.huid ? (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/25">
            <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            {item.huid}
          </span>
        ) : (
          <span className="text-zinc-400 text-[10px] font-mono">Non-hallmark</span>
        ),
    },
    {
      key: 'purity_karat',
      header: 'Purity',
      sortable: true,
      accessor: (item) => (
        <span className="font-semibold text-amber-800 dark:text-amber-400 font-mono">
          {item.purity_karat}
        </span>
      ),
    },
    {
      key: 'gross_weight',
      header: 'Gross Wt',
      sortable: true,
      align: 'right',
      accessor: (item) => (
        <span className="font-mono">{Number(item.gross_weight).toFixed(3)}g</span>
      ),
    },
    {
      key: 'stone_weight',
      header: 'Stone Wt',
      sortable: true,
      align: 'right',
      accessor: (item) => (
        <span className="font-mono text-zinc-500 dark:text-zinc-400">
          {Number(item.stone_weight).toFixed(3)}g
        </span>
      ),
    },
    {
      key: 'net_weight',
      header: 'Net Metal Wt',
      sortable: true,
      align: 'right',
      accessor: (item) => (
        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
          {Number(item.net_weight).toFixed(3)}g
        </span>
      ),
    },
    {
      key: 'making_charge_rate',
      header: 'Making Charge',
      align: 'right',
      accessor: (item) => (
        <span className="font-mono text-[11px]">
          ₹{Number(item.making_charge_rate).toFixed(2)}/g
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'center',
      accessor: (item) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            item.status === 'in_stock'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'
          }`}
        >
          {item.status.replace('_', ' ')}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#200408] dark:text-[#E5C358]">
              Jewellery Vault & Inventory
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono font-bold uppercase tracking-wider">
              {items.length} items
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            Real-time bullion stock with 6-digit BIS Hallmark Unique Identifiers (HUID) & milligram precision
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl gold-gradient text-[#200408] font-bold text-xs shadow-md hover:brightness-105 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Tag New Jewellery
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-[#111118] p-2.5 rounded-xl border border-zinc-200 dark:border-white/10 text-xs">
        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1 pl-1 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filters:
        </span>

        {/* Status Filters */}
        <div className="flex items-center gap-1 border-r border-zinc-200 dark:border-white/10 pr-2">
          {[
            { id: '', label: 'All Statuses' },
            { id: 'in_stock', label: 'In Stock' },
            { id: 'sold', label: 'Sold' },
            { id: 'in_repair', label: 'Repair' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                statusFilter === st.id
                  ? 'bg-amber-600 text-white dark:bg-amber-500/20 dark:text-amber-300 dark:border dark:border-amber-500/30 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Metal Filters */}
        <div className="flex items-center gap-1 pl-1">
          {[
            { id: '', label: 'All Metals' },
            { id: 'gold', label: 'Gold' },
            { id: 'silver', label: 'Silver' },
            { id: 'diamond', label: 'Diamond' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMetalFilter(m.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                metalFilter === m.id
                  ? 'bg-[#200408] text-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border dark:border-amber-500/30 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Modern Data Table */}
      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        title="Showroom Inventory Stream"
        subtitle="Sortable, filterable ledger with instant CSV export and column visibility"
        searchPlaceholder="Search by SKU, Tag, HUID, or Item Title..."
        exportFileName="cjc-inventory-catalog"
        emptyMessage="No jewellery items matched your query."
        emptyAction={{
          label: '+ Tag New Piece',
          onClick: () => setShowModal(true),
        }}
      />

      {/* Tag New Piece Modal (Gen Z Luxury Dark/Light) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#111118] border border-zinc-200 dark:border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-3">
              <h3 className="font-serif font-bold text-sm text-[#200408] dark:text-[#E5C358] flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Tag New Jewellery Item
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">
                  Item Title / Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 22K Royal Calcutta Antique Necklace"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">
                    Precious Metal
                  </label>
                  <select
                    value={form.metal_type}
                    onChange={(e) => setForm({ ...form, metal_type: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="diamond">Diamond</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">
                    Purity Karat
                  </label>
                  <select
                    value={form.purity_karat}
                    onChange={(e) => setForm({ ...form, purity_karat: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="24K">24K (99.9%)</option>
                    <option value="22K">22K (91.6% - Standard)</option>
                    <option value="18K">18K (75.0%)</option>
                    <option value="14K">14K (58.5%)</option>
                    <option value="999">999 Silver</option>
                    <option value="925">925 Sterling Silver</option>
                  </select>
                </div>
              </div>

              {/* Weight Grid */}
              <div className="p-3 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-white/10 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
                  Precision Weights (Grams)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-zinc-600 dark:text-zinc-400">Gross Wt *</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      placeholder="0.000"
                      value={form.gross_weight}
                      onChange={(e) => setForm({ ...form, gross_weight: e.target.value })}
                      className="w-full bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-2 py-1.5 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-600 dark:text-zinc-400">Stone Wt</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={form.stone_weight}
                      onChange={(e) => setForm({ ...form, stone_weight: e.target.value })}
                      className="w-full bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-2 py-1.5 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-600 dark:text-zinc-400">Net Metal</label>
                    <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-lg px-2 py-1.5 font-mono font-bold text-amber-700 dark:text-amber-300">
                      {netWeightCalc}g
                    </div>
                  </div>
                </div>
              </div>

              {/* BIS HUID & Charges */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">
                    BIS Hallmark HUID (6-Alphanumeric)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. AB12CD"
                    value={form.huid}
                    onChange={(e) => setForm({ ...form, huid: e.target.value.toUpperCase() })}
                    className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 font-mono uppercase text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 mb-1 font-medium">
                    Making Charge (₹/gram)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="650.00"
                    value={form.making_charge_rate}
                    onChange={(e) => setForm({ ...form, making_charge_rate: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gold-gradient text-[#200408] font-bold shadow-md hover:brightness-105"
                >
                  Confirm & Print Barcode Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
