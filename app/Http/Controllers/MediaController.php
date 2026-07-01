<?php

namespace App\Http\Controllers;

use App\Models\Media;
use Inertia\Inertia;

class MediaController extends Controller
{
    public function index()
    {
        $mediaList = Media::orderBy('createdAt', 'desc')->get();

        return Inertia::render('Media', [
            'mediaList' => $mediaList,
        ]);
    }
}
