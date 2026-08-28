import type { ChangeEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';

type Errors = Partial<Record<string, string>>;

export type ClientValidation = {
    /** Spread onto the `<Form>`: cancels the request when the data is invalid. */
    onBefore: () => boolean;
    /** Spread onto the `<Form>`: clears a field's error as it is corrected. */
    onChange: (event: ChangeEvent<HTMLFormElement>) => void;
    /**
     * The message to show for a field: whatever the client found, falling back
     * to whatever the server last said about it.
     */
    error: (field: string, serverError?: string) => string | undefined;
    /**
     * Drop every client error. A page-level form never needs this, but a modal
     * outlives the `<Form>` it wraps, so its errors have to be cleared when it
     * closes or they reappear over the empty fields on the next open.
     */
    reset: () => void;
};

/**
 * Run a form's validation in JavaScript before it is allowed to leave the page.
 *
 * `required` attributes are not a guard. They live in the DOM, so anyone can
 * delete them in devtools and submit anyway. They are still worth keeping for
 * the native affordance they give honest users, but the check that actually
 * holds has to run in JS, which is what this does.
 *
 * To be clear about what this protects: a determined attacker can bypass any
 * client-side check, which is why the routes are rate limited server-side. What
 * this prevents is an ordinary user spending their rate-limit budget on
 * submissions that were never going to succeed, and then meeting a 429.
 *
 * Timing follows the least naggy convention: nothing is flagged while the form
 * is first being filled in, pressing submit reports everything at once, and
 * from then on each field clears as it is corrected.
 *
 * The form is found by `id` rather than held as a ref. `<Form>` rebuilds its
 * imperative handle every render, so feeding that to a callback ref loops
 * forever, and anything ref-derived that a hook returns trips
 * `react-hooks/refs`. A DOM lookup at submit time avoids both, and reading
 * `FormData` off the element is what Inertia does with it anyway.
 *
 * ```tsx
 * const validation = useClientValidation('reset-password-form', (data) => …);
 *
 * <Form id="reset-password-form" onBefore={validation.onBefore} onChange={validation.onChange}>
 *     {({ errors }) => (
 *         <InputError message={validation.error('password', errors.password)} />
 *     )}
 * </Form>
 * ```
 *
 * @param formId   The `id` on the `<Form>` element.
 * @param validate Returns an error bag from the form's current data. Give it
 *                 the same rules the FormRequest applies — see `@/lib/validation`.
 */
export function useClientValidation(
    formId: string,
    validate: (data: Record<string, string>) => Errors,
): ClientValidation {
    const [clientErrors, setClientErrors] = useState<Errors>({});

    const onBefore = useCallback(() => {
        const element = document.getElementById(formId);

        // No form to read means nothing to check; let the server decide rather
        // than silently swallowing the submission.
        if (!(element instanceof HTMLFormElement)) {
            return true;
        }

        const data: Record<string, string> = {};

        for (const [key, value] of new FormData(element).entries()) {
            if (typeof value === 'string') {
                data[key] = value;
            }
        }

        const errors = validate(data);

        setClientErrors(errors);

        return Object.keys(errors).length === 0;
    }, [formId, validate]);

    const onChange = useCallback((event: ChangeEvent<HTMLFormElement>) => {
        // Delegated from the form, so this fires for whichever field the user
        // is correcting, without every input wiring its own handler.
        const { name } = event.target as unknown as { name?: string };

        if (!name) {
            return;
        }

        setClientErrors((current) => {
            if (current[name] === undefined) {
                return current;
            }

            const next = { ...current };
            delete next[name];

            return next;
        });
    }, []);

    const error = useCallback(
        (field: string, serverError?: string) =>
            clientErrors[field] ?? serverError,
        [clientErrors],
    );

    const reset = useCallback(() => {
        setClientErrors({});
    }, []);

    return useMemo(
        () => ({ onBefore, onChange, error, reset }),
        [onBefore, onChange, error, reset],
    );
}
