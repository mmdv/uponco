import {
    ArrowRight,
    Clock,
    MapPin,
    MoreVertical,
    Pencil,
    Plus,
    Tag,
    Trash2,
    TriangleAlert,
    Users,
    Video,
} from 'lucide-react';
import type { KeyboardEvent } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslateFn } from '@/hooks/use-translation';
import { currencySymbol } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { connect } from '@/routes/integrations/google';
import type {
    GoogleIntegrationStatus,
    SelectOption,
    Service,
    ServiceCategory,
} from '@/types';

type Props = {
    categories: ServiceCategory[];
    services: Service[];
    meetingProviders: SelectOption[];
    google: GoogleIntegrationStatus;
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

    const symbol = currencySymbol(service.currency);

    if (service.price_type === 'range') {
        return `${service.price_min ? symbol + service.price_min : '—'} – ${service.price_max ? symbol + service.price_max : '—'}`;
    }

    return service.price ? symbol + service.price : '—';
}

type ServiceCardProps = {
    service: Service;
    providerLabels: Map<string, string>;
    google: GoogleIntegrationStatus;
    onEdit: () => void;
    onDelete: () => void;
};

function ServiceCard({
    service,
    providerLabels,
    google,
    onEdit,
    onDelete,
}: ServiceCardProps) {
    const { t } = useTranslation('company');

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onEdit();
        }
    };

    const deliveryLabel =
        service.delivery_type === 'online' && service.online_meeting_provider
            ? `${service.delivery_type} · ${providerLabels.get(service.online_meeting_provider) ?? service.online_meeting_provider}`
            : service.delivery_type;

    // Automatic links come from the specialist's Google account, so the service
    // cannot generate any until that account is connected.
    const needsGoogle =
        service.delivery_type === 'online' &&
        service.online_meeting_provider === 'google_meet' &&
        !google.connected;

    return (
        <div
            data-test="service-row"
            role="button"
            tabIndex={0}
            onClick={onEdit}
            onKeyDown={handleKeyDown}
            aria-label={service.title}
            className="group relative flex cursor-pointer flex-col rounded-2xl border border-[#f1f3f5] bg-card p-6 shadow-soft transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none dark:border-border"
        >
            <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 truncate text-lg font-semibold tracking-tight">
                    {service.title}
                </h3>

                <div className="flex shrink-0 items-center gap-1">
                    <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        <span
                            className={cn(
                                'size-2 rounded-full',
                                service.is_active
                                    ? 'bg-emerald-500'
                                    : 'bg-muted-foreground/40',
                            )}
                        />
                        {service.is_active
                            ? t('services.table.active')
                            : t('services.table.inactive')}
                    </span>

                    <DropdownMenu>
                        <DropdownMenuTrigger
                            data-test="service-actions-button"
                            onClick={(event) => event.stopPropagation()}
                            className="flex size-7 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-accent hover:text-foreground focus-visible:opacity-100"
                        >
                            <MoreVertical className="size-4" />
                            <span className="sr-only">
                                {t('services.serviceActionsLabel')}
                            </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                data-test="service-edit-button"
                                onSelect={onEdit}
                            >
                                <Pencil className="size-4" />{' '}
                                {t('services.editServiceTooltip')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                data-test="service-delete-button"
                                variant="destructive"
                                onSelect={onDelete}
                            >
                                <Trash2 className="size-4" />{' '}
                                {t('services.deleteServiceTooltip')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2.5 text-sm">
                    <Tag className="size-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium text-foreground/90">
                        {formatPrice(service, t)}
                    </span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                    <Clock className="size-4 shrink-0 text-muted-foreground" />
                    <span className="text-foreground/90">
                        {service.duration} min
                        {service.technical_break > 0 &&
                            ` (+${service.technical_break})`}
                    </span>
                </div>
            </div>

            {needsGoogle && (
                <div
                    data-test="service-google-warning"
                    className="mt-4 flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
                >
                    <p className="flex items-start gap-2 text-sm text-destructive">
                        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                        {t('services.google.notConnected')}
                    </p>

                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="self-start"
                        data-test="service-connect-google-button"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {/* External OAuth redirect — must be a full-page
                            navigation, not an Inertia visit. */}
                        <a href={connect.url()}>
                            {t('services.google.connect')}
                        </a>
                    </Button>
                </div>
            )}

            <div className="mt-6 flex items-center justify-between pt-2">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5 capitalize">
                        <Users className="size-4" />
                        {service.service_type}
                        {service.service_type === 'group' &&
                            service.capacity &&
                            ` · ${service.capacity}`}
                    </span>
                    <span className="flex items-center gap-1.5 capitalize">
                        {service.delivery_type === 'online' ? (
                            <Video className="size-4" />
                        ) : (
                            <MapPin className="size-4" />
                        )}
                        {deliveryLabel}
                    </span>
                </div>

                <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:bg-primary/5 group-hover:text-primary"
                >
                    <ArrowRight className="size-4" />
                </span>
            </div>
        </div>
    );
}

type ServiceGridProps = {
    services: Service[];
    providerLabels: Map<string, string>;
    google: GoogleIntegrationStatus;
    onEditService: (service: Service) => void;
    onDeleteService: (service: Service) => void;
};

function ServiceGrid({
    services,
    providerLabels,
    google,
    onEditService,
    onDeleteService,
}: ServiceGridProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
                <ServiceCard
                    key={service.id}
                    service={service}
                    providerLabels={providerLabels}
                    google={google}
                    onEdit={() => onEditService(service)}
                    onDelete={() => onDeleteService(service)}
                />
            ))}
        </div>
    );
}

export default function ServicesList({
    categories,
    services,
    meetingProviders,
    google,
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
            <div className="rounded-2xl border border-dashed p-10 text-center">
                <p className="text-sm text-muted-foreground">
                    {t('services.empty')}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-8">
            {uncategorizedServices.length > 0 && (
                <section data-test="uncategorized-group">
                    <ServiceGrid
                        services={uncategorizedServices}
                        providerLabels={providerLabels}
                        google={google}
                        onEditService={onEditService}
                        onDeleteService={onDeleteService}
                    />
                </section>
            )}

            {categories.map((category) => {
                const categoryServices = services.filter(
                    (service) => service.service_category_id === category.id,
                );

                return (
                    <section key={category.id} data-test="category-group">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h3 className="min-w-0 truncate text-base font-semibold tracking-tight">
                                {category.name}
                            </h3>

                            <div className="flex shrink-0 items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    data-test="category-add-service-button"
                                    onClick={() => onAddService(category.id)}
                                >
                                    <Plus className="size-4" />{' '}
                                    {t('services.addServiceShort')}
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        data-test="category-actions-button"
                                        className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none"
                                    >
                                        <MoreVertical className="size-4" />
                                        <span className="sr-only">
                                            {t('services.categoryActionsLabel')}
                                        </span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            data-test="category-edit-button"
                                            onSelect={() =>
                                                onEditCategory(category)
                                            }
                                        >
                                            <Pencil className="size-4" />{' '}
                                            {t('services.editCategoryTooltip')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            data-test="category-delete-button"
                                            variant="destructive"
                                            onSelect={() =>
                                                onDeleteCategory(category)
                                            }
                                        >
                                            <Trash2 className="size-4" />{' '}
                                            {t(
                                                'services.deleteCategoryTooltip',
                                            )}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {categoryServices.length === 0 ? (
                            <div className="rounded-2xl border border-dashed p-8 text-center">
                                <p className="text-sm text-muted-foreground">
                                    {t('services.noServicesInCategory')}
                                </p>
                            </div>
                        ) : (
                            <ServiceGrid
                                services={categoryServices}
                                providerLabels={providerLabels}
                                google={google}
                                onEditService={onEditService}
                                onDeleteService={onDeleteService}
                            />
                        )}
                    </section>
                );
            })}
        </div>
    );
}
