<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AppStatistic extends Model
{
    use HasUuids;

    protected $table = 'AppStatistic';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'key',
        'value',
    ];

    protected $casts = [
        'value' => 'integer',
    ];

    // Only updatedAt timestamp is present in this table
    public $timestamps = true;
    const CREATED_AT = null;
    const UPDATED_AT = 'updatedAt';
}
