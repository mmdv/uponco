import { router, usePage } from '@inertiajs/react';
import { Check, Plus } from 'lucide-react';
import CreateTeamModal from '@/components/create-team-modal';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { switchMethod } from '@/routes/teams';
import type { Team } from '@/types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function TeamSwitcherModal({ open, onOpenChange }: Props) {
    const page = usePage();
    const currentTeam = page.props.currentTeam;
    const teams = page.props.teams ?? [];

    const switchTeam = (team: Team) => {
        if (team.id === currentTeam?.id) {
            onOpenChange(false);

            return;
        }

        const previousTeamSlug = currentTeam?.slug;

        onOpenChange(false);

        router.visit(switchMethod(team.slug), {
            onFinish: () => {
                if (!previousTeamSlug || typeof window === 'undefined') {
                    router.reload();

                    return;
                }

                const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
                const segment = `/${previousTeamSlug}`;

                if (currentUrl.includes(segment)) {
                    router.visit(currentUrl.replace(segment, `/${team.slug}`), {
                        replace: true,
                    });

                    return;
                }

                router.reload();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Switch team</DialogTitle>
                    <DialogDescription>
                        Choose a team to work in or create a new one.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-1">
                    {teams.map((team) => (
                        <button
                            key={team.id}
                            type="button"
                            data-test="team-switcher-item"
                            onClick={() => switchTeam(team)}
                            className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                            {team.name}
                            {currentTeam?.id === team.id && (
                                <Check className="size-4" />
                            )}
                        </button>
                    ))}
                </div>

                <CreateTeamModal>
                    <Button
                        variant="secondary"
                        className="w-full"
                        data-test="team-switcher-new-team"
                    >
                        <Plus className="size-4" />
                        New team
                    </Button>
                </CreateTeamModal>
            </DialogContent>
        </Dialog>
    );
}
