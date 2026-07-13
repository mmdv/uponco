<?php

namespace App\Http\Requests\Company;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncMemberLocationsRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'ids' => ['array'],
            'ids.*' => [
                Rule::exists('locations', 'id')->where(
                    fn (Builder $query): Builder => $query->where('team_id', $this->user()->currentTeam->id),
                ),
            ],
        ];
    }

    /**
     * Get the selected location ids as integers.
     *
     * @return array<int, int>
     */
    public function ids(): array
    {
        return array_map('intval', $this->validated('ids', []));
    }
}
