import { usePage } from '@inertiajs/react';

import MemberSchedule from '@/components/schedule/member/member-schedule';
import type { DayScheduleMap } from '@/types/schedule';
import type { StepControls } from './controls';
import OnboardingFooter from './onboarding-footer';
import OnboardingScreen from './onboarding-screen';
import ScreenHeader from './screen-header';

type Props = {
    /** The signed-in user's slots for the week on screen. */
    data?: DayScheduleMap;
    /** Whether any hours are saved at all — the step's own gate. */
    hasSchedule: boolean;
    controls: StepControls;
};

/**
 * Work hours, as one person's week.
 *
 * Whoever is setting the business up is filling in their own hours, so this is
 * the member week editor rather than the team grid — colleagues get their own
 * hours from the schedule screens once setup is done.
 */
export default function StepSchedule({ data, hasSchedule, controls }: Props) {
    const { auth } = usePage().props;

    return (
        <OnboardingScreen
            footer={
                <OnboardingFooter
                    saving={controls.saving}
                    onClick={controls.onComplete}
                    label="Finish"
                    disabled={!hasSchedule}
                />
            }
        >
            <ScreenHeader
                title="When do you work?"
                description="Customers can only book inside these hours."
            />

            <MemberSchedule
                member={{
                    id: auth.user.id,
                    name: auth.user.name,
                    avatar: auth.user.avatar,
                }}
                slots={data}
                reloadProps={['schedule']}
                initialView="week"
                showViewSwitcher={false}
            />
        </OnboardingScreen>
    );
}
