<?php

namespace App\Http\Controllers;

use App\Models\LeaderAgenda;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgendaController extends Controller
{
    public function index()
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;
        
        $leaderAgendas = LeaderAgenda::where('status', 'PUBLISHED')
            ->whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear)
            ->orderBy('date', 'asc')
            ->orderBy('time', 'asc')
            ->get();

        return Inertia::render('Agenda', [
            'initialAgendas' => $leaderAgendas,
        ]);
    }

    public function apiAgendas(Request $request)
    {
        try {
            $month = $request->input('month', now()->month);
            $year = $request->input('year', now()->year);

            $agendas = LeaderAgenda::where('status', 'PUBLISHED')
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->orderBy('date', 'asc')
                ->orderBy('time', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'agendas' => $agendas,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
