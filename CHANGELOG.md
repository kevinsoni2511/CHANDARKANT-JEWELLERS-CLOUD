# Changelog — Chandarkant Jewellers Cloud

All notable changes and milestones for this enterprise platform are documented in this file.

## [0.2.0] - 2026-11-01
### P0 Foundation & Core ERP Live Implementation
- **PostgreSQL 18 Database**: Configured relational database `chandarkant_jewellers_db` with dedicated user `jewellery_admin`.
- **Database Architecture**: 34 production tables with precision decimal types (`NUMERIC(14,2)` and `NUMERIC(10,3)`), composite unique tenant constraints, and foreign keys.
- **Backend Core**: Laravel 12 API backend with Laravel Sanctum token authentication and `TenantMiddleware` / `BelongsToTenant` global scopes.
- **Precision Math Engine**: `DecimalMathService` implementing exact BCMath formulas for gross/stone/net weights, Karat purity factors, making charges, wastage, and 3% Indian GST.
- **Double-Entry Financial Accounting**: Implemented `AccountingService` with automated balanced journal vouchers for sales, old gold purchases, customer credit receivables, and real-time Trial Balance.
- **POS & Billing Engine**: Live estimation preview, item status transitions (`in_stock` to `sold`), old gold exchange offset, and A4/thermal printable tax invoice generation with BIS HUID numbers.
- **Precious Metal Rates**: Daily retail rate management (24K, 22K, 20K, 18K, 14K, Silver, Platinum) with audit logs.
- **Artisan Management**: Karigar job cards, fine gold allocations, unreturned balance ledger, and labour accounting.
- **Saving Schemes**: Swarna Nidhi (11+1) monthly kitty scheme with passbook numbers and installment collections.
- **AI Business Copilot**: Integrated AI assistant supporting English, Hindi, and Gujarati for live telemetry queries and marketing copy generation.
- **Frontend SPA**: React 19 + TypeScript + Vite + Tailwind CSS with luxury jewellery aesthetic (Deep Burgundy `#380810`, Metallic Gold `#D4AF37`, Warm Ivory `#FAF8F5`).
- **Testing**: 100% automated test suite pass rate (11 tests, 23 assertions) covering unit math, tenant isolation, and full POS billing & accounting workflow.
- **Live Servers**: Backend API active on `http://127.0.0.1:8000` and Frontend active on `http://127.0.0.1:5174`.

## [0.1.0] - 2026-11-01
### Initial System Architecture
- Initialized documentation suite (`README.md`, `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `API_DOCUMENTATION.md`, `MODULE_STATUS.md`, `BUSINESS_RULES.md`, `SECURITY.md`, `TESTING.md`, `DEPLOYMENT.md`, `ENVIRONMENT_VARIABLES.md`).
