<?php

namespace App\Http\Requests\Teams;

use App\Enums\BusinessCategory;
use App\Enums\TeamType;
use App\Rules\TeamName;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OnboardTeamRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $team = $this->user()?->currentTeam;

        return $team !== null && $this->user()->can('update', $team);
    }

    /**
     * Drop the free-text category unless "other" was picked, so switching to a
     * listed category does not leave the previous text behind on the team.
     */
    protected function prepareForValidation(): void
    {
        if ($this->input('business_category') !== BusinessCategory::Other->value) {
            $this->merge(['business_category_other' => null]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        $teamId = $this->user()?->currentTeam?->id;

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('teams', 'name')->ignore($teamId), new TeamName],
            'type' => ['required', 'string', Rule::in(TeamType::values())],
            'business_category' => ['required', 'string', Rule::in(BusinessCategory::values())],
            'business_category_other' => ['nullable', 'required_if:business_category,'.BusinessCategory::Other->value, 'string', 'max:100'],
            'timezone' => ['required', 'string', Rule::in(timezone_identifiers_list())],
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'company name',
            'business_category' => 'category',
            'business_category_other' => 'category',
        ];
    }
}
