import { Head, Link } from '@inertiajs/react';
import { LayoutDashboard } from 'lucide-react';

import { PublicBookingFlow } from '@/components/public-booking/booking-flow';
import type { PublicBookingProps } from '@/components/public-booking/booking-flow';
import { Button } from '@/components/ui/button';
import { usePublicTheme } from '@/hooks/use-public-theme';
import { brandStyle } from '@/lib/brand';
import { dashboard } from '@/routes';

type PageProps = PublicBookingProps & {
    /** True when the signed-in visitor is a member of this company. */
    canManage?: boolean;
};

export default function PublicAppointmentBooking({
    canManage = false,
    ...props
}: PageProps) {
    const { theme, setTheme } = usePublicTheme();

    return (
        <div
            className="flex min-h-svh w-full justify-center bg-muted/30"
            style={brandStyle(props.company.brand)}
        >
            <Head title={`Book an appointment · ${props.company.name}`} />

            <div className="flex w-full max-w-[460px] flex-col">
                {canManage && (
                    <div className="flex items-center justify-between gap-3 px-5 pt-3">
                        <span className="text-xs text-muted-foreground">
                            You're viewing your booking page
                        </span>
                        <Button asChild size="sm" variant="outline">
                            <Link href={dashboard.url()}>
                                <LayoutDashboard />
                                Go to dashboard
                            </Link>
                        </Button>
                    </div>
                )}

                <PublicBookingFlow
                    {...props}
                    theme={theme}
                    onThemeChange={setTheme}
                />
            </div>
        </div>
    );
}
