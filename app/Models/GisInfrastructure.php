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
        'details',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'details' => 'array',
    ];

    const CREATED_AT = 'createdAt';

    const UPDATED_AT = 'updatedAt';
}
