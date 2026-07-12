<?php

namespace App\Models;

use App\Concerns\HasTeams;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable(['name', 'email', 'password', 'current_team_id', 'avatar_path', 'google_account_email', 'google_access_token', 'google_refresh_token', 'google_token_expires_at'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token', 'avatar_path', 'google_access_token', 'google_refresh_token'])]
class User extends Authenticatable implements MustVerifyEmail, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasTeams, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = ['avatar'];

    /**
     * Get the publicly accessible URL for the user's avatar, if any.
     *
     * @return Attribute<?string, never>
     */
    protected function avatar(): Attribute
    {
        return Attribute::get(function (): ?string {
            if (blank($this->avatar_path)) {
                return null;
            }

            return Storage::disk('public')->url($this->avatar_path);
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'google_access_token' => 'encrypted',
            'google_refresh_token' => 'encrypted',
            'google_token_expires_at' => 'datetime',
        ];
    }

    /**
     * Determine whether the user has connected a Google account.
     */
    public function hasGoogleConnected(): bool
    {
        return filled($this->google_refresh_token);
    }

    /**
     * Determine whether the stored Google access token has expired (or is about
     * to). A small skew is applied so tokens are refreshed before they lapse.
     */
    public function googleTokenIsExpired(): bool
    {
        if (blank($this->google_access_token) || $this->google_token_expires_at === null) {
            return true;
        }

        return $this->google_token_expires_at->subSeconds(30)->isPast();
    }

    /**
     * Get the user's public booking profile.
     *
     * @return HasOne<Profile, $this>
     */
    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    /**
     * Get the user's date-based schedule slots.
     *
     * @return HasMany<ScheduleSlot, $this>
     */
    public function scheduleSlots(): HasMany
    {
        return $this->hasMany(ScheduleSlot::class);
    }

    /**
     * Get the user's date-based schedule slots scoped to a single team.
     *
     * Slots are per team, so callers must always narrow by team when reading
     * or writing a schedule.
     *
     * @return HasMany<ScheduleSlot, $this>
     */
    public function scheduleSlotsFor(Team|int $team): HasMany
    {
        return $this->scheduleSlots()
            ->where('team_id', $team instanceof Team ? $team->id : $team);
    }

    /**
     * Get the services this user provides as a specialist.
     *
     * @return BelongsToMany<Service, $this>
     */
    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class)->withTimestamps();
    }

    /**
     * Get the locations this user works at as a specialist.
     *
     * @return BelongsToMany<Location, $this>
     */
    public function locations(): BelongsToMany
    {
        return $this->belongsToMany(Location::class)->withTimestamps();
    }
}
