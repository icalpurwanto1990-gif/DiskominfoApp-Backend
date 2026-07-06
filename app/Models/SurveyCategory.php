<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SurveyCategory extends Model
{
    use HasUuids;

    protected $table = 'survey_categories';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}
