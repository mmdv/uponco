import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';

import EditScheduleButton from '@/components/schedule/edit-schedule-button';
import EditScheduleDrawer from '@/components/schedule/edit-schedule-drawer';
import MonthTabs from '@/components/schedule/month-tabs';
import { ScheduleProvider } from '@/components/schedule/schedule-context';
import ScheduleGrid from '@/components/schedule/schedule-grid';
import SelectedDaysCount from '@/components/schedule/selected-days-count';
import { buildMonthTabs } from '@/lib/schedule';
import { isTeamManager } from '@/lib/teams';
import type { Onboarding } from '@/types';
import type { StepControls } from './controls';
import OnboardingFooter from './onboarding-footer';

type Props = {
    data: Onboarding['schedule'];
    controls: StepControls;
};

export default function StepSchedule({ data, controls }: Props) {
    const { currentTeam } = usePage().props;
    const isAdmin = isTeamManager(currentTeam?.role);

    const monthTabs = useMemo(() => buildMonthTabs(), []);
    const currentMonth = monthTabs.find((tab) => tab.isCurrent) ?? monthTabs[0];

    const hasSlots = Object.keys(data.slots).length > 0;

    return (
        <div className="space-y-6">
            <ScheduleProvider
                members={data.members}
                showMemberColumn={isAdmin}
                monthTabs={monthTabs}
                defaultMonthKey={currentMonth.key}
                slots={data.slots}
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <SelectedDaysCount />
                        <EditScheduleButton />
                    </div>

                    <ScheduleGrid />

                    <MonthTabs />
                </div>

                <EditScheduleDrawer />
            </ScheduleProvider>

            <OnboardingFooter
                showBack={controls.showBack}
                onBack={controls.onBack}
                saving={controls.saving}
                onContinue={controls.onComplete}
                continueLabel="Finish"
                continueDisabled={!hasSlots}
            />
        </div>
    );
}
