<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;

#[Name('set-working-hours')]
#[Title('Set working hours')]
#[Description('Set a specialist\'s working hours on one day or a range of days (optionally only some weekdays), replacing whatever hours those days had. Hours are in the business timezone; several blocks per day make a break, e.g. 09:00–13:00 and 14:00–18:00. Existing bookings are kept: any that now fall outside the hours are returned in appointments_outside_hours — tell the user about them. Confirm the days and hours with the user first.')]
#[IsIdempotent]
class SetWorkingHoursTool extends WorkingHoursChangeTool
{
    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            ...$this->rangeSchema($schema),
            'hours' => $schema->array()->min(1)->items($schema->object([
                'start' => $schema->string()->pattern('^\d{2}:\d{2}$')->description('HH:MM, 24-hour.')->required(),
                'end' => $schema->string()->pattern('^\d{2}:\d{2}$')->description('HH:MM, 24-hour, after start.')->required(),
            ]))->description('The working blocks for each chosen day. Use set-day-off for a day without hours.')->required(),
        ];
    }

    /**
     * @return array<int, array{start: string, end: string}>
     */
    protected function hours(Request $request): array
    {
        $hours = $request->validate([
            'hours' => ['required', 'array', 'min:1'],
            'hours.*.start' => ['required', 'date_format:H:i'],
            'hours.*.end' => ['required', 'date_format:H:i'],
        ])['hours'];

        $hours = array_map(fn (array $block): array => ['start' => $block['start'], 'end' => $block['end']], $hours);
        usort($hours, fn (array $a, array $b): int => $a['start'] <=> $b['start']);

        return $hours;
    }

    /**
     * @return array<string, mixed>
     */
    protected function result(): array
    {
        return ['saved' => true];
    }
}
