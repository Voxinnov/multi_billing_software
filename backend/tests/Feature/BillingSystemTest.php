<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use App\Models\Vendor;
use App\Services\NumberToWordsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BillingSystemTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test the Indian Numbering system to words converter.
     */
    public function test_number_to_words_indian_system(): void
    {
        $service = new NumberToWordsService();
        
        $this->assertEquals(
            'INR Rupees One Lakh Fifty Thousand Only', 
            $service->convertToIndianCurrencyWords(150000)
        );

        $this->assertEquals(
            'INR Rupees Fifteen Lakh Only', 
            $service->convertToIndianCurrencyWords(1500000)
        );

        $this->assertEquals(
            'INR Rupees One Crore Only', 
            $service->convertToIndianCurrencyWords(10000000)
        );
    }

    /**
     * Test tenant isolation global scope logic.
     */
    public function test_tenant_scoping_applied(): void
    {
        // 1. Setup two separate vendors
        $vendorA = Vendor::create(['name' => 'Vendor A']);
        $vendorB = Vendor::create(['name' => 'Vendor B']);

        // 2. Setup user bound to Vendor A
        $userA = User::create([
            'name' => 'User A',
            'email' => 'a@test.com',
            'password' => bcrypt('password'),
            'vendor_id' => $vendorA->id,
            'role' => 'vendor_admin',
            'is_active' => true,
        ]);

        // 3. Setup companies owned by both vendors
        Company::create([
            'vendor_id' => $vendorA->id,
            'company_code' => 'COA',
            'company_name' => 'Company A',
            'is_active' => true,
        ]);

        Company::create([
            'vendor_id' => $vendorB->id,
            'company_code' => 'COB',
            'company_name' => 'Company B',
            'is_active' => true,
        ]);

        // 4. Act: Authenticate User A and query Company list
        $this->actingAs($userA);

        $companies = Company::all();

        // 5. Assert: Tenant scope isolates Company B from query
        $this->assertCount(1, $companies);
        $this->assertEquals('COA', $companies->first()->company_code);
    }

    /**
     * Test creating a company with bank details and signer name.
     */
    public function test_company_can_be_created_with_bank_and_signer(): void
    {
        $vendor = Vendor::create(['name' => 'Vendor Test']);
        $user = User::create([
            'name' => 'User Test',
            'email' => 'test@test.com',
            'password' => bcrypt('password'),
            'vendor_id' => $vendor->id,
            'role' => 'vendor_admin',
            'is_active' => true,
        ]);

        $this->actingAs($user);

        $response = $this->postJson('/api/company', [
            'company_code' => 'TEST_COMP',
            'company_name' => 'Test Company Name',
            'bank_name' => 'Test Bank',
            'bank_branch' => 'Test Branch',
            'bank_account_no' => '1234567890',
            'bank_ifsc' => 'TEST0001234',
            'signer_name' => 'John Doe',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('companies', [
            'company_code' => 'TEST_COMP',
            'bank_name' => 'Test Bank',
            'bank_branch' => 'Test Branch',
            'bank_account_no' => '1234567890',
            'bank_ifsc' => 'TEST0001234',
            'signer_name' => 'John Doe',
        ]);
    }
}
