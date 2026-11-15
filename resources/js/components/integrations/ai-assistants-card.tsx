import { Form } from '@inertiajs/react';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { destroy } from '@/routes/integrations/ai-assistants';
import type { AiAssistantsStatus } from '@/types';

type Props = {
    aiAssistants: AiAssistantsStatus;
};

/**
 * The "AI assistants" section of the integrations settings: the MCP server
 * address to paste into Claude or ChatGPT, how to connect, and the apps that
 * are connected now with a way to disconnect each.
 */
export default function AiAssistantsCard({ aiAssistants }: Props) {
    const { t, locale } = useTranslation('settings');
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(aiAssistants.serverUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard access can be blocked; the address stays visible to copy.
        }
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });

    return (
        <div className="space-y-4">
            <div className="space-y-2 rounded-lg border p-4">
                <p className="text-sm font-medium">
                    {t('integrations.aiServerUrl')}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <code
                        className="min-w-0 flex-1 truncate rounded-md bg-muted px-3 py-2 text-sm"
                        data-test="ai-server-url"
                    >
                        {aiAssistants.serverUrl}
                    </code>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCopy}
                        data-test="ai-server-url-copy"
                    >
                        {copied ? <Check /> : <Copy />}
                        {copied
                            ? t('integrations.aiCopied')
                            : t('integrations.aiCopy')}
                    </Button>
                </div>

                <div className="space-y-1.5 pt-2">
                    <p className="text-sm font-medium">
                        {t('integrations.aiStepsTitle')}
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>{t('integrations.aiStepClaude')}</li>
                        <li>{t('integrations.aiStepChatGpt')}</li>
                    </ul>
                    <p className="text-sm text-muted-foreground">
                        {t('integrations.aiStepNote')}
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm font-medium">
                    {t('integrations.aiConnectedTitle')}
                </p>

                {aiAssistants.connected.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        {t('integrations.aiNoneConnected')}
                    </p>
                ) : (
                    <ul className="divide-y rounded-lg border">
                        {aiAssistants.connected.map((assistant) => (
                            <li
                                key={assistant.client_id}
                                className="flex items-center justify-between gap-4 p-4"
                                data-test="ai-connected-app"
                            >
                                <div className="min-w-0 space-y-0.5">
                                    <p className="truncate text-sm font-medium">
                                        {assistant.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {t('integrations.aiLastActive', {
                                            date: formatDate(
                                                assistant.last_active_at,
                                            ),
                                        })}
                                    </p>
                                </div>

                                <Form
                                    {...destroy.form(assistant.client_id)}
                                    options={{ preserveScroll: true }}
                                >
                                    {({ processing }) => (
                                        <Button
                                            type="submit"
                                            variant="outline"
                                            disabled={processing}
                                            data-test="ai-disconnect-button"
                                        >
                                            {t('integrations.aiDisconnect')}
                                        </Button>
                                    )}
                                </Form>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
