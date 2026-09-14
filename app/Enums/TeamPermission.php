<?php

namespace App\Enums;

enum TeamPermission: string
{
    case UpdateTeam = 'team:update';
    case DeleteTeam = 'team:delete';

    case AddMember = 'member:add';
    case UpdateMember = 'member:update';
    case RemoveMember = 'member:remove';

    case CreateInvitation = 'invitation:create';
    case CancelInvitation = 'invitation:cancel';

    case ViewAllAppointments = 'appointment:view-all';

    /**
     * Get the permissions that can be granted to an individual member,
     * overriding what their role alone provides. These surface as the
     * per-member checkboxes on the member edit page.
     *
     * @return array<TeamPermission>
     */
    public static function grantable(): array
    {
        return [
            self::ViewAllAppointments,
        ];
    }
}
