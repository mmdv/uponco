import { router, usePage } from '@inertiajs/react';
import { Check, ChevronLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import OnboardingController from '@/actions/App/Http/Controllers/OnboardingController';
import AppBackground from '@/components/app-background';
import { useServiceDraft } from '@/components/services/service-wizard/service-draft';
import StepOnlineMethod from '@/components/services/service-wizard/step-online-method';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Onboarding, OnboardingStepKey } from '@/types';

import type { StepControls } from './controls';
import OnboardingFooter from './onboarding-footer';
import OnboardingScreen from './onboarding-screen';
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

/** Short names for the rail that tracks progress on a wide screen. */
const screenLabels: Record<ScreenId, string> = {
    intro: 'Welcome',
    delivery: 'Delivery',
    location: 'Location',
    'online-method': 'Meeting links',
    details: 'Service',
    profile: 'Profile',
    schedule: 'Working hours',
    done: 'Done',
};

/** Screens that carry the progress count; intro and done are chrome. */
const isCounted = (screen: ScreenId): boolean =>
    screen !== 'intro' && screen !== 'done';

export default function OnboardingWizard({ onboarding }: Props) {
    const { auth } = usePage().props;

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

    // The middle screen depends on the delivery branch: an onsite service needs
    // an address, an online one needs to say where the meeting link comes from.
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
            OnboardingController.update([step]).url,
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
    const counted = isCounted(current);

    // A screen change swaps the content under a scroll position that belonged to
    // the previous one, so every screen starts at its own top.
    const scrollArea = useRef<HTMLElement>(null);

    useEffect(() => {
        scrollArea.current?.scrollTo({ top: 0 });
    }, [current]);

    return (
        <AppBackground className="md:flex md:min-h-svh md:items-center md:justify-center md:p-6 lg:p-10">
            <div
                className={cn(
                    'flex h-svh w-full flex-col overflow-hidden md:h-auto md:rounded-2xl md:border md:bg-background md:shadow-xl',
                    counted ? 'md:max-w-5xl md:flex-row' : 'md:max-w-lg',
                )}
            >
                {counted ? (
                    <aside className="hidden w-72 shrink-0 flex-col gap-8 border-r bg-muted/30 p-8 md:flex">
                        <div className="space-y-1.5">
                            <p className="text-sm font-medium text-foreground">
                                Set up your business
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Step {position} of {countedScreens.length}
                            </p>
                        </div>

                        <ol className="space-y-4">
                            {countedScreens.map((item, itemIndex) => {
                                const isDone = itemIndex + 1 < position;
                                const isCurrent = item === current;

                                return (
                                    <li
                                        key={item}
                                        className="flex items-center gap-3"
                                        aria-current={
                                            isCurrent ? 'step' : undefined
                                        }
                                    >
                                        <span
                                            className={cn(
                                                'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                                                isDone &&
                                                    'border-primary bg-primary text-primary-foreground',
                                                isCurrent &&
                                                    'border-primary text-primary',
                                                !isDone &&
                                                    !isCurrent &&
                                                    'text-muted-foreground',
                                            )}
                                        >
                                            {isDone ? (
                                                <Check className="size-3.5" />
                                            ) : (
                                                itemIndex + 1
                                            )}
                                        </span>
                                        <span
                                            className={cn(
                                                'text-sm',
                                                isCurrent
                                                    ? 'font-medium text-foreground'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {screenLabels[item]}
                                        </span>
                                    </li>
                                );
                            })}
                        </ol>
                    </aside>
                ) : null}

                <div
                    className={cn(
                        // `min-w-0` keeps a wide screen — the schedule grid —
                        // scrolling inside the card instead of stretching it.
                        'flex min-h-0 w-full min-w-0 flex-1 flex-col',
                        counted && 'md:h-[min(40rem,calc(100svh-5rem))]',
                    )}
                >
                    {counted ? (
                        <header className="shrink-0 bg-background/95 backdrop-blur">
                            <div className="flex h-12 items-center px-1 md:px-4">
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

                                <span className="flex-1 text-center text-xs text-muted-foreground md:hidden">
                                    Step {position} of {countedScreens.length}
                                </span>

                                <div className="size-9 md:hidden" />
                            </div>

                            <div className="h-0.5 w-full bg-muted md:hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-500 ease-out"
                                    style={{
                                        width: `${
                                            (position / countedScreens.length) *
                                            100
                                        }%`,
                                    }}
                                />
                            </div>
                        </header>
                    ) : null}

                    <main
                        ref={scrollArea}
                        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 md:px-8"
                    >
                        <div
                            key={current}
                            className={cn(
                                'flex min-h-full animate-in flex-col duration-300 fade-in',
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
                                    value={locationIds}
                                    onChange={service.setLocationIds}
                                    onNext={goNext}
                                    specialistIds={
                                        service.draft.details.specialistIds
                                    }
                                />
                            )}

                            {current === 'online-method' && (
                                <OnboardingScreen
                                    footer={
                                        <OnboardingFooter
                                            disabled={
                                                service.draft
                                                    .meetingProvider === ''
                                            }
                                            onClick={goNext}
                                        />
                                    }
                                >
                                    <ScreenHeader
                                        title="How are meeting links handled?"
                                        description="Every online appointment needs a link to join."
                                    />

                                    <StepOnlineMethod
                                        value={service.draft.meetingProvider}
                                        onChange={service.setMeetingProvider}
                                        google={onboarding.services.google}
                                    />
                                </OnboardingScreen>
                            )}

                            {current === 'details' && (
                                <ScreenDetails
                                    data={onboarding.services}
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

                            {current === 'done' && <ScreenDone />}
                        </div>
                    </main>
                </div>
            </div>
        </AppBackground>
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
