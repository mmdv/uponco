import { Check } from 'lucide-react';

import PhotoPlaceholder from '@/components/public-booking/photo-placeholder';
import { formatDuration, formatServicePrice } from '@/lib/appointments';
import type { ServiceCategoryGroup } from '@/lib/appointments';
import { cn } from '@/lib/utils';

type Props = {
    groups: ServiceCategoryGroup[];
    selectedId: number | null;
    onSelect: (serviceId: number) => void;
};

/**
 * The list of bookable services, grouped under their category headings.
 *
 * Categories are optional: the uncategorized group comes first and renders as a
 * plain list, so a business without categories just sees its services.
 */
export default function ServicePicker({ groups, selectedId, onSelect }: Props) {
    if (groups.length === 0) {
        return (
            <p className="px-1 py-6 text-center text-sm text-muted-foreground">
                No services available.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {groups.map((group) => (
                <div key={group.id ?? 'uncategorized'} className="space-y-2">
                    {group.name !== null && (
                        <p className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            {group.name}
                        </p>
                    )}

                    <div className="space-y-2">
                        {group.services.map((service) => {
                            const isSelected = service.id === selectedId;
                            const price = formatServicePrice(service);

                            return (
                                <button
                                    key={service.id}
                                    type="button"
                                    onClick={() => onSelect(service.id)}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all duration-200',
                                        isSelected
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/40',
                                    )}
                                >
                                    <PhotoPlaceholder className="size-14 shrink-0 rounded-lg" />

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {service.title}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {formatDuration(service.duration)}
                                            {price && ` · ${price}`}
                                        </p>
                                        {service.description && (
                                            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/80">
                                                {service.description}
                                            </p>
                                        )}
                                    </div>

                                    <span
                                        className={cn(
                                            'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                                            isSelected
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-muted-foreground/30',
                                        )}
                                    >
                                        {isSelected && (
                                            <Check className="size-3" />
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
