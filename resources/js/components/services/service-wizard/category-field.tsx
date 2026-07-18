import { router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useTranslation } from '@/hooks/use-translation';
import { store } from '@/routes/company/service-categories';
import type { SelectOption } from '@/types';

/**
 * The wizard's category picker, with an inline "add category" row.
 *
 * A category only needs a name, so opening a dialog for it is more ceremony
 * than the field deserves. The wizard is itself a `<form>`, so the new category
 * is posted with `router` rather than a nested form, and the reloaded props are
 * diffed to select whatever was just created.
 */
export default function CategoryField({
    value,
    onChange,
    options,
    teamSlug,
    error,
}: {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    teamSlug: string;
    error?: string;
}) {
    const { t } = useTranslation('company');

    const [adding, setAdding] = useState(false);
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [nameError, setNameError] = useState<string | undefined>(undefined);
    // Snapshot of the options at submit time; anything that appears afterwards
    // was created here and gets selected automatically.
    const knownValues = useRef<string[] | null>(null);

    useEffect(() => {
        if (knownValues.current === null) {
            return;
        }

        const created = options.find(
            (option) =>
                option.value !== '' &&
                !knownValues.current?.includes(option.value),
        );

        if (!created) {
            return;
        }

        knownValues.current = null;
        onChange(created.value);
    }, [options, onChange]);

    const submit = (): void => {
        if (name.trim() === '') {
            return;
        }

        knownValues.current = options.map((option) => option.value);
        setSaving(true);
        setNameError(undefined);

        router.post(
            store.url(teamSlug),
            { name },
            {
                preserveScroll: true,
                // The wizard lives in component state; a remount would wipe it.
                preserveState: true,
                onSuccess: () => {
                    setName('');
                    setAdding(false);
                },
                onError: (errors) => {
                    knownValues.current = null;
                    setNameError(errors.name);
                },
                onFinish: () => setSaving(false),
            },
        );
    };

    return (
        <div className="grid gap-2">
            <Label htmlFor="wizard_category">
                {t('services.form.category')}
            </Label>
            <p className="text-sm text-muted-foreground">
                {t('services.form.categoryHint')}
            </p>
            <SearchableSelect
                id="wizard_category"
                options={options}
                value={value}
                onChange={onChange}
                placeholder={t('services.form.categoryPlaceholder')}
                searchPlaceholder={t('services.form.categorySearchPlaceholder')}
                emptyMessage={t('services.form.categoryEmpty')}
                invalid={Boolean(error)}
                data-test="wizard-category-select"
            />
            <InputError message={error} />

            {adding ? (
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <Input
                            aria-label={t('services.form.categoryAdd')}
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            onKeyDown={(event) => {
                                // The wizard's own form would otherwise submit.
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    submit();
                                }
                            }}
                            placeholder={t(
                                'services.form.categoryNamePlaceholder',
                            )}
                            aria-invalid={Boolean(nameError)}
                            autoFocus
                            data-test="wizard-category-name-input"
                        />
                        <Button
                            type="button"
                            onClick={submit}
                            disabled={saving || name.trim() === ''}
                            data-test="wizard-category-save"
                        >
                            {t('services.form.categorySave')}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setAdding(false);
                                setName('');
                                setNameError(undefined);
                            }}
                            disabled={saving}
                        >
                            {t('services.form.categoryCancel')}
                        </Button>
                    </div>
                    <InputError message={nameError} />
                </div>
            ) : (
                <div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAdding(true)}
                        data-test="wizard-add-category"
                    >
                        <Plus />
                        {t('services.form.categoryAdd')}
                    </Button>
                </div>
            )}
        </div>
    );
}
