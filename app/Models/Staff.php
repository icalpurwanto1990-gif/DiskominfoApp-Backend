<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasUuids;

    protected $table = 'Staff';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'gelarDepan',
        'gelarBelakang',
        'nip',
        'position',
        'category',
        'image',
        'orderIndex',
    ];

    protected $casts = [
        'orderIndex' => 'integer',
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
}
