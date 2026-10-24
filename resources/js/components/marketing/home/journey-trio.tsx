import type { ReactNode } from 'react';
import { FloatingCard } from '@/components/marketing/home/floating-card';
import { PhoneFrame } from '@/components/marketing/home/phone-frame';
import { PhoneScreen } from '@/components/marketing/home/phone-screen';
import { Reveal } from '@/components/marketing/home/reveal';
import type { ScreenName } from '@/components/marketing/home/screens';
import { SectionHeading } from '@/components/marketing/home/section-heading';

export type JourneyStep = {
    title: string;
    body: string;
    screen: ScreenName;
    alt: string;
    card: { icon: ReactNode; title: string; meta?: string };
};

/**
 * "Booked in under a minute": the customer's side in three tall cards, each
 * with a phone rising out of its bottom edge and one glass detail card
 * overlapping it. Three across from lg, stacked below.
 */
export function JourneyTrio({
    title,
    subtitle,
    steps,
}: {
    title: string;
    subtitle: string;
    steps: JourneyStep[];
}) {
    return (
        <section className="px-4 py-20 sm:py-32">
            <SectionHeading title={title} subtitle={subtitle} />

            <div className="mx-auto mt-14 grid max-w-6xl gap-5 lg:grid-cols-3">
                {steps.map((step, index) => (
                    <Reveal
                        key={step.screen}
                        delay={index * 0.1}
                        className="relative flex h-[34rem] flex-col overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,var(--secondary),color-mix(in_oklab,var(--primary)_10%,var(--secondary)))] px-7 pt-8 sm:h-[38rem]"
                    >
                        <h3 className="text-[clamp(1.75rem,2.6vw,2.25rem)] leading-tight font-semibold tracking-[-0.03em] text-foreground">
                            {step.title}
                        </h3>
                        <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
                            {step.body}
                        </p>

                        <div className="relative mx-auto mt-8 -mb-40 w-fit">
                            <PhoneFrame size="md">
                                <PhoneScreen
                                    name={step.screen}
                                    alt={step.alt}
                                />
                            </PhoneFrame>
                            <FloatingCard
                                icon={step.card.icon}
                                title={step.card.title}
                                meta={step.card.meta}
                                className="top-[18%] -left-6 sm:-left-10"
                                delay={index * 0.7}
                            />
                        </div>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}
