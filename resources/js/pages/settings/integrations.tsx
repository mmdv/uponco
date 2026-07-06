import { Form, Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { edit } from '@/routes/integrations';
import { connect, disconnect } from '@/routes/integrations/google';

type GoogleStatus = {
    connected: boolean;
    email: string | null;
};

export default function Integrations({ google }: { google: GoogleStatus }) {
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

                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">
                            {google.connected
                                ? 'Connected'
                                : 'Not connected'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {google.connected && google.email
                                ? google.email
                                : 'Online bookings assigned to you will include a Meet link once connected.'}
                        </p>
                    </div>

                    {google.connected ? (
                        <Form
                            {...disconnect.form()}
                            options={{ preserveScroll: true }}
                        >
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
