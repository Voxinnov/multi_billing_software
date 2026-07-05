<?php

namespace App\Repositories;

use App\Models\InvoiceBatch;

class InvoiceBatchRepository extends BaseRepository implements InvoiceBatchRepositoryInterface
{
    public function __construct(InvoiceBatch $model)
    {
        parent::__construct($model);
    }

    public function findByBatchNo(string $batchNo): ?InvoiceBatch
    {
        return $this->model->where('batch_no', $batchNo)->first();
    }
}
