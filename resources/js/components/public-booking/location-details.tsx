import { MapPin, Navigation, Phone } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { AppointmentLocationDetail } from '@/types';

type Props = {
    location: AppointmentLocationDetail;
    /** Drops the leading address icon, for use inside an already-iconed row. */
    compact?: boolean;
    className?: string;
};

/**
 * Everything the visitor needs to actually turn up: the postal address, a
 * phone number to call ahead, and a link into their maps app.
 *
 * The address is often the only thing distinguishing two branches with similar
 * names, so it is shown while choosing as well as after — not hidden behind a
 * dialog the way the specialist bio is.
 */
export default function LocationDetails({
    location,
    compact = false,
    className,
}: Props) {
    const address = location.address ?? location.city;

    if (!address && !location.phone && !location.directions_url) {
        return null;
    }

    return (
        <div className={cn('space-y-1.5 text-sm', className)}>
            {address && (
                <p className="flex items-start gap-2 text-muted-foreground">
                    {!compact && <MapPin className="mt-0.5 size-4 shrink-0" />}
                    <span>{address}</span>
                </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {location.phone && (
                    <a
                        href={`tel:${location.phone.replace(/\s+/g, '')}`}
                        className="flex items-center gap-1.5 font-medium text-primary hover:underline"
                        onClick={(event) => event.stopPropagation()}
                        data-test={`booking-location-phone-${location.id}`}
                    >
                        <Phone className="size-3.5" />
                        {location.phone}
                    </a>
                )}

                {location.directions_url && (
                    <a
                        href={location.directions_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center gap-1.5 font-medium text-primary hover:underline"
                        onClick={(event) => event.stopPropagation()}
                        data-test={`booking-location-directions-${location.id}`}
                    >
                        <Navigation className="size-3.5" />
                        Get directions
                    </a>
                )}
            </div>
        </div>
    );
}
