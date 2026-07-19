import AppointmentFormDrawer from '@/components/appointments/appointment-form-drawer';
import type { SlotRequest } from '@/components/appointments/appointment-form-drawer';
import CustomerFormDialog from '@/components/customers/customer-form-dialog';
import LocationFormModal from '@/components/locations/location-form-modal';
import ServiceWizardDialog from '@/components/services/service-wizard/service-wizard-dialog';
import type { AppointmentSlot, DashboardFormOptions } from '@/types';

export type QuickCreateForm =
    | 'appointment'
    | 'customer'
    | 'service'
    | 'location';

type Props = {
    open: QuickCreateForm | null;
    onOpenChange: (form: QuickCreateForm, open: boolean) => void;
    options: DashboardFormOptions;
    teamSlug: string;
    timezone: string;
    availableSlots: AppointmentSlot[];
    slotsLoading: boolean;
    onRequestSlots: (request: SlotRequest) => void;
};

/**
 * Hosts the four quick-create drawers/dialog reused from their feature areas.
 * Each renders in "create" mode (null record) and closes on success.
 */
export default function QuickCreateForms({
    open,
    onOpenChange,
    options,
    teamSlug,
    timezone,
    availableSlots,
    slotsLoading,
    onRequestSlots,
}: Props) {
    return (
        <>
            <AppointmentFormDrawer
                open={open === 'appointment'}
                onOpenChange={(next) => onOpenChange('appointment', next)}
                appointment={null}
                teamSlug={teamSlug}
                timezone={timezone}
                services={options.appointments.services}
                locations={options.appointments.locations}
                specialists={options.appointments.specialists}
                availableSlots={availableSlots}
                slotsLoading={slotsLoading}
                onRequestSlots={onRequestSlots}
            />

            <CustomerFormDialog
                open={open === 'customer'}
                onOpenChange={(next) => onOpenChange('customer', next)}
                customer={null}
                teamSlug={teamSlug}
            />

            <ServiceWizardDialog
                open={open === 'service'}
                onOpenChange={(next) => onOpenChange('service', next)}
                defaultCategoryId={null}
                teamSlug={teamSlug}
                categories={options.services.categories}
                locations={options.services.locations}
                serviceOptions={options.services.services}
                specialists={options.services.specialists}
                countries={options.services.countries}
                priceTypes={options.services.priceTypes}
                currencies={options.services.currencies}
                serviceTypes={options.services.serviceTypes}
                google={options.services.google}
            />

            <LocationFormModal
                open={open === 'location'}
                onOpenChange={(next) => onOpenChange('location', next)}
                location={null}
                teamSlug={teamSlug}
                services={options.locations.services}
                specialists={options.locations.specialists}
                countries={options.locations.countries}
            />
        </>
    );
}
