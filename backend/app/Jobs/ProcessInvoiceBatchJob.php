<?php

namespace App\Jobs;

use App\Models\InvoiceBatch;
use App\Services\InvoiceImportService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProcessInvoiceBatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected InvoiceBatch $batch;
    protected string $filePath;

    /**
     * Create a new job instance.
     */
    public function __construct(InvoiceBatch $batch, string $filePath)
    {
        $this->batch = $batch;
        $this->filePath = $filePath;
    }

    /**
     * Execute the job.
     */
    public function handle(InvoiceImportService $importService): void
    {
        try {
            $this->batch->update([
                'status' => 'processing',
            ]);

            $fullPath = Storage::disk('public')->path($this->filePath);
            
            if (!file_exists($fullPath)) {
                throw new \Exception("Uploaded Excel file could not be found at path: {$fullPath}");
            }

            // 1. Run import parsing
            $importService->importInvoices($fullPath, $this->batch);

            // 2. Refresh invoices relation
            $this->batch->load('invoices');
            $invoices = $this->batch->invoices;

            if ($invoices->isEmpty()) {
                $this->batch->update([
                    'status' => 'completed',
                ]);
                // Clean up Excel file
                Storage::disk('public')->delete($this->filePath);
                return;
            }

            // 3. Prepare jobs for batching
            $jobs = [];
            foreach ($invoices as $invoice) {
                $jobs[] = new GenerateSingleInvoicePdfJob($invoice);
            }

            $batchId = $this->batch->id;
            $batchNo = $this->batch->batch_no;
            $tempFile = $this->filePath;

            // 4. Dispatch parallel batch PDF execution
            Bus::batch($jobs)
                ->then(function (\Illuminate\Bus\Batch $busBatch) use ($batchId, $tempFile) {
                    $invoiceBatch = InvoiceBatch::find($batchId);
                    if ($invoiceBatch) {
                        // All individual PDFs are complete, trigger merging and zipping
                        dispatch(new FinalizeInvoiceBatchJob($invoiceBatch));
                    }
                    // Clean up temporary excel file
                    Storage::disk('public')->delete($tempFile);
                })
                ->catch(function (\Illuminate\Bus\Batch $busBatch, \Throwable $e) use ($batchId, $tempFile) {
                    Log::error("Bulk PDF job batch execution failed: " . $e->getMessage());
                    $invoiceBatch = InvoiceBatch::find($batchId);
                    if ($invoiceBatch) {
                        $invoiceBatch->update([
                            'status' => 'failed',
                        ]);
                    }
                    Storage::disk('public')->delete($tempFile);
                })
                ->name("Rosys Bulk PDF: #{$batchNo}")
                ->dispatch();

        } catch (\Exception $e) {
            Log::error("ProcessInvoiceBatchJob failed: " . $e->getMessage());
            
            $this->batch->update([
                'status' => 'failed',
            ]);

            Storage::disk('public')->delete($this->filePath);
        }
    }
}
