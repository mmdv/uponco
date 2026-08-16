import { Scissors } from 'lucide-react';
import { SummaryBar } from 'uponco';

/**
 * The live recap at the top of the public booking flow, with every choice made.
 */
export function Complete() {
    return (
        <div className="max-w-md">
            <SummaryBar
                serviceTitle="Deep Tissue Massage"
                specialistName="Leyla Hüseynova"
                locationName="Nizami Studio"
                dateTimeLabel="Fri 21 Aug · 11:30"
                serviceIcon={Scissors}
            />
        </div>
    );
}

/** Step two: only the service has been picked so far. */
export function ServiceOnly() {
    return (
        <div className="max-w-md">
            <SummaryBar serviceTitle="Gel Manicure" serviceIcon={Scissors} />
        </div>
    );
}

/** A solo practice with one location — service, specialist and time. */
export function WithoutLocation() {
    return (
        <div className="max-w-md">
            <SummaryBar
                serviceTitle="Signature Cut & Finish"
                specialistName="Nigar Əliyeva"
                locationName={null}
                dateTimeLabel="Sat 22 Aug · 15:00"
                serviceIcon={Scissors}
            />
        </div>
    );
}

/** Nothing chosen yet — the dashed placeholder holds the space. */
export function Empty() {
    return (
        <div className="max-w-md">
            <SummaryBar />
        </div>
    );
}
