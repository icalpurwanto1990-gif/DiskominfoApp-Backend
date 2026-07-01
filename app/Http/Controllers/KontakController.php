<?php

namespace App\Http\Controllers;

use App\Models\ContactComplaint;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class KontakController extends Controller
{
    public function index()
    {
        return Inertia::render('Kontak');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $complaint = ContactComplaint::create([
            'id' => (string) Str::uuid(),
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => 'PENDING',
            'createdAt' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Laporan pengaduan Anda berhasil dikirim!',
            'data' => $complaint,
        ]);
    }
}
