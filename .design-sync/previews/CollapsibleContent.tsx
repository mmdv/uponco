import { ChevronDownIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from 'uponco';

const overrides = [
    { name: 'Leyla Hüseynova', price: '₼ 85', duration: '60 min' },
    { name: 'Nigar Əliyeva', price: '₼ 95', duration: '75 min' },
];

/**
 * `CollapsibleContent` only renders inside a `Collapsible`, so the preview is
 * the full panel from the service form, expanded.
 */
export function Expanded() {
    return (
        <div className="max-w-lg">
            <Collapsible open className="rounded-lg border">
                <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 p-3 text-left">
                    <div className="space-y-0.5">
                        <span className="text-sm font-medium">
                            Per-specialist pricing
                        </span>
                        <p className="text-sm text-muted-foreground">
                            Override Deep Tissue Massage per specialist.
                        </p>
                    </div>
                    <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="divide-y border-t">
                        {overrides.map((override) => (
                            <div
                                key={override.name}
                                className="flex items-center justify-between p-3 text-sm"
                            >
                                <span className="font-medium">
                                    {override.name}
                                </span>
                                <span className="text-muted-foreground">
                                    {override.price} · {override.duration}
                                </span>
                            </div>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}

/**
 * With `forceMount` the content stays in the DOM and is hidden by a
 * `data-state=closed` class — how the service form keeps its inputs submitted
 * even while the panel is shut.
 */
export function ForceMountedClosed() {
    return (
        <div className="max-w-lg">
            <Collapsible open={false} className="rounded-lg border">
                <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 p-3 text-left">
                    <div className="space-y-0.5">
                        <span className="text-sm font-medium">
                            Per-specialist pricing
                        </span>
                        <p className="text-sm text-muted-foreground">
                            Fields stay mounted so the form still submits them.
                        </p>
                    </div>
                    <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent
                    forceMount
                    className="data-[state=closed]:hidden"
                >
                    <div className="border-t p-3 text-sm text-muted-foreground">
                        Leyla Hüseynova · ₼ 85 · 60 min
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
