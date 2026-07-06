<?php

namespace App\Traits;

use App\Models\ModulePermission;

trait HasDynamicPermission
{
    public static function canViewAny(): bool
    {
        $user = auth()->user();
        if (!$user) {
            return false;
        }

        // Superadmin always has full access
        if ($user->role === 'SUPERADMIN') {
            return true;
        }

        // Check if database contains a mapping for this resource class and allowed role
        return ModulePermission::where('resource_class', static::class)
            ->whereJsonContains('allowed_roles', $user->role)
            ->exists();
    }
}
