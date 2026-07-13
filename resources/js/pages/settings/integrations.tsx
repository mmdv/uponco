import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import GoogleMeetCard from '@/components/integrations/google-meet-card';
import { edit } from '@/routes/integrations';
import type { GoogleIntegrationStatus } from '@/types';

export default function Integrations({
    google,
}: {
    google: GoogleIntegrationStatus;
}) {
    return (
        <>
            <Head title="Integrations" />

            <h1 className="sr-only">Integrations</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Google Meet"
                    description="Connect your Google account so online appointments get a Google Meet link automatically."
                />

                <GoogleMeetCard google={google} />
            </div>
        </>
    );
}

Integrations.layout = {
    breadcrumbs: [
        {
            title: 'Integrations',
            href: edit(),
        },
    ],
};
