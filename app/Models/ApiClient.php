<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ApiClient extends Model
{
    use HasUuids;

    protected $table = 'api_clients';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'client_id',
        'api_key_hash',
        'api_key_prefix',
        'allowed_scopes',
        'ip_whitelist',
        'is_active',
        'last_used_at',
        'expires_at',
    ];

    protected $casts = [
        'allowed_scopes' => 'array',
        'is_active'      => 'boolean',
        'last_used_at'   => 'datetime',
        'expires_at'     => 'datetime',
    ];

    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    /**
     * Generate a new secure API Key and return the plain text secret once.
     * The plain secret is never stored directly, only the hash is persisted.
     */
    public static function createWithKey(string $name, array $scopes = [], ?string $ipWhitelist = null, ?\DateTimeInterface $expiresAt = null): array
    {
        $clientId = 'mpp_' . Str::random(12);
        $randomSecret = Str::random(48);
        $prefix = substr($randomSecret, 0, 8);
        $fullApiKey = 'bkp_' . $prefix . '_' . substr($randomSecret, 8);

        $client = static::create([
            'name'           => $name,
            'client_id'      => $clientId,
            'api_key_hash'   => Hash::make($fullApiKey),
            'api_key_prefix' => 'bkp_' . $prefix . '...',
            'allowed_scopes' => $scopes,
            'ip_whitelist'   => $ipWhitelist,
            'is_active'      => true,
            'expires_at'     => $expiresAt,
        ]);

        return [
            'client'   => $client,
            'api_key'  => $fullApiKey,
        ];
    }

    /**
     * Check if client has a specific scope.
     */
    public function hasScope(string $scope): bool
    {
        if (empty($this->allowed_scopes)) {
            return false;
        }

        if (in_array('*', $this->allowed_scopes, true)) {
            return true;
        }

        return in_array($scope, $this->allowed_scopes, true);
    }

    /**
     * Check if a client IP is allowed.
     */
    public function isIpAllowed(?string $ip): bool
    {
        if (empty($this->ip_whitelist) || trim($this->ip_whitelist) === '') {
            return true;
        }

        $allowedIps = array_map('trim', explode(',', $this->ip_whitelist));
        return in_array($ip, $allowedIps, true);
    }
}
