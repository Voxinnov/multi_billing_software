<?php

namespace App\Repositories;

use App\Models\InvoiceBatch;

interface InvoiceBatchRepositoryInterface extends BaseRepositoryInterface
{
    public function findByBatchNo(string $batchNo): ?InvoiceBatch;
}
