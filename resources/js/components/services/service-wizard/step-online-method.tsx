import { Link2, Sparkles, TriangleAlert } from 'lucide-react';

import ChoiceCard from '@/components/services/service-wizard/choice-card';
import { useTranslation } from '@/hooks/use-translation';
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
 *
 * Connecting Google is deliberately not offered here: it is a full-page OAuth
 * redirect that would throw the in-progress draft away. The step only says what
 * is missing; the service list offers the connection once the service exists.
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
                            {google.connected ? (
                                <p
                                    className="text-sm text-muted-foreground"
                                    data-test="wizard-google-connected"
                                >
                                    {t('services.wizard.online.connectedAs', {
                                        email: google.email ?? '',
                                    })}
                                </p>
                            ) : (
                                <div
                                    className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
                                    data-test="wizard-google-missing"
                                >
                                    <TriangleAlert className="size-4 shrink-0 text-destructive" />
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-medium text-destructive">
                                            {t(
                                                'services.wizard.online.notConnectedTitle',
                                            )}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {t(
                                                'services.wizard.online.notConnectedNote',
                                            )}
                                        </p>
                                    </div>
                                </div>
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
