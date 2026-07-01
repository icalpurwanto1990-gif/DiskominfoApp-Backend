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

    public function getImageUrlAttribute($value)
    {
        if ($value && ! str_starts_with($value, 'http://') && ! str_starts_with($value, 'https://') && ! str_starts_with($value, '/')) {
            return '/uploads/'.$value;
        }

        return $value;
    }
}
