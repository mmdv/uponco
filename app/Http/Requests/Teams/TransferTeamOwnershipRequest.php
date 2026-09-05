<?php

namespace App\Http\Requests\Teams;

use App\Concerns\PasswordValidationRules;
use App\Enums\TeamRole;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class TransferTeamOwnershipRequest extends FormRequest
{
    use PasswordValidationRules;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Gate::allows('transferOwnership', $this->user()->currentTeam);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        $team = $this->user()->currentTeam;

        $rules = [
            'user_id' => [
                'required',
                'integer',
                // Must be a current member of the team who is not already the owner.
                Rule::exists('team_members', 'user_id')
                    ->where('team_id', $team->id)
                    ->where('role', '!=', TeamRole::Owner->value),
            ],
        ];

        // OAuth-only accounts have no password to confirm; the live session
        // stands in for re-authentication.
        if ($this->user()->hasPassword()) {
            $rules['password'] = $this->currentPasswordRules();
        }

        return $rules;
    }

    /**
     * Resolve the member who will become the new owner.
     */
    public function newOwner(): User
    {
        return User::findOrFail($this->integer('user_id'));
    }
}
