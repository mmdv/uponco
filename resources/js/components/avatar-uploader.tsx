import { router, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import AccountController from '@/actions/App/Http/Controllers/Settings/AccountController';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';

const ACCEPTED_TYPES = 'image/svg+xml,image/png,image/jpeg';

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
    const getInitials = useInitials();
    const fileInput = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<{ avatar: File | null }>({ avatar: null });

    const currentPreview = preview ?? user.avatar ?? null;

    const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        clearErrors();
        setData('avatar', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const resetInput = () => {
        reset();
        setPreview(null);

        if (fileInput.current) {
            fileInput.current.value = '';
        }
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
                        Choose file
                    </Button>

                    {data.avatar ? (
                        <Button
                            type="button"
                            data-test="avatar-upload-button"
                            disabled={processing}
                            onClick={handleUpload}
                        >
                            Save picture
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
                            Remove
                        </Button>
                    ) : null}
                </div>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                SVG, PNG or JPG. Up to 2MB.
            </p>

            <InputError message={errors.avatar} />
        </div>
    );
}
