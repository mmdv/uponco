import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';

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
                <SiteHeader />

                {/* Document */}
                <main className="mx-auto w-full max-w-4xl px-6 py-14 sm:py-20">
                    <header className="border-b border-border pb-8">
                        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                            {title}
                        </h1>
                        <p className="mt-4 text-base text-muted-foreground">
                            Last updated: {lastUpdated}
                        </p>
                    </header>

                    <div className="mt-8">{children}</div>
                </main>

                <SiteFooter maxWidth="max-w-4xl" />
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
            className="scroll-mt-20 border-b border-border/60 py-8 first:pt-0 last:border-b-0"
        >
            <h2 className="text-2xl font-semibold tracking-tight">{heading}</h2>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                {children}
            </div>
        </section>
    );
}
