<?php

namespace Database\Seeders;

use App\Actions\Teams\CreateTeam;
use App\Actions\Teams\DeleteTeam;
use App\Enums\BookingPageDesign;
use App\Enums\BusinessCategory;
use App\Enums\Currency;
use App\Enums\DeliveryType;
use App\Enums\OnboardingStep;
use App\Enums\OnboardingStepStatus;
use App\Enums\PriceType;
use App\Enums\ServiceType;
use App\Enums\TeamRole;
use App\Enums\TeamType;
use App\Models\OnboardingProgress;
use App\Models\ScheduleSlot;
use App\Models\Team;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Shared builder for the fictional businesses shown on the marketing home page.
 *
 * Each subclass describes one or more teams as plain arrays; this class turns a
 * description into a fully bookable, onboarded v2 booking page through the
 * app's real models. Re-seeding a slug wipes the previous team (via DeleteTeam)
 * and its people first, so the fixture always starts from a clean state.
 *
 * @phpstan-type PersonSpec array{name: string, email: string, job_title: string, description: string}
 * @phpstan-type LocationSpec array{name: string, city: string, street: string, postal_code: string, country: string}
 * @phpstan-type ServiceSpec array{title: string, price: float, duration: int, description: string, type?: ServiceType, delivery?: DeliveryType, capacity?: int, interval?: int}
 * @phpstan-type TeamSpec array{slug: string, name: string, category: BusinessCategory, color: string, monogram: string, timezone: string, currency: Currency, owner: PersonSpec, members: list<PersonSpec>, locations: list<LocationSpec>, services: list<ServiceSpec>, hours: array{start: string, end: string}}
 */
abstract class ShowcaseSeeder extends Seeder
{
    /**
     * How many days of availability to create, counted from today.
     */
    protected const AVAILABILITY_DAYS = 180;

    /**
     * Build one showcase team from its description and return it.
     *
     * @param  TeamSpec  $spec
     */
    protected function seedTeam(array $spec): Team
    {
        return DB::transaction(function () use ($spec): Team {
            $this->purge($spec);

            $owner = $this->createPerson($spec['owner']);

            $team = (new CreateTeam)->handle(
                $owner,
                name: $spec['name'],
                isPersonal: false,
                businessCategory: $spec['category'],
            );

            $team->update([
                'type' => TeamType::Organisation,
                'timezone' => $spec['timezone'],
                'brand_primary_color' => $spec['color'],
                'booking_page_design' => BookingPageDesign::V2,
                'logo_path' => $this->storeLogo($spec),
            ]);

            OnboardingProgress::create([
                'team_id' => $team->id,
                'user_id' => $owner->id,
                'services_status' => OnboardingStepStatus::Completed,
                'profile_status' => OnboardingStepStatus::Completed,
                'schedule_status' => OnboardingStepStatus::Completed,
                'current_step' => OnboardingStep::Schedule,
                'completed_at' => now(),
            ]);

            $specialists = collect([$owner]);

            foreach ($spec['members'] as $member) {
                $user = $this->createPerson($member);

                $team->memberships()->create([
                    'user_id' => $user->id,
                    'role' => TeamRole::Member,
                ]);
                $user->switchTeam($team);

                $specialists->push($user);
            }

            $locationIds = collect($spec['locations'])
                ->map(fn (array $location): int => $team->locations()->create([
                    'is_active' => true,
                    'name' => $location['name'],
                    'country' => $location['country'],
                    'city' => $location['city'],
                    'street_address' => $location['street'],
                    'postal_code' => $location['postal_code'],
                ])->id)
                ->all();

            $serviceIds = collect($spec['services'])
                ->map(fn (array $service): int => $team->services()->create([
                    'is_active' => true,
                    'title' => $service['title'],
                    'price_type' => PriceType::Fixed,
                    'price' => $service['price'],
                    'currency' => $spec['currency'],
                    'duration' => $service['duration'],
                    'technical_break' => 0,
                    'slot_interval' => $service['interval'] ?? 30,
                    'service_type' => $service['type'] ?? ServiceType::Individual,
                    'delivery_type' => $service['delivery'] ?? DeliveryType::Onsite,
                    'online_meeting_provider' => ($service['delivery'] ?? null) === DeliveryType::Online ? 'google_meet' : null,
                    'capacity' => $service['capacity'] ?? null,
                    'description' => $service['description'],
                ])->id)
                ->all();

            foreach ($specialists as $specialist) {
                $specialist->locations()->sync($locationIds);
                $specialist->services()->sync($serviceIds);
            }

            $team->services()->each(function ($service) use ($locationIds): void {
                $service->locations()->sync($locationIds);
            });

            $this->createSchedule($team, $specialists->all(), $spec['hours']);

            return $team;
        });
    }

    /**
     * The password for seeded accounts: a known one locally so the capture
     * script can sign in, a random one anywhere else so a public demo team
     * never ships with a guessable login.
     */
    protected function password(): string
    {
        return app()->environment('local', 'testing') ? 'password' : Str::password(32);
    }

    /**
     * Remove a previously seeded copy of the team and every person it created.
     *
     * @param  TeamSpec  $spec
     */
    private function purge(array $spec): void
    {
        $team = Team::withTrashed()->where('slug', $spec['slug'])->first();

        if ($team !== null) {
            (new DeleteTeam)->handle($team);
        }

        $emails = collect([$spec['owner'], ...$spec['members']])->pluck('email');

        User::whereIn('email', $emails)->get()->each(function (User $user): void {
            $user->scheduleSlots()->delete();
            $user->services()->detach();
            $user->locations()->detach();
            $user->profile()->delete();
            $user->forceDelete();
        });
    }

    /**
     * Create a verified user with a public specialist profile.
     *
     * @param  PersonSpec  $person
     */
    private function createPerson(array $person): User
    {
        $user = User::create([
            'name' => $person['name'],
            'email' => $person['email'],
            'password' => $this->password(),
        ]);
        $user->forceFill(['email_verified_at' => now()])->save();
        $user->acceptCurrentTerms();

        $user->profile()->create([
            'email' => $person['email'],
            'job_title' => $person['job_title'],
            'description' => $person['description'],
        ]);

        return $user;
    }

    /**
     * Write a simple monogram logo in the brand colour and return its path.
     *
     * @param  TeamSpec  $spec
     */
    private function storeLogo(array $spec): string
    {
        $path = 'team-logos/'.$spec['slug'].'.svg';

        Storage::disk('public')->put($path, sprintf(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="32" fill="%s"/><text x="64" y="64" dy="0.35em" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="52" font-weight="700" fill="#ffffff">%s</text></svg>',
            $spec['color'],
            e($spec['monogram']),
        ));

        return $path;
    }

    /**
     * Give every specialist the same hours Monday to Saturday, from the start of this week for
     * AVAILABILITY_DAYS days, so the booking page always has free slots.
     *
     * @param  list<User>  $specialists
     * @param  array{start: string, end: string}  $hours
     */
    private function createSchedule(Team $team, array $specialists, array $hours): void
    {
        $now = now();
        $today = CarbonImmutable::now($team->timezone)->startOfWeek();
        $rows = [];

        foreach ($specialists as $specialist) {
            for ($offset = 0; $offset < static::AVAILABILITY_DAYS; $offset++) {
                $day = $today->addDays($offset);

                if ($day->isSunday()) {
                    continue;
                }

                $rows[] = [
                    'team_id' => $team->id,
                    'user_id' => $specialist->id,
                    'date' => $day->format('Y-m-d'),
                    'start_time' => $hours['start'],
                    'end_time' => $hours['end'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        foreach (array_chunk($rows, 500) as $chunk) {
            ScheduleSlot::insert($chunk);
        }
    }
}
