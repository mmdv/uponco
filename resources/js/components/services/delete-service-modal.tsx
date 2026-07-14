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
import { destroy } from '@/routes/company/services';
import type { Service } from '@/types';

type Props = {
    service: Service | null;
    teamSlug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function DeleteServiceModal({
    service,
    teamSlug,
    open,
    onOpenChange,
}: Props) {
    const { t } = useTranslation('company');
    const [processing, setProcessing] = useState(false);

    const deleteService = () => {
        if (!service) {
            return;
        }

        router.visit(destroy([teamSlug, service.id]), {
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
                    <DialogTitle>
                        {t('services.deleteServiceModal.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('services.deleteServiceModal.confirmDescription', {
                            name: service?.title ?? '',
                        })}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">
                            {t('services.deleteServiceModal.cancel')}
                        </Button>
                    </DialogClose>

                    <Button
                        variant="destructive"
                        data-test="delete-service-confirm"
                        disabled={processing}
                        onClick={deleteService}
                    >
                        {t('services.deleteServiceModal.confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
