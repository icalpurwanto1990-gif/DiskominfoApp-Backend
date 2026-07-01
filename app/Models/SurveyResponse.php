<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SurveyResponse extends Model
{
    use HasUuids;

    protected $table = 'SurveyResponse';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'rating',
        'comment',
        'category',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    // Only createdAt is present in this table
    public $timestamps = true;
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = null;
}
