<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaderAgenda extends Model
{
    use HasUuids;

    protected $table = 'leader_agendas';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'user_id',
        'title',
        'date',
        'time',
        'location',
        'organizer',
        'letter_file',
        'notes',
        'leader_name',
        'status',
        'rejection_reason',
        'photo_url',
        'speech_doc_url',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
    ];

    /**
     * Get the user (OPD) that requested this agenda.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
