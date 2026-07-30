import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useKeyboardInset } from '@/hooks/use-keyboard-inset';
import { home } from '@/routes';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    useKeyboardInset();

    return (
        <div className="flex min-h-svh flex-col bg-background pb-[var(--keyboard-inset,0px)] sm:items-center sm:justify-center sm:gap-6 sm:bg-muted sm:p-6 md:p-10">
            <div className="flex w-full flex-1 flex-col sm:max-w-md sm:flex-none">
                <Card className="flex-1 gap-0 rounded-none border-0 bg-background pb-2 shadow-none sm:flex-none sm:rounded-xl sm:border sm:bg-card sm:shadow-soft">
                    <CardHeader className="px-6 pt-[max(env(safe-area-inset-top),0.5rem)] pb-0 text-center sm:px-10 sm:pt-6">
                        <Link
                            href={home()}
                            className="mx-auto mb-4 block w-fit"
                        >
                            <img
                                src="/icons/horizontal-logo.svg"
                                alt="Uponco"
                                className="h-7 w-auto dark:brightness-0 dark:invert"
                            />
                        </Link>
                        <CardTitle className="text-xl">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pt-8 pb-[max(env(safe-area-inset-bottom),2rem)] sm:px-10 sm:pb-8">
                        {children}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
