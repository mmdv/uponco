import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import LocationFormFields from '@/components/locations/location-form-fields';
import LocationFormModal from '@/components/locations/location-form-modal';
import { Button } from '@/components/ui/button';
import { CheckboxCardGroup } from '@/components/ui/checkbox-card-group';
import type { Onboarding } from '@/types';

import OnboardingFooter from './onboarding-footer';
import OnboardingScreen, { ScreenFooterBar } from './onboarding-screen';
import ScreenHeader from './screen-header';

type Props = {
    data: Onboarding['services'];
    teamSlug: string;
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
    // select what it just created and move on.
    const [mode] = useState(
        props.data.locations.length === 0 ? 'create' : 'pick',
    );

    return mode === 'create' ? (
        <FirstLocation {...props} />
    ) : (
        <PickLocation {...props} />
    );
}

/** The empty state: creating the first location is the whole screen. */
function FirstLocation({
    data,
    teamSlug,
    onChange,
    onNext,
    specialistIds,
}: Props) {
    const { locations } = data;
    const [saved, setSaved] = useState(false);

    // Saving reloads the page props, so once the save succeeded whatever comes
    // back was created here: select it and move straight on.
    useEffect(() => {
        if (!saved || locations.length === 0) {
            return;
        }

        onChange(locations.map((location) => location.value));
        onNext();
    }, [saved, locations, onChange, onNext]);

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
            teamSlug={teamSlug}
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
function PickLocation({
    data,
    teamSlug,
    value,
    onChange,
    onNext,
    specialistIds,
}: Props) {
    const { locations } = data;

    const [modalOpen, setModalOpen] = useState(false);
    // Anything that appears while the modal is open was just created there, so
    // it is ticked automatically.
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

    const openModal = () => {
        knownIds.current = locations.map((location) => location.value);
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

            <CheckboxCardGroup
                options={locations}
                value={value}
                onChange={onChange}
                data-test="wizard-locations-select"
            />

            <Button
                type="button"
                variant="outline"
                onClick={openModal}
                data-test="wizard-add-location-button"
            >
                <Plus />
                Add another location
            </Button>

            <LocationFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                location={null}
                teamSlug={teamSlug}
                services={data.serviceOptions}
                specialists={data.specialists}
                countries={data.countries}
                showAssignments={false}
                defaultSpecialistIds={specialistIds}
            />
        </OnboardingScreen>
    );
}
