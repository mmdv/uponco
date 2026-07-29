import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { nameInitials } from '@/lib/appointments';
import type { AppointmentSpecialistOption } from '@/types';

type Props = {
    /** The specialist to describe, or null while the dialog is closed. */
    specialist: AppointmentSpecialistOption | null;
    onClose: () => void;
};

/**
 * The specialist's public profile: photo, name, job title and bio. Opened from
 * the picker's info button so a guest can read up without picking anyone.
 */
export default function SpecialistProfileDialog({
    specialist,
    onClose,
}: Props) {
    return (
        <Dialog
            open={specialist !== null}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <DialogContent
                className="sm:max-w-sm"
                data-test="specialist-profile-dialog"
            >
                <DialogHeader className="items-center text-center sm:text-center">
                    <Avatar className="size-24">
                        {specialist?.avatar ? (
                            <AvatarImage
                                src={specialist.avatar}
                                alt={specialist.name}
                                className="object-cover"
                            />
                        ) : null}
                        <AvatarFallback className="bg-muted text-lg font-medium">
                            {nameInitials(specialist?.name ?? '')}
                        </AvatarFallback>
                    </Avatar>

                    <DialogTitle className="mt-3">
                        {specialist?.name}
                    </DialogTitle>

                    <DialogDescription className="sr-only">
                        {`About ${specialist?.name ?? 'this specialist'}`}
                    </DialogDescription>

                    {specialist?.job_title ? (
                        <p className="text-sm text-muted-foreground">
                            {specialist.job_title}
                        </p>
                    ) : null}
                </DialogHeader>

                <p className="text-center text-sm whitespace-pre-line text-muted-foreground">
                    {specialist?.description || 'No description yet.'}
                </p>

                <DialogFooter className="sm:justify-center">
                    <DialogClose asChild>
                        <Button variant="outline" className="w-full">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
