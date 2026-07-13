import { Form } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
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
    return (
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
                <p className="text-sm font-medium">
                    {google.connected ? 'Connected' : 'Not connected'}
                </p>
                <p className="text-sm text-muted-foreground">
                    {google.connected && google.email
                        ? google.email
                        : 'Online bookings assigned to you will include a Meet link once connected.'}
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
                            Disconnect
                        </Button>
                    )}
                </Form>
            ) : (
                <Button asChild data-test="google-connect-button">
                    {/* External OAuth redirect — must be a full-page
                        navigation, not an Inertia visit. */}
                    <a href={connect.url()}>Connect Google</a>
                </Button>
            )}
        </div>
    );
}
