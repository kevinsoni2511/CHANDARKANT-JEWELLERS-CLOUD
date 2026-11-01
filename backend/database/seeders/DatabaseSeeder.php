<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Category;
use App\Models\ChartOfAccount;
use App\Models\Customer;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\InvoicePayment;
use App\Models\Karigar;
use App\Models\MetalRate;
use App\Models\SavingScheme;
use App\Models\SavingSchemeEnrollment;
use App\Models\SavingSchemeInstallment;
use App\Models\Tenant;
use App\Models\User;
use App\Services\DecimalMathService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Super Admin User (Global)
        $superAdmin = User::create([
            'name' => 'Kiran Soni (Super Admin)',
            'email' => 'superadmin@chandarkantjewellers.com',
            'password' => Hash::make('SuperSecure@2026'),
            'role' => 'super_admin',
            'phone' => '+91 98980 00001',
            'is_active' => true,
        ]);

        // 2. Create Flagship Jewellery Enterprise Tenant
        $tenant = Tenant::create([
            'name' => 'Chandarkant Jewellers Pvt Ltd',
            'subdomain' => 'chandarkant',
            'business_type' => 'retail',
            'legal_entity' => 'Private Limited',
            'pan' => 'AAACC1234M',
            'gstin' => '24AAACC1234M1Z8',
            'phone' => '+91 98790 01122',
            'email' => 'info@chandarkantjewellers.com',
            'address' => 'Ghanshyam Nagar, Varachha Main Road',
            'city' => 'Surat',
            'state' => 'Gujarat',
            'state_code' => '24',
            'pincode' => '395006',
            'currency' => 'INR',
            'status' => 'active',
            'subscription_plan' => 'enterprise',
        ]);

        // 3. Create Branches
        $mainBranch = Branch::create([
            'tenant_id' => $tenant->id,
            'name' => 'Main Showroom - Surat (Varachha)',
            'code' => 'CJ-SRT',
            'address' => 'Ghanshyam Nagar, Varachha Main Road',
            'city' => 'Surat',
            'state' => 'Gujarat',
            'state_code' => '24',
            'pincode' => '395006',
            'phone' => '+91 98790 01122',
            'is_main' => true,
            'is_active' => true,
        ]);

        $ringRoadBranch = Branch::create([
            'tenant_id' => $tenant->id,
            'name' => 'Ring Road Showroom - Surat',
            'code' => 'CJ-RRD',
            'address' => '402 Millennium Market, Ring Road',
            'city' => 'Surat',
            'state' => 'Gujarat',
            'state_code' => '24',
            'pincode' => '395002',
            'phone' => '+91 98790 03344',
            'is_main' => false,
            'is_active' => true,
        ]);

        // 4. Create Tenant Role Users
        $owner = User::create([
            'tenant_id' => $tenant->id,
            'branch_id' => $mainBranch->id,
            'name' => 'Chandarkant Soni (Owner)',
            'email' => 'owner@chandarkantjewellers.com',
            'password' => Hash::make('OwnerSecure@2026'),
            'role' => 'owner',
            'phone' => '+91 98790 12345',
            'is_active' => true,
        ]);

        $manager = User::create([
            'tenant_id' => $tenant->id,
            'branch_id' => $mainBranch->id,
            'name' => 'Bhavin Patel (Branch Manager)',
            'email' => 'manager.surat@chandarkantjewellers.com',
            'password' => Hash::make('ManagerSecure@2026'),
            'role' => 'manager',
            'phone' => '+91 98790 23456',
            'is_active' => true,
        ]);

        $accountant = User::create([
            'tenant_id' => $tenant->id,
            'branch_id' => $mainBranch->id,
            'name' => 'Hitesh Shah (Chief Accountant)',
            'email' => 'accountant@chandarkantjewellers.com',
            'password' => Hash::make('AccountantSecure@2026'),
            'role' => 'accountant',
            'phone' => '+91 98790 34567',
            'is_active' => true,
        ]);

        $sales = User::create([
            'tenant_id' => $tenant->id,
            'branch_id' => $mainBranch->id,
            'name' => 'Pooja Varma (Sales Executive)',
            'email' => 'sales@chandarkantjewellers.com',
            'password' => Hash::make('SalesSecure@2026'),
            'role' => 'sales',
            'phone' => '+91 98790 45678',
            'is_active' => true,
        ]);

        $stock = User::create([
            'tenant_id' => $tenant->id,
            'branch_id' => $mainBranch->id,
            'name' => 'Naresh Solanki (Inventory Head)',
            'email' => 'stock@chandarkantjewellers.com',
            'password' => Hash::make('StockSecure@2026'),
            'role' => 'stock',
            'phone' => '+91 98790 56789',
            'is_active' => true,
        ]);

        $karigarUser = User::create([
            'tenant_id' => $tenant->id,
            'branch_id' => $mainBranch->id,
            'name' => 'Ramesh Soni (Master Karigar)',
            'email' => 'karigar.ramesh@chandarkantjewellers.com',
            'password' => Hash::make('KarigarSecure@2026'),
            'role' => 'karigar',
            'phone' => '+91 98790 67890',
            'is_active' => true,
        ]);

        // 5. Chart of Accounts
        $accounts = [
            ['1001', 'Cash in Hand', 'asset'],
            ['1002', 'HDFC Current Bank A/c (Surat)', 'asset'],
            ['1101', 'Customer Receivables Ledger', 'asset'],
            ['1102', 'Old Gold Stock Holding', 'asset'],
            ['1201', 'Input CGST (1.5%)', 'asset'],
            ['1202', 'Input SGST (1.5%)', 'asset'],
            ['2001', 'Bullion Supplier Creditors', 'liability'],
            ['2101', 'Output CGST (1.5%)', 'liability'],
            ['2102', 'Output SGST (1.5%)', 'liability'],
            ['2103', 'Output IGST (3.0%)', 'liability'],
            ['3001', 'Jewellery Sales Revenue', 'income'],
            ['4001', 'Bullion Metal Purchases', 'expense'],
            ['4002', 'Karigar Making Labour Charges', 'expense'],
            ['4999', 'Round Off Expense / Discount', 'expense'],
        ];

        foreach ($accounts as [$code, $name, $type]) {
            ChartOfAccount::create([
                'tenant_id' => $tenant->id,
                'code' => $code,
                'name' => $name,
                'type' => $type,
                'is_system' => true,
            ]);
        }

        // 6. Live Precious Metal Rates
        $rates = [
            ['gold', '24K', 99.900, 7950.00],
            ['gold', '22K', 91.667, 7287.50],
            ['gold', '20K', 83.333, 6625.00],
            ['gold', '18K', 75.000, 5962.50],
            ['gold', '14K', 58.333, 4637.50],
            ['silver', '999', 99.900, 98.50],
            ['silver', '925', 92.500, 91.10],
            ['platinum', '950', 95.000, 3250.00],
        ];

        foreach ($rates as [$metal, $karat, $pct, $rate]) {
            MetalRate::create([
                'tenant_id' => $tenant->id,
                'branch_id' => $mainBranch->id,
                'metal_type' => $metal,
                'purity_karat' => $karat,
                'purity_percentage' => $pct,
                'rate_per_gram' => $rate,
                'effective_date' => now()->toDateString(),
                'updated_by' => $owner->id,
            ]);
        }

        // 7. Jewellery Categories
        $categories = [
            ['Bangles & Kadas', 'CAT-BGL', 'gold', 3.00, 'per_gram', 650.00],
            ['Necklaces & Chokers', 'CAT-NCK', 'gold', 4.50, 'per_gram', 850.00],
            ['Finger Rings (Ladies & Gents)', 'CAT-RNG', 'gold', 2.50, 'per_gram', 600.00],
            ['Mangalsutra & Chains', 'CAT-MNG', 'gold', 2.00, 'per_gram', 550.00],
            ['Diamond Earrings & Tops', 'CAT-DIA-EAR', 'diamond', 1.50, 'fixed', 3500.00],
            ['Silver Pooja Utensils', 'CAT-SLV-UTN', 'silver', 1.00, 'per_gram', 35.00],
        ];

        $categoryModels = [];
        foreach ($categories as [$name, $code, $metal, $wastage, $mkType, $mkRate]) {
            $categoryModels[$code] = Category::create([
                'tenant_id' => $tenant->id,
                'name' => $name,
                'code' => $code,
                'metal_type' => $metal,
                'default_wastage_percent' => $wastage,
                'default_making_charge_type' => $mkType,
                'default_making_charge_rate' => $mkRate,
            ]);
        }

        // 8. Tagged Inventory Items with authentic BIS HUIDs
        $items = [
            [
                'name' => '22K Royal Antique Gold Bridal Necklace',
                'category' => 'CAT-NCK',
                'sku' => 'CJ-G-NCK-1001',
                'huid' => 'HUID-9B7C1A',
                'metal_type' => 'gold',
                'purity_karat' => '22K',
                'gross_weight' => 45.850,
                'stone_weight' => 2.150,
                'wastage_percent' => 3.50,
                'making_charge_type' => 'per_gram',
                'making_charge_rate' => 850.00,
                'stone_charges' => 2500.00,
                'purchase_cost' => 315000.00,
                'branch_id' => $mainBranch->id,
            ],
            [
                'name' => '22K Handcrafted Calcutta Filigree Bangles (Pair)',
                'category' => 'CAT-BGL',
                'sku' => 'CJ-G-BGL-1002',
                'huid' => 'HUID-4F8X2D',
                'metal_type' => 'gold',
                'purity_karat' => '22K',
                'gross_weight' => 32.400,
                'stone_weight' => 0.000,
                'wastage_percent' => 2.50,
                'making_charge_type' => 'per_gram',
                'making_charge_rate' => 650.00,
                'stone_charges' => 0.00,
                'purchase_cost' => 225000.00,
                'branch_id' => $mainBranch->id,
            ],
            [
                'name' => '18K Diamond Solitaire Engagement Ring',
                'category' => 'CAT-RNG',
                'sku' => 'CJ-D-RNG-1003',
                'huid' => 'HUID-8K2M9Q',
                'metal_type' => 'diamond',
                'purity_karat' => '18K',
                'gross_weight' => 4.650,
                'stone_weight' => 0.350,
                'wastage_percent' => 1.50,
                'making_charge_type' => 'fixed',
                'making_charge_rate' => 4500.00,
                'stone_charges' => 38000.00,
                'purchase_cost' => 58000.00,
                'branch_id' => $mainBranch->id,
            ],
            [
                'name' => '22K Classic Traditional Mangalsutra (30 Inch)',
                'category' => 'CAT-MNG',
                'sku' => 'CJ-G-MNG-1004',
                'huid' => 'HUID-6R3P7V',
                'metal_type' => 'gold',
                'purity_karat' => '22K',
                'gross_weight' => 18.250,
                'stone_weight' => 1.800,
                'wastage_percent' => 2.00,
                'making_charge_type' => 'per_gram',
                'making_charge_rate' => 550.00,
                'stone_charges' => 800.00,
                'purchase_cost' => 118000.00,
                'branch_id' => $ringRoadBranch->id,
            ],
            [
                'name' => '22K Men\'s Signet Lion Head Ring',
                'category' => 'CAT-RNG',
                'sku' => 'CJ-G-RNG-1005',
                'huid' => 'HUID-2W9N4T',
                'metal_type' => 'gold',
                'purity_karat' => '22K',
                'gross_weight' => 9.420,
                'stone_weight' => 0.000,
                'wastage_percent' => 2.00,
                'making_charge_type' => 'per_gram',
                'making_charge_rate' => 600.00,
                'stone_charges' => 0.00,
                'purchase_cost' => 65000.00,
                'branch_id' => $mainBranch->id,
            ],
            [
                'name' => 'Pure 999 Silver Nakshi Pooja Thali Set',
                'category' => 'CAT-SLV-UTN',
                'sku' => 'CJ-S-THL-1006',
                'huid' => null,
                'metal_type' => 'silver',
                'purity_karat' => '999',
                'gross_weight' => 350.000,
                'stone_weight' => 0.000,
                'wastage_percent' => 1.00,
                'making_charge_type' => 'per_gram',
                'making_charge_rate' => 35.00,
                'stone_charges' => 0.00,
                'purchase_cost' => 32000.00,
                'branch_id' => $mainBranch->id,
            ],
        ];

        foreach ($items as $itemData) {
            $cat = $categoryModels[$itemData['category']];
            $net = DecimalMathService::netWeight($itemData['gross_weight'], $itemData['stone_weight']);
            $fine = DecimalMathService::pureFineWeight($net, $itemData['purity_karat']);

            InventoryItem::create([
                'tenant_id' => $tenant->id,
                'branch_id' => $itemData['branch_id'],
                'category_id' => $cat->id,
                'sku' => $itemData['sku'],
                'barcode' => $itemData['sku'],
                'name' => $itemData['name'],
                'huid' => $itemData['huid'],
                'metal_type' => $itemData['metal_type'],
                'purity_karat' => $itemData['purity_karat'],
                'gross_weight' => $itemData['gross_weight'],
                'stone_weight' => $itemData['stone_weight'],
                'net_weight' => $net,
                'fine_gold_weight' => $fine,
                'wastage_percent' => $itemData['wastage_percent'],
                'making_charge_type' => $itemData['making_charge_type'],
                'making_charge_rate' => $itemData['making_charge_rate'],
                'stone_charges' => $itemData['stone_charges'],
                'purchase_cost' => $itemData['purchase_cost'],
                'status' => 'in_stock',
            ]);
        }

        // 9. Customers
        $customers = [
            [
                'name' => 'Rajeshbhai Choksi',
                'phone' => '9825123456',
                'email' => 'rajesh.choksi@gmail.com',
                'pan_number' => 'AHGPC9921K',
                'city' => 'Surat',
                'birthday' => '1982-11-15',
                'anniversary' => '2008-12-04',
                'loyalty_tier' => 'gold',
                'loyalty_points' => 340,
                'outstanding_balance' => 0.00,
            ],
            [
                'name' => 'Meenaben Zaveri',
                'phone' => '9825654321',
                'email' => 'meena.zaveri@yahoo.com',
                'pan_number' => 'BKMPZ4410R',
                'city' => 'Surat',
                'birthday' => '1988-04-22',
                'anniversary' => '2012-02-18',
                'loyalty_tier' => 'diamond',
                'loyalty_points' => 890,
                'outstanding_balance' => 45000.00,
            ],
            [
                'name' => 'Ketanbhai Shah',
                'phone' => '9979011223',
                'email' => 'ketan.shah@outlook.com',
                'pan_number' => 'CZTPS8832L',
                'city' => 'Navsari',
                'birthday' => '1992-08-10',
                'anniversary' => '2017-05-20',
                'loyalty_tier' => 'silver',
                'loyalty_points' => 120,
                'outstanding_balance' => 0.00,
            ],
        ];

        $customerModels = [];
        foreach ($customers as $c) {
            $customerModels[] = Customer::create(array_merge($c, ['tenant_id' => $tenant->id]));
        }

        // 10. Karigar Record
        $karigar = Karigar::create([
            'tenant_id' => $tenant->id,
            'name' => 'Ramesh Soni (Antique Artisan)',
            'phone' => '9879067890',
            'specialization' => 'Antique Jadau & Kundan Handcrafting',
            'address' => 'Gopipura Soni Bazar, Surat',
            'pure_gold_balance' => 24.500, // 24.5g currently with artisan
            'labour_rate_default' => 550.00,
            'is_active' => true,
        ]);

        // 11. Saving Scheme (Kitty)
        $scheme = SavingScheme::create([
            'tenant_id' => $tenant->id,
            'name' => 'Swarna Nidhi (11+1 Monthly Gold Plan)',
            'duration_months' => 11,
            'monthly_installment' => 5000.00,
            'bonus_amount' => 5000.00,
            'terms_and_conditions' => 'Pay 11 installments of ₹5,000. Chandarkant Jewellers contributes 1 month bonus. Redeem against 22K/18K jewellery at maturity.',
            'is_active' => true,
        ]);

        // Customer Enrollment
        $enrollment = SavingSchemeEnrollment::create([
            'tenant_id' => $tenant->id,
            'scheme_id' => $scheme->id,
            'customer_id' => $customerModels[0]->id,
            'passbook_number' => 'PB-2026-00001',
            'start_date' => now()->subMonths(3)->toDateString(),
            'status' => 'active',
            'total_paid' => 15000.00,
            'maturity_value' => 60000.00,
        ]);

        for ($i = 1; $i <= 3; $i++) {
            SavingSchemeInstallment::create([
                'enrollment_id' => $enrollment->id,
                'installment_no' => $i,
                'amount_paid' => 5000.00,
                'payment_date' => now()->subMonths(4 - $i)->toDateString(),
                'receipt_number' => "REC-SCH-2026-000{$i}",
                'payment_mode' => 'upi',
            ]);
        }

        // 12. Seed an initial POS Tax Invoice and Ledger Entries
        $invoice = Invoice::create([
            'tenant_id' => $tenant->id,
            'branch_id' => $mainBranch->id,
            'customer_id' => $customerModels[0]->id,
            'user_id' => $sales->id,
            'invoice_number' => 'INV-2026-0001',
            'invoice_date' => now()->toDateString(),
            'subtotal' => 345000.00,
            'discount_amount' => 0.00,
            'old_gold_amount' => 0.00,
            'taxable_amount' => 345000.00,
            'cgst_rate' => 1.50,
            'cgst_amount' => 5175.00,
            'sgst_rate' => 1.50,
            'sgst_amount' => 5175.00,
            'igst_rate' => 0.00,
            'igst_amount' => 0.00,
            'round_off' => 0.00,
            'grand_total' => 355350.00,
            'paid_amount' => 355350.00,
            'due_amount' => 0.00,
            'status' => 'paid',
            'notes' => 'Bridal necklace set sold with full BIS HUID hallmark certification.',
        ]);

        InvoiceItem::create([
            'invoice_id' => $invoice->id,
            'item_name' => '22K Royal Antique Gold Bridal Necklace',
            'sku' => 'CJ-G-NCK-1001',
            'huid' => 'HUID-9B7C1A',
            'metal_type' => 'gold',
            'purity_karat' => '22K',
            'gross_weight' => 45.850,
            'stone_weight' => 2.150,
            'net_weight' => 43.700,
            'metal_rate_applied' => 7287.50,
            'metal_value' => 318463.75,
            'wastage_percent' => 3.50,
            'wastage_weight' => 1.530,
            'wastage_amount' => 11149.88,
            'making_charge_type' => 'per_gram',
            'making_charge_rate' => 850.00,
            'making_charges' => 37145.00,
            'stone_charges' => 2500.00,
            'item_total' => 345000.00,
        ]);

        InvoicePayment::create([
            'invoice_id' => $invoice->id,
            'payment_mode' => 'upi',
            'amount' => 355350.00,
            'reference_number' => 'UPI-REF-2026-9921',
            'payment_date' => now()->toDateString(),
        ]);
    }
}
