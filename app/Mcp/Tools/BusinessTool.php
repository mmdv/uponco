<?php

namespace App\Mcp\Tools;

use App\Enums\TeamRole;
use App\Mcp\AccountReadiness;
use App\Models\Appointment;
use App\Models\Team;
use App\Models\User;
use App\Support\Appointments\AppointmentAccess;
use Carbon\CarbonImmutable;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;
use Laravel\Passport\AccessToken;
use ReflectionClass;

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

        $team = $user->currentTeam;
        $response = $this->handleForBusiness($request, $user, $team);

        if (! $this->isReadOnly() && ! $this->failed($response)) {
            $this->logChange($request, $user, $team, $response);
        }

        return $response;
    }

    /**
     * Record a change made through an assistant in the application log: which
     * tool, for whom, through which connected app and with what. Customer
     * contact details are left out of the log.
     */
    protected function logChange(Request $request, User $user, Team $team, Response|ResponseFactory $response): void
    {
        $token = $user->currentAccessToken();
        $structured = $response instanceof ResponseFactory ? $response->getStructuredContent() : null;

        Log::info('MCP write action', [
            'tool' => $this->name(),
            'user_id' => $user->id,
            'team_id' => $team->id,
            'oauth_client_id' => $token instanceof AccessToken ? $token->oauth_client_id : null,
            'arguments' => Arr::except($request->all(), ['customer_name', 'customer_email', 'customer_phone', 'name', 'email', 'phone', 'notes']),
            'appointment_id' => data_get($structured, 'appointment.id'),
        ]);
    }

    /**
     * Whether the tool only reads (marked #[IsReadOnly], not #[IsReadOnly(false)]).
     */
    protected function isReadOnly(): bool
    {
        $attribute = (new ReflectionClass($this))->getAttributes(IsReadOnly::class)[0] ?? null;

        return $attribute?->newInstance()->value ?? false;
    }

    /**
     * Whether the tool answered with an error instead of doing its job.
     */
    protected function failed(Response|ResponseFactory $response): bool
    {
        return $response instanceof Response
            ? $response->isError()
            : $response->responses()->contains(fn (Response $part): bool => $part->isError());
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
