import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useSchedule } from './schedule-context';
import ScheduleSlotEditor from './schedule-slot-editor';

/**
 * Slide-in drawer for editing the schedule of the selected days. Contains the
 * shared time-block editor plus Cancel / Save actions. Saving is a no-op stub
 * for now — no schedule is persisted yet.
 */
export default function EditScheduleDrawer() {
    const { isDrawerOpen, closeDrawer, selectedDayCount } = useSchedule();
    const isMobile = useIsMobile();

    return (
        <Sheet
            open={isDrawerOpen}
            onOpenChange={(open) => {
                if (!open) {
                    closeDrawer();
                }
            }}
        >
            <SheetContent
                side={isMobile ? 'bottom' : 'right'}
                className={cn(
                    'flex flex-col gap-0 p-0',
                    // On the bottom sheet the width comes from the built-in
                    // left/right insets, so `w-full` (which would overflow past
                    // them) is only applied to the desktop side drawer.
                    isMobile ? 'max-h-[85dvh]' : 'w-full sm:max-w-md',
                )}
            >
                <SheetHeader className="shrink-0 border-b">
                    <SheetTitle>Edit Schedule</SheetTitle>
                    <SheetDescription>
                        Applying to {selectedDayCount}{' '}
                        {selectedDayCount === 1 ? 'day' : 'days'}.
                    </SheetDescription>
                </SheetHeader>

                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    <ScheduleSlotEditor />
                </div>

                <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={closeDrawer}
                    >
                        Cancel
                    </Button>
                    <Button type="button" onClick={closeDrawer}>
                        Save
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
