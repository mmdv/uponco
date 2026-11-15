<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;

#[Name('set-day-off')]
#[Title('Set day off')]
#[Description('Give a specialist a day off — or several, e.g. a holiday — by removing their working hours on those days, so nobody can book them. Existing bookings on those days are NOT cancelled: they are returned in appointments_outside_hours; tell the user and offer to reschedule or cancel them. Confirm the days with the user first.')]
#[IsIdempotent]
class SetDayOffTool extends WorkingHoursChangeTool
{
    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return $this->rangeSchema($schema);
    }

    /**
     * @return array<int, array{start: string, end: string}>
     */
    protected function hours(Request $request): array
    {
        return [];
    }

    /**
     * @return array<string, mixed>
     */
    protected function result(): array
    {
        return ['day_off' => true];
    }
}
