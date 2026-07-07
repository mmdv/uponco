<?php

namespace App\Http\Requests\Backoffice;

use App\Http\Middleware\EnsureUponcoTeam;
use App\Models\Team;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class DeleteBackofficeTeamRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Access is already gated by the EnsureUponcoTeam middleware on the route.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string'],
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $team = $this->route('team');

                if (! $team instanceof Team) {
                    return;
                }

                if ($team->name === EnsureUponcoTeam::OPERATOR_TEAM_NAME) {
                    $validator->errors()->add('name', __('The operator team cannot be deleted.'));

                    return;
                }

                if ($this->input('name') !== $team->name) {
                    $validator->errors()->add('name', __('The team name does not match.'));
                }
            },
        ];
    }
}
