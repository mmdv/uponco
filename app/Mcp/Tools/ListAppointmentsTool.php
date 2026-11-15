<?php

namespace App\Mcp\Tools;

use App\Enums\AppointmentStatus;
use App\Enums\TeamPermission;
use App\Mcp\AppointmentData;
use App\Models\Appointment;
use App\Models\Team;
use App\Models\User;
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

#[Name('list-appointments')]
#[Title('List appointments')]
#[Description('Appointments between two dates (inclusive, business timezone), oldest first. Like the Uponco calendar it shows booked appointments and no-shows; set include_cancelled to see cancelled ones too. Users who cannot see all appointments only get their own.')]
#[IsReadOnly]
#[IsIdempotent]
class ListAppointmentsTool extends BusinessTool
{
    /** The longest range one call may ask for. */
    protected const MAX_DAYS = 42;

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'from' => $schema->string()->format('date')->description('First day, YYYY-MM-DD.')->required(),
            'to' => $schema->string()->format('date')->description('Last day, YYYY-MM-DD. Defaults to `from`. At most 42 days after it.'),
            'specialist_id' => $schema->integer()->description('Only this specialist\'s appointments (ids from get-business-overview).'),
            'customer_id' => $schema->integer()->description('Only this customer\'s appointments (ids from search-customers).'),
            'include_cancelled' => $schema->boolean()->description('Also return cancelled appointments. Defaults to false.'),
        ];
    }

    protected function handleForBusiness(Request $request, User $user, Team $team): Response|ResponseFactory
    {
        $data = $request->validate([
            'from' => ['required', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
            'specialist_id' => ['nullable', 'integer'],
            'customer_id' => ['nullable', 'integer'],
            'include_cancelled' => ['nullable', 'boolean'],
        ]);

        $timezone = $this->timezone($team);
        $from = CarbonImmutable::parse($data['from'], $timezone)->startOfDay();
        $to = CarbonImmutable::parse($data['to'] ?? $data['from'], $timezone)->endOfDay();

        if ($from->diffInDays($to) >= self::MAX_DAYS) {
            return Response::error(__('Ask for at most :days days at a time.', ['days' => self::MAX_DAYS]));
        }

        $seesAll = $user->hasTeamPermission($team, TeamPermission::ViewAllAppointments);

        if (! $seesAll && isset($data['specialist_id']) && (int) $data['specialist_id'] !== $user->id) {
            return Response::error(__('You can only see your own appointments.'));
        }

        $specialistId = $seesAll ? ($data['specialist_id'] ?? null) : $user->id;

        $statuses = [AppointmentStatus::Booked, AppointmentStatus::NoShow];

        if ($data['include_cancelled'] ?? false) {
            $statuses[] = AppointmentStatus::Cancelled;
        }

        $appointments = $team->appointments()
            ->whereIn('status', $statuses)
            ->whereBetween('start_at', [$from->utc(), $to->utc()])
            ->when($specialistId, fn ($query) => $query->where('specialist_id', $specialistId))
            ->when($data['customer_id'] ?? null, fn ($query, $customerId) => $query->where('customer_id', $customerId))
            ->with(AppointmentData::RELATIONS)
            ->orderBy('start_at')
            ->get()
            ->map(fn (Appointment $appointment): array => AppointmentData::summary($appointment, $timezone))
            ->all();

        return Response::structured([
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'timezone' => $timezone,
            'only_your_appointments' => ! $seesAll,
            'count' => count($appointments),
            'appointments' => $appointments,
        ]);
    }
}
