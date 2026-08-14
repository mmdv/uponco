import { MapPin, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Fragment, useState } from 'react';
import type { ReactNode } from 'react';

import ExpandableCard from '@/components/public-booking/expandable-card';
import LocationDetails from '@/components/public-booking/location-details';
import LocationDetailsDialog from '@/components/public-booking/location-details-dialog';
import LocationPicker from '@/components/public-booking/location-picker';
import LockedRow from '@/components/public-booking/locked-row';
import ServicePicker from '@/components/public-booking/service-picker';
import SpecialistPicker from '@/components/public-booking/specialist-picker';
import SpecialistProfileDialog from '@/components/public-booking/specialist-profile-dialog';
import type { ServiceCategoryGroup } from '@/lib/appointments';
import type { EntryCard, SelectionKind } from '@/lib/booking';
import type { LockedKinds } from '@/lib/booking';
import type {
    AppointmentLocationDetail,
    AppointmentServiceOption,
    AppointmentSpecialistOption,
} from '@/types';

type Props = {
    openCard: EntryCard;
    onToggle: (card: Exclude<EntryCard, null>) => void;
    serviceGroups: ServiceCategoryGroup[];
    locations: AppointmentLocationDetail[];
    specialists: AppointmentSpecialistOption[];
    serviceId: number | null;
    locationId: number | null;
    specialistId: number | null;
    /** Whether the location card belongs on screen at all. */
    locationVisible: boolean;
    selectedService: AppointmentServiceOption | null;
    selectedLocation: AppointmentLocationDetail | null;
    selectedSpecialist: AppointmentSpecialistOption | null;
    /** Which kinds the visitor cannot change — rendered as statements, not pickers. */
    locked: LockedKinds;
    /** The order to stack the three sections in, settled ones first. */
    order: SelectionKind[];
    onServiceChange: (value: number) => void;
    onLocationChange: (value: number) => void;
    onSpecialistChange: (value: number) => void;
    /** The business category's icon, so a vet clinic isn't fronted by scissors. */
    serviceIcon: LucideIcon;
};

/**
 * Step one: the interdependent service / specialist / location entry sections.
 *
 * Anything with a single possible answer (or pinned by a deep link) is already
 * decided and shown as a {@link LockedRow} instead of a picker — when all three
 * are, this step is a recap of a booking the visitor never had to assemble.
 *
 * The vertical order is not fixed; it comes in as `order`, which puts whatever
 * is already settled at the top. See `cardOrder` in `@/lib/booking`.
 */
export default function StepSelection({
    openCard,
    onToggle,
    serviceGroups,
    locations,
    specialists,
    serviceId,
    locationId,
    specialistId,
    locationVisible,
    selectedService,
    selectedLocation,
    selectedSpecialist,
    locked,
    order,
    onServiceChange,
    onLocationChange,
    onSpecialistChange,
    serviceIcon: ServiceIcon,
}: Props) {
    const [profileSpecialist, setProfileSpecialist] =
        useState<AppointmentSpecialistOption | null>(null);
    const [detailsLocation, setDetailsLocation] =
        useState<AppointmentLocationDetail | null>(null);

    // A kind only counts as settled once something is actually selected: a lone
    // location that isn't mandatory yet is locked but still unchosen.
    const serviceSettled = locked.service && selectedService !== null;
    const specialistSettled = locked.specialist && selectedSpecialist !== null;
    const locationSettled = locked.location && selectedLocation !== null;

    // Each section built once, then emitted in whatever order the page decided
    // — see `cardOrder`. Keyed so React moves the nodes rather than remounting
    // them, which would close an open card as the order shifts under it.
    const sections: Record<SelectionKind, ReactNode> = {
        specialist: specialistSettled ? (
            <LockedRow
                icon={User}
                title="Specialist"
                value={selectedSpecialist.name}
                onShowDetails={() => setProfileSpecialist(selectedSpecialist)}
                detailsLabel={`About ${selectedSpecialist.name}`}
                data-test="booking-locked-specialist"
            />
        ) : (
            <ExpandableCard
                icon={User}
                title="Specialist"
                hint="Choose who you'll see"
                selectedLabel={selectedSpecialist?.name}
                open={openCard === 'specialist'}
                onToggle={() => onToggle('specialist')}
            >
                <SpecialistPicker
                    specialists={specialists}
                    selectedId={specialistId}
                    serviceDuration={selectedService?.duration ?? null}
                    onSelect={onSpecialistChange}
                />
            </ExpandableCard>
        ),

        location: !locationVisible ? null : locationSettled ? (
            <LockedRow
                icon={MapPin}
                title="Location"
                value={selectedLocation.name}
                onShowDetails={() => setDetailsLocation(selectedLocation)}
                detailsLabel={`About ${selectedLocation.name}`}
                data-test="booking-locked-location"
            >
                <LocationDetails
                    location={selectedLocation}
                    compact
                    className="text-xs"
                />
            </LockedRow>
        ) : (
            <ExpandableCard
                icon={MapPin}
                title="Location"
                hint="Pick where to visit"
                selectedLabel={selectedLocation?.name}
                open={openCard === 'location'}
                onToggle={() => onToggle('location')}
            >
                <LocationPicker
                    locations={locations}
                    selectedId={locationId}
                    onSelect={onLocationChange}
                />
            </ExpandableCard>
        ),

        service: serviceSettled ? (
            <LockedRow
                icon={ServiceIcon}
                title="Service"
                value={selectedService.title}
                data-test="booking-locked-service"
            />
        ) : (
            <ExpandableCard
                icon={ServiceIcon}
                title="Service"
                hint="Choose a treatment"
                selectedLabel={selectedService?.title}
                open={openCard === 'service'}
                onToggle={() => onToggle('service')}
            >
                <ServicePicker
                    groups={serviceGroups}
                    selectedId={serviceId}
                    onSelect={onServiceChange}
                />
            </ExpandableCard>
        ),
    };

    return (
        <div className="space-y-3">
            {order.map((kind) => (
                <Fragment key={kind}>{sections[kind]}</Fragment>
            ))}

            <SpecialistProfileDialog
                specialist={profileSpecialist}
                onClose={() => setProfileSpecialist(null)}
            />

            <LocationDetailsDialog
                location={detailsLocation}
                onClose={() => setDetailsLocation(null)}
            />
        </div>
    );
}
