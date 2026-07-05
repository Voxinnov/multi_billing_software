<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Plans
        $freePlan = Plan::create([
            'name' => 'Free Trial',
            'description' => 'Perfect for testing out Rosys Billing. Max 100 invoices/month.',
            'price' => 0.00,
            'invoice_limit' => 100,
            'company_limit' => 1,
        ]);

        $premiumPlan = Plan::create([
            'name' => 'Premium Professional',
            'description' => 'Ideal for small-to-medium businesses. Max 5000 invoices/month.',
            'price' => 49.00,
            'invoice_limit' => 5000,
            'company_limit' => 5,
        ]);

        $enterprisePlan = Plan::create([
            'name' => 'Enterprise Unlimited',
            'description' => 'For large organizations. Unlimited invoices and companies.',
            'price' => 199.00,
            'invoice_limit' => -1,
            'company_limit' => -1,
        ]);

        // 2. Seed Vendors (Tenants)
        $rosysVendor = Vendor::create([
            'name' => 'Rosys Technologies Group',
            'is_active' => true,
        ]);

        $attireVendor = Vendor::create([
            'name' => 'Attire Apparel Brands',
            'is_active' => true,
        ]);

        $suspendedVendor = Vendor::create([
            'name' => 'Legacy Inactive Corp',
            'is_active' => false,
        ]);

        // 3. Seed Subscriptions
        Subscription::create([
            'vendor_id' => $rosysVendor->id,
            'plan_id' => $enterprisePlan->id,
            'starts_at' => now(),
            'ends_at' => now()->addYear(),
            'status' => 'active',
        ]);

        Subscription::create([
            'vendor_id' => $attireVendor->id,
            'plan_id' => $premiumPlan->id,
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
            'status' => 'active',
        ]);

        // 4. Seed Users
        // Global Super Admin (No vendor ID)
        User::create([
            'name' => 'Super Administrator',
            'email' => 'superadmin@rosys.com',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);

        // Rosys Tenant Users
        User::create([
            'name' => 'Rosys Admin User',
            'email' => 'admin@rosys.com',
            'password' => Hash::make('password'),
            'vendor_id' => $rosysVendor->id,
            'role' => 'vendor_admin',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Rosys Staff Operator',
            'email' => 'staff@rosys.com',
            'password' => Hash::make('password'),
            'vendor_id' => $rosysVendor->id,
            'role' => 'staff',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Rosys Viewer Guest',
            'email' => 'viewer@rosys.com',
            'password' => Hash::make('password'),
            'vendor_id' => $rosysVendor->id,
            'role' => 'viewer',
            'is_active' => true,
        ]);

        // Attire Tenant Admin
        User::create([
            'name' => 'Attire Admin Manager',
            'email' => 'admin@attire.com',
            'password' => Hash::make('password'),
            'vendor_id' => $attireVendor->id,
            'role' => 'vendor_admin',
            'is_active' => true,
        ]);

        // 5. Seed Companies
        // Rosys Companies
        $company1 = Company::create([
            'vendor_id' => $rosysVendor->id,
            'company_code' => 'ROSYS',
            'company_name' => 'Rosys Tech Solutions Pvt Ltd',
            'gstin' => '32AABCR1234A1Z1',
            'phone_number' => '+91 8075082255',
            'email' => 'billing@rosystech.com',
            'address_line1' => 'Phase 2, Carnation Towers',
            'address_line2' => 'Infopark Kochi',
            'city' => 'Kochi',
            'state' => 'Kerala',
            'country' => 'India',
            'pincode' => '682030',
            'footer_text' => 'Thank you for choosing Rosys Technologies. Enjoy our cloud platforms.',
            'is_active' => true,
        ]);

        $company2 = Company::create([
            'vendor_id' => $rosysVendor->id,
            'company_code' => 'VOXINNOV',
            'company_name' => 'Voxinnov Systems',
            'gstin' => '32AABCV5678B2Z2',
            'phone_number' => '+91 9876543210',
            'email' => 'accounts@voxinnov.in',
            'address_line1' => '2nd Floor, Innovation Hub',
            'address_line2' => 'Civil Line Road',
            'city' => 'Kochi',
            'state' => 'Kerala',
            'country' => 'India',
            'pincode' => '682021',
            'footer_text' => 'For billing queries, email finance@voxinnov.in.',
            'is_active' => true,
        ]);

        // Attire Companies
        $company3 = Company::create([
            'vendor_id' => $attireVendor->id,
            'company_code' => 'ATTIRE',
            'company_name' => 'Attire Apparel Brands Inc.',
            'gstin' => '32AABCA9012C3Z3',
            'phone_number' => '+1 (555) 123-4567',
            'email' => 'sales@attirebrands.com',
            'address_line1' => '500 Fashion Avenue',
            'address_line2' => 'Suite 404',
            'city' => 'New York',
            'state' => 'NY',
            'country' => 'United States',
            'pincode' => '10018',
            'footer_text' => 'All disputes are subject to New York jurisdiction.',
            'is_active' => true,
        ]);

        // 6. Seed mock assets for ROSYS (URLs pointing to placehold/standard assets, which we will later copy locally if needed)
        $company1->assets()->createMany([
            [
                'asset_type' => 'logo',
                'asset_name' => 'Logo 1',
                'asset_path' => 'assets/mock/rosys_logo.png',
                'is_default' => true,
            ],
            [
                'asset_type' => 'seal',
                'asset_name' => 'Blue Seal',
                'asset_path' => 'assets/mock/rosys_seal.png',
                'is_default' => true,
            ],
            [
                'asset_type' => 'signature',
                'asset_name' => 'Director Sign',
                'asset_path' => 'assets/mock/rosys_sign.png',
                'is_default' => true,
            ]
        ]);
    }
}
