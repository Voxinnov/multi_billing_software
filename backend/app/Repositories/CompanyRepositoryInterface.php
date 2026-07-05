<?php

namespace App\Repositories;

use App\Models\Company;

interface CompanyRepositoryInterface extends BaseRepositoryInterface
{
    public function findByCode(string $code): ?Company;
}
