<?php

namespace App\Services;

class DecimalMathService
{
    /**
     * Compute Net Weight = Gross Weight - Stone Weight
     * Scale: 3 decimal places (e.g. 12.350 grams)
     */
    public static function netWeight(string|float $grossWeight, string|float $stoneWeight = 0.0): string
    {
        $gross = number_format((float) $grossWeight, 3, '.', '');
        $stone = number_format((float) $stoneWeight, 3, '.', '');
        $net = bcsub($gross, $stone, 3);
        return bccomp($net, '0.000', 3) < 0 ? '0.000' : $net;
    }

    /**
     * Compute Pure Fine Gold Weight from Karat
     * 24K = 1.000000, 22K = 22/24 (0.916667), 18K = 18/24 (0.750000), 14K = 14/24 (0.583333)
     */
    public static function purityFactor(string $purityKarat): string
    {
        $cleanKarat = strtoupper(trim(str_replace(['K', 'k', 'KT', 'kt'], '', $purityKarat)));
        $karatVal = (float) $cleanKarat;

        if ($karatVal <= 0.0) {
            return '0.916667'; // Default to 22K if unspecified
        }

        if ($karatVal > 24.0) {
            // Assume millesimal fineness e.g. 916 -> 0.916
            return bcdiv(number_format($karatVal, 3, '.', ''), '1000.0', 6);
        }

        return bcdiv(number_format($karatVal, 2, '.', ''), '24.0', 6);
    }

    /**
     * Calculate pure fine metal equivalent in grams
     */
    public static function pureFineWeight(string|float $netWeight, string $purityKarat): string
    {
        $net = number_format((float) $netWeight, 3, '.', '');
        $factor = self::purityFactor($purityKarat);
        return bcmul($net, $factor, 3);
    }

    /**
     * Calculate base metal value: Net Weight * Rate per gram
     */
    public static function metalValue(string|float $netWeight, string|float $ratePerGram): string
    {
        $net = number_format((float) $netWeight, 3, '.', '');
        $rate = number_format((float) $ratePerGram, 2, '.', '');
        return bcmul($net, $rate, 2);
    }

    /**
     * Calculate wastage weight and wastage charge
     */
    public static function wastage(string|float $netWeight, string|float $wastagePercent, string|float $ratePerGram): array
    {
        $net = number_format((float) $netWeight, 3, '.', '');
        $pct = number_format((float) $wastagePercent, 2, '.', '');
        $rate = number_format((float) $ratePerGram, 2, '.', '');

        $pctFraction = bcdiv($pct, '100.0', 4);
        $wastageWeight = bcmul($net, $pctFraction, 3);
        $wastageAmount = bcmul($wastageWeight, $rate, 2);

        return [
            'weight' => $wastageWeight,
            'amount' => $wastageAmount,
        ];
    }

    /**
     * Calculate making charges
     * Strategies: 'per_gram', 'fixed', 'percentage'
     */
    public static function makingCharges(
        string $strategy,
        string|float $rateOrAmount,
        string|float $grossWeight,
        string|float $metalValue
    ): string {
        $rate = number_format((float) $rateOrAmount, 2, '.', '');
        $gross = number_format((float) $grossWeight, 3, '.', '');
        $metal = number_format((float) $metalValue, 2, '.', '');

        return match ($strategy) {
            'fixed' => $rate,
            'percentage' => bcmul($metal, bcdiv($rate, '100.0', 4), 2),
            default => bcmul($gross, $rate, 2), // 'per_gram' uses gross weight as per Indian bullion practice
        };
    }

    /**
     * Calculate pre-tax item total
     */
    public static function itemTotal(
        string|float $metalValue,
        string|float $makingCharges,
        string|float $wastageAmount = 0.0,
        string|float $stoneCharges = 0.0
    ): string {
        $mv = number_format((float) $metalValue, 2, '.', '');
        $mc = number_format((float) $makingCharges, 2, '.', '');
        $wa = number_format((float) $wastageAmount, 2, '.', '');
        $sc = number_format((float) $stoneCharges, 2, '.', '');

        $sum1 = bcadd($mv, $mc, 2);
        $sum2 = bcadd($sum1, $wa, 2);
        return bcadd($sum2, $sc, 2);
    }

    /**
     * Calculate GST breakdown: 3% (1.5% CGST + 1.5% SGST or 3.0% IGST)
     */
    public static function gstBreakdown(string|float $taxableAmount, bool $isInterstate = false): array
    {
        $base = number_format((float) $taxableAmount, 2, '.', '');

        if ($isInterstate) {
            $igstRate = '3.00';
            $igstAmount = bcmul($base, '0.03', 2);
            return [
                'cgst_rate' => '0.00',
                'cgst_amount' => '0.00',
                'sgst_rate' => '0.00',
                'sgst_amount' => '0.00',
                'igst_rate' => $igstRate,
                'igst_amount' => $igstAmount,
                'total_tax' => $igstAmount,
            ];
        }

        $cgstRate = '1.50';
        $sgstRate = '1.50';
        $cgstAmount = bcmul($base, '0.015', 2);
        $sgstAmount = bcmul($base, '0.015', 2);
        $totalTax = bcadd($cgstAmount, $sgstAmount, 2);

        return [
            'cgst_rate' => $cgstRate,
            'cgst_amount' => $cgstAmount,
            'sgst_rate' => $sgstRate,
            'sgst_amount' => $sgstAmount,
            'igst_rate' => '0.00',
            'igst_amount' => '0.00',
            'total_tax' => $totalTax,
        ];
    }

    /**
     * Round off to nearest whole rupee
     */
    public static function roundOff(string|float $amount): array
    {
        $raw = (float) $amount;
        $rounded = round($raw);
        $diff = $rounded - $raw;

        return [
            'round_off' => number_format($diff, 2, '.', ''),
            'rounded_total' => number_format($rounded, 2, '.', ''),
        ];
    }

    /**
     * Old Gold Valuation
     */
    public static function oldGoldValue(
        string|float $grossWeight,
        string|float $stoneDeduction,
        string $purityKarat,
        string|float $ratePerGram24K
    ): array {
        $net = self::netWeight($grossWeight, $stoneDeduction);
        $pure = self::pureFineWeight($net, $purityKarat);
        $rate24K = number_format((float) $ratePerGram24K, 2, '.', '');
        $value = bcmul($pure, $rate24K, 2);

        return [
            'net_weight' => $net,
            'pure_weight' => $pure,
            'calculated_value' => $value,
        ];
    }

    public function calculateNetWeight(string|float $grossWeight, string|float $stoneWeight = 0.0): string
    {
        return self::netWeight($grossWeight, $stoneWeight);
    }

    public function calculatePureWeight(string|float $netWeight, string $purityKarat): string
    {
        return self::pureFineWeight($netWeight, $purityKarat);
    }

    public function calculateMetalValue(string|float $netWeight, string|float $ratePerGram): string
    {
        return self::metalValue($netWeight, $ratePerGram);
    }

    public function calculateMakingCharges(string|float $grossWeight, string $strategy, string|float $rateOrAmount, string|float $metalValue = 0.0): string
    {
        return self::makingCharges($strategy, $rateOrAmount, $grossWeight, $metalValue);
    }

    public function calculateGst(string|float $taxableAmount, bool $isIntraState = true): array
    {
        $breakdown = self::gstBreakdown($taxableAmount, !$isIntraState);
        return [
            'cgst' => $breakdown['cgst_amount'],
            'sgst' => $breakdown['sgst_amount'],
            'igst' => $breakdown['igst_amount'],
            'total_gst' => $breakdown['total_tax'],
        ];
    }

    public function calculateRoundOff(string|float $amount): array
    {
        $res = self::roundOff($amount);
        return [
            'rounded_amount' => $res['rounded_total'],
            'round_off' => $res['round_off'],
        ];
    }
}
