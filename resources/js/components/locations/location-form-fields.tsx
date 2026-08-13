import { Form } from '@inertiajs/react';
import { useState } from 'react';

import {
    AddressSection,
    AssignmentsSection,
    DetailsSection,
} from '@/components/locations/location-form-sections';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { store, update } from '@/routes/company/locations';
import type { Location, SelectOption } from '@/types';

export type LocationFormFieldsProps = {
    location: Location | null;
    services: SelectOption[];
    specialists: SelectOption[];
    countries: SelectOption[];
    onSuccess: () => void;
    /** When omitted, no cancel button is rendered. */
    onCancel?: () => void;
    /**
     * Off when the surrounding flow owns those relationships — during
     * onboarding there is nothing to assign yet.
     */
    showAssignments?: boolean;
    /**
     * Specialist ids to attach when creating a location. Used when the
     * assignments UI is hidden (onboarding) but the location must still be
     * connected to someone — the person setting the business up. Ignored when
     * editing, which keeps the location's own assignments.
     */
    defaultSpecialistIds?: string[];
    /**
     * Drops the dialog chrome (scroll container and footer bar) so the fields
     * sit straight on the page. The caller then owns the submit button, which
     * it supplies through `footer` so the button stays inside the form.
     */
    inline?: boolean;
    /**
     * Inline only: content rendered at the top of the scroll region, inside the
     * form. Keeping the screen's heading here means the form can own the full
     * height, so its sticky footer stays pinned to the bottom while scrolling.
     */
    heading?: React.ReactNode;
    footer?: (state: { processing: boolean }) => React.ReactNode;
};

export default function LocationFormFields({
    location,
    services,
    specialists,
    countries,
    onSuccess,
    onCancel,
    showAssignments = true,
    defaultSpecialistIds = [],
    inline = false,
    heading,
    footer,
}: LocationFormFieldsProps) {
    const { t } = useTranslation('locations');
    const isEditing = location !== null;

    const [isActive, setIsActive] = useState(location?.is_active ?? true);
    const [name, setName] = useState(location?.name ?? '');
    const [country, setCountry] = useState(location?.country ?? '');
    const [city, setCity] = useState(location?.city ?? '');
    const [streetAddress, setStreetAddress] = useState(
        location?.street_address ?? '',
    );
    const [postalCode, setPostalCode] = useState(location?.postal_code ?? '');

    // Set only when an address is picked from Google Places. These are what
    // make the directions in appointment emails resolve exactly, so they are
    // cleared the moment the operator edits the address by hand.
    const [place, setPlace] = useState({
        place_id: location?.place_id ?? '',
        formatted_address: location?.formatted_address ?? '',
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
    });

    const [serviceIds, setServiceIds] = useState<string[]>(
        location?.service_ids.map((id) => id.toString()) ?? [],
    );
    const [specialistIds, setSpecialistIds] = useState<string[]>(
        location?.user_ids.map((id) => id.toString()) ?? defaultSpecialistIds,
    );

    return (
        <Form
            {...(isEditing ? update.form([location.id]) : store.form())}
            // The modal can be opened from inside another flow (the service
            // wizard), so the page must not remount and drop that flow's state.
            options={{ preserveScroll: true, preserveState: true }}
            onSuccess={onSuccess}
            // Enter inside a field must not submit: on mobile the keyboard's
            // "Go"/"Okay" key would otherwise skip the screen. Only the footer
            // button submits. Textareas keep their normal newline behaviour.
            onKeyDown={(event) => {
                if (
                    event.key === 'Enter' &&
                    event.target instanceof HTMLElement &&
                    event.target.tagName === 'INPUT'
                ) {
                    event.preventDefault();
                }
            }}
            className={cn(
                'flex flex-col',
                inline ? 'min-h-full flex-1' : 'min-h-0 flex-1',
            )}
            disableWhileProcessing
        >
            {({ errors, processing }) => (
                <>
                    <input
                        type="hidden"
                        name="is_active"
                        value={isActive ? '1' : '0'}
                    />
                    <input type="hidden" name="country" value={country} />
                    <input
                        type="hidden"
                        name="place_id"
                        value={place.place_id}
                    />
                    <input
                        type="hidden"
                        name="formatted_address"
                        value={place.formatted_address}
                    />
                    <input
                        type="hidden"
                        name="latitude"
                        value={place.latitude ?? ''}
                    />
                    <input
                        type="hidden"
                        name="longitude"
                        value={place.longitude ?? ''}
                    />
                    {serviceIds.map((id) => (
                        <input
                            key={`service-${id}`}
                            type="hidden"
                            name="service_ids[]"
                            value={id}
                        />
                    ))}
                    {specialistIds.map((id) => (
                        <input
                            key={`specialist-${id}`}
                            type="hidden"
                            name="user_ids[]"
                            value={id}
                        />
                    ))}

                    <div
                        className={cn(
                            'space-y-6',
                            inline
                                ? 'flex-1 py-6 md:py-10'
                                : 'min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6',
                        )}
                    >
                        {inline ? heading : null}

                        <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active">
                                    {t('form.active')}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('form.activeHint')}
                                </p>
                            </div>
                            <Switch
                                id="is_active"
                                checked={isActive}
                                onCheckedChange={setIsActive}
                                data-test="location-active-switch"
                            />
                        </div>

                        <AddressSection
                            location={location}
                            countries={countries}
                            country={country}
                            setCountry={setCountry}
                            city={city}
                            setCity={setCity}
                            streetAddress={streetAddress}
                            setStreetAddress={setStreetAddress}
                            postalCode={postalCode}
                            setPostalCode={setPostalCode}
                            setName={setName}
                            setPlace={setPlace}
                            errors={errors}
                        />

                        <Separator />

                        <DetailsSection
                            location={location}
                            name={name}
                            setName={setName}
                            errors={errors}
                        />

                        {showAssignments ? (
                            <AssignmentsSection
                                services={services}
                                specialists={specialists}
                                serviceIds={serviceIds}
                                setServiceIds={setServiceIds}
                                specialistIds={specialistIds}
                                setSpecialistIds={setSpecialistIds}
                                errors={errors}
                            />
                        ) : null}
                    </div>

                    {inline ? (
                        footer?.({ processing })
                    ) : (
                        <DialogFooter className="shrink-0 flex-row justify-end border-t px-4 py-4 sm:px-6">
                            {onCancel ? (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={onCancel}
                                    className="flex-1 sm:flex-none"
                                >
                                    {t('form.cancel')}
                                </Button>
                            ) : null}
                            <Button
                                type="submit"
                                data-test="location-save-button"
                                disabled={processing}
                                className="flex-1 sm:flex-none"
                            >
                                {isEditing
                                    ? t('form.saveChanges')
                                    : t('form.addLocation')}
                            </Button>
                        </DialogFooter>
                    )}
                </>
            )}
        </Form>
    );
}
