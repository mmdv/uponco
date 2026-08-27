import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

type Props = {
    step: number;
    /**
     * Whether the current step is complete. Gates Continue on steps 0–1 only:
     * the final Confirm stays clickable so pressing it can explain what is
     * missing, rather than going dead with no reason given.
     */
    canContinue: boolean;
    processing: boolean;
    onBack: () => void;
    onContinue: () => void;
    onSubmit: () => void;
    /**
     * What the primary button says on steps 0–1. When step one had nothing to
     * choose, "Continue" implies there was — this says where it actually goes.
     */
    continueLabel?: string;
    /** Pins the bar to its container instead of the viewport (embedded preview). */
    embedded?: boolean;
};

/**
 * Sticky bottom navigation: back button plus the step-aware primary action
 * (Continue on steps 0–1, Confirm booking on the final step).
 */
export default function BookingFooter({
    step,
    canContinue,
    processing,
    onBack,
    onContinue,
    onSubmit,
    continueLabel,
    embedded = false,
}: Props) {
    const { t } = useTranslation('booking');

    return (
        <footer
            className={cn(
                'flex w-full items-center gap-3 px-5 py-3.5',
                embedded
                    ? 'sticky bottom-0'
                    : 'fixed inset-x-0 bottom-0 mx-auto max-w-[460px]',
            )}
        >
            {step > 0 && (
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-[50px] shrink-0"
                    onClick={onBack}
                    aria-label={t('footer.back')}
                >
                    <ArrowLeft className="size-5" />
                </Button>
            )}

            {step < 2 ? (
                <Button
                    type="button"
                    className="h-[50px] flex-1 text-base"
                    disabled={!canContinue}
                    onClick={onContinue}
                    data-test="appointment-continue-button"
                >
                    {continueLabel ?? t('footer.continue')}
                </Button>
            ) : (
                <Button
                    type="button"
                    className="h-[50px] flex-1 text-base"
                    disabled={processing}
                    onClick={onSubmit}
                    data-test="appointment-save-button"
                >
                    {t('footer.confirm')}
                </Button>
            )}
        </footer>
    );
}
