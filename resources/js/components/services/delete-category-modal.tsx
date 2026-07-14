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
import { destroy } from '@/routes/company/service-categories';
import type { ServiceCategory } from '@/types';

type Props = {
    category: ServiceCategory | null;
    serviceCount: number;
    teamSlug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function DeleteCategoryModal({
    category,
    serviceCount,
    teamSlug,
    open,
    onOpenChange,
}: Props) {
    const { t } = useTranslation('company');
    const [processing, setProcessing] = useState(false);

    const deleteCategory = () => {
        if (!category) {
            return;
        }

        router.visit(destroy([teamSlug, category.id]), {
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
                        {t('services.deleteCategoryModal.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {serviceCount > 0
                            ? t(
                                  'services.deleteCategoryModal.confirmWithServices',
                                  {
                                      name: category?.name ?? '',
                                      count: serviceCount,
                                  },
                              )
                            : t(
                                  'services.deleteCategoryModal.confirmNoServices',
                                  { name: category?.name ?? '' },
                              )}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">
                            {t('services.deleteCategoryModal.cancel')}
                        </Button>
                    </DialogClose>

                    <Button
                        variant="destructive"
                        data-test="delete-category-confirm"
                        disabled={processing}
                        onClick={deleteCategory}
                    >
                        {t('services.deleteCategoryModal.confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
