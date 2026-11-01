# Chandarkant Jewellers Cloud — Business Rules & Mathematical Formulas

This document formalizes the statutory and domain-specific formulas implemented in the backend `DecimalMathService` and domain services.

---

## 1. Weight & Purity Calculations

### 1.1 Net Weight
$$\text{Net Weight} = \text{Gross Weight} - \text{Stone Weight}$$
- All weights measured in grams to 3 decimal places ($0.001\text{g}$).
- Diamond / gemstone weights measured in carats to 4 decimal places ($1\text{ carat} = 0.2000\text{g}$).

### 1.2 Pure Metal Equivalent (Fine Gold)
$$\text{Fine Gold Weight} = \text{Net Weight} \times \left( \frac{\text{Purity Karat}}{24.0} \right)$$
*Examples:*
- $22\text{K } (916 \text{ Hallmark}) = 22 / 24 = 0.91667$ fine gold.
- $18\text{K } (750 \text{ Hallmark}) = 18 / 24 = 0.75000$ fine gold.

---

## 2. Point of Sale & Billing Formulas

### 2.1 Metal Value
$$\text{Metal Value} = \text{Net Weight} \times \text{Today's Retail Metal Rate per Gram}$$

### 2.2 Wastage / Melting Loss
- **Percentage-based Wastage**:
  $$\text{Wastage Weight} = \text{Net Weight} \times \left( \frac{\text{Wastage } \%}{100} \right)$$
  $$\text{Wastage Charge} = \text{Wastage Weight} \times \text{Metal Rate}$$

### 2.3 Making Charges
Making charges can be configured by three strategies per item or product category:
1. **Per Gram**: $\text{Making Charges} = \text{Gross Weight} \times \text{Rate per Gram}$
2. **Fixed Amount**: $\text{Making Charges} = \text{Fixed Fee}$
3. **Percentage of Metal Value**: $\text{Making Charges} = \text{Metal Value} \times \left(\frac{\text{Percentage}}{100}\right)$

### 2.4 Old Gold Purchase / Exchange Deduction
$$\text{Old Gold Pure Weight} = (\text{Old Gross Weight} - \text{Deduction Weight}) \times \left(\frac{\text{Purity Karat}}{24.0}\right)$$
$$\text{Old Gold Value} = \text{Old Gold Pure Weight} \times \text{Old Gold Buying Rate (24K)}$$
*In exchange invoices, Old Gold Value is deducted directly from the gross payable before final settlement.*

### 2.5 Goods & Services Tax (GST)
In India, jewellery retail attracts **3% GST**:
- **Intra-State Supply** (Showroom in Gujarat, Customer in Gujarat):
  $$\text{CGST} = \text{Taxable Value} \times 1.50\%$$
  $$\text{SGST} = \text{Taxable Value} \times 1.50\%$$
- **Inter-State Supply** (Showroom in Gujarat, Customer outside Gujarat):
  $$\text{IGST} = \text{Taxable Value} \times 3.00\%$$
- **Making Charges Only** (Job work billed separately): Attracts 5% GST.

---

## 3. Karigar (Artisan) Metal Accounting

Every Karigar issue and return is reconciled in fine gold equivalent:
$$\text{Fine Gold Issued} = \text{Gross Issued} \times \text{Purity Factor}$$
$$\text{Fine Gold Accounted} = (\text{Product Pure Gold}) + (\text{Scrap/Dust Pure Gold}) + (\text{Permissible Wastage})$$
$$\Delta \text{ Variance (Shortage/Excess)} = \text{Fine Gold Issued} - \text{Fine Gold Accounted}$$
- Any unaccounted shortage is debited against the Karigar's personal metal ledger balance.

---

## 4. Saving Scheme (Kitty) Maturity Calculation

In an $11 + 1$ Monthly Scheme with Monthly Installment $I$:
$$\text{Total Customer Paid} = 11 \times I$$
$$\text{Bonus Given by Jeweller} = 1 \times I$$
$$\text{Maturity Purchasing Power} = 12 \times I$$
Customer can redeem the accumulated value solely against jewellery purchase at the prevailing gold rate on date of redemption.
