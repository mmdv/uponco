import { MapPin } from 'lucide-react';

import LocationDetails from '@/components/public-booking/location-details';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation';
import type { AppointmentLocationDetail } from '@/types';

type Props = {
    /** The location to describe, or null while the dialog is closed. */
    location: AppointmentLocationDetail | null;
    onClose: () => void;
};

/**
 * The full detail for a branch, opened from the info button beside it — the
 * location counterpart of the specialist profile dialog.
 */
export default function LocationDetailsDialog({ location, onClose }: Props) {
    const { t } = useTranslation('booking');

    return (
        <Dialog
            open={location !== null}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <DialogContent
                className="sm:max-w-sm"
                data-test="location-details-dialog"
            >
                <DialogHeader className="items-center text-center sm:text-center">
                    <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MapPin className="size-7" />
                    </span>

                    <DialogTitle className="mt-3">{location?.name}</DialogTitle>

                    <DialogDescription className="sr-only">
                        {location
                            ? t('selection.about', { name: location.name })
                            : t('location.aboutFallback')}
                    </DialogDescription>
                </DialogHeader>

                {location ? (
                    <LocationDetails
                        location={location}
                        compact
                        className="text-center [&_div]:justify-center"
                    />
                ) : null}

                <DialogFooter className="sm:justify-center">
                    <DialogClose asChild>
                        <Button variant="outline" className="w-full">
                            {t('location.close')}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
