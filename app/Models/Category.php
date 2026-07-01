<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasUuids;

    protected $table = 'Category';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'slug',
        'isMenu',
        'orderIndex',
    ];

    protected $casts = [
        'isMenu' => 'boolean',
        'orderIndex' => 'integer',
    ];

    // Category doesn't have timestamps in schema.prisma, so disable them
    public $timestamps = false;

    public function posts()
    {
        return $this->hasMany(Post::class, 'categoryId', 'id');
    }
}
