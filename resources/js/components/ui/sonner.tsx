import { useFlashToast } from '@/hooks/use-flash-toast';
import { useHttpExceptionToast } from '@/hooks/use-http-exception-toast';
import { useAppearance } from '@/hooks/use-appearance';
import { useEffect, useState } from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ ...props }: ToasterProps) {
    const { appearance } = useAppearance();

    useFlashToast();
    useHttpExceptionToast();

    // Sonner renders its notifications region into the DOM, but the app shell
    // only mounts the Toaster on the client — the SSR pass omits it. Painting
    // it before mount would leave the server HTML and the client tree out of
    // sync and fail hydration, so hold off until we're client-side.
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <Sonner
            theme={appearance}
            className="toaster group"
            position="top-right"
            closeButton
            toastOptions={{
                classNames: {
                    // A bit rounded to match the inputs and buttons; errors stay
                    // red so they read as problems rather than confirmations.
                    // The right padding keeps the text clear of the close button.
                    toast: 'group !rounded-xl !gap-2 !pr-10',
                    error: '!bg-destructive !text-white !border-destructive',
                    // The brand colour carries the headline instead of flooding
                    // the whole toast. Errors keep white text, since theirs is
                    // the one surface that is still filled.
                    title: '!font-semibold !text-primary group-data-[type=error]:!text-white',
                    description:
                        '!text-foreground group-data-[type=error]:!text-white/90',
                    // Sonner only reveals the close button on hover, which
                    // leaves no way to dismiss a toast by touch. Keep it always
                    // visible, and inherit the toast's own colours so it stays
                    // legible on the red error surface too.
                    closeButton:
                        '!size-7 [&>svg]:!size-5 !opacity-100 !bg-transparent !border-transparent !text-muted-foreground hover:!text-foreground group-data-[type=error]:!text-white/80 group-data-[type=error]:hover:!text-white',
                },
            }}
            style={
                {
                    // The same surface as popovers and dialogs, so a toast reads
                    // as part of the app chrome and follows light/dark on its own.
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                    // Sonner pins the close button to the top-left corner and
                    // pulls it out over the border with a negative translate.
                    // Move it to the top-right and drop it down so it sits
                    // centred on the title line rather than the toast's edge.
                    '--toast-close-button-start': 'unset',
                    '--toast-close-button-end': '0.5rem',
                    '--toast-close-button-transform': 'translateY(0.75rem)',
                } as React.CSSProperties
            }
            {...props}
        />
    );
}

export { Toaster };
