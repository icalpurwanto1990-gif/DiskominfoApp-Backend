<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BeritaController extends Controller
{
    public function index()
    {
        $categories = Category::orderBy('name', 'asc')->get();

        return Inertia::render('Berita', [
            'categories' => $categories,
        ]);
    }

    public function show($slug)
    {
        $post = Post::where('slug', $slug)
            ->with(['category', 'tags', 'author' => function ($q) {
                $q->select('id', 'name', 'role');
            }])
            ->first();

        if (! $post) {
            abort(404);
        }

        // Increment views safely
        $post->increment('views');

        $categories = Category::orderBy('name', 'asc')->get();

        return Inertia::render('BeritaDetail', [
            'post' => $post,
            'categories' => $categories,
        ]);
    }

    public function apiIndex(Request $request)
    {
        $q = $request->query('q', '');
        $category = $request->query('category', '');
        $startDate = $request->query('tanggal_awal', '');
        $endDate = $request->query('tanggal_akhir', '');
        $limit = $request->query('limit', '');

        $query = Post::where('published', true)
            ->with(['category', 'tags', 'author' => function ($query) {
                $query->select('id', 'name', 'role');
            }]);

        if ($q) {
            $query->where(function ($sub) use ($q) {
                $sub->where('title', 'ilike', '%'.$q.'%')
                    ->orWhere('content', 'ilike', '%'.$q.'%');
            });
        }

        if ($category && $category !== 'ALL') {
            $query->whereHas('category', function ($sub) use ($category) {
                $sub->where('slug', $category);
            });
        }

        if ($startDate) {
            $query->whereDate('createdAt', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('createdAt', '<=', $endDate);
        }

        $query->orderBy('createdAt', 'desc');

        if ($limit && is_numeric($limit)) {
            $query->limit((int) $limit);
        }

        $posts = $query->get();

        return response()->json($posts);
    }
}
