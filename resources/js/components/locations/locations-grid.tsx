import {
    ArrowRight,
    Gem,
    IdCard,
    MapPin,
    MoreVertical,
    Pencil,
    Phone,
    Trash2,
} from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type { Location, SelectOption } from '@/types';

type Props = {
    locations: Location[];
    countries: SelectOption[];
    onEdit: (location: Location) => void;
    onDelete: (location: Location) => void;
};

export default function LocationsGrid({
    locations,
    countries,
    onEdit,
    onDelete,
}: Props) {
    const { t } = useTranslation('locations');

    const countryLabels = new Map(
        countries.map((country) => [country.value, country.label]),
    );

    if (locations.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed p-10 text-center">
                <p className="text-sm text-muted-foreground">
                    {t('grid.empty')}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((location) => (
                <LocationCard
                    key={location.id}
                    location={location}
                    countryLabel={
                        countryLabels.get(location.country) ?? location.country
                    }
                    onEdit={() => onEdit(location)}
                    onDelete={() => onDelete(location)}
                />
            ))}
        </div>
    );
}

type CardProps = {
    location: Location;
    countryLabel: string;
    onEdit: () => void;
    onDelete: () => void;
};

function LocationCard({ location, countryLabel, onEdit, onDelete }: CardProps) {
    const { t } = useTranslation('locations');

    const address = [
        location.street_address,
        location.postal_code,
        location.city,
        countryLabel,
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <div
            data-test="location-row"
            className="group relative flex flex-col rounded-2xl border border-[#f1f3f5] bg-card p-6 shadow-soft transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/40 dark:border-border"
        >
            <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 truncate text-lg font-semibold tracking-tight">
                    {location.name}
                </h3>

                <div className="flex shrink-0 items-center gap-1">
                    <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        <span
                            className={cn(
                                'size-2 rounded-full',
                                location.is_active
                                    ? 'bg-emerald-500'
                                    : 'bg-muted-foreground/40',
                            )}
                        />
                        {location.is_active
                            ? t('grid.active')
                            : t('grid.inactive')}
                    </span>

                    <DropdownMenu>
                        <DropdownMenuTrigger
                            data-test="location-actions-button"
                            className="flex size-7 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-accent hover:text-foreground focus-visible:opacity-100"
                        >
                            <MoreVertical className="size-4" />
                            <span className="sr-only">
                                {t('grid.actionsLabel')}
                            </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                data-test="location-edit-button"
                                onSelect={onEdit}
                            >
                                <Pencil className="size-4" /> {t('grid.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                data-test="location-delete-button"
                                variant="destructive"
                                onSelect={onDelete}
                            >
                                <Trash2 className="size-4" /> {t('grid.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="mt-5 space-y-3">
                <div className="flex items-start gap-2.5 text-sm">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span className="text-foreground/90">{address}</span>
                </div>
                {location.phone && (
                    <div className="flex items-center gap-2.5 text-sm font-medium">
                        <Phone className="size-4 shrink-0 text-muted-foreground" />
                        {location.phone}
                    </div>
                )}
            </div>

            <div className="mt-6 flex items-center justify-between pt-2">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span
                        className="flex items-center gap-1.5"
                        title={t('grid.servicesTitle', {
                            count: location.service_ids.length,
                        })}
                    >
                        <Gem className="size-4" />
                        {location.service_ids.length}
                    </span>
                    <span
                        className="flex items-center gap-1.5"
                        title={t('grid.specialistsTitle', {
                            count: location.user_ids.length,
                        })}
                    >
                        <IdCard className="size-4" />
                        {location.user_ids.length}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={onEdit}
                    data-test="location-open-button"
                    className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                    <ArrowRight className="size-4" />
                    <span className="sr-only">
                        {t('grid.openLabel', { name: location.name })}
                    </span>
                </button>
            </div>
        </div>
    );
}
