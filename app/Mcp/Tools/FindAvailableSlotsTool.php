<?php

namespace App\Mcp\Tools;

use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use App\Support\Appointments\SlotGenerator;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('find-available-slots')]
#[Title('Find available slots')]
#[Description('Free start times for a service, per specialist and day, from the specialists\' working hours minus existing bookings — the same times the Uponco booking form offers. Leave out specialist_id to check every specialist who offers the service.')]
#[IsReadOnly]
#[IsIdempotent]
class FindAvailableSlotsTool extends BusinessTool
{
    /** The most days one call may scan. */
    protected const MAX_DAYS = 7;

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'service_id' => $schema->integer()->description('The service id from get-business-overview.')->required(),
            'date' => $schema->string()->format('date')->description('First day to check, YYYY-MM-DD.')->required(),
            'days' => $schema->integer()->min(1)->max(self::MAX_DAYS)->description('How many days to check from `date`. Defaults to 1, at most 7.'),
            'specialist_id' => $schema->integer()->description('Only this specialist. Leave out to check everyone who offers the service.'),
        ];
    }

    protected function handleForBusiness(Request $request, User $user, Team $team): Response|ResponseFactory
    {
        $data = $request->validate([
            'service_id' => ['required', 'integer'],
            'date' => ['required', 'date_format:Y-m-d'],
            'days' => ['nullable', 'integer', 'min:1', 'max:'.self::MAX_DAYS],
            'specialist_id' => ['nullable', 'integer'],
        ]);

        $service = $team->services()->whereKey($data['service_id'])->where('is_active', true)->first();

        if (! $service instanceof Service) {
            return Response::error(__('Service not found. Use get-business-overview for the list of services.'));
        }

        // Only team members who offer the service: the booking form never
        // offers anyone else for it.
        $specialists = $team->members()
            ->whereIn('users.id', $service->specialists()->select('users.id'))
            ->when($data['specialist_id'] ?? null, fn ($query, $specialistId) => $query->whereKey($specialistId))
            ->orderBy('name')
            ->get();

        if ($specialists->isEmpty()) {
            return Response::error(isset($data['specialist_id'])
                ? __('That specialist does not offer this service.')
                : __('Nobody offers this service yet.'));
        }

        $timezone = $this->timezone($team);
        // Calendar-date arithmetic, so a daylight-saving change cannot shift a day.
        $firstDay = CarbonImmutable::parse($data['date'])->startOfDay();
        $days = array_map(
            fn (int $offset): string => $firstDay->addDays($offset)->format('Y-m-d'),
            range(0, ($data['days'] ?? 1) - 1),
        );

        $results = $specialists->map(fn (User $specialist): array => [
            'specialist' => ['id' => $specialist->id, 'name' => $specialist->name],
            'days' => array_map(fn (string $day): array => [
                'date' => $day,
                'times' => $this->freeTimes($service, $specialist, $team, $timezone, $day),
            ], $days),
        ])->all();

        return Response::structured([
            'service' => ['id' => $service->id, 'title' => $service->title, 'duration_minutes' => $service->duration],
            'timezone' => $timezone,
            'results' => $results,
        ]);
    }

    /**
     * The bookable start times on one day; an empty list means the specialist
     * is off or fully booked.
     *
     * @return array<int, array{time: string, start: string, seats_left: ?int}>
     */
    protected function freeTimes(Service $service, User $specialist, Team $team, string $timezone, string $day): array
    {
        $slots = SlotGenerator::generate($service, $specialist, $team->id, $timezone, $day);

        return array_values(array_map(fn (array $slot): array => [
            'time' => $slot['label'],
            'start' => CarbonImmutable::parse($slot['start'])->setTimezone($timezone)->toIso8601String(),
            'seats_left' => $slot['remaining'],
        ], array_filter($slots, fn (array $slot): bool => $slot['available'])));
    }
}
