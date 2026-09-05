<?php

namespace Database\Seeders;

use App\Enums\Currency;
use App\Enums\DeliveryType;
use App\Enums\PriceType;
use App\Enums\ServiceType;
use App\Models\ScheduleSlot;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Turns the Uponco team's own public booking page into a working lead-funnel:
 * a small set of free, online sessions prospects can book (a demo, a guided
 * onboarding, and an open Q&A), wired to the team owner as the bookable
 * specialist, plus a rolling window of weekday availability so slots always
 * show for the next eight weeks.
 *
 * Idempotent and non-destructive: it operates on the existing "uponco" team
 * (never creates one), upserts each service by slug, deactivates any leftover
 * placeholder services, and only adds availability on days that have none — so
 * re-running never duplicates rows nor wipes availability set by hand in-app.
 */
class UponcoBookingSeeder extends Seeder
{
    use WithoutModelEvents;

    private const TEAM_SLUG = 'uponco';

    /**
     * Availability window applied to every seeded weekday, in the team timezone.
     */
    private const WINDOW = ['start' => '10:00:00', 'end' => '17:00:00'];

    /**
     * How many days ahead to keep availability seeded.
     */
    private const HORIZON_DAYS = 56;

    /**
     * The services offered on the public page, keyed by slug.
     *
     * @var list<array{slug: string, title: string, duration: int, description: string}>
     */
    private const SERVICES = [
        [
            'slug' => 'product-demo',
            'title' => 'Product Demo',
            'duration' => 30,
            'description' => 'A guided walkthrough of Uponco tailored to your business — see how bookings, schedules and reminders work end to end.',
        ],
        [
            'slug' => 'onboarding-session',
            'title' => 'Onboarding Session',
            'duration' => 45,
            'description' => 'We set your booking page up together: services, availability, branding and your public link — leave the call ready to take bookings.',
        ],
        [
            'slug' => 'q-and-a',
            'title' => 'Q&A Session',
            'duration' => 20,
            'description' => 'Open questions about features, pricing or moving from another tool. Bring anything — no commitment.',
        ],
    ];

    /**
     * Seed the Uponco public booking presence.
     */
    public function run(): void
    {
        $team = Team::where('slug', self::TEAM_SLUG)->first();

        if ($team === null) {
            $this->command?->warn('No "uponco" team found — nothing to seed.');

            return;
        }

        $owner = $team->owner();

        if (! $owner instanceof User) {
            $this->command?->warn('The "uponco" team has no owner — nothing to seed.');

            return;
        }

        DB::transaction(function () use ($team, $owner): void {
            $this->syncServices($team, $owner);
            $this->seedAvailability($team, $owner);
        });

        $this->command?->info(sprintf(
            'Seeded Uponco booking page — book at /appointments/%s.',
            $team->slug,
        ));
    }

    /**
     * Upsert the offered services and deactivate any other leftover services.
     */
    private function syncServices(Team $team, User $owner): void
    {
        $keptIds = [];

        foreach (self::SERVICES as $definition) {
            $service = $team->services()->updateOrCreate(
                ['slug' => $definition['slug']],
                [
                    'is_active' => true,
                    'title' => $definition['title'],
                    'description' => $definition['description'],
                    'price_type' => PriceType::Free,
                    'currency' => Currency::Eur,
                    'duration' => $definition['duration'],
                    'technical_break' => 0,
                    'slot_interval' => 30,
                    'service_type' => ServiceType::Individual,
                    'delivery_type' => DeliveryType::Online,
                    'online_meeting_provider' => 'custom',
                ],
            );

            $service->specialists()->syncWithoutDetaching([$owner->id]);
            $keptIds[] = $service->id;
        }

        // Take any earlier placeholder service off the public page without
        // deleting it — the team has no appointments tied to them.
        $team->services()
            ->whereNotIn('id', $keptIds)
            ->where('is_active', true)
            ->each(fn (Service $service) => $service->update(['is_active' => false]));
    }

    /**
     * Add the standard weekday window on every upcoming weekday that has no
     * availability yet, out to the horizon.
     */
    private function seedAvailability(Team $team, User $owner): void
    {
        $timezone = $team->timezone ?: config('app.timezone');
        $now = now();
        $day = CarbonImmutable::now($timezone)->startOfDay();
        $end = $day->addDays(self::HORIZON_DAYS);

        $existingDates = ScheduleSlot::query()
            ->where('team_id', $team->id)
            ->where('user_id', $owner->id)
            ->whereBetween('date', [$day->format('Y-m-d'), $end->format('Y-m-d')])
            ->pluck('date')
            ->map(fn ($date): string => CarbonImmutable::parse($date)->format('Y-m-d'))
            ->all();

        $rows = [];

        for (; $day->lessThanOrEqualTo($end); $day = $day->addDay()) {
            $date = $day->format('Y-m-d');

            if ($day->isWeekend() || in_array($date, $existingDates, true)) {
                continue;
            }

            $rows[] = [
                'team_id' => $team->id,
                'user_id' => $owner->id,
                'date' => $date,
                'start_time' => self::WINDOW['start'],
                'end_time' => self::WINDOW['end'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if ($rows !== []) {
            ScheduleSlot::insert($rows);
        }
    }
}
