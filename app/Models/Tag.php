<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use HasUuids;

    protected $table = 'Tag';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'slug',
    ];

    public $timestamps = false;

    public function posts()
    {
        return $this->belongsToMany(Post::class, '_PostTags', 'B', 'A');
    }
}
