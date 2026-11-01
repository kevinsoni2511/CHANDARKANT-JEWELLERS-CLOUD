export type UserRole =
  | 'super_admin'
  | 'owner'
  | 'manager'
  | 'accountant'
  | 'sales'
  | 'stock'
  | 'karigar';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  permissions?: string[];
  branch_id?: number;
  branch?: Branch;
}

export interface Branch {
  id: number;
  tenant_id: number;
  name: string;
  code: string;
  address?: string;
  city: string;
  state: string;
  state_code: string;
  phone?: string;
  is_main: boolean;
  is_active: boolean;
}

export interface Tenant {
  id: number;
  name: string;
  subdomain: string;
  business_type: string;
  pan?: string;
  gstin?: string;
  phone?: string;
  email?: string;
  city?: string;
  state: string;
  currency: string;
  status: string;
  subscription_plan: string;
  branches?: Branch[];
}

export interface MetalRate {
  id: number;
  metal_type: string;
  purity_karat: string;
  purity_percentage: string;
  rate_per_gram: string;
  effective_date: string;
}

export interface InventoryItem {
  id: number;
  tenant_id: number;
  branch_id: number;
  sku: string;
  barcode?: string;
  name: string;
  huid?: string;
  metal_type: string;
  purity_karat: string;
  gross_weight: string;
  stone_weight: string;
  net_weight: string;
  fine_gold_weight: string;
  wastage_percent: string;
  making_charge_type: 'per_gram' | 'fixed' | 'percentage';
  making_charge_rate: string;
  stone_charges: string;
  purchase_cost: string;
  status: 'in_stock' | 'sold' | 'out_on_memo' | 'in_repair' | 'transferred';
  image_url?: string;
  category?: {
    id: number;
    name: string;
    code: string;
  };
  branch?: Branch;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  pan_number?: string;
  gstin?: string;
  city: string;
  state: string;
  birthday?: string;
  anniversary?: string;
  loyalty_points: number;
  outstanding_balance: string;
  loyalty_tier: string;
}

export interface InvoiceItem {
  id: number;
  item_name: string;
  sku?: string;
  huid?: string;
  metal_type: string;
  purity_karat: string;
  gross_weight: string;
  stone_weight: string;
  net_weight: string;
  metal_rate_applied: string;
  metal_value: string;
  making_charges: string;
  stone_charges: string;
  item_total: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  subtotal: string;
  discount_amount: string;
  old_gold_amount: string;
  taxable_amount: string;
  cgst_amount: string;
  sgst_amount: string;
  igst_amount: string;
  round_off: string;
  grand_total: string;
  paid_amount: string;
  due_amount: string;
  status: 'paid' | 'partial' | 'pending' | 'cancelled';
  customer?: Customer;
  branch?: Branch;
  items?: InvoiceItem[];
  payments?: any[];
}
