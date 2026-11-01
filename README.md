# Chandarkant Jewellers Cloud (CJC)

> **Enterprise-Grade AI-Powered Jewellery ERP, CRM, POS, Accounting, Automation & SaaS Platform**

---

## 💎 Overview

**Chandarkant Jewellers Cloud** is an enterprise-grade cloud operating system purpose-built for the Indian jewellery industry. Built for gold, silver, diamond, and platinum retailers, wholesalers, and manufacturers, it natively integrates:

- **Multi-Tenant SaaS Architecture**: Complete data isolation per jewellery company with multi-branch management.
- **Inventory & Hallmarking Engine**: Individual item tracking with gross weight, stone weight, net weight, purity, HUID (Hallmark Unique Identification Number), wastage, making charges, and barcode generation.
- **Precious Metal Rate Engine**: Live & local retail rate boards (24K, 22K, 20K, 18K, 14K, Silver, Platinum) with historical charts, branch-specific rates, and audit logs.
- **Advanced Jewellery POS & Billing**: Tag-wise scanning, old gold exchange/purchase, making charges, stone deductions, GST calculations, partial payments, credit notes, and thermal/A4 printing.
- **Double-Entry Financial Accounting & GST**: Independent chart of accounts, automated journal entries, customer/supplier ledgers, trial balance, P&L, balance sheet, and GST return-ready reports.
- **Karigar & Job-Work Tracking**: Issue/return reconciliation, pure gold accountability, wastage loss tracking, and labour accounting.
- **Customer CRM & Saving Schemes**: Swarna Nidhi / Kitty installment schemes, loyalty, customer ledger, KYC, and anniversary/birthday reminders.
- **Omnichannel Bulk Messaging**: Official WhatsApp Business Cloud API, Indian DLT SMS gateways, and transactional email.
- **No-Code Automation Workflow Engine**: Trigger -> Condition -> Action orchestration for reminders, reorder alerts, and customer engagement.
- **AI Business Intelligence & Copilot**: Multi-provider AI (OpenAI & Google Gemini) for sales forecasting, voice commands, natural language queries, and invoice OCR.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 / 19, TypeScript, Vite | Fast, responsive Single Page Application |
| **Styling** | Tailwind CSS, Lucide React | Luxury jewellery aesthetic (Burgundy, Gold, Warm Ivory) |
| **State & Forms** | React Hook Form, Zod, Axios, Recharts | Robust data validation and interactive financial analytics |
| **Backend** | Laravel 11 / PHP 8.2+ | Single source of truth for all business and financial logic |
| **API & Auth** | RESTful API, Laravel Sanctum, Policies | Token-based secure authentication & granular RBAC |
| **Database** | PostgreSQL 18+ | Relational integrity, constraints, transactions, and precision decimals |
| **Math & Precision**| PHP BCMath / PostgreSQL `NUMERIC(14,4)` | Exact 3-4 decimal place weight and financial precision |
| **Storage & Jobs** | Redis / Database Queues, S3-Compatible | Background workers for campaigns, reports, and media storage |

---

## 🏛️ Repository Structure

```text
CHANDARKANT JEWELLERS CLOUD/
├── backend/                  # Laravel 11/12 REST API & Business Logic
│   ├── app/
│   │   ├── Domain/           # Domain-Driven Core Modules
│   │   ├── Http/Controllers/ # REST API Controllers
│   │   ├── Models/           # Eloquent Models with Global Tenant Scopes
│   │   ├── Policies/         # RBAC Authorization Policies
│   │   ├── Services/         # Reusable Business & Financial Services
│   │   └── Workflows/        # Automation Engine Engine & Triggers
│   ├── database/
│   │   ├── migrations/       # PostgreSQL Relational Migrations
│   │   └── seeders/          # Enterprise Demonstration & Setup Seeders
│   └── tests/                # Automated Feature, Unit & Security Tests
├── frontend/                 # Vite + React + TypeScript Single Page App
│   ├── src/
│   │   ├── components/       # Reusable UI Design System Components
│   │   ├── contexts/         # Auth, Tenant & Notification Contexts
│   │   ├── modules/          # Domain-specific UI Panels & Workflows
│   │   ├── services/         # Axios API Client & Endpoints
│   │   └── types/            # TypeScript Domain Definitions
├── docs/                     # Technical, Architectural & User Guides
├── ARCHITECTURE.md           # System Architecture & Tenant Model
├── DATABASE_SCHEMA.md        # Relational Database Schema & Constraints
├── API_DOCUMENTATION.md      # REST API Specification & Payloads
├── MODULE_STATUS.md          # Implementation & Verification Tracker
├── BUSINESS_RULES.md         # Jewellery Domain & Financial Formulas
├── SECURITY.md               # Threat Modeling & Tenant Isolation
├── TESTING.md                # Testing Strategy & Acceptance Criteria
└── DEPLOYMENT.md             # Production Deployment to Render & Netlify
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- PHP 8.2+ with `pdo_pgsql`, `bcmath`, `gd`, `zip`
- Composer 2.x
- Node.js 20+ and npm 10+
- PostgreSQL 16+ running locally on port 5432

### 1. Database Setup
Ensure PostgreSQL is running and create the database:
```sql
CREATE DATABASE chandarkant_jewellers_db;
```

### 2. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 👥 Default Roles & Credentials

The seeders provide standard demonstration accounts for each role:

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Super Admin** | `superadmin@chandarkantjewellers.com` | `SuperSecure@2026` | Platform Overview, Tenant & Subscription Management |
| **Business Owner**| `owner@chandarkantjewellers.com` | `OwnerSecure@2026` | Complete Jewellery Business Operations & Accounting |
| **Branch Manager**| `manager.surat@chandarkantjewellers.com` | `ManagerSecure@2026` | Surat Branch Operations, Inventory & Staff Monitoring |
| **Accountant** | `accountant@chandarkantjewellers.com` | `AccountantSecure@2026` | Vouchers, Ledgers, GST, Day Book & Financial Reports |
| **Sales Staff** | `sales@chandarkantjewellers.com` | `SalesSecure@2026` | POS Billing, Estimates, Customer Registration |
| **Inventory Head**| `stock@chandarkantjewellers.com` | `StockSecure@2026` | Item Tagging, Barcode Printing, Stock Transfer |
| **Karigar** | `karigar.ramesh@chandarkantjewellers.com`| `KarigarSecure@2026` | Assigned Job Cards, Pure Gold Reconciliation |

---

## 📜 License & Compliance

Proprietary enterprise software developed for commercial deployment. Built to comply with Indian GST laws, Hallmarking/HUID regulations, and Bureau of Indian Standards (BIS) specifications.
