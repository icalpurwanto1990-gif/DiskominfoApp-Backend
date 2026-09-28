<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class GisInfrastructure extends Model
{
    use HasUuids;

    protected $table = 'GISInfrastructure';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'type',
        'latitude',
        'longitude',
        'status',
        'image',
        'details',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'details' => 'array',
    ];

    protected $appends = [
        'imageUrl',
    ];

    const CREATED_AT = 'createdAt';

    const UPDATED_AT = 'updatedAt';

    /**
     * Get raw image path (falling back to details if needed).
     */
    public function getRawImagePath(): ?string
    {
        return $this->getRawOriginal('image')
            ?? ($this->details['image'] ?? null)
            ?? ($this->details['foto'] ?? null)
            ?? ($this->details['photoUrl'] ?? null);
    }

    /**
     * Get full public URL for the image.
     */
    public function getPublicImageUrl(): ?string
    {
        $value = $this->getRawImagePath();
        if (! $value) return null;
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }
        if (str_starts_with($value, '/')) {
            return $value;
        }
        return '/uploads/' . ltrim($value, '/');
    }

    /**
     * Accessor for imageUrl attribute in JSON serialization.
     */
    public function getImageUrlAttribute(): ?string
    {
        return $this->getPublicImageUrl();
    }
}
