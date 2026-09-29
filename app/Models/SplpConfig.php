<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class SplpConfig extends Model
{
    use HasUuids;

    protected $table = 'splp_configs';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'service_name',
        'base_url',
        'client_id',
        'client_secret',
        'service_code',
        'auth_type',
        'headers',
        'is_active',
        'last_sync_at',
        'last_status',
    ];

    protected $casts = [
        'headers'      => 'array',
        'is_active'    => 'boolean',
        'last_sync_at' => 'datetime',
    ];

    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    /**
     * Mutator to safely encrypt client_secret if present.
     */
    public function setClientSecretAttribute(?string $value): void
    {
        $this->attributes['client_secret'] = $value ? Crypt::encryptString($value) : null;
    }

    /**
     * Accessor to decrypt client_secret when used by SplpClientService.
     */
    public function getClientSecretAttribute(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        try {
            return Crypt::decryptString($value);
        } catch (\Exception $e) {
            return $value; // Fallback if plain text was stored
        }
    }
}
