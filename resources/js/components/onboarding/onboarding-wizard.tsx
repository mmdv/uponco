import { router, usePage } from '@inertiajs/react';
import { Check, Minus } from 'lucide-react';
import { useMemo, useState } from 'react';
import OnboardingController from '@/actions/App/Http/Controllers/OnboardingController';
import Heading from '@/components/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Onboarding, OnboardingStepKey } from '@/types';
import type { StepControls } from './controls';
import StepLocations from './step-locations';
import StepProfile from './step-profile';
import StepSchedule from './step-schedule';
import StepServices from './step-services';

type Props = {
    onboarding: Onboarding;
};

export default function OnboardingWizard({ onboarding }: Props) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const { steps } = onboarding;

    const [activeStep, setActiveStep] = useState<OnboardingStepKey>(
        onboarding.currentStep,
    );
    const [saving, setSaving] = useState(false);

    const activeIndex = useMemo(
        () => steps.findIndex((step) => step.key === activeStep),
        [steps, activeStep],
    );

    const completedCount = steps.filter(
        (step) => step.status !== 'pending',
    ).length;

    const goTo = (index: number): void => {
        const target = steps[index];

        if (target) {
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
        const target = steps.find((step) => step.key === key);

        if (target && (target.status !== 'pending' || key === activeStep)) {
            setActiveStep(key);
        }
    };

    return (
        <div className="px-4 py-6">
            <Heading
                title="Finish setting up your business"
                description={`Complete these steps so you can start taking bookings — ${completedCount} of ${steps.length} done.`}
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full lg:w-64">
                    <nav
                        className="flex flex-col space-y-1"
                        aria-label="Onboarding steps"
                    >
                        {steps.map((step, index) => {
                            const isActive = step.key === activeStep;
                            const isCompleted = step.status === 'completed';
                            const isSkipped = step.status === 'skipped';
                            const isClickable =
                                step.status !== 'pending' || isActive;

                            return (
                                <button
                                    key={step.key}
                                    type="button"
                                    disabled={!isClickable}
                                    onClick={() => selectStep(step.key)}
                                    data-test={`onboarding-tab-${step.key}`}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                                        isActive
                                            ? 'bg-muted font-medium text-foreground'
                                            : 'text-muted-foreground',
                                        isClickable && !isActive
                                            ? 'hover:bg-muted/60'
                                            : '',
                                        !isClickable ? 'opacity-60' : '',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                                            isCompleted
                                                ? 'bg-primary text-primary-foreground'
                                                : isSkipped
                                                  ? 'bg-muted-foreground/20 text-muted-foreground'
                                                  : isActive
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'border border-border text-muted-foreground',
                                        )}
                                    >
                                        {isCompleted ? (
                                            <Check className="h-3.5 w-3.5" />
                                        ) : isSkipped ? (
                                            <Minus className="h-3.5 w-3.5" />
                                        ) : (
                                            index + 1
                                        )}
                                    </span>
                                    <span className="flex-1">{step.label}</span>
                                    {step.mandatory ? (
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl">
                        {activeStep === 'locations' ? (
                            <StepLocations
                                data={onboarding.locations}
                                controls={controls}
                            />
                        ) : null}
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
        </div>
    );
}
