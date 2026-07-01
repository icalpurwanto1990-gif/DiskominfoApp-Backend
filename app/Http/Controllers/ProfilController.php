<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\ProfileContent;
use App\Models\Staff;
use Inertia\Inertia;

class ProfilController extends Controller
{
    public function index()
    {
        // 1. Fetch profile content
        $profileContent = ProfileContent::all()->pluck('value', 'key')->toArray();

        // 2. Fetch staff members
        $staff = Staff::orderBy('orderIndex', 'asc')->get();

        // 3. Fetch documents
        $documents = Document::orderBy('createdAt', 'desc')->get();

        return Inertia::render('Profil', [
            'profileData' => $profileContent,
            'staff' => $staff,
            'documents' => $documents,
        ]);
    }
}
