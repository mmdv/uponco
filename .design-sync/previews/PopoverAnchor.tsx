import { Popover, PopoverAnchor, PopoverContent } from 'uponco';

export function AnchoredToSlot() {
    return (
        <div className="w-full max-w-sm">
            <Popover open modal={false}>
                <PopoverAnchor asChild>
                    <button className="flex w-full items-center justify-between rounded-lg border bg-card px-3 py-2 text-left text-sm">
                        <span className="font-medium">11:30</span>
                        <span className="text-muted-foreground">
                            Deep Tissue Massage
                        </span>
                    </button>
                </PopoverAnchor>
                <PopoverContent
                    align="start"
                    sideOffset={8}
                    className="relative w-72 space-y-2"
                >
                    <p className="text-sm font-semibold">11:30 – 12:30</p>
                    <p className="text-sm text-muted-foreground">
                        Deep Tissue Massage with Leyla Aliyeva · ₼75
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Booked by Ayla Rzayeva on 12 August 2026
                    </p>
                </PopoverContent>
            </Popover>
        </div>
    );
}

export function AnchoredToRow() {
    return (
        <div className="w-full max-w-sm">
            <Popover open modal={false}>
                <PopoverAnchor asChild>
                    <div className="rounded-lg border bg-card p-3">
                        <p className="text-sm font-medium">Nizami Street Studio</p>
                        <p className="text-xs text-muted-foreground">
                            28 May Street 12, Baku
                        </p>
                    </div>
                </PopoverAnchor>
                <PopoverContent
                    align="center"
                    sideOffset={8}
                    className="relative w-64 text-sm"
                >
                    <p className="font-medium">Opening hours</p>
                    <p className="mt-1 text-muted-foreground">
                        Mon – Fri · 09:00 – 19:00
                    </p>
                    <p className="text-muted-foreground">Sat · 10:00 – 16:00</p>
                </PopoverContent>
            </Popover>
        </div>
    );
}
