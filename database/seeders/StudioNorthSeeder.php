<?php

namespace Database\Seeders;

use App\Enums\BusinessCategory;
use App\Enums\Currency;
use App\Models\Team;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

/**
 * Seeds "Studio North", the fictional barbershop behind the home page's
 * "See a live booking page" link and its phone screenshots.
 *
 * Safe to run in production: it only touches the studio-north team and its own
 * three people, and outside local/testing their passwords are random, so the
 * demo can be browsed and booked but never signed into.
 */
class StudioNorthSeeder extends ShowcaseSeeder
{
    use WithoutModelEvents;

    public const TEAM_SLUG = 'studio-north';

    public const OWNER_EMAIL = 'elias@studio-north.test';

    /**
     * Seed the Studio North demo barbershop.
     */
    public function run(): void
    {
        $team = $this->seedTeam([
            'slug' => self::TEAM_SLUG,
            'name' => 'Studio North',
            'category' => BusinessCategory::Barbershop,
            'color' => '#0063ff',
            'monogram' => 'SN',
            'timezone' => 'Europe/Amsterdam',
            'currency' => Currency::Eur,
            'owner' => [
                'name' => 'Elias Ward',
                'email' => self::OWNER_EMAIL,
                'job_title' => 'Owner & barber',
                'description' => 'Classic cuts and sharp fades for over ten years.',
            ],
            'members' => [
                [
                    'name' => 'Nora Kim',
                    'email' => 'nora@studio-north.test',
                    'job_title' => 'Senior barber',
                    'description' => 'Skin fades, textured crops and beard shaping.',
                ],
                [
                    'name' => 'Sami Haddad',
                    'email' => 'sami@studio-north.test',
                    'job_title' => 'Barber',
                    'description' => 'Relaxed cuts and hot-towel beard trims.',
                ],
            ],
            'locations' => [
                [
                    'name' => 'Studio North',
                    'city' => 'Amsterdam',
                    'street' => 'Noorderstraat 12',
                    'postal_code' => '1017 TV',
                    'country' => 'NL',
                ],
            ],
            'services' => [
                ['title' => 'Haircut', 'price' => 28, 'duration' => 30, 'description' => 'Wash, cut and style.'],
                ['title' => 'Skin fade', 'price' => 32, 'duration' => 45, 'description' => 'Fade down to the skin, finished by hand.'],
                ['title' => 'Beard trim', 'price' => 18, 'duration' => 20, 'description' => 'Shape-up with a hot towel.'],
                ['title' => 'Cut & beard', 'price' => 42, 'duration' => 60, 'description' => 'Haircut plus a full beard trim.'],
                ['title' => 'Kids cut', 'price' => 20, 'duration' => 30, 'description' => 'For under-12s.'],
            ],
            'hours' => ['start' => '09:00:00', 'end' => '18:00:00'],
        ]);

        $this->command?->info(sprintf(
            'Seeded "%s" — book at /appointments/%s.',
            $team->name,
            $team->slug,
        ));
    }

    /**
     * The seeded team, for the showcase seeder and tests.
     */
    public static function team(): ?Team
    {
        return Team::where('slug', self::TEAM_SLUG)->first();
    }
}
