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
        if (! $value) {
            return null;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        // If inside Filament Admin panel routes, return raw relative path e.g. 'posts/xyz.jpg'
        // so Filament FileUpload and ImageColumn components do not fail with PathTraversalDetected
        if (request()->is('admin*') || request()->routeIs('filament.*')) {
            return ltrim(preg_replace('#^/?uploads/#', '', $value), '/');
        }

        // For frontend clients, ensure it starts with /uploads/
        if (str_starts_with($value, '/uploads/')) {
            return $value;
        }

        if (str_starts_with($value, '/')) {
            return $value;
        }

        return '/uploads/' . $value;
    }

    public function setImageAttribute($value)
    {
        if ($value && ! str_starts_with($value, 'http://') && ! str_starts_with($value, 'https://')) {
            $this->attributes['image'] = ltrim(preg_replace('#^/?uploads/#', '', $value), '/');
        } else {
            $this->attributes['image'] = $value;
        }
    }

    public function getRawImagePath(): ?string
    {
        return $this->getRawOriginal('image');
    }

    public function getPublicImageUrl(): ?string
    {
        $value = $this->getRawOriginal('image');
        if (! $value) {
            return null;
        }
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://') || str_starts_with($value, '/uploads/')) {
            return $value;
        }
        if (str_starts_with($value, '/')) {
            return $value;
        }

        return '/uploads/' . ltrim($value, '/');
    }

    public function getContentAttribute($value)
    {
        if (! $value) {
            return $value;
        }

        // Normalize absolute localhost/domain URLs in img src tags to clean relative URLs: /uploads/... or /storage/...
        $pattern = '/(src=["\'])(?:https?:\/\/[^\/"\']+(?::\d+)?)?(\/(?:uploads|storage)\/[^"\']+)(["\'])/i';
        $normalized = preg_replace($pattern, '$1$2$3', $value);

        // Fix any paths missing leading slash, e.g. src="uploads/..." -> src="/uploads/..."
        $normalized = preg_replace('/(src=["\'])(uploads|storage)\/([^"\']+)(["\'])/i', '$1/$2/$3$4', $normalized);

        return $normalized;
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
