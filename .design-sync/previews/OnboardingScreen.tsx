import { CalendarClock, MapPin, Tag, UserRound } from 'lucide-react';
import {
    Input,
    Label,
    OnboardingFooter,
    OnboardingScreen,
    ScreenHeader,
} from 'uponco';

const CHECKLIST = [
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

/** The onboarding wizard runs full-height; the card gives it something to fill. */
function Frame({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full max-w-md overflow-hidden rounded-xl border bg-background px-4 md:px-8">
            {children}
        </div>
    );
}

export function IntroScreen() {
    return (
        <Frame>
            <OnboardingScreen
                footer={<OnboardingFooter label="Get started" onClick={() => {}} />}
            >
                <ScreenHeader
                    title="Finish setting up your business"
                    description="Four quick things and you're ready to take bookings."
                />
                <ol>
                    {CHECKLIST.map((item, index) => {
                        const isLast = index === CHECKLIST.length - 1;

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
                                <div
                                    className={
                                        isLast ? 'flex-1 pt-1.5' : 'mb-6 flex-1 pt-1.5'
                                    }
                                >
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
        </Frame>
    );
}

export function FormScreen() {
    return (
        <Frame>
            <OnboardingScreen footer={<OnboardingFooter onClick={() => {}} />}>
                <ScreenHeader
                    title="Your first service"
                    description="You can add the rest of your menu later."
                />
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="service-name">Service name</Label>
                        <Input
                            id="service-name"
                            className="h-12"
                            defaultValue="Deep Tissue Massage"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="service-duration">Duration</Label>
                            <Input
                                id="service-duration"
                                className="h-12"
                                defaultValue="60 min"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="service-price">Price</Label>
                            <Input
                                id="service-price"
                                className="h-12"
                                defaultValue="₼75"
                            />
                        </div>
                    </div>
                </div>
            </OnboardingScreen>
        </Frame>
    );
}

export function SavingFooter() {
    return (
        <Frame>
            <OnboardingScreen
                footer={
                    <OnboardingFooter
                        label="Save and finish"
                        saving
                        onClick={() => {}}
                    />
                }
            >
                <ScreenHeader
                    title="Your work hours"
                    description="Clients will only see the times you're open."
                />
                <div className="space-y-2 text-sm">
                    {[
                        ['Monday', '09:00 – 19:00'],
                        ['Tuesday', '09:00 – 19:00'],
                        ['Wednesday', '09:00 – 19:00'],
                        ['Thursday', '09:00 – 19:00'],
                        ['Friday', '09:00 – 17:00'],
                    ].map(([day, hours]) => (
                        <div
                            key={day}
                            className="flex items-center justify-between rounded-lg border bg-card px-3 py-2"
                        >
                            <span className="font-medium">{day}</span>
                            <span className="text-muted-foreground tabular-nums">
                                {hours}
                            </span>
                        </div>
                    ))}
                </div>
            </OnboardingScreen>
        </Frame>
    );
}
