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
}
