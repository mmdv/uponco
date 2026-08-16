import { CheckCircle2 } from 'lucide-react';
import { Button, Input, Label, ScreenFooterBar } from 'uponco';

export function OnboardingStepFooter() {
    return (
        <div className="w-full max-w-md rounded-2xl border border-border bg-background px-4 md:px-8">
            <div className="space-y-4 py-6">
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold tracking-tight">
                        What is your business called?
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Customers see this name on your booking page.
                    </p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="business-name">Business name</Label>
                    <Input
                        id="business-name"
                        defaultValue="Nizami Studio"
                        readOnly
                    />
                </div>
            </div>
            <ScreenFooterBar>
                <div className="flex items-center justify-between gap-3">
                    <Button variant="ghost">Back</Button>
                    <Button className="min-w-32">Continue</Button>
                </div>
            </ScreenFooterBar>
        </div>
    );
}

export function DoneScreenFooter() {
    return (
        <div className="w-full max-w-md rounded-2xl border border-border bg-background px-4 md:px-8">
            <div className="flex flex-col items-center gap-4 py-10 text-center">
                <CheckCircle2 className="size-12 text-primary" />
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        That's it — you're all set
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Your booking page is live. Share the link and take your
                        first booking.
                    </p>
                </div>
            </div>
            <ScreenFooterBar>
                <div className="flex justify-center">
                    <Button size="lg" className="min-w-40">
                        Go to dashboard
                    </Button>
                </div>
            </ScreenFooterBar>
        </div>
    );
}

export function StickyOverScrollingBody() {
    return (
        <div className="flex h-80 w-full max-w-md flex-col overflow-y-auto rounded-2xl border border-border bg-background px-4 md:px-8">
            <div className="space-y-3 py-6">
                <h2 className="text-xl font-semibold tracking-tight">
                    Pick your services
                </h2>
                {[
                    'Deep Tissue Massage',
                    'Hot Stone Therapy',
                    'Aromatherapy Facial',
                    'Gel Manicure',
                    'Classic Pedicure',
                    'Beard Trim',
                    'Reformer Pilates',
                ].map((title) => (
                    <div
                        key={title}
                        className="rounded-xl border border-border px-3 py-2.5 text-sm"
                    >
                        {title}
                    </div>
                ))}
            </div>
            <ScreenFooterBar>
                <Button className="w-full">Continue with 3 services</Button>
            </ScreenFooterBar>
        </div>
    );
}
