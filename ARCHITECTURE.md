# Chandarkant Jewellers Cloud — System Architecture

## 1. Architectural Philosophy

Chandarkant Jewellers Cloud (CJC) is engineered around three non-negotiable principles:
1. **Single Source of Truth**: Laravel is the sole authority for all financial, inventory, tax, and domain calculations. The frontend is strictly a presentation and interaction layer.
2. **Absolute Multi-Tenant Isolation**: Every enterprise entity (tenants, branches, inventory, vouchers, ledgers) is partitioned by `tenant_id` at both the application (Global Scopes & Policies) and database (indexes & foreign keys) tiers.
3. **Double-Entry Financial Reconcilability**: No transaction modifies posted financial ledgers silently. Every monetary or stock movement triggers balanced debit/credit voucher entries with immutable audit snapshots.

---

## 2. High-Level Architecture Diagram

```
 +-----------------------------------------------------------------------+
 |                          CLIENT TIERS                                 |
 |  +-----------------------+ +--------------------+ +----------------+ |
 |  | Desktop POS & Billing | | Management Portal  | | Mobile Staff   | |
 |  | (React / TypeScript)  | | (Owner/Admin View) | | (Responsive)   | |
 |  +-----------+-----------+ +---------+----------+ +--------+-------+ |
 +--------------|-----------------------|---------------------|---------+
                |                       |                     |
                +-----------------------+---------------------+
                                        | HTTPS / REST JSON
                                        v
 +-----------------------------------------------------------------------+
 |                     API GATEWAY & SECURITY LAYER                      |
 |  - Cloudflare / SSL Termination & DDoS Mitigation                      |
 |  - CORS Policy (Strict Whitelist: Netlify production + local dev)     |
 |  - Rate Limiting (Throttle Middleware)                                |
 |  - Laravel Sanctum Bearer Token Authenticator                         |
 |  - TenantContextResolver Middleware (Header/Subdomain/Token Claims)   |
 +--------------------------------------+--------------------------------+
                                        |
                                        v
 +-----------------------------------------------------------------------+
 |                       LARAVEL 11/12 BACKEND CORE                      |
 |                                                                       |
 |  +------------------------ DOMAIN SERVICES ------------------------+  |
 |  | 1. Tenant & Branch Context      14. Karigar Job Ledger          |  |
 |  | 2. Metal Rate Board & Historical 15. Gold Loan Collateral       |  |
 |  | 3. Tag-Level Inventory & HUID   16. Saving Schemes (Kitty)      |  |
 |  | 4. POS Billing & Invoicing      17. Double-Entry Accounting     |  |
 |  | 5. Old Gold Melting & Exchange  18. Indian GST Engine           |  |
 |  | 6. Purchase & Supplier Ledger   19. Analytics & Daily Day-Book  |  |
 |  | 7. Customer CRM & Loyalty       20. Workflow Automation Engine  |  |
 |  | 8. Repair & Job Tracking        21. Multi-Provider AI Copilot   |  |
 |  +-----------------------------------------------------------------+  |
 |                                                                       |
 |  +--------------------- INFRASTRUCTURE SERVICES -------------------+  |
 |  | - DecimalMathService (BCMath wrapper for 3-4 decimal precision) |  |
 |  | - PdfGeneratorService (A4 / 3-inch Thermal Invoice Generator)   |  |
 |  | - OmnichannelNotificationService (WhatsApp Cloud, SMS DLT, Mail) |
 |  | - AuditLoggingService (Immutable action & security logs)        |  |
 |  +-----------------------------------------------------------------+  |
 +--------------------------------------+--------------------------------+
                                        |
                 +----------------------+----------------------+
                 |                                             |
                 v                                             v
 +-------------------------------+             +-------------------------------+
 |      PostgreSQL 18+ DB        |             |      Background & Storage     |
 |  - Multi-Tenant Tables        |             |  - Redis Cache / DB Queues    |
 |  - Decimal (14,4) Precisions  |             |  - S3 / Local Document Store  |
 |  - Foreign Key Constraints    |             |  - Scheduled Task Runner      |
 |  - ACID Transactions          |             |  - WhatsApp / SMS Workers     |
 +-------------------------------+             +-------------------------------+
```

---

## 3. Multi-Tenant Architecture & Data Isolation

### 3.1 Tenant Model
Each subscriber company (e.g., "Chandarkant Jewellers Pvt Ltd") is represented by a `Tenant` record.
Within each Tenant, the business can operate one or more `Branch` locations (e.g., "Main Showroom - Surat", "Ring Road Branch").

### 3.2 Tenant Isolation Mechanics
1. **Database Schema Strategy**: Shared PostgreSQL database with discriminatory `tenant_id` column, backed by compound unique indexes:
   `UNIQUE(tenant_id, sku)`, `UNIQUE(tenant_id, invoice_number)`, `UNIQUE(tenant_id, branch_id, voucher_number)`.
2. **Global Eloquent Scopes**: Every tenant-owned model inherits from `BelongsToTenant` trait, which automatically applies:
   `static::addGlobalScope('tenant', fn($builder) => $builder->where('tenant_id', TenantContext::id()));`
3. **Write Protection**: The `booted` method in `BelongsToTenant` ensures `model->tenant_id` is automatically set to the active authenticated tenant on creation, ignoring any `tenant_id` passed in the HTTP request payload.
4. **Cross-Tenant Access Defense**: Sanctum token claims are cross-checked against tenant membership. Attempting to query an ID belonging to another tenant results in an immediate 404/403 forbidden error.

---

## 4. Precision Financial & Metal Rate Engine

### 4.1 Precision Requirements
Jewellery calculations cannot rely on standard floating-point arithmetic.
- **Metal Weights**: Stored as `NUMERIC(10,3)` or `NUMERIC(12,4)` (e.g., `12.450` grams or `1.2050` carats for diamonds).
- **Monetary Amounts**: Stored as `NUMERIC(14,2)` in Indian Rupees (INR).
- **Percentages & Tax Rates**: Stored as `NUMERIC(5,2)` (e.g., 3.00% GST).

### 4.2 Calculation Service (DecimalMathService)
All calculations use PHP's `bcmath` extension with configured scales:
```php
// Weight calculation: Gross Weight - Stone Weight = Net Weight
$netWeight = bcsub($grossWeight, $stoneWeight, 3);

// Pure Gold Calculation: Net Weight * (Purity / 24)
$purityFactor = bcdiv($purityKarat, '24.0', 6);
$pureGoldWeight = bcmul($netWeight, $purityFactor, 3);
```

### 4.3 Snapshot Preservation
When a POS Invoice is finalized:
- The exact metal rate applied (e.g., `₹7,250.00/g` for 22K on date of sale).
- Making charge calculation mode (`per_gram`, `fixed`, or `percentage`).
- Wastage percentage and wastage weight.
- Individual stone charges.
- Tax breakdown (CGST 1.5% + SGST 1.5% or IGST 3.0%).
are frozen in JSON and line-item snapshot columns. Updating tomorrow's gold rate will **never** alter historical invoices or financial ledgers.

---

## 5. Double-Entry Accounting Architecture

Every transaction automatically creates balanced Journal Entries:

| Business Event | Debit Ledger | Credit Ledger |
|---|---|---|
| **Gold Sale (Cash)** | Cash in Hand (1001) | Jewellery Sales Account (3001) + Output GST (2101) |
| **Gold Sale (Card/UPI)** | Bank Account (1002) | Jewellery Sales Account (3001) + Output GST (2101) |
| **Old Gold Purchase** | Old Gold Stock (1102) | Customer Account / Cash (1001) |
| **Old Gold Exchange** | Old Gold Stock (1102) + Balance Due | Jewellery Sales Account (3001) + Output GST (2101) |
| **Supplier Metal Purchase** | Gold Purchase Account (4001) + Input GST (1201) | Supplier Creditor Ledger (2001) |
| **Karigar Labour Payment** | Karigar Making Charges Expense (4002) | Cash / Bank (1001 / 1002) |

---

## 6. Role-Based Access Control (RBAC) Matrix

| Domain Module | Super Admin | Business Owner | Branch Manager | Accountant | Sales Staff | Inventory Head | Karigar |
|---|---|---|---|---|---|---|---|
| Platform Tenants & Plans | FULL | NONE | NONE | NONE | NONE | NONE | NONE |
| Global Settings & Rates | FULL | FULL | VIEW | VIEW | VIEW | VIEW | NONE |
| POS Billing & Invoicing | NONE | FULL | FULL | VIEW | CREATE/VIEW | NONE | NONE |
| Old Gold Exchange | NONE | FULL | FULL | VIEW | CREATE/VIEW | VIEW | NONE |
| Inventory & Tagging | NONE | FULL | FULL | VIEW | VIEW | FULL | NONE |
| Accounting & Ledgers | NONE | FULL | VIEW | FULL | NONE | NONE | NONE |
| Karigar Job Management | NONE | FULL | FULL | VIEW | NONE | FULL | OWN ONLY |
| Bulk Messaging Campaigns | NONE | FULL | FULL | NONE | NONE | NONE | NONE |
| Automation Workflows | NONE | FULL | VIEW | NONE | NONE | NONE | NONE |
| AI Copilot & Insights | FULL | FULL | LIMITED | LIMITED | LIMITED | LIMITED | NONE |

---

## 7. Cloud Deployment Target Topology

- **Frontend**: Single Page Application hosted on **Netlify** with global CDN edge routing and automatic HTTPS.
- **Backend API**: Containerized Laravel 11 application hosted on **Render** (Web Service), configured with PHP 8.2+, queue workers, and cron scheduler.
- **Database**: Managed **Render PostgreSQL 16+** with automated snapshots, SSL connection pooling, and cross-AZ reliability.
