<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SocialMedia extends Model
{
    use HasUuids;

    protected $table = 'SocialMedia';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'platform',
        'url',
        'active',
        'orderIndex',
    ];

    protected $casts = [
        'active' => 'boolean',
        'orderIndex' => 'integer',
    ];

    const CREATED_AT = 'createdAt';

    const UPDATED_AT = 'updatedAt';
}
