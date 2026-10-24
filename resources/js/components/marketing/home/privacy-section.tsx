import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { PhoneFrame } from '@/components/marketing/home/phone-frame';
import { PhoneScreen } from '@/components/marketing/home/phone-screen';
import { Reveal } from '@/components/marketing/home/reveal';

/**
 * "Your data stays yours": a dark, rounded panel with a large glass shield
 * behind the copy and the real Google integration screen — the one place we
 * touch a third party, and only if the business connects it.
 */
export function PrivacySection({
    title,
    body,
    finePrint,
    cta,
    href,
    alt,
}: {
    title: string;
    body: string;
    finePrint: string;
    cta: string;
    href: InertiaLinkProps['href'];
    alt: string;
}) {
    return (
        <section className="px-4 py-12 sm:py-20">
            <div className="dark theme-dark relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-[radial-gradient(120%_80%_at_50%_100%,color-mix(in_oklab,var(--primary)_35%,#0b1020),#0b1020_60%)] px-6 pt-16 text-center text-foreground sm:px-12 sm:pt-24">
                <ShieldCheck
                    aria-hidden
                    strokeWidth={0.6}
                    className="pointer-events-none absolute top-6 left-1/2 size-[26rem] -translate-x-1/2 text-white/[0.07] sm:size-[34rem]"
                />

                <Reveal className="relative mx-auto max-w-2xl">
                    <h2 className="text-[clamp(2.125rem,4.4vw,4rem)] leading-[1.04] font-semibold tracking-[-0.035em] text-balance">
                        {title}
                    </h2>
                    <p className="mt-5 text-lg leading-relaxed text-balance text-muted-foreground sm:text-xl">
                        {body}
                    </p>
                    <p className="mt-4 text-sm text-muted-foreground">
                        {finePrint}
                    </p>
                    <Link
                        href={href}
                        className="mt-8 inline-flex h-11 items-center gap-2 rounded-full glass px-5 text-sm font-medium text-foreground"
                    >
                        {cta}
                        <ArrowRight className="size-4" />
                    </Link>
                </Reveal>

                <Reveal
                    delay={0.1}
                    className="relative mx-auto mt-14 -mb-48 w-fit sm:-mb-56"
                >
                    <PhoneFrame size="md">
                        <PhoneScreen name="google-integration" alt={alt} />
                    </PhoneFrame>
                </Reveal>
            </div>
        </section>
    );
}
