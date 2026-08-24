import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/use-translation';

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
 * The one action every screen ends with. Full width so it stays under the thumb
 * on a phone, and sized to its label once there is room for it.
 */
export default function OnboardingFooter({
    label,
    disabled = false,
    saving = false,
    onClick,
}: Props) {
    const { t } = useTranslation('onboard');

    return (
        <div className="flex justify-end">
            <Button
                type={onClick ? 'button' : 'submit'}
                onClick={onClick}
                disabled={disabled || saving}
                size="lg"
                className="w-full sm:w-auto sm:min-w-40"
                data-test="onboarding-continue"
            >
                {saving ? <Spinner /> : null}
                {label ?? t('wizard.continue')}
            </Button>
        </div>
    );
}
