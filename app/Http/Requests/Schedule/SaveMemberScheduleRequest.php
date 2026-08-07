<?php

namespace App\Http\Requests\Schedule;

use App\Enums\TeamRole;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class SaveMemberScheduleRequest extends FormRequest
{
    /**
     * Everyone may edit their own schedule; managers may edit any member of the
     * current team.
     */
    public function authorize(): bool
    {
        /** @var User $actor */
        $actor = $this->user();
        $team = $actor->currentTeam;
        $member = $this->targetMember();

        if ($team === null || $member === null) {
            return false;
        }

        if ($actor->is($member)) {
            return true;
        }

        return ($actor->teamRole($team)?->isAtLeast(TeamRole::Admin) ?? false)
            && $member->belongsToTeam($team);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Each day carries its own blocks so a whole week — or several weeks, when
     * repeating a pattern forward — is saved in a single request. An empty
     * `slots` array is meaningful: it clears the day (a day off).
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'days' => ['required', 'array', 'min:1'],
            'days.*.date' => ['required', 'date_format:Y-m-d'],
            'days.*.slots' => ['present', 'array'],
            'days.*.slots.*.start' => ['required', 'date_format:H:i'],
            'days.*.slots.*.end' => ['required', 'date_format:H:i'],
        ];
    }

    /**
     * Reject blocks that end before they start, and blocks that overlap another
     * block on the same day.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            /** @var array<int, array{slots?: array<int, array{start?: string, end?: string}>}> $days */
            $days = $this->input('days', []);

            foreach ($days as $dayIndex => $day) {
                $slots = data_get($day, 'slots', []);

                if (! is_array($slots)) {
                    continue;
                }

                foreach ($slots as $index => $slot) {
                    $start = data_get($slot, 'start');
                    $end = data_get($slot, 'end');

                    if (! is_string($start) || ! is_string($end)) {
                        continue;
                    }

                    if ($end <= $start) {
                        $validator->errors()->add(
                            "days.{$dayIndex}.slots.{$index}.end",
                            __('The end time must be after the start time.')
                        );

                        continue;
                    }

                    if ($this->overlapsEarlierSlot($slots, $index, $start, $end)) {
                        $validator->errors()->add(
                            "days.{$dayIndex}.slots.{$index}.start",
                            __('Time blocks on the same day cannot overlap.')
                        );
                    }
                }
            }
        });
    }

    /**
     * The member whose schedule is being saved, or null when the route
     * parameter does not resolve to a user.
     */
    public function targetMember(): ?User
    {
        $member = $this->route('user');

        return $member instanceof User ? $member : null;
    }

    /**
     * Whether the block at `$index` overlaps any block before it in the list.
     *
     * Only earlier blocks are compared so an overlapping pair reports one error
     * rather than two.
     *
     * @param  array<int, array{start?: string, end?: string}>  $slots
     */
    protected function overlapsEarlierSlot(array $slots, int $index, string $start, string $end): bool
    {
        foreach (array_slice($slots, 0, $index) as $other) {
            $otherStart = data_get($other, 'start');
            $otherEnd = data_get($other, 'end');

            if (! is_string($otherStart) || ! is_string($otherEnd)) {
                continue;
            }

            if ($start < $otherEnd && $otherStart < $end) {
                return true;
            }
        }

        return false;
    }
}
