<?php

namespace App\Jobs;

use App\Models\Invoice;
use App\Services\PdfService;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateSingleInvoicePdfJob implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Invoice $invoice;

    /**
     * Create a new job instance.
     */
    public function __construct(Invoice $invoice)
    {
        $this->invoice = $invoice;
    }

    /**
     * Execute the job.
     */
    public function handle(PdfService $pdfService): void
    {
        // Skip execution if batch was cancelled
        if ($this->batch() && $this->batch()->cancelled()) {
            return;
        }

        $pdfPath = $pdfService->generateInvoicePdf($this->invoice);
        
        $this->invoice->update([
            'pdf_path' => $pdfPath,
        ]);
    }
}
