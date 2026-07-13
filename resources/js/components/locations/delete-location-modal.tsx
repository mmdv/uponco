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
import { destroy } from '@/routes/company/locations';
import type { Location } from '@/types';

type Props = {
    location: Location | null;
    teamSlug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function DeleteLocationModal({
    location,
    teamSlug,
    open,
    onOpenChange,
}: Props) {
    const { t } = useTranslation('locations');
    const [processing, setProcessing] = useState(false);

    const deleteLocation = () => {
        if (!location) {
            return;
        }

        router.visit(destroy([teamSlug, location.id]), {
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
                    <DialogTitle>{t('delete.title')}</DialogTitle>
                    <DialogDescription>
                        {t('delete.confirm', {
                            name: location?.name ?? '',
                        })}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">
                            {t('delete.cancel')}
                        </Button>
                    </DialogClose>

                    <Button
                        variant="destructive"
                        data-test="delete-location-confirm"
                        disabled={processing}
                        onClick={deleteLocation}
                    >
                        {t('delete.confirmButton')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
