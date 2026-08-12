import ServiceFormFields from '@/components/services/service-form-fields';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useTranslation } from '@/hooks/use-translation';
import type { SelectOption, Service, ServiceCategory } from '@/types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    service: Service | null;
    defaultCategoryId: number | null;
    categories: ServiceCategory[];
    locations: SelectOption[];
    specialists: SelectOption[];
    priceTypes: SelectOption[];
    currencies: SelectOption[];
    serviceTypes: SelectOption[];
    deliveryTypes: SelectOption[];
    meetingProviders: SelectOption[];
};

export default function ServiceFormDrawer({
    open,
    onOpenChange,
    service,
    defaultCategoryId,
    categories,
    locations,
    specialists,
    priceTypes,
    currencies,
    serviceTypes,
    deliveryTypes,
    meetingProviders,
}: Props) {
    const { t } = useTranslation('company');
    const isEditing = service !== null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
            >
                <SheetHeader className="shrink-0 border-b">
                    <SheetTitle>
                        {isEditing
                            ? t('services.form.editTitle')
                            : t('services.form.addTitle')}
                    </SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? t('services.form.editDescription')
                            : t('services.form.addDescription')}
                    </SheetDescription>
                </SheetHeader>

                <ServiceFormFields
                    key={service?.id ?? 'new'}
                    service={service}
                    defaultCategoryId={defaultCategoryId}
                    categories={categories}
                    locations={locations}
                    specialists={specialists}
                    priceTypes={priceTypes}
                    currencies={currencies}
                    serviceTypes={serviceTypes}
                    deliveryTypes={deliveryTypes}
                    meetingProviders={meetingProviders}
                    onSuccess={() => onOpenChange(false)}
                    onCancel={() => onOpenChange(false)}
                />
            </SheetContent>
        </Sheet>
    );
}
