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
import { destroy } from '@/routes/customers';
import type { Customer } from '@/types';

type Props = {
    customer: Customer | null;
    teamSlug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function DeleteCustomerModal({
    customer,
    teamSlug,
    open,
    onOpenChange,
}: Props) {
    const { t } = useTranslation('customers');
    const [processing, setProcessing] = useState(false);

    const deleteCustomer = () => {
        if (!customer) {
            return;
        }

        router.visit(destroy([teamSlug, customer.id]), {
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
                            name: customer?.name ?? '',
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
                        data-test="delete-customer-confirm"
                        disabled={processing}
                        onClick={deleteCustomer}
                    >
                        {t('delete.confirmButton')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
