<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PpidRequest extends Model
{
    use HasUuids;

    protected $table = 'PPIDRequest';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'ticketNumber',
        'name',
        'nik',
        'email',
        'phone',
        'address',
        'details',
        'purpose',
        'ktpFile',
        'status',
        'response',
        'attachment',
        'assignedToId',
    ];

    const CREATED_AT = 'createdAt';

    const UPDATED_AT = 'updatedAt';

    public function objection()
    {
        return $this->hasOne(PpidObjection::class, 'requestId', 'id');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assignedToId', 'id');
    }
}
