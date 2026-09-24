<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EditorUploadController extends Controller
{
    /**
     * Upload an image from TinyMCE editor and return its public URL.
     */
    public function upload(Request $request)
    {
        $file = $request->file('file') ?? $request->file('image');

        if (! $file) {
            return response()->json([
                'error' => 'Berkas gambar tidak ditemukan.',
            ], 400);
        }

        $request->validate([
            'file'  => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,svg|max:10240',
            'image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,svg|max:10240',
        ]);

        try {
            $directory = public_path('uploads/posts/attachments');
            if (! file_exists($directory)) {
                mkdir($directory, 0755, true);
            }

            $extension = $file->getClientOriginalExtension() ?: 'png';
            $filename  = time() . '_' . Str::random(10) . '.' . strtolower($extension);

            $file->move($directory, $filename);

            $url = asset('uploads/posts/attachments/' . $filename);

            return response()->json([
                'location' => $url,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Gagal menyimpan gambar di server: ' . $e->getMessage(),
            ], 500);
        }
    }
}
