// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { OperationsTabs } from '@/components/marketing/home/operations-tabs';
import type { OperationsTab } from '@/components/marketing/home/operations-tabs';
import { TestimonialsSection } from '@/components/marketing/home/testimonials-section';

afterEach(cleanup);

const tabs: OperationsTab[] = [
    {
        key: 'hours',
        icon: null,
        title: 'Working hours',
        body: 'Plan by week.',
        screen: 'working-hours',
        alt: 'Hours screen',
        card: { title: 'Repeat this week' },
    },
    {
        key: 'team',
        icon: null,
        title: 'Team & roles',
        body: 'Invite your team.',
        screen: 'team-members',
        alt: 'Team screen',
        card: { title: 'Invitation sent' },
    },
];

function selectedTab(): string | null {
    return (
        screen
            .getAllByRole('tab')
            .find((tab) => tab.getAttribute('aria-selected') === 'true')
            ?.textContent ?? null
    );
}

describe('OperationsTabs', () => {
    it('shows the first tab and switches on click', () => {
        render(<OperationsTabs title="Run it" subtitle="Sub" tabs={tabs} />);

        expect(selectedTab()).toContain('Working hours');

        fireEvent.click(screen.getByRole('tab', { name: /Team & roles/ }));

        expect(selectedTab()).toContain('Team & roles');
        expect(screen.getByText('Invitation sent')).toBeTruthy();
    });

    it('moves between tabs with the arrow keys and wraps around', () => {
        render(<OperationsTabs title="Run it" subtitle="Sub" tabs={tabs} />);

        fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
        expect(selectedTab()).toContain('Team & roles');

        fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
        expect(selectedTab()).toContain('Working hours');
    });
});

describe('TestimonialsSection', () => {
    it('renders nothing without real reviews', () => {
        const { container } = render(
            <TestimonialsSection title="Reviews" testimonials={[]} />,
        );

        expect(container.innerHTML).toBe('');
    });
});
