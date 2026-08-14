<?php

namespace App\Models;

use App\Concerns\GeneratesUniqueSlug;
use App\Enums\Currency;
use App\Enums\DeliveryType;
use App\Enums\PriceType;
use App\Enums\ServiceType;
use Database\Factories\ServiceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'team_id',
    'service_category_id',
    'is_active',
    'title',
    'slug',
    'price_type',
    'price',
    'price_min',
    'price_max',
    'currency',
    'duration',
    'technical_break',
    'slot_interval',
    'service_type',
    'delivery_type',
    'online_meeting_provider',
    'capacity',
    'description',
])]
class Service extends Model
{
    /** @use HasFactory<ServiceFactory> */
    use GeneratesUniqueSlug, HasFactory, SoftDeletes;

    /**
     * Bootstrap the model and its traits.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Service $service) {
            if (blank($service->slug) && $service->team_id !== null) {
                $service->slug = static::generateUniqueSlug((string) $service->title, (int) $service->team_id);
            }
        });

        static::updating(function (Service $service) {
            if ($service->isDirty('title') && ! $service->isDirty('slug') && $service->team_id !== null) {
                $service->slug = static::generateUniqueSlug((string) $service->title, (int) $service->team_id, $service->id);
            }
        });
    }

    /**
     * Get the team that owns the service.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the category grouping the service, if it has been given one.
     *
     * @return BelongsTo<ServiceCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    /**
     * Get the locations (branches) where this service is offered.
     *
     * @return BelongsToMany<Location, $this>
     */
    public function locations(): BelongsToMany
    {
        return $this->belongsToMany(Location::class)->withTimestamps();
    }

    /**
     * Get the users (specialists) who provide this service.
     *
     * @return BelongsToMany<User, $this>
     */
    public function specialists(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot(['duration', 'price', 'price_min', 'price_max'])
            ->withTimestamps();
    }

    /**
     * Determine whether this is a group service with a shared capacity.
     */
    public function isGroup(): bool
    {
        return $this->service_type === ServiceType::Group;
    }

    /**
     * Resolve the appointment duration (minutes) for a given specialist.
     *
     * A specialist may deliver the service in a custom duration; when they have
     * no override the service's own duration is used.
     */
    public function durationFor(User $specialist): int
    {
        $custom = $specialist->pivot?->duration
            ?? $this->specialists()->whereKey($specialist->getKey())->first()?->pivot?->duration;

        return $custom !== null ? (int) $custom : $this->duration;
    }

    /**
     * Resolve the interval (minutes) between candidate start times.
     *
     * When the service has no explicit slot interval, start times sit on a smart
     * default grid of min(duration, 30): shorter services keep a fine 15-minute
     * grid while anything half an hour or longer defaults to the half hour. A
     * business can override this per service — e.g. a 60-minute session that must
     * only start on the hour sets its interval to 60.
     *
     * The duration passed in is the one that applies for the booking (which may be
     * a specialist's custom duration), so the default grid tracks it correctly.
     */
    public function slotIntervalFor(int $duration): int
    {
        return $this->slot_interval ?? min($duration, 30);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'price_type' => PriceType::class,
            'service_type' => ServiceType::class,
            'delivery_type' => DeliveryType::class,
            'price' => 'decimal:2',
            'price_min' => 'decimal:2',
            'price_max' => 'decimal:2',
            'currency' => Currency::class,
            'duration' => 'integer',
            'technical_break' => 'integer',
            'slot_interval' => 'integer',
            'capacity' => 'integer',
        ];
    }
}
