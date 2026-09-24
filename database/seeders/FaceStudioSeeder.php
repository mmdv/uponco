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
use App\Enums\TeamRole;
use App\Enums\TeamType;
use App\Models\Location;
use App\Models\OnboardingProgress;
use App\Models\ServiceCategory;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Seeds the "FACE Studio" salon network from facestudio.az.
 *
 * Builds a fully bookable organisation through the app's real models: an
 * onboarded team owned by owner-fs@example.com, the 15 Baku branches listed on
 * the homepage, the 9 service categories and ~112 services from the pricing
 * page (prices in AZN), and 2 specialists per branch. Every service is offered
 * at every location, and every specialist provides every service.
 *
 * Idempotent: re-running wipes the previous "face-studio" team, its owner and
 * all seeded specialists first, so the fixture always starts clean.
 */
class FaceStudioSeeder extends Seeder
{
    use WithoutModelEvents;

    private const TEAM_SLUG = 'face-studio';

    private const OWNER_EMAIL = 'owner-fs@example.com';

    private const SPECIALIST_EMAIL_PREFIX = 'specialist';

    private const SPECIALIST_EMAIL_SUFFIX = '-fs@example.com';

    private const PASSWORD = 'password';

    private const BRAND_COLOR = '#1f2937';

    private const TIMEZONE = 'Asia/Baku';

    private const SPECIALISTS_PER_LOCATION = 2;

    /**
     * The 15 branches from the homepage, in listing order.
     *
     * @var list<array{name: string, street: string, phone: string}>
     */
    private const LOCATIONS = [
        ['name' => 'FACE Studio Nərimanov', 'street' => 'Nazim Hacıyev 35, Nərimanov', 'phone' => '+994 12 441 3355'],
        ['name' => 'FACE Studio Yasamal', 'street' => 'Abbas Mirzə Şərifzadə 656, İnşaatçılar (Yasamal)', 'phone' => '+994 12 533 3355'],
        ['name' => 'FACE Studio Xətai', 'street' => 'Afiyəddin Cəlilov 16, Xətai', 'phone' => '+994 12 490 3355'],
        ['name' => 'FACE Studio Gənclik', 'street' => 'Koroğlu Rəhimov 26, Gənclik', 'phone' => '+994 12 565 3355'],
        ['name' => 'FACE Studio Xalqlar Dostluğu', 'street' => 'Məhəmməd Hadi 9a, Xalqlar Dostluğu', 'phone' => '+994 12 374 3355'],
        ['name' => 'FACE Studio Ayna Sultanova', 'street' => 'Səttar Bəhlulzadə 55, Ayna Sultanova', 'phone' => '+994 12 563 3355'],
        ['name' => 'FACE Studio 28 May', 'street' => 'Dilarə Əliyeva 227 c, 28 May', 'phone' => '+994 12 379 3355'],
        ['name' => 'FACE Studio Memar Əcəmi', 'street' => 'Hüseynbala Əliyev 18, Memar Əcəmi', 'phone' => '+994 12 568 3355'],
        ['name' => 'FACE Studio Elmlər', 'street' => 'Landau küçəsi 6a, Elmlər', 'phone' => '+994 12 538 3355'],
        ['name' => 'FACE Studio Bakıxanov', 'street' => 'Ruhulla Axundov 13, Bakıxanov (Razin)', 'phone' => '+994 12 429 3355'],
        ['name' => 'FACE Studio Həzi Aslanov', 'street' => 'Ramiz Quliyev 47, Həzi Aslanov', 'phone' => '+994 12 434 3355'],
        ['name' => 'FACE Studio Qara Qarayev', 'street' => 'Əlif Hacıyev 23 a, Qara Qarayev', 'phone' => '+994 12 571 3355'],
        ['name' => 'FACE Studio Kişilər üçün', 'street' => 'Mərkəzi bulvar küçəsi 3, Ağ şəhər', 'phone' => '+994 99 380 3355'],
        ['name' => 'FACE Studio Ağ şəhər', 'street' => 'Mərkəzi bulvar küçəsi 3, Ağ şəhər', 'phone' => '+994 99 370 3355'],
        ['name' => 'FACE Studio 6-cı Paralel', 'street' => 'Məhəmməd Naxçıvani 43, 6-cı Paralel', 'phone' => '+994 99 360 3355'],
    ];

    /**
     * The service catalogue from the pricing page, grouped by category.
     *
     * Each category carries a default appointment duration (minutes); the site
     * lists no durations. Each service is [title, priceString]; the price string
     * is parsed by {@see parsePrice()} into a fixed price or a min–max range.
     * "başlayaraq" (from X) is modelled as a fixed price at the starting figure.
     *
     * @var list<array{name: string, duration: int, services: list<array{0: string, 1: string}>}>
     */
    private const CATALOGUE = [
        [
            'name' => '💇‍♀️ Saç prosedurlarımız (Xanımlar üçün)',
            'duration' => 60,
            'services' => [
                ['Ukladka', '15 - 20'],
                ['Kəsim', '30'],
                ['Kəsim (Uşaqlar üçün)', '25'],
                ['Saçın ön hissəsini kəsimi', '10'],
                ['Saçqıran təmizləmə', '40'],
                ['Buruq', '20 - 40'],
                ['Düzüm', '30 - 60'],
                ['Ümumi rəngləmə', '80 - 110'],
                ['Tonlaşdırma', '50 - 70'],
                ['Boya (müştəridən olarsa)', '35'],
                ['Dib boyası', '60 - 65'],
                ['Osvetlenie ilə rəngləmə', '150 - 300'],
                ['Ombre', '150 - 300'],
                ['Balyaj', '150 - 300'],
                ['Keratin düzləşdirmə', '120 - 220'],
                ['Facelight', '45 başlayaraq'],
                ['Baxım Prosedurları', '25 - 150'],
                ['Laminasiya', '80'],
                ['Saç qaynağı', '300 - 700'],
            ],
        ],
        [
            'name' => '💇‍♂️ Saç prosedurlarımız (Bəylər üçün)',
            'duration' => 45,
            'services' => [
                ['Ukladka', '15'],
                ['Kəsim', '25'],
                ['Qaş korreksiyası', '15 - 20'],
                ['Təraş (Bığ və saqqal kəsimi)', '10'],
                ['Keratin', '70 başlayaraq'],
                ['Keratin buruq', '80 başlayaraq'],
                ['Saqqal keratin', '20'],
                ['Rəngləmə', '60 başlayaraq'],
            ],
        ],
        [
            'name' => '💅 Dırnaq prosedurlarımız (Xanımlar üçün)',
            'duration' => 45,
            'services' => [
                ['Manikür sadə lak ilə/laksız', '15'],
                ['Pedikür sadə lak ilə/laksız', '25'],
                ['Lak əl/ayaq', '6'],
                ['Manikür + Shellac', '30'],
                ['Manikürsüz shellac', '20'],
                ['Manikür + Shellac French', '35'],
                ['Pedikür + Shellac', '35'],
                ['Pedikür + Shellac French', '40'],
                ['Gel ilə möhkəmləşdirmə', '40'],
                ['Geli sökülməsi', '10'],
                ['Shellac sökülməsi', '5'],
                ['Qaynaq sökülməsi', '10'],
                ['Sadə lak', '5'],
                ['Dırnaq qaynağı', '60 - 80'],
                ['Korreksiya', '40 - 50'],
                ['Nail-Art (dizayn)', '5 - 10'],
                ['Pedikür SPA', '40'],
                ['Piling (Biogel ilə)', '5'],
                ['Pedikür SPA + Shellac', '50'],
                ['Parafin ilə əl baxımı', '10'],
                ['Parafin ilə ayağa qulluq', '20'],
            ],
        ],
        [
            'name' => '🖐️ Dırnaq prosedurlarımız (Bəylər üçün)',
            'duration' => 45,
            'services' => [
                ['Manikür', '20'],
                ['Pedikür', '35'],
                ['Müalicəvi lak', '5'],
                ['Pedikür SPA', '55'],
                ['Parafin ilə əl baxımı', '20'],
                ['Parafin ilə ayaq baxımı', '30'],
            ],
        ],
        [
            'name' => '💎 Pirsinq',
            'duration' => 30,
            'services' => [
                ['Adi qulaq deşimi', '20'],
                ['Helix', '30'],
                ['Tragus', '30'],
                ['Göbək', '50'],
                ['Burun', '40'],
                ['Qaş', '50'],
                ['Dil', '60'],
            ],
        ],
        [
            'name' => '💄 Makiyaj və baxım prosedurlarımız',
            'duration' => 60,
            'services' => [
                ['Makiyaj (ümumi)', '50 - 80'],
                ['Göz makiyajı', '30'],
                ['Qaş korreksiyası', '15 - 20'],
                ['Üz korreksiyası', '15'],
                ['Üz tonlaşdırma', '30'],
                ['Kirpik yapışdırılması', '20'],
                ['Liner çəkilməsi kirpik ilə birlikdə', '25'],
                ['Gəlin makyajı', '250'],
                ['Qaş laminasiyası', '35'],
                ['Kirpik laminasiyası', '35'],
                ['Permanent', '200'],
                ['Qalıcı dodaq konturu', '150'],
                ['Qalıcı göz liner', '100'],
            ],
        ],
        [
            'name' => '🕯️ Vosk epilyasiyası',
            'duration' => 30,
            'services' => [
                ['Üz', '10'],
                ['Dodaqüstü', '5'],
                ['Çənə', '5'],
                ['Qolaltı', '10'],
                ['Bikini', '20 - 30'],
                ['Qollar', '20'],
                ['Ayaqlar', '30'],
                ['Bütöv bədən', '80'],
            ],
        ],
        [
            'name' => '✨ Lazer epilyasiyası (Xanımlar üçün)',
            'duration' => 30,
            'services' => [
                ['Üz', '10'],
                ['Burun', '5'],
                ['Çənə', '5'],
                ['Dodaqüstü', '5'],
                ['Qolaltı', '10'],
                ['Popa', '15'],
                ['Bikini', '30'],
                ['Qollar', '30'],
                ['Ayaqlar', '40'],
                ['Yarım qol', '20'],
                ['Yarım ayaq', '30'],
                ['Bel', '25'],
                ['Qarın', '25'],
                ['Bütün bədən', '65'],
                ['Bütün bədən (mini)', '50'],
            ],
        ],
        [
            'name' => '⚡ Lazer epilyasiyası (Bəylər üçün)',
            'duration' => 30,
            'services' => [
                ['Sinə', '50'],
                ['Burun', '10'],
                ['Qulaq', '5'],
                ['Boyunarxası', '10'],
                ['Bakenbardard 1 hissə', '10'],
                ['Qolaltı', '20'],
                ['Kürək', '80'],
                ['Dodaqüstü', '20'],
                ['Qollar', '50'],
                ['Ayaqlar', '100'],
                ['Əlüstü', '5'],
                ['Bütün bədən', '220'],
                ['Üz (yanaq)', '10'],
                ['Gözətrafı', '10'],
                ['Boyun', '10'],
            ],
        ],
    ];

    /**
     * Seed the FACE Studio salon network.
     */
    public function run(): void
    {
        DB::transaction(function (): void {
            $this->purgeExisting();

            $owner = User::create([
                'name' => 'FACE Studio Owner',
                'email' => self::OWNER_EMAIL,
                'password' => self::PASSWORD,
            ]);
            $owner->forceFill(['email_verified_at' => now()])->save();

            $owner->profile()->create([
                'email' => self::OWNER_EMAIL,
                'job_title' => 'Salon şəbəkəsinin sahibi',
            ]);

            $team = (new CreateTeam)->handle(
                $owner,
                name: 'FACE Studio',
                isPersonal: false,
                businessCategory: BusinessCategory::BeautySalon,
            );

            $team->update([
                'type' => TeamType::Organisation,
                'timezone' => self::TIMEZONE,
                'brand_primary_color' => self::BRAND_COLOR,
            ]);

            $this->markOnboardingComplete($team, $owner);

            $serviceIds = $this->createCatalogue($team);
            $locations = $this->createLocations($team, $serviceIds);
            $specialistCount = $this->createSpecialists($team, $locations, $serviceIds);

            $this->command?->info(sprintf(
                'Seeded "%s" — %d locations, %d services, %d specialists. Book at /appointments/%s (owner login %s / %s).',
                $team->name,
                $locations->count(),
                count($serviceIds),
                $specialistCount,
                $team->slug,
                self::OWNER_EMAIL,
                self::PASSWORD,
            ));
        });
    }

    /**
     * Remove any previously seeded FACE Studio team, owner and specialists so the
     * seeder can be run repeatedly from a clean slate.
     */
    private function purgeExisting(): void
    {
        $team = Team::withTrashed()->where('slug', self::TEAM_SLUG)->first();

        if ($team !== null) {
            $team->appointments()->delete();
            $team->customers()->delete();
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

            ServiceCategory::withTrashed()->where('team_id', $team->id)->forceDelete();

            $team->memberships()->delete();
            $team->forceDelete();
        }

        User::where('email', self::OWNER_EMAIL)
            ->orWhere('email', 'like', self::SPECIALIST_EMAIL_PREFIX.'%'.self::SPECIALIST_EMAIL_SUFFIX)
            ->get()
            ->each(function (User $user): void {
                $user->services()->detach();
                $user->locations()->detach();
                $user->profile()->delete();
                $user->forceDelete();
            });
    }

    /**
     * Mark the network's onboarding checklist complete so the dashboard opens
     * straight onto the running business rather than the setup guide.
     */
    private function markOnboardingComplete(Team $team, User $owner): void
    {
        OnboardingProgress::create([
            'team_id' => $team->id,
            'user_id' => $owner->id,
            'services_status' => OnboardingStepStatus::Completed,
            'profile_status' => OnboardingStepStatus::Completed,
            'schedule_status' => OnboardingStepStatus::Completed,
            'current_step' => OnboardingStep::Schedule,
            'completed_at' => now(),
        ]);
    }

    /**
     * Create every category and its services from the pricing page.
     *
     * @return list<int> the ids of every created service
     */
    private function createCatalogue(Team $team): array
    {
        $serviceIds = [];

        foreach (self::CATALOGUE as $group) {
            $category = $team->serviceCategories()->create([
                'name' => $group['name'],
            ]);

            foreach ($group['services'] as [$title, $rawPrice]) {
                $service = $team->services()->create([
                    'service_category_id' => $category->id,
                    'is_active' => true,
                    'title' => $title,
                    'currency' => Currency::Azn,
                    'duration' => $group['duration'],
                    'technical_break' => 0,
                    'service_type' => ServiceType::Individual,
                    'delivery_type' => DeliveryType::Onsite,
                    ...$this->parsePrice($rawPrice),
                ]);

                $serviceIds[] = $service->id;
            }
        }

        return $serviceIds;
    }

    /**
     * Create the 15 branches and offer every service at each one.
     *
     * @param  list<int>  $serviceIds
     * @return Collection<int, Location>
     */
    private function createLocations(Team $team, array $serviceIds): Collection
    {
        return collect(self::LOCATIONS)->map(function (array $branch) use ($team, $serviceIds): Location {
            $location = $team->locations()->create([
                'is_active' => true,
                'name' => $branch['name'],
                'country' => 'AZ',
                'city' => 'Bakı',
                'street_address' => $branch['street'],
                'postal_code' => 'AZ1000',
                'phone' => $branch['phone'],
            ]);

            $location->services()->sync($serviceIds);

            return $location;
        });
    }

    /**
     * Create two specialists per branch. Each is a team member who works at that
     * branch and provides every service.
     *
     * @param  Collection<int, Location>  $locations
     * @param  list<int>  $serviceIds
     * @return int the number of specialists created
     */
    private function createSpecialists(Team $team, Collection $locations, array $serviceIds): int
    {
        $number = 0;

        foreach ($locations as $location) {
            for ($i = 0; $i < self::SPECIALISTS_PER_LOCATION; $i++) {
                $number++;
                $email = self::SPECIALIST_EMAIL_PREFIX.$number.self::SPECIALIST_EMAIL_SUFFIX;

                $specialist = User::create([
                    'name' => sprintf('%s mütəxəssis %d', $location->name, $i + 1),
                    'email' => $email,
                    'password' => self::PASSWORD,
                ]);
                $specialist->forceFill(['email_verified_at' => now()])->save();

                $specialist->profile()->create([
                    'email' => $email,
                    'job_title' => 'Gözəllik mütəxəssisi',
                ]);

                $team->memberships()->create([
                    'user_id' => $specialist->id,
                    'role' => TeamRole::Member,
                ]);
                $specialist->switchTeam($team);

                $specialist->locations()->sync([$location->id]);
                $specialist->services()->sync($serviceIds);
            }
        }

        return $number;
    }

    /**
     * Turn a pricing-page price string into service price columns.
     *
     * Handles three shapes: a min–max range ("15 - 20"), a "from" price
     * ("45 başlayaraq") modelled as a fixed price at the starting figure, and a
     * plain fixed price ("30").
     *
     * @return array{price_type: PriceType, price: ?float, price_min: ?float, price_max: ?float}
     */
    private function parsePrice(string $raw): array
    {
        if (preg_match('/(\d+)\s*-\s*(\d+)/', $raw, $matches) === 1) {
            return [
                'price_type' => PriceType::Range,
                'price' => null,
                'price_min' => (float) $matches[1],
                'price_max' => (float) $matches[2],
            ];
        }

        preg_match('/\d+/', $raw, $matches);

        return [
            'price_type' => PriceType::Fixed,
            'price' => (float) ($matches[0] ?? 0),
            'price_min' => null,
            'price_max' => null,
        ];
    }
}
