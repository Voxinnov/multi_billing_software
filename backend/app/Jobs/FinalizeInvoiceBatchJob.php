<?php

namespace App\Jobs;

use App\Models\InvoiceBatch;
use App\Services\PdfService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class FinalizeInvoiceBatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected InvoiceBatch $batch;

    /**
     * Create a new job instance.
     */
    public function __construct(InvoiceBatch $batch)
    {
        $this->batch = $batch;
    }

    /**
     * Execute the job.
     */
    public function handle(PdfService $pdfService): void
    {
        try {
            $invoices = $this->batch->invoices()->whereNotNull('pdf_path')->get();
            $pdfPaths = $invoices->pluck('pdf_path')->toArray();
            
            if (empty($pdfPaths)) {
                throw new \Exception("No successfully generated PDFs found for batch: {$this->batch->batch_no}");
            }

            // 1. Merge separate PDFs into a unified output
            $mergedName = 'batch_' . $this->batch->batch_no . '_merged.pdf';
            $pdfPath = $pdfService->mergePdfs($pdfPaths, $mergedName);

            // 2. Compress PDFs to ZIP file
            $zipName = 'batch_' . $this->batch->batch_no . '_invoices.zip';
            $zipPath = $pdfService->zipPdfs($pdfPaths, $zipName);

            // 3. Mark batch completed
            $this->batch->update([
                'status' => 'completed',
                'pdf_path' => $pdfPath,
                'zip_path' => $zipPath,
            ]);

        } catch (\Exception $e) {
            Log::error("Finalizing invoice batch #{$this->batch->batch_no} failed: " . $e->getMessage());
            
            $this->batch->update([
                'status' => 'failed',
            ]);
        }
    }
}
