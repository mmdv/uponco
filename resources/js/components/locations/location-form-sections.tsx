import { Info } from 'lucide-react';

import InputError from '@/components/input-error';
import AddressAutocomplete from '@/components/locations/address-autocomplete';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { PhoneInput } from '@/components/ui/phone-input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from '@/hooks/use-translation';
import type { Location, SelectOption } from '@/types';

type FieldErrors = Partial<Record<string, string>>;

/** Latitude/longitude and Google Places identity resolved from an address. */
export type PlaceState = {
    place_id: string;
    formatted_address: string;
    latitude: number | null;
    longitude: number | null;
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

/**
 * Address first: picking a suggestion auto-fills the country, city, street and
 * postal code below, so it is the fastest way to complete the whole section.
 */
export function AddressSection({
    location,
    countries,
    country,
    setCountry,
    city,
    setCity,
    streetAddress,
    setStreetAddress,
    postalCode,
    setPostalCode,
    setName,
    setPlace,
    errors,
}: {
    location: Location | null;
    countries: SelectOption[];
    country: string;
    setCountry: (value: string) => void;
    city: string;
    setCity: (value: string) => void;
    streetAddress: string;
    setStreetAddress: (value: string) => void;
    postalCode: string;
    setPostalCode: (value: string) => void;
    setName: (value: string) => void;
    setPlace: (place: PlaceState) => void;
    errors: FieldErrors;
}) {
    const { t } = useTranslation('locations');

    return (
        <FormSection title={t('form.sections.address')}>
            {/*
             * The search sits on a wash of the brand gradient so it reads as
             * the automatic, do-it-for-you entry point — the rest of the
             * fields below are just what it filled in.
             */}
            <div className="relative isolate grid gap-2 rounded-2xl border border-primary/10 bg-primary-gradient-soft p-5 shadow-soft sm:p-6 dark:border-primary/20">
                {/*
                 * The glow gets its own clipped layer so the card itself can
                 * keep overflow visible — the address dropdown has to be able to
                 * escape the card's bottom edge.
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
                                aria-label={t('form.addressSearchTooltip')}
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
                    initialAddress={location?.formatted_address ?? null}
                    initialVerified={location?.is_geocoded ?? false}
                    onResolved={(resolved) => {
                        setPlace({
                            place_id: resolved.place_id,
                            formatted_address: resolved.formatted_address,
                            latitude: resolved.latitude,
                            longitude: resolved.longitude,
                        });

                        setStreetAddress(resolved.street_address);
                        setCity(resolved.city);
                        setPostalCode(resolved.postal_code);

                        // Give the location a sensible name out of the box —
                        // the street line is the shortest thing that reads well
                        // on the booking page. The operator can still rename it.
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
                    <Label htmlFor="country">{t('form.country')}</Label>
                    <SearchableSelect
                        id="country"
                        options={countries}
                        value={country}
                        onChange={setCountry}
                        placeholder={t('form.selectCountry')}
                        searchPlaceholder={t('form.searchCountries')}
                        emptyMessage={t('form.noCountries')}
                        invalid={Boolean(errors.country)}
                        data-test="location-country-select"
                    />
                    <InputError message={errors.country} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="city">{t('form.city')}</Label>
                    <Input
                        id="city"
                        name="city"
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
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
                        aria-invalid={Boolean(errors.street_address)}
                    />
                    <InputError message={errors.street_address} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="unit">{t('form.unit')}</Label>
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
                    <Label htmlFor="postal_code">{t('form.postalCode')}</Label>
                    <Input
                        id="postal_code"
                        name="postal_code"
                        value={postalCode}
                        onChange={(event) => setPostalCode(event.target.value)}
                        placeholder="94103"
                        aria-invalid={Boolean(errors.postal_code)}
                    />
                    <InputError message={errors.postal_code} />
                </div>
            </div>
        </FormSection>
    );
}

/** Name and phone — the human-facing details shown on the booking page. */
export function DetailsSection({
    location,
    name,
    setName,
    errors,
}: {
    location: Location | null;
    name: string;
    setName: (value: string) => void;
    errors: FieldErrors;
}) {
    const { t } = useTranslation('locations');

    return (
        <FormSection title={t('form.sections.details')}>
            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="name">{t('form.name')}</Label>
                    <Input
                        id="name"
                        name="name"
                        data-test="location-name-input"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Head office"
                        aria-invalid={Boolean(errors.name)}
                    />
                    <p className="text-sm text-muted-foreground">
                        {t('form.nameHint')}
                    </p>
                    <InputError message={errors.name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="phone">{t('form.phone')}</Label>
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
    );
}

/** Which services and specialists this location offers. */
export function AssignmentsSection({
    services,
    specialists,
    serviceIds,
    setServiceIds,
    specialistIds,
    setSpecialistIds,
    errors,
}: {
    services: SelectOption[];
    specialists: SelectOption[];
    serviceIds: string[];
    setServiceIds: (ids: string[]) => void;
    specialistIds: string[];
    setSpecialistIds: (ids: string[]) => void;
    errors: FieldErrors;
}) {
    const { t } = useTranslation('locations');

    return (
        <FormSection title={t('form.sections.assignments')}>
            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="service_ids">{t('form.services')}</Label>
                    <MultiSelect
                        id="service_ids"
                        options={services}
                        value={serviceIds}
                        onChange={setServiceIds}
                        placeholder={t('form.selectServices')}
                        searchPlaceholder={t('form.searchServices')}
                        emptyMessage={t('form.noServices')}
                        invalid={Boolean(errors.service_ids)}
                        data-test="location-services-select"
                    />
                    <p className="text-sm text-muted-foreground">
                        {t('form.servicesHint')}
                    </p>
                    <InputError message={errors.service_ids} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="user_ids">{t('form.specialists')}</Label>
                    <MultiSelect
                        id="user_ids"
                        options={specialists}
                        value={specialistIds}
                        onChange={setSpecialistIds}
                        placeholder={t('form.selectSpecialists')}
                        searchPlaceholder={t('form.searchSpecialists')}
                        emptyMessage={t('form.noSpecialists')}
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
    );
}
