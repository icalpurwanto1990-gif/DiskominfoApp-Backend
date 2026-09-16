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

    public function widgetConfig()
    {
        try {
            $settings = \App\Models\SurveyWidgetSetting::getActiveSettings();
            $categories = \App\Models\SurveyCategory::where('active', true)
                ->orderBy('name', 'asc')
                ->pluck('name')
                ->values();

            if ($categories->isEmpty()) {
                $categories = collect([
                    'Layanan Informasi',
                    'Layanan PPID',
                    'Aksesibilitas Website',
                    'Pengajuan TTE',
                    'Aduan Jaringan',
                ]);
            }

            return response()->json([
                'success' => true,
                'settings' => $settings,
                'categories' => $categories,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => true,
                'settings' => [
                    'title' => 'Survey Kepuasan Masyarakat',
                    'subtitle' => 'Bantu kami meningkatkan pelayanan publik dengan memberikan penilaian Anda.',
                    'qr_image' => '/images/survey-qr.png',
                    'qr_caption' => '📱 Scan QR untuk mengisi survey via ponsel',
                    'qr_link' => null,
                    'show_qr' => true,
                    'divider_text' => 'atau isi di sini',
                    'thank_you_title' => 'Terima Kasih!',
                    'thank_you_message' => 'Umpan balik Anda telah kami terima. Data ini sangat berharga untuk meningkatkan kualitas pelayanan publik digital di Kabupaten Banggai Kepulauan.',
                    'is_active' => true,
                ],
                'categories' => [
                    'Layanan Informasi',
                    'Layanan PPID',
                    'Aksesibilitas Website',
                    'Pengajuan TTE',
                    'Aduan Jaringan',
                ],
            ]);
        }
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
