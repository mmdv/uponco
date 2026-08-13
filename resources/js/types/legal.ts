/**
 * What the app needs to ask the signed-in user to agree to the terms.
 *
 * Shared as `termsConsent` on every authenticated response, and null whenever
 * the user has already agreed to the version currently in force.
 */
export type TermsConsent = {
    /** The version being asked for, e.g. "2026-08-14". */
    version: string;
    /**
     * True when the user agreed to an earlier version and the documents have
     * since changed, false when they have never agreed to anything.
     */
    updated: boolean;
};
