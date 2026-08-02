import { Form } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import AddressAutocomplete from '@/components/locations/address-autocomplete';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { PhoneInput } from '@/components/ui/phone-input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
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

function FormSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
            {children}
        </section>
    );
}

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

                        {/*
                         * Address first: picking a suggestion auto-fills the
                         * country, city, street and postal code below, so it is
                         * the fastest way to complete the whole section.
                         */}
                        <FormSection title={t('form.sections.address')}>
                            {/*
                             * The search sits on a wash of the brand gradient so
                             * it reads as the automatic, do-it-for-you entry
                             * point — the rest of the fields below are just what
                             * it filled in.
                             */}
                            <div className="relative isolate grid gap-2 rounded-2xl border border-primary/10 bg-primary-gradient-soft p-5 shadow-soft sm:p-6 dark:border-primary/20">
                                {/*
                                 * The glow gets its own clipped layer so the
                                 * card itself can keep overflow visible — the
                                 * address dropdown has to be able to escape the
                                 * card's bottom edge.
                                 */}
                                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-2xl">
                                    <div className="absolute -top-16 -right-10 size-48 rounded-full bg-primary/10 blur-3xl" />
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <Label htmlFor="address_search">
                                        {t('form.addressSearch')}
                                    </Label>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                className="text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
                                                aria-label={t(
                                                    'form.addressSearchTooltip',
                                                )}
                                            >
                                                <Info className="size-3.5" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {t('form.addressSearchTooltip')}
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <AddressAutocomplete
                                    country={country}
                                    initialAddress={
                                        location?.formatted_address ?? null
                                    }
                                    initialVerified={
                                        location?.is_geocoded ?? false
                                    }
                                    onResolved={(resolved) => {
                                        setPlace({
                                            place_id: resolved.place_id,
                                            formatted_address:
                                                resolved.formatted_address,
                                            latitude: resolved.latitude,
                                            longitude: resolved.longitude,
                                        });

                                        setStreetAddress(
                                            resolved.street_address,
                                        );
                                        setCity(resolved.city);
                                        setPostalCode(resolved.postal_code);

                                        // Give the location a sensible name out
                                        // of the box — the street line is the
                                        // shortest thing that reads well on the
                                        // booking page. The operator can still
                                        // rename it.
                                        if (resolved.street_address) {
                                            setName(resolved.street_address);
                                        }

                                        if (resolved.country) {
                                            setCountry(resolved.country);
                                        }
                                    }}
                                    onCleared={() =>
                                        setPlace({
                                            place_id: '',
                                            formatted_address: '',
                                            latitude: null,
                                            longitude: null,
                                        })
                                    }
                                />
                                <p className="text-sm text-muted-foreground">
                                    {t('form.addressSearchDescription')}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="country">
                                        {t('form.country')}
                                    </Label>
                                    <SearchableSelect
                                        id="country"
                                        options={countries}
                                        value={country}
                                        onChange={setCountry}
                                        placeholder={t('form.selectCountry')}
                                        searchPlaceholder={t(
                                            'form.searchCountries',
                                        )}
                                        emptyMessage={t('form.noCountries')}
                                        invalid={Boolean(errors.country)}
                                        data-test="location-country-select"
                                    />
                                    <InputError message={errors.country} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="city">
                                        {t('form.city')}
                                    </Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        value={city}
                                        onChange={(event) =>
                                            setCity(event.target.value)
                                        }
                                        placeholder="San Francisco"
                                        aria-invalid={Boolean(errors.city)}
                                    />
                                    <InputError message={errors.city} />
                                </div>

                                <div className="grid gap-2 sm:col-span-2">
                                    <Label htmlFor="street_address">
                                        {t('form.streetAddress')}
                                    </Label>
                                    <Input
                                        id="street_address"
                                        name="street_address"
                                        value={streetAddress}
                                        onChange={(event) =>
                                            setStreetAddress(event.target.value)
                                        }
                                        placeholder="123 Market St"
                                        aria-invalid={Boolean(
                                            errors.street_address,
                                        )}
                                    />
                                    <InputError
                                        message={errors.street_address}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="unit">
                                        {t('form.unit')}
                                    </Label>
                                    <Input
                                        id="unit"
                                        name="unit"
                                        defaultValue={location?.unit ?? ''}
                                        placeholder="Suite 400"
                                        aria-invalid={Boolean(errors.unit)}
                                    />
                                    <InputError message={errors.unit} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="postal_code">
                                        {t('form.postalCode')}
                                    </Label>
                                    <Input
                                        id="postal_code"
                                        name="postal_code"
                                        value={postalCode}
                                        onChange={(event) =>
                                            setPostalCode(event.target.value)
                                        }
                                        placeholder="94103"
                                        aria-invalid={Boolean(
                                            errors.postal_code,
                                        )}
                                    />
                                    <InputError message={errors.postal_code} />
                                </div>
                            </div>
                        </FormSection>

                        <Separator />

                        <FormSection title={t('form.sections.details')}>
                            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        {t('form.name')}
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        data-test="location-name-input"
                                        value={name}
                                        onChange={(event) =>
                                            setName(event.target.value)
                                        }
                                        placeholder="Head office"
                                        aria-invalid={Boolean(errors.name)}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        {t('form.nameHint')}
                                    </p>
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">
                                        {t('form.phone')}
                                    </Label>
                                    <PhoneInput
                                        id="phone"
                                        name="phone"
                                        defaultValue={location?.phone ?? ''}
                                        placeholder="+1 (555) 123-4567"
                                        aria-invalid={Boolean(errors.phone)}
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                            </div>
                        </FormSection>

                        {showAssignments ? (
                            <FormSection title={t('form.sections.assignments')}>
                                <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="service_ids">
                                            {t('form.services')}
                                        </Label>
                                        <MultiSelect
                                            id="service_ids"
                                            options={services}
                                            value={serviceIds}
                                            onChange={setServiceIds}
                                            placeholder={t(
                                                'form.selectServices',
                                            )}
                                            searchPlaceholder={t(
                                                'form.searchServices',
                                            )}
                                            emptyMessage={t('form.noServices')}
                                            invalid={Boolean(
                                                errors.service_ids,
                                            )}
                                            data-test="location-services-select"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            {t('form.servicesHint')}
                                        </p>
                                        <InputError
                                            message={errors.service_ids}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="user_ids">
                                            {t('form.specialists')}
                                        </Label>
                                        <MultiSelect
                                            id="user_ids"
                                            options={specialists}
                                            value={specialistIds}
                                            onChange={setSpecialistIds}
                                            placeholder={t(
                                                'form.selectSpecialists',
                                            )}
                                            searchPlaceholder={t(
                                                'form.searchSpecialists',
                                            )}
                                            emptyMessage={t(
                                                'form.noSpecialists',
                                            )}
                                            invalid={Boolean(errors.user_ids)}
                                            data-test="location-specialists-select"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            {t('form.specialistsHint')}
                                        </p>
                                        <InputError message={errors.user_ids} />
                                    </div>
                                </div>
                            </FormSection>
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
