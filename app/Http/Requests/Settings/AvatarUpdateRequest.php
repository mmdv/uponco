<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class AvatarUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'avatar' => [
                'required',
                // The profile picture is cropped to a square client-side; the
                // ratio rule enforces that server-side too. SVG is rejected as it
                // cannot be a raster square and carries XSS risk.
                File::types(['jpg', 'jpeg', 'png', 'webp'])->max(2 * 1024),
                Rule::dimensions()->ratio(1),
            ],
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
            'avatar.required' => __('Please choose an image to upload.'),
            'avatar.dimensions' => __('The profile picture must be square.'),
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
            'avatar' => __('profile picture'),
        ];
    }
}
