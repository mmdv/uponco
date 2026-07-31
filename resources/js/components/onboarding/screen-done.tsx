import { Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';

export default function ScreenDone({ teamSlug }: { teamSlug: string }) {
    return (
        <div className="flex flex-col items-center gap-4 pt-10 text-center">
            <CheckCircle2 className="size-12 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
                That's it — you're all set
            </h1>
            <p className="text-sm text-muted-foreground">
                Your booking page is live. Share the link and take your first
                booking.
            </p>

            <Button asChild size="lg" className="mt-4 w-full sm:w-auto">
                <Link href={dashboard(teamSlug)} data-test="onboarding-done">
                    Go to dashboard
                </Link>
            </Button>
        </div>
    );
}
