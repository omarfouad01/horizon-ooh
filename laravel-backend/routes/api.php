<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\DistrictController;
use App\Http\Controllers\Api\BillboardController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\AdFormatController;
use App\Http\Controllers\Api\ClientBrandController;
use App\Http\Controllers\Api\TrustStatController;
use App\Http\Controllers\Api\ProcessStepController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SettingController;

// ── Public endpoints ─────────────────────────────────────────────────────────

Route::get('/health', fn() => response()->json(['status' => 'ok', 'time' => now()->toISOString()]));

Route::post('/auth/login',  [AuthController::class, 'login']);
Route::post('/contact',     [ContactController::class, 'submit']);

Route::get('/locations',         [LocationController::class, 'index']);
Route::get('/locations/{slug}',  [LocationController::class, 'show']);
Route::get('/billboards',        [BillboardController::class, 'index']);
Route::get('/billboards/{slug}', [BillboardController::class, 'show']);
Route::get('/services',          [ServiceController::class, 'index']);
Route::get('/services/{slug}',   [ServiceController::class, 'show']);
Route::get('/projects',          [ProjectController::class, 'index']);
Route::get('/projects/{slug}',   [ProjectController::class, 'show']);
Route::get('/blog',              [BlogController::class, 'index']);
Route::get('/blog/{slug}',       [BlogController::class, 'show']);
Route::get('/ad-formats',        [AdFormatController::class, 'index']);
Route::get('/clients',           [ClientBrandController::class, 'index']);
Route::get('/trust-stats',       [TrustStatController::class, 'index']);
Route::get('/process-steps',     [ProcessStepController::class, 'index']);
Route::get('/settings',          [SettingController::class, 'index']);

// ── Authenticated (admin) endpoints ──────────────────────────────────────────

Route::middleware('auth:api')->group(function () {

    Route::post  ('/auth/logout', [AuthController::class, 'logout']);
    Route::get   ('/auth/me',     [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard/stats', [SettingController::class, 'dashboardStats']);
    Route::put('/settings',        [SettingController::class, 'bulkUpdate']);

    // Locations & Districts
    Route::post  ('/locations',           [LocationController::class, 'store']);
    Route::put   ('/locations/{id}',      [LocationController::class, 'update']);
    Route::delete('/locations/{id}',      [LocationController::class, 'destroy']);
    Route::get   ('/districts',           [DistrictController::class, 'index']);
    Route::post  ('/districts',           [DistrictController::class, 'store']);
    Route::put   ('/districts/{id}',      [DistrictController::class, 'update']);
    Route::delete('/districts/{id}',      [DistrictController::class, 'destroy']);

    // Billboards
    Route::get   ('/billboards/next-code',      [BillboardController::class, 'nextCode']);
    Route::post  ('/billboards',                [BillboardController::class, 'store']);
    Route::put   ('/billboards/{id}',           [BillboardController::class, 'update']);
    Route::delete('/billboards/{id}',           [BillboardController::class, 'destroy']);
    Route::delete('/billboards/{id}/images',    [BillboardController::class, 'deleteImage']);

    // Services
    Route::post  ('/services',       [ServiceController::class, 'store']);
    Route::put   ('/services/{id}',  [ServiceController::class, 'update']);
    Route::delete('/services/{id}',  [ServiceController::class, 'destroy']);

    // Projects
    Route::post  ('/projects',       [ProjectController::class, 'store']);
    Route::put   ('/projects/{id}',  [ProjectController::class, 'update']);
    Route::delete('/projects/{id}',  [ProjectController::class, 'destroy']);

    // Blog
    Route::post  ('/blog',       [BlogController::class, 'store']);
    Route::put   ('/blog/{id}',  [BlogController::class, 'update']);
    Route::delete('/blog/{id}',  [BlogController::class, 'destroy']);

    // Contact enquiries
    Route::get   ('/contacts',         [ContactController::class, 'index']);
    Route::put   ('/contacts/{id}',    [ContactController::class, 'update']);
    Route::delete('/contacts/{id}',    [ContactController::class, 'destroy']);

    // Ad Formats
    Route::post  ('/ad-formats',       [AdFormatController::class, 'store']);
    Route::put   ('/ad-formats/{id}',  [AdFormatController::class, 'update']);
    Route::delete('/ad-formats/{id}',  [AdFormatController::class, 'destroy']);

    // Clients / Brands
    Route::post  ('/clients',       [ClientBrandController::class, 'store']);
    Route::put   ('/clients/{id}',  [ClientBrandController::class, 'update']);
    Route::delete('/clients/{id}',  [ClientBrandController::class, 'destroy']);

    // Trust Stats & Process Steps
    Route::post  ('/trust-stats',         [TrustStatController::class, 'store']);
    Route::put   ('/trust-stats/{id}',    [TrustStatController::class, 'update']);
    Route::delete('/trust-stats/{id}',    [TrustStatController::class, 'destroy']);
    Route::post  ('/process-steps',       [ProcessStepController::class, 'store']);
    Route::put   ('/process-steps/{id}',  [ProcessStepController::class, 'update']);
    Route::delete('/process-steps/{id}',  [ProcessStepController::class, 'destroy']);

    // Suppliers & Customers
    Route::apiResource('/suppliers', SupplierController::class)->except(['show']);
    Route::apiResource('/customers', CustomerController::class)->except(['show']);

    // Users
    Route::get   ('/users',       [UserController::class, 'index']);
    Route::post  ('/users',       [UserController::class, 'store']);
    Route::put   ('/users/{id}',  [UserController::class, 'update']);
    Route::delete('/users/{id}',  [UserController::class, 'destroy']);
});
