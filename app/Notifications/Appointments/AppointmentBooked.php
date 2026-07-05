<?php

namespace App\Notifications\Appointments;

use App\Enums\AppointmentChange;
use App\Models\Appointment;
use App\Support\Appointments\AppointmentCalendar;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentBooked extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The dedicated sender for appointment emails.
     */
    protected const FROM_ADDRESS = 'appointment@uponco.com';

    /**
     * Create a new notification instance.
     *
     * The wording adapts to whether the appointment was just created or an
     * existing one was updated, so the customer always knows what happened.
     */
    public function __construct(
        public Appointment $appointment,
        public AppointmentChange $change = AppointmentChange::Created,
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

        $isUpdate = $this->change === AppointmentChange::Updated;

        $when = __(':date, :time', [
            'date' => $start->translatedFormat('D, j M Y'),
            'time' => $start->format('H:i'),
        ]);

        $subject = $isUpdate
            ? __('Appointment updated at :team — :when', ['team' => $team->name, 'when' => $when])
            : __('Appointment confirmed at :team — :when', ['team' => $team->name, 'when' => $when]);

        $intro = $isUpdate
            ? __('The details of your appointment with :team have changed. Please review the updated information below.', ['team' => $team->name])
            : __('Thank you for booking with :team. Your appointment has been confirmed — you will find the details below.', ['team' => $team->name]);

        return (new MailMessage)
            ->from(self::FROM_ADDRESS, __(':team via Uponco', ['team' => $team->name]))
            ->subject($subject)
            ->view('mail.appointments.booked', [
                'title' => $isUpdate
                    ? __('Your appointment has been updated')
                    : __('Your appointment is confirmed'),
                'intro' => $intro,
                'customerName' => $appointment->customer->name,
                'teamName' => $team->name,
                'teamLogoUrl' => $team->logoUrl(),
                'serviceTitle' => $appointment->service->title,
                'specialistName' => $appointment->specialist->name,
                'locationName' => $location?->name ?? __('Online'),
                'locationAddress' => $location?->fullAddress(),
                'locationPhone' => $location?->phone,
                'dateLine' => $start->translatedFormat('l, j F Y'),
                'timeLine' => __(':start–:end (:timezone)', [
                    'start' => $start->format('H:i'),
                    'end' => $end->format('H:i'),
                    'timezone' => $timezone,
                ]),
                'notes' => $appointment->notes,
            ])
            ->attachData(
                AppointmentCalendar::ics($appointment),
                'appointment.ics',
                ['mime' => 'text/calendar; charset=utf-8; method=PUBLISH'],
            );
    }
}
