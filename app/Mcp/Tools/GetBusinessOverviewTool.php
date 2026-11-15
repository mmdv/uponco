<?php

namespace App\Mcp\Tools;

use App\Enums\TeamPermission;
use App\Models\Team;
use App\Models\User;
use App\Support\Appointments\AppointmentOptions;
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

#[Name('get-business-overview')]
#[Title('Get business overview')]
#[Description('The business\'s active services (duration, price), locations and specialists, with the ids the other tools take and which specialist offers which service where. Call it before looking up slots or appointments by service or specialist name.')]
#[IsIdempotent]
#[IsReadOnly]
#[IsDestructive(false)]
#[IsOpenWorld(false)]
class GetBusinessOverviewTool extends BusinessTool
{
    protected function handleForBusiness(Request $request, User $user, Team $team): Response|ResponseFactory
    {
        $services = array_map(fn (array $service): array => [
            'id' => $service['id'],
            'title' => $service['title'],
            'category' => $service['category_name'],
            'duration_minutes' => $service['duration'],
            'price_type' => $service['price_type'],
            'price' => $service['price'],
            'price_min' => $service['price_min'],
            'price_max' => $service['price_max'],
            'currency' => $service['currency'],
            'delivery_type' => $service['delivery_type'],
            // `group` services take several customers per session, up to `capacity`.
            'service_type' => $service['service_type'],
            'capacity' => $service['capacity'],
            'specialist_ids' => $service['specialist_ids'],
            'location_ids' => $service['location_ids'],
        ], AppointmentOptions::services($team));

        $specialists = $team->members()
            ->with(['profile:id,user_id,job_title'])
            ->orderBy('name')
            ->get()
            ->map(fn (User $member): array => [
                'id' => $member->id,
                'name' => $member->name,
                'job_title' => $member->profile?->job_title,
                'role' => $member->pivot->role->value,
                'is_you' => $member->id === $user->id,
            ])
            ->all();

        return Response::structured([
            'business' => ['id' => $team->id, 'name' => $team->name, 'timezone' => $this->timezone($team)],
            // False: the user only sees and changes their own appointments.
            'you_see_all_appointments' => $user->hasTeamPermission($team, TeamPermission::ViewAllAppointments),
            'services' => $services,
            'locations' => AppointmentOptions::locations($team),
            'specialists' => $specialists,
        ]);
    }
}
