<?php

namespace App\Mcp\Tools;

use App\Actions\Appointments\RescheduleAppointment;
use App\Mcp\AppointmentData;
use App\Models\Team;
use App\Models\User;
use App\Support\Appointments\AppointmentAccess;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Tools\Annotations\IsDestructive;
use Laravel\Mcp\Server\Tools\Annotations\IsOpenWorld;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('reschedule-appointment')]
#[Title('Reschedule appointment')]
#[Description('Move an upcoming appointment to another free start time, with the same specialist and service. Check the time with find-available-slots first and confirm the change with the user. The business is alerted as on the web.')]
#[IsReadOnly(false)]
#[IsDestructive(true)]
#[IsOpenWorld(false)]
class RescheduleAppointmentTool extends BusinessTool
{
    public function __construct(protected RescheduleAppointment $rescheduleAppointment) {}

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'appointment_id' => $schema->integer()->description('The appointment id from list-appointments.')->required(),
            'date' => $schema->string()->format('date')->description('New day, YYYY-MM-DD (business timezone).')->required(),
            'time' => $schema->string()->pattern('^\d{2}:\d{2}$')->description('New start time, HH:MM 24-hour (business timezone).')->required(),
        ];
    }

    protected function handleForBusiness(Request $request, User $user, Team $team): Response|ResponseFactory
    {
        $data = $request->validate([
            'appointment_id' => ['required', 'integer'],
            'date' => ['required', 'date_format:Y-m-d'],
            'time' => ['required', 'date_format:H:i'],
        ]);

        $appointment = $this->findVisibleAppointment($user, $team, $data['appointment_id']);

        if ($appointment === null) {
            return Response::error(__('Appointment not found.'));
        }

        if (! AppointmentAccess::canChangeUpcoming($user, $appointment) || $appointment->isCancelled()) {
            return Response::error(__('Only upcoming, booked appointments can be rescheduled.'));
        }

        if ($appointment->specialist_id === null) {
            return Response::error(__('This appointment\'s specialist no longer works here, so it cannot be moved. Cancel it and book a new one instead.'));
        }

        if (! $this->rescheduleAppointment->handle($appointment, $this->businessTime($team, $data['date'], $data['time']))) {
            return Response::error(__('That time is not available. Use find-available-slots to pick a free one.'));
        }

        return Response::structured([
            'rescheduled' => true,
            'appointment' => AppointmentData::detail($user, $appointment->refresh()->load(AppointmentData::RELATIONS), $this->timezone($team)),
        ]);
    }
}
