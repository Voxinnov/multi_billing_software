<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessInvoiceBatchJob;
use App\Models\CompanyAsset;
use App\Models\Company;
use App\Models\Invoice;
use App\Models\InvoiceBatch;
use App\Repositories\InvoiceBatchRepositoryInterface;
use App\Repositories\InvoiceRepositoryInterface;
use App\Services\PdfService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class InvoiceController extends Controller
{
    protected InvoiceBatchRepositoryInterface $batchRepository;
    protected InvoiceRepositoryInterface $invoiceRepository;
    protected PdfService $pdfService;

    public function __construct(
        InvoiceBatchRepositoryInterface $batchRepository,
        InvoiceRepositoryInterface $invoiceRepository,
        PdfService $pdfService
    ) {
        $this->batchRepository = $batchRepository;
        $this->invoiceRepository = $invoiceRepository;
        $this->pdfService = $pdfService;
    }

    /**
     * List all invoice batches for the active tenant.
     */
    public function index(): JsonResponse
    {
        $batches = InvoiceBatch::with(['generatedBy'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($batches);
    }

    /**
     * Upload Excel file and dispatch processing queue job.
     */
    public function uploadExcel(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls|max:10240', // Max 10MB
            'company_id' => 'nullable|exists:companies,id',
            'logo_asset_id' => 'nullable|exists:company_assets,id',
            'seal_asset_id' => 'nullable|exists:company_assets,id',
            'sign_asset_id' => 'nullable|exists:company_assets,id',
            'gst_enabled' => 'nullable',
            'gst_rate' => 'nullable|numeric',
        ]);

        $user = $request->user();
        $user->load('vendor.subscription.plan');

        // Check subscription validity
        $subscription = $user->vendor->subscription;
        if (!$subscription || !$subscription->isValid()) {
            return response()->json([
                'message' => 'Your subscription is expired or inactive. Please renew to generate invoices.'
            ], 403);
        }

        // Store Excel file temporarily
        $path = $request->file('file')->store('temp_imports', 'public');
        $fullPath = Storage::disk('public')->path($path);

        try {
            // Count rows in the Excel file to enforce plan limits
            $reader = IOFactory::createReaderForFile($fullPath);
            $reader->setReadDataOnly(true);
            $spreadsheet = $reader->load($fullPath);
            $worksheet = $spreadsheet->getActiveSheet();
            $totalRows = $worksheet->getHighestRow();
            $approxInvoiceLines = $totalRows - 1; // Subtract headers

            $invoiceLimit = $subscription->plan->invoice_limit ?? -1;

            if ($invoiceLimit !== -1) {
                // Count current month invoices
                $currentMonthCount = Invoice::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count();

                if (($currentMonthCount + $approxInvoiceLines) > $invoiceLimit) {
                    Storage::disk('public')->delete($path);
                    return response()->json([
                        'message' => "Your plan limit is {$invoiceLimit} invoices/month. This file contains approx {$approxInvoiceLines} items, exceeding your monthly allowance (Current used: {$currentMonthCount})."
                    ], 403);
                }
            }

            // Create batch record
            $batchNo = 'BATCH-' . date('YmdHis') . '-' . rand(1000, 9999);
            
            $batch = $this->batchRepository->create([
                'vendor_id' => $user->vendor_id,
                'company_id' => $request->company_id,
                'logo_asset_id' => $request->logo_asset_id,
                'seal_asset_id' => $request->seal_asset_id,
                'sign_asset_id' => $request->sign_asset_id,
                'batch_no' => $batchNo,
                'invoice_count' => 0,
                'status' => 'pending',
                'gst_enabled' => $request->gst_enabled === '1' || $request->gst_enabled === true,
                'gst_rate' => $request->gst_rate ?? 0.00,
                'generated_by' => $user->id,
            ]);

            // Dispatch background queue job
            dispatch(new ProcessInvoiceBatchJob($batch, $path));

            return response()->json([
                'message' => 'Excel file uploaded. Invoice generation initiated in the background.',
                'batch' => $batch,
            ]);

        } catch (\Exception $e) {
            Storage::disk('public')->delete($path);
            return response()->json([
                'message' => 'Failed to parse Excel file: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Retrieve status of a single batch (polling target).
     */
    public function show(int $id): JsonResponse
    {
        // Scoped automatically by TenantScope
        $batch = InvoiceBatch::with(['invoices', 'generatedBy'])->findOrFail($id);
        return response()->json($batch);
    }

    /**
     * Download the merged batch PDF.
     */
    public function downloadPdf(int $batchId): BinaryFileResponse|JsonResponse
    {
        $batch = InvoiceBatch::findOrFail($batchId);
        
        if ($batch->status !== 'completed' || !$batch->pdf_path) {
            return response()->json(['message' => 'PDF is not ready or batch failed.'], 400);
        }

        $fullPath = Storage::disk('public')->path($batch->pdf_path);
        
        if (!file_exists($fullPath)) {
            return response()->json(['message' => 'Merged PDF file not found.'], 404);
        }

        return response()->download($fullPath, "Invoices_{$batch->batch_no}.pdf");
    }

    /**
     * Download the compressed ZIP file containing separate PDFs.
     */
    public function downloadZip(int $batchId): BinaryFileResponse|JsonResponse
    {
        $batch = InvoiceBatch::findOrFail($batchId);

        if ($batch->status !== 'completed' || !$batch->zip_path) {
            return response()->json(['message' => 'ZIP archive is not ready or batch failed.'], 400);
        }

        $fullPath = Storage::disk('public')->path($batch->zip_path);

        if (!file_exists($fullPath)) {
            return response()->json(['message' => 'ZIP file not found on disk.'], 404);
        }

        return response()->download($fullPath, "Invoices_{$batch->batch_no}.zip");
    }

    /**
     * Delete batch history and clean files from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $batch = InvoiceBatch::findOrFail($id);

        // Delete files from storage
        if ($batch->pdf_path) {
            Storage::disk('public')->delete($batch->pdf_path);
        }
        if ($batch->zip_path) {
            Storage::disk('public')->delete($batch->zip_path);
        }

        // Delete individual invoice PDFs
        $invoices = $batch->invoices;
        foreach ($invoices as $invoice) {
            if ($invoice->pdf_path) {
                Storage::disk('public')->delete($invoice->pdf_path);
            }
        }

        $batch->delete();

        return response()->json([
            'message' => 'Batch and generated files deleted successfully.'
        ]);
    }

    /**
     * Get all assets for dropdown options inside React.
     */
    public function listAllAssets(Request $request): JsonResponse
    {
        // Get all companies belonging to tenant, then load assets
        $companies = Company::with('assets')->get();
        $assetsList = [];

        foreach ($companies as $company) {
            foreach ($company->assets as $asset) {
                $assetsList[] = [
                    'id' => $asset->id,
                    'company_code' => $company->company_code,
                    'company_name' => $company->company_name,
                    'asset_type' => $asset->asset_type,
                    'asset_name' => $asset->asset_name,
                    'asset_url' => $asset->asset_url,
                ];
            }
        }

        return response()->json($assetsList);
    }

    /**
     * Generate a single invoice manually from JSON form data and return PDF download.
     */
    public function generateManual(Request $request): BinaryFileResponse|JsonResponse
    {
        $request->validate([
            'company_id'        => 'required|exists:companies,id',
            'invoice_no'        => 'required|string|max:100',
            'invoice_date'      => 'required|date',
            'due_date'          => 'nullable|date',
            'customer_name'     => 'required|string|max:255',
            'customer_address'  => 'nullable|string|max:500',
            'customer_phone'    => 'nullable|string|max:50',
            'place_of_supply'   => 'nullable|string|max:100',
            'remarks'           => 'nullable|string|max:500',
            'logo_asset_id'     => 'nullable|exists:company_assets,id',
            'seal_asset_id'     => 'nullable|exists:company_assets,id',
            'sign_asset_id'     => 'nullable|exists:company_assets,id',
            'items'             => 'required|array|min:1',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.rate'      => 'required|numeric|min:0',
            'items.*.qty'       => 'required|integer|min:1',
            'items.*.tax_percent' => 'nullable|numeric|min:0|max:100',
        ]);

        $user = $request->user();
        $user->load('vendor.subscription.plan');

        // Check subscription validity
        $subscription = $user->vendor->subscription;
        if (!$subscription || !$subscription->isValid()) {
            return response()->json([
                'message' => 'Your subscription is expired or inactive. Please renew to generate invoices.'
            ], 403);
        }

        // Check invoice limit
        $invoiceLimit = $subscription->plan->invoice_limit ?? -1;
        if ($invoiceLimit !== -1) {
            $currentMonthCount = Invoice::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();
            if (($currentMonthCount + 1) > $invoiceLimit) {
                return response()->json([
                    'message' => "Your plan limit is {$invoiceLimit} invoices/month. You have already used {$currentMonthCount} this month."
                ], 403);
            }
        }

        // Check for duplicate invoice number
        if (Invoice::where('invoice_no', $request->invoice_no)->exists()) {
            return response()->json([
                'message' => "Invoice number '{$request->invoice_no}' already exists. Please use a unique invoice number."
            ], 422);
        }

        // Build line items and compute totals
        $subtotal   = 0.00;
        $taxAmount  = 0.00;
        $grandTotal = 0.00;
        $itemsData  = [];

        foreach ($request->items as $row) {
            $rate        = (float) $row['rate'];
            $qty         = (int)   $row['qty'];
            $taxPercent  = (float) ($row['tax_percent'] ?? 0);

            $taxableValue = round($rate * $qty, 2);
            $rowTax       = round($taxableValue * $taxPercent / 100, 2);
            $rowTotal     = round($taxableValue + $rowTax, 2);

            $subtotal   += $taxableValue;
            $taxAmount  += $rowTax;
            $grandTotal += $rowTotal;

            $itemsData[] = [
                'item_name'     => $row['item_name'],
                'rate'          => $rate,
                'qty'           => $qty,
                'tax_percent'   => $taxPercent,
                'taxable_value' => $taxableValue,
                'tax_amount'    => $rowTax,
                'total_amount'  => $rowTotal,
            ];
        }

        // Create a single-invoice batch record
        $batchNo = 'MANUAL-' . date('YmdHis') . '-' . rand(100, 999);
        $batch = $this->batchRepository->create([
            'vendor_id'     => $user->vendor_id,
            'company_id'    => $request->company_id,
            'logo_asset_id' => $request->logo_asset_id,
            'seal_asset_id' => $request->seal_asset_id,
            'sign_asset_id' => $request->sign_asset_id,
            'batch_no'      => $batchNo,
            'invoice_count' => 1,
            'status'        => 'processing',
            'gst_enabled'   => $taxAmount > 0,
            'gst_rate'      => 0,
            'generated_by'  => $user->id,
        ]);

        // Create invoice + items
        $invoiceData = [
            'vendor_id'        => $user->vendor_id,
            'batch_id'         => $batch->id,
            'company_id'       => $request->company_id,
            'invoice_no'       => $request->invoice_no,
            'invoice_date'     => $request->invoice_date,
            'due_date'         => $request->due_date ?? $request->invoice_date,
            'customer_name'    => $request->customer_name,
            'customer_address' => $request->customer_address ?? '',
            'customer_phone'   => $request->customer_phone ?? '',
            'place_of_supply'  => $request->place_of_supply ?? '',
            'subtotal'         => round($subtotal, 2),
            'tax_amount'       => round($taxAmount, 2),
            'grand_total'      => round($grandTotal, 2),
            'remarks'          => $request->remarks ?? '',
        ];

        $invoice = $this->invoiceRepository->createInvoiceWithItems($invoiceData, $itemsData);

        // Generate PDF synchronously
        try {
            $pdfPath = $this->pdfService->generateInvoicePdf($invoice);
            $invoice->update(['pdf_path' => $pdfPath]);

            // Update batch to completed
            $batch->update([
                'status'   => 'completed',
                'pdf_path' => $pdfPath,
            ]);

            $fullPath = Storage::disk('public')->path($pdfPath);
            return response()->download($fullPath, "Invoice_{$invoice->invoice_no}.pdf", [
                'Content-Type' => 'application/pdf',
            ])->deleteFileAfterSend(false);

        } catch (\Exception $e) {
            $batch->update(['status' => 'failed']);
            return response()->json([
                'message' => 'PDF generation failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
