<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\ScheduleSlot;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    /**
     * Display the company overview page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $team = $user->currentTeam;

        $members = $team->members()->orderBy('name')->get();

        return Inertia::render('company/index', [
            'team' => [
                'name' => $team->name,
            ],
            'business' => $this->businessSummary($members),
            'workProfile' => $this->workProfileSummary($user, $team),
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
            'services' => $this->servicesSummary($team),
        ]);
    }

    /**
     * Build the team / members summary card payload.
     *
     * @param  Collection<int, User>  $members
     * @return array{total: int, roles: array<int, array{role: string, label: string, count: int}>, people: array<int, array{name: string, role: string}>}
     */
    protected function businessSummary(Collection $members): array
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
            ])->values()->all(),
        ];
    }

    /**
     * Build the current week's availability summary for the given user.
     *
     * Availability is now date-based, so the summary reflects the actual slots
     * scheduled across the current week (Monday–Sunday in the team timezone)
     * rather than a recurring weekly template.
     *
     * @return array{days: array<int, array{key: string, label: string, minutes: int, isToday: bool}>, weeklyMinutes: int, openNow: bool}
     */
    protected function workProfileSummary(User $user, Team $team): array
    {
        $timezone = $team->timezone ?: config('app.timezone');
        $now = CarbonImmutable::now($timezone);
        $weekStart = $now->startOfWeek(CarbonImmutable::MONDAY);
        $today = $now->format('Y-m-d');
        $nowTime = $now->format('H:i:s');

        $slots = $user->scheduleSlotsFor($team)
            ->whereBetween('date', [$weekStart->format('Y-m-d'), $weekStart->addDays(6)->format('Y-m-d')])
            ->get()
            ->groupBy(fn (ScheduleSlot $slot): string => $slot->date->format('Y-m-d'));

        $weeklyMinutes = 0;
        $openNow = false;
        $days = [];

        for ($offset = 0; $offset < 7; $offset++) {
            $day = $weekStart->addDays($offset);
            $dateKey = $day->format('Y-m-d');
            $daySlots = $slots->get($dateKey, collect());

            $minutes = (int) $daySlots->sum(fn (ScheduleSlot $slot): int => (int) CarbonImmutable::parse($slot->start_time)
                ->diffInMinutes(CarbonImmutable::parse($slot->end_time)));

            $weeklyMinutes += $minutes;

            if ($dateKey === $today) {
                $openNow = $daySlots->contains(fn (ScheduleSlot $slot): bool => $nowTime >= substr((string) $slot->start_time, 0, 8)
                    && $nowTime <= substr((string) $slot->end_time, 0, 8));
            }

            $days[] = [
                'key' => strtolower($day->format('l')),
                'label' => strtoupper(substr($day->format('l'), 0, 1)),
                'minutes' => $minutes,
                'isToday' => $dateKey === $today,
            ];
        }

        return [
            'days' => $days,
            'weeklyMinutes' => $weeklyMinutes,
            'openNow' => $openNow,
        ];
    }

    /**
     * Build the services summary card payload.
     *
     * @return array{count: int, categories: int, items: array<int, array{title: string, duration: int, price: ?string, category: ?string}>}
     */
    protected function servicesSummary(Team $team): array
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
                    'category' => $service->category?->name,
                ])
                ->values()
                ->all(),
        ];
    }
}
