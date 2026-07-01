<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasUuids;

    protected $table = 'Document';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'title',
        'category',
        'fileUrl',
        'fileSize',
        'downloads',
    ];

    protected $casts = [
        'downloads' => 'integer',
    ];

    const CREATED_AT = 'createdAt';

    const UPDATED_AT = 'updatedAt';
}
