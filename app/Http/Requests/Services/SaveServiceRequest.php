<?php

namespace App\Http\Requests\Services;

use App\Enums\Currency;
use App\Enums\DeliveryType;
use App\Enums\PriceType;
use App\Enums\ServiceType;
use App\Models\Service;
use App\Support\ServiceOptions;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
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
            // A blank interval means "use the smart default"; store it as null.
            'slot_interval' => $this->input('slot_interval') !== null && $this->input('slot_interval') !== ''
                ? $this->input('slot_interval')
                : null,
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
            'slot_interval' => ['nullable', 'integer', 'min:1', 'max:1440'],
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
            // Per-specialist overrides, keyed by user id. Any missing value falls
            // back to the service's own duration/price.
            'specialist_pricing' => ['array'],
            'specialist_pricing.*.duration' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'specialist_pricing.*.price' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'specialist_pricing.*.price_min' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'specialist_pricing.*.price_max' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
        ];
    }

    /**
     * Configure the validator instance.
     *
     * A specialist's price range must be internally consistent: the maximum can
     * never sit below the minimum.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            foreach ((array) $this->input('specialist_pricing', []) as $userId => $override) {
                $min = $override['price_min'] ?? null;
                $max = $override['price_max'] ?? null;

                if ($min !== null && $max !== null && (float) $max < (float) $min) {
                    $validator->errors()->add(
                        "specialist_pricing.{$userId}.price_max",
                        __('The maximum price must be greater than or equal to the minimum price.'),
                    );
                }
            }
        });
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

        unset($data['location_ids'], $data['user_ids'], $data['specialist_pricing']);

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

    /**
     * Build the sync payload for the service's specialists, carrying each
     * specialist's per-service duration/price overrides on the pivot.
     *
     * Only the price columns relevant to the service's price type are kept, so
     * switching the price type never leaves stale overrides behind.
     *
     * @return array<int, array{duration: ?int, price: ?string, price_min: ?string, price_max: ?string}>
     */
    public function specialistSyncData(): array
    {
        $priceType = $this->validated('price_type');
        $pricing = $this->validated('specialist_pricing', []);

        $sync = [];

        foreach ($this->specialistIds() as $id) {
            $override = $pricing[$id] ?? [];

            $sync[$id] = [
                'duration' => isset($override['duration']) && $override['duration'] !== null
                    ? (int) $override['duration']
                    : null,
                'price' => $priceType === PriceType::Fixed->value ? ($override['price'] ?? null) : null,
                'price_min' => $priceType === PriceType::Range->value ? ($override['price_min'] ?? null) : null,
                'price_max' => $priceType === PriceType::Range->value ? ($override['price_max'] ?? null) : null,
            ];
        }

        return $sync;
    }
}
