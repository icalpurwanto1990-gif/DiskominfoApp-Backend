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
        'label',
        'suffix',
        'desc',
        'icon',
        'color',
        'is_published',
        'order_index',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'order_index'  => 'integer',
    ];

    // Only updatedAt timestamp is present in this table
    public $timestamps = true;

    const CREATED_AT = null;

    const UPDATED_AT = 'updatedAt';

    // -------------------------------------------------------
    // Scopes
    // -------------------------------------------------------

    /**
     * Scope: only published statistics, ordered for public display.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true)->orderBy('order_index', 'asc');
    }
}
