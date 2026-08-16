import { CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Button,
    Input,
    Label,
    ScreenBody,
    ScreenFooterBar,
    Textarea,
} from 'uponco';

/**
 * The onboarding card the screens actually live in — a fixed height is what
 * makes `ScreenBody`'s flex-1 vertical centring visible.
 */
function OnboardingCard({ children }: { children: ReactNode }) {
    return (
        <div
            className="mx-auto flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border bg-background px-8"
            style={{ height: 560 }}
        >
            {children}
        </div>
    );
}

export function BusinessDetailsStep() {
    return (
        <OnboardingCard>
            <ScreenBody>
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-balance">
                        Tell us about your business
                    </h1>
                    <p className="text-base text-pretty text-muted-foreground">
                        This is the name customers see on your booking page.
                    </p>
                </div>

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="ob-name">Business name</Label>
                        <Input
                            id="ob-name"
                            defaultValue="Aurora Beauty Studio"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="ob-about">About</Label>
                        <Textarea
                            id="ob-about"
                            defaultValue="Massage, nails and skincare in the heart of Baku. Walk-ins welcome on weekdays."
                        />
                    </div>
                </div>
            </ScreenBody>

            <ScreenFooterBar>
                <div className="flex justify-end">
                    <Button size="lg">Continue</Button>
                </div>
            </ScreenFooterBar>
        </OnboardingCard>
    );
}

export function CentredDoneScreen() {
    return (
        <OnboardingCard>
            <ScreenBody className="items-center text-center">
                <CheckCircle2 className="size-14 text-primary" />
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-balance">
                        That&rsquo;s it — you&rsquo;re all set
                    </h1>
                    <p className="text-base text-pretty text-muted-foreground">
                        Your booking page is live. Share the link and take your
                        first booking.
                    </p>
                </div>
            </ScreenBody>

            <ScreenFooterBar>
                <div className="flex justify-center">
                    <Button size="lg" className="w-full sm:w-auto sm:min-w-40">
                        Go to dashboard
                    </Button>
                </div>
            </ScreenFooterBar>
        </OnboardingCard>
    );
}

export function ServiceStepWithFields() {
    return (
        <OnboardingCard>
            <ScreenBody>
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-balance">
                        Add your first service
                    </h1>
                    <p className="text-base text-pretty text-muted-foreground">
                        You can add the rest later, from the services page.
                    </p>
                </div>

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="ob-service">Service name</Label>
                        <Input
                            id="ob-service"
                            defaultValue="Deep Tissue Massage"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="ob-duration">Duration</Label>
                            <Input id="ob-duration" defaultValue="60 min" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ob-price">Price</Label>
                            <Input id="ob-price" defaultValue="₼80" />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="ob-desc">Description</Label>
                        <Textarea
                            id="ob-desc"
                            defaultValue="Firm pressure for shoulders, back and neck."
                        />
                    </div>
                </div>
            </ScreenBody>

            <ScreenFooterBar>
                <div className="flex justify-between">
                    <Button variant="ghost" size="lg">
                        Back
                    </Button>
                    <Button size="lg">Create service</Button>
                </div>
            </ScreenFooterBar>
        </OnboardingCard>
    );
}
