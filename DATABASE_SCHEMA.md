# Chandarkant Jewellers Cloud — PostgreSQL Relational Schema Design

This document details the relational database design implemented in PostgreSQL 16+.
All monetary fields are stored in `NUMERIC(14,2)` and weights in `NUMERIC(10,3)` (or `NUMERIC(12,4)` for diamond carats).
All tenant-scoped tables enforce `tenant_id` foreign keys with `ON DELETE RESTRICT` for financial integrity.

---

## 1. Multi-Tenant Core & Subscription Tables

### `tenants`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` / `BIGINT` | Primary Key | Unique tenant identifier |
| `name` | `VARCHAR(255)` | NOT NULL | Registered business name (e.g., Chandarkant Jewellers) |
| `subdomain` | `VARCHAR(100)` | UNIQUE, NOT NULL | Unique subdomain slug |
| `pan_number` | `VARCHAR(20)` | NULLABLE | Company PAN |
| `gstin` | `VARCHAR(20)` | NULLABLE | 15-character Indian GSTIN |
| `status` | `VARCHAR(30)` | DEFAULT 'active' | active, suspended, expired, trial |
| `created_at`, `updated_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL | Timestamps |

### `branches`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | Primary Key | Branch ID |
| `tenant_id` | `BIGINT` | FK -> tenants.id | Tenant context |
| `name` | `VARCHAR(255)` | NOT NULL | Branch showroom name (e.g. Surat Main Branch) |
| `code` | `VARCHAR(50)` | NOT NULL | Branch code (e.g. CJ-SRT) |
| `address_line1`, `city`, `state`, `pincode` | `VARCHAR` | NOT NULL | Physical address |
| `state_code` | `VARCHAR(5)` | NOT NULL | GST State code (e.g. '24' for Gujarat) |
| `is_main_branch` | `BOOLEAN` | DEFAULT false | Primary flagship flag |
| `created_at`, `updated_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL | Timestamps |

### `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | Primary Key | User ID |
| `tenant_id` | `BIGINT` | FK -> tenants.id, NULLABLE | Null for Global Super Admin |
| `branch_id` | `BIGINT` | FK -> branches.id, NULLABLE | Default operational branch |
| `name` | `VARCHAR(255)` | NOT NULL | Full staff/owner name |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | Login email address |
| `phone` | `VARCHAR(20)` | NULLABLE | Mobile contact |
| `password` | `VARCHAR(255)` | NOT NULL | Bcrypt/Argon2 hashed password |
| `role` | `VARCHAR(50)` | NOT NULL | super_admin, owner, manager, accountant, sales, stock, karigar |
| `is_active` | `BOOLEAN` | DEFAULT true | Active status |
| `created_at`, `updated_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL | Timestamps |

---

## 2. Precious Metal Rates

### `metal_rates`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | Primary Key | Rate ID |
| `tenant_id` | `BIGINT` | FK -> tenants.id | Tenant context |
| `branch_id` | `BIGINT` | FK -> branches.id, NULLABLE | Branch specific override (if any) |
| `metal_type` | `VARCHAR(30)` | NOT NULL | gold, silver, platinum |
| `purity_karat` | `VARCHAR(20)` | NOT NULL | 24K, 22K, 20K, 18K, 14K, 999, 925 |
| `purity_percentage` | `NUMERIC(6,3)` | NOT NULL | 99.900, 91.667, 75.000, etc. |
| `rate_per_gram` | `NUMERIC(14,2)` | NOT NULL | Active retail selling rate in INR |
| `effective_date` | `DATE` | NOT NULL | Effective date |
| `created_at`, `updated_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL | Timestamps |

---

## 3. Jewellery Inventory & Hallmarking

### `inventory_items`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | Primary Key | Item ID |
| `tenant_id` | `BIGINT` | FK -> tenants.id | Tenant isolation |
| `branch_id` | `BIGINT` | FK -> branches.id | Current holding branch |
| `sku` | `VARCHAR(100)` | NOT NULL | Unique item code / Barcode string |
| `huid` | `VARCHAR(20)` | NULLABLE | 6-digit alphanumeric BIS Hallmark Unique ID |
| `category` | `VARCHAR(100)` | NOT NULL | Ring, Necklace, Bangle, Chain, Earring, Mangalsutra |
| `metal_type` | `VARCHAR(30)` | NOT NULL | gold, silver, platinum, diamond |
| `purity_karat` | `VARCHAR(20)` | NOT NULL | 22K (916), 18K (750), etc. |
| `gross_weight` | `NUMERIC(10,3)` | NOT NULL | Weight including all stones/wax (grams) |
| `stone_weight` | `NUMERIC(10,3)` | DEFAULT 0.000 | Total stone / deduction weight (grams) |
| `net_weight` | `NUMERIC(10,3)` | NOT NULL | Gross minus stone weight (pure metal grams) |
| `wastage_percent` | `NUMERIC(5,2)` | DEFAULT 0.00 | Standard wastage % (e.g. 2.50%) |
| `making_charge_type` | `VARCHAR(20)` | DEFAULT 'per_gram' | per_gram, fixed, percentage |
| `making_charge_rate` | `NUMERIC(14,2)` | DEFAULT 0.00 | Rate per gram or fixed amount |
| `purchase_cost` | `NUMERIC(14,2)` | NOT NULL | Procurement / manufacturing cost |
| `status` | `VARCHAR(30)` | DEFAULT 'in_stock' | in_stock, sold, out_on_memo, karigar_repair |
| `created_at`, `updated_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL | Timestamps |

---

## 4. Point of Sale & Invoicing

### `invoices`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | Primary Key | Invoice ID |
| `tenant_id` | `BIGINT` | FK -> tenants.id | Tenant context |
| `branch_id` | `BIGINT` | FK -> branches.id | Issuing branch |
| `invoice_number` | `VARCHAR(100)` | NOT NULL | Sequential GST Invoice number |
| `customer_id` | `BIGINT` | FK -> customers.id, NULLABLE | Registered customer or walk-in |
| `invoice_date` | `DATE` | NOT NULL | Billing date |
| `subtotal` | `NUMERIC(14,2)` | NOT NULL | Sum of item metal + making + stone charges |
| `old_gold_total` | `NUMERIC(14,2)` | DEFAULT 0.00 | Deducted old gold purchase / exchange |
| `taxable_amount` | `NUMERIC(14,2)` | NOT NULL | Net taxable base amount |
| `cgst_amount` | `NUMERIC(14,2)` | DEFAULT 0.00 | 1.5% Central GST |
| `sgst_amount` | `NUMERIC(14,2)` | DEFAULT 0.00 | 1.5% State GST |
| `igst_amount` | `NUMERIC(14,2)` | DEFAULT 0.00 | 3.0% Interstate GST |
| `round_off` | `NUMERIC(14,2)` | DEFAULT 0.00 | Round off adjustment |
| `grand_total` | `NUMERIC(14,2)` | NOT NULL | Final invoice total payable |
| `paid_amount` | `NUMERIC(14,2)` | DEFAULT 0.00 | Sum of cash, card, UPI, bank receipts |
| `due_amount` | `NUMERIC(14,2)` | DEFAULT 0.00 | Outstanding customer balance |
| `status` | `VARCHAR(30)` | DEFAULT 'paid' | paid, partial, pending, cancelled |
| `created_at`, `updated_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL | Timestamps |

### `invoice_items`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | Primary Key | Item Line ID |
| `invoice_id` | `BIGINT` | FK -> invoices.id | Parent invoice |
| `inventory_item_id`| `BIGINT` | FK -> inventory_items.id | Sold inventory item |
| `item_description` | `VARCHAR(255)` | NOT NULL | Item name & category snapshot |
| `huid` | `VARCHAR(20)` | NULLABLE | BIS HUID snapshot |
| `purity_karat` | `VARCHAR(20)` | NOT NULL | Purity snapshot |
| `gross_weight` | `NUMERIC(10,3)` | NOT NULL | Weight snapshot |
| `stone_weight` | `NUMERIC(10,3)` | NOT NULL | Stone weight snapshot |
| `net_weight` | `NUMERIC(10,3)` | NOT NULL | Net gold weight snapshot |
| `metal_rate_applied`| `NUMERIC(14,2)`| NOT NULL | Exact metal rate per gram applied |
| `metal_value` | `NUMERIC(14,2)` | NOT NULL | Net weight * metal rate |
| `making_charges` | `NUMERIC(14,2)` | NOT NULL | Total making charge applied |
| `stone_charges` | `NUMERIC(14,2)` | DEFAULT 0.00 | Total stone charge applied |
| `total_item_price`| `NUMERIC(14,2)` | NOT NULL | Total pre-tax line item price |

---

## 5. Double-Entry Accounting Engine

### `chart_of_accounts`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | Primary Key | Ledger Account ID |
| `tenant_id` | `BIGINT` | FK -> tenants.id | Tenant context |
| `account_code` | `VARCHAR(50)` | NOT NULL | Account code (e.g. 1001, 2001, 3001) |
| `account_name` | `VARCHAR(255)` | NOT NULL | Cash in Hand, HDFC Bank, Jewellery Sales, etc. |
| `account_type` | `VARCHAR(50)` | NOT NULL | asset, liability, equity, income, expense |
| `parent_id` | `BIGINT` | FK -> chart_of_accounts.id | Hierarchical parent group |
| `is_system` | `BOOLEAN` | DEFAULT false | System-protected ledger |

### `vouchers`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | Primary Key | Voucher ID |
| `tenant_id` | `BIGINT` | FK -> tenants.id | Tenant isolation |
| `branch_id` | `BIGINT` | FK -> branches.id | Originating branch |
| `voucher_type` | `VARCHAR(50)` | NOT NULL | sales, purchase, receipt, payment, journal, contra |
| `voucher_number` | `VARCHAR(100)` | NOT NULL | Unique voucher serial number |
| `voucher_date` | `DATE` | NOT NULL | Accounting date |
| `narration` | `TEXT` | NULLABLE | Transaction remarks |
| `reference_type` | `VARCHAR(50)` | NULLABLE | Invoice, PurchaseInvoice, GoldLoan, etc. |
| `reference_id` | `BIGINT` | NULLABLE | Foreign reference ID |
| `is_posted` | `BOOLEAN` | DEFAULT true | Posted to General Ledger flag |

### `voucher_entries`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | Primary Key | Entry ID |
| `voucher_id` | `BIGINT` | FK -> vouchers.id | Parent voucher |
| `account_id` | `BIGINT` | FK -> chart_of_accounts.id | Target ledger account |
| `debit` | `NUMERIC(14,2)` | DEFAULT 0.00 | Debit amount in INR |
| `credit` | `NUMERIC(14,2)` | DEFAULT 0.00 | Credit amount in INR |
| `entry_narration`| `VARCHAR(255)` | NULLABLE | Line specific narration |

---

## 6. Karigar Management & Material Tracking

### `karigars`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | Primary Key | Karigar ID |
| `tenant_id` | `BIGINT` | FK -> tenants.id | Tenant context |
| `name` | `VARCHAR(255)` | NOT NULL | Artisan / Goldsmith name |
| `phone` | `VARCHAR(20)` | NOT NULL | Mobile number |
| `specialization` | `VARCHAR(100)` | NULLABLE | Bengali artisan, Antique, Diamond setting, Polishing |
| `pure_gold_balance`| `NUMERIC(10,3)`| DEFAULT 0.000 | Current unreturned pure gold balance (grams) |

### `karigar_jobs`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | Primary Key | Job ID |
| `tenant_id` | `BIGINT` | FK -> tenants.id | Tenant context |
| `karigar_id` | `BIGINT` | FK -> karigars.id | Assigned Karigar |
| `job_number` | `VARCHAR(100)` | NOT NULL | Job card number |
| `item_description` | `VARCHAR(255)` | NOT NULL | Product being crafted / repaired |
| `gold_issued_gross`| `NUMERIC(10,3)`| NOT NULL | Issued raw gold / alloy (grams) |
| `gold_issued_purity`| `NUMERIC(6,3)`| NOT NULL | Purity percentage (e.g. 99.900) |
| `gold_issued_pure` | `NUMERIC(10,3)`| NOT NULL | Pure gold equivalent issued |
| `gold_returned_gross`| `NUMERIC(10,3)`| DEFAULT 0.000| Returned product gross weight |
| `gold_returned_pure`| `NUMERIC(10,3)`| DEFAULT 0.000| Returned product pure gold |
| `scrap_returned_pure`| `NUMERIC(10,3)`| DEFAULT 0.000| Returned scrap / filing pure gold |
| `allowed_wastage` | `NUMERIC(10,3)`| DEFAULT 0.000| Permissible wastage loss (grams) |
| `actual_wastage` | `NUMERIC(10,3)`| DEFAULT 0.000| Calculated actual metal loss |
| `labour_charges` | `NUMERIC(14,2)`| NOT NULL | Artisan making/labour fee |
| `status` | `VARCHAR(30)` | DEFAULT 'in_progress' | issued, in_progress, returned, completed |

---

## 7. Saving Schemes (Swarna Nidhi / Kitty)

### `saving_schemes`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | Primary Key | Scheme ID |
| `tenant_id` | `BIGINT` | FK -> tenants.id | Tenant context |
| `name` | `VARCHAR(255)` | NOT NULL | e.g. "11+1 Gold Savings Scheme" |
| `duration_months` | `INTEGER` | NOT NULL | e.g. 11 months customer + 1 month jewellery bonus |
| `monthly_installment`| `NUMERIC(14,2)`| NOT NULL | Monthly amount (e.g. ₹5,000.00) |
| `bonus_amount` | `NUMERIC(14,2)` | DEFAULT 0.00 | Jewellery company contribution |
| `is_active` | `BOOLEAN` | DEFAULT true | Scheme status |

### `saving_scheme_installments`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGSERIAL` | Primary Key | Installment ID |
| `enrollment_id` | `BIGINT` | FK -> enrollments.id | Customer enrollment reference |
| `installment_no` | `INTEGER` | NOT NULL | Installment number (1..12) |
| `amount_paid` | `NUMERIC(14,2)` | NOT NULL | Amount paid |
| `payment_date` | `DATE` | NOT NULL | Date received |
| `receipt_number` | `VARCHAR(100)` | NOT NULL | Official receipt serial |

---

## 8. Indexing & Relational Integrity Constraints
1. **Tenant Compound Constraints**:
   - `invoices`: `UNIQUE (tenant_id, invoice_number)`
   - `inventory_items`: `UNIQUE (tenant_id, sku)`
   - `vouchers`: `UNIQUE (tenant_id, voucher_number)`
   - `customers`: `UNIQUE (tenant_id, phone)`
2. **Performance Indexes**:
   - `CREATE INDEX idx_inventory_tenant_status ON inventory_items(tenant_id, status);`
   - `CREATE INDEX idx_invoices_tenant_date ON invoices(tenant_id, invoice_date);`
   - `CREATE INDEX idx_voucher_entries_account ON voucher_entries(account_id);`
   - `CREATE INDEX idx_metal_rates_lookup ON metal_rates(tenant_id, metal_type, purity_karat, effective_date);`
