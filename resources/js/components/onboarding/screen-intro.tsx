import { CalendarClock, MapPin, Tag, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import OnboardingFooter from './onboarding-footer';
import OnboardingScreen from './onboarding-screen';
import ScreenHeader from './screen-header';

const checklist: { icon: LucideIcon; label: string }[] = [
    { icon: MapPin, label: 'How and where you work' },
    { icon: Tag, label: 'Your first service' },
    { icon: UserRound, label: 'Your work profile' },
    { icon: CalendarClock, label: 'Your work hours' },
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

            <ul className="space-y-3">
                {checklist.map((item) => (
                    <li
                        key={item.label}
                        className="flex items-center gap-3 rounded-lg border bg-card p-3 text-sm"
                    >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <item.icon className="size-4.5" />
                        </span>
                        {item.label}
                    </li>
                ))}
            </ul>
        </OnboardingScreen>
    );
}
