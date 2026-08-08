import type { Auth } from '@/types/auth';
import type { NotificationSummary } from '@/types/notifications';
import type { Team } from '@/types/teams';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            currentTeam: Team | null;
            teams: Team[];
            notificationBell: NotificationSummary | null;
            locale: string;
            availableLocales: { code: string; name: string; native: string }[];
            [key: string]: unknown;
        };
    }
}
