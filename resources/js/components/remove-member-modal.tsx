import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation';
import { destroy as destroyMember } from '@/routes/company/business/members';
import type { Team, TeamMember } from '@/types';

type Props = {
    team: Team;
    member: TeamMember | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function RemoveMemberModal({
    team,
    member,
    open,
    onOpenChange,
}: Props) {
    const { t } = useTranslation('company');
    const [processing, setProcessing] = useState(false);

    const removeMember = () => {
        if (!member) {
            return;
        }

        router.visit(destroyMember([team.slug, member.id]), {
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {t('business.removeMemberModal.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('business.removeMemberModal.description', {
                            name: member?.name ?? '',
                        })}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">
                            {t('business.removeMemberModal.cancel')}
                        </Button>
                    </DialogClose>

                    <Button
                        variant="destructive"
                        data-test="remove-member-confirm"
                        disabled={processing}
                        onClick={removeMember}
                    >
                        {t('business.removeMemberModal.confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
