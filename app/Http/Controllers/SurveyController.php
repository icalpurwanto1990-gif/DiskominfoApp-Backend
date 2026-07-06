<?php

namespace App\Http\Controllers;

use App\Models\SurveyResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SurveyController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'category' => 'required|string',
            'comment' => 'nullable|string',
        ]);

        $survey = SurveyResponse::create([
            'id' => (string) Str::uuid(),
            'rating' => $request->rating,
            'category' => $request->category,
            'comment' => $request->comment,
        ]);

        return response()->json([
            'success' => true,
            'survey' => $survey,
        ]);
    }

    public function apiCategories()
    {
        try {
            $categories = \App\Models\SurveyCategory::where('active', true)
                ->orderBy('name', 'asc')
                ->pluck('name');

            if ($categories->isEmpty()) {
                $categories = collect([
                    'Layanan Informasi',
                    'Layanan PPID',
                    'Aksesibilitas Website',
                    'Pengajuan TTE',
                    'Aduan Jaringan',
                ]);
            }

            return response()->json($categories);
        } catch (\Exception $e) {
            return response()->json([
                'Layanan Informasi',
                'Layanan PPID',
                'Aksesibilitas Website',
                'Pengajuan TTE',
                'Aduan Jaringan',
            ]);
        }
    }
}
