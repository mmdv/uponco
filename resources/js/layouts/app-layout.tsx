import TermsConsentDialog from '@/components/terms-consent-dialog';
import AppLayoutTemplate from '@/layouts/app/app-header-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}

            {/*
                Lives in the shell rather than on the dashboard so a user who
                deep-links straight to any page — or lands on one from a
                notification — is asked just the same. Renders nothing once the
                terms in force have been accepted.
            */}
            <TermsConsentDialog />
        </AppLayoutTemplate>
    );
}
