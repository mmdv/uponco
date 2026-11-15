<?php

namespace App\Mcp;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\User;
use App\Support\Appointments\AppointmentAccess;

/**
 * How appointments are shown to an assistant: times in the business timezone
 * (with the offset, so they can't be misread as UTC) and the names it needs
 * to talk about them.
 */
class AppointmentData
{
    /** Relations the summary reads, for eager loading. */
    public const RELATIONS = ['service:id,title', 'location:id,name', 'specialist:id,name', 'customer:id,name,email,phone'];

    /**
     * @return array{id: int, status: string, date: string, start: string, end: string, service: array{id: ?int, title: string}, specialist: array{id: ?int, name: string}, customer: ?array{id: ?int, name: string, email: ?string, phone: ?string}, location: ?array{id: int, name: string}, meeting_url: ?string, notes: ?string, booked_by: string}
     */
    public static function summary(Appointment $appointment, string $timezone): array
    {
        $start = $appointment->start_at->copy()->setTimezone($timezone);

        return [
            'id' => $appointment->id,
            'status' => $appointment->status->value,
            'date' => $start->toDateString(),
            'start' => $start->toIso8601String(),
            'end' => $appointment->end_at->copy()->setTimezone($timezone)->toIso8601String(),
            'service' => [
                'id' => $appointment->service_id,
                'title' => $appointment->service?->title ?? __('Deleted service'),
            ],
            'specialist' => [
                'id' => $appointment->specialist_id,
                'name' => $appointment->specialistDisplayName(),
            ],
            // A note-only appointment has no customer.
            'customer' => $appointment->customer_id === null ? null : [
                'id' => $appointment->customer_id,
                'name' => $appointment->customer?->name ?? __('Deleted customer'),
                'email' => $appointment->customer?->email,
                'phone' => $appointment->customer?->phone,
            ],
            'location' => $appointment->location ? [
                'id' => $appointment->location->id,
                'name' => $appointment->location->name,
            ] : null,
            'meeting_url' => $appointment->meeting_url,
            'notes' => $appointment->notes,
            // `public`: the customer booked it on the booking page; `staff`: someone in the business did.
            'booked_by' => $appointment->source->value,
        ];
    }

    /**
     * The summary plus the extra details and what the user may do with it —
     * the same rules as the calendar ({@see AppointmentAccess}).
     *
     * @return array<string, mixed>
     */
    public static function detail(User $user, Appointment $appointment, string $timezone): array
    {
        $isOpen = ! $appointment->isCancelled();

        return [
            ...self::summary($appointment, $timezone),
            'delivery_type' => $appointment->delivery_type?->value,
            'customer_comment' => $appointment->client_comment,
            'cancelled_at' => $appointment->cancelled_at?->copy()->setTimezone($timezone)->toIso8601String(),
            'can' => [
                'reschedule' => AppointmentAccess::canChangeUpcoming($user, $appointment) && $isOpen && $appointment->specialist_id !== null,
                'cancel' => AppointmentAccess::canChangeUpcoming($user, $appointment) && $isOpen,
                'mark_no_show' => AppointmentAccess::canChangePast($user, $appointment) && $appointment->status === AppointmentStatus::Booked,
                'undo_no_show' => AppointmentAccess::canChangePast($user, $appointment) && $appointment->status === AppointmentStatus::NoShow,
            ],
        ];
    }
}
