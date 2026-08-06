import { CalendarCheck, CalendarClock, Users } from 'lucide-react';

import {
    BookingsGraphic,
    CustomersGraphic,
    UpcomingGraphic,
} from '@/components/card-graphics';
import StatCard from '@/components/dashboard/stat-card';
import { useTranslation } from '@/hooks/use-translation';
import { index as appointmentsIndex } from '@/routes/appointments';
import { index as customersIndex } from '@/routes/customers';
import type { DashboardStats as Stats } from '@/types';

type Props = {
    stats: Stats;
    mounted: boolean;
};

export default function DashboardStats({ stats, mounted }: Props) {
    const { t } = useTranslation('dashboard');

    const cards = [
        {
            icon: Users,
            label: t('stats.customers'),
            value: stats.customers,
            href: customersIndex.url(),
            accent: 'brand' as const,
            graphic: <CustomersGraphic />,
            hint: t('stats.customersHint'),
        },
        {
            icon: CalendarCheck,
            label: t('stats.totalBookings'),
            value: stats.totalBookings,
            href: appointmentsIndex.url(),
            accent: 'deep' as const,
            graphic: <BookingsGraphic />,
            hint: t('stats.totalBookingsHint'),
        },
        {
            icon: CalendarClock,
            label: t('stats.upcoming'),
            value: stats.upcoming,
            href: appointmentsIndex.url(),
            accent: 'bright' as const,
            graphic: <UpcomingGraphic />,
            hint: t('stats.upcomingHint'),
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {cards.map((card, index) => (
                <StatCard
                    key={card.label}
                    icon={card.icon}
                    label={card.label}
                    value={card.value}
                    href={card.href}
                    accent={card.accent}
                    graphic={card.graphic}
                    hint={card.hint}
                    mounted={mounted}
                    delay={index * 60}
                />
            ))}
        </div>
    );
}
