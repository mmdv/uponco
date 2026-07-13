<?php

namespace App\Support;

use App\Enums\DeliveryType;
use App\Enums\PriceType;
use App\Enums\ServiceType;

class ServiceOptions
{
    /**
     * The supported online meeting providers.
     *
     * @var array<string, string>
     */
    protected const MEETING_PROVIDERS = [
        'google_meet' => 'Google Meet',
        'custom' => 'Custom',
    ];

    /**
     * Get the price type select options.
     *
     * @return array<array{value: string, label: string}>
     */
    public static function priceTypes(): array
    {
        return PriceType::options();
    }

    /**
     * Get the service type select options.
     *
     * @return array<array{value: string, label: string}>
     */
    public static function serviceTypes(): array
    {
        return ServiceType::options();
    }

    /**
     * Get the delivery type select options.
     *
     * @return array<array{value: string, label: string}>
     */
    public static function deliveryTypes(): array
    {
        return DeliveryType::options();
    }

    /**
     * Get the online meeting provider select options.
     *
     * @return array<array{value: string, label: string}>
     */
    public static function meetingProviders(): array
    {
        return collect(self::MEETING_PROVIDERS)
            ->map(fn (string $label, string $value): array => ['value' => $value, 'label' => $label])
            ->values()
            ->toArray();
    }

    /**
     * Get the valid online meeting provider keys.
     *
     * @return array<int, string>
     */
    public static function meetingProviderKeys(): array
    {
        return array_keys(self::MEETING_PROVIDERS);
    }
}
