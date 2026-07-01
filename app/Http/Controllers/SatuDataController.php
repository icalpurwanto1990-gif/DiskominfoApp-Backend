<?php

namespace App\Http\Controllers;

use App\Models\Dataset;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SatuDataController extends Controller
{
    public function index()
    {
        return Inertia::render('SatuData');
    }

    public function apiIndex(Request $request)
    {
        $q = $request->query('q', '');

        try {
            $query = Dataset::query();

            if ($q) {
                $query->where(function ($sub) use ($q) {
                    $sub->where('title', 'ilike', '%' . $q . '%')
                        ->orWhere('description', 'ilike', '%' . $q . '%');
                });
            }

            $datasets = $query->orderBy('createdAt', 'desc')->get();

            if ($datasets->count() > 0) {
                return response()->json($datasets);
            }

            // Fallback mock dataset if empty in database
            $mockDatasets = [
                [
                    'id' => 'mock-ds-1',
                    'title' => 'Jumlah Pembuatan Sertifikat TTE ASN Kabupaten Banggai Kepulauan 2025',
                    'slug' => 'jumlah-tte-asn-banggai-kep-2025',
                    'description' => 'Dataset ini berisi statistik bulanan mengenai jumlah pengajuan dan penerbitan Tanda Tangan Elektronik (TTE) bagi Aparatur Sipil Negara di lingkungan Pemerintah Daerah Kabupaten Banggai Kepulauan sepanjang tahun 2025.',
                    'category' => 'Layanan',
                    'metadata' => [
                        'produsen' => 'Bidang Aptika Diskominfo',
                        'lisensi' => 'Creative Commons Attribution',
                        'updateCycle' => 'Tahunan',
                    ],
                    'fileUrl' => '/data/tte-asn-2025.csv',
                    'downloads' => 87,
                    'createdAt' => now()->toIso8601String(),
                    'jsonData' => [
                        ['bulan' => 'Januari', 'pengajuan' => 24, 'disetujui' => 24],
                        ['bulan' => 'Februari', 'pengajuan' => 31, 'disetujui' => 30],
                        ['bulan' => 'Maret', 'pengajuan' => 45, 'disetujui' => 45],
                        ['bulan' => 'April', 'pengajuan' => 18, 'disetujui' => 18],
                        ['bulan' => 'Mei', 'pengajuan' => 52, 'disetujui' => 50],
                        ['bulan' => 'Juni', 'pengajuan' => 29, 'disetujui' => 29],
                        ['bulan' => 'Juli', 'pengajuan' => 40, 'disetujui' => 40],
                        ['bulan' => 'Agustus', 'pengajuan' => 35, 'disetujui' => 35],
                        ['bulan' => 'September', 'pengajuan' => 60, 'disetujui' => 58],
                        ['bulan' => 'Oktober', 'pengajuan' => 15, 'disetujui' => 15],
                        ['bulan' => 'November', 'pengajuan' => 22, 'disetujui' => 22],
                        ['bulan' => 'Desember', 'pengajuan' => 11, 'disetujui' => 11]
                    ],
                ]
            ];

            if ($q) {
                $mockDatasets = array_filter($mockDatasets, function ($ds) use ($q) {
                    return stripos($ds['title'], $q) !== false || stripos($ds['description'], $q) !== false;
                });
                $mockDatasets = array_values($mockDatasets);
            }

            return response()->json($mockDatasets);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
