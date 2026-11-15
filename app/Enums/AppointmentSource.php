<?php

namespace App\Enums;

enum AppointmentSource: string
{
    /** Created by a specialist from the dashboard/calendar. */
    case Staff = 'staff';

    /** Booked by the customer themselves on the public booking page. */
    case Public = 'public';

    /** Booked by a staff member through an AI assistant (the MCP server). */
    case Assistant = 'assistant';

    /**
     * Get the display label for the source.
     */
    public function label(): string
    {
        return match ($this) {
            self::Staff => __('Staff'),
            self::Public => __('Online booking'),
            self::Assistant => __('AI assistant'),
        };
    }
}
