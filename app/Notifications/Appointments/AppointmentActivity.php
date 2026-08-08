<?php

namespace App\Notifications\Appointments;

use App\Enums\AppointmentAlert;
use App\Models\Appointment;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

/**
 * Something happened to an appointment — it was booked, moved, or cancelled.
 *
 * Sent to the assigned specialist and to every owner/admin of the team, so it
 * reaches two audiences over two channels:
 *
 * - `database` for everyone, which is what fills the notification bell. One row
 *   per recipient, so each person's read state is their own.
 * - `webpush` for the assigned specialist only, reaching their phone while the
 *   app is closed. Managers are not buzzed about other people's bookings.
 */
class AppointmentActivity extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * `$forSpecialist` is the staff member the alert is *about*, which is not
     * always `$appointment->specialist`: when an appointment is handed to
     * someone else, the outgoing specialist gets a cancellation for a booking
     * whose `specialist_id` already points at their replacement.
     *
     * `$startAt` overrides the appointment's own start time for that same
     * reason — the specialist losing it must be told about the slot they had,
     * not the one the new specialist is taking.
     */
    public function __construct(
        public Appointment $appointment,
        public AppointmentAlert $alert,
        public User $forSpecialist,
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
        $channels = ['database'];

        if ($notifiable instanceof User && $notifiable->getKey() === $this->forSpecialist->getKey()) {
            $channels[] = WebPushChannel::class;
        }

        return $channels;
    }

    /**
     * The stored payload the notification bell and page render.
     *
     * Deliberately denormalised: a booking whose service or customer is deleted
     * later must still read sensibly, and the list must not fire a query per row.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $appointment = $this->appointment;

        return [
            'alert' => $this->alert->value,
            'appointment_id' => $appointment->id,
            'service_title' => $appointment->service?->title,
            'customer_name' => $appointment->customer?->name,
            'location_name' => $appointment->location?->name,
            'specialist_id' => $this->forSpecialist->getKey(),
            'specialist_name' => $this->forSpecialist->name,
            'start_at' => $this->startsAt()->toIso8601String(),
            'timezone' => $this->timezone(),
        ];
    }

    /**
     * Build the push payload the service worker will display.
     */
    public function toWebPush(object $notifiable, Notification $notification): WebPushMessage
    {
        $appointment = $this->appointment;

        $when = __(':date at :time', [
            'date' => $this->startsAt()->translatedFormat('D, j M'),
            'time' => $this->startsAt()->format('H:i'),
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
                'url' => route('notifications.index'),
                'appointment_id' => $appointment->id,
            ]);
    }

    /**
     * The slot this alert is about, in the team's timezone.
     */
    protected function startsAt(): CarbonInterface
    {
        return ($this->startAt ?? $this->appointment->start_at)->setTimezone($this->timezone());
    }

    /**
     * The team's timezone, falling back to the application default.
     */
    protected function timezone(): string
    {
        return $this->appointment->team->timezone ?: config('app.timezone');
    }
}
