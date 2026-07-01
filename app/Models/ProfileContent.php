<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ProfileContent extends Model
{
    use HasUuids;

    protected $table = 'ProfileContent';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'key',
        'value',
    ];

    const CREATED_AT = 'createdAt';

    const UPDATED_AT = 'updatedAt';
}
