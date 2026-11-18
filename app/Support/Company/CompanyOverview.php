<?php

namespace App\Support\Company;

use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use App\Support\ScheduleSummary;
use Illuminate\Support\Collection;

/**
 * The summary behind the Manage hub: the team at a glance, the viewer's hours
 * for the next 7 days, locations and services. Shared by the web company page
 * and the mobile API so both show the same numbers.
 */
class CompanyOverview
{
    /**
     * @return array{team: array{name: string}, business: array<string, mixed>, schedule: array<string, mixed>, locations: array{count: int, cities: Collection<int, string>}, services: array<string, mixed>}
     */
    public static function for(User $user): array
    {
        $team = $user->currentTeam;
        $members = $team->members()->orderBy('name')->get();

        return [
            'team' => [
                'name' => $team->name,
            ],
            'business' => self::businessSummary($members),
            'schedule' => ScheduleSummary::forUser($user, $team),
            'locations' => [
                'count' => $team->locations()->count(),
                'cities' => $team->locations()
                    ->whereNotNull('city')
                    ->orderBy('city')
                    ->pluck('city')
                    ->unique()
                    ->take(3)
                    ->values(),
            ],
            'services' => self::servicesSummary($team),
        ];
    }

    /**
     * The team / members summary.
     *
     * @param  Collection<int, User>  $members
     * @return array{total: int, roles: array<int, array{role: string, label: string, count: int}>, people: array<int, array{name: string, role: string, avatar: ?string}>}
     */
    protected static function businessSummary(Collection $members): array
    {
        $roles = $members
            ->groupBy(fn (User $member): string => $member->pivot->role->value)
            ->map(fn (Collection $group, string $role): array => [
                'role' => $role,
                'label' => $group->first()->pivot->role->label(),
                'count' => $group->count(),
            ])
            ->sortByDesc('count')
            ->values()
            ->all();

        return [
            'total' => $members->count(),
            'roles' => $roles,
            'people' => $members->take(5)->map(fn (User $member): array => [
                'name' => $member->name,
                'role' => $member->pivot->role->value,
                'avatar' => $member->avatar,
            ])->values()->all(),
        ];
    }

    /**
     * The services summary: counts and the first three services.
     *
     * @return array{count: int, categories: int, items: array<int, array{title: string, duration: int, price: ?string, currency: ?string, category: ?string}>}
     */
    protected static function servicesSummary(Team $team): array
    {
        return [
            'count' => $team->services()->count(),
            'categories' => $team->serviceCategories()->count(),
            'items' => $team->services()
                ->with('category:id,name')
                ->orderBy('title')
                ->take(3)
                ->get()
                ->map(fn (Service $service): array => [
                    'title' => $service->title,
                    'duration' => (int) $service->duration,
                    'price' => $service->price,
                    'currency' => $service->currency,
                    'category' => $service->category?->name,
                ])
                ->values()
                ->all(),
        ];
    }
}
