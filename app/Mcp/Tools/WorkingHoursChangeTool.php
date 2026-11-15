<?php

namespace App\Mcp\Tools;

use App\Actions\Schedule\SaveMemberSchedule;
use App\Enums\AppointmentStatus;
use App\Http\Requests\Schedule\SaveMemberScheduleRequest;
use App\Mcp\AppointmentData;
use App\Mcp\FormRequestBridge;
use App\Models\Appointment;
use App\Models\Team;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;

/**
 * Replaces whole days of a specialist's working hours through the schedule
 * editor's own request and action. Existing bookings are never cancelled: the
 * appointments left outside the new hours are returned so the assistant can
 * tell the user.
 */
abstract class WorkingHoursChangeTool extends BusinessTool
{
    /** The longest range one call may change (same as reading). */
    protected const MAX_DAYS = 62;

    protected const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    public function __construct(protected SaveMemberSchedule $saveMemberSchedule) {}

    /**
     * The working hours to set on each chosen day; an empty list is a day off.
     *
     * @return array<int, array{start: string, end: string}>
     */
    abstract protected function hours(Request $request): array;

    /**
     * What this tool reports back besides the days and the clashing bookings.
     *
     * @return array<string, mixed>
     */
    abstract protected function result(): array;

    /**
     * The arguments every working-hours change takes.
     *
     * @return array<string, mixed>
     */
    protected function rangeSchema(JsonSchema $schema): array
    {
        return [
            'from' => $schema->string()->format('date')->description('First day, YYYY-MM-DD.')->required(),
            'to' => $schema->string()->format('date')->description('Last day, YYYY-MM-DD. Defaults to `from`. At most 62 days after it.'),
            'weekdays' => $schema->array()->items($schema->string()->enum(self::WEEKDAYS))
                ->description('Only these weekdays within the range, e.g. ["monday","friday"]. Defaults to every day.'),
            'specialist_id' => $schema->integer()->description('Whose hours. Defaults to the connected user; owners and admins may change anyone\'s.'),
        ];
    }

    protected function handleForBusiness(Request $request, User $user, Team $team): Response|ResponseFactory
    {
        $data = $request->validate([
            'from' => ['required', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
            'weekdays' => ['nullable', 'array'],
            'weekdays.*' => ['string', 'in:'.implode(',', self::WEEKDAYS)],
            'specialist_id' => ['nullable', 'integer'],
        ]);

        $from = CarbonImmutable::createFromFormat('Y-m-d', $data['from'])->startOfDay();
        $to = CarbonImmutable::createFromFormat('Y-m-d', $data['to'] ?? $data['from'])->startOfDay();

        if ($from->diffInDays($to) >= self::MAX_DAYS) {
            return Response::error(__('Choose a shorter date range.'));
        }

        $member = $this->schedulableMember($user, $team, (int) ($data['specialist_id'] ?? $user->id));

        if ($member === null) {
            return Response::error(__('You can only change your own working hours.'));
        }

        $weekdays = $data['weekdays'] ?? self::WEEKDAYS;
        $dates = [];

        for ($day = $from; $day <= $to; $day = $day->addDay()) {
            if (in_array(strtolower($day->englishDayOfWeek), $weekdays, true)) {
                $dates[] = $day->format('Y-m-d');
            }
        }

        if ($dates === []) {
            return Response::error(__('None of the chosen weekdays fall in that date range.'));
        }

        $hours = $this->hours($request);

        $form = FormRequestBridge::validate(SaveMemberScheduleRequest::class, $user, [
            'days' => array_map(fn (string $date): array => ['date' => $date, 'slots' => $hours], $dates),
        ], ['user' => $member]);

        $this->saveMemberSchedule->handle($team, $member, $form->validated('days'));

        return Response::structured([
            ...$this->result(),
            'specialist' => ['id' => $member->id, 'name' => $member->name],
            'dates' => $dates,
            'hours' => $hours,
            // Bookings are kept; these now fall outside the specialist's hours.
            'appointments_outside_hours' => $this->appointmentsOutside($team, $member, $dates, $hours),
        ]);
    }

    /**
     * The specialist's booked appointments on those days that do not fit
     * inside the new hours.
     *
     * @param  array<int, string>  $dates
     * @param  array<int, array{start: string, end: string}>  $hours
     * @return array<int, array<string, mixed>>
     */
    protected function appointmentsOutside(Team $team, User $member, array $dates, array $hours): array
    {
        $timezone = $this->timezone($team);
        $first = CarbonImmutable::parse($dates[0], $timezone)->startOfDay();
        $last = CarbonImmutable::parse(end($dates), $timezone)->endOfDay();

        return $team->appointments()
            ->where('specialist_id', $member->id)
            ->where('status', AppointmentStatus::Booked)
            ->whereBetween('start_at', [$first->utc(), $last->utc()])
            ->with(AppointmentData::RELATIONS)
            ->orderBy('start_at')
            ->get()
            ->filter(function (Appointment $appointment) use ($dates, $hours, $timezone): bool {
                $start = $appointment->start_at->copy()->setTimezone($timezone);

                if (! in_array($start->format('Y-m-d'), $dates, true)) {
                    return false;
                }

                $end = $appointment->end_at->copy()->setTimezone($timezone);

                foreach ($hours as $block) {
                    if ($start->format('H:i') >= $block['start'] && $end->format('H:i') <= $block['end'] && $start->isSameDay($end)) {
                        return false;
                    }
                }

                return true;
            })
            ->map(fn (Appointment $appointment): array => AppointmentData::summary($appointment, $timezone))
            ->values()
            ->all();
    }
}
