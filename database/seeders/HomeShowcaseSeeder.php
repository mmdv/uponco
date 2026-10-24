<?php

namespace Database\Seeders;

use App\Enums\AppointmentSource;
use App\Enums\AppointmentStatus;
use App\Enums\BusinessCategory;
use App\Enums\Currency;
use App\Enums\DeliveryType;
use App\Enums\ServiceType;
use App\Models\Team;
use Carbon\CarbonImmutable;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

/**
 * Seeds every fictional business the home page screenshots are captured from
 * (scripts/marketing/capture-home-screens.mjs): Studio North plus a yoga
 * studio, a physio clinic and a tutor, each with its own brand colour, and a
 * handful of bookings so the calendar and group capacity look lived-in.
 *
 * Local only — it creates fictional customers and bookings.
 */
class HomeShowcaseSeeder extends ShowcaseSeeder
{
    use WithoutModelEvents;

    public const YOGA_SLUG = 'lumen-yoga';

    /**
     * Seed the home page showcase businesses.
     */
    public function run(): void
    {
        if (! app()->environment('local', 'testing')) {
            $this->command?->error('HomeShowcaseSeeder only runs locally. Use StudioNorthSeeder for the public demo.');

            return;
        }

        $this->call(StudioNorthSeeder::class);

        $studioNorth = StudioNorthSeeder::team();
        $this->bookStudioNorthDay($studioNorth);

        $yoga = $this->seedTeam([
            'slug' => self::YOGA_SLUG,
            'name' => 'Lumen Yoga',
            'category' => BusinessCategory::YogaStudio,
            'color' => '#0f9d74',
            'monogram' => 'LY',
            'timezone' => 'Europe/Amsterdam',
            'currency' => Currency::Eur,
            'owner' => [
                'name' => 'Maya Lind',
                'email' => 'maya@lumen-yoga.test',
                'job_title' => 'Yoga teacher',
                'description' => 'Vinyasa and slow flow, all levels welcome.',
            ],
            'members' => [],
            'locations' => [
                ['name' => 'Lumen Yoga Studio', 'city' => 'Amsterdam', 'street' => 'Parkweg 4', 'postal_code' => '1091 AB', 'country' => 'NL'],
            ],
            'services' => [
                ['title' => 'Morning flow', 'price' => 16, 'duration' => 60, 'interval' => 60, 'type' => ServiceType::Group, 'capacity' => 8, 'description' => 'A calm vinyasa class to start the day.'],
                ['title' => 'Online slow flow', 'price' => 12, 'duration' => 45, 'interval' => 60, 'type' => ServiceType::Group, 'capacity' => 20, 'delivery' => DeliveryType::Online, 'description' => 'Join from home — the link arrives with your booking.'],
                ['title' => 'Private session', 'price' => 55, 'duration' => 60, 'interval' => 60, 'description' => 'One-to-one practice built around you.'],
            ],
            'hours' => ['start' => '08:00:00', 'end' => '20:00:00'],
        ]);
        $this->fillGroupClass($yoga);

        $this->seedTeam([
            'slug' => 'harbor-physio',
            'name' => 'Harbor Physio',
            'category' => BusinessCategory::Physiotherapy,
            'color' => '#0e7490',
            'monogram' => 'HP',
            'timezone' => 'Europe/Amsterdam',
            'currency' => Currency::Eur,
            'owner' => [
                'name' => 'Daniel Reyes',
                'email' => 'daniel@harbor-physio.test',
                'job_title' => 'Physiotherapist',
                'description' => 'Sports injuries and back pain.',
            ],
            'members' => [
                ['name' => 'Ines Novak', 'email' => 'ines@harbor-physio.test', 'job_title' => 'Physiotherapist', 'description' => 'Post-surgery rehab and mobility.'],
            ],
            'locations' => [
                ['name' => 'Harbor Physio Centrum', 'city' => 'Rotterdam', 'street' => 'Havenstraat 21', 'postal_code' => '3011 AB', 'country' => 'NL'],
                ['name' => 'Harbor Physio Zuid', 'city' => 'Rotterdam', 'street' => 'Maasboulevard 8', 'postal_code' => '3071 CD', 'country' => 'NL'],
            ],
            'services' => [
                ['title' => 'First assessment', 'price' => 65, 'duration' => 45, 'description' => 'History, examination and a plan.'],
                ['title' => 'Treatment session', 'price' => 50, 'duration' => 30, 'description' => 'Hands-on treatment and exercises.'],
                ['title' => 'Sports massage', 'price' => 45, 'duration' => 30, 'description' => 'Deep tissue work for recovery.'],
            ],
            'hours' => ['start' => '08:00:00', 'end' => '17:00:00'],
        ]);

        $this->seedTeam([
            'slug' => 'mira-tutoring',
            'name' => 'Mira Tutoring',
            'category' => BusinessCategory::OnlineTutoring,
            'color' => '#7c3aed',
            'monogram' => 'MT',
            'timezone' => 'Europe/Amsterdam',
            'currency' => Currency::Eur,
            'owner' => [
                'name' => 'Mira Patel',
                'email' => 'mira@mira-tutoring.test',
                'job_title' => 'Maths & physics tutor',
                'description' => 'Exam prep for secondary school students.',
            ],
            'members' => [],
            'locations' => [],
            'services' => [
                ['title' => 'Maths lesson', 'price' => 35, 'duration' => 60, 'interval' => 60, 'delivery' => DeliveryType::Online, 'description' => 'One-to-one online lesson.'],
                ['title' => 'Physics lesson', 'price' => 35, 'duration' => 60, 'interval' => 60, 'delivery' => DeliveryType::Online, 'description' => 'One-to-one online lesson.'],
                ['title' => 'Exam crash course', 'price' => 60, 'duration' => 90, 'interval' => 60, 'delivery' => DeliveryType::Online, 'description' => 'Past papers and timing practice.'],
            ],
            'hours' => ['start' => '14:00:00', 'end' => '20:00:00'],
        ]);
    }

    /**
     * Book a believable day for Studio North so the calendar screenshot (which
     * opens on today) shows every specialist busy at different times.
     */
    private function bookStudioNorthDay(Team $team): void
    {
        $day = CarbonImmutable::now($team->timezone)->startOfDay();
        $specialists = $team->members()->orderBy('team_members.id')->get()->values();
        $services = $team->services()->get()->keyBy('title');
        $location = $team->locations()->first();

        $bookings = [
            ['09:00', 0, 'Haircut', 'Lucas Meyer'],
            ['09:30', 1, 'Skin fade', 'Omar Said'],
            ['10:00', 2, 'Beard trim', 'Jonas Berg'],
            ['10:30', 0, 'Cut & beard', 'Theo Laurent'],
            ['11:00', 1, 'Haircut', 'Ravi Singh'],
            ['12:00', 2, 'Kids cut', 'Leo Brandt'],
            ['13:30', 0, 'Skin fade', 'Adam Novak'],
            ['14:00', 1, 'Cut & beard', 'Felix Moreau'],
            ['15:00', 2, 'Haircut', 'Hugo Costa'],
        ];

        foreach ($bookings as [$time, $specialistIndex, $serviceTitle, $customerName]) {
            $service = $services[$serviceTitle];
            $startAt = $day->setTimeFromTimeString($time);

            $this->book($team, $service->id, $location?->id, $specialists[$specialistIndex]->id, $customerName, $startAt, $service->duration);
        }
    }

    /**
     * Fill five of the eight places in tomorrow's 09:00 Morning flow class, so
     * the time list shows "3 left".
     */
    private function fillGroupClass(Team $team): void
    {
        $service = $team->services()->where('title', 'Morning flow')->firstOrFail();
        $teacher = $team->members()->firstOrFail();
        $location = $team->locations()->first();
        $startAt = $this->nextWorkingDay($team)->setTime(9, 0);

        foreach (['Emma Vos', 'Sara Lind', 'Julia Roos', 'Anna Berg', 'Lena Hart'] as $customerName) {
            $this->book($team, $service->id, $location?->id, $teacher->id, $customerName, $startAt, $service->duration);
        }
    }

    /**
     * Create one booked appointment for a new fictional customer.
     */
    private function book(Team $team, int $serviceId, ?int $locationId, int $specialistId, string $customerName, CarbonImmutable $startAt, int $duration): void
    {
        $customer = $team->customers()->create([
            'name' => $customerName,
            'email' => str($customerName)->slug('.').'@example.com',
        ]);

        $team->appointments()->create([
            'service_id' => $serviceId,
            'location_id' => $locationId,
            'specialist_id' => $specialistId,
            'customer_id' => $customer->id,
            'start_at' => $startAt->utc(),
            'end_at' => $startAt->addMinutes($duration)->utc(),
            'status' => AppointmentStatus::Booked,
            'source' => AppointmentSource::Public,
            'delivery_type' => DeliveryType::Onsite,
        ]);
    }

    /**
     * Tomorrow in the team's timezone, skipping Sunday when no one works.
     */
    private function nextWorkingDay(Team $team): CarbonImmutable
    {
        $day = CarbonImmutable::now($team->timezone)->addDay()->startOfDay();

        return $day->isSunday() ? $day->addDay() : $day;
    }
}
