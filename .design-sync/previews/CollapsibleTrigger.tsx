import { ChevronDownIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from 'uponco';

/**
 * `CollapsibleTrigger` needs its `Collapsible` root for state, so the preview
 * is the whole panel — the service form's per-specialist pricing section.
 */
export function InsideCollapsible() {
    return (
        <div className="max-w-lg">
            <Collapsible open className="rounded-lg border">
                <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 p-3 text-left">
                    <div className="space-y-0.5">
                        <span className="text-sm font-medium">
                            Per-specialist pricing
                        </span>
                        <p className="text-sm text-muted-foreground">
                            Override the price of Gel Manicure per specialist.
                        </p>
                    </div>
                    <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="border-t p-3 text-sm text-muted-foreground">
                        Leyla Hüseynova · ₼ 45 · 45 min
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}

/**
 * The trigger drives the chevron rotation off `data-state`, so the closed panel
 * is the other half of the variant axis.
 */
export function ClosedState() {
    return (
        <div className="max-w-lg">
            <Collapsible open={false} className="rounded-lg border">
                <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 p-3 text-left">
                    <div className="space-y-0.5">
                        <span className="text-sm font-medium">
                            Advanced booking rules
                        </span>
                        <p className="text-sm text-muted-foreground">
                            Notice period, buffer time and cancellation window.
                        </p>
                    </div>
                    <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="border-t p-3 text-sm text-muted-foreground">
                        Customers can book up to 30 days ahead.
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
