<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasUuids;

    protected $table = 'Post';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'title',
        'slug',
        'content',
        'image',
        'published',
        'views',
        'authorId',
        'categoryId',
        'seoTitle',
        'seoDesc',
        'seoKeywords',
    ];

    protected $casts = [
        'published' => 'boolean',
        'views' => 'integer',
    ];

    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    public function getImageAttribute($value)
    {
        if ($value && !str_starts_with($value, 'http://') && !str_starts_with($value, 'https://') && !str_starts_with($value, '/')) {
            return '/uploads/' . $value;
        }
        return $value;
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'categoryId', 'id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'authorId', 'id');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, '_PostTags', 'A', 'B');
    }
}

