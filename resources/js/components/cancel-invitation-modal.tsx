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
import { destroy as destroyInvitation } from '@/routes/company/business/invitations';
import type { Team, TeamInvitation } from '@/types';

type Props = {
    team: Team;
    invitation: TeamInvitation | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function CancelInvitationModal({
    team,
    invitation,
    open,
    onOpenChange,
}: Props) {
    const { t } = useTranslation('company');
    const [processing, setProcessing] = useState(false);

    const cancelInvitation = () => {
        if (!invitation) {
            return;
        }

        router.visit(destroyInvitation([team.slug, invitation.code]), {
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
                        {t('business.cancelInvitationModal.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('business.cancelInvitationModal.description', {
                            email: invitation?.email ?? '',
                        })}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">
                            {t('business.cancelInvitationModal.keep')}
                        </Button>
                    </DialogClose>

                    <Button
                        variant="destructive"
                        data-test="cancel-invitation-confirm"
                        disabled={processing}
                        onClick={cancelInvitation}
                    >
                        {t('business.cancelInvitationModal.confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
