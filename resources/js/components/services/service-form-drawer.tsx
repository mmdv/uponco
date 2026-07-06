import { Form } from '@inertiajs/react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { store, update } from '@/routes/company/services';
import type {
    DeliveryType,
    PriceType,
    SelectOption,
    Service,
    ServiceCategory,
    ServiceTypeValue,
} from '@/types';

/**
 * A horizontal, single-select radio group rendered as a segmented control.
 */
function OptionToggleGroup({
    id,
    options,
    value,
    onChange,
    invalid,
    ...props
}: {
    id?: string;
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    invalid?: boolean;
    'data-test'?: string;
}) {
    return (
        <ToggleGroup
            type="single"
            id={id}
            value={value}
            onValueChange={(next) => {
                if (next) {
                    onChange(next);
                }
            }}
            variant="outline"
            aria-invalid={invalid}
            className="w-full"
            {...props}
        >
            {options.map((option) => (
                <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className="h-9 flex-1 px-3"
                >
                    {option.label}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    );
}

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    service: Service | null;
    defaultCategoryId: number | null;
    teamSlug: string;
    categories: ServiceCategory[];
    locations: SelectOption[];
    specialists: SelectOption[];
    priceTypes: SelectOption[];
    serviceTypes: SelectOption[];
    deliveryTypes: SelectOption[];
    meetingProviders: SelectOption[];
};

export default function ServiceFormDrawer({
    open,
    onOpenChange,
    service,
    defaultCategoryId,
    teamSlug,
    categories,
    locations,
    specialists,
    priceTypes,
    serviceTypes,
    deliveryTypes,
    meetingProviders,
}: Props) {
    const isEditing = service !== null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
            >
                <SheetHeader className="shrink-0 border-b">
                    <SheetTitle>
                        {isEditing ? 'Edit service' : 'Add service'}
                    </SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? 'Update the details for this service.'
                            : 'Add a new service for your company.'}
                    </SheetDescription>
                </SheetHeader>

                <ServiceFormFields
                    key={service?.id ?? 'new'}
                    service={service}
                    defaultCategoryId={defaultCategoryId}
                    teamSlug={teamSlug}
                    categories={categories}
                    locations={locations}
                    specialists={specialists}
                    priceTypes={priceTypes}
                    serviceTypes={serviceTypes}
                    deliveryTypes={deliveryTypes}
                    meetingProviders={meetingProviders}
                    onSuccess={() => onOpenChange(false)}
                    onCancel={() => onOpenChange(false)}
                />
            </SheetContent>
        </Sheet>
    );
}

type FieldsProps = {
    service: Service | null;
    defaultCategoryId: number | null;
    teamSlug: string;
    categories: ServiceCategory[];
    locations: SelectOption[];
    specialists: SelectOption[];
    priceTypes: SelectOption[];
    serviceTypes: SelectOption[];
    deliveryTypes: SelectOption[];
    meetingProviders: SelectOption[];
    onSuccess: () => void;
    onCancel: () => void;
};

function ServiceFormFields({
    service,
    defaultCategoryId,
    teamSlug,
    categories,
    locations,
    specialists,
    priceTypes,
    serviceTypes,
    deliveryTypes,
    meetingProviders,
    onSuccess,
    onCancel,
}: FieldsProps) {
    const isEditing = service !== null;

    const [isActive, setIsActive] = useState(service?.is_active ?? true);
    const [categoryId, setCategoryId] = useState(
        service?.service_category_id?.toString() ??
            defaultCategoryId?.toString() ??
            '',
    );
    const [priceType, setPriceType] = useState<PriceType>(
        service?.price_type ?? 'fixed',
    );
    const [serviceType, setServiceType] = useState<ServiceTypeValue>(
        service?.service_type ?? 'individual',
    );
    const [deliveryType, setDeliveryType] = useState<DeliveryType>(
        service?.delivery_type ?? 'onsite',
    );
    const [meetingProvider, setMeetingProvider] = useState(
        service?.online_meeting_provider ?? '',
    );
    const [locationIds, setLocationIds] = useState<string[]>(
        service?.location_ids.map((id) => id.toString()) ?? [],
    );
    const [specialistIds, setSpecialistIds] = useState<string[]>(
        service?.user_ids.map((id) => id.toString()) ?? [],
    );

    const categoryOptions: SelectOption[] = categories.map((category) => ({
        value: category.id.toString(),
        label: category.name,
    }));

    return (
        <Form
            {...(isEditing
                ? update.form([teamSlug, service.id])
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
                        name="is_active"
                        value={isActive ? '1' : '0'}
                    />
                    <input
                        type="hidden"
                        name="service_category_id"
                        value={categoryId}
                    />
                    <input type="hidden" name="price_type" value={priceType} />
                    <input
                        type="hidden"
                        name="service_type"
                        value={serviceType}
                    />
                    <input
                        type="hidden"
                        name="delivery_type"
                        value={deliveryType}
                    />
                    {deliveryType === 'online' && (
                        <input
                            type="hidden"
                            name="online_meeting_provider"
                            value={meetingProvider}
                        />
                    )}
                    {locationIds.map((id) => (
                        <input
                            key={`location-${id}`}
                            type="hidden"
                            name="location_ids[]"
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

                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active">Active</Label>
                                <p className="text-sm text-muted-foreground">
                                    Inactive services are hidden from use.
                                </p>
                            </div>
                            <Switch
                                id="is_active"
                                checked={isActive}
                                onCheckedChange={setIsActive}
                                data-test="service-active-switch"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                name="title"
                                data-test="service-title-input"
                                defaultValue={service?.title ?? ''}
                                placeholder="Haircut"
                            />
                            <InputError message={errors.title} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="service_category_id">
                                Category
                            </Label>
                            <SearchableSelect
                                id="service_category_id"
                                options={categoryOptions}
                                value={categoryId}
                                onChange={setCategoryId}
                                placeholder="Select a category"
                                searchPlaceholder="Search categories…"
                                emptyMessage="No categories found."
                                invalid={Boolean(errors.service_category_id)}
                                data-test="service-category-select"
                            />
                            <InputError message={errors.service_category_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="price_type">Price type</Label>
                            <OptionToggleGroup
                                id="price_type"
                                options={priceTypes}
                                value={priceType}
                                onChange={(value) =>
                                    setPriceType(value as PriceType)
                                }
                                invalid={Boolean(errors.price_type)}
                                data-test="service-price-type-select"
                            />
                            <InputError message={errors.price_type} />
                        </div>

                        {priceType === 'fixed' && (
                            <div className="grid gap-2">
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    defaultValue={service?.price ?? ''}
                                    placeholder="50.00"
                                />
                                <InputError message={errors.price} />
                            </div>
                        )}

                        {priceType === 'range' && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="price_min">Min price</Label>
                                    <Input
                                        id="price_min"
                                        name="price_min"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        defaultValue={service?.price_min ?? ''}
                                        placeholder="50.00"
                                    />
                                    <InputError message={errors.price_min} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="price_max">Max price</Label>
                                    <Input
                                        id="price_max"
                                        name="price_max"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        defaultValue={service?.price_max ?? ''}
                                        placeholder="200.00"
                                    />
                                    <InputError message={errors.price_max} />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="duration">Duration (min)</Label>
                                <Input
                                    id="duration"
                                    name="duration"
                                    type="number"
                                    min="1"
                                    defaultValue={service?.duration ?? ''}
                                    placeholder="60"
                                />
                                <InputError message={errors.duration} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="technical_break">
                                    Break (min)
                                </Label>
                                <Input
                                    id="technical_break"
                                    name="technical_break"
                                    type="number"
                                    min="0"
                                    defaultValue={service?.technical_break ?? 0}
                                    placeholder="0"
                                />
                                <InputError message={errors.technical_break} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="service_type">Service type</Label>
                            <OptionToggleGroup
                                id="service_type"
                                options={serviceTypes}
                                value={serviceType}
                                onChange={(value) =>
                                    setServiceType(value as ServiceTypeValue)
                                }
                                invalid={Boolean(errors.service_type)}
                                data-test="service-type-select"
                            />
                            <InputError message={errors.service_type} />
                        </div>

                        {serviceType === 'group' && (
                            <div className="grid gap-2">
                                <Label htmlFor="capacity">Capacity</Label>
                                <Input
                                    id="capacity"
                                    name="capacity"
                                    type="number"
                                    min="1"
                                    defaultValue={service?.capacity ?? ''}
                                    placeholder="10"
                                />
                                <InputError message={errors.capacity} />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="delivery_type">Delivery type</Label>
                            <OptionToggleGroup
                                id="delivery_type"
                                options={deliveryTypes}
                                value={deliveryType}
                                onChange={(value) => {
                                    const next = value as DeliveryType;
                                    setDeliveryType(next);

                                    // Online services are not tied to a branch.
                                    if (next === 'online') {
                                        setLocationIds([]);

                                        // Default to the only available provider.
                                        if (!meetingProvider) {
                                            setMeetingProvider(
                                                meetingProviders[0]?.value ?? '',
                                            );
                                        }
                                    }
                                }}
                                invalid={Boolean(errors.delivery_type)}
                                data-test="service-delivery-type-select"
                            />
                            <InputError message={errors.delivery_type} />
                        </div>

                        {deliveryType === 'online' && (
                            <div className="grid gap-2">
                                <Label htmlFor="online_meeting_provider">
                                    Online meeting provider
                                </Label>
                                <SearchableSelect
                                    id="online_meeting_provider"
                                    options={meetingProviders}
                                    value={meetingProvider}
                                    onChange={setMeetingProvider}
                                    placeholder="Select a provider"
                                    invalid={Boolean(
                                        errors.online_meeting_provider,
                                    )}
                                    data-test="service-meeting-provider-select"
                                />
                                <InputError
                                    message={errors.online_meeting_provider}
                                />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={service?.description ?? ''}
                                placeholder="Describe this service…"
                                rows={4}
                            />
                            <InputError message={errors.description} />
                        </div>

                        {deliveryType !== 'online' && (
                            <div className="grid gap-2">
                                <Label htmlFor="location_ids">Locations</Label>
                                <MultiSelect
                                    id="location_ids"
                                    options={locations}
                                    value={locationIds}
                                    onChange={setLocationIds}
                                    placeholder="Select locations"
                                    searchPlaceholder="Search locations…"
                                    emptyMessage="No locations found."
                                    invalid={Boolean(errors.location_ids)}
                                    data-test="service-locations-select"
                                />
                                <p className="text-sm text-muted-foreground">
                                    Branches where this service is offered.
                                </p>
                                <InputError message={errors.location_ids} />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="user_ids">Specialists</Label>
                            <MultiSelect
                                id="user_ids"
                                options={specialists}
                                value={specialistIds}
                                onChange={setSpecialistIds}
                                placeholder="Select specialists"
                                searchPlaceholder="Search specialists…"
                                emptyMessage="No specialists found."
                                invalid={Boolean(errors.user_ids)}
                                data-test="service-specialists-select"
                            />
                            <p className="text-sm text-muted-foreground">
                                Team members who provide this service.
                            </p>
                            <InputError message={errors.user_ids} />
                        </div>
                    </div>

                    <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            data-test="service-save-button"
                            disabled={processing}
                        >
                            {isEditing ? 'Save changes' : 'Add service'}
                        </Button>
                    </SheetFooter>
                </>
            )}
        </Form>
    );
}
