import { Head, router } from '@inertiajs/react';
import { CalendarX2, CheckCircle2, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cancel as cancelRoute } from '@/actions/App/Http/Controllers/PublicAppointmentController';
import BookingHeader from '@/components/public-booking/booking-header';
import type { PublicTheme } from '@/components/public-booking/booking-header';
import BookingSummary from '@/components/public-booking/booking-summary';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { buildDateTimeLabel } from '@/lib/booking';
import { businessCategoryIcon } from '@/lib/business-category-icons';

type CancelCompany = {
    name: string;
    slug: string;
    logo: string | null;
    /** The team's business category, from `App\Enums\BusinessCategory`. */
    category: string | null;
};

type CancelAppointment = {
    id: number;
    start_at: string;
    end_at: string;
    timezone: string;
    service: { id: number; title: string };
    specialist: { id: number; name: string };
    location: { id: number; name: string } | null;
};

type Props = {
    company: CancelCompany;
    appointment: CancelAppointment;
    isPast: boolean;
    alreadyCancelled: boolean;
    canCancel: boolean;
};

// The public page keeps its own light/dark preference, separate from the
// dashboard's appearance so a visitor's choice never affects the team's user.
const THEME_STORAGE_KEY = 'public-booking-appearance';

function readStoredTheme(): PublicTheme {
    if (typeof window === 'undefined') {
        return 'light';
    }

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === 'dark' || stored === 'light') {
        return stored;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

export default function PublicAppointmentCancel({
    company,
    appointment,
    isPast,
    alreadyCancelled,
    canCancel,
}: Props) {
    const [theme, setTheme] = useState<PublicTheme>(readStoredTheme);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Apply and persist the visitor's chosen theme for the public page.
    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
        root.style.colorScheme = theme;
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    const summary = {
        serviceTitle: appointment.service.title,
        specialistName: appointment.specialist.name,
        locationName: appointment.location?.name ?? null,
        dateTimeLabel: buildDateTimeLabel(
            appointment.start_at,
            appointment.end_at,
            appointment.timezone,
        ),
    };

    const submitCancellation = () => {
        setProcessing(true);

        // Post to the current URL so the signed-link query string (signature)
        // is preserved and the `signed` middleware still passes.
        router.post(
            `${cancelRoute.url({ appointment: appointment.id })}${window.location.search}`,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setConfirmOpen(false);
                },
            },
        );
    };

    return (
        <div className="flex min-h-svh w-full justify-center bg-muted/30">
            <Head title={`Cancel appointment · ${company.name}`} />

            <div className="flex w-full max-w-[460px] flex-col p-4">
                <BookingHeader
                    companyName={company.name}
                    logoUrl={company.logo}
                    theme={theme}
                    onThemeChange={setTheme}
                    showMenu={false}
                />

                <div className="mt-8">
                    {alreadyCancelled ? (
                        <StatusPanel
                            icon={CheckCircle2}
                            tone="muted"
                            title="This appointment is cancelled"
                            description="This booking has already been cancelled. If this was a mistake, you can book a new appointment at any time."
                        />
                    ) : isPast ? (
                        <StatusPanel
                            icon={Clock}
                            tone="muted"
                            title="This appointment can no longer be cancelled"
                            description="The appointment time has already passed. Please contact us directly if you have any questions."
                        />
                    ) : (
                        <div className="animate-in duration-500 fade-in-0">
                            <div className="flex flex-col items-center text-center">
                                <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                                    <CalendarX2 className="size-6" />
                                </div>
                                <h1 className="mt-4 text-xl font-semibold">
                                    Cancel your appointment?
                                </h1>
                                <p className="mt-1.5 text-sm text-muted-foreground">
                                    Please review the details below. Cancelling
                                    is permanent and will free up your time
                                    slot.
                                </p>
                            </div>

                            <div className="mt-6">
                                <BookingSummary
                                    {...summary}
                                    serviceIcon={businessCategoryIcon(
                                        company.category,
                                    )}
                                />
                            </div>

                            <Button
                                type="button"
                                variant="destructive"
                                className="mt-6 h-12 w-full text-base"
                                onClick={() => setConfirmOpen(true)}
                                data-test="cancel-appointment"
                            >
                                Cancel appointment
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel this appointment?</DialogTitle>
                        <DialogDescription>
                            Your {summary.dateTimeLabel} appointment with{' '}
                            {company.name} will be cancelled. This action cannot
                            be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Keep appointment
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={processing || !canCancel}
                            onClick={submitCancellation}
                            data-test="confirm-cancel-appointment"
                        >
                            {processing ? 'Cancelling…' : 'Yes, cancel it'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function StatusPanel({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof CheckCircle2;
    tone: 'muted';
    title: string;
    description: string;
}) {
    return (
        <div className="flex animate-in flex-col items-center px-1 py-6 text-center duration-500 fade-in-0">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Icon className="size-6" />
            </div>
            <h1 className="mt-4 text-xl font-semibold">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
                {description}
            </p>
        </div>
    );
}
