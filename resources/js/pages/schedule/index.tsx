import { Head, usePage } from '@inertiajs/react';
import { useMemo } from 'react';

import Heading from '@/components/heading';
import EditScheduleButton from '@/components/schedule/edit-schedule-button';
import EditScheduleDrawer from '@/components/schedule/edit-schedule-drawer';
import MonthTabs from '@/components/schedule/month-tabs';
import { ScheduleProvider } from '@/components/schedule/schedule-context';
import ScheduleGrid from '@/components/schedule/schedule-grid';
import SelectedDaysCount from '@/components/schedule/selected-days-count';
import { buildMonthTabs } from '@/lib/schedule';
import { isTeamManager } from '@/lib/teams';
import { index as scheduleIndex } from '@/routes/schedule';
import type { ScheduleMember, ScheduleSlotMap } from '@/types/schedule';

type Props = {
    members: ScheduleMember[];
    slots: ScheduleSlotMap;
};

export default function SchedulePage({ members, slots }: Props) {
    const { currentTeam } = usePage().props;
    const isAdmin = isTeamManager(currentTeam?.role);

    const monthTabs = useMemo(() => buildMonthTabs(), []);
    const currentMonth = monthTabs.find((tab) => tab.isCurrent) ?? monthTabs[0];

    return (
        <>
            <Head title="Schedule" />

            <h1 className="sr-only">Schedule</h1>

            <ScheduleProvider
                members={members}
                showMemberColumn={isAdmin}
                monthTabs={monthTabs}
                defaultMonthKey={currentMonth.key}
                slots={slots}
            >
                <div className="flex flex-col gap-6 p-4 max-lg:min-h-full">
                    <div className="flex items-center justify-between gap-4">
                        <Heading
                            variant="small"
                            title="Schedule"
                            description="Set monthly availability"
                        />

                        <div className="flex shrink-0 items-center gap-3">
                            <SelectedDaysCount />
                            <EditScheduleButton className="hidden lg:inline-flex" />
                        </div>
                    </div>

                    <ScheduleGrid />

                    {/* Pushed to the bottom on mobile (flex mt-auto, no fixed);
                        flows inline under the grid on desktop. */}
                    <div className="space-y-2 max-lg:mt-auto">
                        <EditScheduleButton className="w-full lg:hidden" />

                        <MonthTabs />
                    </div>
                </div>

                <EditScheduleDrawer />
            </ScheduleProvider>
        </>
    );
}

SchedulePage.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Schedule',
            href: props.currentTeam
                ? scheduleIndex(props.currentTeam.slug)
                : '/',
        },
    ],
});
