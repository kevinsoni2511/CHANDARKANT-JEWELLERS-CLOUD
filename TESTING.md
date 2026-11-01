# Chandarkant Jewellers Cloud — Testing Strategy & Verification

## 1. Testing Pyramid

- **Unit Tests**:
  - `DecimalMathServiceTest`: Validates gross weight, net weight, wastage, and making charges calculations.
  - `DoubleEntryAccountingTest`: Validates that every generated financial voucher balances (`sum(debit) == sum(credit)`).
- **Feature & API Tests**:
  - `TenantIsolationTest`: Asserts tenant A cannot access, query, or mutate tenant B records.
  - `PosBillingWorkflowTest`: Asserts stock status updates from `in_stock` to `sold`, customer balance updates, and journal entries are posted on invoice completion.
  - `OldGoldExchangeTest`: Asserts deduction calculation and exchange offset on final invoice.
  - `KarigarJobReconciliationTest`: Asserts fine gold balances, permissible wastage, and scrap accounting.
- **Frontend & UI Tests**:
  - React component tests, form validation tests, and role-based access route guards.
- **PDF Document Verification**:
  - Pixel and structure verification for A4 GST Tax Invoices, Thermal Receipts, and Karigar Job Cards.

---

## 2. Running Automated Tests

### Backend Tests (PHPUnit / Pest)
```bash
cd backend
php artisan test
```

### Frontend Tests (Vitest)
```bash
cd frontend
npm run test
```
