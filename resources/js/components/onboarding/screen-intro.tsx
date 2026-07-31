import { CalendarClock, MapPin, Tag, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import OnboardingFooter from './onboarding-footer';
import ScreenHeader from './screen-header';

const checklist: { icon: LucideIcon; label: string }[] = [
    { icon: MapPin, label: 'How and where you work' },
    { icon: Tag, label: 'Your first service' },
    { icon: UserRound, label: 'Your work profile' },
    { icon: CalendarClock, label: 'Your work hours' },
];

export default function ScreenIntro({ onStart }: { onStart: () => void }) {
    return (
        <div className="flex flex-1 flex-col space-y-8">
            <ScreenHeader
                title="Finish setting up your business"
                description="Four quick things and you're ready to take bookings."
            />

            <ul className="space-y-4">
                {checklist.map((item) => (
                    <li
                        key={item.label}
                        className="flex items-center gap-3 text-sm"
                    >
                        <item.icon className="size-5 shrink-0 text-muted-foreground" />
                        {item.label}
                    </li>
                ))}
            </ul>

            <OnboardingFooter label="Get started" onClick={onStart} />
        </div>
    );
}
