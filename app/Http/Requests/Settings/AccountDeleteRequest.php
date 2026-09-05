<?php

namespace App\Http\Requests\Settings;

use App\Concerns\PasswordValidationRules;
use App\Models\Team;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class AccountDeleteRequest extends FormRequest
{
    use PasswordValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // OAuth-only accounts have no password to confirm; the live session
        // stands in for re-authentication.
        if (! $this->user()->hasPassword()) {
            return [];
        }

        return [
            'password' => $this->currentPasswordRules(),
        ];
    }

    /**
     * Configure the validator instance.
     *
     * A team the user owns that still has other members cannot simply be
     * deleted from under them: the user must hand ownership over (or remove
     * those members) first. Teams they solely own are deleted with the account.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $blocking = $this->user()
                    ->ownedTeams()
                    ->withCount('memberships')
                    ->get()
                    ->filter(fn (Team $team): bool => $team->memberships_count > 1)
                    ->pluck('name')
                    ->all();

                if ($blocking !== []) {
                    $validator->errors()->add('teams', __(
                        'Transfer ownership of these teams before deleting your account: :teams',
                        ['teams' => implode(', ', $blocking)],
                    ));
                }
            },
        ];
    }
}
