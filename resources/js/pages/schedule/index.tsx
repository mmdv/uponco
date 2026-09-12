import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import Heading from '@/components/heading';
import EditScheduleButton from '@/components/schedule/edit-schedule-button';
import EditScheduleDrawer from '@/components/schedule/edit-schedule-drawer';
import MemberSchedule from '@/components/schedule/member/member-schedule';
import ScheduleViewSwitcher from '@/components/schedule/member/schedule-view-switcher';
import MonthTabs from '@/components/schedule/month-tabs';
import { ScheduleProvider } from '@/components/schedule/schedule-context';
import ScheduleGrid from '@/components/schedule/schedule-grid';
import { useTranslation } from '@/hooks/use-translation';
import { buildMonthTabs } from '@/lib/schedule';
import { isTeamManager } from '@/lib/teams';
import { index as scheduleIndex } from '@/routes/schedule';
import type {
    DayScheduleMap,
    MemberScheduleMember,
    ScheduleMember,
    ScheduleSlotMap,
} from '@/types/schedule';

type PageView = 'week' | 'month' | 'team';

type Props = {
    members: ScheduleMember[];
    slots: ScheduleSlotMap;
    selectedMember: MemberScheduleMember;
    memberSchedule?: DayScheduleMap;
};

/**
 * The view named in the URL, so the member picker — which navigates — can come
 * back to the view the user was on.
 */
function viewFromUrl(): PageView {
    const requested = new URLSearchParams(window.location.search).get('view');

    return requested === 'month' || requested === 'team' ? requested : 'week';
}

export default function SchedulePage({
    members,
    slots,
    selectedMember,
    memberSchedule,
}: Props) {
    const { t } = useTranslation('schedule');
    const { currentTeam } = usePage().props;
    const isAdmin = isTeamManager(currentTeam?.role);

    // The team grid stamps hours across several colleagues at once — only worth
    // offering to a manager who actually has other members to edit. Members and
    // solo owners never see it (and can't land on it via a stale ?view=team).
    const showTeamOption = isAdmin && members.length > 1;

    const [view, setView] = useState<PageView>(() => {
        const requested = viewFromUrl();

        return requested === 'team' && !showTeamOption ? 'week' : requested;
    });

    const monthTabs = useMemo(() => buildMonthTabs(), []);
    const currentMonth = monthTabs.find((tab) => tab.isCurrent) ?? monthTabs[0];

    const teamOption = { value: 'team', label: t('member.team') };
    const extraViews = showTeamOption ? [teamOption] : [];

    return (
        <>
            <Head title={t('title')} />

            <h1 className="sr-only">{t('title')}</h1>

            {view === 'team' && showTeamOption ? (
                <ScheduleProvider
                    members={members}
                    showMemberColumn={isAdmin}
                    monthTabs={monthTabs}
                    defaultMonthKey={currentMonth.key}
                    slots={slots}
                >
                    <div className="flex flex-col gap-6 p-4 max-lg:min-h-full">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <Heading
                                variant="small"
                                title={t('title')}
                                description={t('description')}
                            />

                            <ScheduleViewSwitcher
                                value={view}
                                options={[
                                    { value: 'week', label: t('member.week') },
                                    {
                                        value: 'month',
                                        label: t('member.month'),
                                    },
                                    ...extraViews,
                                ]}
                                onChange={(next) => setView(next as PageView)}
                            />
                        </div>

                        {/* Sits under the tabs and above the grid, where the
                            Week and Month views put their action button. On
                            mobile it lives in the bottom bar instead. */}
                        <div className="hidden justify-end lg:flex">
                            <EditScheduleButton showCount />
                        </div>

                        <ScheduleGrid />

                        {/* Pushed to the bottom on mobile (flex mt-auto, no fixed);
                            flows inline under the grid on desktop. */}
                        <div className="space-y-2 max-lg:mt-auto">
                            <EditScheduleButton
                                className="w-full lg:hidden"
                                showCount
                            />

                            <MonthTabs />
                        </div>
                    </div>

                    <EditScheduleDrawer />
                </ScheduleProvider>
            ) : (
                <div className="flex flex-col gap-6 p-4">
                    <MemberSchedule
                        member={selectedMember}
                        slots={memberSchedule}
                        reloadProps={['memberSchedule']}
                        title={t('title')}
                        description={t('description')}
                        initialView={view === 'team' ? 'week' : view}
                        extraViews={extraViews}
                        onSelectView={(next) => setView(next as PageView)}
                        members={isAdmin ? members : undefined}
                        onSelectMember={(memberId) =>
                            router.get(
                                scheduleIndex().url,
                                { member: memberId, view },
                                { preserveScroll: true },
                            )
                        }
                    />
                </div>
            )}
        </>
    );
}

SchedulePage.layout = () => ({
    breadcrumbs: [
        {
            title: 'Schedule',
            href: scheduleIndex(),
        },
    ],
});
