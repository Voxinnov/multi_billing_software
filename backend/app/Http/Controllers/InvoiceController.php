<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessInvoiceBatchJob;
use App\Models\CompanyAsset;
use App\Models\Invoice;
use App\Models\InvoiceBatch;
use App\Repositories\InvoiceBatchRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class InvoiceController extends Controller
{
    protected InvoiceBatchRepositoryInterface $batchRepository;

    public function __construct(InvoiceBatchRepositoryInterface $batchRepository)
    {
        $this->batchRepository = $batchRepository;
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
        $companies = \App\Models\Company::with('assets')->get();
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
}
