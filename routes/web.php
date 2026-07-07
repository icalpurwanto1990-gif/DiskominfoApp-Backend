<?php

use App\Http\Controllers\AdminApiController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AgendaController;
use App\Http\Controllers\AiChatController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BeritaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GisController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\KontakController;
use App\Http\Controllers\LayananController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\PpidController;
use App\Http\Controllers\ProfilController;
use App\Http\Controllers\SatuDataController;
use App\Http\Controllers\SurveyController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Client Frontend Views (Inertia Render)
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/agenda', [AgendaController::class, 'index'])->name('agenda.index');
Route::get('/profil', [ProfilController::class, 'index'])->name('profil');
Route::get('/media', [MediaController::class, 'index'])->name('media');
Route::get('/berita', [BeritaController::class, 'index'])->name('berita.index');
Route::get('/berita/{slug}', [BeritaController::class, 'show'])->name('berita.show');
Route::get('/ppid', [PpidController::class, 'index'])->name('ppid.index');
Route::get('/ppid/berkala', [PpidController::class, 'berkala'])->name('ppid.berkala');
Route::get('/ppid/serta-merta', [PpidController::class, 'sertaMerta'])->name('ppid.serta-merta');
Route::get('/ppid/setiap-saat', [PpidController::class, 'setiapSaat'])->name('ppid.setiap-saat');
Route::get('/ppid/daftar-informasi-publik', [PpidController::class, 'daftarInformasiPublik'])->name('ppid.daftar-informasi-publik');
Route::get('/ppid/sop-pelayanan', [PpidController::class, 'sopPelayanan'])->name('ppid.sop-pelayanan');
Route::get('/layanan', [LayananController::class, 'index'])->name('layanan.index');
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index'); // Smart Gov
Route::get('/satu-data', [SatuDataController::class, 'index'])->name('satudata.index');
Route::get('/gis', [GisController::class, 'index'])->name('gis.index');
Route::get('/kontak', [KontakController::class, 'index'])->name('kontak.index');
Route::post('/api/kontak', [KontakController::class, 'store'])->name('api.kontak');

// Survey & AI Chat client actions
Route::post('/api/survey', [SurveyController::class, 'store'])->name('api.survey');
Route::get('/api/survey/categories', [SurveyController::class, 'apiCategories']);
Route::get('/api/leader-agendas', [AgendaController::class, 'apiAgendas']);
Route::post('/api/ai-chat', [AiChatController::class, 'reply'])->name('api.aichat');

// Auth Routes (React Inertia Views)
Route::get('/auth/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/api/auth/login', [AuthController::class, 'login'])->name('api.login');
Route::post('/api/auth/logout', [AuthController::class, 'logout'])->name('api.logout');
Route::get('/auth/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/api/auth/register', [AuthController::class, 'register'])->name('api.register');
Route::get('/auth/verify/{token}', [AuthController::class, 'verifyEmail'])->name('auth.verify');
Route::get('/auth/forgot-password', [AuthController::class, 'showForgotPassword'])->name('password.request');
Route::get('/auth/reset-password/{token}', [AuthController::class, 'showResetPassword'])->name('password.reset');
Route::post('/api/auth/forgot-password', [AuthController::class, 'sendResetLinkEmail'])->name('api.password.email');
Route::post('/api/auth/reset-password', [AuthController::class, 'resetPassword'])->name('api.password.update');

// Admin Panel View Routes (Disabled to restore Filament admin panel)
/*
Route::middleware(['admin'])->prefix('admin')->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/banners', [AdminController::class, 'banners'])->name('admin.banners');
    Route::get('/profil-staff', [AdminController::class, 'profilStaff'])->name('admin.profil');
    Route::get('/berita', [AdminController::class, 'berita'])->name('admin.berita');
    Route::get('/ppid', [AdminController::class, 'ppid'])->name('admin.ppid');
    Route::get('/layanan', [AdminController::class, 'layanan'])->name('admin.layanan');
    Route::get('/satu-data', [AdminController::class, 'satuData'])->name('admin.satudata');
    Route::get('/gis', [AdminController::class, 'gis'])->name('admin.gis');
    Route::get('/media', [AdminController::class, 'media'])->name('admin.media');
    Route::get('/users', [AdminController::class, 'users'])->name('admin.users');
    Route::get('/survey', [AdminController::class, 'survey'])->name('admin.survey');
    Route::get('/audit-log', [AdminController::class, 'auditLog'])->name('admin.auditlog');
});
*/

// User Dashboard Portal Routes (Applicants & OPDs)
Route::middleware(['auth'])->group(function () {
    Route::get('/user/dashboard', [UserController::class, 'dashboard'])->name('user.dashboard');
    Route::get('/user/requests', [UserController::class, 'getRequests'])->name('user.requests');
    Route::post('/api/user/tte', [UserController::class, 'storeTteRequest']);
    Route::post('/api/user/tte/update', [UserController::class, 'updateTteRequest']);
});

// Client Web API JSON Endpoints
Route::prefix('api')->group(function () {
    Route::get('/berita', [BeritaController::class, 'apiIndex']);
    Route::get('/dokumen', [PpidController::class, 'apiDokumen']);
    Route::post('/ppid/permohonan', [PpidController::class, 'storePermohonan']);
    Route::post('/ppid/keberatan', [PpidController::class, 'storeKeberatan']);
    Route::get('/layanan', [LayananController::class, 'apiIndex']);
    Route::post('/layanan/pengajuan', [LayananController::class, 'storePengajuan']);
    Route::get('/layanan/pengajuan', [LayananController::class, 'apiPengajuanIndex']);
    Route::get('/satu-data', [SatuDataController::class, 'apiIndex']);
    Route::get('/gis', [GisController::class, 'apiIndex']);
    Route::get('/gis/stats', [GisController::class, 'apiStats']);
    Route::get('/dashboard/stats', [DashboardController::class, 'apiStats']);
    Route::get('/dashboard/tte-stats', [DashboardController::class, 'apiTteStats']);
    Route::post('/upload', [UploadController::class, 'store']);

    // Admin API Endpoints
    Route::middleware(['admin'])->prefix('admin')->group(function () {
        Route::get('/stats', [AdminApiController::class, 'stats']);
        Route::get('/banners', [AdminApiController::class, 'getBanners']);
        Route::post('/banners', [AdminApiController::class, 'saveBanner']);
        Route::delete('/banners/{id}', [AdminApiController::class, 'deleteBanner']);
        Route::post('/profile', [AdminApiController::class, 'updateProfileContent']);
        Route::post('/profil/update', [AdminApiController::class, 'updateProfileContent']);
        Route::get('/staff', [AdminApiController::class, 'getStaff']);
        Route::post('/staff', [AdminApiController::class, 'saveStaff']);
        Route::delete('/staff/{id}', [AdminApiController::class, 'deleteStaff']);
        Route::get('/posts', [AdminApiController::class, 'getPosts']);
        Route::post('/posts', [AdminApiController::class, 'savePost']);
        Route::delete('/posts/{id}', [AdminApiController::class, 'deletePost']);
        Route::get('/categories', [AdminApiController::class, 'getCategories']);
        Route::post('/categories', [AdminApiController::class, 'saveCategory']);
        Route::delete('/categories/{id}', [AdminApiController::class, 'deleteCategory']);
        Route::get('/tags', [AdminApiController::class, 'getTags']);
        Route::post('/tags', [AdminApiController::class, 'saveTag']);
        Route::delete('/tags/{id}', [AdminApiController::class, 'deleteTag']);
        Route::get('/ppid-requests', [AdminApiController::class, 'getPpidRequests']);
        Route::put('/ppid-requests/{id}/status', [AdminApiController::class, 'updatePpidRequestStatus']);
        Route::get('/ppid-objections', [AdminApiController::class, 'getPpidObjections']);
        Route::put('/ppid-objections/{id}/status', [AdminApiController::class, 'updatePpidObjectionStatus']);
        Route::get('/documents', [AdminApiController::class, 'getDocuments']);
        Route::post('/documents', [AdminApiController::class, 'saveDocument']);
        Route::delete('/documents/{id}', [AdminApiController::class, 'deleteDocument']);
        Route::get('/services', [AdminApiController::class, 'getServices']);
        Route::post('/services', [AdminApiController::class, 'saveService']);
        Route::delete('/services/{id}', [AdminApiController::class, 'deleteService']);
        Route::get('/service-requests', [AdminApiController::class, 'getServiceRequests']);
        Route::put('/service-requests/{id}/status', [AdminApiController::class, 'updateServiceRequestStatus']);
        Route::get('/datasets', [AdminApiController::class, 'getDatasets']);
        Route::post('/datasets', [AdminApiController::class, 'saveDataset']);
        Route::delete('/datasets/{id}', [AdminApiController::class, 'deleteDataset']);
        Route::get('/gis', [AdminApiController::class, 'getGisInfrastructures']);
        Route::post('/gis', [AdminApiController::class, 'saveGisInfrastructure']);
        Route::delete('/gis/{id}', [AdminApiController::class, 'deleteGisInfrastructure']);
        Route::get('/media', [AdminApiController::class, 'getMediaDb']);
        Route::post('/media', [AdminApiController::class, 'saveMediaDb']);
        Route::delete('/media/{id}', [AdminApiController::class, 'deleteMediaDb']);
        Route::get('/media-files', [AdminApiController::class, 'getMediaFiles']);
        Route::post('/media-files', [AdminApiController::class, 'uploadMediaFile']);
        Route::delete('/media-files/{filename}', [AdminApiController::class, 'deleteMediaFile']);
        Route::get('/users', [AdminApiController::class, 'getUsers']);
        Route::post('/users', [AdminApiController::class, 'saveUser']);
        Route::delete('/users/{id}', [AdminApiController::class, 'deleteUser']);
        // New endpoints
        Route::get('/audit-logs', [AdminApiController::class, 'getAuditLogs']);
        Route::get('/survey-responses', [AdminApiController::class, 'getSurveyResponses']);
        Route::delete('/survey-responses/{id}', [AdminApiController::class, 'deleteSurveyResponse']);
    });
});
