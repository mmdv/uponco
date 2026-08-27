/**
 * The handful of Laravel validation rules worth mirroring on the client.
 *
 * The server stays authoritative — every rule here also runs in a FormRequest.
 * The point is to stop a submission that is already known to fail from leaving
 * the browser at all: several routes are rate limited, so a form that round
 * trips to discover it is empty spends the visitor's budget and eventually
 * answers with a 429.
 *
 * Messages are passed in rather than produced here, so `useTranslation` stays
 * the single source of user-facing copy.
 */

/** Mirrors `required`: present, and not just whitespace. */
export function required(value: string | null | undefined): boolean {
    return (value ?? '').trim() !== '';
}

/**
 * Mirrors `required_without`: this field is required only when the other one
 * is empty. Used for either/or pairs such as an email or a phone number.
 */
export function requiredWithout(
    value: string | null | undefined,
    other: string | null | undefined,
): boolean {
    return required(value) || required(other);
}

/**
 * A deliberately loose shape check, matching what the browser itself enforces
 * for `type="email"`. Anything stricter would reject addresses the server
 * accepts, so real verification is left to the server and the inbox.
 */
export function email(value: string | null | undefined): boolean {
    const candidate = (value ?? '').trim();

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate);
}

/** Mirrors `min:n` on a string. */
export function minLength(
    value: string | null | undefined,
    n: number,
): boolean {
    return (value ?? '').trim().length >= n;
}

/**
 * One check: the field it belongs to, whether it passed, and what to say when
 * it did not.
 */
export type Check = {
    field: string;
    passes: boolean;
    message: string;
};

/**
 * Collapse checks into an error bag shaped exactly like Inertia's, so the same
 * `<InputError message={errors.x} />` renders client and server errors alike.
 *
 * First failure per field wins, matching Laravel's own behaviour of reporting
 * one message per field rather than piling them up.
 */
export function firstErrors(checks: Check[]): Partial<Record<string, string>> {
    const errors: Partial<Record<string, string>> = {};

    for (const check of checks) {
        if (!check.passes && errors[check.field] === undefined) {
            errors[check.field] = check.message;
        }
    }

    return errors;
}
