<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Tenant;

class PdfDocumentService
{
    /**
     * Render High-Fidelity A4 Tax Invoice Document (HTML / Print ready)
     */
    public function renderA4Invoice(Invoice $invoice, string $language = 'en'): string
    {
        $tenant = $invoice->tenant;
        $branch = $invoice->branch;
        $customer = $invoice->customer;

        $labels = [
            'en' => [
                'title' => 'TAX INVOICE',
                'huid_label' => 'BIS Hallmarked with 6-Digit HUID',
                'bill_to' => 'Billed To (Patron):',
                'invoice_no' => 'Invoice No:',
                'date' => 'Date:',
                'item_desc' => 'Ornament Description',
                'purity' => 'Karat',
                'gross' => 'Gross Wt',
                'stone' => 'Stone Wt',
                'net' => 'Net Wt',
                'rate' => 'Rate/g',
                'making' => 'Making (₹)',
                'total' => 'Total (₹)',
                'subtotal' => 'Taxable Value:',
                'cgst' => 'CGST (1.5%):',
                'sgst' => 'SGST (1.5%):',
                'grand_total' => 'Grand Total (INR):',
                'auth_sign' => 'Authorized Signatory',
            ],
            'gu' => [
                'title' => 'જીએસટી કર ઇન્વૉઇસ (ટેક્સ બિલ)',
                'huid_label' => 'બીઆઈએસ હોલમાર્ક ૬-અંક HUID સાથે પ્રમાણિત',
                'bill_to' => 'ગ્રાહકનું નામ:',
                'invoice_no' => 'બિલ નં:',
                'date' => 'તારીખ:',
                'item_desc' => 'દાગીનાની વિગત',
                'purity' => 'કેરેટ',
                'gross' => 'કુલ વજન',
                'stone' => 'નંગ વજન',
                'net' => 'ચોખ્ખું વજન',
                'rate' => 'ભાવ/ગ્રામ',
                'making' => 'ઘડામણ (₹)',
                'total' => 'કુલ રકમ (₹)',
                'subtotal' => 'કરપાત્ર રકમ:',
                'cgst' => 'સીજીએસટી (૧.૫%):',
                'sgst' => 'એસજીએસટી (૧.૫%):',
                'grand_total' => 'કુલ ચૂકવવાપાત્ર રકમ:',
                'auth_sign' => 'અધિકૃત સહી',
            ],
            'hi' => [
                'title' => 'जीएसटी कर चालान (टैक्स इनवॉइस)',
                'huid_label' => 'बीआईएस हॉलमार्क ६-अंकीय HUID प्रमाणित',
                'bill_to' => 'ग्राहक का नाम:',
                'invoice_no' => 'चालान संख्या:',
                'date' => 'तारीख:',
                'item_desc' => 'आभूषण विवरण',
                'purity' => 'कैरेट',
                'gross' => 'सकल वजन',
                'stone' => 'रत्न वजन',
                'net' => 'शुद्ध वजन',
                'rate' => 'दर/ग्राम',
                'making' => 'घड़ाई शुल्क (₹)',
                'total' => 'कुल (₹)',
                'subtotal' => 'कर योग्य मूल्य:',
                'cgst' => 'सीजीएसटी (१.५%):',
                'sgst' => 'एसजीएसटी (१.૫%):',
                'grand_total' => 'कुल देय राशि:',
                'auth_sign' => 'अधिकृत हस्ताक्षर',
            ],
        ];

        $l = $labels[$language] ?? $labels['en'];

        $itemsHtml = '';
        foreach ($invoice->items as $idx => $it) {
            $huidBadge = $it->huid ? "<br/><span style='font-size:10px; color:#56111C;'>HUID: <strong>{$it->huid}</strong></span>" : '';
            $itemsHtml .= "
                <tr>
                    <td style='padding:8px; border-bottom:1px solid #E5E7EB;'>".($idx + 1)."</td>
                    <td style='padding:8px; border-bottom:1px solid #E5E7EB;'><strong>{$it->item_name}</strong>{$huidBadge}</td>
                    <td style='padding:8px; border-bottom:1px solid #E5E7EB; text-align:center;'>{$it->purity_karat}</td>
                    <td style='padding:8px; border-bottom:1px solid #E5E7EB; text-align:right;'>".number_format($it->gross_weight, 3)."g</td>
                    <td style='padding:8px; border-bottom:1px solid #E5E7EB; text-align:right;'>".number_format($it->stone_weight, 3)."g</td>
                    <td style='padding:8px; border-bottom:1px solid #E5E7EB; text-align:right;'><strong>".number_format($it->net_weight, 3)."g</strong></td>
                    <td style='padding:8px; border-bottom:1px solid #E5E7EB; text-align:right;'>₹".number_format($it->rate_per_gram, 2)."</td>
                    <td style='padding:8px; border-bottom:1px solid #E5E7EB; text-align:right;'>₹".number_format($it->making_charges, 2)."</td>
                    <td style='padding:8px; border-bottom:1px solid #E5E7EB; text-align:right;'><strong>₹".number_format($it->total_amount, 2)."</strong></td>
                </tr>
            ";
        }

        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'/>
            <title>{$l['title']} - {$invoice->invoice_number}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1F2937; margin:0; padding:24px; background:#fff; font-size:12px; }
                .invoice-box { max-width:800px; margin:auto; border:1px solid #E5E7EB; padding:24px; border-radius:8px; }
                .header-table { width:100%; border-bottom:2px solid #56111C; padding-bottom:16px; margin-bottom:16px; }
                .brand-title { font-size:24px; font-weight:bold; color:#380810; font-family:serif; letter-spacing:1px; }
                .tax-title { font-size:16px; font-weight:bold; color:#D4AF37; text-align:right; }
                .items-table { width:100%; border-collapse:collapse; margin-top:16px; font-size:11px; }
                .items-table th { background:#FAF8F5; color:#56111C; padding:8px; border-bottom:2px solid #D4AF37; text-align:left; }
                .totals-box { margin-top:16px; width:45%; margin-left:auto; font-size:12px; }
                .totals-box table { width:100%; }
                .totals-box td { padding:4px 0; }
                .grand-total-row { font-size:14px; font-weight:bold; color:#380810; border-top:2px solid #56111C; border-bottom:2px solid #56111C; }
                .footer-box { margin-top:32px; border-top:1px solid #E5E7EB; padding-top:16px; display:flex; justify-content:space-between; align-items:flex-end; }
                @media print {
                    body { padding:0; }
                    .invoice-box { border:none; padding:0; }
                }
            </style>
        </head>
        <body>
            <div class='invoice-box'>
                <table class='header-table'>
                    <tr>
                        <td style='vertical-align:top;'>
                            <div class='brand-title'>{$tenant->name}</div>
                            <div style='font-size:11px; color:#4B5563; margin-top:4px;'>
                                {$branch->address}, {$branch->city}, {$branch->state} - {$branch->pincode}<br/>
                                Phone: {$branch->phone} | Email: {$tenant->email}<br/>
                                <strong>GSTIN: {$tenant->gstin}</strong> | PAN: {$tenant->pan}
                            </div>
                        </td>
                        <td style='text-align:right; vertical-align:top;'>
                            <div class='tax-title'>{$l['title']}</div>
                            <div style='font-size:10px; color:#059669; font-weight:bold; margin-top:2px;'>{$l['huid_label']}</div>
                            <div style='margin-top:8px; font-size:11px;'>
                                <strong>{$l['invoice_no']}</strong> {$invoice->invoice_number}<br/>
                                <strong>{$l['date']}</strong> {$invoice->invoice_date}<br/>
                                <strong>Branch:</strong> {$branch->name}
                            </div>
                        </td>
                    </tr>
                </table>

                <div style='background:#FAF8F5; padding:10px 14px; border-radius:6px; margin-bottom:16px;'>
                    <span style='font-size:11px; font-weight:bold; color:#56111C;'>{$l['bill_to']}</span>
                    <div style='font-size:12px; margin-top:2px;'>
                        <strong>" . ($customer ? $customer->name : 'Walk-in Patron') . "</strong> | 
                        Phone: " . ($customer ? $customer->phone : 'N/A') . " | 
                        PAN/Aadhaar: " . ($customer && $customer->pan ? $customer->pan : 'Verified') . "
                    </div>
                </div>

                <table class='items-table'>
                    <thead>
                        <tr>
                            <th style='width:30px;'>#</th>
                            <th>{$l['item_desc']}</th>
                            <th style='text-align:center;'>{$l['purity']}</th>
                            <th style='text-align:right;'>{$l['gross']}</th>
                            <th style='text-align:right;'>{$l['stone']}</th>
                            <th style='text-align:right;'>{$l['net']}</th>
                            <th style='text-align:right;'>{$l['rate']}</th>
                            <th style='text-align:right;'>{$l['making']}</th>
                            <th style='text-align:right;'>{$l['total']}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {$itemsHtml}
                    </tbody>
                </table>

                <div class='totals-box'>
                    <table>
                        <tr>
                            <td>{$l['subtotal']}</td>
                            <td style='text-align:right;'>₹".number_format($invoice->subtotal, 2)."</td>
                        </tr>
                        <tr>
                            <td style='color:#059669;'>{$l['cgst']}</td>
                            <td style='text-align:right; color:#059669;'>₹".number_format($invoice->cgst_amount, 2)."</td>
                        </tr>
                        <tr>
                            <td style='color:#059669;'>{$l['sgst']}</td>
                            <td style='text-align:right; color:#059669;'>₹".number_format($invoice->sgst_amount, 2)."</td>
                        </tr>
                        <tr>
                            <td>Round Off:</td>
                            <td style='text-align:right;'>₹".number_format($invoice->round_off, 2)."</td>
                        </tr>
                        <tr class='grand-total-row'>
                            <td style='padding:8px 0;'>{$l['grand_total']}</td>
                            <td style='padding:8px 0; text-align:right;'>₹".number_format($invoice->grand_total, 2)."</td>
                        </tr>
                    </table>
                </div>

                <div class='footer-box'>
                    <div style='font-size:10px; color:#6B7280; max-width:400px;'>
                        <strong>Terms & Conditions:</strong><br/>
                        1. All gold articles are 100% BIS Hallmarked according to Govt. of India standards.<br/>
                        2. Old gold buyback/exchange based on daily prevailing board rate subject to purity test.<br/>
                        3. Subject to Surat jurisdiction. Computer generated invoice.
                    </div>
                    <div style='text-align:center;'>
                        <div style='height:40px;'></div>
                        <div style='border-top:1px dashed #9CA3AF; padding-top:4px; font-weight:bold; font-size:11px;'>
                            {$l['auth_sign']}<br/>
                            <span style='font-size:9px; font-weight:normal; color:#6B7280;'>For {$tenant->name}</span>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
        ";
    }

    /**
     * Render 3-inch (80mm) Thermal POS Receipt (Continuous Roll for Point of Sale)
     */
    public function renderThermalReceipt(Invoice $invoice): string
    {
        $tenant = $invoice->tenant;
        $branch = $invoice->branch;

        $itemsRows = '';
        foreach ($invoice->items as $it) {
            $itemsRows .= "
                <div style='display:flex; justify-content:space-between; font-size:10px; margin-bottom:2px;'>
                    <span>{$it->item_name} ({$it->purity_karat})</span>
                    <span>₹" . number_format($it->total_amount, 2) . "</span>
                </div>
                <div style='font-size:9px; color:#555; margin-bottom:4px;'>
                    Net: " . number_format($it->net_weight, 3) . "g @ ₹" . number_format($it->rate_per_gram, 2) . " | HUID: " . ($it->huid ?? 'N/A') . "
                </div>
            ";
        }

        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'/>
            <title>Receipt {$invoice->invoice_number}</title>
            <style>
                body { font-family: monospace; font-size: 11px; width: 78mm; margin: 0 auto; padding: 6px; }
                .center { text-align: center; }
                .divider { border-top: 1px dashed #000; margin: 6px 0; }
                .row { display: flex; justify-content: space-between; }
                @media print { body { width: 78mm; padding:0; } }
            </style>
        </head>
        <body>
            <div class='center'>
                <strong style='font-size:13px;'>{$tenant->name}</strong><br/>
                {$branch->name}<br/>
                Phone: {$branch->phone}<br/>
                GSTIN: {$tenant->gstin}
            </div>
            <div class='divider'></div>
            <div class='row'>
                <span>Bill: {$invoice->invoice_number}</span>
                <span>Date: {$invoice->invoice_date}</span>
            </div>
            <div class='row'>
                <span>Customer: " . ($invoice->customer ? $invoice->customer->name : 'Walk-in') . "</span>
            </div>
            <div class='divider'></div>
            {$itemsRows}
            <div class='divider'></div>
            <div class='row'><span>Taxable Subtotal:</span><span>₹" . number_format($invoice->subtotal, 2) . "</span></div>
            <div class='row'><span>GST 3% (1.5%+1.5%):</span><span>₹" . number_format($invoice->cgst_amount + $invoice->sgst_amount, 2) . "</span></div>
            <div class='row' style='font-weight:bold; font-size:13px;'><span>TOTAL PAID:</span><span>₹" . number_format($invoice->grand_total, 2) . "</span></div>
            <div class='divider'></div>
            <div class='center' style='font-size:9px;'>
                BIS Hallmarked Gold with HUID<br/>
                Thank You for Visiting Chandarkant Jewellers!
            </div>
        </body>
        </html>
        ";
    }
}
