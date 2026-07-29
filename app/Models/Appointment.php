<?php

namespace App\Models;

use App\Enums\AppointmentStatus;
use App\Enums\DeliveryType;
use Database\Factories\AppointmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'team_id',
    'service_id',
    'location_id',
    'specialist_id',
    'customer_id',
    'start_at',
    'end_at',
    'status',
    'cancelled_at',
    'delivery_type',
    'online_meeting_provider',
    'meeting_url',
    'google_calendar_event_id',
    'client_comment',
    'notes',
])]
class Appointment extends Model
{
    /** @use HasFactory<AppointmentFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the team that owns the appointment.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the booked service.
     *
     * Services are soft-deleted rather than removed, so an appointment can always
     * resolve the service it was booked for even after it has been "deleted".
     *
     * @return BelongsTo<Service, $this>
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class)->withTrashed();
    }

    /**
     * Get the location (branch) where the appointment takes place.
     *
     * Locations are soft-deleted, so historical appointments keep resolving their
     * original branch even after it has been removed.
     *
     * @return BelongsTo<Location, $this>
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class)->withTrashed();
    }

    /**
     * Get the specialist providing the service.
     *
     * @return BelongsTo<User, $this>
     */
    public function specialist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'specialist_id');
    }

    /**
     * Get the customer the appointment is for.
     *
     * Customers are soft-deleted, so an appointment always resolves the customer
     * it belongs to even after they have been removed.
     *
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class)->withTrashed();
    }

    /**
     * Determine whether the appointment has already started.
     *
     * Past appointments are read-only: they can be previewed but not edited,
     * rescheduled or deleted. This mirrors the upcoming/past split in the UI,
     * which buckets appointments by their start time.
     */
    public function isPast(): bool
    {
        return $this->start_at->isPast();
    }

    /**
     * Determine whether the appointment has been cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === AppointmentStatus::Cancelled;
    }

    /**
     * Cancel the appointment.
     *
     * Cancelled appointments are kept rather than deleted so they can be counted
     * for reporting, but the status change removes them from availability and
     * every booking total.
     */
    public function cancel(): void
    {
        $this->update([
            'status' => AppointmentStatus::Cancelled,
            'cancelled_at' => now(),
        ]);
    }

    /**
     * Scope the query to booked (non-cancelled) appointments.
     *
     * Every place that treats an appointment as occupying the specialist's time
     * or as a real booking must use this scope so cancelled appointments free
     * their slot and stop counting. Reporting queries deliberately omit it.
     *
     * @param  Builder<Appointment>  $query
     */
    public function scopeBooked(Builder $query): void
    {
        $query->where('status', AppointmentStatus::Booked);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'status' => AppointmentStatus::class,
            'delivery_type' => DeliveryType::class,
        ];
    }
}
