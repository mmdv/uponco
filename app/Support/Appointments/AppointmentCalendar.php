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

        $meetingUrl = $appointment->meeting_url;
        $place = $appointment->location;

        // Calendar clients geocode LOCATION verbatim, so it must contain the
        // postal address and nothing else — a business name or unit number in
        // the string is what makes "Directions" land on the wrong pin.
        $location = $meetingUrl
            ?: ($place?->mappableAddress() ?? __('Online'));

        $description = (new Collection([
            $meetingUrl ? __('Join: :url', ['url' => $meetingUrl]) : null,
            __('Service: :service', ['service' => $appointment->service->title]),
            __('Specialist: :specialist', ['specialist' => $appointment->specialist->name]),
            // The name and unit still matter to the customer once they arrive,
            // so they move into the description rather than being dropped.
            $place && ! $meetingUrl ? __('Place: :name', ['name' => $place->name]) : null,
            $place && ! $meetingUrl && filled($place->unit)
                ? __('Unit: :unit', ['unit' => $place->unit])
                : null,
            $place && ! $meetingUrl && $place->directionsUrl()
                ? __('Directions: :url', ['url' => $place->directionsUrl()])
                : null,
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
        ];

        if ($meetingUrl) {
            $lines[] = 'URL:'.self::escape($meetingUrl);
        }

        // Coordinates take priority over the text address in every major
        // calendar client, so a geocoded location can never be mis-resolved.
        if (! $meetingUrl && $place?->isGeocoded()) {
            $lines[] = 'GEO:'.$place->latitude.';'.$place->longitude;
            $lines[] = 'X-APPLE-STRUCTURED-LOCATION;VALUE=URI;'
                .'X-ADDRESS='.self::escape((string) $place->mappableAddress()).';'
                .'X-APPLE-RADIUS=100;X-TITLE='.self::escape($place->name).':'
                .'geo:'.$place->latitude.','.$place->longitude;
        }

        $lines = array_merge($lines, [
            'STATUS:CONFIRMED',
            'END:VEVENT',
            'END:VCALENDAR',
        ]);

        return implode("\r\n", array_map(self::fold(...), $lines))."\r\n";
    }

    /**
     * Fold a content line to the 75-octet limit required by RFC 5545.
     *
     * Continuation lines are prefixed with a single space. Without this a long
     * value — a directions URL, say — is silently rejected by stricter
     * parsers such as Outlook.
     */
    protected static function fold(string $line): string
    {
        if (strlen($line) <= 75) {
            return $line;
        }

        $folded = substr($line, 0, 75);
        $rest = substr($line, 75);

        foreach (str_split($rest, 74) as $chunk) {
            $folded .= "\r\n ".$chunk;
        }

        return $folded;
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
