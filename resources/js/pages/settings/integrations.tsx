import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import AiAssistantsCard from '@/components/integrations/ai-assistants-card';
import GoogleMeetCard from '@/components/integrations/google-meet-card';
import { useTranslation } from '@/hooks/use-translation';
import { edit } from '@/routes/integrations';
import type { AiAssistantsStatus, GoogleIntegrationStatus } from '@/types';

export default function Integrations({
    google,
    aiAssistants,
}: {
    google: GoogleIntegrationStatus;
    aiAssistants: AiAssistantsStatus;
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

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t('integrations.aiAssistantsTitle')}
                    description={t('integrations.aiAssistantsDescription')}
                />

                <AiAssistantsCard aiAssistants={aiAssistants} />
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
