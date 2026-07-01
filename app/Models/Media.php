<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    use HasUuids;

    protected $table = 'Media';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'title',
        'type', // FOTO, VIDEO, INFOGRAFIS
        'url',
        'meta',
    ];

    const CREATED_AT = 'createdAt';

    const UPDATED_AT = 'updatedAt';

    public function getUrlAttribute($value)
    {
        if ($value && ! str_starts_with($value, 'http://') && ! str_starts_with($value, 'https://') && ! str_starts_with($value, '/')) {
            return '/uploads/'.$value;
        }

        return $value;
    }
}
