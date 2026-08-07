import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import type { PropsWithChildren, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

export type SectionNavItem = {
    key: string;
    title: string;
    icon?: LucideIcon | null;
    /** Links navigate; sections without a href switch in place via onSelect. */
    href?: NavItem['href'];
    onSelect?: () => void;
    isActive: boolean;
    testId?: string;
};

const itemClasses = (isActive: boolean) =>
    cn(
        'flex items-center gap-2 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive
            ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary'
            : 'text-muted-foreground hover:bg-background hover:text-foreground',
    );

function SectionNavItemContent({
    item,
    showIcon,
}: {
    item: SectionNavItem;
    showIcon: boolean;
}) {
    return (
        <>
            {showIcon && item.icon && (
                <item.icon className="h-4 w-4 shrink-0" />
            )}
            {item.title}
        </>
    );
}

function SectionNavButton({
    item,
    className,
    showIcon = true,
}: {
    item: SectionNavItem;
    className: string;
    showIcon?: boolean;
}) {
    const classes = cn(itemClasses(item.isActive), className);

    if (item.href) {
        return (
            <Link
                href={item.href}
                data-test={item.testId}
                aria-current={item.isActive ? 'page' : undefined}
                className={classes}
            >
                <SectionNavItemContent item={item} showIcon={showIcon} />
            </Link>
        );
    }

    return (
        <button
            type="button"
            data-test={item.testId}
            aria-current={item.isActive ? 'page' : undefined}
            onClick={item.onSelect}
            className={classes}
        >
            <SectionNavItemContent item={item} showIcon={showIcon} />
        </button>
    );
}

/**
 * Section navigation for settings-style pages: a contained sidebar on desktop
 * and a scrollable segmented control on mobile, both marking the current
 * section with the primary colour.
 */
export function SectionNav({
    items,
    label,
    className,
}: {
    items: SectionNavItem[];
    label: string;
    className?: string;
}) {
    return (
        <nav aria-label={label} className={className}>
            {/* Mobile: one compact row of pills that scrolls edge to edge. */}
            <div className="-mx-4 [scrollbar-width:none] overflow-x-auto px-4 lg:hidden [&::-webkit-scrollbar]:hidden">
                <div className="inline-flex min-w-full gap-1 rounded-lg bg-muted p-1">
                    {items.map((item) => (
                        <SectionNavButton
                            key={item.key}
                            item={item}
                            className="h-8 flex-1 justify-center"
                            showIcon={false}
                        />
                    ))}
                </div>
            </div>

            {/* Desktop: its own panel beside the content. */}
            <div className="hidden flex-col gap-1 rounded-xl border border-border bg-muted/40 p-2 lg:flex">
                {items.map((item) => (
                    <SectionNavButton
                        key={item.key}
                        item={item}
                        className="h-9 w-full justify-start"
                    />
                ))}
            </div>
        </nav>
    );
}

/**
 * Page frame shared by the settings, business and member-edit screens: compact
 * heading, section navigation, and the section's own content.
 */
export function SectionNavLayout({
    title,
    description,
    items,
    navLabel,
    contentClassName,
    children,
    action,
}: PropsWithChildren<{
    title: string;
    description?: string;
    items: SectionNavItem[];
    navLabel: string;
    contentClassName?: string;
    action?: ReactNode;
}>) {
    return (
        <div className="px-4 py-6">
            <div className="mb-4 flex items-start justify-between gap-4 lg:mb-6">
                <header className="min-w-0">
                    <h2 className="truncate text-lg font-semibold tracking-tight lg:text-xl">
                        {title}
                    </h2>
                    {description && (
                        <p className="hidden text-sm text-foreground/70 lg:block">
                            {description}
                        </p>
                    )}
                </header>
                {action}
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                <SectionNav
                    items={items}
                    label={navLabel}
                    className="lg:w-56 lg:shrink-0"
                />

                <div className={cn('min-w-0 flex-1', contentClassName)}>
                    {children}
                </div>
            </div>
        </div>
    );
}
