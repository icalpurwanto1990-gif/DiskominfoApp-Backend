<?php

namespace App\Http\Controllers;

use App\Models\GisInfrastructure;
use Inertia\Inertia;

class GisController extends Controller
{
    public function index()
    {
        return Inertia::render('Gis');
    }

    public function apiIndex()
    {
        try {
            $infrastructure = GisInfrastructure::orderBy('createdAt', 'desc')->get();

            return response()->json($infrastructure);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * API endpoint that returns aggregated GIS statistics by type.
     */
    public function apiStats()
    {
        try {
            $stats = GisInfrastructure::selectRaw('"type", COUNT(*) as count')
                ->groupBy('type')
                ->get()
                ->pluck('count', 'type');

            return response()->json([
                'BTS_TOWER'   => (int) ($stats['BTS_TOWER']   ?? 0),
                'VSAT'        => (int) ($stats['VSAT']        ?? 0),
                'BLANKSPOT'   => (int) ($stats['BLANKSPOT']   ?? 0),
                'FIBER_OPTIK' => (int) ($stats['FIBER_OPTIK'] ?? 0),
                'total'       => GisInfrastructure::count(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
