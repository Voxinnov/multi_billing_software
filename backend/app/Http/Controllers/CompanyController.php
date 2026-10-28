<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\CompanyAsset;
use App\Repositories\CompanyRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    protected CompanyRepositoryInterface $companyRepository;

    public function __construct(CompanyRepositoryInterface $companyRepository)
    {
        $this->companyRepository = $companyRepository;
    }

    /**
     * Retrieve companies owned by the tenant.
     */
    public function index(): JsonResponse
    {
        $companies = $this->companyRepository->all();
        return response()->json($companies);
    }

    /**
     * Create or update a company, checking limits.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'company_code' => 'required|string',
            'company_name' => 'required|string',
            'gstin' => 'nullable|string',
            'phone_number' => 'nullable|string',
            'email' => 'nullable|email',
            'address_line1' => 'nullable|string',
            'address_line2' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'country' => 'nullable|string',
            'pincode' => 'nullable|string',
            'bank_name' => 'nullable|string',
            'bank_branch' => 'nullable|string',
            'bank_account_no' => 'nullable|string',
            'bank_ifsc' => 'nullable|string',
            'signer_name' => 'nullable|string',
            'footer_text' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $data = $request->only([
            'company_code', 'company_name', 'gstin', 'phone_number', 'email',
            'address_line1', 'address_line2', 'city', 'state', 'country', 'pincode',
            'bank_name', 'bank_branch', 'bank_account_no', 'bank_ifsc', 'signer_name',
            'footer_text', 'is_active'
        ]);

        // Automatically scoped by TenantScope to vendor!
        $company = Company::where('company_code', $request->company_code)->first();

        if ($company) {
            $company->update($data);
        } else {
            // Verify billing company limit from plan
            $user = $request->user();
            $user->load('vendor.subscription.plan');
            $companyLimit = $user->vendor->subscription->plan->company_limit ?? -1;
            
            if ($companyLimit !== -1) {
                $companyCount = Company::count();
                if ($companyCount >= $companyLimit) {
                    return response()->json([
                        'message' => "Your subscription plan restricts you to a maximum of {$companyLimit} companies."
                    ], 403);
                }
            }

            $company = $this->companyRepository->create($data);
        }

        return response()->json([
            'message' => 'Company information saved successfully.',
            'company' => $company
        ]);
    }

    /**
     * Upload an asset for a company (logo, seal, signature).
     */
    public function uploadAsset(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|exists:companies,id',
            'asset_type' => 'required|in:logo,seal,signature',
            'asset_name' => 'required|string',
            'file' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $company = Company::findOrFail($request->company_id);

        $folder = $request->asset_type . 's'; // logos, seals, signatures
        $path = $request->file('file')->store($folder, 'public');

        // Check if asset exists with the same name and type to replace it
        $asset = CompanyAsset::where('company_id', $company->id)
            ->where('asset_type', $request->asset_type)
            ->where('asset_name', $request->asset_name)
            ->first();

        if ($asset) {
            // Delete old file
            Storage::disk('public')->delete($asset->asset_path);
            $asset->update([
                'asset_path' => $path
            ]);
        } else {
            // Auto-assign is_default if it's the first file uploaded of its type
            $hasDefault = CompanyAsset::where('company_id', $company->id)
                ->where('asset_type', $request->asset_type)
                ->where('is_default', true)
                ->exists();

            $asset = CompanyAsset::create([
                'company_id' => $company->id,
                'asset_type' => $request->asset_type,
                'asset_name' => $request->asset_name,
                'asset_path' => $path,
                'is_default' => !$hasDefault
            ]);
        }

        return response()->json([
            'message' => 'Asset uploaded successfully.',
            'asset' => $asset
        ]);
    }

    /**
     * Retrieve all assets for a company.
     */
    public function listAssets(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|exists:companies,id'
        ]);

        $assets = CompanyAsset::where('company_id', $request->company_id)->get();
        return response()->json($assets);
    }

    /**
     * Retrieve current vendor branding.
     */
    public function getBranding(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->vendor_id) {
            return response()->json(['message' => 'Super Admins do not have vendor branding.'], 400);
        }
        $vendor = \App\Models\Vendor::find($user->vendor_id);
        return response()->json($vendor);
    }

    /**
     * Update vendor branding.
     */
    public function updateBranding(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->vendor_id) {
            return response()->json(['message' => 'Super Admins do not have vendor branding.'], 400);
        }
        
        $vendor = \App\Models\Vendor::find($user->vendor_id);

        $request->validate([
            'panel_name' => 'nullable|string|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = [];
        if ($request->has('panel_name')) {
            $data['panel_name'] = $request->panel_name;
        }

        if ($request->hasFile('logo')) {
            if ($vendor->logo_path) {
                Storage::disk('public')->delete($vendor->logo_path);
            }
            $path = $request->file('logo')->store('branding', 'public');
            $data['logo_path'] = $path;
        }

        $vendor->update($data);

        return response()->json([
            'message' => 'Vendor branding updated successfully.',
            'vendor' => $vendor
        ]);
    }

    /**
     * Delete an asset.
     */
    public function deleteAsset($id): JsonResponse
    {
        $asset = CompanyAsset::findOrFail($id);

        // Security check: ensure the company belongs to the authenticated tenant
        Company::findOrFail($asset->company_id);

        // Delete from public storage disk
        if (Storage::disk('public')->exists($asset->asset_path)) {
            Storage::disk('public')->delete($asset->asset_path);
        }

        $wasDefault = $asset->is_default;
        $companyId = $asset->company_id;
        $assetType = $asset->asset_type;

        $asset->delete();

        // Promote next default if the deleted one was default
        if ($wasDefault) {
            $nextAsset = CompanyAsset::where('company_id', $companyId)
                ->where('asset_type', $assetType)
                ->first();
            if ($nextAsset) {
                $nextAsset->update(['is_default' => true]);
            }
        }

        return response()->json([
            'message' => 'Asset deleted successfully.'
        ]);
    }

    /**
     * Update an asset (rename label).
     */
    public function updateAsset(Request $request, $id): JsonResponse
    {
        $request->validate([
            'asset_name' => 'required|string|max:255'
        ]);

        $asset = CompanyAsset::findOrFail($id);

        // Security check: ensure the company belongs to the authenticated tenant
        Company::findOrFail($asset->company_id);

        $asset->update([
            'asset_name' => $request->asset_name
        ]);

        return response()->json([
            'message' => 'Asset updated successfully.',
            'asset' => $asset
        ]);
    }

    /**
     * Set asset as default.
     */
    public function setDefaultAsset($id): JsonResponse
    {
        $asset = CompanyAsset::findOrFail($id);

        // Security check: ensure the company belongs to the authenticated tenant
        Company::findOrFail($asset->company_id);

        // Remove default flag from all other assets of same type for this company
        CompanyAsset::where('company_id', $asset->company_id)
            ->where('asset_type', $asset->asset_type)
            ->update(['is_default' => false]);

        $asset->update(['is_default' => true]);

        return response()->json([
            'message' => 'Default asset updated successfully.',
            'asset' => $asset
        ]);
    }
}
