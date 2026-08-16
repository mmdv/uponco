import { Plus, Trash2 } from 'lucide-react';
import {
    Button,
    Input,
    Label,
    Separator,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from 'uponco';

function TimeBlocks() {
    return (
        <div className="space-y-3">
            {[
                { from: '09:00', to: '13:00' },
                { from: '14:00', to: '18:30' },
            ].map((block) => (
                <div key={block.from} className="flex items-end gap-2">
                    <div className="grid flex-1 gap-1.5">
                        <Label className="text-xs">From</Label>
                        <Input type="time" defaultValue={block.from} />
                    </div>
                    <div className="grid flex-1 gap-1.5">
                        <Label className="text-xs">To</Label>
                        <Input type="time" defaultValue={block.to} />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove time block"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            ))}
            <Button variant="outline" size="sm">
                <Plus className="size-4" />
                Add time block
            </Button>
        </div>
    );
}

export function DayEditor() {
    return (
        <Sheet open modal={false}>
            <SheetContent
                className="flex flex-col gap-0 p-0 sm:max-w-md"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <SheetHeader className="shrink-0 border-b">
                    <SheetTitle>Tue, 18 Aug</SheetTitle>
                    <SheetDescription>
                        Set the hours Leyla Aliyeva is bookable on this day.
                    </SheetDescription>
                </SheetHeader>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                    <div className="space-y-2">
                        <Label>Presets</Label>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="secondary" size="sm">
                                09:00 – 17:00
                            </Button>
                            <Button variant="outline" size="sm">
                                10:00 – 19:00
                            </Button>
                            <Button variant="outline" size="sm">
                                Half day
                            </Button>
                        </div>
                    </div>
                    <Separator />
                    <TimeBlocks />
                </div>

                <SheetFooter className="shrink-0 flex-row items-center justify-between gap-2 border-t">
                    <Button
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                    >
                        Mark day off
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="secondary">Cancel</Button>
                        <Button>Save</Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

export function BottomSheetOnMobile() {
    return (
        <Sheet open modal={false}>
            <SheetContent
                side="bottom"
                className="flex flex-col gap-0 p-0"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <SheetHeader className="shrink-0 border-b">
                    <SheetTitle>Wed, 19 Aug</SheetTitle>
                    <SheetDescription>
                        Applying to 3 selected days.
                    </SheetDescription>
                </SheetHeader>
                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    <TimeBlocks />
                </div>
                <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t">
                    <Button variant="secondary">Cancel</Button>
                    <Button>Save</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
