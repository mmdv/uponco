import { Form } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import AppointmentCustomerFields from '@/components/appointments/appointment-customer-fields';
import AppointmentServiceSelect from '@/components/appointments/appointment-service-select';
import DurationStepper from '@/components/appointments/duration-stepper';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useTranslation } from '@/hooks/use-translation';
import {
    getAvailableOptions,
    groupServicesByCategory,
} from '@/lib/appointments';
import { wallTimeToUtcIso } from '@/lib/calendar-grid';
import { dayStore } from '@/routes/appointments';
import type {
    Appointment,
    AppointmentLocationOption,
    AppointmentServiceOption,
    AppointmentSpecialistOption,
} from '@/types';

type FieldsProps = {
    specialist: AppointmentSpecialistOption;
    startIso: string;
    timezone: string;
    services: AppointmentServiceOption[];
    locations: AppointmentLocationOption[];
    onSuccess: () => void;
    onCancel: () => void;
    onOptimisticAdd: (appointment: Appointment) => void;
    onOptimisticRemove: (tempId: number) => void;
};

// Temporary, always-negative ids for optimistic appointments, so they never
// collide with real server ids and are trivial to identify and roll back.
let temporaryIdSequence = -1;

function nextTemporaryId(): number {
    return temporaryIdSequence--;
}

/**
 * The `YYYY-MM-DD` day of an instant in the given timezone.
 */
function zonedDayKey(iso: string, timezone: string): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(iso));
}

/**
 * The wall-clock time (`HH:MM`, 24h) of an instant in the given timezone.
 */
function zonedTime(iso: string, timezone: string): string {
    return new Intl.DateTimeFormat('en-GB', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(new Date(iso));
}

export default function AppointmentDayFormFields({
    specialist,
    startIso,
    timezone,
    services,
    locations,
    onSuccess,
    onCancel,
    onOptimisticAdd,
    onOptimisticRemove,
}: FieldsProps) {
    const { t } = useTranslation('appointments');

    // The temp id of the optimistic appointment for the in-flight submit, so it
    // can be rolled back on failure.
    const pendingTempId = useRef<number | null>(null);

    const dayKey = useMemo(
        () => zonedDayKey(startIso, timezone),
        [startIso, timezone],
    );

    // Only individual services the specialist offers can be quick-booked here.
    const specialistServices = useMemo(
        () =>
            services.filter(
                (service) =>
                    service.service_type === 'individual' &&
                    specialist.service_ids.includes(service.id),
            ),
        [services, specialist],
    );

    const [serviceId, setServiceId] = useState<number | null>(null);
    const [locationId, setLocationId] = useState<number | null>(null);
    const [duration, setDuration] = useState<number>(30);
    // The start time is freely chosen; it defaults to the clicked slot's time.
    const [startTime, setStartTime] = useState<string>(() =>
        zonedTime(startIso, timezone),
    );

    const { availableServices, availableLocations } = useMemo(
        () =>
            getAvailableOptions(specialistServices, locations, [specialist], {
                serviceId,
                locationId,
                specialistId: specialist.id,
            }),
        [specialistServices, locations, specialist, serviceId, locationId],
    );

    const serviceGroups = useMemo(
        () => groupServicesByCategory(availableServices),
        [availableServices],
    );

    const selectedService = useMemo(
        () => services.find((service) => service.id === serviceId) ?? null,
        [services, serviceId],
    );

    // Online services aren't tied to a branch, so the location step is hidden.
    const showLocation = selectedService?.delivery_type !== 'online';

    const locationOptions = useMemo(
        () =>
            availableLocations.map((location) => ({
                value: location.id.toString(),
                label: location.name,
            })),
        [availableLocations],
    );

    /** Effective duration for the specialist, falling back to the service default. */
    const durationFor = (service: AppointmentServiceOption): number =>
        specialist.service_durations[String(service.id)] ?? service.duration;

    const handleServiceChange = (value: string) => {
        const nextId = Number(value);
        const service = services.find((item) => item.id === nextId);

        setServiceId(nextId);

        // Drop a location that the newly chosen service isn't offered at.
        if (
            service &&
            locationId !== null &&
            !service.location_ids.includes(locationId)
        ) {
            setLocationId(null);
        }

        if (service) {
            setDuration(durationFor(service));
        }
    };

    // `HH:MM` → minutes from midnight → the matching UTC instant on the day.
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const startAtIso = wallTimeToUtcIso(dayKey, startMinutes, timezone);

    const canSubmit =
        serviceId !== null &&
        (!showLocation || locationId !== null) &&
        startTime !== '' &&
        duration >= 15;

    /**
     * A stand-in appointment for the grid, shown the instant the form submits.
     * The day block only renders the time, service title and specialist, so the
     * customer is left blank here — the server's real record replaces it.
     */
    const buildOptimisticAppointment = (tempId: number): Appointment => ({
        id: tempId,
        start_at: startAtIso,
        end_at: wallTimeToUtcIso(dayKey, startMinutes + duration, timezone),
        timezone,
        notes: null,
        service: {
            id: serviceId as number,
            title: selectedService?.title ?? '',
        },
        location:
            locationId !== null
                ? {
                      id: locationId,
                      name:
                          locations.find((item) => item.id === locationId)
                              ?.name ?? '',
                  }
                : null,
        specialist: { id: specialist.id, name: specialist.name },
        customer: { id: null, name: '', email: null, phone: null },
        service_id: serviceId as number,
        location_id: locationId,
        specialist_id: specialist.id,
    });

    return (
        <Form
            {...dayStore.form()}
            // Partial reload, like reschedule: only `appointments` refreshes, so
            // the working-hours columns and the grid's scroll position are kept.
            options={{
                only: ['appointments'],
                preserveScroll: true,
                preserveState: true,
            }}
            onBefore={() => {
                const tempId = nextTemporaryId();
                pendingTempId.current = tempId;
                onOptimisticAdd(buildOptimisticAppointment(tempId));
            }}
            onError={() => {
                if (pendingTempId.current !== null) {
                    onOptimisticRemove(pendingTempId.current);
                    pendingTempId.current = null;
                }

                toast.error(t('toast.createError'));
            }}
            onSuccess={() => {
                pendingTempId.current = null;
                onSuccess();
            }}
            className="flex min-h-0 flex-1 flex-col"
            disableWhileProcessing
        >
            {({ errors, processing }) => (
                <>
                    <input
                        type="hidden"
                        name="service_id"
                        value={serviceId ?? ''}
                    />
                    <input
                        type="hidden"
                        name="location_id"
                        value={locationId ?? ''}
                    />
                    <input
                        type="hidden"
                        name="specialist_id"
                        value={specialist.id}
                    />
                    <input type="hidden" name="start_at" value={startAtIso} />
                    <input type="hidden" name="duration" value={duration} />

                    <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                        <div className="grid gap-5 md:grid-cols-2 md:items-start md:gap-6">
                            <div className="space-y-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="service_id">
                                        {t('form.service')}
                                    </Label>
                                    <AppointmentServiceSelect
                                        id="service_id"
                                        groups={serviceGroups}
                                        value={serviceId?.toString() ?? ''}
                                        onChange={handleServiceChange}
                                        invalid={Boolean(errors.service_id)}
                                        data-test="day-appointment-service-select"
                                    />
                                    <InputError message={errors.service_id} />
                                </div>

                                {showLocation && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="location_id">
                                            {t('form.location')}
                                        </Label>
                                        <SearchableSelect
                                            id="location_id"
                                            options={locationOptions}
                                            value={locationId?.toString() ?? ''}
                                            onChange={(value) =>
                                                setLocationId(Number(value))
                                            }
                                            placeholder={t(
                                                'form.selectLocation',
                                            )}
                                            searchPlaceholder={t(
                                                'form.searchLocations',
                                            )}
                                            emptyMessage={t('form.noLocations')}
                                            invalid={Boolean(
                                                errors.location_id,
                                            )}
                                            data-test="day-appointment-location-select"
                                        />
                                        <InputError
                                            message={errors.location_id}
                                        />
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="start_time">
                                        {t('dayForm.startLabel')}
                                    </Label>
                                    <Input
                                        id="start_time"
                                        type="time"
                                        value={startTime}
                                        onChange={(event) =>
                                            setStartTime(event.target.value)
                                        }
                                        aria-invalid={Boolean(errors.start_at)}
                                        data-test="day-appointment-start"
                                    />
                                    <InputError message={errors.start_at} />
                                </div>

                                {serviceId !== null && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="duration">
                                            {t('dayForm.durationLabel')}
                                        </Label>
                                        <DurationStepper
                                            id="duration"
                                            value={duration}
                                            onChange={setDuration}
                                            invalid={Boolean(errors.duration)}
                                        />
                                        <InputError message={errors.duration} />
                                    </div>
                                )}
                            </div>

                            <AppointmentCustomerFields
                                appointment={null}
                                errors={errors}
                            />
                        </div>
                    </div>

                    <DialogFooter className="shrink-0 flex-row items-center justify-end gap-2 border-t px-4 py-4 sm:px-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                        >
                            {t('form.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            data-test="day-appointment-save-button"
                            disabled={processing || !canSubmit}
                        >
                            {t('dayForm.submit')}
                        </Button>
                    </DialogFooter>
                </>
            )}
        </Form>
    );
}
