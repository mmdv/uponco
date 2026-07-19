<?php

namespace App\Models;

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
    'price_type',
    'price',
    'price_min',
    'price_max',
    'currency',
    'duration',
    'technical_break',
    'service_type',
    'delivery_type',
    'online_meeting_provider',
    'capacity',
    'description',
])]
class Service extends Model
{
    /** @use HasFactory<ServiceFactory> */
    use HasFactory, SoftDeletes;

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
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    /**
     * Determine whether this is a group service with a shared capacity.
     */
    public function isGroup(): bool
    {
        return $this->service_type === ServiceType::Group;
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
            'capacity' => 'integer',
        ];
    }
}
