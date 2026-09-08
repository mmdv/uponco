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
        // Social-login accounts can't change their login email yet; the address
        // is tied to the OAuth provider. Reject any attempt outright until a
        // dedicated OAuth email-change flow exists.
        if (! $this->user()->hasPassword()) {
            return ['email' => ['prohibited']];
        }

        return [
            'email' => $this->emailRules($this->user()->id),
            'current_password' => $this->currentPasswordRules(),
        ];
    }
}
