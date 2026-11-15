<?php

namespace App\Mcp\Tools;

use App\Mcp\AppointmentData;
use App\Models\Team;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('get-appointment')]
#[Title('Get appointment')]
#[Description('One appointment with its full details and, under `can`, what the user may do with it now (reschedule or cancel upcoming ones; mark or undo a no-show on past ones).')]
#[IsReadOnly]
#[IsIdempotent]
class GetAppointmentTool extends BusinessTool
{
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

        return Response::structured(AppointmentData::detail($user, $appointment, $this->timezone($team)));
    }
}
