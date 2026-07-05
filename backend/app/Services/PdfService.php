<?php

namespace App\Services;

use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use setasign\Fpdi\Fpdi;
use ZipArchive;

class PdfService
{
    protected NumberToWordsService $numberToWords;

    public function __construct(NumberToWordsService $numberToWords)
    {
        $this->numberToWords = $numberToWords;
    }

    /**
     * Generate a PDF file for a single invoice.
     * Returns the relative path in the public storage disk.
     */
    public function generateInvoicePdf(Invoice $invoice): string
    {
        $invoice->load(['company.assets', 'items', 'batch.logoAsset', 'batch.sealAsset', 'batch.signAsset']);
        
        $logoBase64 = null;
        $sealBase64 = null;
        $signBase64 = null;

        // Check if explicit assets were selected in the batch
        if ($invoice->batch) {
            if ($invoice->batch->logoAsset) {
                $logoBase64 = $this->getBase64Asset($invoice->batch->logoAsset->asset_path);
            }
            if ($invoice->batch->sealAsset) {
                $sealBase64 = $this->getBase64Asset($invoice->batch->sealAsset->asset_path);
            }
            if ($invoice->batch->signAsset) {
                $signBase64 = $this->getBase64Asset($invoice->batch->signAsset->asset_path);
            }
        }

        // Fallback to defaults if not found in batch selections
        foreach ($invoice->company->assets as $asset) {
            if (!$logoBase64 && $asset->asset_type === 'logo') {
                $logoBase64 = $this->getBase64Asset($asset->asset_path);
            } elseif (!$sealBase64 && $asset->asset_type === 'seal') {
                $sealBase64 = $this->getBase64Asset($asset->asset_path);
            } elseif (!$signBase64 && $asset->asset_type === 'signature') {
                $signBase64 = $this->getBase64Asset($asset->asset_path);
            }
        }

        $grandTotalWords = $this->numberToWords->convertToIndianCurrencyWords($invoice->grand_total);

        // Render HTML view
        $pdf = Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'logo' => $logoBase64,
            'seal' => $sealBase64,
            'signature' => $signBase64,
            'amountInWords' => $grandTotalWords
        ]);

        $pdf->setPaper('a4', 'portrait');
        $pdf->setWarnings(false);

        $fileName = 'invoices/' . $invoice->invoice_no . '_' . time() . '.pdf';
        
        // Ensure storage path exists
        Storage::disk('public')->makeDirectory('invoices');
        
        $content = $pdf->output();
        Storage::disk('public')->put($fileName, $content);

        return $fileName;
    }

    /**
     * Merge multiple PDF files into one.
     */
    public function mergePdfs(array $relativePaths, string $outputFileName): string
    {
        $pdf = new Fpdi();
        
        foreach ($relativePaths as $relativePath) {
            $fullPath = Storage::disk('public')->path($relativePath);
            if (!file_exists($fullPath)) {
                continue;
            }

            $pageCount = $pdf->setSourceFile($fullPath);
            for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                $templateId = $pdf->importPage($pageNo);
                $size = $pdf->getTemplateSize($templateId);
                $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                $pdf->useTemplate($templateId);
            }
        }

        $destPath = 'batches/' . $outputFileName;
        Storage::disk('public')->makeDirectory('batches');
        $fullDestPath = Storage::disk('public')->path($destPath);
        
        $pdf->Output('F', $fullDestPath);

        return $destPath;
    }

    /**
     * Compress separate PDFs into a single ZIP archive.
     */
    public function zipPdfs(array $relativePaths, string $outputFileName): string
    {
        $zip = new ZipArchive();
        $destPath = 'batches/' . $outputFileName;
        Storage::disk('public')->makeDirectory('batches');
        $fullDestPath = Storage::disk('public')->path($destPath);

        if ($zip->open($fullDestPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            foreach ($relativePaths as $relativePath) {
                $fullPath = Storage::disk('public')->path($relativePath);
                if (file_exists($fullPath)) {
                    $baseName = basename($fullPath);
                    // Remove timestamp suffix for clean user-facing names inside the ZIP (e.g. INV-001.pdf)
                    $cleanName = preg_replace('/_\d+\.pdf$/', '.pdf', $baseName);
                    $zip->addFile($fullPath, $cleanName);
                }
            }
            $zip->close();
        }

        return $destPath;
    }

    /**
     * Retrieve local file content and format it as base64 data string.
     */
    private function getBase64Asset(string $path): ?string
    {
        try {
            if (Storage::disk('public')->exists($path)) {
                $content = Storage::disk('public')->get($path);
                $mime = Storage::disk('public')->mimeType($path);
                return 'data:' . $mime . ';base64,' . base64_encode($content);
            }
        } catch (\Exception $e) {
            // Fail silently, returning null
        }
        return null;
    }
}
