<?php

namespace App\Notifications\Appointments;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentCancelled extends Notification implements ShouldQueue
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

        return (new MailMessage)
            ->from(self::FROM_ADDRESS, __(':team via Uponco', ['team' => $team->name]))
            ->subject(__('Appointment cancelled at :team — :when', ['team' => $team->name, 'when' => $when]))
            ->view('mail.appointments.cancelled', [
                'title' => __('Your appointment has been cancelled'),
                'intro' => __('Your appointment with :team has been cancelled. The details of the cancelled booking are below.', ['team' => $team->name]),
                'customerName' => $appointment->customer->name,
                'teamName' => $team->name,
                'teamLogoUrl' => $team->logoUrl(),
                'serviceTitle' => $appointment->service->title,
                'specialistName' => $appointment->specialist->name,
                'locationName' => $location?->name ?? __('Online'),
                'dateLine' => $start->translatedFormat('l, j F Y'),
                'timeLine' => __(':start–:end (:timezone)', [
                    'start' => $start->format('H:i'),
                    'end' => $end->format('H:i'),
                    'timezone' => $timezone,
                ]),
                'bookingUrl' => route('public.appointments.show', ['company' => $team->slug]),
            ]);
    }
}
