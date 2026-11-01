# Chandarkant Jewellers Cloud — REST API Specification

## 1. Global API Standards

- **Base URL**: `/api/v1`
- **Protocol**: HTTPS
- **Content-Type**: `application/json`
- **Accept**: `application/json`

### Standard Request Headers
```http
Authorization: Bearer <sanctum_token>
X-Tenant-Subdomain: <tenant_subdomain>   # Optional: resolved automatically from token
X-Branch-Id: <branch_id>                 # Optional: active branch filter
```

### Standard Response Envelope
```json
{
  "success": true,
  "data": {},
  "message": "Resource retrieved successfully",
  "meta": {
    "current_page": 1,
    "last_page": 10,
    "total": 150
  }
}
```

### Standard Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The given data was invalid.",
    "details": {
      "gross_weight": ["The gross weight must be greater than stone weight."]
    }
  }
}
```

---

## 2. Authentication & Session Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Login user, issue Sanctum Bearer token | Public |
| `POST` | `/api/v1/auth/logout` | Revoke active token | Authenticated |
| `GET` | `/api/v1/auth/me` | Fetch active user, tenant info, and permissions | Authenticated |
| `POST` | `/api/v1/auth/switch-branch` | Change active operational branch context | Authenticated |

---

## 3. Metal Rates Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/metal-rates` | List current active metal rates for tenant/branch |
| `POST` | `/api/v1/metal-rates` | Update today's retail metal rates (Owner/Admin) |
| `GET` | `/api/v1/metal-rates/history` | Historical chart data for 24K, 22K, 18K, Silver |

### Sample Payload: `POST /api/v1/metal-rates`
```json
{
  "effective_date": "2026-11-01",
  "rates": [
    { "metal_type": "gold", "purity_karat": "24K", "rate_per_gram": 7950.00 },
    { "metal_type": "gold", "purity_karat": "22K", "rate_per_gram": 7287.50 },
    { "metal_type": "gold", "purity_karat": "18K", "rate_per_gram": 5962.50 },
    { "metal_type": "silver", "purity_karat": "999", "rate_per_gram": 98.50 }
  ]
}
```

---

## 4. Jewellery Inventory & Barcode Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/inventory` | Search items with filters (category, metal, status, HUID) |
| `POST` | `/api/v1/inventory` | Create new tagged jewellery item |
| `GET` | `/api/v1/inventory/{sku}` | Lookup item by SKU or Barcode scan |
| `POST` | `/api/v1/inventory/transfer` | Initiate inter-branch stock transfer |
| `POST` | `/api/v1/inventory/audit-verify` | Verify scanned physical item during stock audit |

---

## 5. POS Billing & Invoicing Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/pos/calculate-estimate` | Non-persisting calculation preview for billing screen |
| `POST` | `/api/v1/pos/invoices` | Finalize invoice, debit stock, post journal entries |
| `GET` | `/api/v1/pos/invoices/{id}` | Retrieve complete invoice details with frozen snapshot |
| `GET` | `/api/v1/pos/invoices/{id}/pdf` | Generate high-resolution PDF (A4 / Thermal) |

### Sample Payload: `POST /api/v1/pos/invoices`
```json
{
  "customer_id": 142,
  "invoice_date": "2026-11-01",
  "items": [
    {
      "inventory_item_id": 890,
      "making_charges_override": 650.00,
      "discount_amount": 0.00
    }
  ],
  "old_gold_items": [
    {
      "metal_type": "gold",
      "purity_karat": "22K",
      "gross_weight": 14.500,
      "stone_deduction": 0.500,
      "rate_per_gram": 7100.00
    }
  ],
  "payments": [
    { "payment_mode": "upi", "amount": 50000.00, "reference_number": "UPI/981273918" },
    { "payment_mode": "cash", "amount": 25400.00 }
  ]
}
```

---

## 6. Financial Accounting & Ledger Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/accounting/chart-of-accounts` | Full hierarchical chart of accounts |
| `GET` | `/api/v1/accounting/ledgers/{accountId}` | Detailed account ledger with running balance |
| `POST` | `/api/v1/accounting/vouchers` | Create manual journal, receipt, or payment voucher |
| `GET` | `/api/v1/accounting/day-book` | Comprehensive daily cash and bank register |
| `GET` | `/api/v1/accounting/trial-balance` | Real-time debit and credit trial balance |
| `GET` | `/api/v1/accounting/profit-loss` | Accurate Profit & Loss statement |
| `GET` | `/api/v1/accounting/gst-summary` | GSTR-1 & GSTR-3B monthly tax summary |

---

## 7. Karigar Job Card Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/karigars` | List artisan profiles and current pure gold balance |
| `POST` | `/api/v1/karigar-jobs` | Issue new job card with metal allocation |
| `POST` | `/api/v1/karigar-jobs/{id}/receive` | Receive crafted piece, record scrap & calculate wastage |
| `POST` | `/api/v1/karigar-jobs/{id}/pay` | Settle Karigar labour charges through Cash/Bank |

---

## 8. AI Copilot & Automation Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/ai/query` | Ask business assistant (voice/text) with tenant isolation |
| `GET` | `/api/v1/ai/insights` | Sales predictions, dead stock alerts, reorder suggestions |
| `POST` | `/api/v1/ai/generate-campaign` | Generate festival WhatsApp/SMS promotional copy |
| `GET` | `/api/v1/workflows` | List active automation rules |
| `POST` | `/api/v1/workflows` | Create trigger-condition-action workflow |
