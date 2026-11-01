import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Barcode,
  Search,
  Trash2,
  Plus,
  Printer,
  CreditCard,
  Banknote,
  Coins,
  CheckCircle2,
  X,
  FileText,
  User,
} from 'lucide-react';
import { InventoryItem, Customer } from '../../types';

export const PosBillingView: React.FC = () => {
  const [scanCode, setScanCode] = useState('');
  const [availableItems, setAvailableItems] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Old Gold Exchange state
  const [enableOldGold, setEnableOldGold] = useState(false);
  const [oldGoldItems, setOldGoldItems] = useState<any[]>([]);
  const [oldGoldForm, setOldGoldForm] = useState({
    metal_type: 'gold',
    purity_karat: '22K',
    gross_weight: '',
    stone_deduction: '0',
    rate_per_gram: '7150',
  });

  // Payments state
  const [payments, setPayments] = useState<{ mode: string; amount: string; ref: string }[]>([
    { mode: 'upi', amount: '', ref: '' },
  ]);

  // Estimate state
  const [estimate, setEstimate] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<any>(null);

  // Quick Customer Form Modal
  const [showCustModal, setShowCustModal] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', phone: '', pan_number: '', city: 'Surat' });

  // Load in-stock items and customers
  useEffect(() => {
    fetchStock();
    fetchCustomers();
  }, []);

  const fetchStock = async () => {
    try {
      const res = await api.get('/inventory?status=in_stock&per_page=50');
      if (res.data.success) {
        setAvailableItems(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Barcode / SKU scan lookup
  const handleBarcodeLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanCode.trim()) return;

    try {
      const res = await api.get(`/inventory/lookup/${encodeURIComponent(scanCode.trim())}`);
      if (res.data.success) {
        addItemToCart(res.data.data);
        setScanCode('');
      }
    } catch (err) {
      alert(`Barcode or SKU '${scanCode}' not found in showroom stock.`);
    }
  };

  const addItemToCart = (item: InventoryItem) => {
    if (selectedItems.some((i) => i.id === item.id)) {
      alert('This item is already added to current bill.');
      return;
    }
    setSelectedItems([...selectedItems, { ...item, making_override: '' }]);
  };

  const removeItem = (id: number) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== id));
  };

  // Add old gold item
  const handleAddOldGold = () => {
    if (!oldGoldForm.gross_weight || Number(oldGoldForm.gross_weight) <= 0) {
      alert('Please enter valid old gold gross weight.');
      return;
    }
    setOldGoldItems([...oldGoldItems, { ...oldGoldForm }]);
    setOldGoldForm({
      metal_type: 'gold',
      purity_karat: '22K',
      gross_weight: '',
      stone_deduction: '0',
      rate_per_gram: '7150',
    });
  };

  // Re-calculate estimate whenever cart or old gold changes
  useEffect(() => {
    if (selectedItems.length === 0) {
      setEstimate(null);
      return;
    }

    const runEstimate = async () => {
      try {
        const payload = {
          items: selectedItems.map((i) => ({
            inventory_item_id: i.id,
            making_charge_rate_override: i.making_override ? Number(i.making_override) : undefined,
          })),
          old_gold_items: oldGoldItems.map((og) => ({
            metal_type: og.metal_type,
            purity_karat: og.purity_karat,
            gross_weight: Number(og.gross_weight),
            stone_deduction: Number(og.stone_deduction || 0),
            rate_per_gram: Number(og.rate_per_gram),
          })),
        };

        const res = await api.post('/pos/estimate', payload);
        if (res.data.success) {
          setEstimate(res.data.data);
          // Auto fill payment amount if empty
          if (payments.length === 1 && !payments[0].amount) {
            setPayments([{ mode: 'upi', amount: res.data.data.grand_total, ref: '' }]);
          }
        }
      } catch (err) {
        console.error('Estimate error:', err);
      }
    };

    runEstimate();
  }, [selectedItems, oldGoldItems]);

  // Finalize Invoice
  const handleFinalizeBill = async () => {
    if (selectedItems.length === 0) {
      alert('Cart is empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customer_id: selectedCustomer?.id || null,
        items: selectedItems.map((i) => ({ inventory_item_id: i.id })),
        old_gold_items: oldGoldItems.map((og) => ({
          metal_type: og.metal_type,
          purity_karat: og.purity_karat,
          gross_weight: Number(og.gross_weight),
          stone_deduction: Number(og.stone_deduction || 0),
          rate_per_gram: Number(og.rate_per_gram),
        })),
        payments: payments
          .filter((p) => Number(p.amount) > 0)
          .map((p) => ({
            payment_mode: p.mode,
            amount: Number(p.amount),
            reference_number: p.ref || undefined,
          })),
      };

      const res = await api.post('/pos/invoices', payload);
      if (res.data.success) {
        setCompletedInvoice(res.data.data);
        setSelectedItems([]);
        setOldGoldItems([]);
        setEstimate(null);
        fetchStock(); // Refresh stock
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to finalize bill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/customers', newCust);
      if (res.data.success) {
        setCustomers([...customers, res.data.data]);
        setSelectedCustomer(res.data.data);
        setShowCustModal(false);
        setNewCust({ name: '', phone: '', pan_number: '', city: 'Surat' });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error registering customer');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#111318] dark:text-[#F6F5F1]">
              Point of Sale & Billing Terminal
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A34A]/15 text-[#C9A34A] font-mono font-bold uppercase tracking-wider border border-[#C9A34A]/25">
              POS v2.4
            </span>
          </div>
          <p className="text-xs text-[#5A5E6B] dark:text-[#A6AAB6] mt-0.5">
            Rapid barcode tag scanning, old gold exchange offset, and GST compliant tax invoices
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cart, Scanner, Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Barcode & Search Bar */}
          <div className="bg-[#FFFFFF] dark:bg-[#181A22] p-4 rounded-2xl border border-[#E3DFD7] dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-center gap-3 transition-colors">
            <form onSubmit={handleBarcodeLookup} className="flex-1 flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 text-[#C9A34A] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Scan Tag Barcode or Enter SKU (e.g. CJ-G-NCK-1001)..."
                  value={scanCode}
                  onChange={(e) => setScanCode(e.target.value)}
                  className="w-full bg-[#ECEAE4]/40 dark:bg-[#111318] border border-[#E3DFD7] dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-[#111318] dark:text-[#F6F5F1] placeholder-[#8E929E] focus:outline-none focus:border-[#C9A34A] transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 gold-gradient text-[#111318] font-bold text-xs rounded-xl shadow hover:brightness-105 transition-all"
              >
                Scan / Add
              </button>
            </form>

            {/* Quick stock select dropdown */}
            <div className="w-full sm:w-56">
              <select
                onChange={(e) => {
                  const itm = availableItems.find((i) => i.id === Number(e.target.value));
                  if (itm) addItemToCart(itm);
                }}
                value=""
                aria-label="Select in-stock jewellery item"
                className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-amber-500"
              >
                <option value="">+ Select In-Stock Item</option>
                {availableItems.map((itm) => (
                  <option key={itm.id} value={itm.id} className="bg-white dark:bg-[#111118] text-zinc-900 dark:text-zinc-100">
                    {itm.name} ({itm.gross_weight}g)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cart Table */}
          <div className="bg-white dark:bg-[#111118] rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm overflow-hidden transition-colors">
            <div className="p-3.5 bg-zinc-50/70 dark:bg-black/30 border-b border-zinc-200 dark:border-white/10 font-semibold text-xs text-zinc-700 dark:text-zinc-300 flex justify-between items-center">
              <span>Billed Jewellery Items ({selectedItems.length})</span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal font-mono">
                Weights in Grams (3 Decimals)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/50 dark:bg-black/20 text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-white/5">
                  <tr>
                    <th className="py-2.5 px-3">SKU & Item Name</th>
                    <th className="py-2.5 px-3">Purity & HUID</th>
                    <th className="py-2.5 px-3 text-right">Gross Wt</th>
                    <th className="py-2.5 px-3 text-right">Net Wt</th>
                    <th className="py-2.5 px-3 text-right">Rate/g</th>
                    <th className="py-2.5 px-3 text-right">Making</th>
                    <th className="py-2.5 px-3 text-right">Line Total</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                  {selectedItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-400 dark:text-zinc-500">
                        No items added yet. Scan a tag barcode or select an item above to begin billing.
                      </td>
                    </tr>
                  ) : (
                    selectedItems.map((item, idx) => {
                      const estItem = estimate?.items?.[idx];
                      return (
                        <tr key={item.id} className="hover:bg-amber-500/5 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3 px-3">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</p>
                            <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">{item.sku}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-amber-700 dark:text-amber-400 font-mono">{item.purity_karat}</span>
                            {item.huid && (
                              <p className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono px-1.5 py-0.2 rounded border border-amber-500/20 inline-block mt-0.5">
                                {item.huid}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono">{Number(item.gross_weight).toFixed(3)}g</td>
                          <td className="py-3 px-3 text-right font-mono font-medium">{Number(item.net_weight).toFixed(3)}g</td>
                          <td className="py-3 px-3 text-right font-mono">
                            ₹{Number(estItem?.metal_rate_applied || 7287.50).toFixed(0)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono">
                            ₹{Number(estItem?.making_charges || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right font-serif font-bold text-zinc-900 dark:text-zinc-100">
                            ₹{Number(estItem?.item_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Old Gold Purchase / Exchange Accordion */}
          <div className="bg-white dark:bg-[#111118] rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm p-4 transition-colors">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableOldGold}
                  onChange={(e) => setEnableOldGold(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-serif font-bold text-xs text-[#111318] dark:text-[#F6F5F1] flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-[#C9A34A]" /> Customer Old Gold Exchange / Purchase
                </span>
              </label>

              {oldGoldItems.length > 0 && (
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-mono">
                  Offset: ₹{Number(estimate?.old_gold_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>

            {enableOldGold && (
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-white/5 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-500 dark:text-zinc-400 block mb-1">Purity</label>
                    <select
                      value={oldGoldForm.purity_karat}
                      onChange={(e) => setOldGoldForm({ ...oldGoldForm, purity_karat: e.target.value })}
                      aria-label="Old gold purity karat"
                      className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200"
                    >
                      <option value="22K">22K (916)</option>
                      <option value="18K">18K (750)</option>
                      <option value="24K">24K (Fine)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-500 dark:text-zinc-400 block mb-1">Gross Wt (g)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="e.g. 15.500"
                      value={oldGoldForm.gross_weight}
                      onChange={(e) => setOldGoldForm({ ...oldGoldForm, gross_weight: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-zinc-800 dark:text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-500 dark:text-zinc-400 block mb-1">Stone Deduc (g)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={oldGoldForm.stone_deduction}
                      onChange={(e) => setOldGoldForm({ ...oldGoldForm, stone_deduction: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-zinc-800 dark:text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-500 dark:text-zinc-400 block mb-1">Buy Rate (₹/g)</label>
                    <input
                      type="number"
                      value={oldGoldForm.rate_per_gram}
                      onChange={(e) => setOldGoldForm({ ...oldGoldForm, rate_per_gram: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-zinc-800 dark:text-zinc-200"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddOldGold}
                      className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg shadow"
                    >
                      + Add Old Gold
                    </button>
                  </div>
                </div>

                {/* Old gold list */}
                {oldGoldItems.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {oldGoldItems.map((og, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs bg-amber-500/5 p-2 rounded-xl border border-amber-500/20"
                      >
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {og.purity_karat} Old Gold: Gross {og.gross_weight}g (Net:{' '}
                          {(Number(og.gross_weight) - Number(og.stone_deduction || 0)).toFixed(3)}g) @ ₹
                          {og.rate_per_gram}/g
                        </span>
                        <button
                          type="button"
                          onClick={() => setOldGoldItems(oldGoldItems.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Customer Selection & Payment Summary */}
        <div className="space-y-4">
          {/* Customer Card */}
          <div className="bg-white dark:bg-[#111118] p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-serif font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Customer / Patron
              </span>
              <button
                type="button"
                onClick={() => setShowCustModal(true)}
                className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold hover:underline"
              >
                + Register New
              </button>
            </div>

            <select
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const c = customers.find((cust) => cust.id === Number(e.target.value));
                setSelectedCustomer(c || null);
              }}
              aria-label="Select patron or walk-in customer"
              className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="">Walk-in Patron (Cash Counter)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-[#111118]">
                  {c.name} ({c.phone}) {c.loyalty_tier ? `[${c.loyalty_tier.toUpperCase()}]` : ''}
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <div className="mt-2.5 p-2.5 bg-amber-500/5 rounded-xl border border-amber-500/20 text-[11px] space-y-0.5">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedCustomer.name}</p>
                <p className="text-zinc-500 dark:text-zinc-400">Phone: {selectedCustomer.phone}</p>
                {selectedCustomer.pan_number && (
                  <p className="text-zinc-500 dark:text-zinc-400 font-mono">PAN: {selectedCustomer.pan_number}</p>
                )}
                <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Loyalty Points: {selectedCustomer.loyalty_points}
                </p>
              </div>
            )}
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="bg-white dark:bg-[#111118] p-4 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm space-y-3 transition-colors">
            <h3 className="font-serif font-bold text-xs text-zinc-800 dark:text-zinc-200 pb-2 border-b border-zinc-100 dark:border-white/5">
              Billing & Tax Calculation
            </h3>

            <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                  ₹{Number(estimate?.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {Number(estimate?.old_gold_total || 0) > 0 && (
                <div className="flex justify-between text-amber-700 dark:text-amber-400 font-medium">
                  <span>Old Gold Exchange Offset:</span>
                  <span className="font-mono">
                    -₹{Number(estimate?.old_gold_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex justify-between pt-1 border-t border-zinc-100 dark:border-white/5 font-medium text-zinc-800 dark:text-zinc-200">
                <span>Taxable Base Value:</span>
                <span className="font-mono">
                  ₹{Number(estimate?.taxable_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>Central GST (1.50%):</span>
                <span className="font-mono">
                  ₹{Number(estimate?.gst?.cgst_amount || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>State GST (1.50%):</span>
                <span className="font-mono">
                  ₹{Number(estimate?.gst?.sgst_amount || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Round Off:</span>
                <span className="font-mono">
                  {estimate?.round_off || '0.00'}
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t-2 border-[#C9A34A]/40 font-serif font-bold text-base text-[#C9A34A]">
                <span>Grand Total:</span>
                <span className="font-mono">
                  ₹{Number(estimate?.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Payment Method Splitting */}
            <div className="pt-3 border-t border-[#E3DFD7] dark:border-white/5 space-y-2">
              <label className="text-xs font-semibold text-[#111318] dark:text-[#F6F5F1] block">
                Payment Collection Mode
              </label>

              {payments.map((p, idx) => (
                <div key={idx} className="flex gap-2">
                  <select
                    value={p.mode}
                    onChange={(e) => {
                      const updated = [...payments];
                      updated[idx].mode = e.target.value;
                      setPayments(updated);
                    }}
                    aria-label="Payment method"
                    className="w-28 bg-[#ECEAE4]/40 dark:bg-[#111318] border border-[#E3DFD7] dark:border-white/10 rounded-xl px-2 py-1.5 text-xs text-[#111318] dark:text-[#F6F5F1]"
                  >
                    <option value="upi">UPI / QR</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card POS</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Amount"
                    value={p.amount}
                    onChange={(e) => {
                      const updated = [...payments];
                      updated[idx].amount = e.target.value;
                      setPayments(updated);
                    }}
                    className="flex-1 bg-[#ECEAE4]/40 dark:bg-[#111318] border border-[#E3DFD7] dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-[#111318] dark:text-[#F6F5F1]"
                  />
                </div>
              ))}
            </div>

            {/* Finalize Button */}
            <button
              type="button"
              disabled={isSubmitting || selectedItems.length === 0}
              onClick={handleFinalizeBill}
              className="w-full py-3 rounded-xl gold-gradient text-[#111318] font-serif font-bold text-sm shadow-md hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              <CheckCircle2 className="w-5 h-5 text-[#111318]" />
              {isSubmitting ? 'Posting Financial Voucher...' : 'Complete Sale & Print Tax Invoice'}
            </button>
          </div>
        </div>
      </div>

      {/* Customer Quick Registration Modal */}
      {showCustModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#111118] border border-zinc-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-3">
              <h3 className="font-serif font-bold text-sm text-[#111318] dark:text-[#F6F5F1]">
                Register New Jewellery Patron
              </h3>
              <button
                onClick={() => setShowCustModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 mb-1">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile"
                  value={newCust.phone}
                  onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 mb-1">PAN Card Number (Statutory for &gt;₹2 Lakh)</label>
                <input
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  value={newCust.pan_number}
                  onChange={(e) => setNewCust({ ...newCust, pan_number: e.target.value.toUpperCase() })}
                  className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 font-mono uppercase text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 mb-1">City</label>
                <input
                  type="text"
                  value={newCust.city}
                  onChange={(e) => setNewCust({ ...newCust, city: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustModal(false)}
                  className="px-3 py-2 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-600 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 gold-gradient text-[#111318] font-bold rounded-xl shadow"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tax Invoice Success / Print Modal */}
      {completedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#FFFFFF] dark:bg-[#181A22] border border-[#E3DFD7] dark:border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E3DFD7] dark:border-white/10 pb-3">
              <div className="flex items-center gap-2 text-[#35BFA0]">
                <CheckCircle2 className="w-5 h-5 text-[#35BFA0]" />
                <h3 className="font-serif font-bold text-base text-[#111318] dark:text-[#F6F5F1]">
                  Sale Finalized & Ledger Balanced!
                </h3>
              </div>
              <button
                onClick={() => setCompletedInvoice(null)}
                className="p-1 text-[#8E929E] hover:text-[#111318] dark:hover:text-[#F6F5F1]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Invoice Sheet */}
            <div className="border border-[#E3DFD7] dark:border-white/10 p-6 rounded-xl bg-[#F6F5F1] dark:bg-[#111318] text-xs space-y-4 font-sans text-[#111318] dark:text-[#F6F5F1]" id="printable-invoice">
              {/* Header */}
              <div className="text-center pb-3 border-b border-[#E3DFD7] dark:border-white/10">
                <h2 className="font-serif font-bold text-xl text-[#C9A34A] tracking-wide">
                  CHANDARKANT JEWELLERS PVT LTD
                </h2>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Ghanshyam Nagar, Varachha Main Road, Surat, Gujarat - 395006
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  GSTIN: 24AAACC1234M1Z8 | BIS Hallmark License: HM/SUR/2026/01
                </p>
                <div className="inline-block mt-2 font-bold px-3 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25 rounded text-[10px] tracking-widest uppercase">
                  TAX INVOICE (RULE 46 OF CGST RULES)
                </div>
              </div>

              {/* Meta details */}
              <div className="grid grid-cols-2 gap-4 text-zinc-700 dark:text-zinc-300">
                <div>
                  <p><strong>Invoice No:</strong> <span className="font-mono text-[#C9A34A] font-semibold">{completedInvoice.invoice_number}</span></p>
                  <p><strong>Date:</strong> {completedInvoice.invoice_date}</p>
                  <p><strong>Place of Supply:</strong> Gujarat (24)</p>
                </div>
                <div>
                  <p><strong>Billed To:</strong> {completedInvoice.customer?.name || 'Walk-in Patron'}</p>
                  {completedInvoice.customer?.phone && <p><strong>Mobile:</strong> {completedInvoice.customer.phone}</p>}
                  {completedInvoice.customer?.pan_number && <p><strong>PAN:</strong> {completedInvoice.customer.pan_number}</p>}
                </div>
              </div>

              {/* Line Items */}
              <table className="w-full text-left border-collapse border border-zinc-200 dark:border-white/10 text-[11px]">
                <thead>
                  <tr className="bg-zinc-200/70 dark:bg-white/10 text-zinc-800 dark:text-zinc-200">
                    <th className="border border-zinc-200 dark:border-white/10 p-1.5">Description & HUID</th>
                    <th className="border border-zinc-200 dark:border-white/10 p-1.5 text-right">Gross</th>
                    <th className="border border-zinc-200 dark:border-white/10 p-1.5 text-right">Net</th>
                    <th className="border border-zinc-200 dark:border-white/10 p-1.5 text-right">Rate/g</th>
                    <th className="border border-zinc-200 dark:border-white/10 p-1.5 text-right">Making</th>
                    <th className="border border-zinc-200 dark:border-white/10 p-1.5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {completedInvoice.items?.map((it: any) => (
                    <tr key={it.id}>
                      <td className="border border-zinc-200 dark:border-white/10 p-1.5">
                        {it.item_name}
                        {it.huid && <span className="text-[9px] font-mono block text-amber-600 dark:text-amber-400">HUID: {it.huid}</span>}
                      </td>
                      <td className="border border-zinc-200 dark:border-white/10 p-1.5 text-right font-mono">{Number(it.gross_weight).toFixed(3)}g</td>
                      <td className="border border-zinc-200 dark:border-white/10 p-1.5 text-right font-mono">{Number(it.net_weight).toFixed(3)}g</td>
                      <td className="border border-zinc-200 dark:border-white/10 p-1.5 text-right font-mono">₹{Number(it.metal_rate_applied).toFixed(0)}</td>
                      <td className="border border-zinc-200 dark:border-white/10 p-1.5 text-right font-mono">₹{Number(it.making_charges).toFixed(2)}</td>
                      <td className="border border-zinc-200 dark:border-white/10 p-1.5 text-right font-mono font-semibold">
                        ₹{Number(it.item_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Taxable Base:</span>
                    <span className="font-mono">₹{Number(completedInvoice.taxable_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST (1.50%):</span>
                    <span className="font-mono">₹{Number(completedInvoice.cgst_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (1.50%):</span>
                    <span className="font-mono">₹{Number(completedInvoice.sgst_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#E3DFD7] dark:border-white/10 pt-1 font-bold text-sm text-[#C9A34A]">
                    <span>Grand Total:</span>
                    <span className="font-mono">₹{Number(completedInvoice.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Footer Declaration */}
              <div className="pt-4 border-t border-[#E3DFD7] dark:border-white/10 flex justify-between items-end text-[10px] text-[#8E929E]">
                <div>
                  <p>Certified that the particulars given above are true and correct.</p>
                  <p>All gold items hallmarked with 6-digit BIS HUID.</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-zinc-400 mb-1"></div>
                  <p>Authorized Signatory</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <a
                href={`http://127.0.0.1:8000/api/v1/pos/invoices/${completedInvoice.id}/print?format=a4`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 gold-gradient text-[#111318] font-bold text-xs rounded-xl shadow flex items-center gap-2 hover:brightness-105"
              >
                <Printer className="w-4 h-4 text-[#111318]" /> Print A4 Tax Invoice
              </a>
              <a
                href={`http://127.0.0.1:8000/api/v1/pos/invoices/${completedInvoice.id}/print?format=thermal`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 border border-zinc-300 dark:border-white/20 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 font-semibold text-xs rounded-xl flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print 80mm Thermal Slip
              </a>
              <button
                type="button"
                onClick={() => setCompletedInvoice(null)}
                className="px-4 py-2 bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/15 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
