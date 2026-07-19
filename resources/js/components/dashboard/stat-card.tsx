import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import type { ComponentType } from 'react';

import { ACCENTS } from '@/components/dashboard/accents';
import type { Accent } from '@/components/dashboard/accents';
import { cn } from '@/lib/utils';

const numberFormatter = new Intl.NumberFormat();

type Props = {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: number;
    href: string;
    accent: Accent;
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
                'group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-[#f1f3f5] bg-card p-5 shadow-soft transition-all duration-500 ease-out hover:-translate-y-0.5 dark:border-border',
                styles.ring,
                mounted
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-3 opacity-0',
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {/* tinted corner glow */}
            <div
                className={cn(
                    'pointer-events-none absolute -top-10 -right-10 size-24 rounded-full opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100',
                    styles.soft,
                )}
            />

            <div className="flex items-center justify-between">
                <span
                    className={cn(
                        'flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm transition-transform duration-300 group-hover:scale-105',
                        styles.gradient,
                    )}
                >
                    <Icon className="size-5" />
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
            </div>

            <div className="space-y-0.5">
                <p className="text-2xl font-bold tracking-tight tabular-nums">
                    {numberFormatter.format(value)}
                </p>
                <p className="text-sm text-muted-foreground">
                    {value === 0 && hint ? hint : label}
                </p>
            </div>
        </Link>
    );
}
