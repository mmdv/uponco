import { Pencil, Plus, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslateFn } from '@/hooks/use-translation';
import type { SelectOption, Service, ServiceCategory } from '@/types';

type Props = {
    categories: ServiceCategory[];
    services: Service[];
    meetingProviders: SelectOption[];
    onAddService: (categoryId: number) => void;
    onEditService: (service: Service) => void;
    onDeleteService: (service: Service) => void;
    onEditCategory: (category: ServiceCategory) => void;
    onDeleteCategory: (category: ServiceCategory) => void;
};

function formatPrice(service: Service, t: TranslateFn): string {
    if (service.price_type === 'free') {
        return t('services.table.free');
    }

    if (service.price_type === 'range') {
        return `${service.price_min ?? '—'} – ${service.price_max ?? '—'}`;
    }

    return service.price ?? '—';
}

type ServicesTableProps = {
    services: Service[];
    providerLabels: Map<string, string>;
    onEditService: (service: Service) => void;
    onDeleteService: (service: Service) => void;
};

function ServicesTable({
    services,
    providerLabels,
    onEditService,
    onDeleteService,
}: ServicesTableProps) {
    const { t } = useTranslation('company');

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{t('services.table.status')}</TableHead>
                    <TableHead>{t('services.table.title')}</TableHead>
                    <TableHead>{t('services.table.price')}</TableHead>
                    <TableHead>{t('services.table.duration')}</TableHead>
                    <TableHead>{t('services.table.type')}</TableHead>
                    <TableHead>{t('services.table.delivery')}</TableHead>
                    <TableHead className="text-right">
                        {t('services.table.actions')}
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {services.map((service) => (
                    <TableRow key={service.id} data-test="service-row">
                        <TableCell>
                            <Badge
                                variant={
                                    service.is_active ? 'default' : 'secondary'
                                }
                            >
                                {service.is_active
                                    ? t('services.table.active')
                                    : t('services.table.inactive')}
                            </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                            {service.title}
                        </TableCell>
                        <TableCell>{formatPrice(service, t)}</TableCell>
                        <TableCell className="text-muted-foreground">
                            {service.duration} min
                            {service.technical_break > 0 &&
                                ` (+${service.technical_break})`}
                        </TableCell>
                        <TableCell className="text-muted-foreground capitalize">
                            {service.service_type}
                            {service.service_type === 'group' &&
                                service.capacity &&
                                ` · ${service.capacity}`}
                        </TableCell>
                        <TableCell className="text-muted-foreground capitalize">
                            {service.delivery_type}
                            {service.delivery_type === 'online' &&
                                service.online_meeting_provider &&
                                ` · ${providerLabels.get(service.online_meeting_provider) ?? service.online_meeting_provider}`}
                        </TableCell>
                        <TableCell className="text-right">
                            <TooltipProvider>
                                <div className="flex items-center justify-end gap-1">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                data-test="service-edit-button"
                                                onClick={() =>
                                                    onEditService(service)
                                                }
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                {t(
                                                    'services.editServiceTooltip',
                                                )}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                data-test="service-delete-button"
                                                onClick={() =>
                                                    onDeleteService(service)
                                                }
                                            >
                                                <Trash2 className="size-4 text-destructive" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                {t(
                                                    'services.deleteServiceTooltip',
                                                )}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </TooltipProvider>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function ServicesList({
    categories,
    services,
    meetingProviders,
    onAddService,
    onEditService,
    onDeleteService,
    onEditCategory,
    onDeleteCategory,
}: Props) {
    const { t } = useTranslation('company');
    const providerLabels = new Map(
        meetingProviders.map((provider) => [provider.value, provider.label]),
    );

    const uncategorizedServices = services.filter(
        (service) => service.service_category_id === null,
    );

    if (categories.length === 0 && uncategorizedServices.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-10 text-center">
                <p className="text-sm text-muted-foreground">
                    {t('services.empty')}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6">
            {uncategorizedServices.length > 0 && (
                <div
                    className="rounded-lg border"
                    data-test="uncategorized-group"
                >
                    <div className="border-b px-4 py-3">
                        <h3 className="font-medium text-muted-foreground">
                            {t('services.uncategorized')}
                        </h3>
                    </div>

                    <ServicesTable
                        services={uncategorizedServices}
                        providerLabels={providerLabels}
                        onEditService={onEditService}
                        onDeleteService={onDeleteService}
                    />
                </div>
            )}

            {categories.map((category) => {
                const categoryServices = services.filter(
                    (service) => service.service_category_id === category.id,
                );

                return (
                    <div
                        key={category.id}
                        className="rounded-lg border"
                        data-test="category-group"
                    >
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <h3 className="font-medium">{category.name}</h3>
                            <TooltipProvider>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        data-test="category-add-service-button"
                                        onClick={() =>
                                            onAddService(category.id)
                                        }
                                    >
                                        <Plus className="size-4" />{' '}
                                        {t('services.addServiceShort')}
                                    </Button>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                data-test="category-edit-button"
                                                onClick={() =>
                                                    onEditCategory(category)
                                                }
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                {t(
                                                    'services.editCategoryTooltip',
                                                )}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                data-test="category-delete-button"
                                                onClick={() =>
                                                    onDeleteCategory(category)
                                                }
                                            >
                                                <Trash2 className="size-4 text-destructive" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                {t(
                                                    'services.deleteCategoryTooltip',
                                                )}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </TooltipProvider>
                        </div>

                        {categoryServices.length === 0 ? (
                            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                                {t('services.noServicesInCategory')}
                            </p>
                        ) : (
                            <ServicesTable
                                services={categoryServices}
                                providerLabels={providerLabels}
                                onEditService={onEditService}
                                onDeleteService={onDeleteService}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
