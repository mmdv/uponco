<?php

namespace App\Http\Requests\Locations;

use App\Support\LocationOptions;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveLocationRequest extends FormRequest
{
    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => $this->boolean('is_active'),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'is_active' => ['required', 'boolean'],
            'name' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', Rule::in(LocationOptions::countryCodes())],
            'city' => ['required', 'string', 'max:255'],
            'street_address' => ['required', 'string', 'max:255'],
            'unit' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:32'],
            'phone' => ['nullable', 'string', 'max:32'],
            // Populated when the operator picks an address from autocomplete.
            // Nullable so a location can still be saved by hand if Google has
            // no record of the address, or the integration is unconfigured.
            'place_id' => ['nullable', 'string', 'max:255'],
            'formatted_address' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90', 'required_with:longitude'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180', 'required_with:latitude'],
            'service_ids' => ['array'],
            'service_ids.*' => [
                Rule::in($this->user()->currentTeam->services()->pluck('services.id')->all()),
            ],
            'user_ids' => ['array'],
            'user_ids.*' => [
                Rule::exists('team_members', 'user_id')->where(
                    fn ($query) => $query->where('team_id', $this->user()->currentTeam->id),
                ),
            ],
        ];
    }

    /**
     * Get the validated location attributes without relationship ids.
     *
     * @return array<string, mixed>
     */
    public function locationData(): array
    {
        $data = $this->validated();

        unset($data['service_ids'], $data['user_ids']);

        return $data;
    }

    /**
     * Get the service ids the location should be assigned to.
     *
     * @return array<int, int>
     */
    public function serviceIds(): array
    {
        return array_map('intval', $this->validated('service_ids', []));
    }

    /**
     * Get the specialist user ids the location should be assigned to.
     *
     * @return array<int, int>
     */
    public function specialistIds(): array
    {
        return array_map('intval', $this->validated('user_ids', []));
    }
}
