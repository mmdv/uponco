import { Head, Link } from '@inertiajs/react';
import { Mail, UserPlus, UserRoundPlus, X } from 'lucide-react';
import { useState } from 'react';
import AddMemberModal from '@/components/add-member-modal';
import CancelInvitationModal from '@/components/cancel-invitation-modal';
import Heading from '@/components/heading';
import InviteMemberModal from '@/components/invite-member-modal';
import RemoveMemberModal from '@/components/remove-member-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useInitials } from '@/hooks/use-initials';
import { index as companyIndex } from '@/routes/company';
import { edit as editBusiness } from '@/routes/company/business';
import {
    edit as editMember,
    index as businessMembers,
} from '@/routes/company/business/members';
import type {
    RoleOption,
    Team,
    TeamInvitation,
    TeamMember,
    TeamPermissions,
} from '@/types';

type Props = {
    team: Team;
    members: TeamMember[];
    invitations: TeamInvitation[];
    permissions: TeamPermissions;
    availableRoles: RoleOption[];
};

export default function BusinessMembers({
    team,
    members,
    invitations,
    permissions,
    availableRoles,
}: Props) {
    const getInitials = useInitials();

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(
        null,
    );
    const [cancelInvitationDialogOpen, setCancelInvitationDialogOpen] =
        useState(false);
    const [invitationToCancel, setInvitationToCancel] =
        useState<TeamInvitation | null>(null);

    const confirmRemoveMember = (member: TeamMember) => {
        setMemberToRemove(member);
        setRemoveMemberDialogOpen(true);
    };

    const confirmCancelInvitation = (invitation: TeamInvitation) => {
        setInvitationToCancel(invitation);
        setCancelInvitationDialogOpen(true);
    };

    return (
        <>
            <Head title="Team Members" />

            <h1 className="sr-only">Team Members</h1>

            <div className="flex flex-col space-y-10">
                <div className="space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Heading
                            variant="small"
                            title="Team members"
                            description={
                                permissions.canAddMember ||
                                permissions.canCreateInvitation
                                    ? 'Manage who belongs to this team'
                                    : ''
                            }
                        />

                        <div className="flex flex-wrap items-center gap-2">
                            {permissions.canAddMember ? (
                                <Button
                                    variant="outline"
                                    data-test="add-member-button"
                                    onClick={() => setAddDialogOpen(true)}
                                >
                                    <UserRoundPlus /> Add member
                                </Button>
                            ) : null}

                            {permissions.canCreateInvitation ? (
                                <Button
                                    data-test="invite-member-button"
                                    onClick={() => setInviteDialogOpen(true)}
                                >
                                    <UserPlus /> Invite member
                                </Button>
                            ) : null}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                data-test="member-row"
                                className="relative flex items-center justify-between gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                            >
                                <Link
                                    href={editMember([team.slug, member.id])}
                                    className="absolute inset-0 rounded-lg"
                                    aria-label={`Edit ${member.name}`}
                                    data-test="member-edit-link"
                                />

                                <div className="flex min-w-0 items-center gap-4">
                                    <Avatar className="h-10 w-10">
                                        {member.avatar ? (
                                            <AvatarImage
                                                src={member.avatar}
                                                alt={member.name}
                                            />
                                        ) : null}
                                        <AvatarFallback>
                                            {getInitials(member.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <div className="truncate font-medium">
                                            {member.name}
                                        </div>
                                        <div className="truncate text-sm text-muted-foreground">
                                            {member.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="relative flex shrink-0 items-center gap-2">
                                    <Badge variant="secondary">
                                        {member.role_label}
                                    </Badge>

                                    {member.role !== 'owner' &&
                                    permissions.canRemoveMember ? (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        data-test="member-remove-button"
                                                        onClick={() =>
                                                            confirmRemoveMember(
                                                                member,
                                                            )
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Remove member</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {invitations.length > 0 ? (
                    <div className="space-y-6">
                        <Heading
                            variant="small"
                            title="Pending invitations"
                            description="Invitations that haven't been accepted yet"
                        />

                        <div className="space-y-3">
                            {invitations.map((invitation) => (
                                <div
                                    key={invitation.code}
                                    data-test="invitation-row"
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                            <Mail className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {invitation.email}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {invitation.role_label}
                                            </div>
                                        </div>
                                    </div>

                                    {permissions.canCancelInvitation ? (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        data-test="invitation-cancel-button"
                                                        onClick={() =>
                                                            confirmCancelInvitation(
                                                                invitation,
                                                            )
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Cancel invitation</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>

            {permissions.canAddMember ? (
                <AddMemberModal
                    team={team}
                    open={addDialogOpen}
                    onOpenChange={setAddDialogOpen}
                />
            ) : null}

            {permissions.canCreateInvitation ? (
                <InviteMemberModal
                    team={team}
                    availableRoles={availableRoles}
                    open={inviteDialogOpen}
                    onOpenChange={setInviteDialogOpen}
                />
            ) : null}

            <RemoveMemberModal
                team={team}
                member={memberToRemove}
                open={removeMemberDialogOpen}
                onOpenChange={setRemoveMemberDialogOpen}
            />

            <CancelInvitationModal
                team={team}
                invitation={invitationToCancel}
                open={cancelInvitationDialogOpen}
                onOpenChange={setCancelInvitationDialogOpen}
            />
        </>
    );
}

BusinessMembers.layout = (props: {
    currentTeam?: { slug: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Company',
            href: props.currentTeam
                ? companyIndex(props.currentTeam.slug)
                : '/',
        },
        {
            title: 'Business',
            href: props.currentTeam
                ? editBusiness(props.currentTeam.slug)
                : '/',
        },
        {
            title: 'Team Members',
            href: props.currentTeam
                ? businessMembers(props.currentTeam.slug)
                : '/',
        },
    ],
});
