<?php

namespace App\Models;

use App\Concerns\GeneratesUniqueTeamSlugs;
use App\Enums\BusinessCategory;
use App\Enums\TeamRole;
use App\Enums\TeamType;
use App\Support\BrandPalette;
use App\Support\Localization;
use Database\Factories\TeamFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

#[Fillable(['name', 'slug', 'is_personal', 'type', 'timezone', 'business_category', 'business_category_other', 'logo_path', 'brand_primary_color', 'default_locale', 'available_locales'])]
class Team extends Model
{
    /** @use HasFactory<TeamFactory> */
    use GeneratesUniqueTeamSlugs, HasFactory, SoftDeletes;

    /**
     * Bootstrap the model and its traits.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Team $team) {
            if (empty($team->slug)) {
                $team->slug = static::generateUniqueTeamSlug((string) $team->name);
            }
        });

        static::updating(function (Team $team) {
            if ($team->isDirty('name')) {
                $team->slug = static::generateUniqueTeamSlug((string) $team->name, $team->id);
            }
        });
    }

    /**
     * Get the publicly accessible URL for the team's logo, if any.
     */
    public function logoUrl(): ?string
    {
        if (blank($this->logo_path)) {
            return null;
        }

        return Storage::disk('public')->url($this->logo_path);
    }

    /**
     * The team's brand primary colour, falling back to the platform blue when
     * the team hasn't picked one.
     */
    public function brandPrimaryColor(): string
    {
        return BrandPalette::normalise($this->brand_primary_color) ?? BrandPalette::DEFAULT_PRIMARY;
    }

    /**
     * The default language the team's public booking page renders in.
     *
     * Falls back to the platform default when unset or pointing at a locale
     * that is no longer enabled.
     */
    public function defaultLocale(): string
    {
        $stored = $this->default_locale;

        if (is_string($stored) && in_array($stored, Localization::enabledCodes(), true)) {
            return $stored;
        }

        return Localization::default();
    }

    /**
     * The languages visitors can switch between on the team's public booking
     * page.
     *
     * Stored codes are intersected with the currently-enabled platform locales
     * so a removed language drops out cleanly. When nothing is stored the team
     * offers every enabled locale, and the default is always included.
     *
     * @return list<string>
     */
    public function availableLocales(): array
    {
        $enabled = Localization::enabledCodes();

        $stored = is_array($this->available_locales)
            ? array_values(array_intersect($this->available_locales, $enabled))
            : [];

        $locales = $stored === [] ? $enabled : $stored;

        if (! in_array($this->defaultLocale(), $locales, true)) {
            $locales[] = $this->defaultLocale();
        }

        return array_values($locales);
    }

    /**
     * Determine whether the team's booking page may be served to the public.
     *
     * A team that has not been named and given a timezone is a bare shell from
     * registration, but its page would still list whatever members exist and
     * render slots in the wrong zone. Deliberately looser than needsOnboarding():
     * a missing business category is cosmetic and must not take a live booking
     * page offline. `is_personal` is NOT a disqualifier either — every
     * registrant's first team is personal, solo practitioners' real businesses
     * included.
     */
    public function isPubliclyBookable(): bool
    {
        return filled($this->name)
            && filled($this->timezone);
    }

    /**
     * Determine if the team still needs its core setup (name, timezone and
     * business category) completed before it can be used.
     */
    public function needsOnboarding(): bool
    {
        return blank($this->name)
            || blank($this->timezone)
            || $this->business_category === null;
    }

    /**
     * Get the team owner.
     */
    public function owner(): ?Model
    {
        return $this->members()
            ->wherePivot('role', TeamRole::Owner->value)
            ->first();
    }

    /**
     * Get all members of this team.
     *
     * @return BelongsToMany<Model, $this>
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'team_members', 'team_id', 'user_id')
            ->using(Membership::class)
            ->withPivot(['role'])
            ->withTimestamps();
    }

    /**
     * Get all memberships for this team.
     *
     * @return HasMany<Membership, $this>
     */
    public function memberships(): HasMany
    {
        return $this->hasMany(Membership::class);
    }

    /**
     * Get all invitations for this team.
     *
     * @return HasMany<TeamInvitation, $this>
     */
    public function invitations(): HasMany
    {
        return $this->hasMany(TeamInvitation::class);
    }

    /**
     * Get all locations for this team.
     *
     * @return HasMany<Location, $this>
     */
    public function locations(): HasMany
    {
        return $this->hasMany(Location::class);
    }

    /**
     * Get all customers for this team.
     *
     * @return HasMany<Customer, $this>
     */
    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    /**
     * Get all appointments for this team.
     *
     * @return HasMany<Appointment, $this>
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Get all service categories for this team.
     *
     * @return HasMany<ServiceCategory, $this>
     */
    public function serviceCategories(): HasMany
    {
        return $this->hasMany(ServiceCategory::class);
    }

    /**
     * Get all services for this team.
     *
     * @return HasMany<Service, $this>
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_personal' => 'boolean',
            'type' => TeamType::class,
            'business_category' => BusinessCategory::class,
            'available_locales' => 'array',
        ];
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
