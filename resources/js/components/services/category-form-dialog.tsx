import { Form } from '@inertiajs/react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';
import { store, update } from '@/routes/company/service-categories';
import type { ServiceCategory } from '@/types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: ServiceCategory | null;
    teamSlug: string;
};

export default function CategoryFormDialog({
    open,
    onOpenChange,
    category,
    teamSlug,
}: Props) {
    const { t } = useTranslation('company');
    const isEditing = category !== null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing
                            ? t('services.categoryDialog.editTitle')
                            : t('services.categoryDialog.addTitle')}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? t('services.categoryDialog.editDescription')
                            : t('services.categoryDialog.addDescription')}
                    </DialogDescription>
                </DialogHeader>

                <Form
                    key={category?.id ?? 'new'}
                    {...(isEditing
                        ? update.form([teamSlug, category.id])
                        : store.form(teamSlug))}
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2 py-2">
                                <Label htmlFor="name">
                                    {t('services.categoryDialog.name')}
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    data-test="category-name-input"
                                    defaultValue={category?.name ?? ''}
                                    placeholder={t(
                                        'services.categoryDialog.namePlaceholder',
                                    )}
                                    autoFocus
                                />
                                <InputError message={errors.name} />
                            </div>

                            <DialogFooter className="gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => onOpenChange(false)}
                                >
                                    {t('services.categoryDialog.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    data-test="category-save-button"
                                    disabled={processing}
                                >
                                    {isEditing
                                        ? t('services.categoryDialog.save')
                                        : t('services.categoryDialog.add')}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
