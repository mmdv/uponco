<?php

namespace App\Actions\Teams;

use App\Models\User;
use Illuminate\Support\Arr;

class UpdateMemberProfile
{
    /**
     * Update the member's name and public booking profile (public email,
     * phone, job title, description). Shared by the web member page and the
     * mobile API.
     *
     * @param  array{name: string, email?: ?string, phone?: ?string, job_title?: ?string, description?: ?string}  $data
     */
    public function handle(User $member, array $data): void
    {
        $member->update(['name' => $data['name']]);

        $member->profile()->updateOrCreate([], Arr::except($data, ['name']));
    }
}
