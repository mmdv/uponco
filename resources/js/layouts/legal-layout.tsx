import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home, privacy, terms } from '@/routes';

const currentYear = new Date().getFullYear();

interface LegalLayoutProps {
    title: string;
    /** Human-readable date the document last changed, e.g. "7 July 2026". */
    lastUpdated: string;
    children: ReactNode;
}

/**
 * Standalone marketing-style shell for public legal pages (Privacy Policy,
 * Terms & Conditions). Mirrors the header/footer used on the welcome page so
 * the pages feel part of the same site without pulling in the app chrome.
 */
export default function LegalLayout({
    title,
    lastUpdated,
    children,
}: LegalLayoutProps) {
    return (
        <>
            <Head title={title} />

            <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
                    <nav className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-6">
                        <Link
                            href={home()}
                            className="flex items-center gap-2 font-semibold"
                        >
                            <span className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary">
                                <AppLogoIcon className="size-5 fill-current text-white" />
                            </span>
                            <span>Uponco</span>
                        </Link>

                        <Link
                            href={home()}
                            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="size-4" />
                            Back to home
                        </Link>
                    </nav>
                </header>

                {/* Document */}
                <main className="mx-auto w-full max-w-3xl px-6 py-14 sm:py-20">
                    <header className="border-b border-border pb-8">
                        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                            {title}
                        </h1>
                        <p className="mt-3 text-sm text-muted-foreground">
                            Last updated: {lastUpdated}
                        </p>
                    </header>

                    <div className="mt-8">{children}</div>
                </main>

                {/* Footer */}
                <footer className="border-t border-border/60">
                    <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span className="flex aspect-square size-6 items-center justify-center rounded-md bg-primary">
                                <AppLogoIcon className="size-3.5 fill-current text-white" />
                            </span>
                            Uponco
                        </div>
                        <div className="flex items-center gap-5 text-sm text-muted-foreground">
                            <Link
                                href={privacy()}
                                className="transition-colors hover:text-foreground"
                            >
                                Privacy
                            </Link>
                            <Link
                                href={terms()}
                                className="transition-colors hover:text-foreground"
                            >
                                Terms
                            </Link>
                            <span>© {currentYear} Uponco</span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

/** Section heading used within a legal document body. */
export function LegalSection({
    id,
    heading,
    children,
}: {
    id: string;
    heading: string;
    children: ReactNode;
}) {
    return (
        <section
            id={id}
            className="scroll-mt-20 border-b border-border/60 py-6 first:pt-0 last:border-b-0"
        >
            <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {children}
            </div>
        </section>
    );
}
