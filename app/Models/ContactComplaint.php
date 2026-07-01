<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ContactComplaint extends Model
{
    use HasUuids;

    protected $table = 'ContactComplaint';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'phone',
        'email',
        'subject',
        'message',
        'status',
        'response',
        'createdAt',
    ];

    public $timestamps = false;
}
