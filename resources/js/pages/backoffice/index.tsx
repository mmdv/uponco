import { Head, usePage } from '@inertiajs/react';
import { MapPin, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useInitials } from '@/hooks/use-initials';
import { index as backofficeIndex } from '@/routes/backoffice';
import DeleteTeamModal from './delete-team-modal';
import DeleteUserModal from './delete-user-modal';

const OPERATOR_TEAM_NAME = 'Uponco';

export type BackofficeMember = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
    roleLabel: string;
};

export type BackofficeTeam = {
    id: number;
    name: string;
    slug: string;
    isPersonal: boolean;
    createdAt: string | null;
    membersCount: number;
    locationsCount: number;
    appointmentsCount: number;
    members: BackofficeMember[];
};

type Props = {
    teams: BackofficeTeam[];
};

export default function BackofficeIndex({ teams }: Props) {
    const getInitials = useInitials();
    const { currentTeam } = usePage().props;
    const currentTeamSlug = currentTeam?.slug ?? '';

    const [teamToDelete, setTeamToDelete] = useState<BackofficeTeam | null>(
        null,
    );
    const [teamDialogOpen, setTeamDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<BackofficeMember | null>(
        null,
    );
    const [userDialogOpen, setUserDialogOpen] = useState(false);

    const confirmDeleteTeam = (team: BackofficeTeam) => {
        setTeamToDelete(team);
        setTeamDialogOpen(true);
    };

    const confirmDeleteUser = (user: BackofficeMember) => {
        setUserToDelete(user);
        setUserDialogOpen(true);
    };

    return (
        <>
            <Head title="Backoffice" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Backoffice"
                    description={`${teams.length} team${teams.length === 1 ? '' : 's'} across the platform`}
                />

                <div className="flex flex-col gap-6">
                    {teams.map((team) => {
                        const isOperatorTeam = team.name === OPERATOR_TEAM_NAME;

                        return (
                            <Card key={team.id} data-test="backoffice-team">
                                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2">
                                            {team.name ?? (
                                                <span className="text-muted-foreground italic">
                                                    Unnamed team
                                                </span>
                                            )}
                                            {team.isPersonal ? (
                                                <Badge variant="outline">
                                                    Personal
                                                </Badge>
                                            ) : null}
                                            {isOperatorTeam ? (
                                                <Badge>Operator</Badge>
                                            ) : null}
                                        </CardTitle>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                            <span>{team.slug}</span>
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3.5 w-3.5" />
                                                {team.membersCount} member
                                                {team.membersCount === 1
                                                    ? ''
                                                    : 's'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {team.locationsCount} location
                                                {team.locationsCount === 1
                                                    ? ''
                                                    : 's'}
                                            </span>
                                            <span>
                                                {team.appointmentsCount}{' '}
                                                appointment
                                                {team.appointmentsCount === 1
                                                    ? ''
                                                    : 's'}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        data-test="delete-team-button"
                                        disabled={isOperatorTeam}
                                        title={
                                            isOperatorTeam
                                                ? 'The operator team cannot be deleted'
                                                : undefined
                                        }
                                        onClick={() => confirmDeleteTeam(team)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete team
                                    </Button>
                                </CardHeader>

                                <CardContent>
                                    {team.members.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        Member
                                                    </TableHead>
                                                    <TableHead>Role</TableHead>
                                                    <TableHead className="w-0 text-right">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {team.members.map((member) => (
                                                    <TableRow
                                                        key={member.id}
                                                        data-test="backoffice-member"
                                                    >
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-8 w-8">
                                                                    {member.avatar ? (
                                                                        <AvatarImage
                                                                            src={
                                                                                member.avatar
                                                                            }
                                                                            alt={
                                                                                member.name
                                                                            }
                                                                        />
                                                                    ) : null}
                                                                    <AvatarFallback>
                                                                        {getInitials(
                                                                            member.name,
                                                                        )}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <div className="font-medium">
                                                                        {
                                                                            member.name
                                                                        }
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {
                                                                            member.email
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary">
                                                                {
                                                                    member.roleLabel
                                                                }
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                data-test="delete-user-button"
                                                                onClick={() =>
                                                                    confirmDeleteUser(
                                                                        member,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No members.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            <DeleteTeamModal
                currentTeamSlug={currentTeamSlug}
                team={teamToDelete}
                open={teamDialogOpen}
                onOpenChange={setTeamDialogOpen}
            />

            <DeleteUserModal
                currentTeamSlug={currentTeamSlug}
                user={userToDelete}
                open={userDialogOpen}
                onOpenChange={setUserDialogOpen}
            />
        </>
    );
}

BackofficeIndex.layout = (props: {
    currentTeam?: { slug: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Backoffice',
            href: props.currentTeam
                ? backofficeIndex(props.currentTeam.slug)
                : '/',
        },
    ],
});
