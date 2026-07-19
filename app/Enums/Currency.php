<?php

namespace App\Enums;

enum Currency: string
{
    case Eur = 'EUR';
    case Usd = 'USD';
    case Azn = 'AZN';

    /**
     * The currency assumed when none was chosen.
     */
    public const Default = self::Eur;

    /**
     * Get the symbol used when displaying an amount in this currency.
     */
    public function symbol(): string
    {
        return match ($this) {
            self::Eur => '€',
            self::Usd => '$',
            self::Azn => '₼',
        };
    }

    /**
     * Get the currency that suits a UI locale, falling back to the default.
     */
    public static function forLocale(string $locale): self
    {
        return match ($locale) {
            'az' => self::Azn,
            default => self::Default,
        };
    }

    /**
     * Get all currencies as select options.
     *
     * @return array<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return collect(self::cases())
            ->map(fn (self $currency) => ['value' => $currency->value, 'label' => $currency->value])
            ->values()
            ->toArray();
    }
}
