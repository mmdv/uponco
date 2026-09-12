import { router, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import AccountController from '@/actions/App/Http/Controllers/Settings/AccountController';
import AvatarCropModal from '@/components/avatar-crop-modal';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp';

type CropSource = {
    url: string;
    type: string;
};

type AvatarUploaderProps = {
    user: { name: string; avatar?: string | null };
    uploadUrl?: string;
    removeUrl?: string;
};

export default function AvatarUploader({
    user,
    uploadUrl = AccountController.updateAvatar.url(),
    removeUrl = AccountController.destroyAvatar.url(),
}: AvatarUploaderProps) {
    const { t } = useTranslation('settings');
    const getInitials = useInitials();
    const fileInput = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    // The picked file awaiting a crop. Cropping is required, so a file never
    // reaches the form until the user confirms a square region.
    const [cropSource, setCropSource] = useState<CropSource | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<{ avatar: File | null }>({ avatar: null });

    const currentPreview = preview ?? user.avatar ?? null;

    // Clearing the native input's value lets the same file be re-picked, which
    // otherwise fires no change event.
    const clearFileInput = () => {
        if (fileInput.current) {
            fileInput.current.value = '';
        }
    };

    const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        clearErrors();

        if (!file) {
            return;
        }

        // Open the cropper on the raw pick; the form only receives the square
        // crop once the user confirms it.
        setCropSource({ url: URL.createObjectURL(file), type: file.type });
    };

    const closeCropper = () => {
        if (cropSource) {
            URL.revokeObjectURL(cropSource.url);
        }

        setCropSource(null);
        clearFileInput();
    };

    const handleCropped = (file: File) => {
        setData('avatar', file);
        setPreview((previous) => {
            if (previous) {
                URL.revokeObjectURL(previous);
            }

            return URL.createObjectURL(file);
        });
        closeCropper();
    };

    const resetInput = () => {
        reset();

        setPreview((previous) => {
            if (previous) {
                URL.revokeObjectURL(previous);
            }

            return null;
        });

        clearFileInput();
    };

    const handleUpload = () => {
        post(uploadUrl, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: resetInput,
        });
    };

    const handleRemove = () => {
        router.delete(removeUrl, {
            preserveScroll: true,
            onSuccess: resetInput,
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Avatar className="size-20 rounded-full">
                    {currentPreview ? (
                        <AvatarImage src={currentPreview} alt={user.name} />
                    ) : null}
                    <AvatarFallback className="rounded-full text-lg text-black dark:text-white">
                        {getInitials(user.name)}
                    </AvatarFallback>
                </Avatar>

                <div className="flex flex-wrap items-center gap-2">
                    <input
                        ref={fileInput}
                        type="file"
                        accept={ACCEPTED_TYPES}
                        className="hidden"
                        data-test="avatar-input"
                        onChange={handleSelectFile}
                    />

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInput.current?.click()}
                    >
                        {t('avatarUploader.chooseFile')}
                    </Button>

                    {data.avatar ? (
                        <Button
                            type="button"
                            data-test="avatar-upload-button"
                            disabled={processing}
                            onClick={handleUpload}
                        >
                            {t('avatarUploader.savePicture')}
                        </Button>
                    ) : null}

                    {user.avatar && !data.avatar ? (
                        <Button
                            type="button"
                            variant="ghost"
                            data-test="avatar-remove-button"
                            disabled={processing}
                            onClick={handleRemove}
                        >
                            {t('avatarUploader.remove')}
                        </Button>
                    ) : null}
                </div>
            </div>

            <p className="text-xs text-foreground">
                {t('avatarUploader.hint')}
            </p>

            <InputError message={errors.avatar} />

            <AvatarCropModal
                key={cropSource?.url ?? 'idle'}
                open={cropSource !== null}
                imageSrc={cropSource?.url ?? null}
                sourceType={cropSource?.type ?? ''}
                onOpenChange={(next) => {
                    if (!next) {
                        closeCropper();
                    }
                }}
                onCropped={handleCropped}
            />
        </div>
    );
}
