<?php

namespace App\Repositories;

use App\Models\Company;

class CompanyRepository extends BaseRepository implements CompanyRepositoryInterface
{
    public function __construct(Company $model)
    {
        parent::__construct($model);
    }

    public function findByCode(string $code): ?Company
    {
        return $this->model->where('company_code', $code)->first();
    }
}
