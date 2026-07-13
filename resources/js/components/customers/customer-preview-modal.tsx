import { Mail, Phone, User } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation';
import type { Customer } from '@/types';

type Props = {
    customer: Customer | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function CustomerPreviewModal({
    customer,
    open,
    onOpenChange,
}: Props) {
    const { t } = useTranslation('customers');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
                {customer && (
                    <>
                        <DialogHeader className="flex-row items-center gap-4 border-b bg-muted/30 p-6">
                            <Avatar className="size-14">
                                <AvatarFallback className="text-lg">
                                    {getInitials(customer.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <DialogTitle className="truncate text-xl leading-tight">
                                    {customer.name}
                                </DialogTitle>
                                <p className="text-sm text-muted-foreground">
                                    {t('preview.customer')}
                                </p>
                            </div>
                        </DialogHeader>

                        <div className="space-y-3 p-6">
                            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                {t('preview.contact')}
                            </h3>

                            <ContactRow
                                icon={<Mail className="size-4" />}
                                label={t('preview.email')}
                                value={customer.email}
                                href={
                                    customer.email
                                        ? `mailto:${customer.email}`
                                        : undefined
                                }
                            />
                            <ContactRow
                                icon={<Phone className="size-4" />}
                                label={t('preview.phone')}
                                value={customer.phone}
                                href={
                                    customer.phone
                                        ? `tel:${customer.phone}`
                                        : undefined
                                }
                            />

                            {!customer.email && !customer.phone && (
                                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="size-4" />
                                    {t('preview.noContact')}
                                </p>
                            )}
                        </div>

                        <DialogFooter className="border-t p-4">
                            <DialogClose asChild>
                                <Button variant="secondary">
                                    {t('preview.close')}
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

function ContactRow({
    icon,
    label,
    value,
    href,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | null;
    href?: string;
}) {
    return (
        <div className="flex items-center gap-3 rounded-lg border p-3">
            <span className="text-muted-foreground">{icon}</span>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {label}
                </p>
                {value ? (
                    href ? (
                        <a
                            href={href}
                            className="block truncate text-sm font-medium transition-colors hover:text-primary"
                        >
                            {value}
                        </a>
                    ) : (
                        <p className="truncate text-sm font-medium">{value}</p>
                    )
                ) : (
                    <p className="text-sm text-muted-foreground">—</p>
                )}
            </div>
        </div>
    );
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}
