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
import { destroy } from '@/routes/backoffice/users';
import type { BackofficeMember } from './index';

type Props = {
    currentTeamSlug: string;
    user: BackofficeMember | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function DeleteUserModal({
    currentTeamSlug,
    user,
    open,
    onOpenChange,
}: Props) {
    const [processing, setProcessing] = useState(false);

    const deleteUser = () => {
        if (!user) {
            return;
        }

        router.visit(destroy([currentTeamSlug, user.id]), {
            method: 'delete',
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete user</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to permanently delete{' '}
                        <strong>{user?.name}</strong> ({user?.email})? This also
                        removes them from every team they belong to.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                    </DialogClose>

                    <Button
                        variant="destructive"
                        data-test="delete-user-confirm"
                        disabled={processing}
                        onClick={deleteUser}
                    >
                        Delete user
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
