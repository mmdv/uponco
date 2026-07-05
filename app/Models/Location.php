<?php

namespace App\Models;

use App\Support\LocationOptions;
use Database\Factories\LocationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'team_id',
    'is_active',
    'name',
    'country',
    'city',
    'street_address',
    'unit',
    'postal_code',
    'phone',
])]
class Location extends Model
{
    /** @use HasFactory<LocationFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the team that owns the location.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the services offered at this location.
     *
     * @return BelongsToMany<Service, $this>
     */
    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class)->withTimestamps();
    }

    /**
     * Get the users (specialists) who work at this location.
     *
     * @return BelongsToMany<User, $this>
     */
    public function specialists(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    /**
     * The full postal address as a single line, e.g.
     * "12 Main Street, Suite 4, 1010, Vienna, Austria".
     */
    public function fullAddress(): ?string
    {
        $parts = array_filter([
            $this->street_address,
            $this->unit,
            $this->postal_code,
            $this->city,
            $this->country ? LocationOptions::countryName($this->country) : null,
        ], fn (?string $part): bool => filled($part));

        return $parts === [] ? null : implode(', ', $parts);
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
        ];
    }
}
