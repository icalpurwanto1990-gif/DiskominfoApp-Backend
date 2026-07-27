<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasUuids;

    protected $table = 'Banner';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'title',
        'description',
        'imageUrl',
        'linkUrl',
        'active',
        'orderIndex',
    ];

    protected $casts = [
        'active' => 'boolean',
        'orderIndex' => 'integer',
    ];

    const CREATED_AT = 'createdAt';

    const UPDATED_AT = 'updatedAt';

    /**
     * Get the raw imageUrl stored in database (no path manipulation).
     * Filament FileUpload stores relative path e.g. 'banners/abc.jpg'
     */
    public function getRawImagePath(): ?string
    {
        return $this->getRawOriginal('imageUrl');
    }

    /**
     * Get the full public URL for display, resolving the stored relative path.
     */
    public function getPublicImageUrl(): ?string
    {
        $value = $this->getRawOriginal('imageUrl');
        if (! $value) return null;
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }
        if (str_starts_with($value, '/')) {
            return $value;
        }
        return '/uploads/' . ltrim($value, '/');
    }
}
