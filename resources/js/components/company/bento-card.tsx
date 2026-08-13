import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

import type { AccentStyles } from '@/components/accents';
import { cn } from '@/lib/utils';

type BentoCardProps = {
    href: React.ComponentProps<typeof Link>['href'];
    mounted: boolean;
    delay: number;
    className?: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: AccentStyles;
    /** Decorative SVG painted behind the content; inherits the accent colour. */
    graphic?: React.ReactNode;
    title: string;
    description?: string;
    compact?: boolean;
    children?: React.ReactNode;
};

/**
 * Shared shell for the company grid tiles: same radius, border and
 * lift-on-hover for every card, with a per-card accent hue, icon tile and
 * background graphic layered in.
 */
export function BentoCard({
    href,
    mounted,
    delay,
    className,
    icon: Icon,
    accent,
    graphic,
    title,
    description,
    compact,
    children,
}: BentoCardProps) {
    return (
        <Link
            href={href}
            data-test="company-card"
            className={cn(
                'group relative flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-card shadow-soft transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-lg dark:border-border',
                accent.ring,
                mounted
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-3 opacity-0',
                className,
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {/* Accent wash — a whisper of the card's hue in the top corner. */}
            <div
                className={cn(
                    'pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent',
                    accent.wash,
                )}
            />

            {/* The card's own illustration, brightening slightly on hover. */}
            {graphic && (
                <div
                    className={cn(
                        'pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500 group-hover:opacity-80',
                        accent.graphic,
                    )}
                >
                    {graphic}
                </div>
            )}

            <div className="relative flex flex-1 flex-col p-5">
                <div className="flex items-start gap-3">
                    <div
                        className={cn(
                            'flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white transition-transform duration-300 group-hover:scale-105',
                            compact ? 'size-9' : 'size-11',
                            accent.gradient,
                            accent.shadow,
                        )}
                    >
                        <Icon className={compact ? 'size-4' : 'size-5'} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="leading-tight font-semibold text-foreground">
                                {title}
                            </h3>
                            <ChevronRight className="size-4 shrink-0 text-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-foreground/80" />
                        </div>
                        {description && (
                            <p className="mt-1 text-sm leading-snug font-medium text-foreground/75">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {children && (
                    <div className="mt-5 flex flex-1 flex-col">{children}</div>
                )}
            </div>
        </Link>
    );
}
