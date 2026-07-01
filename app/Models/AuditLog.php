<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasUuids;

    protected $table = 'AuditLog';

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps   = false; // We manage createdAt manually

    protected $fillable = [
        'id',
        'userId',
        'action',
        'details',
        'ipAddress',
        'createdAt',
    ];

    protected $casts = [
        'createdAt' => 'datetime',
    ];

    const CREATED_AT = 'createdAt';
    const UPDATED_AT = null;

    public function user()
    {
        return $this->belongsTo(User::class, 'userId', 'id');
    }
}
