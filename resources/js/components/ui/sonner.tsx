import { useFlashToast } from '@/hooks/use-flash-toast';
import { useAppearance } from '@/hooks/use-appearance';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ ...props }: ToasterProps) {
    const { appearance } = useAppearance();

    useFlashToast();

    return (
        <Sonner
            theme={appearance}
            className="toaster group"
            position="top-right"
            toastOptions={{
                classNames: {
                    // A bit rounded to match the inputs and buttons; errors stay
                    // red so they read as problems rather than confirmations.
                    toast: 'group !rounded-xl !gap-2',
                    error: '!bg-destructive !text-white !border-destructive',
                },
            }}
            style={
                {
                    '--normal-bg': 'var(--primary)',
                    '--normal-text': 'var(--primary-foreground)',
                    '--normal-border': 'var(--primary)',
                } as React.CSSProperties
            }
            {...props}
        />
    );
}

export { Toaster };
