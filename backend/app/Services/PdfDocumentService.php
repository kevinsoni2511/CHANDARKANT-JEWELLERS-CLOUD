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

        $wordsAmount = $this->numberToIndianWords((float)$invoice->grand_total);

        $itemsHtml = '';
        foreach ($invoice->items as $idx => $it) {
            $huidBadge = $it->huid ? "<div style='font-size:9px; font-family:monospace; color:#92400e; margin-top:2px;'>HUID: <strong>{$it->huid}</strong></div>" : '';
            $itemsHtml .= "
                <tr>
                    <td style='padding:5px 6px; border-bottom:1px solid #E5E7EB; border-right:1px solid #F3F4F6; text-align:center;'>".($idx + 1)."</td>
                    <td style='padding:5px 6px; border-bottom:1px solid #E5E7EB; border-right:1px solid #F3F4F6;'>
                        <strong>{$it->item_name}</strong>
                        {$huidBadge}
                    </td>
                    <td style='padding:5px 6px; border-bottom:1px solid #E5E7EB; border-right:1px solid #F3F4F6; text-align:center; font-family:monospace; color:#4B5563;'>7113</td>
                    <td style='padding:5px 6px; border-bottom:1px solid #E5E7EB; border-right:1px solid #F3F4F6; text-align:center; font-weight:bold; color:#92400e;'>{$it->purity_karat}</td>
                    <td style='padding:5px 6px; border-bottom:1px solid #E5E7EB; border-right:1px solid #F3F4F6; text-align:right; font-family:monospace;'>".number_format($it->gross_weight, 3)."g</td>
                    <td style='padding:5px 6px; border-bottom:1px solid #E5E7EB; border-right:1px solid #F3F4F6; text-align:right; font-family:monospace;'>".number_format($it->stone_weight, 3)."g</td>
                    <td style='padding:5px 6px; border-bottom:1px solid #E5E7EB; border-right:1px solid #F3F4F6; text-align:right; font-family:monospace; font-weight:bold;'>".number_format($it->net_weight, 3)."g</td>
                    <td style='padding:5px 6px; border-bottom:1px solid #E5E7EB; border-right:1px solid #F3F4F6; text-align:right; font-family:monospace;'>₹".number_format($it->rate_per_gram, 2)."</td>
                    <td style='padding:5px 6px; border-bottom:1px solid #E5E7EB; border-right:1px solid #F3F4F6; text-align:right; font-family:monospace;'>₹".number_format($it->making_charges, 2)."</td>
                    <td style='padding:5px 6px; border-bottom:1px solid #E5E7EB; text-align:right; font-family:monospace; font-weight:bold;'>₹".number_format($it->total_amount, 2)."</td>
                </tr>
            ";
        }

        return "
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='utf-8'/>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'/>
            <title>{$l['title']} - {$invoice->invoice_number}</title>
            <style>
                @page {
                    size: A4 portrait;
                    margin: 8mm;
                }
                * { box-sizing: border-box; }
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
                    color: #111318; 
                    margin: 0; 
                    padding: 0; 
                    background: #EAE8E3; 
                    font-size: 10.5px; 
                    line-height: 1.35;
                }

                /* Screen Toolbar */
                .screen-toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    background: #111318;
                    color: #F6F5F1;
                    padding: 10px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    font-size: 12px;
                }
                .btn-print {
                    background: linear-gradient(135deg, #DFBE6F 0%, #C9A34A 100%);
                    color: #111318;
                    border: none;
                    border-radius: 6px;
                    padding: 7px 16px;
                    font-weight: 700;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }
                .btn-print:hover { opacity: 0.92; }
                .lang-link {
                    color: #C9A34A;
                    text-decoration: none;
                    margin: 0 6px;
                    font-size: 11px;
                    font-weight: 600;
                }
                .lang-link:hover { text-decoration: underline; }
                .lang-link.active {
                    color: #FFFFFF;
                    background: #C9A34A;
                    padding: 2px 6px;
                    border-radius: 4px;
                }

                /* A4 Document Canvas Frame */
                .sheet-canvas {
                    max-width: 194mm;
                    margin: 16px auto;
                    background: #FFFFFF;
                }

                .invoice-outer-frame {
                    background: #FFFFFF;
                    border: 2px solid #C9A34A;
                    border-radius: 8px;
                    padding: 4px;
                    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
                }

                .invoice-inner-frame {
                    border: 1px solid rgba(201, 163, 74, 0.45);
                    border-radius: 6px;
                    padding: 16px 18px;
                    background: #FFFFFF;
                    position: relative;
                }

                .header-table { 
                    width: 100%; 
                    border-bottom: 2px solid #C9A34A; 
                    padding-bottom: 10px; 
                    margin-bottom: 10px; 
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
                    font-size: 20px; 
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
                    font-size: 9.5px;
                    color: #15803d;
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    padding: 2px 6px;
                    border-radius: 4px;
                    display: inline-block;
                    font-weight: 700;
                    margin-top: 3px;
                }
                .meta-table {
                    width: 100%;
                    background: #FAF9F5;
                    border: 1px solid #E3DFD7;
                    border-radius: 6px;
                    padding: 8px 12px;
                    margin-bottom: 10px;
                }
                .meta-table td { vertical-align: top; }

                .items-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 6px; 
                    border: 1px solid #E5E7EB;
                    font-size: 10px; 
                }
                .items-table th { 
                    background: #FAF9F5; 
                    color: #111318; 
                    padding: 6px 8px; 
                    border-top: 1px solid #E3DFD7;
                    border-bottom: 2px solid #C9A34A; 
                    border-right: 1px solid #E5E7EB;
                    text-align: left; 
                    font-weight: 700;
                }
                .totals-box { 
                    margin-top: 8px; 
                    width: 45%; 
                    margin-left: auto; 
                    font-size: 10.5px; 
                }
                .totals-box table { width: 100%; border-collapse: collapse; }
                .totals-box td { padding: 3px 6px; }
                .grand-total-row { 
                    font-size: 12.5px; 
                    font-weight: 800; 
                    color: #111318; 
                    background: #FAF5E8;
                    border-top: 2px solid #C9A34A; 
                    border-bottom: 2px solid #C9A34A; 
                }
                .footer-box { 
                    margin-top: 12px; 
                    border-top: 1px solid #E3DFD7; 
                    padding-top: 10px; 
                }

                @media print {
                    body { 
                        padding: 0 !important; 
                        margin: 0 !important;
                        background: #FFFFFF !important; 
                    }
                    .screen-toolbar { 
                        display: none !important; 
                    }
                    .sheet-canvas {
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .invoice-outer-frame { 
                        border: 2px solid #C9A34A !important; 
                        box-shadow: none !important; 
                        width: 100% !important; 
                        max-width: 100% !important; 
                        margin: 0 !important;
                        padding: 4px !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Interactive Floating Print Toolbar -->
            <div class='screen-toolbar'>
                <div style='display:flex; align-items:center; gap:8px;'>
                    <span style='color:#C9A34A; font-weight:bold;'>&#10022; Chandarkant Jewellers</span>
                    <span style='color:#8E929E;'>|</span>
                    <span style='font-size:11px; color:#A1A1AA;'>Tax Invoice: {$invoice->invoice_number}</span>
                </div>
                <div style='display:flex; align-items:center; gap:12px;'>
                    <div>
                        <span style='color:#A1A1AA; font-size:11px;'>Language:</span>
                        <a href='?format=a4&lang=en' class='lang-link " . ($language === 'en' ? 'active' : '') . "'>EN</a>
                        <a href='?format=a4&lang=gu' class='lang-link " . ($language === 'gu' ? 'active' : '') . "'>ગુજરાતી</a>
                        <a href='?format=a4&lang=hi' class='lang-link " . ($language === 'hi' ? 'active' : '') . "'>हिन्दी</a>
                    </div>
                    <a href='?format=thermal' style='color:#C9A34A; text-decoration:none; font-size:11px; margin-right:8px;'>&#9642; 80mm Thermal</a>
                    <button onclick='window.print()' class='btn-print'>
                        &#128424; Print / Save PDF
                    </button>
                    <button onclick='window.close()' style='background:#27272A; color:#E4E4E7; border:none; border-radius:6px; padding:7px 12px; cursor:pointer;'>
                        Close
                    </button>
                </div>
            </div>

            <!-- Single-Sheet A4 Frame Canvas -->
            <div class='sheet-canvas'>
                <div class='invoice-outer-frame'>
                    <div class='invoice-inner-frame'>
                        <table class='header-table'>
                            <tr>
                                <td style='vertical-align:top; width:65%;'>
                                    <div style='display:flex; align-items:center;'>
                                        <span class='brand-badge'>&#10022;</span>
                                        <span class='brand-title'>{$tenant->name}</span>
                                    </div>
                                    <div style='font-size:10px; color:#4B5563; margin-top:3px; line-height:1.4;'>
                                        {$branch->address}, {$branch->city}, {$branch->state} - {$branch->pincode}<br/>
                                        Phone: {$branch->phone} | Email: {$tenant->email}<br/>
                                        <strong>GSTIN:</strong> {$tenant->gstin} &bull; <strong>PAN:</strong> {$tenant->pan} &bull; <strong>State Code:</strong> 24 (Gujarat)
                                    </div>
                                </td>
                                <td style='text-align:right; vertical-align:top; width:35%;'>
                                    <div class='tax-title'>{$l['title']}</div>
                                    <div style='font-size:9px; color:#6B7280; text-transform:uppercase; letter-spacing:0.5px;'>Original for Recipient &bull; Rule 46 CGST</div>
                                    <div class='huid-pill'>{$l['huid_label']}</div>
                                    <div style='margin-top:4px; font-size:10px; line-height:1.4;'>
                                        <strong>{$l['invoice_no']}</strong> <span style='color:#92400e; font-weight:bold;'>{$invoice->invoice_number}</span><br/>
                                        <strong>{$l['date']}</strong> {$invoice->invoice_date}<br/>
                                        <strong>Showroom:</strong> {$branch->name}
                                    </div>
                                </td>
                            </tr>
                        </table>

                        <table class='meta-table'>
                            <tr>
                                <td style='width:55%;'>
                                    <span style='font-size:9.5px; font-weight:bold; color:#92400e; text-transform:uppercase; letter-spacing:0.5px;'>{$l['bill_to']}</span>
                                    <div style='font-size:11.5px; font-weight:bold; color:#111318; margin-top:1px;'>
                                        " . ($customer ? htmlspecialchars($customer->name) : 'Walk-in Patron') . "
                                    </div>
                                    <div style='font-size:10px; color:#4B5563; margin-top:2px;'>
                                        Phone: " . ($customer && $customer->phone ? htmlspecialchars($customer->phone) : 'N/A') . " &bull; 
                                        PAN/Aadhaar: " . ($customer && $customer->pan ? htmlspecialchars($customer->pan) : 'Verified') . "
                                    </div>
                                </td>
                                <td style='width:45%; text-align:right; font-size:10px; color:#4B5563; line-height:1.4;'>
                                    <strong>Place of Supply:</strong> {$branch->state} (State Code: 24)<br/>
                                    <strong>Reverse Charge:</strong> No &bull; <strong>Transaction:</strong> Retail Jewellery Sale<br/>
                                    <strong>Payment Mode:</strong> Cash / Bank / UPI
                                </td>
                            </tr>
                        </table>

                        <table class='items-table'>
                            <thead>
                                <tr>
                                    <th style='width:24px; text-align:center;'>#</th>
                                    <th>{$l['item_desc']}</th>
                                    <th style='width:38px; text-align:center;'>HSN</th>
                                    <th style='width:42px; text-align:center;'>{$l['purity']}</th>
                                    <th style='width:55px; text-align:right;'>{$l['gross']}</th>
                                    <th style='width:52px; text-align:right;'>{$l['stone']}</th>
                                    <th style='width:55px; text-align:right;'>{$l['net']}</th>
                                    <th style='width:58px; text-align:right;'>{$l['rate']}</th>
                                    <th style='width:55px; text-align:right;'>{$l['making']}</th>
                                    <th style='width:70px; text-align:right;'>{$l['total']}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {$itemsHtml}
                            </tbody>
                        </table>

                        <div style='display:flex; justify-content:space-between; margin-top:8px;'>
                            <!-- Amount in words & Bank info -->
                            <div style='width:52%; font-size:9.5px; color:#4B5563; line-height:1.45;'>
                                <div style='background:#FAF9F5; border:1px solid #E3DFD7; border-radius:4px; padding:6px 8px; margin-bottom:6px;'>
                                    <strong style='color:#111318;'>Amount in Words:</strong><br/>
                                    <span style='color:#92400e; font-weight:600;'>{$wordsAmount}</span>
                                </div>
                                <div style='font-size:9px;'>
                                    <strong>NEFT / RTGS Details:</strong> Bank of Baroda &bull; A/C: 24000100012345 &bull; IFSC: BARB0VARSUR<br/>
                                    <strong>BIS Hallmark Guarantee:</strong> 100% genuine hallmarked bullion tested to Govt. standards.
                                </div>
                            </div>

                            <!-- Totals Box -->
                            <div class='totals-box' style='width:44%; margin-top:0;'>
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
                                        <td style='padding:5px 6px;'>{$l['grand_total']}</td>
                                        <td style='padding:5px 6px; text-align:right; font-size:13px; font-weight:bold; color:#111318;'>₹" . number_format($invoice->grand_total, 2) . "</td>
                                    </tr>
                                </table>
                            </div>
                        </div>

                        <div class='footer-box'>
                            <table style='width:100%;'>
                                <tr>
                                    <td style='vertical-align:bottom; width:65%; font-size:9px; color:#6B7280; line-height:1.35;'>
                                        <strong style='color:#111318;'>Terms & Conditions:</strong><br/>
                                        1. All gold articles are 100% BIS Hallmarked bearing official 6-digit laser HUID.<br/>
                                        2. Exchange / buyback valuation calculated based on daily prevailing bullion board rate.<br/>
                                        3. Subject to Surat jurisdiction. Computer generated tax invoice under CGST Act, 2017.
                                    </td>
                                    <td style='vertical-align:bottom; width:35%; text-align:center;'>
                                        <div style='height:30px;'></div>
                                        <div style='border-top:1px dashed #9CA3AF; padding-top:4px; font-weight:bold; font-size:10px;'>
                                            {$l['auth_sign']}<br/>
                                            <span style='font-size:8.5px; font-weight:normal; color:#6B7280;'>For {$tenant->name}</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <script>
                // Auto trigger print when requested without blocking toolbar
                if (window.location.search.includes('autoprint=1')) {
                    window.onload = function() {
                        setTimeout(function() { window.print(); }, 400);
                    };
                }
            </script>
        </body>
        </html>
        ";
    }

    /**
     * Convert numbers to Indian Rupees Words
     */
    public function numberToIndianWords(float $number): string
    {
        $no = floor($number);
        $point = round($number - $no, 2) * 100;
        $digits_1 = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        $digits_2 = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        
        $str = [];
        $words = [
            10000000 => 'Crore',
            100000 => 'Lakh',
            1000 => 'Thousand',
            100 => 'Hundred',
        ];
        
        foreach ($words as $val => $word) {
            if ($no >= $val) {
                $div = floor($no / $val);
                $no %= $val;
                if ($div >= 20) {
                    $str[] = $digits_2[floor($div / 10)] . ' ' . $digits_1[$div % 10] . ' ' . $word;
                } elseif ($div > 0) {
                    $str[] = $digits_1[$div] . ' ' . $word;
                }
            }
        }
        
        if ($no >= 20) {
            $str[] = $digits_2[floor($no / 10)] . ' ' . $digits_1[$no % 10];
        } elseif ($no > 0) {
            $str[] = $digits_1[$no];
        }
        
        $result = trim(preg_replace('/\s+/', ' ', implode(' ', $str)));
        if (empty($result)) {
            $result = 'Zero';
        }
        
        $paisaStr = '';
        if ($point > 0) {
            $paisaStr = ' and ' . ($point < 20 ? $digits_1[$point] : $digits_2[floor($point / 10)] . ' ' . $digits_1[$point % 10]) . ' Paise';
        }
        
        return 'INR ' . $result . $paisaStr . ' Only';
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
                <div style='display:flex; justify-content:space-between; font-size:10.5px; margin-bottom:2px;'>
                    <span style='font-weight:600;'>{$it->item_name} ({$it->purity_karat})</span>
                    <span style='font-weight:700;'>₹" . number_format($it->total_amount, 2) . "</span>
                </div>
                <div style='font-size:9.5px; color:#444; margin-bottom:5px; padding-left:4px;'>
                    Net: " . number_format($it->net_weight, 3) . "g @ ₹" . number_format($it->rate_per_gram, 2) . " | HUID: " . ($it->huid ?? 'N/A') . "
                </div>
            ";
        }

        $paymentsHtml = '';
        if ($invoice->payments && count($invoice->payments) > 0) {
            foreach ($invoice->payments as $pm) {
                $paymentsHtml .= "<div class='row' style='font-size:10px; color:#444;'><span>Payment (" . strtoupper($pm->payment_mode) . "):</span><span>₹" . number_format($pm->amount, 2) . "</span></div>";
            }
        }

        return "
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='utf-8'/>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'/>
            <title>Thermal Receipt - {$invoice->invoice_number}</title>
            <style>
                * { box-sizing: border-box; }
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Courier New', monospace; 
                    font-size: 11px; 
                    background: #111318; 
                    margin: 0; 
                    padding: 0; 
                    color: #111318;
                }
                .screen-toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    background: #181A22;
                    color: #F6F5F1;
                    padding: 10px 18px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: 0 4px 14px rgba(0,0,0,0.4);
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                .btn-print {
                    background: linear-gradient(135deg, #DFBE6F 0%, #C9A34A 100%);
                    color: #111318;
                    border: none;
                    border-radius: 6px;
                    padding: 7px 16px;
                    font-weight: 700;
                    font-size: 11.5px;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }
                .btn-print:hover { opacity: 0.92; }
                .btn-sec {
                    background: rgba(255,255,255,0.08);
                    color: #F6F5F1;
                    border: 1px solid rgba(255,255,255,0.18);
                    border-radius: 6px;
                    padding: 7px 12px;
                    font-size: 11px;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }
                .btn-sec:hover { background: rgba(255,255,255,0.15); }

                .thermal-container {
                    padding: 24px 10px;
                    display: flex;
                    justify-content: center;
                }
                .thermal-paper {
                    width: 78mm;
                    background: #FFFFFF;
                    padding: 8mm 6mm;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
                    border-radius: 4px;
                    position: relative;
                    border-top: 3px solid #C9A34A;
                }
                .center { text-align: center; }
                .divider { border-top: 1px dashed #444; margin: 7px 0; }
                .row { display: flex; justify-content: space-between; align-items: baseline; }

                @media print {
                    .screen-toolbar { display: none !important; }
                    body { background: #FFFFFF !important; margin: 0 !important; padding: 0 !important; width: 78mm !important; }
                    .thermal-container { padding: 0 !important; }
                    .thermal-paper { 
                        width: 78mm !important; 
                        box-shadow: none !important; 
                        border: none !important; 
                        padding: 3mm 1mm !important; 
                    }
                }
            </style>
        </head>
        <body>
            <div class='screen-toolbar'>
                <div style='display:flex; align-items:center; gap:8px;'>
                    <span style='font-size:14px; font-weight:700; color:#C9A34A;'>CHANDARKANT JEWELLERS</span>
                    <span style='font-size:11px; color:#A6AAB6;'>• 3\" (80mm) POS Thermal Slip</span>
                </div>
                <div style='display:flex; align-items:center; gap:8px;'>
                    <a href='?format=a4' class='btn-sec'>📄 Switch to A4 Tax Invoice</a>
                    <button onclick='window.print()' class='btn-print'>🖨️ Print Thermal Slip</button>
                    <button onclick='window.close()' class='btn-sec' style='padding:7px 10px;'>✕</button>
                </div>
            </div>

            <div class='thermal-container'>
                <div class='thermal-paper'>
                    <div class='center'>
                        <div style='font-size:10px; font-weight:bold; letter-spacing:1px; color:#555;'>TAX INVOICE / CASH MEMO</div>
                        <strong style='font-size:15px; font-weight:800; letter-spacing:0.5px;'>{$tenant->name}</strong><br/>
                        <span style='font-size:10px; color:#333;'>{$branch->name}</span><br/>
                        <span style='font-size:9.5px; color:#555;'>{$branch->address}, {$branch->city}</span><br/>
                        <span style='font-size:9.5px;'>Phone: {$branch->phone}</span><br/>
                        <span style='font-size:9.5px; font-weight:bold;'>GSTIN: {$tenant->gstin}</span>
                    </div>
                    <div class='divider'></div>
                    <div class='row'>
                        <span><strong>Bill:</strong> {$invoice->invoice_number}</span>
                        <span>" . date('d/m/Y H:i', strtotime($invoice->created_at ?? $invoice->invoice_date)) . "</span>
                    </div>
                    <div class='row'>
                        <span><strong>Customer:</strong> " . ($invoice->customer ? $invoice->customer->name : 'Valued Patron') . "</span>
                        <span>" . ($invoice->customer ? $invoice->customer->phone : '') . "</span>
                    </div>
                    <div class='divider'></div>
                    <div style='font-size:9.5px; font-weight:bold; margin-bottom:4px; display:flex; justify-content:space-between;'>
                        <span>PARTICULARS</span>
                        <span>AMOUNT</span>
                    </div>
                    {$itemsRows}
                    <div class='divider'></div>
                    <div class='row'><span>Subtotal:</span><span>₹" . number_format($invoice->subtotal, 2) . "</span></div>
                    <div class='row'><span>GST 3% (1.5%+1.5%):</span><span>₹" . number_format($invoice->cgst_amount + $invoice->sgst_amount, 2) . "</span></div>
                    <div class='row' style='font-weight:800; font-size:13px; margin:4px 0; border-top:1px solid #111; border-bottom:1px solid #111; padding:3px 0;'>
                        <span>TOTAL PAID:</span>
                        <span>₹" . number_format($invoice->grand_total, 2) . "</span>
                    </div>
                    {$paymentsHtml}
                    <div class='divider'></div>
                    <div class='center' style='font-size:9.5px; line-height:1.4; color:#333;'>
                        <strong>BIS Hallmarked 100% Guaranteed</strong><br/>
                        6-Digit Laser Alphanumeric HUID Traceable<br/>
                        Thank you for shopping with us!
                    </div>
                </div>
            </div>
            <script>
                if (window.location.search.indexOf('autoprint=1') !== -1) {
                    setTimeout(function() { window.print(); }, 400);
                }
            </script>
        </body>
        </html>
        ";
    }
}
