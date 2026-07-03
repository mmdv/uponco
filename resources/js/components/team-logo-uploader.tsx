import { router, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import BusinessController from '@/actions/App/Http/Controllers/Company/BusinessController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import type { Team } from '@/types';

const ACCEPTED_TYPES = 'image/svg+xml,image/png,image/jpeg';

type Props = {
    team: Team;
    teamSlug: string;
};

export default function TeamLogoUploader({ team, teamSlug }: Props) {
    const fileInput = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<{ logo: File | null }>({ logo: null });

    const currentPreview = preview ?? team.logoUrl ?? null;

    const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        clearErrors();
        setData('logo', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleUpload = () => {
        post(BusinessController.updateLogo.url(teamSlug), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setPreview(null);

                if (fileInput.current) {
                    fileInput.current.value = '';
                }
            },
        });
    };

    const handleRemove = () => {
        router.delete(BusinessController.destroyLogo.url(teamSlug), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setPreview(null);

                if (fileInput.current) {
                    fileInput.current.value = '';
                }
            },
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
                    {currentPreview ? (
                        <img
                            src={currentPreview}
                            alt={`${team.name} logo`}
                            className="size-full object-contain"
                        />
                    ) : (
                        <span className="text-xs text-neutral-400">
                            No logo
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <input
                        ref={fileInput}
                        type="file"
                        accept={ACCEPTED_TYPES}
                        className="hidden"
                        data-test="team-logo-input"
                        onChange={handleSelectFile}
                    />

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInput.current?.click()}
                    >
                        Choose file
                    </Button>

                    {data.logo ? (
                        <Button
                            type="button"
                            data-test="team-logo-upload-button"
                            disabled={processing}
                            onClick={handleUpload}
                        >
                            Save logo
                        </Button>
                    ) : null}

                    {team.logoUrl && !data.logo ? (
                        <Button
                            type="button"
                            variant="ghost"
                            data-test="team-logo-remove-button"
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

            <InputError message={errors.logo} />
        </div>
    );
}
