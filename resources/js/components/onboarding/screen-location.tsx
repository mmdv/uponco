import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import LocationFormFields from '@/components/locations/location-form-fields';
import LocationFormModal from '@/components/locations/location-form-modal';
import { Button } from '@/components/ui/button';
import type { Location, Onboarding } from '@/types';

import LocationSummaryCard from './location-summary-card';
import OnboardingFooter from './onboarding-footer';
import OnboardingScreen, { ScreenFooterBar } from './onboarding-screen';
import ScreenHeader from './screen-header';

type Props = {
    data: Onboarding['services'];
    value: string[];
    onChange: (value: string[]) => void;
    onNext: () => void;
    /**
     * The person setting the business up. Every location created here is
     * attached to them, so they show up as a specialist customers can book.
     */
    specialistIds: string[];
};

/**
 * Where the work happens. A brand new team has no locations, so the address
 * form is the screen itself; once one exists the screen becomes a picker.
 *
 * Services and specialists are left out of the form here — there is nothing to
 * assign yet, and the service being created is wired up on the next screen.
 */
export default function ScreenLocation(props: Props) {
    // Latched on arrival: saving the first location reloads the props, and
    // swapping to the picker mid-save would unmount the form before it can
    // show what it just created.
    const [mode] = useState(
        props.data.locations.length === 0 ? 'create' : 'pick',
    );

    return mode === 'create' ? (
        <FirstLocation {...props} />
    ) : (
        <PickLocation {...props} />
    );
}

/**
 * The empty state: creating the first location is the whole screen. Once it is
 * saved the form gives way to a summary card the user can review and edit,
 * rather than jumping straight to the next screen.
 */
function FirstLocation({ data, onChange, onNext, specialistIds }: Props) {
    const { locations, locationDetails } = data;
    const [saved, setSaved] = useState(false);
    const [editing, setEditing] = useState<Location | null>(null);

    // Saving reloads the page props; once the save succeeded and the created
    // location has come back, review it instead of the (now stale) form.
    const reviewing = saved && locationDetails.length > 0;

    if (reviewing) {
        return (
            <OnboardingScreen
                footer={
                    <OnboardingFooter
                        onClick={() => {
                            onChange(
                                locations.map((location) => location.value),
                            );
                            onNext();
                        }}
                    />
                }
            >
                <ScreenHeader
                    title="Where do you work?"
                    description="Review the address customers will come to, then continue."
                />

                <div className="space-y-4">
                    {locationDetails.map((location) => (
                        <LocationSummaryCard
                            key={location.id}
                            location={location}
                            countries={data.countries}
                            onEdit={() => setEditing(location)}
                        />
                    ))}
                </div>

                <LocationFormModal
                    open={editing !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setEditing(null);
                        }
                    }}
                    location={editing}
                    services={data.serviceOptions}
                    specialists={data.specialists}
                    countries={data.countries}
                    showAssignments={false}
                    defaultSpecialistIds={specialistIds}
                />
            </OnboardingScreen>
        );
    }

    return (
        <LocationFormFields
            inline
            heading={
                <ScreenHeader
                    title="Where do you work?"
                    description="Add the address customers will come to."
                />
            }
            showAssignments={false}
            defaultSpecialistIds={specialistIds}
            location={null}
            services={data.serviceOptions}
            specialists={data.specialists}
            countries={data.countries}
            onSuccess={() => setSaved(true)}
            footer={({ processing }) => (
                <ScreenFooterBar>
                    <OnboardingFooter saving={processing || saved} />
                </ScreenFooterBar>
            )}
        />
    );
}

/** The team already has locations, so this is a choice rather than a form. */
function PickLocation({ data, value, onChange, onNext, specialistIds }: Props) {
    const { locations, locationDetails } = data;

    // `editing` doubles as the modal's payload: null while adding a new
    // location, the target record while editing an existing one.
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Location | null>(null);

    // Anything that appears while the add modal is open was just created there,
    // so it is ticked automatically.
    const knownIds = useRef<string[] | null>(null);

    useEffect(() => {
        if (knownIds.current === null) {
            return;
        }

        const created = locations
            .map((location) => location.value)
            .filter((id) => !knownIds.current?.includes(id));

        if (created.length === 0) {
            return;
        }

        knownIds.current = null;
        onChange([...value, ...created]);
    }, [locations, value, onChange]);

    const toggle = (id: string, selected: boolean) => {
        onChange(
            selected ? [...value, id] : value.filter((item) => item !== id),
        );
    };

    const openAddModal = () => {
        knownIds.current = locations.map((location) => location.value);
        setEditing(null);
        setModalOpen(true);
    };

    const openEditModal = (location: Location) => {
        setEditing(location);
        setModalOpen(true);
    };

    return (
        <OnboardingScreen
            footer={
                <OnboardingFooter
                    disabled={value.length === 0}
                    onClick={onNext}
                />
            }
        >
            <ScreenHeader
                title="Where do you work?"
                description="Pick the places this service is offered at."
            />

            <div
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                data-test="wizard-locations-select"
            >
                {locationDetails.map((location) => (
                    <LocationSummaryCard
                        key={location.id}
                        location={location}
                        countries={data.countries}
                        selected={value.includes(String(location.id))}
                        onSelectedChange={(selected) =>
                            toggle(String(location.id), selected)
                        }
                        onEdit={() => openEditModal(location)}
                    />
                ))}
            </div>

            <Button
                type="button"
                variant="outline"
                onClick={openAddModal}
                data-test="wizard-add-location-button"
            >
                <Plus />
                Add another location
            </Button>

            <LocationFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                location={editing}
                services={data.serviceOptions}
                specialists={data.specialists}
                countries={data.countries}
                showAssignments={false}
                defaultSpecialistIds={specialistIds}
            />
        </OnboardingScreen>
    );
}
