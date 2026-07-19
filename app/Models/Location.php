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
    'place_id',
    'formatted_address',
    'latitude',
    'longitude',
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
     * Whether the location resolved to real coordinates via Google Places.
     * Legacy rows saved before address autocomplete existed will not have.
     */
    public function isGeocoded(): bool
    {
        return $this->latitude !== null && $this->longitude !== null;
    }

    /**
     * The address to hand to a mapping service.
     *
     * Prefers the canonical address Google returned over the operator's typed
     * fields, and deliberately omits both the business name and the unit —
     * neither is part of the postal address and both break geocoding.
     */
    public function mappableAddress(): ?string
    {
        if (filled($this->formatted_address)) {
            return $this->formatted_address;
        }

        $parts = array_filter([
            $this->street_address,
            $this->postal_code,
            $this->city,
            $this->country ? LocationOptions::countryName($this->country) : null,
        ], fn (?string $part): bool => filled($part));

        return $parts === [] ? null : implode(', ', $parts);
    }

    /**
     * A Google Maps directions link that resolves to this exact place.
     *
     * When the location is geocoded we send coordinates plus the place id,
     * which pins the destination precisely instead of leaving Google to
     * re-interpret a free-text address. Otherwise we fall back to an encoded
     * address query, which is best effort.
     */
    public function directionsUrl(): ?string
    {
        if ($this->isGeocoded()) {
            $query = [
                'api' => '1',
                'destination' => $this->latitude.','.$this->longitude,
            ];

            if (filled($this->place_id)) {
                $query['destination_place_id'] = $this->place_id;
            }

            return 'https://www.google.com/maps/dir/?'.http_build_query($query);
        }

        $address = $this->mappableAddress();

        if (blank($address)) {
            return null;
        }

        return 'https://www.google.com/maps/dir/?'.http_build_query([
            'api' => '1',
            'destination' => $address,
        ]);
    }

    /**
     * The full postal address as a single line, including the unit — for
     * display only. Never hand this to a map: the unit is not part of the
     * geocodable address. Use {@see mappableAddress()} for that.
     */
    public function displayAddress(): ?string
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
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }
}
