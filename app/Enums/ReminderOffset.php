<?php

namespace App\Enums;

use Carbon\CarbonInterval;

/**
 * How far before an appointment its reminder is sent, expressed in minutes.
 *
 * These are the fixed choices the public booking page offers. The backing value
 * is the lead time in minutes, so it drops straight into `start_at`-relative
 * arithmetic and into validation via {@see self::minutes()}.
 */
enum ReminderOffset: int
{
    case OneHour = 60;
    case TwoHours = 120;
    case ThreeHours = 180;
    case FourHours = 240;
    case FiveHours = 300;
    case SixHours = 360;
    case NineHours = 540;
    case TwelveHours = 720;
    case FifteenHours = 900;
    case EighteenHours = 1080;
    case TwentyOneHours = 1260;
    case TwentyFourHours = 1440;
    case TwoDays = 2880;
    case ThreeDays = 4320;
    case FiveDays = 7200;
    case SevenDays = 10080;

    /**
     * The default offset preselected on the booking page (24 hours before).
     */
    public const DEFAULT = self::TwentyFourHours;

    /**
     * Every offset's minute value, for validating the submitted choice.
     *
     * @return array<int, int>
     */
    public static function minutes(): array
    {
        return array_map(fn (self $offset): int => $offset->value, self::cases());
    }

    /**
     * A localized, human-readable lead time (e.g. "21 hours", "2 days") for the
     * reminder email copy.
     */
    public function forHumans(): string
    {
        return CarbonInterval::minutes($this->value)->cascade()->forHumans();
    }
}
