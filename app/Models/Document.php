<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Document extends Model
{
    use HasUuids;

    protected $table = 'Document';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'title',
        'category',
        'fileUrl',
        'fileSize',
        'downloads',
    ];

    protected $casts = [
        'downloads' => 'integer',
    ];

    const CREATED_AT = 'createdAt';

    const UPDATED_AT = 'updatedAt';

    /**
     * Backward compatibility with API using 'fileType' instead of 'category'
     */
    public function getFileTypeAttribute()
    {
        return $this->category;
    }

    public function setFileTypeAttribute($value)
    {
        $this->category = $value;
    }

    /**
     * Virtual attribute for description (not in database)
     */
    public function getDescriptionAttribute()
    {
        return '';
    }

    public function setDescriptionAttribute($value)
    {
        // Safely ignore description field
    }

    protected static function booted()
    {
        static::saving(function ($document) {
            // Automatically calculate file size if not provided or empty
            if (empty($document->fileSize)) {
                if ($document->fileUrl) {
                    try {
                        $path = $document->fileUrl;
                        if (Storage::disk('uploads')->exists($path)) {
                            $bytes = Storage::disk('uploads')->size($path);
                            $document->fileSize = self::formatBytes($bytes);
                        } else {
                            $document->fileSize = '0 KB';
                        }
                    } catch (\Exception $e) {
                        $document->fileSize = '0 KB';
                    }
                } else {
                    $document->fileSize = '0 KB';
                }
            }

            if ($document->downloads === null) {
                $document->downloads = 0;
            }
        });
    }

    private static function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}

