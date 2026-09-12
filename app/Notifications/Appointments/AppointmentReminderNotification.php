<?php

namespace App\Notifications\Appointments;

use App\Enums\ReminderOffset;
use App\Jobs\SendAppointmentReminder;
use App\Models\Appointment;
use App\Support\Appointments\AppointmentCalendar;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

/**
 * Reminds the customer that their appointment is coming up.
 *
 * Sent by the scheduled {@see SendAppointmentReminder} job at the lead
 * time the customer chose, reusing the same branded template as the booking
 * confirmation so the reminder looks like part of the same conversation.
 */
class AppointmentReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The dedicated sender for appointment emails.
     */
    protected const FROM_ADDRESS = 'appointment@uponco.com';

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Appointment $appointment,
        public ?ReminderOffset $offset = null,
    ) {
        // Reminders are queued and fire outside any web request, so the locale
        // is pinned to the team's default rather than left to the app default.
        $this->locale($appointment->team->defaultLocale());
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $appointment = $this->appointment;
        $team = $appointment->team;
        $timezone = $team->timezone ?: config('app.timezone');

        $start = $appointment->start_at->setTimezone($timezone);
        $end = $appointment->end_at->setTimezone($timezone);

        $location = $appointment->location;

        $when = __(':date, :time', [
            'date' => $start->translatedFormat('D, j M Y'),
            'time' => $start->format('H:i'),
        ]);

        $leadTime = $this->leadTime();

        return (new MailMessage)
            ->from(self::FROM_ADDRESS, __(':team via Uponco', ['team' => $team->name]))
            ->subject(__('Reminder: appointment at :team — :when', ['team' => $team->name, 'when' => $when]))
            ->view('mail.appointments.reminder', [
                'title' => __('Your appointment is coming up'),
                'intro' => __('This is a friendly reminder that you have an appointment with :team in :time.', [
                    'team' => $team->name,
                    'time' => $leadTime,
                ]),
                'customerName' => $appointment->customer->name,
                'teamName' => $team->name,
                'teamLogoUrl' => $team->logoUrl(),
                'serviceTitle' => $appointment->service->title,
                'specialistName' => $appointment->specialistDisplayName(),
                'locationName' => $location?->name ?? __('Online'),
                'locationAddress' => $location?->mappableAddress(),
                'locationUnit' => $location?->unit,
                'locationPhone' => $location?->phone,
                'directionsUrl' => $appointment->meeting_url ? null : $location?->directionsUrl(),
                'dateLine' => $start->translatedFormat('l, j F Y'),
                'timeLine' => __(':start–:end (:timezone)', [
                    'start' => $start->format('H:i'),
                    'end' => $end->format('H:i'),
                    'timezone' => $timezone,
                ]),
                'notes' => $appointment->notes,
                'meetingUrl' => $appointment->meeting_url,
                // Signed link that lets the customer cancel this booking without
                // signing in. The controller still enforces that a past
                // appointment can't be cancelled, so the link never expires.
                'cancelUrl' => URL::signedRoute('public.appointments.cancel', ['appointment' => $appointment->id]),
            ])
            ->attachData(
                AppointmentCalendar::ics($appointment),
                'appointment.ics',
                ['mime' => 'text/calendar; charset=utf-8; method=PUBLISH'],
            );
    }

    /**
     * The human-readable lead time shown in the reminder copy.
     *
     * Uses the chosen offset when it is a known value, otherwise falls back to
     * the actual time remaining until the appointment starts.
     */
    protected function leadTime(): string
    {
        if ($this->offset instanceof ReminderOffset) {
            return $this->offset->forHumans();
        }

        return CarbonImmutable::now()->diffForHumans(
            $this->appointment->start_at,
            ['syntax' => CarbonInterface::DIFF_ABSOLUTE, 'parts' => 1],
        );
    }
}
