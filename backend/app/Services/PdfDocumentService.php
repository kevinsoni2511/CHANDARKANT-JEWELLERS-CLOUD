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
                @page {
                    size: A4 portrait;
                    margin: 10mm;
                }
                * { box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; 
                    color: #111318; 
                    margin: 0; 
                    padding: 12px; 
                    background: #F6F5F1; 
                    font-size: 11px; 
                }
                .invoice-outer-frame {
                    background: #FFFFFF;
                    border: 2px solid #C9A34A;
                    border-radius: 12px;
                    padding: 6px;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
                    max-width: 820px;
                    margin: 0 auto;
                }
                .invoice-inner-frame {
                    border: 1px solid rgba(201, 163, 74, 0.4);
                    border-radius: 8px;
                    padding: 22px;
                    position: relative;
                }
                .header-table { 
                    width: 100%; 
                    border-bottom: 2px solid #C9A34A; 
                    padding-bottom: 14px; 
                    margin-bottom: 14px; 
                }
                .brand-badge {
                    display: inline-block;
                    background: linear-gradient(135deg, #DFBE6F 0%, #C9A34A 100%);
                    color: #111318;
                    font-weight: 900;
                    font-size: 11px;
                    padding: 2px 7px;
                    border-radius: 4px;
                    margin-right: 6px;
                }
                .brand-title { 
                    font-size: 22px; 
                    font-weight: 800; 
                    color: #111318; 
                    font-family: Georgia, 'Times New Roman', serif; 
                    letter-spacing: 0.5px; 
                }
                .tax-title { 
                    font-size: 14px; 
                    font-weight: 800; 
                    color: #92400e; 
                    text-align: right; 
                    letter-spacing: 0.5px;
                }
                .huid-pill {
                    font-size: 10px;
                    color: #15803d;
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    padding: 2px 6px;
                    border-radius: 4px;
                    display: inline-block;
                    font-weight: 700;
                    margin-top: 4px;
                }
                .meta-table {
                    width: 100%;
                    background: #FAF9F5;
                    border: 1px solid #E3DFD7;
                    border-radius: 6px;
                    padding: 10px 14px;
                    margin-bottom: 14px;
                }
                .meta-table td {
                    vertical-align: top;
                }
                .items-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 8px; 
                    font-size: 10.5px; 
                }
                .items-table th { 
                    background: #FAF9F5; 
                    color: #111318; 
                    padding: 7px 8px; 
                    border-top: 1px solid #E3DFD7;
                    border-bottom: 2px solid #C9A34A; 
                    text-align: left; 
                    font-weight: 700;
                }
                .totals-box { 
                    margin-top: 14px; 
                    width: 48%; 
                    margin-left: auto; 
                    font-size: 11px; 
                }
                .totals-box table { width: 100%; border-collapse: collapse; }
                .totals-box td { padding: 4px 6px; }
                .grand-total-row { 
                    font-size: 13px; 
                    font-weight: 800; 
                    color: #111318; 
                    background: #FAF9F5;
                    border-top: 2px solid #C9A34A; 
                    border-bottom: 2px solid #C9A34A; 
                }
                .footer-box { 
                    margin-top: 24px; 
                    border-top: 1px solid #E3DFD7; 
                    padding-top: 14px; 
                }
                @media print {
                    body { 
                        padding: 0; 
                        background: #FFFFFF; 
                    }
                    .invoice-outer-frame { 
                        border: 2px solid #C9A34A !important; 
                        box-shadow: none !important; 
                        max-width: 100% !important; 
                        padding: 4px !important;
                    }
                }
            </style>
        </head>
        <body>
            <div class='invoice-outer-frame'>
                <div class='invoice-inner-frame'>
                    <table class='header-table'>
                        <tr>
                            <td style='vertical-align:top; width:65%;'>
                                <div style='display:flex; align-items:center;'>
                                    <span class='brand-badge'>&#10022;</span>
                                    <span class='brand-title'>{$tenant->name}</span>
                                </div>
                                <div style='font-size:10.5px; color:#4B5563; margin-top:4px; line-height:1.4;'>
                                    {$branch->address}, {$branch->city}, {$branch->state} - {$branch->pincode}<br/>
                                    Phone: {$branch->phone} | Email: {$tenant->email}<br/>
                                    <strong>GSTIN:</strong> {$tenant->gstin} &bull; <strong>PAN:</strong> {$tenant->pan}
                                </div>
                            </td>
                            <td style='text-align:right; vertical-align:top; width:35%;'>
                                <div class='tax-title'>{$l['title']}</div>
                                <div class='huid-pill'>{$l['huid_label']}</div>
                                <div style='margin-top:6px; font-size:10.5px; line-height:1.4;'>
                                    <strong>{$l['invoice_no']}</strong> <span style='color:#92400e; font-weight:bold;'>{$invoice->invoice_number}</span><br/>
                                    <strong>{$l['date']}</strong> {$invoice->invoice_date}<br/>
                                    <strong>Branch:</strong> {$branch->name}
                                </div>
                            </td>
                        </tr>
                    </table>

                    <table class='meta-table'>
                        <tr>
                            <td style='width:60%;'>
                                <span style='font-size:10px; font-weight:bold; color:#92400e; text-transform:uppercase; letter-spacing:0.5px;'>{$l['bill_to']}</span>
                                <div style='font-size:12px; font-weight:bold; color:#111318; margin-top:2px;'>
                                    " . ($customer ? htmlspecialchars($customer->name) : 'Walk-in Patron') . "
                                </div>
                                <div style='font-size:10.5px; color:#4B5563; margin-top:2px;'>
                                    Phone: " . ($customer && $customer->phone ? htmlspecialchars($customer->phone) : 'N/A') . " &bull; 
                                    PAN/Aadhaar: " . ($customer && $customer->pan ? htmlspecialchars($customer->pan) : 'Verified') . "
                                </div>
                            </td>
                            <td style='width:40%; text-align:right; font-size:10.5px; color:#4B5563; line-height:1.4;'>
                                <strong>Place of Supply:</strong> {$branch->state} (Code: 24)<br/>
                                <strong>Reverse Charge:</strong> No<br/>
                                <strong>Nature of Transaction:</strong> Retail Jewellery Sale
                            </td>
                        </tr>
                    </table>

                    <table class='items-table'>
                        <thead>
                            <tr>
                                <th style='width:24px;'>#</th>
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
                                <td style='text-align:right; font-weight:600;'>₹" . number_format($invoice->subtotal, 2) . "</td>
                            </tr>
                            <tr>
                                <td style='color:#15803d;'>{$l['cgst']}</td>
                                <td style='text-align:right; color:#15803d; font-weight:600;'>₹" . number_format($invoice->cgst_amount, 2) . "</td>
                            </tr>
                            <tr>
                                <td style='color:#15803d;'>{$l['sgst']}</td>
                                <td style='text-align:right; color:#15803d; font-weight:600;'>₹" . number_format($invoice->sgst_amount, 2) . "</td>
                            </tr>
                            " . ($invoice->round_off != 0 ? "
                            <tr>
                                <td style='color:#6B7280;'>Round Off:</td>
                                <td style='text-align:right; color:#6B7280;'>₹" . number_format($invoice->round_off, 2) . "</td>
                            </tr>" : "") . "
                            <tr class='grand-total-row'>
                                <td style='padding:6px 8px;'>{$l['grand_total']}</td>
                                <td style='padding:6px 8px; text-align:right; font-size:14px; font-weight:bold; color:#111318;'>₹" . number_format($invoice->grand_total, 2) . "</td>
                            </tr>
                        </table>
                    </div>

                    <div class='footer-box'>
                        <table style='width:100%;'>
                            <tr>
                                <td style='vertical-align:bottom; width:65%; font-size:9.5px; color:#6B7280; line-height:1.4;'>
                                    <strong style='color:#111318;'>Statutory BIS Hallmarking Terms:</strong><br/>
                                    1. All precious jewellery articles bear official BIS Hallmark logo and laser-inscribed 6-digit alphanumeric HUID.<br/>
                                    2. Purity of bullion & ornaments certified under Bureau of Indian Standards Act, 2016.<br/>
                                    3. Buyback / exchange calculated on prevailing daily board rate subject to automated caratometer test.<br/>
                                    4. Subject to Surat jurisdiction. Computer generated tax invoice.
                                </td>
                                <td style='vertical-align:bottom; width:35%; text-align:center;'>
                                    <div style='height:36px;'></div>
                                    <div style='border-top:1px dashed #9CA3AF; padding-top:4px; font-weight:bold; font-size:10.5px;'>
                                        {$l['auth_sign']}<br/>
                                        <span style='font-size:9px; font-weight:normal; color:#6B7280;'>For {$tenant->name}</span>
                                    </div>
                                </td>
                            </tr>
                        </table>
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
