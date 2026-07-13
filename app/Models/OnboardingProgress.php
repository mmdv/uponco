<?php

namespace App\Models;

use App\Enums\OnboardingStep;
use App\Enums\OnboardingStepStatus;
use Database\Factories\OnboardingProgressFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OnboardingProgress extends Model
{
    /** @use HasFactory<OnboardingProgressFactory> */
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'onboarding_progress';

    /**
     * The model's default attribute values.
     *
     * @var array<string, string>
     */
    protected $attributes = [
        'locations_status' => OnboardingStepStatus::Pending->value,
        'services_status' => OnboardingStepStatus::Pending->value,
        'profile_status' => OnboardingStepStatus::Pending->value,
        'schedule_status' => OnboardingStepStatus::Pending->value,
        'current_step' => OnboardingStep::Locations->value,
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'team_id',
        'user_id',
        'locations_status',
        'services_status',
        'profile_status',
        'schedule_status',
        'current_step',
        'completed_at',
    ];

    /**
     * Get the team this progress belongs to.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the user this progress belongs to.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the stored status for the given step.
     */
    public function statusFor(OnboardingStep $step): OnboardingStepStatus
    {
        return $this->{$step->column()};
    }

    /**
     * Persist a status for the given step.
     */
    public function markStep(OnboardingStep $step, OnboardingStepStatus $status): void
    {
        $this->{$step->column()} = $status;
    }

    /**
     * Auto-complete any pending step whose underlying data already exists.
     *
     * Steps that the user has explicitly resolved (completed or skipped) are
     * left untouched so a deliberate skip is never overridden.
     */
    public function syncFromData(Team $team, User $user): void
    {
        foreach (OnboardingStep::cases() as $step) {
            if ($this->statusFor($step)->isResolved()) {
                continue;
            }

            if ($this->hasDataForStep($step, $team, $user)) {
                $this->markStep($step, OnboardingStepStatus::Completed);
            }
        }
    }

    /**
     * Refresh the overall completion timestamp based on the current statuses.
     */
    public function refreshCompletion(): void
    {
        $this->completed_at = $this->isComplete() ? ($this->completed_at ?? now()) : null;
    }

    /**
     * Determine if every step has been resolved and mandatory steps completed.
     */
    public function isComplete(): bool
    {
        foreach (OnboardingStep::cases() as $step) {
            $status = $this->statusFor($step);

            if (! $status->isResolved()) {
                return false;
            }

            if ($step->isMandatory() && $status !== OnboardingStepStatus::Completed) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get the first step that has not yet been resolved, defaulting to the last step.
     */
    public function firstUnresolvedStep(): OnboardingStep
    {
        foreach (OnboardingStep::cases() as $step) {
            if (! $this->statusFor($step)->isResolved()) {
                return $step;
            }
        }

        return OnboardingStep::Schedule;
    }

    /**
     * Determine if the underlying data for a step is already present.
     */
    public function hasDataForStep(OnboardingStep $step, Team $team, User $user): bool
    {
        return match ($step) {
            OnboardingStep::Locations => $team->locations()->exists(),
            OnboardingStep::Services => $team->services()->exists(),
            OnboardingStep::Profile => filled($user->profile?->job_title),
            OnboardingStep::Schedule => ScheduleSlot::where('team_id', $team->id)->exists(),
        };
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'current_step' => OnboardingStep::class,
            'completed_at' => 'datetime',
            'locations_status' => OnboardingStepStatus::class,
            'services_status' => OnboardingStepStatus::class,
            'profile_status' => OnboardingStepStatus::class,
            'schedule_status' => OnboardingStepStatus::class,
        ];
    }
}
