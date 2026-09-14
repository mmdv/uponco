<?php

namespace App\Http\Requests\Company;

use App\Enums\TeamPermission;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMemberPermissionsRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $grantable = array_map(
            fn (TeamPermission $permission): string => $permission->value,
            TeamPermission::grantable(),
        );

        return [
            'permissions' => ['array'],
            'permissions.*' => ['string', Rule::in($grantable)],
        ];
    }

    /**
     * Get the granted permission values, de-duplicated.
     *
     * @return array<int, string>
     */
    public function permissions(): array
    {
        return array_values(array_unique($this->validated('permissions', [])));
    }
}
