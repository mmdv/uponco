import { Code2, Link2 } from 'lucide-react';
import { PhoneFrame } from '@/components/marketing/home/phone-frame';
import { PhoneScreen } from '@/components/marketing/home/phone-screen';
import { Reveal } from '@/components/marketing/home/reveal';
import { SectionHeading } from '@/components/marketing/home/section-heading';

/**
 * "One line of code": a sketch of a business's own website with the booking
 * flow phone overlapping it, and a glass card showing the single script tag
 * from /widget/{company}.js. Deep links get their own line underneath.
 */
export function EmbedSection({
    title,
    body,
    snippet,
    snippetLabel,
    siteName,
    deepLinksTitle,
    deepLinksBody,
    alt,
}: {
    title: string;
    body: string;
    snippet: string;
    snippetLabel: string;
    /** The fictional website's name in the browser sketch. */
    siteName: string;
    deepLinksTitle: string;
    deepLinksBody: string;
    alt: string;
}) {
    return (
        <section className="px-4 py-20 sm:py-32">
            <SectionHeading title={title} subtitle={body} />

            <Reveal className="relative mx-auto mt-14 max-w-5xl pb-10">
                <div className="relative">
                    {/* The business's own website, sketched in neutral blocks. */}
                    <div
                        aria-hidden
                        className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[0_30px_80px_-30px_rgba(15,23,42,0.3)]"
                    >
                        <div className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
                            <span className="size-3 rounded-full bg-foreground/15" />
                            <span className="size-3 rounded-full bg-foreground/15" />
                            <span className="size-3 rounded-full bg-foreground/15" />
                            <span className="mx-auto rounded-full bg-secondary px-6 py-1 text-xs text-muted-foreground sm:px-16">
                                {siteName}
                            </span>
                        </div>
                        <div className="grid min-h-[22rem] gap-6 p-6 sm:min-h-[28rem] sm:grid-cols-[1.2fr_1fr] sm:p-10">
                            <div className="flex flex-col gap-4">
                                <div className="h-4 w-24 rounded-full bg-foreground/10" />
                                <div className="h-9 w-4/5 rounded-xl bg-foreground/15" />
                                <div className="h-9 w-3/5 rounded-xl bg-foreground/15" />
                                <div className="mt-2 h-3 w-full rounded-full bg-foreground/8" />
                                <div className="h-3 w-5/6 rounded-full bg-foreground/8" />
                                <div className="mt-4 h-11 w-40 rounded-full bg-primary" />
                            </div>
                            <div className="hidden rounded-2xl bg-[linear-gradient(135deg,var(--secondary),color-mix(in_oklab,var(--primary)_14%,var(--secondary)))] sm:block" />
                        </div>
                    </div>

                    <div className="absolute right-2 -bottom-6 sm:right-10 lg:-right-6">
                        <PhoneFrame size="sm" tilt="right">
                            <PhoneScreen name="booking-choose" alt={alt} />
                        </PhoneFrame>
                    </div>
                </div>

                <div className="relative mt-12 rounded-2xl glass p-4 sm:absolute sm:-bottom-4 sm:left-8 sm:mt-0 sm:max-w-md sm:p-5">
                    <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        <Code2 className="size-4 text-primary" aria-hidden />
                        {snippetLabel}
                    </p>
                    <code className="mt-3 block overflow-x-auto rounded-xl bg-foreground px-4 py-3 font-mono text-[12px] leading-relaxed whitespace-pre text-background sm:text-[13px]">
                        {snippet}
                    </code>
                </div>
            </Reveal>

            <Reveal className="mx-auto mt-16 flex max-w-xl items-start gap-4 sm:mt-20">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Link2 className="size-5" aria-hidden />
                </span>
                <div>
                    <h3 className="text-lg font-semibold text-foreground">
                        {deepLinksTitle}
                    </h3>
                    <p className="mt-1 text-base text-muted-foreground">
                        {deepLinksBody}
                    </p>
                </div>
            </Reveal>
        </section>
    );
}
