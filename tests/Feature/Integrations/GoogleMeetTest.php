<?php

use App\Models\Appointment;
use App\Models\Customer;
use App\Models\ScheduleSlot;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use App\Notifications\Appointments\AppointmentBooked;
use App\Support\Appointments\AppointmentCalendar;
use App\Support\ServiceOptions;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;

/**
 * Build an online, google_meet service with a specialist and work hours, plus a
 * future start instant. The specialist can optionally have Google connected.
 */
function onlineBookableSetup(bool $googleConnected = true): array
{
    $user = User::factory()->create();

    if ($googleConnected) {
        $user->update([
            'google_account_email' => 'specialist@gmail.com',
            'google_access_token' => 'access-token',
            'google_refresh_token' => 'refresh-token',
            'google_token_expires_at' => now()->addHour(),
        ]);
    }

    $team = $user->currentTeam;
    $team->update(['timezone' => 'UTC']);

    $category = ServiceCategory::factory()->for($team)->create();
    $service = Service::factory()->for($category, 'category')->create([
        'duration' => 60,
        'technical_break' => 0,
        'service_type' => 'individual',
        'capacity' => null,
        'delivery_type' => 'online',
        'online_meeting_provider' => 'google_meet',
        'is_active' => true,
    ]);

    $service->specialists()->attach($user);

    $startAt = CarbonImmutable::now('UTC')->addWeek()->startOfWeek()->setTime(9, 0);

    ScheduleSlot::factory()->for($user)->create([
        'team_id' => $team->id,
        'date' => $startAt->format('Y-m-d'),
        'start_time' => '09:00',
        'end_time' => '17:00',
    ]);

    return compact('user', 'team', 'service', 'startAt');
}

/**
 * Fake the Google Socialite driver so the callback receives a user with the
 * given approved scopes (calendar access granted by default).
 *
 * @param  array<int, string>  $approvedScopes
 */
function fakeGoogleUser(array $approvedScopes = ['openid', 'email', 'https://www.googleapis.com/auth/calendar.events']): void
{
    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getEmail')->andReturn('me@gmail.com');
    $socialiteUser->token = 'the-access-token';
    $socialiteUser->refreshToken = 'the-refresh-token';
    $socialiteUser->expiresIn = 3600;
    $socialiteUser->approvedScopes = $approvedScopes;

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->andReturn($socialiteUser);
    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
}

function onlineBookingPayload(array $setup): array
{
    return [
        'service_id' => $setup['service']->id,
        'location_id' => null,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt']->toIso8601String(),
        'customer_name' => 'Jane Doe',
        'customer_email' => 'jane@example.com',
        'customer_phone' => null,
        'notes' => 'First visit',
    ];
}

test('google meet and custom are the available online meeting providers', function () {
    expect(ServiceOptions::meetingProviderKeys())->toBe(['google_meet', 'custom']);
    expect(ServiceOptions::meetingProviders())->toBe([
        ['value' => 'google_meet', 'label' => 'Google Meet'],
        ['value' => 'custom', 'label' => 'Custom'],
    ]);
});

test('a service can no longer be created with a removed provider', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = ServiceCategory::factory()->for($team)->create();

    $this
        ->actingAs($user)
        ->post(route('company.services.store', ['current_team' => $team->slug]), [
            'title' => 'Consultation',
            'service_category_id' => $category->id,
            'price_type' => 'fixed',
            'price' => 50,
            'duration' => 60,
            'technical_break' => 0,
            'service_type' => 'individual',
            'delivery_type' => 'online',
            'online_meeting_provider' => 'zoom',
            'is_active' => true,
            'user_ids' => [$user->id],
        ])
        ->assertSessionHasErrors('online_meeting_provider');
});

test('a user can connect their google account', function () {
    $user = User::factory()->create();

    fakeGoogleUser();

    $this
        ->actingAs($user)
        ->get(route('integrations.google.callback'))
        ->assertRedirect(route('integrations.edit'));

    $user->refresh();

    expect($user->google_account_email)->toBe('me@gmail.com');
    expect($user->google_access_token)->toBe('the-access-token');
    expect($user->google_refresh_token)->toBe('the-refresh-token');
    expect($user->hasGoogleConnected())->toBeTrue();

    // Tokens are stored encrypted at rest.
    $raw = $this->getConnection()->table('users')->where('id', $user->id)->value('google_access_token');
    expect($raw)->not->toBe('the-access-token');
});

test('connecting is refused when calendar access is not granted', function () {
    $user = User::factory()->create();

    // The user unticked the calendar permission on the consent screen.
    fakeGoogleUser(approvedScopes: ['openid', 'email']);

    $this
        ->actingAs($user)
        ->get(route('integrations.google.callback'))
        ->assertRedirect(route('integrations.edit'));

    expect($user->refresh()->hasGoogleConnected())->toBeFalse();
});

test('a cancelled google authorization does not connect the account', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->get(route('integrations.google.callback', ['error' => 'access_denied']))
        ->assertRedirect(route('integrations.edit'));

    expect($user->refresh()->hasGoogleConnected())->toBeFalse();
});

test('a user can disconnect their google account', function () {
    $user = User::factory()->create([
        'google_account_email' => 'me@gmail.com',
        'google_access_token' => 'access',
        'google_refresh_token' => 'refresh',
        'google_token_expires_at' => now()->addHour(),
    ]);

    $this
        ->actingAs($user)
        ->delete(route('integrations.google.disconnect'))
        ->assertRedirect(route('integrations.edit'));

    $user->refresh();
    expect($user->hasGoogleConnected())->toBeFalse();
    expect($user->google_account_email)->toBeNull();
});

test('booking an online appointment generates a google meet link', function () {
    Notification::fake();

    Http::fake([
        'oauth2.googleapis.com/token' => Http::response(['access_token' => 'fresh', 'expires_in' => 3600]),
        'www.googleapis.com/calendar/v3/*' => Http::response([
            'id' => 'evt_123',
            'hangoutLink' => 'https://meet.google.com/abc-defg-hij',
        ]),
    ]);

    $setup = onlineBookableSetup();

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store', ['current_team' => $setup['team']->slug]), onlineBookingPayload($setup))
        ->assertRedirect();

    $this->assertDatabaseHas('appointments', [
        'service_id' => $setup['service']->id,
        'meeting_url' => 'https://meet.google.com/abc-defg-hij',
        'google_calendar_event_id' => 'evt_123',
    ]);

    Http::assertSent(fn ($request) => str_contains($request->url(), 'conferenceDataVersion=1'));
});

test('booking succeeds without a link when the specialist has not connected google', function () {
    Notification::fake();
    Http::fake();

    $setup = onlineBookableSetup(googleConnected: false);

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store', ['current_team' => $setup['team']->slug]), onlineBookingPayload($setup))
        ->assertRedirect();

    $appointment = Appointment::first();
    expect($appointment->meeting_url)->toBeNull();

    // No Google API calls are made for an unconnected specialist.
    Http::assertNothingSent();
});

test('the confirmation email and calendar invite include the meet link', function () {
    $setup = onlineBookableSetup();
    $customer = Customer::factory()->for($setup['team'])->create([
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
    ]);

    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => null,
        'specialist_id' => $setup['user']->id,
        'customer_id' => $customer->id,
        'delivery_type' => 'online',
        'online_meeting_provider' => 'google_meet',
        'meeting_url' => 'https://meet.google.com/abc-defg-hij',
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    $mail = (new AppointmentBooked($appointment))->toMail($customer);

    expect((string) $mail->render())
        ->toContain('Join online meeting')
        ->toContain('https://meet.google.com/abc-defg-hij');

    expect(AppointmentCalendar::ics($appointment))
        ->toContain('URL:https://meet.google.com/abc-defg-hij')
        ->toContain('LOCATION:https://meet.google.com/abc-defg-hij');
});
