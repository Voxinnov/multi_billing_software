<?php

namespace App\Services;

use App\Imports\InvoicesImport;
use App\Models\InvoiceBatch;
use App\Repositories\CompanyRepositoryInterface;
use App\Repositories\InvoiceRepositoryInterface;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;

class InvoiceImportService
{
    protected CompanyRepositoryInterface $companyRepository;
    protected InvoiceRepositoryInterface $invoiceRepository;

    public function __construct(
        CompanyRepositoryInterface $companyRepository,
        InvoiceRepositoryInterface $invoiceRepository
    ) {
        $this->companyRepository = $companyRepository;
        $this->invoiceRepository = $invoiceRepository;
    }

    /**
     * Parse and import invoices from Excel file for the given batch.
     */
    public function importInvoices(string $filePath, InvoiceBatch $batch): void
    {
        $import = new InvoicesImport();
        Excel::import($import, $filePath);

        $format = $import->detectFormat();

        if ($format === 'simple') {
            $this->importSimpleRows($import, $batch);
        } else {
            $this->importFullRows($import, $batch);
        }
    }

    /**
     * Import full-format rows (invoice_no, company_code, item_name, rate, qty …).
     */
    private function importFullRows(InvoicesImport $import, InvoiceBatch $batch): void
    {
        $groupedInvoices = $import->getGroupedInvoices();
        $invoiceCount = 0;

        foreach ($groupedInvoices as $invoiceNo => $rows) {
            // Check if this invoice number already exists in the database
            $exists = \App\Models\Invoice::where('invoice_no', $invoiceNo)->exists();
            if ($exists) {
                throw new \Exception("Invoice number '{$invoiceNo}' already exists in your account. Each invoice must have a unique number.");
            }

            $firstRow = $rows->first();
            $companyCode = strtoupper(trim($firstRow['company_code'] ?? ''));

            $company = $this->companyRepository->findByCode($companyCode);
            if (!$company) {
                throw new \Exception("Company with code '{$companyCode}' not found inside your account. Please create the company first.");
            }

            $subtotal   = 0.00;
            $taxAmount  = 0.00;
            $grandTotal = 0.00;
            $itemsData  = [];

            foreach ($rows as $row) {
                $rate       = (float)($row['rate'] ?? 0);
                $qty        = (int)($row['qty'] ?? 1);
                $taxPercent = (float)($row['tax_percent'] ?? 0);

                $taxableValue = round($rate * $qty, 2);
                $rowTaxAmount = round($taxableValue * $taxPercent / 100, 2);
                $totalAmount  = round($taxableValue + $rowTaxAmount, 2);

                $subtotal   += $taxableValue;
                $taxAmount  += $rowTaxAmount;
                $grandTotal += $totalAmount;

                $itemsData[] = [
                    'item_name'    => $row['item_name'] ?? 'Product/Service',
                    'rate'         => $rate,
                    'qty'          => $qty,
                    'tax_percent'  => $taxPercent,
                    'taxable_value'=> $taxableValue,
                    'tax_amount'   => $rowTaxAmount,
                    'total_amount' => $totalAmount,
                ];
            }

            $invoiceDate = $this->parseExcelDate($firstRow['invoice_date'] ?? null) ?: now();
            $dueDate     = $this->parseExcelDate($firstRow['due_date'] ?? null) ?: $invoiceDate;

            $invoiceData = [
                'vendor_id'        => $batch->vendor_id,
                'batch_id'         => $batch->id,
                'company_id'       => $company->id,
                'invoice_no'       => $invoiceNo,
                'invoice_date'     => $invoiceDate,
                'due_date'         => $dueDate,
                'customer_name'    => $firstRow['customer_name'] ?? 'Walk-in Customer',
                'customer_address' => $firstRow['customer_address'] ?? '',
                'customer_phone'   => $firstRow['customer_phone'] ?? '',
                'place_of_supply'  => $firstRow['place_of_supply'] ?? '',
                'subtotal'         => $subtotal,
                'tax_amount'       => $taxAmount,
                'grand_total'      => $grandTotal,
                'remarks'          => $firstRow['remarks'] ?? '',
            ];

            $this->invoiceRepository->createInvoiceWithItems($invoiceData, $itemsData);
            $invoiceCount++;
        }

        $batch->update(['invoice_count' => $invoiceCount]);
    }

    /**
     * Import simple-format rows (Date, Name, Amount, Purpose).
     * One row = one invoice. Company comes from batch->company_id.
     */
    private function importSimpleRows(InvoicesImport $import, InvoiceBatch $batch): void
    {
        $rows         = $import->getSimpleRows();
        $invoiceCount = 0;

        // Resolve company: batch must carry company_id for simple format
        $company = null;
        if ($batch->company_id) {
            $company = \App\Models\Company::find($batch->company_id);
        }

        // Fallback: use first company belonging to vendor
        if (!$company) {
            $company = \App\Models\Company::where('vendor_id', $batch->vendor_id)->first();
        }

        if (!$company) {
            throw new \Exception("No company found for this batch. Please select a company before uploading.");
        }

        $prefix   = 'RCT-' . date('Ymd') . '-';
        
        // Find highest sequence for today to avoid duplicate invoice numbers
        $lastInvoice = \App\Models\Invoice::where('invoice_no', 'like', $prefix . '%')
            ->orderBy('id', 'desc')
            ->first();

        $sequence = 1;
        if ($lastInvoice) {
            $parts = explode('-', $lastInvoice->invoice_no);
            $lastSeq = (int) end($parts);
            $sequence = $lastSeq + 1;
        }

        foreach ($rows as $row) {
            $amount     = (float)($row['amount'] ?? 0);
            $gstRate    = (float)($batch->gst_rate ?? 0);
            $gstEnabled = (bool)($batch->gst_enabled ?? false);

            // If GST enabled, treat amount as tax-inclusive
            if ($gstEnabled && $gstRate > 0) {
                $subtotal   = round($amount / (1 + $gstRate / 100), 2);
                $taxAmount  = round($amount - $subtotal, 2);
                $grandTotal = $amount;
            } else {
                $subtotal   = $amount;
                $taxAmount  = 0.00;
                $grandTotal = $amount;
            }

            $invoiceDate = $this->parseExcelDate($row['date'] ?? null) ?: now();
            $invoiceNo   = $prefix . str_pad($sequence, 4, '0', STR_PAD_LEFT);

            // Double check uniqueness to avoid database collisions
            while (\App\Models\Invoice::where('invoice_no', $invoiceNo)->exists()) {
                $sequence++;
                $invoiceNo = $prefix . str_pad($sequence, 4, '0', STR_PAD_LEFT);
            }

            $itemsData = [[
                'item_name'     => $row['purpose'] ?? 'Service',
                'rate'          => $subtotal,
                'qty'           => 1,
                'tax_percent'   => $gstEnabled ? $gstRate : 0,
                'taxable_value' => $subtotal,
                'tax_amount'    => $taxAmount,
                'total_amount'  => $grandTotal,
            ]];

            $invoiceData = [
                'vendor_id'        => $batch->vendor_id,
                'batch_id'         => $batch->id,
                'company_id'       => $company->id,
                'invoice_no'       => $invoiceNo,
                'invoice_date'     => $invoiceDate,
                'due_date'         => $invoiceDate,
                'customer_name'    => $row['name'] ?? 'Customer',
                'customer_address' => '',
                'customer_phone'   => '',
                'place_of_supply'  => '',
                'subtotal'         => $subtotal,
                'tax_amount'       => $taxAmount,
                'grand_total'      => $grandTotal,
                'remarks'          => '',
            ];

            $this->invoiceRepository->createInvoiceWithItems($invoiceData, $itemsData);
            $invoiceCount++;
            $sequence++;
        }

        $batch->update(['invoice_count' => $invoiceCount]);
    }

    /**
     * Resolve dates from Excel (supports Excel serial numbers or standard date strings).
     */
    private function parseExcelDate(mixed $dateInput): ?Carbon
    {
        if (empty($dateInput)) {
            return null;
        }

        try {
            // Excel serial dates check
            if (is_numeric($dateInput)) {
                return Carbon::instance(\PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float)$dateInput));
            }

            $cleaned = str_replace('/', '-', trim((string)$dateInput));
            return Carbon::parse($cleaned);
        } catch (\Exception $e) {
            return null;
        }
    }
}
