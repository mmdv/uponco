import {
    CheckCircle2,
    Link2,
    Sparkles,
    TriangleAlert,
    Video,
} from 'lucide-react';

import GoogleMeetCard from '@/components/integrations/google-meet-card';
import ChoiceCard from '@/components/services/service-wizard/choice-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/use-translation';
import type { GoogleIntegrationStatus } from '@/types';

/**
 * Online branch step: does the meeting link get generated automatically
 * (`google_meet`) or does the business send one themselves (`custom`)?
 */
export default function StepOnlineMethod({
    value,
    onChange,
    google,
}: {
    value: string;
    onChange: (value: string) => void;
    google: GoogleIntegrationStatus;
}) {
    const { t } = useTranslation('company');

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h3 className="text-sm font-medium">
                    {t('services.wizard.online.heading')}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {t('services.wizard.online.subheading')}
                </p>
            </div>

            <div
                role="radiogroup"
                aria-label={t('services.wizard.online.heading')}
                className="space-y-3"
            >
                <ChoiceCard
                    icon={Sparkles}
                    title={t('services.wizard.online.automaticTitle')}
                    description={t(
                        'services.wizard.online.automaticDescription',
                    )}
                    selected={value === 'google_meet'}
                    onSelect={() => onChange('google_meet')}
                    data-test="wizard-online-automatic"
                />
                <ChoiceCard
                    icon={Link2}
                    title={t('services.wizard.online.manualTitle')}
                    description={t('services.wizard.online.manualDescription')}
                    selected={value === 'custom'}
                    onSelect={() => onChange('custom')}
                    data-test="wizard-online-manual"
                />
            </div>

            {value === 'google_meet' && (
                <div className="space-y-3">
                    <div className="space-y-2 rounded-lg border p-4">
                        <p className="text-sm font-medium">
                            {t('services.wizard.online.providersLabel')}
                        </p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <Video className="size-4 text-primary" />
                                <span>Google Meet</span>
                                <CheckCircle2 className="size-4 text-primary" />
                            </li>
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <Video className="size-4" />
                                <span>Microsoft Teams</span>
                                <Badge variant="secondary">
                                    {t('services.wizard.online.comingSoon')}
                                </Badge>
                            </li>
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <Video className="size-4" />
                                <span>Zoom</span>
                                <Badge variant="secondary">
                                    {t('services.wizard.online.comingSoon')}
                                </Badge>
                            </li>
                        </ul>
                    </div>

                    {google.connected ? (
                        <p
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                            data-test="wizard-google-connected"
                        >
                            <CheckCircle2 className="size-4 text-primary" />
                            {t('services.wizard.online.connectedAs', {
                                email: google.email ?? '',
                            })}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            <GoogleMeetCard google={google} />
                            <Alert data-test="wizard-google-warning">
                                <TriangleAlert />
                                <AlertTitle>
                                    {t('services.wizard.online.connectTitle')}
                                </AlertTitle>
                                <AlertDescription>
                                    {t('services.wizard.online.connectHint')}
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                </div>
            )}

            {value === 'custom' && (
                <Alert data-test="wizard-manual-note">
                    <Link2 />
                    <AlertTitle>
                        {t('services.wizard.online.manualNoteTitle')}
                    </AlertTitle>
                    <AlertDescription>
                        {t('services.wizard.online.manualNote')}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
