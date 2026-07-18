import { CheckCircle2, Link2, Sparkles } from 'lucide-react';

import ChoiceCard from '@/components/services/service-wizard/choice-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { connect } from '@/routes/integrations/google';
import type { GoogleIntegrationStatus } from '@/types';

/**
 * The follow-up panel for whichever method is selected. Sits directly under its
 * card on a muted background so it reads as an extension of that choice rather
 * than another decision.
 */
function MethodPanel({
    heading,
    description,
    children,
    'data-test': dataTest,
}: {
    heading: string;
    description: string;
    children?: React.ReactNode;
    'data-test'?: string;
}) {
    return (
        <div
            className="mt-2 space-y-3 rounded-lg border bg-muted/50 p-4"
            data-test={dataTest}
        >
            <div className="space-y-1">
                <p className="text-sm font-medium">{heading}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {children}
        </div>
    );
}

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
                <div>
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

                    {value === 'google_meet' && (
                        <MethodPanel
                            heading={t(
                                'services.wizard.online.providersHeading',
                            )}
                            description={t(
                                'services.wizard.online.providersDescription',
                            )}
                            data-test="wizard-online-providers"
                        >
                            <div className="flex flex-wrap gap-2">
                                {google.connected ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled
                                        data-test="wizard-google-connected"
                                    >
                                        <CheckCircle2 className="text-primary" />
                                        {t(
                                            'services.wizard.online.googleConnected',
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        data-test="wizard-setup-google"
                                    >
                                        {/* External OAuth redirect — must be a
                                            full-page navigation, not an Inertia
                                            visit. */}
                                        <a href={connect.url()}>
                                            {t(
                                                'services.wizard.online.setupGoogle',
                                            )}
                                        </a>
                                    </Button>
                                )}

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled
                                    data-test="wizard-setup-teams"
                                >
                                    {t('services.wizard.online.setupTeams')}
                                    <Badge variant="secondary">
                                        {t('services.wizard.online.comingSoon')}
                                    </Badge>
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled
                                    data-test="wizard-setup-zoom"
                                >
                                    {t('services.wizard.online.setupZoom')}
                                    <Badge variant="secondary">
                                        {t('services.wizard.online.comingSoon')}
                                    </Badge>
                                </Button>
                            </div>

                            {google.connected && (
                                <p className="text-sm text-muted-foreground">
                                    {t('services.wizard.online.connectedAs', {
                                        email: google.email ?? '',
                                    })}
                                </p>
                            )}
                        </MethodPanel>
                    )}
                </div>

                <div>
                    <ChoiceCard
                        icon={Link2}
                        title={t('services.wizard.online.manualTitle')}
                        description={t(
                            'services.wizard.online.manualDescription',
                        )}
                        selected={value === 'custom'}
                        onSelect={() => onChange('custom')}
                        data-test="wizard-online-manual"
                    />

                    {value === 'custom' && (
                        <MethodPanel
                            heading={t(
                                'services.wizard.online.manualNoteTitle',
                            )}
                            description={t('services.wizard.online.manualNote')}
                            data-test="wizard-manual-note"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
