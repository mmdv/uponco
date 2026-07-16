import { Link } from '@inertiajs/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    analyticsConfigured,
    currentConsent,
    denyConsent,
    grantConsent,
    isEmbedded,
    shouldShowConsentBanner,
} from '@/lib/analytics';
import { privacy } from '@/routes';

/**
 * Asks the visitor before any analytics cookie is set. Until a choice is made
 * tracking runs cookieless, so declining loses a returning visitor's identity
 * rather than the visit itself.
 */
export default function ConsentBanner() {
    const [visible, setVisible] = useState(() =>
        shouldShowConsentBanner(
            analyticsConfigured(),
            isEmbedded(),
            currentConsent(),
        ),
    );

    if (!visible) {
        return null;
    }

    const decide = (accepted: boolean) => {
        if (accepted) {
            grantConsent();
        } else {
            denyConsent();
        }

        setVisible(false);
    };

    return (
        <div
            role="region"
            aria-label="Cookie consent"
            className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        >
            <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                    We use cookies to understand how our site is used and to
                    improve it. See our{' '}
                    <Link
                        href={privacy()}
                        className="underline underline-offset-4 hover:text-foreground"
                    >
                        privacy policy
                    </Link>
                    .
                </p>

                <div className="flex shrink-0 gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => decide(false)}
                        data-test="consent-decline-button"
                    >
                        Decline
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => decide(true)}
                        data-test="consent-accept-button"
                    >
                        Accept
                    </Button>
                </div>
            </div>
        </div>
    );
}
