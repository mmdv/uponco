<?php

namespace App\Http\Requests\Services;

use App\Enums\Currency;
use App\Enums\DeliveryType;
use App\Enums\PriceType;
use App\Enums\ServiceType;
use App\Models\Service;
use App\Support\ServiceOptions;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveServiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $service = $this->route('service');

        if (! $service instanceof Service) {
            return true;
        }

        return $service->team_id === $this->user()->currentTeam->id;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => $this->boolean('is_active'),
            // The category select submits an empty value when left unset.
            'service_category_id' => $this->input('service_category_id') ?: null,
            // Free services hide the currency select, so fall back to whatever
            // suits the active UI language rather than failing validation.
            'currency' => $this->input('currency') ?: Currency::forLocale(app()->getLocale())->value,
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
            'service_category_id' => [
                'nullable',
                Rule::exists('service_categories', 'id')->where(
                    fn ($query) => $query->where('team_id', $this->user()->currentTeam->id),
                ),
            ],
            'is_active' => ['required', 'boolean'],
            'title' => ['required', 'string', 'max:255'],
            'price_type' => ['required', Rule::enum(PriceType::class)],
            'price' => ['nullable', 'required_if:price_type,fixed', 'numeric', 'min:0', 'max:99999999'],
            'price_min' => ['nullable', 'required_if:price_type,range', 'numeric', 'min:0', 'max:99999999'],
            'price_max' => ['nullable', 'required_if:price_type,range', 'numeric', 'min:0', 'max:99999999', 'gte:price_min'],
            'currency' => ['required', Rule::enum(Currency::class)],
            'duration' => ['required', 'integer', 'min:1', 'max:1440'],
            'technical_break' => ['required', 'integer', 'min:0', 'max:1440'],
            'service_type' => ['required', Rule::enum(ServiceType::class)],
            'delivery_type' => ['required', Rule::enum(DeliveryType::class)],
            'online_meeting_provider' => [
                'nullable',
                'required_if:delivery_type,online',
                Rule::in(ServiceOptions::meetingProviderKeys()),
            ],
            'capacity' => ['nullable', 'required_if:service_type,group', 'integer', 'min:1', 'max:10000'],
            'description' => ['nullable', 'string', 'max:5000'],
            'location_ids' => ['array', 'required_if:delivery_type,onsite', 'min:1'],
            'location_ids.*' => [
                Rule::exists('locations', 'id')->where(
                    fn ($query) => $query->where('team_id', $this->user()->currentTeam->id),
                ),
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
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'location_ids.required_if' => __('Onsite services need at least one location.'),
            'location_ids.min' => __('Onsite services need at least one location.'),
        ];
    }

    /**
     * Get the validated payload normalized for the selected price and type options.
     *
     * @return array<string, mixed>
     */
    public function serviceData(): array
    {
        $data = $this->validated();

        unset($data['location_ids'], $data['user_ids']);

        $data['team_id'] = $this->user()->currentTeam->id;

        if ($data['price_type'] !== PriceType::Fixed->value) {
            $data['price'] = null;
        }

        if ($data['price_type'] !== PriceType::Range->value) {
            $data['price_min'] = null;
            $data['price_max'] = null;
        }

        if ($data['delivery_type'] !== DeliveryType::Online->value) {
            $data['online_meeting_provider'] = null;
        }

        if ($data['service_type'] !== ServiceType::Group->value) {
            $data['capacity'] = null;
        }

        return $data;
    }

    /**
     * Get the location ids the service should be assigned to.
     *
     * @return array<int, int>
     */
    public function locationIds(): array
    {
        return array_map('intval', $this->validated('location_ids', []));
    }

    /**
     * Get the specialist user ids the service should be assigned to.
     *
     * @return array<int, int>
     */
    public function specialistIds(): array
    {
        return array_map('intval', $this->validated('user_ids', []));
    }
}
