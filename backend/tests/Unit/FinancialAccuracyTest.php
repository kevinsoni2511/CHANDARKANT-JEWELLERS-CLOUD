<?php

namespace Tests\Unit;

use App\Services\DecimalMathService;
use PHPUnit\Framework\TestCase;

class FinancialAccuracyTest extends TestCase
{
    protected DecimalMathService $math;

    protected function setUp(): void
    {
        parent::setUp();
        $this->math = new DecimalMathService();
    }

    public function test_gross_to_net_weight_with_stone_deduction(): void
    {
        // 15.450g gross - 1.250g CZ stone = 14.200g net
        $net = $this->math->calculateNetWeight('15.450', '1.250');
        $this->assertEquals('14.200', $net);

        // Zero stone weight
        $netZero = $this->math->calculateNetWeight('24.890', '0.000');
        $this->assertEquals('24.890', $netZero);
    }

    public function test_fine_gold_conversion_across_karats(): void
    {
        // 22K (91.666%): 10.000g net * 22/24 = 9.166g pure gold
        $fine22 = $this->math->calculatePureWeight('10.000', '22K');
        $this->assertEquals('9.166', $fine22);

        // 18K (75.00%): 10.000g net * 0.7500 = 7.500g pure gold
        $fine18 = $this->math->calculatePureWeight('10.000', '18K');
        $this->assertEquals('7.500', $fine18);

        // 24K (100.00% / 24/24): 10.000g net * 24/24 = 10.000g pure gold
        $fine24 = $this->math->calculatePureWeight('10.000', '24K');
        $this->assertEquals('10.000', $fine24);
    }

    public function test_metal_value_and_making_charges_accuracy(): void
    {
        // 14.200g @ ₹7,350.00/g = ₹104,370.00
        $metalValue = $this->math->calculateMetalValue('14.200', '7350.00');
        $this->assertEquals('104370.00', $metalValue);

        // Per gram making charges: 14.200g @ ₹650.00/g = ₹9,230.00
        $makingCharges = $this->math->calculateMakingCharges('14.200', 'per_gram', '650.00');
        $this->assertEquals('9230.00', $makingCharges);

        // Percentage making charges: 10% on ₹104,370.00 = ₹10,437.00
        $percentageMaking = $this->math->calculateMakingCharges('14.200', 'percentage', '10.00', $metalValue);
        $this->assertEquals('10437.00', $percentageMaking);
    }

    public function test_statutory_3_percent_gst_breakdown_intra_and_inter_state(): void
    {
        $taxableAmount = '113600.00'; // ₹104,370 + ₹9,230

        // Intra-state (Gujarat to Gujarat): 1.5% CGST + 1.5% SGST = ₹1,704.00 + ₹1,704.00 = ₹3,408.00
        $intraGst = $this->math->calculateGst($taxableAmount, true);
        $this->assertEquals('1704.00', $intraGst['cgst']);
        $this->assertEquals('1704.00', $intraGst['sgst']);
        $this->assertEquals('0.00', $intraGst['igst']);
        $this->assertEquals('3408.00', $intraGst['total_gst']);

        // Inter-state (Gujarat to Maharashtra): 3.0% IGST = ₹3,408.00
        $interGst = $this->math->calculateGst($taxableAmount, false);
        $this->assertEquals('0.00', $interGst['cgst']);
        $this->assertEquals('0.00', $interGst['sgst']);
        $this->assertEquals('3408.00', $interGst['igst']);
        $this->assertEquals('3408.00', $interGst['total_gst']);
    }

    public function test_nearest_rupee_round_off(): void
    {
        // 117008.40 -> rounded: 117008.00, diff: -0.40
        $roundDown = $this->math->calculateRoundOff('117008.40');
        $this->assertEquals('117008.00', $roundDown['rounded_amount']);
        $this->assertEquals('-0.40', $roundDown['round_off']);

        // 117008.65 -> rounded: 117009.00, diff: +0.35
        $roundUp = $this->math->calculateRoundOff('117008.65');
        $this->assertEquals('117009.00', $roundUp['rounded_amount']);
        $this->assertEquals('0.35', $roundUp['round_off']);
    }

    public function test_old_gold_exchange_offset(): void
    {
        // Gross sale: ₹117,008.00
        // Customer gives old 20K gold: 5.000g net @ ₹6,500.00 = ₹32,500.00
        // Net payable = ₹117,008.00 - ₹32,500.00 = ₹84,508.00
        $grossSale = '117008.00';
        $oldGoldValuation = bcmul('5.000', '6500.00', 2);
        $netPayable = bcsub($grossSale, $oldGoldValuation, 2);

        $this->assertEquals('32500.00', $oldGoldValuation);
        $this->assertEquals('84508.00', $netPayable);
    }
}
