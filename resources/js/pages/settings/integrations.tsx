import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import GoogleMeetCard from '@/components/integrations/google-meet-card';
import { useTranslation } from '@/hooks/use-translation';
import { edit } from '@/routes/integrations';
import type { GoogleIntegrationStatus } from '@/types';

export default function Integrations({
    google,
}: {
    google: GoogleIntegrationStatus;
}) {
    const { t } = useTranslation('settings');

    return (
        <>
            <Head title={t('integrations.title')} />

            <h1 className="sr-only">{t('integrations.title')}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t('integrations.googleMeetTitle')}
                    description={t('integrations.googleMeetDescription')}
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
