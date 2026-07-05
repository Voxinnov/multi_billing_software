<?php

namespace App\Repositories;

use App\Models\Invoice;

interface InvoiceRepositoryInterface extends BaseRepositoryInterface
{
    public function createInvoiceWithItems(array $invoiceData, array $items): Invoice;
}
