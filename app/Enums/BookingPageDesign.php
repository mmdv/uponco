<?php

namespace App\Enums;

/**
 * The design a team's public booking page is rendered with.
 *
 * Each case maps to an Inertia page component. Design 2 starts as an exact
 * replica of the classic design and is iterated on in isolation, so switching a
 * team over never touches the classic page.
 */
enum BookingPageDesign: string
{
    case Classic = 'classic';
    case V2 = 'v2';

    /**
     * The design used by a team that hasn't picked one.
     */
    public static function default(): self
    {
        return self::Classic;
    }

    /**
     * The Inertia page component that renders this design.
     */
    public function component(): string
    {
        return match ($this) {
            self::Classic => 'public/appointments/book',
            self::V2 => 'public/appointments/book-v2',
        };
    }
}
