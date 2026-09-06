<?php

namespace App\Models;

use App\Enums\ReminderChannel;
use App\Enums\ReminderOffset;
use App\Enums\ReminderStatus;
use App\Jobs\SendAppointmentReminder;
use Database\Factories\AppointmentReminderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A scheduled reminder for an appointment.
 *
 * One row is the "schedule" behind a customer's reminder choice: which channel
 * to reach them on, how far ahead of the visit, and when that lands (`send_at`).
 * A delayed {@see SendAppointmentReminder} fires it, and the row's
 * status is the audit trail of what happened.
 */
#[Fillable([
    'appointment_id',
    'channel',
    'offset_minutes',
    'send_at',
    'status',
    'sent_at',
])]
class AppointmentReminder extends Model
{
    /** @use HasFactory<AppointmentReminderFactory> */
    use HasFactory;

    /**
     * Get the appointment this reminder belongs to.
     *
     * @return BelongsTo<Appointment, $this>
     */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    /**
     * Scope the query to reminders still waiting to be sent.
     *
     * @param  Builder<AppointmentReminder>  $query
     */
    public function scopePending(Builder $query): void
    {
        $query->where('status', ReminderStatus::Pending);
    }

    /**
     * Scope the query to pending reminders whose send time has arrived.
     *
     * @param  Builder<AppointmentReminder>  $query
     */
    public function scopeDue(Builder $query): void
    {
        $query->pending()->where('send_at', '<=', now());
    }

    /**
     * Get the reminder lead time as its enum, when it maps to a known offset.
     */
    public function offset(): ?ReminderOffset
    {
        return ReminderOffset::tryFrom($this->offset_minutes);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'channel' => ReminderChannel::class,
            'status' => ReminderStatus::class,
            'offset_minutes' => 'integer',
            'send_at' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }
}
