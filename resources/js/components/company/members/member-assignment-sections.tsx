import { Form, router } from '@inertiajs/react';
import { useState } from 'react';

import {
    updateLocations,
    updateServices,
} from '@/actions/App/Http/Controllers/Company/BusinessMemberController';
import type {
    MemberAccount,
    MemberLocation,
    MemberService,
    SectionArg,
} from '@/components/company/members/member-edit-types';
import Heading from '@/components/heading';
import MemberSchedule from '@/components/schedule/member/member-schedule';
import { Button } from '@/components/ui/button';
import { CheckboxCardGroup } from '@/components/ui/checkbox-card-group';
import type { CheckboxCardOption } from '@/components/ui/checkbox-card-group';
import { useTranslation } from '@/hooks/use-translation';
import { edit as editMember } from '@/routes/company/business/members';
import type { DayScheduleMap, MemberScheduleMember } from '@/types/schedule';

export function LocationsSection({
    locations,
    assignedLocationIds,
    arg,
}: {
    locations: MemberLocation[];
    assignedLocationIds: number[];
    arg: SectionArg;
}) {
    const { t } = useTranslation('company');
    const [selected, setSelected] = useState<string[]>(
        assignedLocationIds.map((id) => id.toString()),
    );

    const options: CheckboxCardOption[] = locations.map((location) => ({
        value: location.id.toString(),
        label: location.name,
        description: location.city,
    }));

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title={t('business.memberEdit.locations.title')}
                description={t('business.memberEdit.locations.description')}
            />

            <Form
                {...updateLocations.form(arg)}
                options={{ preserveScroll: true }}
                className="space-y-6"
            >
                {({ processing }) => (
                    <>
                        {selected.map((id) => (
                            <input
                                key={`location-${id}`}
                                type="hidden"
                                name="ids[]"
                                value={id}
                            />
                        ))}

                        <CheckboxCardGroup
                            options={options}
                            value={selected}
                            onChange={setSelected}
                            emptyMessage={t(
                                'business.memberEdit.locations.empty',
                            )}
                            data-test="member-locations"
                        />

                        <div className="flex items-center gap-4">
                            <Button
                                disabled={processing}
                                data-test="update-member-locations-button"
                            >
                                {t('business.memberEdit.locations.save')}
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}

export function ServicesSection({
    services,
    assignedServiceIds,
    arg,
}: {
    services: MemberService[];
    assignedServiceIds: number[];
    arg: SectionArg;
}) {
    const { t } = useTranslation('company');
    const [selected, setSelected] = useState<string[]>(
        assignedServiceIds.map((id) => id.toString()),
    );

    const options: CheckboxCardOption[] = services.map((service) => ({
        value: service.id.toString(),
        label: service.title,
        description: service.category,
    }));

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title={t('business.memberEdit.services.title')}
                description={t('business.memberEdit.services.description')}
            />

            <Form
                {...updateServices.form(arg)}
                options={{ preserveScroll: true }}
                className="space-y-6"
            >
                {({ processing }) => (
                    <>
                        {selected.map((id) => (
                            <input
                                key={`service-${id}`}
                                type="hidden"
                                name="ids[]"
                                value={id}
                            />
                        ))}

                        <CheckboxCardGroup
                            options={options}
                            value={selected}
                            onChange={setSelected}
                            emptyMessage={t(
                                'business.memberEdit.services.empty',
                            )}
                            data-test="member-services"
                        />

                        <div className="flex items-center gap-4">
                            <Button
                                disabled={processing}
                                data-test="update-member-services-button"
                            >
                                {t('business.memberEdit.services.save')}
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}

/**
 * This member's own week/month schedule, alongside the rest of their settings.
 *
 * The slot map arrives as an optional Inertia prop, so opening any other
 * section never pays for the query; the picker jumps between members without
 * leaving the Schedule tab.
 */
export function ScheduleSection({
    member,
    schedule,
    scheduleMembers,
}: {
    member: MemberAccount;
    schedule?: DayScheduleMap;
    scheduleMembers?: MemberScheduleMember[];
}) {
    const { t } = useTranslation('company');

    return (
        <div className="space-y-6">
            <MemberSchedule
                member={{
                    id: member.id,
                    name: member.name,
                    avatar: member.avatar,
                }}
                slots={schedule}
                reloadProps={['schedule', 'scheduleMembers']}
                title={t('business.memberEdit.sections.schedule')}
                description={t('business.memberEdit.scheduleDescription')}
                members={scheduleMembers}
                onSelectMember={(memberId) =>
                    router.visit(
                        editMember.url([memberId], {
                            query: { section: 'schedule' },
                        }),
                    )
                }
            />
        </div>
    );
}
