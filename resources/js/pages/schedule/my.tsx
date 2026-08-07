import { Head } from '@inertiajs/react';

import MemberSchedule from '@/components/schedule/member/member-schedule';
import { useTranslation } from '@/hooks/use-translation';
import { my as myScheduleRoute } from '@/routes/schedule';
import type { DayScheduleMap, MemberScheduleMember } from '@/types/schedule';

type Props = {
    member: MemberScheduleMember;
    schedule?: DayScheduleMap;
};

/**
 * The signed-in user's own schedule in the week/month editor. Plain members
 * cannot reach the team-member screens, so this is their way in; managers get
 * the same editor for their own hours.
 */
export default function MySchedulePage({ member, schedule }: Props) {
    const { t } = useTranslation('schedule');

    return (
        <>
            <Head title={t('member.myTitle')} />

            <div className="flex flex-col gap-6 p-4">
                <MemberSchedule
                    member={member}
                    slots={schedule}
                    reloadProps={['schedule']}
                    title={t('member.myTitle')}
                    description={t('member.myDescription')}
                />
            </div>
        </>
    );
}

MySchedulePage.layout = () => ({
    breadcrumbs: [
        {
            title: 'My Schedule',
            href: myScheduleRoute(),
        },
    ],
});
