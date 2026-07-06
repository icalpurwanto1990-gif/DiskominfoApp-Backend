<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ModulePermission extends Model
{
    use HasUuids;

    protected $table = 'module_permissions';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'module_name',
        'resource_class',
        'allowed_roles',
    ];

    protected $casts = [
        'allowed_roles' => 'array',
    ];
}
