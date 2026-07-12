<?php

namespace App\Http\Requests\Schedule;

use App\Enums\TeamRole;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class SaveScheduleRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * Managers may target any team member; plain members may only target
     * themselves. Constraining `user_id` to the allowed set enforces both
     * team membership and the self-only rule in one place.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'assignments' => ['required', 'array', 'min:1'],
            'assignments.*.user_id' => ['required', 'integer', Rule::in($this->assignableMemberIds())],
            'assignments.*.date' => ['required', 'date_format:Y-m-d'],
            'slots' => ['required', 'array', 'min:1'],
            'slots.*.start' => ['required', 'date_format:H:i'],
            'slots.*.end' => ['required', 'date_format:H:i'],
        ];
    }

    /**
     * Reject any slot whose end time is not strictly after its start time.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            /** @var array<int, array{start?: string, end?: string}> $slots */
            $slots = $this->input('slots', []);

            foreach ($slots as $index => $slot) {
                $start = data_get($slot, 'start');
                $end = data_get($slot, 'end');

                if (is_string($start) && is_string($end) && $end <= $start) {
                    $validator->errors()->add(
                        "slots.{$index}.end",
                        __('The end time must be after the start time.')
                    );
                }
            }
        });
    }

    /**
     * The user ids the requester is allowed to schedule for.
     *
     * @return array<int, int>
     */
    protected function assignableMemberIds(): array
    {
        /** @var User $user */
        $user = $this->user();
        $team = $user->currentTeam;

        $isManager = $user->teamRole($team)?->isAtLeast(TeamRole::Admin) ?? false;

        if (! $isManager) {
            return [$user->id];
        }

        return $team->members()->pluck('users.id')->all();
    }
}
