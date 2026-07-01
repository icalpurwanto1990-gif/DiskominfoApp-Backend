<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Dataset extends Model
{
    use HasUuids;

    protected $table = 'Dataset';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'title',
        'slug',
        'description',
        'category',
        'metadata',
        'fileUrl',
        'jsonData',
        'downloads',
    ];

    protected $casts = [
        'metadata' => 'array',
        'jsonData' => 'array',
        'downloads' => 'integer',
    ];

    const CREATED_AT = 'createdAt';

    const UPDATED_AT = 'updatedAt';
}
