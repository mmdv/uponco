<?php

namespace App\Http\Requests\Company;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncMemberServicesRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $teamId = $this->user()->currentTeam->id;

        return [
            'ids' => ['array'],
            'ids.*' => [
                Rule::exists('services', 'id')->where(
                    fn (Builder $query): Builder => $query->where('team_id', $teamId),
                ),
            ],
        ];
    }

    /**
     * Get the selected service ids as integers.
     *
     * @return array<int, int>
     */
    public function ids(): array
    {
        return array_map('intval', $this->validated('ids', []));
    }
}
