import { CalendarClock, MapPin, Tag, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

import OnboardingFooter from './onboarding-footer';
import OnboardingScreen from './onboarding-screen';
import ScreenHeader from './screen-header';

const checklist: { icon: LucideIcon; key: string }[] = [
    { icon: MapPin, key: 'delivery' },
    { icon: Tag, key: 'service' },
    { icon: UserRound, key: 'profile' },
    { icon: CalendarClock, key: 'schedule' },
];

export default function ScreenIntro({ onStart }: { onStart: () => void }) {
    const { t } = useTranslation('onboard');

    return (
        <OnboardingScreen
            footer={
                <OnboardingFooter
                    label={t('intro.getStarted')}
                    onClick={onStart}
                />
            }
        >
            <ScreenHeader
                title={t('intro.title')}
                description={t('intro.description')}
            />

            {/*
             * A connected timeline whose items double as entry points: each row
             * is a button that starts the flow, while the vertical rule keeps
             * the "here's what's ahead" reading.
             */}
            <ol className="md:py-2">
                {checklist.map((item, index) => {
                    const isLast = index === checklist.length - 1;

                    return (
                        <li key={item.key} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <item.icon className="size-5" />
                                </span>
                                {!isLast ? (
                                    <span className="my-1 w-px flex-1 bg-border" />
                                ) : null}
                            </div>
                            <button
                                type="button"
                                onClick={onStart}
                                className={cn(
                                    '-mx-2 flex-1 rounded-lg px-2 pt-1.5 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none',
                                    !isLast && 'mb-6 pb-1.5',
                                )}
                            >
                                <p className="font-medium text-foreground">
                                    {t(`intro.checklist.${item.key}.label`)}
                                </p>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    {t(
                                        `intro.checklist.${item.key}.description`,
                                    )}
                                </p>
                            </button>
                        </li>
                    );
                })}
            </ol>
        </OnboardingScreen>
    );
}
