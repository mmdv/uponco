import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/marketing/home/reveal';
import { SectionHeading } from '@/components/marketing/home/section-heading';
import { cn } from '@/lib/utils';

export type PricingPlan = {
    name: string;
    price: string;
    period: string;
    caption: string;
    features: string[];
    highlighted?: boolean;
};

/**
 * Two calm glass plan cards under a beta banner. Copy must match FEATURES.md
 * §2 exactly — the page passes it in, this only lays it out.
 */
export function PricingSection({
    banner,
    title,
    subtitle,
    plans,
    note,
    cta,
    href,
}: {
    banner: string;
    title: string;
    subtitle: string;
    plans: PricingPlan[];
    note: string;
    cta: string;
    href: InertiaLinkProps['href'];
}) {
    return (
        <section
            id="pricing"
            className="relative isolate overflow-hidden px-4 py-20 sm:py-32"
        >
            <div
                aria-hidden
                className="absolute inset-x-0 top-1/3 -z-10 mx-auto h-96 max-w-4xl rounded-full bg-primary/15 blur-3xl"
            />

            <Reveal className="mb-8 flex justify-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary dark:bg-primary/25 dark:text-blue-300">
                    <Sparkles className="size-4" aria-hidden />
                    {banner}
                </span>
            </Reveal>
            <SectionHeading title={title} subtitle={subtitle} />

            <div className="mx-auto mt-14 grid max-w-4xl gap-5 md:grid-cols-2">
                {plans.map((plan, index) => (
                    <Reveal
                        key={plan.name}
                        delay={index * 0.08}
                        className={cn(
                            'flex flex-col rounded-[2rem] glass p-8',
                            plan.highlighted && 'ring-2 ring-primary/60',
                        )}
                    >
                        <h3 className="text-lg font-semibold text-foreground">
                            {plan.name}
                        </h3>
                        <p className="mt-4 flex items-baseline gap-2">
                            <span className="text-5xl font-semibold tracking-[-0.03em] text-foreground">
                                {plan.price}
                            </span>
                            <span className="text-base text-muted-foreground">
                                {plan.period}
                            </span>
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {plan.caption}
                        </p>
                        <ul className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-6">
                            {plan.features.map((feature) => (
                                <li
                                    key={feature}
                                    className="flex gap-3 text-base text-foreground"
                                >
                                    <Check className="mt-1 size-4 shrink-0 text-primary" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </Reveal>
                ))}
            </div>

            <Reveal className="mx-auto mt-8 max-w-2xl text-center">
                <p className="text-base text-muted-foreground">{note}</p>
                <Link
                    href={href}
                    className="mt-5 inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline dark:text-blue-400"
                >
                    {cta}
                    <ArrowRight className="size-4" />
                </Link>
            </Reveal>
        </section>
    );
}
