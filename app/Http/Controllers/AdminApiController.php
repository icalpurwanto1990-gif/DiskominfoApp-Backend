<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Dataset;
use App\Models\DigitalService;
use App\Models\Document;
use App\Models\GisInfrastructure;
use App\Models\Media;
use App\Models\Post;
use App\Models\PpidObjection;
use App\Models\PpidRequest;
use App\Models\ProfileContent;
use App\Models\ServiceRequest;
use App\Models\Staff;
use App\Models\SurveyResponse;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;

class AdminApiController extends Controller
{
    // ==========================================
    // AUDIT LOG HELPER
    // ==========================================
    private function logAudit(Request $request, string $action, string $module, string $description): void
    {
        try {
            $adminName = $request->header('X-Admin-Name', 'Administrator');
            $adminRole = $request->header('X-Admin-Role', 'ADMIN');
            AuditLog::create([
                'id'        => (string) Str::uuid(),
                'userId'    => auth()->id(),
                'action'    => $action,
                'details'   => "[$module] $description (Aktor: $adminName, Role: $adminRole)",
                'ipAddress' => $request->ip(),
                'createdAt' => now(),
            ]);
        } catch (\Exception $e) {
            // Log write failure should never break the main operation
            \Log::warning('AuditLog write failed: ' . $e->getMessage());
        }
    }

    // ==========================================
    // 1. DASHBOARD STATS
    // ==========================================
    public function stats()
    {
        try {
            $totalNews = Post::count();
            $totalDatasets = Dataset::count();
            $totalGis = GisInfrastructure::count();
            $pendingPpid = PpidRequest::where('status', 'PENDING')->count();
            $pendingService = ServiceRequest::where('status', 'PENDING')->count();
            $totalUsers = User::count();

            return response()->json([
                'success' => true,
                'stats' => [
                    'totalNews' => $totalNews,
                    'totalDatasets' => $totalDatasets,
                    'totalGis' => $totalGis,
                    'pendingPpid' => $pendingPpid,
                    'pendingService' => $pendingService,
                    'totalUsers' => $totalUsers,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 2. BANNERS CRUD
    // ==========================================
    public function getBanners()
    {
        return response()->json(Banner::orderBy('orderIndex', 'asc')->get());
    }

    public function saveBanner(Request $request)
    {
        try {
            $validated = $request->validate([
                'id' => 'nullable|string',
                'title' => 'required|string',
                'description' => 'nullable|string',
                'imageUrl' => 'required|string',
                'linkUrl' => 'nullable|string',
                'active' => 'required|boolean',
                'orderIndex' => 'required|integer',
            ]);

            $id = $validated['id'] ?? (string) Str::uuid();

            $banner = Banner::updateOrCreate(
                ['id' => $id],
                [
                    'title' => $validated['title'],
                    'description' => $validated['description'] ?? '',
                    'imageUrl' => $validated['imageUrl'],
                    'linkUrl' => $validated['linkUrl'] ?? '',
                    'active' => $validated['active'],
                    'orderIndex' => $validated['orderIndex'],
                ]
            );

            $this->logAudit($request, $validated['id'] ? 'UPDATE' : 'CREATE', 'BANNER', "Banner '{$validated['title']}' berhasil disimpan.");
            return response()->json(['success' => true, 'banner' => $banner]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function deleteBanner($id)
    {
        try {
            $banner = Banner::find($id);
            if ($banner) {
                $this->logAudit(request(), 'DELETE', 'BANNER', "Banner ID '{$id}' dihapus.");
                $banner->delete();
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 3. PROFILE & STAFF CRUD
    // ==========================================
    public function updateProfileContent(Request $request)
    {
        try {
            $data = $request->all();
            foreach ($data as $key => $value) {
                ProfileContent::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value ?? '']
                );
            }
            $this->logAudit($request, 'UPDATE', 'PROFIL', "Sambutan Kepala Dinas / Profil Dinas diperbarui.");
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function getStaff()
    {
        return response()->json(Staff::orderBy('orderIndex', 'asc')->get());
    }

    public function saveStaff(Request $request)
    {
        try {
            $validated = $request->validate([
                'id' => 'nullable|string',
                'name' => 'required|string',
                'nip' => 'nullable|string',
                'position' => 'required|string',
                'photoUrl' => 'nullable|string',
                'orderIndex' => 'required|integer',
            ]);

            $id = $validated['id'] ?? (string) Str::uuid();

            $staff = Staff::updateOrCreate(
                ['id' => $id],
                [
                    'name' => $validated['name'],
                    'nip' => $validated['nip'] ?? '',
                    'position' => $validated['position'],
                    'photoUrl' => $validated['photoUrl'] ?? '',
                    'orderIndex' => $validated['orderIndex'],
                ]
            );

            return response()->json(['success' => true, 'staff' => $staff]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function deleteStaff($id)
    {
        try {
            $staff = Staff::find($id);
            if ($staff) {
                $name = $staff->name;
                $staff->delete();
                $this->logAudit(request(), 'DELETE', 'PROFIL', "Data pegawai/staf '{$name}' dihapus.");
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 4. BERITA & PUBLIKASI (POSTS, CATEGORIES, TAGS)
    // ==========================================
    public function getPosts()
    {
        return response()->json(Post::with(['category', 'tags'])->orderBy('createdAt', 'desc')->get());
    }

    public function savePost(Request $request)
    {
        try {
            $validated = $request->validate([
                'id' => 'nullable|string',
                'title' => 'required|string',
                'content' => 'required|string',
                'image' => 'nullable|string',
                'published' => 'required|boolean',
                'categoryId' => 'required|string',
                'tags' => 'nullable|array',
            ]);

            $id = $validated['id'] ?? (string) Str::uuid();
            $slug = Str::slug($validated['title']);

            // Simple check to prevent slug duplication
            $existing = Post::where('slug', $slug)->where('id', '!=', $id)->first();
            if ($existing) {
                $slug .= '-' . rand(10, 99);
            }

            // Find current user or fallback to first superadmin/user
            $authorId = auth()->id();
            if (!$authorId) {
                $author = User::where('role', 'SUPERADMIN')->orWhere('role', 'ADMIN')->first();
                $authorId = $author ? $author->id : (User::first()->id ?? null);
            }

            $post = Post::updateOrCreate(
                ['id' => $id],
                [
                    'title' => $validated['title'],
                    'slug' => $slug,
                    'content' => $validated['content'],
                    'image' => $validated['image'] ?? '',
                    'published' => $validated['published'],
                    'categoryId' => $validated['categoryId'],
                    'authorId' => $authorId,
                ]
            );

            // Sync tags
            if (isset($validated['tags'])) {
                $post->tags()->sync($validated['tags']);
            }

            $this->logAudit($request, $validated['id'] ? 'UPDATE' : 'CREATE', 'BERITA', "Post '{$validated['title']}' berhasil disimpan.");
            return response()->json(['success' => true, 'post' => Post::with(['category', 'tags'])->find($post->id)]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function deletePost($id)
    {
        try {
            $post = Post::find($id);
            if ($post) {
                $title = $post->title;
                $post->tags()->detach();
                $post->delete();
                $this->logAudit(request(), 'DELETE', 'BERITA', "Post '{$title}' dihapus.");
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function getCategories()
    {
        return response()->json(Category::orderBy('name', 'asc')->get());
    }

    public function saveCategory(Request $request)
    {
        try {
            $validated = $request->validate([
                'id' => 'nullable|string',
                'name' => 'required|string',
            ]);

            $id = $validated['id'] ?? (string) Str::uuid();
            $slug = Str::slug($validated['name']);

            $cat = Category::updateOrCreate(
                ['id' => $id],
                [
                    'name' => $validated['name'],
                    'slug' => $slug
                ]
            );

            return response()->json(['success' => true, 'category' => $cat]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function deleteCategory($id)
    {
        try {
            $cat = Category::find($id);
            if ($cat) {
                $name = $cat->name;
                $cat->delete();
                $this->logAudit(request(), 'DELETE', 'BERITA', "Kategori berita '{$name}' dihapus.");
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function getTags()
    {
        return response()->json(Tag::orderBy('name', 'asc')->get());
    }

    public function saveTag(Request $request)
    {
        try {
            $validated = $request->validate([
                'id' => 'nullable|string',
                'name' => 'required|string',
            ]);

            $id = $validated['id'] ?? (string) Str::uuid();
            $slug = Str::slug($validated['name']);

            $tag = Tag::updateOrCreate(
                ['id' => $id],
                [
                    'name' => $validated['name'],
                    'slug' => $slug
                ]
            );

            return response()->json(['success' => true, 'tag' => $tag]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function deleteTag($id)
    {
        try {
            $tag = Tag::find($id);
            if ($tag) {
                $name = $tag->name;
                $tag->delete();
                $this->logAudit(request(), 'DELETE', 'BERITA', "Tag berita '{$name}' dihapus.");
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 5. PPID & DOCUMENTS MANAGEMENT
    // ==========================================
    public function getPpidRequests()
    {
        return response()->json(PpidRequest::orderBy('createdAt', 'desc')->get());
    }

    public function updatePpidRequestStatus($id, Request $request)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:PENDING,DIPROSES,SELESAI,DITOLAK',
                'response' => 'nullable|string',
                'attachment' => 'nullable|string',
            ]);

            $req = PpidRequest::findOrFail($id);
            $req->update([
                'status' => $validated['status'],
                'response' => $validated['response'] ?? '',
                'attachment' => $validated['attachment'] ?? '',
            ]);

            return response()->json(['success' => true, 'request' => $req]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function getPpidObjections()
    {
        return response()->json(PpidObjection::with('request')->orderBy('createdAt', 'desc')->get());
    }

    public function updatePpidObjectionStatus($id, Request $request)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:PENDING,DIPROSES,SELESAI,DITOLAK',
                'response' => 'nullable|string',
            ]);

            $objection = PpidObjection::findOrFail($id);
            $objection->update([
                'status' => $validated['status'],
                'response' => $validated['response'] ?? '',
            ]);

            return response()->json(['success' => true, 'objection' => $objection]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function getDocuments()
    {
        return response()->json(Document::orderBy('createdAt', 'desc')->get());
    }

    public function saveDocument(Request $request)
    {
        try {
            $validated = $request->validate([
                'id' => 'nullable|string',
                'title' => 'required|string',
                'fileType' => 'required|string',
                'fileUrl' => 'required|string',
                'description' => 'nullable|string',
            ]);

            $id = $validated['id'] ?? (string) Str::uuid();

            $doc = Document::updateOrCreate(
                ['id' => $id],
                [
                    'title' => $validated['title'],
                    'fileType' => $validated['fileType'],
                    'fileUrl' => $validated['fileUrl'],
                    'description' => $validated['description'] ?? '',
                ]
            );

            return response()->json(['success' => true, 'document' => $doc]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function deleteDocument($id)
    {
        try {
            $doc = Document::find($id);
            if ($doc) {
                $title = $doc->title;
                $doc->delete();
                $this->logAudit(request(), 'DELETE', 'PPID', "Dokumen PPID '{$title}' dihapus.");
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 6. LAYANAN DIGITAL & REQUEST TICKETS
    // ==========================================
    public function getServices()
    {
        return response()->json(DigitalService::orderBy('createdAt', 'asc')->get());
    }

    public function saveService(Request $request)
    {
        try {
            $validated = $request->validate([
                'id' => 'nullable|string',
                'name' => 'required|string',
                'description' => 'required|string',
                'icon' => 'nullable|string',
                'requirements' => 'nullable|array',
                'active' => 'required|boolean',
            ]);

            $id = $validated['id'] ?? (string) Str::uuid();
            $slug = Str::slug($validated['name']);

            $service = DigitalService::updateOrCreate(
                ['id' => $id],
                [
                    'title' => $validated['name'],
                    'slug' => $slug,
                    'description' => $validated['description'],
                    'icon' => $validated['icon'] ?? 'Globe',
                    'color' => 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                    'active' => $validated['active'],
                ]
            );

            return response()->json(['success' => true, 'service' => $service]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function deleteService($id)
    {
        try {
            $service = DigitalService::find($id);
            if ($service) {
                $title = $service->title;
                $service->delete();
                $this->logAudit(request(), 'DELETE', 'LAYANAN', "Layanan digital '{$title}' dihapus.");
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function getServiceRequests()
    {
        return response()->json(ServiceRequest::orderBy('createdAt', 'desc')->get());
    }

    public function updateServiceRequestStatus($id, Request $request)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:PENDING,DIPROSES,SELESAI,DITOLAK',
                'notes' => 'nullable|string',
            ]);

            $req = ServiceRequest::findOrFail($id);
            $req->update([
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? '',
            ]);

            return response()->json(['success' => true, 'request' => $req]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 7. SATU DATA CRUD
    // ==========================================
    public function getDatasets()
    {
        return response()->json(Dataset::orderBy('createdAt', 'desc')->get());
    }

    public function saveDataset(Request $request)
    {
        try {
            $validated = $request->validate([
                'id' => 'nullable|string',
                'title' => 'required|string',
                'description' => 'required|string',
                'category' => 'required|string',
                'metadata' => 'required|array',
                'fileUrl' => 'nullable|string',
                'jsonData' => 'nullable|array',
            ]);

            $id = $validated['id'] ?? (string) Str::uuid();
            $slug = Str::slug($validated['title']);

            $dataset = Dataset::updateOrCreate(
                ['id' => $id],
                [
                    'title' => $validated['title'],
                    'slug' => $slug,
                    'description' => $validated['description'],
                    'category' => $validated['category'],
                    'metadata' => $validated['metadata'],
                    'fileUrl' => $validated['fileUrl'] ?? '',
                    'jsonData' => $validated['jsonData'] ?? [],
                ]
            );

            return response()->json(['success' => true, 'dataset' => $dataset]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function deleteDataset($id)
    {
        try {
            $dataset = Dataset::find($id);
            if ($dataset) {
                $title = $dataset->title;
                $dataset->delete();
                $this->logAudit(request(), 'DELETE', 'SATU_DATA', "Dataset '{$title}' dihapus.");
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 8. PETA GIS MARKERS CRUD
    // ==========================================
    public function getGisInfrastructures()
    {
        return response()->json(GisInfrastructure::orderBy('createdAt', 'desc')->get());
    }

    public function saveGisInfrastructure(Request $request)
    {
        try {
            $validated = $request->validate([
                'id' => 'nullable|string',
                'name' => 'required|string',
                'type' => 'required|in:BTS_TOWER,BLANKSPOT,VSAT,FIBER_OPTIK',
                'latitude' => 'required|numeric',
                'longitude' => 'required|numeric',
                'status' => 'required|string',
                'details' => 'nullable|array',
            ]);

            $id = $validated['id'] ?? (string) Str::uuid();

            $infra = GisInfrastructure::updateOrCreate(
                ['id' => $id],
                [
                    'name' => $validated['name'],
                    'type' => $validated['type'],
                    'latitude' => $validated['latitude'],
                    'longitude' => $validated['longitude'],
                    'status' => $validated['status'],
                    'details' => $validated['details'] ?? [],
                ]
            );

            return response()->json(['success' => true, 'gisInfrastructure' => $infra]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function deleteGisInfrastructure($id)
    {
        try {
            $infra = GisInfrastructure::find($id);
            if ($infra) {
                $name = $infra->name;
                $infra->delete();
                $this->logAudit(request(), 'DELETE', 'GIS', "Titik sebaran GIS '{$name}' dihapus.");
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 9. DATABASE MEDIA GALLERY CRUD
    // ==========================================
    public function getMediaDb()
    {
        try {
            $media = Media::orderBy('createdAt', 'desc')->get();
            return response()->json($media);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function saveMediaDb(Request $request)
    {
        try {
            $validated = $request->validate([
                'id' => 'nullable|string',
                'title' => 'required|string',
                'type' => 'required|in:FOTO,VIDEO,INFOGRAFIS',
                'url' => 'required|string',
                'meta' => 'nullable|string',
            ]);

            $id = $validated['id'] ?? (string) Str::uuid();

            $media = Media::updateOrCreate(
                ['id' => $id],
                [
                    'title' => $validated['title'],
                    'type' => $validated['type'],
                    'url' => $validated['url'],
                    'meta' => $validated['meta'] ?? '',
                ]
            );

            $this->logAudit($request, $validated['id'] ? 'UPDATE' : 'CREATE', 'MEDIA', "Media database '{$validated['title']}' ({$validated['type']}) disimpan.");
            return response()->json(['success' => true, 'media' => $media]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function deleteMediaDb($id)
    {
        try {
            $media = Media::find($id);
            if ($media) {
                $title = $media->title;
                $type = $media->type;
                $media->delete();
                $this->logAudit(request(), 'DELETE', 'MEDIA', "Media database '{$title}' ({$type}) dihapus.");
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 9B. FILESYSTEM UPLOADS FILE BROWSER
    // ==========================================
    public function getMediaFiles()
    {
        try {
            $dir = public_path('uploads');
            if (!File::exists($dir)) {
                File::makeDirectory($dir, 0755, true);
            }

            $files = File::files($dir);
            $mediaList = [];

            foreach ($files as $file) {
                $filename = $file->getFilename();
                $mediaList[] = [
                    'name' => $filename,
                    'url' => '/uploads/' . $filename,
                    'size' => $file->getSize(),
                    'updatedAt' => date('Y-m-d H:i:s', $file->getMTime()),
                ];
            }

            // Order by updated date desc
            usort($mediaList, function ($a, $b) {
                return strcmp($b['updatedAt'], $a['updatedAt']);
            });

            return response()->json($mediaList);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function uploadMediaFile(Request $request)
    {
        try {
            if (!$request->hasFile('file')) {
                return response()->json(['success' => false, 'error' => 'No file uploaded'], 400);
            }

            $file = $request->file('file');
            $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9.]/', '_', $file->getClientOriginalName());
            
            $file->move(public_path('uploads'), $filename);

            $url = '/uploads/' . $filename;
            $this->logAudit($request, 'CREATE', 'MEDIA', "File media '{$filename}' diunggah ke server.");

            return response()->json([
                'success' => true,
                'media' => [
                    'name' => $filename,
                    'url' => $url,
                    'size' => File::size(public_path('uploads/' . $filename)),
                    'updatedAt' => date('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function deleteMediaFile($filename)
    {
        try {
            // sanitize filename to prevent dir traversal
            $filename = basename($filename);
            $filePath = public_path('uploads/' . $filename);
            
            if (File::exists($filePath)) {
                File::delete($filePath);
                $this->logAudit(request(), 'DELETE', 'MEDIA', "Media file '{$filename}' dihapus.");
                return response()->json(['success' => true]);
            }
            
            return response()->json(['success' => false, 'error' => 'File tidak ditemukan.'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 10. USER ACCOUNT MANAGEMENT CRUD
    // ==========================================
    public function getUsers()
    {
        return response()->json(User::orderBy('createdAt', 'desc')->get());
    }

    public function saveUser(Request $request)
    {
        try {
            $validated = $request->validate([
                'id' => 'nullable|string',
                'name' => 'required|string',
                'email' => 'required|email',
                'password' => 'nullable|string|min:6',
                'role' => 'required|in:SUPERADMIN,ADMIN,USER',
                'nip' => 'nullable|string',
                'jabatan' => 'nullable|string',
                'instansi' => 'nullable|string',
            ]);

            $id = $validated['id'] ?? (string) Str::uuid();
            
            // Check if email already exists
            $existing = User::where('email', $validated['email'])->where('id', '!=', $id)->first();
            if ($existing) {
                return response()->json(['success' => false, 'error' => 'Alamat email sudah terdaftar.'], 422);
            }

            $updateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'role' => $validated['role'],
                'nip' => $validated['nip'] ?? '',
                'jabatan' => $validated['jabatan'] ?? '',
                'instansi' => $validated['instansi'] ?? '',
            ];

            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            $user = User::updateOrCreate(
                ['id' => $id],
                $updateData
            );

            return response()->json(['success' => true, 'user' => $user]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function deleteUser($id)
    {
        try {
            $user = User::find($id);
            if ($user) {
                // Prevent self deletion if logged in
                if (auth()->id() === $user->id) {
                    return response()->json(['success' => false, 'error' => 'Anda tidak bisa menghapus akun sendiri.'], 403);
                }
                $name = $user->name;
                $user->delete();
                $this->logAudit(request(), 'DELETE', 'USER', "Akun user '{$name}' dihapus.");
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 11. AUDIT LOG
    // ==========================================
    public function getAuditLogs(Request $request)
    {
        try {
            $query = AuditLog::orderBy('createdAt', 'desc');

            if ($request->query('module')) {
                $query->where('module', $request->query('module'));
            }
            if ($request->query('action')) {
                $query->where('action', $request->query('action'));
            }
            if ($request->query('search')) {
                $search = $request->query('search');
                $query->where(function ($q) use ($search) {
                    $q->where('description', 'LIKE', "%{$search}%")
                      ->orWhere('adminName', 'LIKE', "%{$search}%");
                });
            }

            $limit = (int) $request->query('limit', 50);
            $logs = $query->limit($limit)->get();

            return response()->json(['success' => true, 'logs' => $logs, 'total' => AuditLog::count()]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 12. SURVEY KEPUASAN
    // ==========================================
    public function getSurveyResponses(Request $request)
    {
        try {
            $query = SurveyResponse::orderBy('createdAt', 'desc');

            if ($request->query('rating')) {
                $query->where('rating', (int) $request->query('rating'));
            }
            if ($request->query('category')) {
                $query->where('category', $request->query('category'));
            }
            if ($request->query('period') === '7') {
                $query->where('createdAt', '>=', now()->subDays(7));
            } elseif ($request->query('period') === '30') {
                $query->where('createdAt', '>=', now()->subDays(30));
            }

            $responses = $query->get();

            // Summary stats
            $total   = $responses->count();
            $avgRating = $total > 0 ? round($responses->avg('rating'), 2) : 0;
            $distribution = [];
            for ($i = 1; $i <= 5; $i++) {
                $distribution[$i] = $responses->where('rating', $i)->count();
            }
            $categories = SurveyResponse::select('category')
                ->groupBy('category')
                ->pluck('category')
                ->filter()
                ->values();

            return response()->json([
                'success'      => true,
                'responses'    => $responses,
                'summary'      => [
                    'total'        => $total,
                    'avgRating'    => $avgRating,
                    'distribution' => $distribution,
                    'categories'   => $categories,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function deleteSurveyResponse($id)
    {
        try {
            $response = SurveyResponse::find($id);
            if ($response) {
                $response->delete();
                $this->logAudit(request(), 'DELETE', 'SURVEY', "Respons survey ID '{$id}' dihapus.");
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
