<?php

namespace App\Repositories;

use App\Models\Invoice;
use Illuminate\Support\Facades\DB;

class InvoiceRepository extends BaseRepository implements InvoiceRepositoryInterface
{
    public function __construct(Invoice $model)
    {
        parent::__construct($model);
    }

    /**
     * Create an invoice along with its line items inside a database transaction.
     */
    public function createInvoiceWithItems(array $invoiceData, array $items): Invoice
    {
        return DB::transaction(function () use ($invoiceData, $items) {
            $invoice = $this->create($invoiceData);
            foreach ($items as $item) {
                $invoice->items()->create($item);
            }
            return $invoice;
        });
    }
}
