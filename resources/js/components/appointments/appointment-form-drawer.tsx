import { Form } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import AppointmentCustomerFields from '@/components/appointments/appointment-customer-fields';
import AppointmentServiceSelect from '@/components/appointments/appointment-service-select';
import AppointmentSlotPicker from '@/components/appointments/appointment-slot-picker';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useTranslation } from '@/hooks/use-translation';
import {
    getAvailableOptions,
    groupServicesByCategory,
    toDateInputValue,
} from '@/lib/appointments';
import { store, update } from '@/routes/appointments';
import type {
    Appointment,
    AppointmentLocationOption,
    AppointmentServiceOption,
    AppointmentSlot,
    AppointmentSpecialistOption,
} from '@/types';

export type SlotRequest = {
    serviceId: number;
    specialistId: number;
    date: string;
    appointmentId: number | null;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment: Appointment | null;
    teamSlug: string;
    timezone: string;
    services: AppointmentServiceOption[];
    locations: AppointmentLocationOption[];
    specialists: AppointmentSpecialistOption[];
    availableSlots: AppointmentSlot[];
    slotsLoading: boolean;
    onRequestSlots: (request: SlotRequest) => void;
};

export default function AppointmentFormDrawer({
    open,
    onOpenChange,
    appointment,
    teamSlug,
    timezone,
    services,
    locations,
    specialists,
    availableSlots,
    slotsLoading,
    onRequestSlots,
}: Props) {
    const { t } = useTranslation('appointments');
    const isEditing = appointment !== null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
            >
                <SheetHeader className="shrink-0 border-b">
                    <SheetTitle>
                        {isEditing
                            ? t('form.editTitle')
                            : t('form.newTitle')}
                    </SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? t('form.editDescription')
                            : t('form.newDescription')}
                    </SheetDescription>
                </SheetHeader>

                <AppointmentFormFields
                    key={appointment?.id ?? 'new'}
                    appointment={appointment}
                    teamSlug={teamSlug}
                    timezone={timezone}
                    services={services}
                    locations={locations}
                    specialists={specialists}
                    availableSlots={availableSlots}
                    slotsLoading={slotsLoading}
                    onRequestSlots={onRequestSlots}
                    onSuccess={() => onOpenChange(false)}
                    onCancel={() => onOpenChange(false)}
                />
            </SheetContent>
        </Sheet>
    );
}

type FieldsProps = {
    appointment: Appointment | null;
    teamSlug: string;
    timezone: string;
    services: AppointmentServiceOption[];
    locations: AppointmentLocationOption[];
    specialists: AppointmentSpecialistOption[];
    availableSlots: AppointmentSlot[];
    slotsLoading: boolean;
    onRequestSlots: (request: SlotRequest) => void;
    onSuccess: () => void;
    onCancel: () => void;
};

function AppointmentFormFields({
    appointment,
    teamSlug,
    timezone,
    services,
    locations,
    specialists,
    availableSlots,
    slotsLoading,
    onRequestSlots,
    onSuccess,
    onCancel,
}: FieldsProps) {
    const { t } = useTranslation('appointments');
    const isEditing = appointment !== null;
    const appointmentId = appointment?.id ?? null;

    const initialDate = useMemo(
        () =>
            appointment
                ? toDateInputValue(appointment.start_at, timezone)
                : '',
        [appointment, timezone],
    );

    const [serviceId, setServiceId] = useState<number | null>(
        appointment?.service_id ?? null,
    );
    const [locationId, setLocationId] = useState<number | null>(
        appointment?.location_id ?? null,
    );
    const [specialistId, setSpecialistId] = useState<number | null>(
        appointment?.specialist_id ?? null,
    );
    const [date, setDate] = useState(initialDate);
    const [selectedStart, setSelectedStart] = useState(
        appointment?.start_at ?? '',
    );

    const { availableServices, availableLocations, availableSpecialists } =
        useMemo(
            () =>
                getAvailableOptions(services, locations, specialists, {
                    serviceId,
                    locationId,
                    specialistId,
                }),
            [
                services,
                locations,
                specialists,
                serviceId,
                locationId,
                specialistId,
            ],
        );

    const serviceGroups = useMemo(
        () => groupServicesByCategory(availableServices),
        [availableServices],
    );

    const selectedService = useMemo(
        () => services.find((item) => item.id === serviceId) ?? null,
        [services, serviceId],
    );

    // Online services are not tied to a branch, so the location step is hidden.
    const showLocation = selectedService?.delivery_type !== 'online';

    const locationOptions = useMemo(
        () =>
            availableLocations.map((location) => ({
                value: location.id.toString(),
                label: location.name,
            })),
        [availableLocations],
    );

    const specialistOptions = useMemo(
        () =>
            availableSpecialists.map((specialist) => ({
                value: specialist.id.toString(),
                label: specialist.name,
            })),
        [availableSpecialists],
    );

    // Slots depend only on the specialist's work hours, the service duration
    // and the team timezone, so a location is not required to generate them.
    const selectionIncomplete = serviceId === null || specialistId === null;

    const requestSlots = (next: {
        serviceId: number | null;
        specialistId: number | null;
        date: string;
    }) => {
        setSelectedStart('');

        if (
            next.serviceId !== null &&
            next.specialistId !== null &&
            next.date !== ''
        ) {
            onRequestSlots({
                serviceId: next.serviceId,
                specialistId: next.specialistId,
                date: next.date,
                appointmentId,
            });
        }
    };

    const handleServiceChange = (value: string) => {
        const nextServiceId = Number(value);
        const service = services.find((item) => item.id === nextServiceId);

        let nextLocationId = locationId;
        let nextSpecialistId = specialistId;

        if (service) {
            if (
                nextLocationId !== null &&
                !service.location_ids.includes(nextLocationId)
            ) {
                nextLocationId = null;
            }

            if (
                nextSpecialistId !== null &&
                !service.specialist_ids.includes(nextSpecialistId)
            ) {
                nextSpecialistId = null;
            }
        }

        setServiceId(nextServiceId);
        setLocationId(nextLocationId);
        setSpecialistId(nextSpecialistId);
        requestSlots({
            serviceId: nextServiceId,
            specialistId: nextSpecialistId,
            date,
        });
    };

    const handleLocationChange = (value: string) => {
        const nextLocationId = Number(value);
        const location = locations.find((item) => item.id === nextLocationId);

        let nextServiceId = serviceId;
        let nextSpecialistId = specialistId;

        if (location) {
            if (
                nextServiceId !== null &&
                !location.service_ids.includes(nextServiceId)
            ) {
                nextServiceId = null;
            }

            if (
                nextSpecialistId !== null &&
                !location.specialist_ids.includes(nextSpecialistId)
            ) {
                nextSpecialistId = null;
            }
        }

        setLocationId(nextLocationId);
        setServiceId(nextServiceId);
        setSpecialistId(nextSpecialistId);
        requestSlots({
            serviceId: nextServiceId,
            specialistId: nextSpecialistId,
            date,
        });
    };

    const handleSpecialistChange = (value: string) => {
        const nextSpecialistId = Number(value);
        const specialist = specialists.find(
            (item) => item.id === nextSpecialistId,
        );

        let nextServiceId = serviceId;
        let nextLocationId = locationId;

        if (specialist) {
            if (
                nextServiceId !== null &&
                !specialist.service_ids.includes(nextServiceId)
            ) {
                nextServiceId = null;
            }

            if (
                nextLocationId !== null &&
                !specialist.location_ids.includes(nextLocationId)
            ) {
                nextLocationId = null;
            }
        }

        setSpecialistId(nextSpecialistId);
        setServiceId(nextServiceId);
        setLocationId(nextLocationId);
        requestSlots({
            serviceId: nextServiceId,
            specialistId: nextSpecialistId,
            date,
        });
    };

    const handleDateChange = (value: string) => {
        setDate(value);
        requestSlots({ serviceId, specialistId, date: value });
    };

    return (
        <Form
            {...(isEditing
                ? update.form([teamSlug, appointment.id])
                : store.form(teamSlug))}
            options={{ preserveScroll: true }}
            onSuccess={onSuccess}
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
                        value={specialistId ?? ''}
                    />
                    <input
                        type="hidden"
                        name="start_at"
                        value={selectedStart}
                    />

                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
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
                                data-test="appointment-service-select"
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
                                    onChange={handleLocationChange}
                                    placeholder={t('form.selectLocation')}
                                    searchPlaceholder={t('form.searchLocations')}
                                    emptyMessage={t('form.noLocations')}
                                    invalid={Boolean(errors.location_id)}
                                    data-test="appointment-location-select"
                                />
                                <InputError message={errors.location_id} />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="specialist_id">
                                {t('form.specialist')}
                            </Label>
                            <SearchableSelect
                                id="specialist_id"
                                options={specialistOptions}
                                value={specialistId?.toString() ?? ''}
                                onChange={handleSpecialistChange}
                                placeholder={t('form.selectSpecialist')}
                                searchPlaceholder={t('form.searchSpecialists')}
                                emptyMessage={t('form.noSpecialists')}
                                invalid={Boolean(errors.specialist_id)}
                                data-test="appointment-specialist-select"
                            />
                            <InputError message={errors.specialist_id} />
                        </div>

                        <AppointmentSlotPicker
                            date={date}
                            onDateChange={handleDateChange}
                            slots={availableSlots}
                            loading={slotsLoading}
                            selectedStart={selectedStart}
                            onSelectSlot={setSelectedStart}
                            selectionIncomplete={selectionIncomplete}
                            error={errors.start_at}
                        />

                        <AppointmentCustomerFields
                            appointment={appointment}
                            errors={errors}
                        />
                    </div>

                    <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                        >
                            {t('form.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            data-test="appointment-save-button"
                            disabled={processing || selectedStart === ''}
                        >
                            {isEditing
                                ? t('form.saveChanges')
                                : t('form.bookAppointment')}
                        </Button>
                    </SheetFooter>
                </>
            )}
        </Form>
    );
}
