<?php

namespace Tests\Unit;

use App\Services\DecimalMathService;
use PHPUnit\Framework\TestCase;

class DecimalMathServiceTest extends TestCase
{
    public function test_net_weight_calculation(): void
    {
        $gross = '15.650';
        $stone = '1.200';
        $net = DecimalMathService::netWeight($gross, $stone);

        $this->assertEquals('14.450', $net);
    }

    public function test_pure_gold_weight_for_22k(): void
    {
        // 22K = 22/24 = 0.916667
        // 10.000g of 22K net = 9.166g fine gold
        $net = '10.000';
        $pure = DecimalMathService::pureFineWeight($net, '22K');

        $this->assertEquals('9.166', $pure);
    }

    public function test_metal_value_multiplication(): void
    {
        $net = '10.500';
        $rate = '7250.00';
        $value = DecimalMathService::metalValue($net, $rate);

        $this->assertEquals('76125.00', $value);
    }

    public function test_making_charges_per_gram(): void
    {
        $gross = '12.000';
        $rate = '650.00';
        $charges = DecimalMathService::makingCharges('per_gram', $rate, $gross, '75000.00');

        $this->assertEquals('7800.00', $charges);
    }

    public function test_gst_breakdown_intra_state_3_percent(): void
    {
        $taxable = '100000.00';
        $gst = DecimalMathService::gstBreakdown($taxable, false);

        $this->assertEquals('1500.00', $gst['cgst_amount']);
        $this->assertEquals('1500.00', $gst['sgst_amount']);
        $this->assertEquals('0.00', $gst['igst_amount']);
        $this->assertEquals('3000.00', $gst['total_tax']);
    }

    public function test_gst_breakdown_inter_state_3_percent(): void
    {
        $taxable = '100000.00';
        $gst = DecimalMathService::gstBreakdown($taxable, true);

        $this->assertEquals('0.00', $gst['cgst_amount']);
        $this->assertEquals('0.00', $gst['sgst_amount']);
        $this->assertEquals('3000.00', $gst['igst_amount']);
        $this->assertEquals('3000.00', $gst['total_tax']);
    }

    public function test_round_off_nearest_rupee(): void
    {
        $amount = '54321.40';
        $res = DecimalMathService::roundOff($amount);

        $this->assertEquals('-0.40', $res['round_off']);
        $this->assertEquals('54321.00', $res['rounded_total']);
    }
}
