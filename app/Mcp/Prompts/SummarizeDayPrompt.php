<?php

namespace App\Mcp\Prompts;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Prompt;
use Laravel\Mcp\Server\Prompts\Argument;

#[Name('summarize-day')]
#[Title('Summarize my day')]
#[Description('A short briefing on one day in Uponco: who is coming when, gaps, and anything to sort out.')]
class SummarizeDayPrompt extends Prompt
{
    /**
     * @return array<int, Argument>
     */
    public function arguments(): array
    {
        return [
            new Argument('day', 'Which day, e.g. "today", "tomorrow" or 2026-11-20. Defaults to today.'),
        ];
    }

    public function handle(Request $request): Response
    {
        $day = trim((string) $request->get('day')) ?: 'today';

        return Response::text(<<<TEXT
            Give me a briefing on my Uponco day for {$day}.

            1. Call get-account for today's date and timezone, and work out which date "{$day}" means.
            2. Call list-appointments for that date.
            3. Reply with: how many appointments, the first and last start time, and a time-ordered list (time, customer, service, specialist if it is not me, notes).
            4. Point out free gaps of an hour or more, appointments without a customer phone or email, and any no-shows or cancellations.
            5. Keep it short. Do not change anything.
            TEXT);
    }
}
