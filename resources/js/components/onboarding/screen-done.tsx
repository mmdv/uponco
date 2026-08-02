import { Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';

import { ScreenBody, ScreenFooterBar } from './onboarding-screen';

export default function ScreenDone() {
    return (
        <div className="flex min-h-full flex-1 flex-col">
            <ScreenBody className="items-center text-center">
                <CheckCircle2 className="size-14 text-primary" />

                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground md:text-3xl">
                        That's it — you're all set
                    </h1>
                    <p className="text-base text-pretty text-muted-foreground">
                        Your booking page is live. Share the link and take your
                        first booking.
                    </p>
                </div>
            </ScreenBody>

            <ScreenFooterBar>
                <div className="flex justify-center">
                    <Button
                        asChild
                        size="lg"
                        className="w-full sm:w-auto sm:min-w-40"
                    >
                        <Link href={dashboard()} data-test="onboarding-done">
                            Go to dashboard
                        </Link>
                    </Button>
                </div>
            </ScreenFooterBar>
        </div>
    );
}
