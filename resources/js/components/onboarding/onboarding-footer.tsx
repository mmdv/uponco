import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    label?: string;
    disabled?: boolean;
    saving?: boolean;
    /**
     * When provided, the button is a plain button calling this handler. When
     * omitted, it submits the surrounding form.
     */
    onClick?: () => void;
};

/**
 * The one action every screen ends with, pinned to the bottom of the viewport
 * so it stays under the thumb on a phone.
 */
export default function OnboardingFooter({
    label = 'Continue',
    disabled = false,
    saving = false,
    onClick,
}: Props) {
    // Bleeds to the screen edges on a phone, where the bar reads as part of the
    // chrome; on wider screens it stays inside the content column.
    return (
        <div className="sticky inset-x-0 bottom-0 -mx-4 mt-auto border-t bg-background/95 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur sm:mx-0 sm:px-0">
            <div className="mx-auto flex w-full max-w-xl justify-end">
                <Button
                    type={onClick ? 'button' : 'submit'}
                    onClick={onClick}
                    disabled={disabled || saving}
                    size="lg"
                    className="w-full sm:w-auto"
                    data-test="onboarding-continue"
                >
                    {saving ? <Spinner /> : null}
                    {label}
                </Button>
            </div>
        </div>
    );
}
