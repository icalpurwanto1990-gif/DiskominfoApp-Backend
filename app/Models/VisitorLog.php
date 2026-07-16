<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class VisitorLog extends Model
{
    use HasUuids;

    protected $table = 'VisitorLog';

    protected $fillable = [
        'id',
        'ip_address',
        'user_agent',
        'device',
        'browser',
        'platform',
        'visited_at',
    ];

    public $timestamps = false;

    protected $casts = [
        'visited_at' => 'datetime',
    ];
}
