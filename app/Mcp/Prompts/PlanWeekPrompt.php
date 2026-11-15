<?php

namespace App\Mcp\Prompts;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Prompt;
use Laravel\Mcp\Server\Prompts\Argument;

#[Name('plan-week')]
#[Title('Plan my week')]
#[Description('An overview of a week in Uponco: bookings per day, working hours, days off and how full each day is.')]
class PlanWeekPrompt extends Prompt
{
    /**
     * @return array<int, Argument>
     */
    public function arguments(): array
    {
        return [
            new Argument('week', 'Which week, e.g. "this week", "next week" or a date in it. Defaults to this week.'),
        ];
    }

    public function handle(Request $request): Response
    {
        $week = trim((string) $request->get('week')) ?: 'this week';

        return Response::text(<<<TEXT
            Help me plan {$week} in Uponco.

            1. Call get-account for today's date and timezone, and work out the Monday-to-Sunday dates of "{$week}".
            2. Call get-working-hours and list-appointments for those dates.
            3. Show one line per day: working hours (or "day off"), number of bookings, and roughly how full the day is.
            4. Call out busy days, quiet days with lots of free time, and bookings that fall outside working hours.
            5. Suggest what I could do (e.g. open more hours, take a day off), but do not change anything until I say so.
            TEXT);
    }
}
