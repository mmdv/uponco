// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { PhoneScreenSequence } from '@/components/marketing/home/phone-screen-sequence';
import type { SequenceScreen } from '@/components/marketing/home/phone-screen-sequence';

afterEach(cleanup);

const screens: SequenceScreen[] = [
    { name: 'booking-choose', label: 'Choose', alt: 'Choose screen' },
    { name: 'booking-time', label: 'Pick a time', alt: 'Time screen' },
    { name: 'booking-confirmed', label: 'Booked', alt: 'Booked screen' },
];

function activeStep(): string | null {
    return (
        screen
            .getAllByRole('button')
            .find((button) => button.getAttribute('aria-current') === 'step')
            ?.getAttribute('aria-label') ?? null
    );
}

/**
 * The running progress bar lives inside the active step button. jsdom has no
 * AnimationEvent, so React listens for the vendor-prefixed name instead.
 */
function finishActiveStep(): void {
    const bar = screen
        .getAllByRole('button')
        .find((button) => button.getAttribute('aria-current') === 'step')
        ?.querySelector('.animate-screen-progress');

    fireEvent(bar!, new Event('webkitAnimationEnd', { bubbles: true }));
}

describe('PhoneScreenSequence', () => {
    it('advances when the progress animation ends and wraps to the start', () => {
        render(<PhoneScreenSequence screens={screens} stepsLabel="Steps" />);

        expect(activeStep()).toBe('Choose');

        finishActiveStep();
        expect(activeStep()).toBe('Pick a time');

        finishActiveStep();
        finishActiveStep();
        expect(activeStep()).toBe('Choose');
    });

    it('jumps to a step when its button is pressed', () => {
        render(<PhoneScreenSequence screens={screens} stepsLabel="Steps" />);

        fireEvent.click(screen.getByRole('button', { name: 'Booked' }));

        expect(activeStep()).toBe('Booked');
        expect(
            screen
                .getByAltText('Booked screen')
                .closest('[aria-hidden]')
                ?.getAttribute('aria-hidden'),
        ).toBe('false');
    });
});
