<?php

namespace App\Http\Requests\Settings;

use App\Concerns\AccountValidationRules;
use App\Concerns\PasswordValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AccountUpdateRequest extends FormRequest
{
    use AccountValidationRules, PasswordValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'email' => $this->emailRules($this->user()->id),
        ];

        // OAuth-only accounts have no password to confirm; the live session
        // stands in for re-authentication.
        if ($this->user()->hasPassword()) {
            $rules['current_password'] = $this->currentPasswordRules();
        }

        return $rules;
    }
}
