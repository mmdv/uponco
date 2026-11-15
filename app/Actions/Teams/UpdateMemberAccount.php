<?php

namespace App\Actions\Teams;

use App\Models\User;

class UpdateMemberAccount
{
    /**
     * Change a member's login email; a new address must be verified again.
     * Shared by the web member page and the mobile API.
     *
     * @param  array{email: string}  $data
     */
    public function handle(User $member, array $data): void
    {
        $member->fill($data);

        if ($member->isDirty('email')) {
            $member->email_verified_at = null;
        }

        $member->save();
    }
}
