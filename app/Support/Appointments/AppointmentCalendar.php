<?php

namespace App\Support\Appointments;

use App\Models\Appointment;
use Illuminate\Support\Collection;

/**
 * Builds an RFC 5545 iCalendar (.ics) document for an appointment so it can be
 * attached to the confirmation email and recognised by Apple Calendar, Google
 * Calendar, Outlook and other clients.
 */
class AppointmentCalendar
{
    /**
     * Render the appointment as an iCalendar document.
     */
    public static function ics(Appointment $appointment): string
    {
        $team = $appointment->team;

        $location = $appointment->location
            ? (new Collection([$appointment->location->name, $appointment->location->fullAddress()]))->filter()->implode(', ')
            : __('Online');

        $description = (new Collection([
            __('Service: :service', ['service' => $appointment->service->title]),
            __('Specialist: :specialist', ['specialist' => $appointment->specialist->name]),
            $appointment->notes,
        ]))->filter()->implode("\n");

        $lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Uponco//Appointments//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            'UID:'.self::uid($appointment),
            'DTSTAMP:'.now()->utc()->format('Ymd\THis\Z'),
            'DTSTART:'.$appointment->start_at->copy()->utc()->format('Ymd\THis\Z'),
            'DTEND:'.$appointment->end_at->copy()->utc()->format('Ymd\THis\Z'),
            'SUMMARY:'.self::escape($appointment->service->title.' · '.$team->name),
            'DESCRIPTION:'.self::escape($description),
            'LOCATION:'.self::escape($location),
            'STATUS:CONFIRMED',
            'END:VEVENT',
            'END:VCALENDAR',
        ];

        return implode("\r\n", $lines)."\r\n";
    }

    /**
     * A globally unique identifier for the event.
     */
    protected static function uid(Appointment $appointment): string
    {
        $host = parse_url((string) config('app.url'), PHP_URL_HOST) ?: 'uponco';

        return $appointment->getKey().'@'.$host;
    }

    /**
     * Escape a value for use inside an iCalendar text property per RFC 5545.
     */
    protected static function escape(string $value): string
    {
        return str_replace(
            ['\\', ';', ',', "\r\n", "\n"],
            ['\\\\', '\\;', '\\,', '\\n', '\\n'],
            $value,
        );
    }
}
