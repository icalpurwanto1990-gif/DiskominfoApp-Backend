<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\Category;
use App\Models\Dataset;
use App\Models\DigitalService;
use App\Models\Document;
use App\Models\GisInfrastructure;
use App\Models\Post;
use App\Models\PpidObjection;
use App\Models\PpidRequest;
use App\Models\ProfileContent;
use App\Models\ServiceRequest;
use App\Models\Staff;
use App\Models\Tag;
use App\Models\User;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Admin/Dashboard');
    }

    public function banners()
    {
        return Inertia::render('Admin/Banners', [
            'banners' => Banner::orderBy('orderIndex', 'asc')->get(),
        ]);
    }

    public function profilStaff()
    {
        return Inertia::render('Admin/ProfileStaff', [
            'profileContent' => ProfileContent::all()->pluck('value', 'key')->toArray(),
            'staff' => Staff::orderBy('orderIndex', 'asc')->get(),
        ]);
    }

    public function berita()
    {
        return Inertia::render('Admin/Berita', [
            'posts' => Post::with(['category', 'tags'])->orderBy('createdAt', 'desc')->get(),
            'categories' => Category::orderBy('name', 'asc')->get(),
            'tags' => Tag::orderBy('name', 'asc')->get(),
        ]);
    }

    public function ppid()
    {
        return Inertia::render('Admin/Ppid', [
            'requests' => PpidRequest::orderBy('createdAt', 'desc')->get(),
            'objections' => PpidObjection::with('request')->orderBy('createdAt', 'desc')->get(),
            'documents' => Document::orderBy('createdAt', 'desc')->get(),
        ]);
    }

    public function layanan()
    {
        return Inertia::render('Admin/Layanan', [
            'services' => DigitalService::orderBy('createdAt', 'asc')->get(),
            'requests' => ServiceRequest::orderBy('createdAt', 'desc')->get(),
        ]);
    }

    public function satuData()
    {
        return Inertia::render('Admin/SatuData', [
            'datasets' => Dataset::orderBy('createdAt', 'desc')->get(),
        ]);
    }

    public function gis()
    {
        return Inertia::render('Admin/Gis', [
            'infrastructures' => GisInfrastructure::orderBy('createdAt', 'desc')->get(),
        ]);
    }

    public function media()
    {
        return Inertia::render('Admin/Media');
    }

    public function users()
    {
        return Inertia::render('Admin/Users', [
            'users' => User::orderBy('createdAt', 'desc')->get(),
        ]);
    }

    public function survey()
    {
        return Inertia::render('Admin/Survey');
    }

    public function auditLog()
    {
        return Inertia::render('Admin/AuditLog');
    }
}
