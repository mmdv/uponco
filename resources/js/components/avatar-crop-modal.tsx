import { useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';
import { cropImageToSquareFile } from '@/lib/crop-image';

type Props = {
    open: boolean;
    /** Object URL of the picked file, or null when nothing is being cropped. */
    imageSrc: string | null;
    /** MIME type of the picked file, used to keep the export in the same format. */
    sourceType: string;
    onOpenChange: (open: boolean) => void;
    /** Called with the square crop once the user confirms. */
    onCropped: (file: File) => void;
};

/**
 * A square-crop step for the profile picture: the user pans and zooms the picked
 * image inside a 1:1 frame, and confirming produces the cropped square to upload.
 */
export default function AvatarCropModal({
    open,
    imageSrc,
    sourceType,
    onOpenChange,
    onCropped,
}: Props) {
    const { t } = useTranslation('settings');

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [areaPixels, setAreaPixels] = useState<Area | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleApply = async () => {
        if (!imageSrc || !areaPixels) {
            return;
        }

        setProcessing(true);

        try {
            const file = await cropImageToSquareFile(
                imageSrc,
                areaPixels,
                sourceType,
            );

            onCropped(file);
        } catch {
            toast.error(t('avatarUploader.crop.error'));
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 p-0 sm:max-w-md">
                <DialogHeader className="border-b px-4 py-4 sm:px-6">
                    <DialogTitle>{t('avatarUploader.crop.title')}</DialogTitle>
                    <DialogDescription>
                        {t('avatarUploader.crop.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 px-4 py-4 sm:px-6">
                    <div className="relative h-64 w-full overflow-hidden rounded-xl bg-muted sm:h-72">
                        {open && imageSrc ? (
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={(_, pixels) =>
                                    setAreaPixels(pixels)
                                }
                            />
                        ) : null}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="avatar-zoom">
                            {t('avatarUploader.crop.zoom')}
                        </Label>
                        <input
                            id="avatar-zoom"
                            type="range"
                            min={1}
                            max={3}
                            step={0.01}
                            value={zoom}
                            onChange={(event) =>
                                setZoom(Number(event.target.value))
                            }
                            aria-label={t('avatarUploader.crop.zoom')}
                            className="w-full accent-primary"
                            data-test="avatar-crop-zoom"
                        />
                    </div>
                </div>

                <DialogFooter className="flex-row items-center justify-end gap-2 border-t px-4 py-4 sm:px-6">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                        data-test="avatar-crop-cancel"
                    >
                        {t('avatarUploader.crop.cancel')}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleApply}
                        disabled={processing || !areaPixels}
                        data-test="avatar-crop-apply"
                    >
                        {t('avatarUploader.crop.apply')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
