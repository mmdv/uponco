import { usePage } from '@inertiajs/react';
import { Repeat } from 'lucide-react';

import MemberSchedule from '@/components/schedule/member/member-schedule';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from '@/hooks/use-translation';
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
    const { t } = useTranslation('onboard');

    return (
        <OnboardingScreen
            footer={
                <OnboardingFooter
                    saving={controls.saving}
                    onClick={controls.onComplete}
                    label={t('schedule.complete')}
                    disabled={!hasSchedule}
                />
            }
        >
            <ScreenHeader
                title={t('schedule.title')}
                description={t('schedule.description')}
            />

            <Alert className="border-primary/20 bg-primary/5">
                <Repeat className="text-primary" />
                <AlertTitle>{t('schedule.infoTitle')}</AlertTitle>
                <AlertDescription>
                    {t('schedule.infoDescription')}
                </AlertDescription>
            </Alert>

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
