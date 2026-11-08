<?php

namespace App\Models;

use Database\Factories\DevicePushTokenFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * An Expo push token for one installed copy of the mobile app.
 */
#[Fillable([
    'user_id',
    'personal_access_token_id',
    'token',
    'platform',
])]
class DevicePushToken extends Model
{
    /** @use HasFactory<DevicePushTokenFactory> */
    use HasFactory;

    /**
     * Get the user the device belongs to.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
