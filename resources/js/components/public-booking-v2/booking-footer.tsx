import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

type Props = {
    step: number;
    /**
     * Whether the step can move on. Only step two (no time picked) actually
     * disables the button; step one instead says what is missing and opens it,
     * and the final Confirm stays clickable so pressing it can explain itself.
     */
    canContinue: boolean;
    processing: boolean;
    onBack: () => void;
    onContinue: () => void;
    onSubmit: () => void;
    /** What the primary button says on steps 0–1. */
    continueLabel: string;
    /** Pins the bar to its container instead of the viewport (embedded preview). */
    embedded?: boolean;
};

/**
 * Sticky bottom navigation: a back button plus the step-aware primary action,
 * over a fade so the content scrolls away beneath it rather than being cut.
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
                'z-20 flex w-full items-center gap-3 bg-gradient-to-t from-background via-background/95 to-background/0 px-5 pt-6 pb-[max(0.875rem,env(safe-area-inset-bottom))]',
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
                    className="size-[50px] shrink-0 bg-background"
                    onClick={onBack}
                    aria-label={t('footer.back')}
                    disabled={processing}
                >
                    <ArrowLeft className="size-5" />
                </Button>
            )}

            {step < 2 ? (
                <Button
                    type="button"
                    className="group h-[50px] flex-1 text-base"
                    disabled={!canContinue}
                    onClick={onContinue}
                    data-test="appointment-continue-button"
                >
                    <span
                        key={continueLabel}
                        className="motion-safe:animate-rise-in"
                    >
                        {continueLabel}
                    </span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
            ) : (
                <Button
                    type="button"
                    className="h-[50px] flex-1 text-base"
                    disabled={processing}
                    onClick={onSubmit}
                    data-test="appointment-save-button"
                >
                    {processing ? (
                        <Spinner className="size-5" />
                    ) : (
                        <Lock className="size-4" />
                    )}
                    {t('footer.confirm')}
                </Button>
            )}
        </footer>
    );
}
