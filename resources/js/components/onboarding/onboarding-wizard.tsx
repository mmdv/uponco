import { router, usePage } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';

import OnboardingController from '@/actions/App/Http/Controllers/OnboardingController';
import { useServiceDraft } from '@/components/services/service-wizard/service-draft';
import StepOnlineMethod from '@/components/services/service-wizard/step-online-method';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Onboarding, OnboardingStepKey } from '@/types';

import type { StepControls } from './controls';
import OnboardingFooter from './onboarding-footer';
import ScreenDelivery from './screen-delivery';
import ScreenDetails from './screen-details';
import ScreenDone from './screen-done';
import ScreenHeader from './screen-header';
import ScreenIntro from './screen-intro';
import ScreenLocation from './screen-location';
import StepProfile from './step-profile';
import StepSchedule from './step-schedule';

type Props = {
    onboarding: Onboarding;
};

type ScreenId =
    | 'intro'
    | 'delivery'
    | 'location'
    | 'online-method'
    | 'details'
    | 'profile'
    | 'schedule'
    | 'done';

/**
 * Which backend step a screen belongs to. Several screens share one step: the
 * step is only marked done on the last of them.
 */
const stepForScreen: Partial<Record<ScreenId, OnboardingStepKey>> = {
    delivery: 'services',
    location: 'services',
    'online-method': 'services',
    details: 'services',
    profile: 'profile',
    schedule: 'schedule',
};

/** The first screen of each backend step, used when resuming a part-done flow. */
const entryScreen: Record<OnboardingStepKey, ScreenId> = {
    services: 'delivery',
    profile: 'profile',
    schedule: 'schedule',
};

/** Screens that carry the progress count; intro and done are chrome. */
const isCounted = (screen: ScreenId): boolean =>
    screen !== 'intro' && screen !== 'done';

export default function OnboardingWizard({ onboarding }: Props) {
    const { auth, currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const service = useServiceDraft({
        categoryId: null,
        // Whoever is setting the team up is the specialist for their first
        // service, so the picker never has to be shown.
        specialistIds: [auth.user.id.toString()],
    });
    const { deliveryType, locationIds } = service.draft;

    const [screen, setScreen] = useState<ScreenId>(() =>
        initialScreen(onboarding),
    );
    const [direction, setDirection] = useState<'forward' | 'back'>('forward');
    const [saving, setSaving] = useState(false);

    // The middle screen depends on the delivery branch. Online is not live yet,
    // but keeping the branch here means turning it on is a one-line change.
    const screens: ScreenId[] = [
        'intro',
        'delivery',
        deliveryType === 'online' ? 'online-method' : 'location',
        'details',
        'profile',
        'schedule',
        'done',
    ];

    const index = screens.indexOf(screen);
    const countedScreens = screens.filter(isCounted);
    const position = countedScreens.indexOf(screen) + 1;

    const goTo = (next: ScreenId, way: 'forward' | 'back' = 'forward') => {
        setDirection(way);
        setScreen(next);
    };

    const goNext = () => goTo(screens[Math.min(index + 1, screens.length - 1)]);
    const goBack = () =>
        goTo(screens[Math.max(index - 1, 0)] ?? 'intro', 'back');

    /** Mark the current screen's backend step done, then move on. */
    const complete = () => {
        const step = stepForScreen[screen];

        if (!step) {
            goNext();

            return;
        }

        setSaving(true);
        router.patch(
            OnboardingController.update([teamSlug, step]).url,
            { status: 'completed' },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: goNext,
                onFinish: () => setSaving(false),
            },
        );
    };

    const controls: StepControls = {
        saving,
        onComplete: complete,
        onNext: goNext,
    };

    // Finishing the last step flips this on the server; the closing screen is
    // then the only thing left to show.
    const current: ScreenId = onboarding.completed ? 'done' : screen;

    return (
        <div className="flex min-h-svh flex-col bg-background">
            {isCounted(current) ? (
                <header className="sticky top-0 z-20 bg-background/95 backdrop-blur">
                    <div className="mx-auto flex h-12 w-full max-w-xl items-center px-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={goBack}
                            disabled={saving}
                            aria-label="Back"
                            data-test="onboarding-back"
                        >
                            <ChevronLeft className="size-5" />
                        </Button>

                        <span className="flex-1 text-center text-xs text-muted-foreground">
                            Step {position} of {countedScreens.length}
                        </span>

                        <div className="size-9" />
                    </div>

                    <div className="h-0.5 w-full bg-muted">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{
                                width: `${
                                    (position / countedScreens.length) * 100
                                }%`,
                            }}
                        />
                    </div>
                </header>
            ) : null}

            <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pt-6">
                <div
                    key={current}
                    className={cn(
                        'flex flex-1 animate-in flex-col duration-300 fade-in',
                        direction === 'forward'
                            ? 'slide-in-from-right-4'
                            : 'slide-in-from-left-4',
                    )}
                >
                    {current === 'intro' && (
                        <ScreenIntro onStart={() => goTo('delivery')} />
                    )}

                    {current === 'delivery' && (
                        <ScreenDelivery
                            value={deliveryType}
                            onChange={service.setDeliveryType}
                            onNext={goNext}
                        />
                    )}

                    {current === 'location' && (
                        <ScreenLocation
                            data={onboarding.services}
                            teamSlug={teamSlug}
                            value={locationIds}
                            onChange={service.setLocationIds}
                            onNext={goNext}
                        />
                    )}

                    {current === 'online-method' && (
                        <div className="flex flex-1 flex-col space-y-6">
                            <ScreenHeader
                                title="How are meeting links handled?"
                                description="Every online appointment needs a link to join."
                            />

                            <StepOnlineMethod
                                value={service.draft.meetingProvider}
                                onChange={service.setMeetingProvider}
                                google={onboarding.services.google}
                            />

                            <OnboardingFooter
                                disabled={service.draft.meetingProvider === ''}
                                onClick={goNext}
                            />
                        </div>
                    )}

                    {current === 'details' && (
                        <ScreenDetails
                            data={onboarding.services}
                            teamSlug={teamSlug}
                            service={service}
                            controls={controls}
                        />
                    )}

                    {current === 'profile' && (
                        <StepProfile
                            data={onboarding.profile}
                            controls={controls}
                        />
                    )}

                    {current === 'schedule' && (
                        <StepSchedule
                            data={onboarding.schedule}
                            controls={controls}
                        />
                    )}

                    {current === 'done' && <ScreenDone teamSlug={teamSlug} />}
                </div>
            </main>
        </div>
    );
}

/**
 * Where to drop the user in. The intro is only worth showing when nothing has
 * happened yet; otherwise they resume at the step the server says is next.
 */
function initialScreen(onboarding: Onboarding): ScreenId {
    if (onboarding.completed) {
        return 'done';
    }

    const untouched = onboarding.steps.every(
        (step) => step.status === 'pending',
    );

    if (untouched && onboarding.services.services.length === 0) {
        return 'intro';
    }

    return entryScreen[onboarding.currentStep];
}
