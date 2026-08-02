import AppBackground from '@/components/app-background';
import { AppBottomNav } from '@/components/app-bottom-nav';
import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import type { AppLayoutProps } from '@/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    return (
        <AppShell variant="header">
            {/*
                The backdrop wraps the header too, so the wash runs the full
                height of the page instead of starting below the navigation.
            */}
            <AppBackground className="flex min-h-svh w-full flex-1 flex-col">
                <AppHeader breadcrumbs={breadcrumbs} />
                <AppContent
                    variant="header"
                    className="safe-area-inset-left safe-area-inset-right pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0"
                >
                    {children}
                </AppContent>
                <AppBottomNav />
            </AppBackground>
        </AppShell>
    );
}
