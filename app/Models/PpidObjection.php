<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PpidObjection extends Model
{
    use HasUuids;

    protected $table = 'PPIDObjection';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'requestId',
        'reason',
        'ktpFile',
        'status',
        'response',
    ];

    const CREATED_AT = 'createdAt';

    const UPDATED_AT = 'updatedAt';

    public function request()
    {
        return $this->belongsTo(PpidRequest::class, 'requestId', 'id');
    }
}
