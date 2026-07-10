import * as React from 'react';

import { cn } from '@/lib/utils';
import type { MonthTab } from '@/types/schedule';
import { useSchedule } from './schedule-context';

/**
 * The month carousel strip. The active month is scrolled to the left edge on
 * mount only (via a ref-callback, no effect), so the current month leads by
 * default while earlier months stay reachable by scrolling left. Bottom
 * placement on mobile is handled by the page's bottom bar.
 */
export default function MonthTabs() {
    const { monthTabs, activeMonthKey, setActiveMonth } = useSchedule();

    return (
        <div className="-mx-1 flex [scrollbar-width:thin] [scrollbar-color:var(--color-primary)_transparent] gap-2 overflow-x-auto overscroll-x-none px-1 pt-1 pb-2.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/70 [&::-webkit-scrollbar-track]:bg-transparent">
            {monthTabs.map((tab) => (
                <MonthTabItem
                    key={tab.key}
                    tab={tab}
                    isActive={tab.key === activeMonthKey}
                    onSelect={() => setActiveMonth(tab.key)}
                />
            ))}
        </div>
    );
}

type MonthTabItemProps = {
    tab: MonthTab;
    isActive: boolean;
    onSelect: () => void;
};

function MonthTabItem({ tab, isActive, onSelect }: MonthTabItemProps) {
    const anchor = React.useCallback(
        (node: HTMLButtonElement | null) => {
            // Anchor only the current month to the left edge, and only on mount
            // (isCurrent is stable) — clicking other tabs must not move the strip.
            if (node && tab.isCurrent) {
                node.scrollIntoView({ inline: 'start', block: 'nearest' });
            }
        },
        [tab.isCurrent],
    );

    return (
        <button
            ref={anchor}
            type="button"
            onClick={onSelect}
            aria-pressed={isActive}
            className={cn(
                'flex w-14 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border py-2 transition-colors md:w-20',
                isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card hover:border-primary/40',
                tab.isCurrent && !isActive && 'border-primary/40',
            )}
        >
            <span className="text-xs leading-tight font-semibold">
                {tab.monthLabel}
            </span>
            <span
                className={cn(
                    'text-[10px] leading-tight',
                    isActive
                        ? 'text-primary-foreground/80'
                        : 'text-muted-foreground',
                )}
            >
                {tab.year}
            </span>
        </button>
    );
}
