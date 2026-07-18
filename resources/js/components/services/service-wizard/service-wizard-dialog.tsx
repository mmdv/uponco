import ServiceWizardFields from '@/components/services/service-wizard/service-wizard-fields';
import type { ServiceWizardFieldsProps } from '@/components/services/service-wizard/service-wizard-fields';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation';

type Props = ServiceWizardFieldsProps & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function ServiceWizardDialog({
    open,
    onOpenChange,
    ...fieldsProps
}: Props) {
    const { t } = useTranslation('company');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-xl">
                <DialogHeader className="shrink-0 border-b p-4">
                    <DialogTitle>{t('services.wizard.title')}</DialogTitle>
                    <DialogDescription>
                        {t('services.wizard.description')}
                    </DialogDescription>
                </DialogHeader>

                {/* Radix unmounts the content when closed, so the wizard
                    state resets on every open. */}
                <ServiceWizardFields
                    {...fieldsProps}
                    onSuccess={() => onOpenChange(false)}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
