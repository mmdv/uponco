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
import { store, update } from '@/routes/customers';
import type { Customer } from '@/types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer: Customer | null;
    teamSlug: string;
};

export default function CustomerFormDialog({
    open,
    onOpenChange,
    customer,
    teamSlug,
}: Props) {
    const { t } = useTranslation('customers');
    const isEditing = customer !== null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? t('form.editTitle') : t('form.newTitle')}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? t('form.editDescription')
                            : t('form.newDescription')}
                    </DialogDescription>
                </DialogHeader>

                <Form
                    key={customer?.id ?? 'new'}
                    {...(isEditing
                        ? update.form([teamSlug, customer.id])
                        : store.form(teamSlug))}
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-4 py-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        {t('form.name')}
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        data-test="customer-name-input"
                                        defaultValue={customer?.name ?? ''}
                                        placeholder="Jane Doe"
                                        autoFocus
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        {t('form.email')}
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        data-test="customer-email-input"
                                        defaultValue={customer?.email ?? ''}
                                        placeholder="jane@example.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">
                                        {t('form.phone')}
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        data-test="customer-phone-input"
                                        defaultValue={customer?.phone ?? ''}
                                        placeholder="+1 555 123 4567"
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <p className="text-sm text-muted-foreground">
                                    {t('form.contactHint')}
                                </p>
                            </div>

                            <DialogFooter className="gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => onOpenChange(false)}
                                >
                                    {t('form.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    data-test="customer-save-button"
                                    disabled={processing}
                                >
                                    {isEditing
                                        ? t('form.saveChanges')
                                        : t('form.addCustomer')}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
