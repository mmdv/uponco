<?php

namespace App\Enums;

enum OnboardingStep: string
{
    case Services = 'services';
    case Profile = 'profile';
    case Schedule = 'schedule';

    /**
     * Get the database column used to persist this step's status.
     */
    public function column(): string
    {
        return "{$this->value}_status";
    }

    /**
     * Get the display label for the step.
     */
    public function label(): string
    {
        return match ($this) {
            self::Services => 'Set up services',
            self::Profile => 'Work profile',
            self::Schedule => 'Work hours',
        };
    }

    /**
     * Determine if the step must be completed (cannot be skipped).
     */
    public function isMandatory(): bool
    {
        return match ($this) {
            self::Profile, self::Schedule => true,
            default => false,
        };
    }

    /**
     * Get the next step in the onboarding flow, if any.
     */
    public function next(): ?self
    {
        $cases = self::cases();
        $index = array_search($this, $cases, true);

        return $cases[$index + 1] ?? null;
    }
}
