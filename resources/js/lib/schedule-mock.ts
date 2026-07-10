import type { ScheduleMember } from '@/types/schedule';

/**
 * Placeholder team members for the scheduling grid until real team data is
 * wired in. Kept isolated so the swap to a fetched list is a one-line change.
 */
export function mockScheduleMembers(): ScheduleMember[] {
    return [
        { id: 1, name: 'Alex Morgan', avatar: null, role: 'owner' },
        { id: 2, name: 'Jamie Chen', avatar: null, role: 'admin' },
        { id: 3, name: 'Priya Nair', avatar: null, role: 'member' },
        { id: 4, name: 'Sam Rivera', avatar: null, role: 'member' },
        { id: 5, name: 'Taylor Brooks', avatar: null, role: 'member' },
    ];
}
