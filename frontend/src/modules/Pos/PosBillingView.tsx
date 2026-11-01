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
    <div className="p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#380810]">
            Point of Sale & Billing Terminal
          </h2>
          <p className="text-xs text-gray-600">
            Rapid barcode tag scanning, old gold exchange offset, and GST compliant tax invoices
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cart, Scanner, Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Barcode & Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <form onSubmit={handleBarcodeLookup} className="flex-1 flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 text-amber-700 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Scan Tag Barcode or Enter SKU (e.g. CJ-G-NCK-1001)..."
                  value={scanCode}
                  onChange={(e) => setScanCode(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-amber-300 rounded-lg pl-9 pr-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-600"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#56111C] hover:bg-[#380810] text-amber-100 font-semibold text-xs rounded-lg shadow"
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
                className="w-full bg-[#FAF8F5] border border-amber-300 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-amber-600"
              >
                <option value="">+ Select In-Stock Item</option>
                {availableItems.map((itm) => (
                  <option key={itm.id} value={itm.id}>
                    {itm.name} ({itm.gross_weight}g)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cart Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-3 bg-[#FAF8F5] border-b border-gray-200 font-semibold text-xs text-gray-700 flex justify-between items-center">
              <span>Billed Jewellery Items ({selectedItems.length})</span>
              <span className="text-[11px] text-gray-500 font-normal">Weights in Grams (3 Decimals)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-gray-500 border-b border-gray-200">
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
                <tbody className="divide-y divide-gray-100">
                  {selectedItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400">
                        No items added yet. Scan a tag barcode or select an item above to begin billing.
                      </td>
                    </tr>
                  ) : (
                    selectedItems.map((item, idx) => {
                      const estItem = estimate?.items?.[idx];
                      return (
                        <tr key={item.id} className="hover:bg-amber-50/20">
                          <td className="py-3 px-3">
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <span className="font-mono text-[10px] text-gray-500">{item.sku}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-[#56111C]">{item.purity_karat}</span>
                            {item.huid && (
                              <p className="text-[10px] bg-amber-100 text-amber-800 font-mono px-1 rounded inline-block mt-0.5">
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
                          <td className="py-3 px-3 text-right font-serif font-bold text-gray-900">
                            ₹{Number(estItem?.item_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 p-1"
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
          <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableOldGold}
                  onChange={(e) => setEnableOldGold(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-serif font-bold text-xs text-[#380810] flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-600" /> Customer Old Gold Exchange / Purchase
                </span>
              </label>

              {oldGoldItems.length > 0 && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Total Offset: ₹{Number(estimate?.old_gold_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>

            {enableOldGold && (
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Purity</label>
                    <select
                      value={oldGoldForm.purity_karat}
                      onChange={(e) => setOldGoldForm({ ...oldGoldForm, purity_karat: e.target.value })}
                      aria-label="Old gold purity karat"
                      className="w-full bg-[#FAF8F5] border border-gray-300 rounded px-2 py-1.5 text-xs font-medium"
                    >
                      <option value="22K">22K (916)</option>
                      <option value="18K">18K (750)</option>
                      <option value="24K">24K (Fine)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Gross Wt (g)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="e.g. 15.500"
                      value={oldGoldForm.gross_weight}
                      onChange={(e) => setOldGoldForm({ ...oldGoldForm, gross_weight: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-gray-300 rounded px-2 py-1.5 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Stone Deduc (g)</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={oldGoldForm.stone_deduction}
                      onChange={(e) => setOldGoldForm({ ...oldGoldForm, stone_deduction: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-gray-300 rounded px-2 py-1.5 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Buy Rate (₹/g)</label>
                    <input
                      type="number"
                      value={oldGoldForm.rate_per_gram}
                      onChange={(e) => setOldGoldForm({ ...oldGoldForm, rate_per_gram: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-gray-300 rounded px-2 py-1.5 text-xs font-mono"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddOldGold}
                      className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded shadow"
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
                        className="flex items-center justify-between text-xs bg-amber-50/60 p-2 rounded border border-amber-200"
                      >
                        <span className="font-medium text-gray-700">
                          {og.purity_karat} Old Gold: Gross {og.gross_weight}g (Net:{' '}
                          {(Number(og.gross_weight) - Number(og.stone_deduction || 0)).toFixed(3)}g) @ ₹
                          {og.rate_per_gram}/g
                        </span>
                        <button
                          type="button"
                          onClick={() => setOldGoldItems(oldGoldItems.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700"
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
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-serif font-bold text-gray-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-600" /> Customer / Patron
              </span>
              <button
                type="button"
                onClick={() => setShowCustModal(true)}
                className="text-[11px] text-[#56111C] font-semibold hover:underline"
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
              className="w-full bg-[#FAF8F5] border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-600 font-medium"
            >
              <option value="">Walk-in Patron (Cash Counter)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) {c.loyalty_tier ? `[${c.loyalty_tier.toUpperCase()}]` : ''}
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <div className="mt-2.5 p-2 bg-amber-50/50 rounded border border-amber-200/60 text-[11px] space-y-0.5">
                <p className="font-semibold text-gray-800">{selectedCustomer.name}</p>
                <p className="text-gray-600">Phone: {selectedCustomer.phone}</p>
                {selectedCustomer.pan_number && (
                  <p className="text-gray-600 font-mono">PAN: {selectedCustomer.pan_number}</p>
                )}
                <p className="text-emerald-700 font-medium">
                  Loyalty Points: {selectedCustomer.loyalty_points}
                </p>
              </div>
            )}
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-xs text-gray-800 pb-2 border-b border-gray-100">
              Billing & Tax Calculation
            </h3>

            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-mono font-medium">
                  ₹{Number(estimate?.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {Number(estimate?.old_gold_total || 0) > 0 && (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span>Old Gold Exchange Offset:</span>
                  <span className="font-mono">
                    -₹{Number(estimate?.old_gold_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex justify-between pt-1 border-t border-gray-100 font-medium text-gray-800">
                <span>Taxable Base Value:</span>
                <span className="font-mono">
                  ₹{Number(estimate?.taxable_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-gray-500">
                <span>Central GST (1.50%):</span>
                <span className="font-mono">
                  ₹{Number(estimate?.gst?.cgst_amount || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-gray-500">
                <span>State GST (1.50%):</span>
                <span className="font-mono">
                  ₹{Number(estimate?.gst?.sgst_amount || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Round Off:</span>
                <span className="font-mono">
                  {estimate?.round_off || '0.00'}
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t-2 border-[#56111C] font-serif font-bold text-base text-[#380810]">
                <span>Grand Total:</span>
                <span className="font-mono">
                  ₹{Number(estimate?.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Payment Method Splitting */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <label className="text-xs font-semibold text-gray-700 block">
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
                    className="w-28 bg-[#FAF8F5] border border-gray-300 rounded px-2 py-1 text-xs"
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
                    className="flex-1 bg-[#FAF8F5] border border-gray-300 rounded px-2 py-1 text-xs font-mono"
                  />
                </div>
              ))}
            </div>

            {/* Finalize Button */}
            <button
              type="button"
              disabled={isSubmitting || selectedItems.length === 0}
              onClick={handleFinalizeBill}
              className="w-full py-3 rounded-lg gold-gradient text-[#380810] font-serif font-bold text-sm shadow hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              <CheckCircle2 className="w-5 h-5" />
              {isSubmitting ? 'Posting Financial Voucher...' : 'Complete Sale & Print Tax Invoice'}
            </button>
          </div>
        </div>
      </div>

      {/* Customer Quick Registration Modal */}
      {showCustModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-sm text-[#380810]">
                Register New Jewellery Patron
              </h3>
              <button onClick={() => setShowCustModal(false)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleRegisterCustomer} className="space-y-3 text-xs">
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
                <label className="block text-gray-600 mb-1">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile"
                  value={newCust.phone}
                  onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                  className="w-full border rounded px-3 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">PAN Card Number (Statutory for &gt;₹2 Lakh)</label>
                <input
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  value={newCust.pan_number}
                  onChange={(e) => setNewCust({ ...newCust, pan_number: e.target.value.toUpperCase() })}
                  className="w-full border rounded px-3 py-1.5 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">City</label>
                <input
                  type="text"
                  value={newCust.city}
                  onChange={(e) => setNewCust({ ...newCust, city: e.target.value })}
                  className="w-full border rounded px-3 py-1.5"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustModal(false)}
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

      {/* Tax Invoice Success / Print Modal */}
      {completedInvoice && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-serif font-bold text-base text-gray-800">
                  Sale Finalized & Voucher Balanced!
                </h3>
              </div>
              <button onClick={() => setCompletedInvoice(null)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Printable Invoice Sheet */}
            <div className="border border-gray-300 p-6 rounded-lg bg-[#FAF8F5] text-xs space-y-4 font-sans" id="printable-invoice">
              {/* Header */}
              <div className="text-center pb-3 border-b border-gray-300">
                <h2 className="font-serif font-bold text-xl text-[#380810] tracking-wide">
                  CHANDARKANT JEWELLERS PVT LTD
                </h2>
                <p className="text-[11px] text-gray-600">
                  Ghanshyam Nagar, Varachha Main Road, Surat, Gujarat - 395006
                </p>
                <p className="text-[11px] text-gray-600 font-mono">
                  GSTIN: 24AAACC1234M1Z8 | BIS Hallmark License: HM/SUR/2026/01
                </p>
                <div className="inline-block mt-2 font-bold px-3 py-0.5 bg-amber-200/80 text-[#380810] rounded text-[10px] tracking-widest uppercase">
                  TAX INVOICE (RULE 46 OF CGST RULES)
                </div>
              </div>

              {/* Meta details */}
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <div>
                  <p><strong>Invoice No:</strong> <span className="font-mono text-[#56111C] font-semibold">{completedInvoice.invoice_number}</span></p>
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
              <table className="w-full text-left border-collapse border border-gray-300 text-[11px]">
                <thead>
                  <tr className="bg-gray-200/70 text-gray-700">
                    <th className="border border-gray-300 p-1.5">Description & HUID</th>
                    <th className="border border-gray-300 p-1.5 text-right">Gross</th>
                    <th className="border border-gray-300 p-1.5 text-right">Net</th>
                    <th className="border border-gray-300 p-1.5 text-right">Rate/g</th>
                    <th className="border border-gray-300 p-1.5 text-right">Making</th>
                    <th className="border border-gray-300 p-1.5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {completedInvoice.items?.map((it: any) => (
                    <tr key={it.id}>
                      <td className="border border-gray-300 p-1.5">
                        {it.item_name}
                        {it.huid && <span className="text-[9px] font-mono block text-gray-500">HUID: {it.huid}</span>}
                      </td>
                      <td className="border border-gray-300 p-1.5 text-right font-mono">{Number(it.gross_weight).toFixed(3)}g</td>
                      <td className="border border-gray-300 p-1.5 text-right font-mono">{Number(it.net_weight).toFixed(3)}g</td>
                      <td className="border border-gray-300 p-1.5 text-right font-mono">₹{Number(it.metal_rate_applied).toFixed(0)}</td>
                      <td className="border border-gray-300 p-1.5 text-right font-mono">₹{Number(it.making_charges).toFixed(2)}</td>
                      <td className="border border-gray-300 p-1.5 text-right font-mono font-semibold">
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
                  <div className="flex justify-between border-t border-gray-300 pt-1 font-bold text-sm text-[#380810]">
                    <span>Grand Total:</span>
                    <span className="font-mono">₹{Number(completedInvoice.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Footer Declaration */}
              <div className="pt-4 border-t border-gray-300 flex justify-between items-end text-[10px] text-gray-500">
                <div>
                  <p>Certified that the particulars given above are true and correct.</p>
                  <p>All gold items hallmarked with 6-digit BIS HUID.</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-gray-400 mb-1"></div>
                  <p>Authorized Signatory</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#56111C] hover:bg-[#380810] text-amber-100 font-semibold text-xs rounded-lg shadow flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Tax Invoice (A4)
              </button>
              <button
                type="button"
                onClick={() => setCompletedInvoice(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-lg"
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
