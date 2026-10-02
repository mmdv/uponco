import { ArrowRight, Check, MapPin, RotateCcw, User } from 'lucide-react';
import { Fragment, useState } from 'react';
import type { ReactNode } from 'react';

import { useBooking } from '@/components/public-booking-v2/booking-context';
import ChoiceRow from '@/components/public-booking-v2/choice-row';
import ErrorAlert from '@/components/public-booking-v2/error-alert';
import LocationDetailsDialog from '@/components/public-booking-v2/location-details-dialog';
import LocationPicker from '@/components/public-booking-v2/location-picker';
import { useNextChoice } from '@/components/public-booking-v2/next-choice';
import type { PickerFilter } from '@/components/public-booking-v2/picker-parts';
import SelectionSheet from '@/components/public-booking-v2/selection-sheet';
import ServicePicker from '@/components/public-booking-v2/service-picker';
import SpecialistPicker from '@/components/public-booking-v2/specialist-picker';
import SpecialistProfileDialog from '@/components/public-booking-v2/specialist-profile-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from '@/hooks/use-translation';
import { nameInitials } from '@/lib/appointments';
import { buildMetaLabel } from '@/lib/booking';
import type { SelectionKind } from '@/lib/booking';
import { brandStyle } from '@/lib/brand';
import type {
    AppointmentLocationDetail,
    AppointmentSpecialistOption,
} from '@/types';

/**
 * Step one: the booking hub. Each of service / specialist / location is one
 * {@link ChoiceRow}; tapping a row opens a searchable {@link SelectionSheet},
 * and picking something slides the sheet on to the next choice still missing
 * (the hook's `openCard`), closing it once nothing is left.
 *
 * The vertical order comes from `order`, which puts whatever is already
 * settled at the top. See `cardOrder` in `@/lib/booking`.
 */
export default function StepSelection() {
    const {
        company,
        openCard,
        openPicker,
        clearSelection,
        clearAllSelections,
        autoFilled,
        serviceGroups,
        availableLocations,
        availableSpecialists,
        serviceId,
        locationId,
        specialistId,
        locationVisible,
        selectedService,
        selectedLocation,
        selectedSpecialist,
        locked,
        order,
        errors,
        clearErrors,
        handleServiceChange,
        handleLocationChange,
        handleSpecialistChange,
        serviceIcon: ServiceIcon,
    } = useBooking();
    const { t } = useTranslation('booking');
    const isMobile = useIsMobile();
    const [profileSpecialist, setProfileSpecialist] =
        useState<AppointmentSpecialistOption | null>(null);
    const [detailsLocation, setDetailsLocation] =
        useState<AppointmentLocationDetail | null>(null);
    // The last picker shown, kept while the sheet animates closed so its
    // content doesn't blank out mid-slide.
    const [shownCard, setShownCard] = useState<SelectionKind>(
        openCard ?? 'service',
    );

    if (openCard !== null && openCard !== shownCard) {
        setShownCard(openCard);
    }

    // A tap only selects: the shared hook would jump to the next missing card,
    // so the sheet is pinned back to this one and its footer button moves on.
    // A fresh choice also answers whatever the server rejected about the old.
    const choose =
        (kind: SelectionKind, handler: (id: number) => void) =>
        (id: number) => {
            clearErrors([`${kind}_id`]);
            handler(id);
            openPicker(kind);
        };
    const { missing, label: missingLabel } = useNextChoice();

    const selected = {
        service: selectedService,
        specialist: selectedSpecialist,
        location: selectedLocation,
    };
    // A kind only counts as settled once something is actually selected: a lone
    // location that isn't mandatory yet is locked but still unchosen.
    const settled = (kind: SelectionKind) =>
        locked[kind] && selected[kind] !== null;
    const onScreen = (kind: SelectionKind) =>
        kind !== 'location' || locationVisible;

    const titles: Record<SelectionKind, string> = {
        service: t('selection.serviceTitle'),
        specialist: t('selection.specialistTitle'),
        location: t('selection.locationTitle'),
    };
    const labels: Record<SelectionKind, string | undefined> = {
        service: selectedService?.title,
        specialist: selectedSpecialist?.name,
        location: selectedLocation?.name,
    };

    // The kinds the visitor actually gets to choose, in the order shown — the
    // sheet walks through these and draws them as its progress rail.
    const choosable = order.filter((kind) => onScreen(kind) && !settled(kind));
    const anythingToReset = choosable.some((kind) => selected[kind] !== null);

    /**
     * The other choices narrowing `kind`'s list, each removable in place. A
     * value picked for the visitor narrows nothing, so it gets no chip.
     */
    const filtersFor = (kind: SelectionKind): PickerFilter[] =>
        choosable
            .filter(
                (other) =>
                    other !== kind &&
                    labels[other] &&
                    !autoFilled.includes(other),
            )
            .map((other) => ({
                key: other,
                label: labels[other] as string,
                onRemove: () => clearSelection(other),
            }));

    const selectionError =
        errors.service_id ?? errors.specialist_id ?? errors.location_id;

    const sheetTitles: Record<SelectionKind, string> = {
        service: t('v2.picker.serviceTitle'),
        specialist: t('v2.picker.specialistTitle'),
        location: t('v2.picker.locationTitle'),
    };

    const pickers: Record<SelectionKind, ReactNode> = {
        service: (
            <ServicePicker
                groups={serviceGroups}
                selectedId={serviceId}
                onSelect={choose('service', handleServiceChange)}
                filters={filtersFor('service')}
                autoFocus={!isMobile}
            />
        ),
        specialist: (
            <SpecialistPicker
                specialists={availableSpecialists}
                selectedId={specialistId}
                serviceDuration={selectedService?.duration ?? null}
                onSelect={choose('specialist', handleSpecialistChange)}
                filters={filtersFor('specialist')}
                autoFocus={!isMobile}
            />
        ),
        location: (
            <LocationPicker
                locations={availableLocations}
                selectedId={locationId}
                onSelect={choose('location', handleLocationChange)}
                filters={filtersFor('location')}
                autoFocus={!isMobile}
            />
        ),
    };

    const rows: Record<SelectionKind, ReactNode> = {
        service: (
            <ChoiceRow
                icon={ServiceIcon}
                title={titles.service}
                hint={t('selection.serviceHint')}
                value={selectedService?.title}
                meta={
                    selectedService
                        ? [
                              selectedService.category_name,
                              buildMetaLabel(
                                  selectedService,
                                  selectedSpecialist,
                              ),
                          ]
                              .filter(Boolean)
                              .join(' · ')
                        : null
                }
                locked={settled('service')}
                invalid={Boolean(errors.service_id)}
                onOpen={() => openPicker('service')}
                onClear={() => clearSelection('service')}
                data-test={
                    settled('service')
                        ? 'booking-locked-service'
                        : 'booking-choice-service'
                }
            />
        ),
        specialist: (
            <ChoiceRow
                icon={User}
                title={titles.specialist}
                hint={t('selection.specialistHint')}
                value={selectedSpecialist?.name}
                meta={
                    selectedSpecialist?.job_title ??
                    (selectedSpecialist?.next_available
                        ? t('specialist.nextAvailable', {
                              label: selectedSpecialist.next_available.label,
                          })
                        : null)
                }
                media={
                    selectedSpecialist && (
                        <Avatar className="size-11">
                            {selectedSpecialist.avatar ? (
                                <AvatarImage
                                    src={selectedSpecialist.avatar}
                                    alt={selectedSpecialist.name}
                                    className="object-cover"
                                />
                            ) : null}
                            <AvatarFallback className="bg-primary text-sm font-medium text-primary-foreground">
                                {nameInitials(selectedSpecialist.name)}
                            </AvatarFallback>
                        </Avatar>
                    )
                }
                locked={settled('specialist')}
                invalid={Boolean(errors.specialist_id)}
                onOpen={() => openPicker('specialist')}
                onClear={() => clearSelection('specialist')}
                onShowDetails={
                    selectedSpecialist
                        ? () => setProfileSpecialist(selectedSpecialist)
                        : undefined
                }
                detailsLabel={
                    selectedSpecialist
                        ? t('selection.about', {
                              name: selectedSpecialist.name,
                          })
                        : undefined
                }
                data-test={
                    settled('specialist')
                        ? 'booking-locked-specialist'
                        : 'booking-choice-specialist'
                }
            />
        ),
        location: (
            <ChoiceRow
                icon={MapPin}
                title={titles.location}
                hint={t('selection.locationHint')}
                value={selectedLocation?.name}
                meta={selectedLocation?.address ?? selectedLocation?.city}
                locked={settled('location')}
                invalid={Boolean(errors.location_id)}
                onOpen={() => openPicker('location')}
                onClear={() => clearSelection('location')}
                onShowDetails={
                    selectedLocation
                        ? () => setDetailsLocation(selectedLocation)
                        : undefined
                }
                detailsLabel={
                    selectedLocation
                        ? t('selection.about', { name: selectedLocation.name })
                        : undefined
                }
                data-test={
                    settled('location')
                        ? 'booking-locked-location'
                        : 'booking-choice-location'
                }
            />
        ),
    };

    return (
        <div className="space-y-3">
            {selectionError && (
                <ErrorAlert
                    title={t('v2.errors.title')}
                    data-test="booking-selection-error"
                >
                    {t('v2.errors.selection')}
                </ErrorAlert>
            )}

            {order.filter(onScreen).map((kind, index) => (
                <div
                    key={kind}
                    className="motion-safe:animate-rise-in"
                    style={{ animationDelay: `${index * 60}ms` }}
                >
                    {rows[kind]}
                </div>
            ))}

            {anythingToReset && (
                <Button
                    type="button"
                    variant="secondary"
                    onClick={clearAllSelections}
                    data-test="booking-start-over"
                    className="h-11 w-full animate-in text-muted-foreground duration-300 fade-in-0 hover:text-foreground"
                >
                    <RotateCcw className="size-4" />
                    {t('v2.hub.startOver')}
                </Button>
            )}

            <SelectionSheet
                open={openCard !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        openPicker(null);
                    }
                }}
                title={sheetTitles[shownCard]}
                contentKey={shownCard}
                steps={choosable.map((kind) => ({
                    key: kind,
                    label: titles[kind],
                    done: selected[kind] !== null,
                }))}
                style={brandStyle(company.brand)}
                footer={
                    <Button
                        type="button"
                        className="h-12 w-full text-base"
                        // Nothing to move on to until this choice is made.
                        disabled={selected[shownCard] === null}
                        onClick={() =>
                            openPicker(
                                missing !== null && missing !== shownCard
                                    ? missing
                                    : null,
                            )
                        }
                        data-test="booking-picker-continue"
                    >
                        {missing === null ? (
                            <>
                                <Check className="size-4" />
                                {t('v2.picker.done')}
                            </>
                        ) : (
                            <>
                                {missingLabel}
                                <ArrowRight className="size-4" />
                            </>
                        )}
                    </Button>
                }
            >
                <Fragment key={shownCard}>{pickers[shownCard]}</Fragment>
            </SelectionSheet>

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
