<?php

namespace App\Http\Requests\Company;

use App\Support\Localization;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class SaveTeamLanguagesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Gate::allows('update', $this->user()->currentTeam);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $enabled = Localization::enabledCodes();

        return [
            'available_locales' => ['required', 'array', 'min:1'],
            'available_locales.*' => ['string', Rule::in($enabled)],
            'default_locale' => ['required', 'string', Rule::in($enabled), Rule::in($this->input('available_locales', []))],
        ];
    }

    /**
     * Get the custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'default_locale.in' => __('The default language must be one of the available languages.'),
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
            'default_locale' => __('default language'),
            'available_locales' => __('available languages'),
        ];
    }
}
