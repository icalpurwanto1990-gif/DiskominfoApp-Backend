<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DigitalService extends Model
{
    use HasUuids;

    protected $table = 'DigitalService';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'slug',
        'title',
        'description',
        'icon',
        'color',
        'active',
        'form_schema',
        'sop_file',
    ];

    protected $casts = [
        'active' => 'boolean',
        'form_schema' => 'array',
    ];

    const CREATED_AT = 'createdAt';

    const UPDATED_AT = 'updatedAt';
}
