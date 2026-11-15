<?php

namespace App\Mcp\Tools;

use App\Actions\Appointments\CancelAppointment;
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

#[Name('cancel-appointment')]
#[Title('Cancel appointment')]
#[Description('Cancel an upcoming appointment. The customer is emailed that it was cancelled and the slot opens up again; this cannot be undone. Always confirm with the user first, naming the customer, day and time.')]
#[IsReadOnly(false)]
#[IsDestructive(true)]
#[IsOpenWorld(false)]
class CancelAppointmentTool extends BusinessTool
{
    public function __construct(protected CancelAppointment $cancelAppointment) {}

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'appointment_id' => $schema->integer()->description('The appointment id from list-appointments.')->required(),
        ];
    }

    protected function handleForBusiness(Request $request, User $user, Team $team): Response|ResponseFactory
    {
        $appointmentId = $request->validate(['appointment_id' => ['required', 'integer']])['appointment_id'];

        $appointment = $this->findVisibleAppointment($user, $team, $appointmentId);

        if ($appointment === null) {
            return Response::error(__('Appointment not found.'));
        }

        if ($appointment->isCancelled()) {
            return Response::error(__('This appointment is already cancelled.'));
        }

        if (! AppointmentAccess::canChangeUpcoming($user, $appointment)) {
            return Response::error(__('Past appointments cannot be cancelled. Use mark-no-show if the customer did not come.'));
        }

        $this->cancelAppointment->handle($appointment);

        return Response::structured([
            'cancelled' => true,
            'customer_emailed' => filled($appointment->customer?->email),
            'appointment' => AppointmentData::detail($user, $appointment->refresh()->load(AppointmentData::RELATIONS), $this->timezone($team)),
        ]);
    }
}
