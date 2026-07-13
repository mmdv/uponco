<?php

namespace App\Http\Requests\Company;

use App\Concerns\AccountValidationRules;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBusinessMemberAccountRequest extends FormRequest
{
    use AccountValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        /** @var User $user */
        $user = $this->route('user');

        return $this->accountRules($user->id);
    }
}
