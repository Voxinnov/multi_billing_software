<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Subscription;
use App\Models\Vendor;
use App\Models\Company;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    /**
     * Retrieve all users in the system.
     */
    public function users(): JsonResponse
    {
        $users = User::with('vendor')->orderBy('created_at', 'desc')->get();
        $vendors = Vendor::all();
        
        return response()->json([
            'users' => $users,
            'vendors' => $vendors
        ]);
    }

    /**
     * Create a new user.
     */
    public function storeUser(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:super_admin,vendor_admin,staff,viewer',
            'vendor_id' => 'nullable|exists:vendors,id',
            'is_active' => 'required|boolean',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'vendor_id' => $request->role === 'super_admin' ? null : $request->vendor_id,
            'is_active' => $request->is_active,
        ]);

        return response()->json([
            'message' => 'User created successfully.',
            'user' => $user
        ]);
    }

    /**
     * Update an existing user's information.
     */
    public function updateUser(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'role' => 'required|in:super_admin,vendor_admin,staff,viewer',
            'vendor_id' => 'nullable|exists:vendors,id',
            'is_active' => 'required|boolean',
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'vendor_id' => $request->role === 'super_admin' ? null : $request->vendor_id,
            'is_active' => $request->is_active,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user
        ]);
    }

    /**
     * Delete a user.
     */
    public function destroyUser(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        if (auth()->id() === $user->id) {
            return response()->json(['message' => 'You cannot delete your own admin account.'], 400);
        }

        $user->delete();

        return response()->json([
            'message' => 'User account deleted successfully.'
        ]);
    }

    /**
     * Retrieve all subscriptions with options lookup lists.
     */
    public function subscriptions(): JsonResponse
    {
        $subscriptions = Subscription::with(['vendor', 'plan'])->orderBy('created_at', 'desc')->get();
        $vendors = Vendor::all();
        $plans = Plan::all();

        return response()->json([
            'subscriptions' => $subscriptions,
            'vendors' => $vendors,
            'plans' => $plans
        ]);
    }

    /**
     * Create a new subscription.
     */
    public function storeSubscription(Request $request): JsonResponse
    {
        $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'plan_id' => 'required|exists:plans,id',
            'starts_at' => 'required|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'status' => 'required|in:active,suspended',
        ]);

        $sub = Subscription::create([
            'vendor_id' => $request->vendor_id,
            'plan_id' => $request->plan_id,
            'starts_at' => $request->starts_at,
            'ends_at' => $request->ends_at,
            'status' => $request->status,
        ]);

        return response()->json([
            'message' => 'Subscription created successfully.',
            'subscription' => $sub
        ]);
    }

    /**
     * Update an existing subscription.
     */
    public function updateSubscription(Request $request, int $id): JsonResponse
    {
        $sub = Subscription::findOrFail($id);

        $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'plan_id' => 'required|exists:plans,id',
            'starts_at' => 'required|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'status' => 'required|in:active,suspended',
        ]);

        $sub->update([
            'vendor_id' => $request->vendor_id,
            'plan_id' => $request->plan_id,
            'starts_at' => $request->starts_at,
            'ends_at' => $request->ends_at,
            'status' => $request->status,
        ]);

        return response()->json([
            'message' => 'Subscription updated successfully.',
            'subscription' => $sub
        ]);
    }

    /**
     * Delete a subscription.
     */
    public function destroySubscription(int $id): JsonResponse
    {
        $sub = Subscription::findOrFail($id);
        $sub->delete();

        return response()->json([
            'message' => 'Subscription deleted successfully.'
        ]);
    }

    /**
     * Retrieve all vendors.
     */
    public function vendors(): JsonResponse
    {
        $vendors = Vendor::orderBy('created_at', 'desc')->get();
        return response()->json($vendors);
    }

    /**
     * Create a new Vendor.
     */
    public function storeVendor(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:vendors,name',
            'is_active' => 'required|boolean',
        ]);

        $vendor = Vendor::create([
            'name' => $request->name,
            'is_active' => $request->is_active,
        ]);

        return response()->json([
            'message' => 'Vendor created successfully.',
            'vendor' => $vendor
        ]);
    }

    /**
     * Update a Vendor.
     */
    public function updateVendor(Request $request, int $id): JsonResponse
    {
        $vendor = Vendor::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:vendors,name,' . $id,
            'is_active' => 'required|boolean',
        ]);

        $vendor->update([
            'name' => $request->name,
            'is_active' => $request->is_active,
        ]);

        return response()->json([
            'message' => 'Vendor updated successfully.',
            'vendor' => $vendor
        ]);
    }

    /**
     * Delete a Vendor.
     */
    public function destroyVendor(int $id): JsonResponse
    {
        $vendor = Vendor::findOrFail($id);
        $vendor->delete();

        return response()->json([
            'message' => 'Vendor account deleted successfully.'
        ]);
    }

    /**
     * Retrieve global stats for super admin dashboard.
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'vendors_count' => Vendor::count(),
            'companies_count' => Company::count(),
            'users_count' => User::count(),
            'active_subscriptions_count' => Subscription::where('status', 'active')->count(),
        ]);
    }

    /**
     * Retrieve customized role feature permissions.
     */
    public function getPermissions(): JsonResponse
    {
        $path = 'role_permissions.json';
        
        $defaultPermissions = [
            'super_admin' => ['manage_companies', 'upload_assets', 'compile_invoices', 'access_audit_logs', 'system_config', 'billing_subscriptions'],
            'vendor_admin' => ['manage_companies', 'upload_assets', 'compile_invoices', 'access_audit_logs', 'system_config'],
            'staff' => ['upload_assets', 'compile_invoices', 'access_audit_logs'],
            'viewer' => ['access_audit_logs']
        ];

        if (Storage::disk('local')->exists($path)) {
            try {
                $custom = json_decode(Storage::disk('local')->get($path), true);
                if (is_array($custom)) {
                    return response()->json(array_merge($defaultPermissions, $custom));
                }
            } catch (\Exception $e) {
                // Return default on failure
            }
        }

        return response()->json($defaultPermissions);
    }

    /**
     * Save customized role feature permissions.
     */
    public function updatePermissions(Request $request): JsonResponse
    {
        $request->validate([
            'permissions' => 'required|array'
        ]);

        $path = 'role_permissions.json';
        Storage::disk('local')->put($path, json_encode($request->permissions));

        return response()->json([
            'message' => 'Role permissions saved and updated successfully.'
        ]);
    }
}
