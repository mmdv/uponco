import { MapPin, Scissors, User } from 'lucide-react';

import ExpandableCard from '@/components/public-booking/expandable-card';
import LocationPicker from '@/components/public-booking/location-picker';
import ServicePicker from '@/components/public-booking/service-picker';
import SpecialistPicker from '@/components/public-booking/specialist-picker';
import type { EntryCard } from '@/hooks/use-appointment-booking';
import type { ServiceCategoryGroup } from '@/lib/appointments';
import type {
    AppointmentLocationOption,
    AppointmentServiceOption,
    AppointmentSpecialistOption,
} from '@/types';

type Props = {
    openCard: EntryCard;
    onToggle: (card: Exclude<EntryCard, null>) => void;
    serviceGroups: ServiceCategoryGroup[];
    locations: AppointmentLocationOption[];
    specialists: AppointmentSpecialistOption[];
    serviceId: number | null;
    locationId: number | null;
    specialistId: number | null;
    requiresLocation: boolean;
    selectedService: AppointmentServiceOption | null;
    selectedLocation: AppointmentLocationOption | null;
    selectedSpecialist: AppointmentSpecialistOption | null;
    onServiceChange: (value: number) => void;
    onLocationChange: (value: number) => void;
    onSpecialistChange: (value: number) => void;
};

/**
 * Step one: the interdependent service / specialist / location entry cards.
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
    requiresLocation,
    selectedService,
    selectedLocation,
    selectedSpecialist,
    onServiceChange,
    onLocationChange,
    onSpecialistChange,
}: Props) {
    return (
        <div className="space-y-3">
            <ExpandableCard
                icon={Scissors}
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

            {requiresLocation && (
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
            )}
        </div>
    );
}
