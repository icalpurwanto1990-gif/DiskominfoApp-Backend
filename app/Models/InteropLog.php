<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class InteropLog extends Model
{
    use HasUuids;

    protected $table = 'interop_logs';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false; // Only using createdAt

    protected $fillable = [
        'id',
        'direction',
        'client_name',
        'endpoint',
        'method',
        'status_code',
        'ip_address',
        'response_time_ms',
        'error_message',
        'createdAt',
    ];

    protected $casts = [
        'createdAt'        => 'datetime',
        'response_time_ms' => 'float',
        'status_code'      => 'integer',
    ];

    public static function logInbound(
        ?string $clientName,
        string $endpoint,
        string $method,
        int $statusCode,
        ?string $ipAddress = null,
        ?float $responseTimeMs = null,
        ?string $errorMessage = null
    ): self {
        return static::create([
            'direction'        => 'INBOUND_MPP',
            'client_name'      => $clientName,
            'endpoint'         => $endpoint,
            'method'           => strtoupper($method),
            'status_code'      => $statusCode,
            'ip_address'       => $ipAddress,
            'response_time_ms' => $responseTimeMs,
            'error_message'    => $errorMessage,
            'createdAt'        => now(),
        ]);
    }

    public static function logOutbound(
        string $serviceName,
        string $endpoint,
        string $method,
        int $statusCode,
        ?float $responseTimeMs = null,
        ?string $errorMessage = null
    ): self {
        return static::create([
            'direction'        => 'OUTBOUND_SPLP',
            'client_name'      => $serviceName,
            'endpoint'         => $endpoint,
            'method'           => strtoupper($method),
            'status_code'      => $statusCode,
            'ip_address'       => request()->ip() ?? '127.0.0.1',
            'response_time_ms' => $responseTimeMs,
            'error_message'    => $errorMessage,
            'createdAt'        => now(),
        ]);
    }
}
