import { router, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { CalendarClock, Check, Minus, Tag, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import OnboardingController from '@/actions/App/Http/Controllers/OnboardingController';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Onboarding, OnboardingStepKey } from '@/types';
import type { StepControls } from './controls';
import StepProfile from './step-profile';
import StepSchedule from './step-schedule';
import StepServices from './step-services';

type Props = {
    onboarding: Onboarding;
};

const stepMeta: Record<
    OnboardingStepKey,
    { icon: LucideIcon; description: string }
> = {
    services: {
        icon: Tag,
        description:
            'Services are what customers book. Walk through the steps below to set one up — you can add the locations you work from along the way.',
    },
    profile: {
        icon: UserRound,
        description:
            'Introduce yourself. Your name and title are required; everything else is optional and appears on your public booking page.',
    },
    schedule: {
        icon: CalendarClock,
        description:
            'Set your working hours so customers can only book when you are actually available.',
    },
};

export default function OnboardingWizard({ onboarding }: Props) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const { steps } = onboarding;

    const [activeStep, setActiveStep] = useState<OnboardingStepKey>(
        onboarding.currentStep,
    );
    const [direction, setDirection] = useState<'forward' | 'back'>('forward');
    const [saving, setSaving] = useState(false);

    const activeIndex = useMemo(
        () => steps.findIndex((step) => step.key === activeStep),
        [steps, activeStep],
    );

    const activeStepInfo = steps[activeIndex];
    const activeMeta = stepMeta[activeStep];

    // Once a service exists the services step swaps the wizard for a summary,
    // so the "walk through the steps below" copy no longer describes it.
    const activeDescription =
        activeStep === 'services' && onboarding.services.services.length > 0
            ? 'Your first service is ready. Add another if you need one, or move on to the next step.'
            : activeMeta.description;

    const completedCount = steps.filter(
        (step) => step.status !== 'pending',
    ).length;
    const progress = Math.round((completedCount / steps.length) * 100);

    const goTo = (index: number): void => {
        const target = steps[index];

        if (target) {
            setDirection(index < activeIndex ? 'back' : 'forward');
            setActiveStep(target.key);
        }
    };

    const persist = (status: 'completed' | 'skipped'): void => {
        setSaving(true);
        router.patch(
            OnboardingController.update([teamSlug, activeStep]).url,
            { status },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => goTo(activeIndex + 1),
                onFinish: () => setSaving(false),
            },
        );
    };

    const controls: StepControls = {
        showBack: activeIndex > 0,
        saving,
        onBack: () => goTo(activeIndex - 1),
        onComplete: () => persist('completed'),
        onSkip: () => persist('skipped'),
    };

    const selectStep = (key: OnboardingStepKey): void => {
        const index = steps.findIndex((step) => step.key === key);
        const target = steps[index];

        if (target && (target.status !== 'pending' || key === activeStep)) {
            goTo(index);
        }
    };

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
            <header className="text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Finish setting up your business
                </h1>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                    Complete these steps and you're ready to take bookings.
                </p>
            </header>

            <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                        {completedCount} of {steps.length} steps done
                    </span>
                    <span className="font-medium text-foreground">
                        {progress}%
                    </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <nav aria-label="Onboarding steps" className="mt-8">
                <ol className="flex w-full items-start">
                    {steps.map((step, index) => {
                        const isActive = step.key === activeStep;
                        const isCompleted = step.status === 'completed';
                        const isSkipped = step.status === 'skipped';
                        const isClickable =
                            step.status !== 'pending' || isActive;
                        const isReached = index <= activeIndex;
                        const StepIcon = stepMeta[step.key].icon;

                        return (
                            <li key={step.key} className="relative flex-1">
                                {index > 0 ? (
                                    <div
                                        aria-hidden
                                        className={cn(
                                            'absolute top-5 right-[calc(50%+1.5rem)] left-[calc(-50%+1.5rem)] h-0.5 rounded-full transition-colors duration-500',
                                            steps[index - 1].status !==
                                                'pending' || isReached
                                                ? 'bg-primary'
                                                : 'bg-border',
                                        )}
                                    />
                                ) : null}

                                <button
                                    type="button"
                                    disabled={!isClickable}
                                    onClick={() => selectStep(step.key)}
                                    aria-current={isActive ? 'step' : undefined}
                                    data-test={`onboarding-tab-${step.key}`}
                                    className="group relative flex w-full flex-col items-center gap-2"
                                >
                                    <span
                                        className={cn(
                                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300',
                                            isCompleted
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : isSkipped
                                                  ? 'border-muted-foreground/30 bg-muted text-muted-foreground'
                                                  : isActive
                                                    ? 'scale-110 border-primary bg-primary/10 text-primary ring-4 ring-primary/10'
                                                    : 'border-border bg-background text-muted-foreground',
                                            isClickable && !isActive
                                                ? 'group-hover:border-primary/60 group-hover:text-primary'
                                                : '',
                                        )}
                                    >
                                        {isCompleted ? (
                                            <Check className="h-4.5 w-4.5 animate-in duration-300 zoom-in" />
                                        ) : isSkipped ? (
                                            <Minus className="h-4.5 w-4.5" />
                                        ) : (
                                            <StepIcon className="h-4.5 w-4.5" />
                                        )}
                                    </span>

                                    <span
                                        className={cn(
                                            'hidden text-xs font-medium transition-colors duration-300 sm:block',
                                            isActive
                                                ? 'text-foreground'
                                                : 'text-muted-foreground',
                                        )}
                                    >
                                        {step.label}
                                        {step.mandatory ? (
                                            <span className="text-destructive">
                                                {' '}
                                                *
                                            </span>
                                        ) : null}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ol>

                <p className="mt-3 text-center text-sm text-muted-foreground sm:hidden">
                    Step {activeIndex + 1} of {steps.length}:{' '}
                    <span className="font-medium text-foreground">
                        {activeStepInfo?.label}
                    </span>
                </p>
            </nav>

            <div
                key={activeStep}
                className={cn(
                    'mt-8 animate-in duration-500 fade-in',
                    direction === 'forward'
                        ? 'slide-in-from-right-6'
                        : 'slide-in-from-left-6',
                )}
            >
                <section className="rounded-xl border bg-card p-5 shadow-sm sm:p-8">
                    <div className="mb-6 flex items-start gap-4">
                        <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:flex">
                            <activeMeta.icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-semibold text-foreground">
                                    {activeStepInfo?.label}
                                </h2>
                                {activeStepInfo?.mandatory ? (
                                    <Badge variant="secondary">Required</Badge>
                                ) : null}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {activeDescription}
                            </p>
                        </div>
                    </div>

                    {activeStep === 'services' ? (
                        <StepServices
                            data={onboarding.services}
                            controls={controls}
                        />
                    ) : null}
                    {activeStep === 'profile' ? (
                        <StepProfile
                            data={onboarding.profile}
                            controls={controls}
                        />
                    ) : null}
                    {activeStep === 'schedule' ? (
                        <StepSchedule
                            data={onboarding.schedule}
                            controls={controls}
                        />
                    ) : null}
                </section>
            </div>
        </div>
    );
}
