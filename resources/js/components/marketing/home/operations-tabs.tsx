import { useState } from 'react';
import type { ReactNode } from 'react';
import { FloatingCard } from '@/components/marketing/home/floating-card';
import { PhoneFrame } from '@/components/marketing/home/phone-frame';
import { PhoneScreen } from '@/components/marketing/home/phone-screen';
import type { ScreenName } from '@/components/marketing/home/screens';
import { SectionHeading } from '@/components/marketing/home/section-heading';
import { cn } from '@/lib/utils';

export type OperationsTab = {
    key: string;
    icon: ReactNode;
    title: string;
    body: string;
    screen: ScreenName;
    alt: string;
    card: { title: string; meta?: string };
};

/**
 * "Run your business, not your calendar": a dark band with four tabs, each
 * swapping the phone's screen and its floating card. A vertical list beside
 * the phone from lg, a row of scrollable pills above it on smaller screens.
 * Follows the WAI-ARIA tabs pattern, with arrow keys moving between tabs.
 */
export function OperationsTabs({
    title,
    subtitle,
    tabs,
}: {
    title: string;
    subtitle: string;
    tabs: OperationsTab[];
}) {
    const [activeKey, setActiveKey] = useState(tabs[0]?.key);
    const activeIndex = Math.max(
        0,
        tabs.findIndex((tab) => tab.key === activeKey),
    );
    const active = tabs[activeIndex];

    function focusTab(index: number, list: HTMLElement | null) {
        const next = tabs[(index + tabs.length) % tabs.length];
        setActiveKey(next.key);
        list?.querySelector<HTMLButtonElement>(`#ops-tab-${next.key}`)?.focus();
    }

    return (
        <section className="dark theme-dark bg-background px-4 py-20 text-foreground sm:py-32">
            <SectionHeading title={title} subtitle={subtitle} />

            <div className="mx-auto mt-14 grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-20">
                <div
                    role="tablist"
                    className="-mx-4 flex snap-x [scrollbar-width:none] gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-3 lg:overflow-visible lg:px-0"
                    onKeyDown={(event) => {
                        const keys: Record<string, number> = {
                            ArrowDown: 1,
                            ArrowRight: 1,
                            ArrowUp: -1,
                            ArrowLeft: -1,
                        };

                        if (event.key in keys) {
                            event.preventDefault();
                            focusTab(
                                activeIndex + keys[event.key],
                                event.currentTarget,
                            );
                        }
                    }}
                >
                    {tabs.map((tab) => {
                        const isActive = tab.key === active.key;

                        return (
                            <button
                                key={tab.key}
                                id={`ops-tab-${tab.key}`}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                aria-controls="ops-panel"
                                tabIndex={isActive ? 0 : -1}
                                onClick={() => setActiveKey(tab.key)}
                                className={cn(
                                    'flex shrink-0 cursor-pointer snap-start items-start gap-4 rounded-full border px-4 py-2.5 text-left transition-colors lg:rounded-3xl lg:p-6',
                                    isActive
                                        ? 'border-white/15 bg-white/10'
                                        : 'border-transparent hover:bg-white/5',
                                )}
                            >
                                <span
                                    className={cn(
                                        'hidden size-11 shrink-0 items-center justify-center rounded-2xl lg:flex [&_svg]:size-5',
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-white/10 text-muted-foreground',
                                    )}
                                >
                                    {tab.icon}
                                </span>
                                <span>
                                    <span className="block text-sm font-semibold whitespace-nowrap text-foreground lg:text-xl">
                                        {tab.title}
                                    </span>
                                    <span
                                        className={cn(
                                            'mt-1 hidden text-base text-muted-foreground',
                                            isActive && 'lg:block',
                                        )}
                                    >
                                        {tab.body}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div
                    id="ops-panel"
                    role="tabpanel"
                    aria-labelledby={`ops-tab-${active.key}`}
                    className="flex flex-col items-center"
                >
                    <p className="mb-8 max-w-md text-center text-base text-muted-foreground lg:hidden">
                        {active.body}
                    </p>
                    <div className="relative">
                        <PhoneFrame size="lg">
                            {tabs.map((tab) => (
                                <div
                                    key={tab.key}
                                    aria-hidden={tab.key !== active.key}
                                    className={cn(
                                        'absolute inset-0 transition-opacity duration-500',
                                        tab.key === active.key
                                            ? 'opacity-100'
                                            : 'opacity-0',
                                    )}
                                >
                                    <PhoneScreen
                                        name={tab.screen}
                                        alt={tab.alt}
                                    />
                                </div>
                            ))}
                        </PhoneFrame>
                        <FloatingCard
                            key={active.key}
                            icon={active.icon}
                            title={active.card.title}
                            meta={active.card.meta}
                            className="top-[8%] -left-6 animate-screen-in sm:-left-36"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
