<?php

namespace App\Notifications\Appointments;

use App\Enums\AppointmentAlert;
use App\Models\Appointment;
use Carbon\CarbonInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

/**
 * Push notification telling a specialist that something happened to an
 * appointment assigned to them — it was booked, moved, or cancelled.
 *
 * Delivered only over Web Push: the specialist already sees the appointment in
 * the dashboard, so this exists purely to reach their phone while the app is
 * closed. It requires the staff member to have enabled notifications on at
 * least one device; users with no push subscription simply receive nothing.
 */
class SpecialistAppointmentAlert extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * `$startAt` overrides the appointment's own start time. It is used when
     * reassigning an appointment: the specialist losing it must be told about
     * the slot they had, not the one the new specialist is taking.
     */
    public function __construct(
        public Appointment $appointment,
        public AppointmentAlert $alert,
        public ?CarbonInterface $startAt = null,
    ) {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    /**
     * Build the push payload the service worker will display.
     */
    public function toWebPush(object $notifiable, Notification $notification): WebPushMessage
    {
        $appointment = $this->appointment;
        $team = $appointment->team;
        $timezone = $team->timezone ?: config('app.timezone');

        $start = ($this->startAt ?? $appointment->start_at)->setTimezone($timezone);

        $when = __(':date at :time', [
            'date' => $start->translatedFormat('D, j M'),
            'time' => $start->format('H:i'),
        ]);

        $service = $appointment->service?->title ?? __('Deleted service');
        $customer = $appointment->customer?->name ?? __('Deleted customer');

        [$title, $body] = match ($this->alert) {
            AppointmentAlert::Booked => [
                __('New booking — :service', ['service' => $service]),
                __(':customer · :when', ['customer' => $customer, 'when' => $when]),
            ],
            AppointmentAlert::Rescheduled => [
                __('Appointment moved — :service', ['service' => $service]),
                __(':customer · now :when', ['customer' => $customer, 'when' => $when]),
            ],
            AppointmentAlert::Cancelled => [
                __('Booking cancelled — :service', ['service' => $service]),
                __(':customer · was :when', ['customer' => $customer, 'when' => $when]),
            ],
        };

        return (new WebPushMessage)
            ->title($title)
            ->body($body)
            ->icon('/icons/icon-512.png')
            ->badge('/icons/icon-512.png')
            // Repeated alerts about the same appointment replace each other
            // rather than stacking up on the lock screen.
            ->tag('appointment-'.$appointment->id)
            ->data([
                'url' => route('appointments.index'),
                'appointment_id' => $appointment->id,
            ]);
    }
}
