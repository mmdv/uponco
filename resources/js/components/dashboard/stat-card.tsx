import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

import { ACCENTS } from '@/components/accents';
import type { Accent } from '@/components/accents';
import { cn } from '@/lib/utils';

const numberFormatter = new Intl.NumberFormat();

type Props = {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: number;
    href: string;
    accent: Accent;
    /** Decorative SVG painted behind the content; inherits the accent colour. */
    graphic?: ReactNode;
    hint?: string;
    mounted: boolean;
    delay?: number;
};

export default function StatCard({
    icon: Icon,
    label,
    value,
    href,
    accent,
    graphic,
    hint,
    mounted,
    delay = 0,
}: Props) {
    const styles = ACCENTS[accent];

    return (
        <Link
            href={href}
            data-test="dashboard-stat-card"
            className={cn(
                'group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-black/[0.08] bg-card p-5 shadow-soft transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-lg dark:border-border',
                styles.ring,
                mounted
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-3 opacity-0',
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {/* Accent wash — a whisper of the tile's hue in the top corner. */}
            <div
                className={cn(
                    'pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent',
                    styles.wash,
                )}
            />

            {/* The tile's own illustration, brightening slightly on hover. */}
            {graphic && (
                <div
                    className={cn(
                        'pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500 group-hover:opacity-80',
                        styles.graphic,
                    )}
                >
                    {graphic}
                </div>
            )}

            <div className="relative flex items-center justify-between">
                <span
                    className={cn(
                        'flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white transition-transform duration-300 group-hover:scale-105',
                        styles.gradient,
                        styles.shadow,
                    )}
                >
                    <Icon className="size-5" />
                </span>
                <ArrowUpRight className="size-4 text-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground/80" />
            </div>

            <div className="relative space-y-0.5">
                <p className="text-2xl font-bold tracking-tight tabular-nums">
                    {numberFormatter.format(value)}
                </p>
                <p className="text-sm font-medium text-foreground/70">
                    {value === 0 && hint ? hint : label}
                </p>
            </div>
        </Link>
    );
}
