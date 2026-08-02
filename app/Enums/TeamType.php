<?php

namespace App\Enums;

enum TeamType: string
{
    case Individual = 'individual';
    case Organisation = 'organisation';

    /**
     * Get the display label for the team type.
     */
    public function label(): string
    {
        return match ($this) {
            self::Individual => 'Individual',
            self::Organisation => 'Organisation',
        };
    }

    /**
     * Get all team types as select options.
     *
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(fn (self $type): array => [
            'value' => $type->value,
            'label' => $type->label(),
        ], self::cases());
    }

    /**
     * Get the list of valid team type values.
     *
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(fn (self $type): string => $type->value, self::cases());
    }
}
