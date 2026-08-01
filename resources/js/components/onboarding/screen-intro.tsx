import { CalendarClock, MapPin, Tag, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import OnboardingFooter from './onboarding-footer';
import OnboardingScreen from './onboarding-screen';
import ScreenHeader from './screen-header';

const checklist: { icon: LucideIcon; label: string; description: string }[] = [
    {
        icon: MapPin,
        label: 'How and where you work',
        description: 'In person, online, or both.',
    },
    {
        icon: Tag,
        label: 'Your first service',
        description: 'What clients can book with you.',
    },
    {
        icon: UserRound,
        label: 'Your work profile',
        description: 'The name and photo clients see.',
    },
    {
        icon: CalendarClock,
        label: 'Your work hours',
        description: "When you're open for bookings.",
    },
];

export default function ScreenIntro({ onStart }: { onStart: () => void }) {
    return (
        <OnboardingScreen
            footer={<OnboardingFooter label="Get started" onClick={onStart} />}
        >
            <ScreenHeader
                title="Finish setting up your business"
                description="Four quick things and you're ready to take bookings."
            />

            {/*
             * A connected timeline rather than a list of cards: the vertical
             * rule reads as "here's what's ahead" and keeps these items from
             * looking like tappable buttons.
             */}
            <ol className="md:py-2">
                {checklist.map((item, index) => {
                    const isLast = index === checklist.length - 1;

                    return (
                        <li key={item.label} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <item.icon className="size-5" />
                                </span>
                                {!isLast ? (
                                    <span className="my-1 w-px flex-1 bg-border" />
                                ) : null}
                            </div>
                            <div className={cn('pt-1.5', !isLast && 'pb-6')}>
                                <p className="font-medium text-foreground">
                                    {item.label}
                                </p>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    {item.description}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </OnboardingScreen>
    );
}
