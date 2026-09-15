import { MapPin, User } from 'lucide-react';
import { Fragment, useState } from 'react';
import type { ReactNode } from 'react';

import { useBooking } from '@/components/public-booking/booking-context';
import ExpandableCard from '@/components/public-booking/expandable-card';
import LocationDetails from '@/components/public-booking/location-details';
import LocationDetailsDialog from '@/components/public-booking/location-details-dialog';
import LocationPicker from '@/components/public-booking/location-picker';
import LockedRow from '@/components/public-booking/locked-row';
import ServicePicker from '@/components/public-booking/service-picker';
import SpecialistPicker from '@/components/public-booking/specialist-picker';
import SpecialistProfileDialog from '@/components/public-booking/specialist-profile-dialog';
import { useTranslation } from '@/hooks/use-translation';
import type { SelectionKind } from '@/lib/booking';
import type {
    AppointmentLocationDetail,
    AppointmentSpecialistOption,
} from '@/types';

/**
 * Step one: the interdependent service / specialist / location entry sections.
 *
 * Anything with a single possible answer (or pinned by a deep link) is already
 * decided and shown as a {@link LockedRow} instead of a picker — when all three
 * are, this step is a recap of a booking the visitor never had to assemble.
 *
 * The vertical order is not fixed; it comes from `order`, which puts whatever
 * is already settled at the top. See `cardOrder` in `@/lib/booking`.
 */
export default function StepSelection() {
    const {
        openCard,
        toggleCard: onToggle,
        serviceGroups,
        availableLocations: locations,
        availableSpecialists: specialists,
        serviceId,
        locationId,
        specialistId,
        locationVisible,
        selectedService,
        selectedLocation,
        selectedSpecialist,
        locked,
        order,
        handleServiceChange: onServiceChange,
        handleLocationChange: onLocationChange,
        handleSpecialistChange: onSpecialistChange,
        serviceIcon: ServiceIcon,
    } = useBooking();
    const { t } = useTranslation('booking');
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
                title={t('selection.specialistTitle')}
                value={selectedSpecialist.name}
                onShowDetails={() => setProfileSpecialist(selectedSpecialist)}
                detailsLabel={t('selection.about', {
                    name: selectedSpecialist.name,
                })}
                data-test="booking-locked-specialist"
            />
        ) : (
            <ExpandableCard
                icon={User}
                title={t('selection.specialistTitle')}
                hint={t('selection.specialistHint')}
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
                title={t('selection.locationTitle')}
                value={selectedLocation.name}
                onShowDetails={() => setDetailsLocation(selectedLocation)}
                detailsLabel={t('selection.about', {
                    name: selectedLocation.name,
                })}
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
                title={t('selection.locationTitle')}
                hint={t('selection.locationHint')}
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
                title={t('selection.serviceTitle')}
                value={selectedService.title}
                data-test="booking-locked-service"
            />
        ) : (
            <ExpandableCard
                icon={ServiceIcon}
                title={t('selection.serviceTitle')}
                hint={t('selection.serviceHint')}
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
