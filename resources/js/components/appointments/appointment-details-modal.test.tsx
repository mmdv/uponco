// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AppointmentDetailsModal from '@/components/appointments/appointment-details-modal';
import type { Appointment } from '@/types';

// Both `useTranslation` and `useCustomerTerm` read the Inertia page props; a
// minimal stub is enough to render the modal in isolation.
vi.mock('@inertiajs/react', () => ({
    usePage: () => ({
        props: { locale: 'en', currentTeam: { businessCategory: null } },
    }),
}));

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
    return {
        id: 1,
        start_at: '2026-08-10T09:00:00Z',
        end_at: '2026-08-10T10:00:00Z',
        timezone: 'UTC',
        notes: null,
        status: 'booked',
        source: 'staff',
        meeting_url: null,
        service: { id: 1, title: 'Consultation' },
        location: null,
        specialist: { id: 20, name: 'Alex' },
        customer: { id: 5, name: 'Jane Doe', email: null, phone: null },
        service_id: 1,
        location_id: null,
        specialist_id: 20,
        ...overrides,
    };
}

// No global test setup registers it, so unmount the portal between cases.
afterEach(cleanup);

/** The modal renders into a portal, so query the whole document. */
const meetingLink = () =>
    document.querySelector('[data-test="appointment-meeting-link"]');

describe('AppointmentDetailsModal', () => {
    it('shows a join link pointing at the meeting url for an online appointment', () => {
        render(
            <AppointmentDetailsModal
                appointment={makeAppointment({
                    meeting_url: 'https://meet.google.com/abc-defg-hij',
                })}
                open
                onOpenChange={() => {}}
            />,
        );

        expect(meetingLink()?.getAttribute('href')).toBe(
            'https://meet.google.com/abc-defg-hij',
        );
    });

    it('omits the join link when the appointment has no meeting url', () => {
        render(
            <AppointmentDetailsModal
                appointment={makeAppointment()}
                open
                onOpenChange={() => {}}
            />,
        );

        expect(meetingLink()).toBeNull();
    });

    it('omits the join link for an in-person appointment even if a url is set', () => {
        render(
            <AppointmentDetailsModal
                appointment={makeAppointment({
                    location: { id: 3, name: 'Downtown' },
                    location_id: 3,
                    meeting_url: 'https://meet.google.com/abc-defg-hij',
                })}
                open
                onOpenChange={() => {}}
            />,
        );

        expect(meetingLink()).toBeNull();
    });

    it('flags an appointment the customer booked online', () => {
        render(
            <AppointmentDetailsModal
                appointment={makeAppointment({ source: 'public' })}
                open
                onOpenChange={() => {}}
            />,
        );

        expect(
            document.body.textContent,
        ).toContain('Booked online by the customer');
    });

    it('does not flag a staff-entered appointment as an online booking', () => {
        render(
            <AppointmentDetailsModal
                appointment={makeAppointment({ source: 'staff' })}
                open
                onOpenChange={() => {}}
            />,
        );

        expect(document.body.textContent).not.toContain(
            'Booked online by the customer',
        );
    });

    it('shows a no-show badge and the no-show/delete actions for a past appointment', () => {
        render(
            <AppointmentDetailsModal
                appointment={makeAppointment({ status: 'no_show' })}
                open
                onOpenChange={() => {}}
                canManagePast
                onMarkNoShow={() => {}}
                onUndoNoShow={() => {}}
                onDelete={() => {}}
            />,
        );

        expect(document.body.textContent).toContain('No-show');
        // Already a no-show, so it offers Undo, not Mark.
        expect(
            document.querySelector(
                '[data-test="appointment-details-undo-no-show-button"]',
            ),
        ).not.toBeNull();
        expect(
            document.querySelector(
                '[data-test="appointment-details-delete-button"]',
            ),
        ).not.toBeNull();
    });

    it('offers the mark-no-show action for a booked appointment under management', () => {
        render(
            <AppointmentDetailsModal
                appointment={makeAppointment({ status: 'booked' })}
                open
                onOpenChange={() => {}}
                canManagePast
                onMarkNoShow={() => {}}
                onDelete={() => {}}
            />,
        );

        expect(
            document.querySelector(
                '[data-test="appointment-details-no-show-button"]',
            ),
        ).not.toBeNull();
    });

    it('hides past-only actions when management is not allowed', () => {
        render(
            <AppointmentDetailsModal
                appointment={makeAppointment({ status: 'booked' })}
                open
                onOpenChange={() => {}}
                onMarkNoShow={() => {}}
                onDelete={() => {}}
            />,
        );

        expect(
            document.querySelector(
                '[data-test="appointment-details-no-show-button"]',
            ),
        ).toBeNull();
        expect(
            document.querySelector(
                '[data-test="appointment-details-delete-button"]',
            ),
        ).toBeNull();
    });
});
