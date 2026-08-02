<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use App\Support\ScheduleSummary;
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
