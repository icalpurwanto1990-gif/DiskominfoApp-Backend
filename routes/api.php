<?php

use App\Http\Controllers\Api\InteropAgendaController;
use App\Http\Controllers\Api\InteropServiceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SPBE Interoperability Routes (MPP & External G2G Gateways)
|--------------------------------------------------------------------------
|
| Base URL: /api/v1/interop/*
| Autentikasi: Header X-API-KEY atau Bearer Token (dikelola via Panel Admin)
|
*/

// Health check / Ping endpoint (Bebas tanpa autentikasi untuk uji gateway)
Route::get('/v1/interop/ping', function () {
    return response()->json([
        'success'   => true,
        'code'      => 200,
        'service'   => 'Diskominfo Banggai Kepulauan SPBE Interoperability API',
        'status'    => 'HEALTHY',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Protected Interoperability Endpoints
Route::prefix('v1/interop')->middleware(['verify.api.key'])->group(function () {

    // 1. Modul Agenda Pimpinan (Untuk Display & Layanan MPP)
    Route::prefix('agenda')->group(function () {
        Route::get('/', [InteropAgendaController::class, 'index'])->middleware('verify.api.key:agenda:read');
        Route::get('/{id}', [InteropAgendaController::class, 'show'])->middleware('verify.api.key:agenda:read');
        Route::post('/request', [InteropAgendaController::class, 'storeRequest'])->middleware('verify.api.key:agenda:write');
    });

    // 2. Modul Layanan Diskominfo (Katalog, Pengajuan, dan Cek Status untuk MPP)
    Route::prefix('services')->group(function () {
        Route::get('/', [InteropServiceController::class, 'index'])->middleware('verify.api.key:service:read');
        Route::post('/apply', [InteropServiceController::class, 'apply'])->middleware('verify.api.key:service:apply');
        Route::get('/status/{query}', [InteropServiceController::class, 'status']);
    });
});
