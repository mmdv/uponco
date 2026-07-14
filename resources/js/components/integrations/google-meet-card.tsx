import { Form } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { connect, disconnect } from '@/routes/integrations/google';
import type { GoogleIntegrationStatus } from '@/types';

type Props = {
    google: GoogleIntegrationStatus;
};

/**
 * Connect/disconnect row for the user's Google account, used both on the
 * integrations settings page and in the onboarding services step.
 */
export default function GoogleMeetCard({ google }: Props) {
    const { t } = useTranslation('settings');

    return (
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
                <p className="text-sm font-medium">
                    {google.connected
                        ? t('integrations.connected')
                        : t('integrations.notConnected')}
                </p>
                <p className="text-sm text-muted-foreground">
                    {google.connected && google.email
                        ? google.email
                        : t('integrations.connectedHint')}
                </p>
            </div>

            {google.connected ? (
                <Form {...disconnect.form()} options={{ preserveScroll: true }}>
                    {({ processing }) => (
                        <Button
                            type="submit"
                            variant="outline"
                            disabled={processing}
                            data-test="google-disconnect-button"
                        >
                            {t('integrations.disconnect')}
                        </Button>
                    )}
                </Form>
            ) : (
                <Button asChild data-test="google-connect-button">
                    {/* External OAuth redirect — must be a full-page
                        navigation, not an Inertia visit. */}
                    <a href={connect.url()}>{t('integrations.connect')}</a>
                </Button>
            )}
        </div>
    );
}
