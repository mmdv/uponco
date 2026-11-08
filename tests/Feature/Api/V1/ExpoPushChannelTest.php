<?php

use App\Enums\AppointmentAlert;
use App\Models\Appointment;
use App\Models\DevicePushToken;
use App\Notifications\Appointments\AppointmentActivity;
use App\Notifications\Channels\ExpoPushChannel;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

/**
 * An appointment assigned to the setup's owner, who is its specialist.
 *
 * @return array{0: array<string, mixed>, 1: Appointment}
 */
function expoPushAppointment(): array
{
    $setup = bookableSetup();

    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    return [$setup, $appointment];
}

test('the specialist\'s mobile devices get the appointment push', function () {
    Http::fake([ExpoPushChannel::SEND_URL => Http::response(['data' => [['status' => 'ok', 'id' => 'ticket-1']]])]);
    [$setup, $appointment] = expoPushAppointment();
    $device = DevicePushToken::factory()->for($setup['user'])->create();

    $setup['user']->notifyNow(new AppointmentActivity($appointment, AppointmentAlert::Booked, $setup['user']), [ExpoPushChannel::class]);

    Http::assertSent(fn (Request $request): bool => $request->url() === ExpoPushChannel::SEND_URL
        && $request[0]['to'] === $device->token
        && $request[0]['title'] === __('New booking — :service', ['service' => $appointment->service->title])
        && $request[0]['data']['appointment_id'] === $appointment->id
        && $request[0]['data']['alert'] === AppointmentAlert::Booked->value);
});

test('a device expo reports as unregistered is forgotten', function () {
    [$setup, $appointment] = expoPushAppointment();
    $gone = DevicePushToken::factory()->for($setup['user'])->create();
    $active = DevicePushToken::factory()->for($setup['user'])->create();
    Http::fake([ExpoPushChannel::SEND_URL => Http::response(['data' => [
        ['status' => 'error', 'message' => 'not registered', 'details' => ['error' => 'DeviceNotRegistered']],
        ['status' => 'ok', 'id' => 'ticket-2'],
    ]])]);

    $setup['user']->notifyNow(new AppointmentActivity($appointment, AppointmentAlert::Booked, $setup['user']), [ExpoPushChannel::class]);

    // Tickets come back in the order the tokens were sent (by id).
    expect(DevicePushToken::pluck('id')->all())->toBe([$active->id])
        ->and($gone->fresh())->toBeNull();
});

test('nothing is sent to expo when the user has no mobile devices', function () {
    Http::fake();
    [$setup, $appointment] = expoPushAppointment();

    $setup['user']->notifyNow(new AppointmentActivity($appointment, AppointmentAlert::Booked, $setup['user']), [ExpoPushChannel::class]);

    Http::assertNothingSent();
});

test('only the specialist the alert is about is pushed on mobile', function () {
    [$setup, $appointment] = expoPushAppointment();
    $notification = new AppointmentActivity($appointment, AppointmentAlert::Booked, $setup['user']);
    $manager = teamMemberSpecialist($setup);

    expect($notification->via($setup['user']))->toContain(ExpoPushChannel::class)
        ->and($notification->via($manager))->not->toContain(ExpoPushChannel::class);
});
