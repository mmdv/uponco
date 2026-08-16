import { ChevronDownIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from 'uponco';

type Override = { name: string; price: string; duration: string };

const overrides: Override[] = [
    { name: 'Leyla Hüseynova', price: '₼ 85', duration: '60 min' },
    { name: 'Nigar Əliyeva', price: '₼ 95', duration: '75 min' },
    { name: 'Tural Məmmədov', price: '₼ 80', duration: '60 min' },
];

function PricingRow({ override }: { override: Override }) {
    return (
        <div className="flex items-center justify-between p-3 text-sm">
            <span className="font-medium">{override.name}</span>
            <span className="text-muted-foreground">
                {override.price} · {override.duration}
            </span>
        </div>
    );
}

function PricingSection({ open }: { open: boolean }) {
    return (
        <Collapsible open={open} className="rounded-lg border">
            <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 p-3 text-left">
                <div className="space-y-0.5">
                    <span className="text-sm font-medium">
                        Per-specialist pricing
                    </span>
                    <p className="text-sm text-muted-foreground">
                        Override the price or duration of Deep Tissue Massage
                        for individual specialists.
                    </p>
                </div>
                <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="divide-y border-t">
                    {overrides.map((override) => (
                        <PricingRow key={override.name} override={override} />
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

/** The per-specialist pricing panel from the service form, expanded. */
export function Open() {
    return (
        <div className="max-w-lg">
            <PricingSection open />
        </div>
    );
}

/** Collapsed: only the summary row and its chevron are shown. */
export function Closed() {
    return (
        <div className="max-w-lg">
            <PricingSection open={false} />
        </div>
    );
}
