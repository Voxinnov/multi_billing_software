<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class InvoicesImport implements ToCollection, WithHeadingRow
{
    protected Collection $rows;

    public function __construct()
    {
        $this->rows = collect();
    }

    /**
     * Store Excel rows in a local collection.
     */
    public function collection(Collection $rows): void
    {
        $this->rows = $rows;
    }

    /**
     * Detect whether this is a full invoice format or simple transaction format.
     * Returns 'full' if rows have invoice_no + company_code,
     * returns 'simple' if rows have date + name + amount columns.
     */
    public function detectFormat(): string
    {
        $firstRow = $this->rows->first();
        if (!$firstRow) return 'full';

        $keys = array_map(fn($k) => strtolower(trim((string)$k)), $firstRow->keys()->toArray());

        $hasInvoiceNo   = in_array('invoice_no', $keys);
        $hasCompanyCode = in_array('company_code', $keys);

        if ($hasInvoiceNo && $hasCompanyCode) {
            return 'full';
        }

        $hasDate   = count(array_filter($keys, fn($k) => in_array($k, ['date', 'transaction date', 'txn date']))) > 0;
        $hasName   = count(array_filter($keys, fn($k) => in_array($k, ['name', 'customer', 'customer name', 'client name']))) > 0;
        $hasAmount = count(array_filter($keys, fn($k) => in_array($k, ['amount', 'amt', 'total', 'value']))) > 0;

        if ($hasDate && $hasName && $hasAmount) {
            return 'simple';
        }

        return 'full';
    }

    /**
     * Get the parsed rows grouped by invoice number (full invoice format).
     */
    public function getGroupedInvoices(): Collection
    {
        return $this->rows->filter(function ($row) {
            return !empty($row['invoice_no']) && !empty($row['company_code']);
        })->groupBy('invoice_no');
    }

    /**
     * Get raw rows for simple transaction format (Date, Name, Amount, Purpose).
     * Normalises column names to lowercase standard keys.
     */
    public function getSimpleRows(): Collection
    {
        return $this->rows->map(function ($row) {
            $normalised = [];
            foreach ($row->toArray() as $key => $value) {
                $k = strtolower(trim((string)$key));
                if (in_array($k, ['date', 'transaction date', 'txn date'])) {
                    $normalised['date'] = $value;
                } elseif (in_array($k, ['name', 'customer', 'customer name', 'client name'])) {
                    $normalised['name'] = $value;
                } elseif (in_array($k, ['amount', 'amt', 'total', 'value'])) {
                    $normalised['amount'] = $value;
                } elseif (in_array($k, ['purpose', 'item', 'description', 'particulars', 'narration'])) {
                    $normalised['purpose'] = $value;
                } else {
                    $normalised[$k] = $value;
                }
            }
            return collect($normalised);
        })->filter(fn($row) => !empty($row['name']) && !empty($row['amount']));
    }
}
