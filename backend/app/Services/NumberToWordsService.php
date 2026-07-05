<?php

namespace App\Services;

class NumberToWordsService
{
    /**
     * Convert float amount to Indian Currency Words.
     * Example: 150000 -> "INR Rupees One Lakh Fifty Thousand Only"
     */
    public function convertToIndianCurrencyWords(float $amount): string
    {
        $amount = round($amount, 2);
        $parts = explode('.', (string)$amount);
        $rupees = (int)$parts[0];
        $paise = isset($parts[1]) ? (int)str_pad($parts[1], 2, '0', STR_PAD_RIGHT) : 0;

        $rupeesWords = $this->convertIntegerToWords($rupees);
        $paiseWords = '';

        if ($paise > 0) {
            $paiseWords = ' and ' . $this->convertIntegerToWords($paise) . ' Paise';
        }

        if (empty($rupeesWords)) {
            $rupeesWords = 'Zero Rupees';
        } else {
            $rupeesWords = 'Rupees ' . $rupeesWords;
        }

        return 'INR ' . $rupeesWords . $paiseWords . ' Only';
    }

    /**
     * Convert integer part into words using Indian Numbering groups.
     */
    private function convertIntegerToWords(int $num): string
    {
        if ($num === 0) {
            return '';
        }

        $ones = [
            0 => '', 1 => 'One', 2 => 'Two', 3 => 'Three', 4 => 'Four', 5 => 'Five',
            6 => 'Six', 7 => 'Seven', 8 => 'Eight', 9 => 'Nine', 10 => 'Ten',
            11 => 'Eleven', 12 => 'Twelve', 13 => 'Thirteen', 14 => 'Fourteen', 15 => 'Fifteen',
            16 => 'Sixteen', 17 => 'Seventeen', 18 => 'Eighteen', 19 => 'Nineteen'
        ];

        $tens = [
            0 => '', 10 => 'Ten', 20 => 'Twenty', 30 => 'Thirty', 40 => 'Forty', 50 => 'Fifty',
            60 => 'Sixty', 70 => 'Seventy', 80 => 'Eighty', 90 => 'Ninety'
        ];

        if ($num < 20) {
            return $ones[$num];
        }

        if ($num < 100) {
            return $tens[10 * floor($num / 10)] . ($num % 10 ? ' ' . $ones[$num % 10] : '');
        }

        if ($num < 1000) {
            return $ones[floor($num / 100)] . ' Hundred' . ($num % 100 ? ' and ' . $this->convertIntegerToWords($num % 100) : '');
        }

        if ($num < 100000) {
            // Thousands (up to 99,999)
            return $this->convertIntegerToWords(floor($num / 1000)) . ' Thousand' . ($num % 1000 ? ' ' . $this->convertIntegerToWords($num % 1000) : '');
        }

        if ($num < 10000000) {
            // Lakhs (1,00,000 to 99,99,999)
            return $this->convertIntegerToWords(floor($num / 100000)) . ' Lakh' . ($num % 100000 ? ' ' . $this->convertIntegerToWords($num % 100000) : '');
        }

        // Crores (1,00,00,000+)
        return $this->convertIntegerToWords(floor($num / 10000000)) . ' Crore' . ($num % 10000000 ? ' ' . $this->convertIntegerToWords($num % 10000000) : '');
    }
}
