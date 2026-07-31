/**
 * What a screen can do to the flow around it. The wizard owns navigation and
 * persistence; a screen only reports that its own work is done.
 */
export type StepControls = {
    /** A step is being persisted, so actions should be disabled. */
    saving: boolean;
    /** Mark this screen's backend step complete and move on. */
    onComplete: () => void;
    /** Move on without touching the backend, for screens that only collect state. */
    onNext: () => void;
};
