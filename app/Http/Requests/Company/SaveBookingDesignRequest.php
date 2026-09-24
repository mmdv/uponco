<?php

namespace App\Http\Requests\Company;

use App\Enums\BookingPageDesign;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class SaveBookingDesignRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * The design switch is only offered while the feature is enabled, so the
     * endpoint is closed off entirely in environments where it's off — an
     * admin can update the team but still can't change the design in
     * production until the flag is flipped.
     */
    public function authorize(): bool
    {
        return config('booking.design_switching')
            && Gate::allows('update', $this->user()->currentTeam);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'booking_page_design' => ['required', Rule::enum(BookingPageDesign::class)],
        ];
    }

    /**
     * Get the custom attribute names for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'booking_page_design' => __('booking page design'),
        ];
    }
}
