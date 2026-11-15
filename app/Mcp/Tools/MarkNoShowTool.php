<?php

namespace App\Mcp\Tools;

use App\Actions\Appointments\UpdateAppointmentStatus;
use App\Enums\AppointmentStatus;
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
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsOpenWorld;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('mark-no-show')]
#[Title('Mark no-show')]
#[Description('Record that the customer did not come to a past appointment, or undo that with no_show set to false. Only past appointments; nobody is emailed.')]
#[IsIdempotent]
#[IsReadOnly(false)]
#[IsDestructive(true)]
#[IsOpenWorld(false)]
class MarkNoShowTool extends BusinessTool
{
    public function __construct(protected UpdateAppointmentStatus $updateAppointmentStatus) {}

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'appointment_id' => $schema->integer()->description('The appointment id from list-appointments.')->required(),
            'no_show' => $schema->boolean()->description('True to mark as a no-show (default), false to undo it.'),
        ];
    }

    protected function handleForBusiness(Request $request, User $user, Team $team): Response|ResponseFactory
    {
        $data = $request->validate([
            'appointment_id' => ['required', 'integer'],
            'no_show' => ['nullable', 'boolean'],
        ]);

        $appointment = $this->findVisibleAppointment($user, $team, $data['appointment_id']);

        if ($appointment === null) {
            return Response::error(__('Appointment not found.'));
        }

        if ($appointment->isCancelled()) {
            return Response::error(__('This appointment was cancelled, so it cannot be a no-show.'));
        }

        if (! AppointmentAccess::canChangePast($user, $appointment)) {
            return Response::error(__('Only past appointments can be marked as a no-show.'));
        }

        $status = ($data['no_show'] ?? true) ? AppointmentStatus::NoShow : AppointmentStatus::Booked;

        $this->updateAppointmentStatus->handle($appointment, $status);

        return Response::structured([
            'status' => $status->value,
            'appointment' => AppointmentData::detail($user, $appointment->refresh()->load(AppointmentData::RELATIONS), $this->timezone($team)),
        ]);
    }
}
