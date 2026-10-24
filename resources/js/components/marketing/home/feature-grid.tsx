import {
    CalendarCog,
    Coins,
    FolderTree,
    Hourglass,
    Languages,
    MailX,
    SunMoon,
    ShieldCheck,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Reveal } from '@/components/marketing/home/reveal';
import { SectionHeading } from '@/components/marketing/home/section-heading';

const featureIcons: Record<string, LucideIcon> = {
    customers: Users,
    categories: FolderTree,
    pricing: Coins,
    breaks: Hourglass,
    cancellation: MailX,
    staffBookings: CalendarCog,
    theme: SunMoon,
    languages: Languages,
    twoFactor: ShieldCheck,
};

export type FeatureItem = { key: string; title: string; body: string };

/** "And that's not all": a compact grid of smaller features, one line each. */
export function FeatureGrid({
    title,
    subtitle,
    items,
}: {
    title: string;
    subtitle: string;
    items: FeatureItem[];
}) {
    return (
        <section className="px-4 py-20 sm:py-32">
            <SectionHeading title={title} subtitle={subtitle} />

            <div className="mx-auto mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, index) => {
                    const Icon = featureIcons[item.key] ?? ShieldCheck;

                    return (
                        <Reveal
                            key={item.key}
                            delay={(index % 3) * 0.06}
                            className="rounded-3xl bg-secondary/70 p-6 sm:p-7"
                        >
                            <span className="flex size-11 items-center justify-center rounded-2xl bg-background text-primary shadow-soft">
                                <Icon className="size-5" aria-hidden />
                            </span>
                            <h3 className="mt-5 text-lg font-semibold text-foreground sm:text-xl">
                                {item.title}
                            </h3>
                            <p className="mt-1.5 text-base text-muted-foreground">
                                {item.body}
                            </p>
                        </Reveal>
                    );
                })}
            </div>
        </section>
    );
}
