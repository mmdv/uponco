<?php

namespace App\Mcp\Tools;

use App\Enums\TeamRole;
use App\Mcp\AccountReadiness;
use App\Models\Appointment;
use App\Models\Team;
use App\Models\User;
use App\Support\Appointments\AppointmentAccess;
use Carbon\CarbonImmutable;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Tool;

/**
 * A tool that works on the connected user's current business. It checks the
 * account gates first (see {@see AccountReadiness}) and hands the ready user
 * and team to {@see handleForBusiness()}, so no tool can skip them.
 */
abstract class BusinessTool extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response|ResponseFactory
    {
        /** @var User $user */
        $user = $request->user();

        if ($blocker = AccountReadiness::blocker($user)) {
            return Response::error($blocker);
        }

        return $this->handleForBusiness($request, $user, $user->currentTeam);
    }

    /**
     * Run the tool for a user whose account and business are ready.
     */
    abstract protected function handleForBusiness(Request $request, User $user, Team $team): Response|ResponseFactory;

    /**
     * The business timezone every date and time is read and written in.
     */
    protected function timezone(Team $team): string
    {
        return $team->timezone ?: config('app.timezone');
    }

    /**
     * A wall-clock date and time in the business timezone, as an instant.
     */
    protected function businessTime(Team $team, string $date, string $time): CarbonImmutable
    {
        return CarbonImmutable::createFromFormat('Y-m-d H:i', "{$date} {$time}", $this->timezone($team));
    }

    /**
     * An appointment of the business the user may see, or null — the same
     * answer for "does not exist" and "not yours", so nothing leaks.
     */
    protected function findVisibleAppointment(User $user, Team $team, int $appointmentId): ?Appointment
    {
        // Full related records: rescheduling reads the service's duration.
        $appointment = $team->appointments()
            ->with(['service', 'location', 'specialist', 'customer'])
            ->find($appointmentId);

        return $appointment instanceof Appointment && AppointmentAccess::canView($user, $appointment)
            ? $appointment
            : null;
    }

    /**
     * The member whose working hours the user may read or change, or null when
     * they may not: yourself, or anyone in the business for owners and admins
     * (the web and mobile schedule rule).
     */
    protected function schedulableMember(User $user, Team $team, int $memberId): ?User
    {
        if ($memberId === $user->id) {
            return $user;
        }

        if (! ($user->teamRole($team)?->isAtLeast(TeamRole::Admin) ?? false)) {
            return null;
        }

        return $team->members()->whereKey($memberId)->first();
    }
}
