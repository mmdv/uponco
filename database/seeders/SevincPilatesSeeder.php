<?php

namespace Database\Seeders;

use App\Actions\Teams\CreateTeam;
use App\Enums\BusinessCategory;
use App\Enums\Currency;
use App\Enums\DeliveryType;
use App\Enums\OnboardingStep;
use App\Enums\OnboardingStepStatus;
use App\Enums\PriceType;
use App\Enums\ServiceType;
use App\Enums\TeamType;
use App\Models\Location;
use App\Models\OnboardingProgress;
use App\Models\ScheduleSlot;
use App\Models\Team;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeds the "Sevinc Pilates" demo studio used for marketing recordings.
 *
 * Builds a fully bookable company through the app's real models so every
 * invariant the public booking flow relies on holds: an onboarded team with a
 * single instructor (Sevinc Mammadova, who owns the team so she is the only
 * bookable specialist), one location, an individual + a group service
 * (100 AZN / 60 min), and date-based availability on every odd, non-weekend day
 * of Aug–Sep 2026 — which guarantees the 13:00 slot on Wed 19 Aug 2026 the
 * Playwright script books.
 *
 * Idempotent: re-running wipes the previous "sevinc-pilates" team and its data
 * first, so the demo always starts from a clean, predictable state.
 */
class SevincPilatesSeeder extends Seeder
{
    use WithoutModelEvents;

    private const TEAM_SLUG = 'sevinc-pilates';

    private const INSTRUCTOR_EMAIL = 'sevinc@sevincpilates.test';

    private const PASSWORD = 'password';

    private const BRAND_COLOR = '#7c3aed';

    private const TIMEZONE = 'Asia/Baku';

    /**
     * The availability windows applied to every scheduled day.
     *
     * @var list<array{start: string, end: string}>
     */
    private const WINDOWS = [
        ['start' => '12:00:00', 'end' => '14:00:00'],
        ['start' => '15:00:00', 'end' => '18:00:00'],
    ];

    /**
     * Seed the Sevinc Pilates demo studio.
     */
    public function run(): void
    {
        DB::transaction(function (): void {
            $this->purgeExisting();

            // Sevinc owns the studio and is its only instructor, so she is the
            // single (and therefore auto-selected) specialist in the booking flow.
            $instructor = User::create([
                'name' => 'Sevinc Mammadova',
                'email' => self::INSTRUCTOR_EMAIL,
                'password' => self::PASSWORD,
            ]);
            $instructor->forceFill(['email_verified_at' => now()])->save();

            $instructor->profile()->create([
                'email' => self::INSTRUCTOR_EMAIL,
                'job_title' => 'Pilates təlimçisi',
            ]);

            $team = (new CreateTeam)->handle(
                $instructor,
                name: 'Sevinc Pilates',
                isPersonal: false,
                businessCategory: BusinessCategory::PilatesStudio,
            );

            // Finish onboarding so the /company/* pages and the public booking
            // page treat the team as fully set up (see Team::needsOnboarding()).
            $team->update([
                'type' => TeamType::Organisation,
                'timezone' => self::TIMEZONE,
                'brand_primary_color' => self::BRAND_COLOR,
            ]);

            $this->markOnboardingComplete($team, $instructor);

            $location = $this->createLocation($team, $instructor);
            $this->createServices($team, $location, $instructor);
            $this->createSchedule($team, $instructor);

            $this->command?->info(sprintf(
                'Seeded "%s" — book at /appointments/%s (login %s / %s).',
                $team->name,
                $team->slug,
                self::INSTRUCTOR_EMAIL,
                self::PASSWORD,
            ));
        });
    }

    /**
     * Remove any previously seeded Sevinc Pilates team and its dependent rows so
     * the seeder can be run repeatedly from a clean slate.
     */
    private function purgeExisting(): void
    {
        $team = Team::withTrashed()->where('slug', self::TEAM_SLUG)->first();

        if ($team !== null) {
            $team->appointments()->delete();
            $team->customers()->delete();
            ScheduleSlot::where('team_id', $team->id)->delete();
            OnboardingProgress::where('team_id', $team->id)->delete();

            foreach ($team->services()->withTrashed()->get() as $service) {
                $service->locations()->detach();
                $service->specialists()->detach();
                $service->forceDelete();
            }

            foreach ($team->locations()->withTrashed()->get() as $location) {
                $location->services()->detach();
                $location->specialists()->detach();
                $location->forceDelete();
            }

            $team->memberships()->delete();
            $team->forceDelete();
        }

        User::where('email', self::INSTRUCTOR_EMAIL)
            ->get()
            ->each(function (User $user): void {
                $user->scheduleSlots()->delete();
                $user->services()->detach();
                $user->locations()->detach();
                $user->forceDelete();
            });
    }

    /**
     * Mark the studio's onboarding checklist complete so the dashboard opens
     * straight onto the running business rather than the setup guide.
     */
    private function markOnboardingComplete(Team $team, User $instructor): void
    {
        OnboardingProgress::create([
            'team_id' => $team->id,
            'user_id' => $instructor->id,
            'services_status' => OnboardingStepStatus::Completed,
            'profile_status' => OnboardingStepStatus::Completed,
            'schedule_status' => OnboardingStepStatus::Completed,
            'current_step' => OnboardingStep::Schedule,
            'completed_at' => now(),
        ]);
    }

    /**
     * Create the "Dəmirçi tower" branch and attach the instructor to it.
     */
    private function createLocation(Team $team, User $instructor): Location
    {
        $location = $team->locations()->create([
            'is_active' => true,
            'name' => 'Dəmirçi tower',
            'country' => 'AZ',
            'city' => 'Baku',
            'street_address' => 'Nobel prospekti 15',
            'postal_code' => 'AZ1025',
        ]);

        $location->specialists()->attach($instructor->id);

        return $location;
    }

    /**
     * Create the individual and group pilates services (both 100 AZN, 60 min,
     * onsite) and wire them to the location and instructor.
     */
    private function createServices(Team $team, Location $location, User $instructor): void
    {
        $individual = $team->services()->create([
            'is_active' => true,
            'title' => 'Fərdi Pilates',
            'price_type' => PriceType::Fixed,
            'price' => 100,
            'currency' => Currency::Azn,
            'duration' => 60,
            'technical_break' => 0,
            // Start times land on the hour, so the picker shows clean 12:00 / 13:00
            // (and 15:00 / 16:00 / 17:00) slots for the recording.
            'slot_interval' => 60,
            'service_type' => ServiceType::Individual,
            'delivery_type' => DeliveryType::Onsite,
            'description' => 'Sevinc ilə fərdi reformer pilates məşğələsi.',
        ]);

        $group = $team->services()->create([
            'is_active' => true,
            'title' => 'Qrup Pilates',
            'price_type' => PriceType::Fixed,
            'price' => 100,
            'currency' => Currency::Azn,
            'duration' => 60,
            'technical_break' => 0,
            'slot_interval' => 60,
            'service_type' => ServiceType::Group,
            'delivery_type' => DeliveryType::Onsite,
            'capacity' => 8,
            'description' => 'Kiçik qrupda mat pilates dərsi.',
        ]);

        foreach ([$individual, $group] as $service) {
            $service->locations()->sync([$location->id]);
            $service->specialists()->sync([$instructor->id]);
        }
    }

    /**
     * Insert availability on every odd-numbered, non-weekend day across Aug–Sep
     * 2026, each day carrying the two standard windows for the instructor.
     */
    private function createSchedule(Team $team, User $instructor): void
    {
        $now = now();
        $rows = [];

        $day = CarbonImmutable::create(2026, 8, 1, 0, 0, 0, self::TIMEZONE);
        $end = CarbonImmutable::create(2026, 9, 30, 0, 0, 0, self::TIMEZONE);

        for (; $day->lessThanOrEqualTo($end); $day = $day->addDay()) {
            if ($day->day % 2 === 0 || $day->isWeekend()) {
                continue;
            }

            foreach (self::WINDOWS as $window) {
                $rows[] = [
                    'team_id' => $team->id,
                    'user_id' => $instructor->id,
                    'date' => $day->format('Y-m-d'),
                    'start_time' => $window['start'],
                    'end_time' => $window['end'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        ScheduleSlot::insert($rows);
    }
}
