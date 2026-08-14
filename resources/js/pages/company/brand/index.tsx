import { Form, Head } from '@inertiajs/react';
import { Check, Code2, Copy, ExternalLink, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import BrandController from '@/actions/App/Http/Controllers/Company/BrandController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import TeamLogoUploader from '@/components/team-logo-uploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClipboard } from '@/hooks/use-clipboard';
import { useTranslation } from '@/hooks/use-translation';
import { accentFrom } from '@/lib/brand';
import { cn } from '@/lib/utils';
import { index as companyIndex } from '@/routes/company';
import { index as brandIndex } from '@/routes/company/brand';
import type { Team, TeamPermissions } from '@/types';

/** Brand-primary gradient reused across the company surfaces. */
const PRIMARY_GRADIENT = 'from-[#0063ff] to-[#3884fe]';

type Props = {
    team: Team;
    permissions: TeamPermissions;
    defaultPrimaryColor: string;
    widget: {
        scriptUrl: string;
        bookingUrl: string;
    };
};

export default function BrandIndex({
    team,
    permissions,
    defaultPrimaryColor,
    widget,
}: Props) {
    const { t } = useTranslation('company');

    const snippet = `<script type="text/javascript" src="${widget.scriptUrl}" charset="UTF-8"></script>`;

    const [copiedText, copy] = useClipboard();
    const isCopied = copiedText === snippet;

    // The colour being edited. The preview follows it live, so the 10% accent
    // is visible before anything is saved.
    const [primary, setPrimary] = useState(
        team.brandPrimaryColor ?? defaultPrimaryColor,
    );

    const isValidHex = /^#[0-9a-fA-F]{6}$/.test(primary);
    const previewPrimary = isValidHex ? primary : defaultPrimaryColor;
    const previewAccent = accentFrom(previewPrimary);

    return (
        <>
            <Head title={t('brand.title')} />

            <div className="flex flex-col space-y-10 p-4">
                <Heading
                    variant="small"
                    title={t('brand.title')}
                    description={t('brand.description')}
                />

                {permissions.canUpdateTeam ? (
                    <div className="space-y-6">
                        <Heading
                            variant="small"
                            title={t('brand.logo.title')}
                            description={t('brand.logo.description')}
                        />

                        <TeamLogoUploader team={team} />
                    </div>
                ) : null}

                {permissions.canUpdateTeam ? (
                    <div className="space-y-6">
                        <Heading
                            variant="small"
                            title={t('brand.color.title')}
                            description={t('brand.color.description')}
                        />

                        <Form
                            {...BrandController.update.form()}
                            options={{ preserveScroll: true }}
                            className="space-y-6"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="brand_primary_color">
                                            {t('brand.color.primaryLabel')}
                                        </Label>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                aria-label={t(
                                                    'brand.color.primaryLabel',
                                                )}
                                                value={previewPrimary}
                                                data-test="brand-color-swatch"
                                                onChange={(event) =>
                                                    setPrimary(
                                                        event.target.value,
                                                    )
                                                }
                                                className="size-10 shrink-0 cursor-pointer rounded-lg border bg-transparent p-1"
                                            />

                                            <Input
                                                id="brand_primary_color"
                                                name="brand_primary_color"
                                                data-test="brand-color-input"
                                                value={primary}
                                                maxLength={7}
                                                spellCheck={false}
                                                className="max-w-[10rem] font-mono"
                                                onChange={(event) =>
                                                    setPrimary(
                                                        event.target.value,
                                                    )
                                                }
                                            />

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                data-test="brand-color-reset"
                                                onClick={() =>
                                                    setPrimary(
                                                        defaultPrimaryColor,
                                                    )
                                                }
                                            >
                                                <RotateCcw className="size-4" />
                                                {t('brand.color.reset')}
                                            </Button>
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            {t('brand.color.hint')}
                                        </p>

                                        <InputError
                                            message={errors.brand_primary_color}
                                        />
                                    </div>

                                    {/*
                                     * The accent is never chosen, only shown:
                                     * it is the primary at 10%, which is what
                                     * the booking page washes selected cards
                                     * with.
                                     */}
                                    <div className="grid gap-2">
                                        <Label>
                                            {t('brand.color.accentLabel')}
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="size-10 shrink-0 rounded-lg border"
                                                style={{
                                                    backgroundColor:
                                                        previewAccent,
                                                }}
                                            />
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {previewAccent}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('brand.color.accentHint')}
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>
                                            {t('brand.color.preview')}
                                        </Label>
                                        <div
                                            className="flex flex-wrap items-center gap-3 rounded-xl border p-4"
                                            data-test="brand-color-preview"
                                            style={{
                                                backgroundColor: previewAccent,
                                            }}
                                        >
                                            <span
                                                className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white"
                                                style={{
                                                    backgroundColor:
                                                        previewPrimary,
                                                }}
                                            >
                                                {t('brand.color.previewButton')}
                                            </span>
                                            <span
                                                className="inline-flex items-center rounded-lg border bg-card px-3 py-2 text-sm"
                                                style={{
                                                    borderColor: previewPrimary,
                                                    color: previewPrimary,
                                                }}
                                            >
                                                <Check className="mr-1.5 size-4" />
                                                {t('brand.color.previewChip')}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        data-test="brand-color-save"
                                        disabled={processing}
                                    >
                                        {t('brand.color.save')}
                                    </Button>
                                </>
                            )}
                        </Form>
                    </div>
                ) : null}

                {/* Embeddable booking widget */}
                <div className="rounded-2xl border bg-card p-6">
                    <div className="flex items-start gap-4">
                        <div
                            className={cn(
                                'flex size-11 flex-none items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
                                PRIMARY_GRADIENT,
                            )}
                        >
                            <Code2 className="size-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="text-base font-semibold tracking-tight">
                                Booking widget
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Paste this snippet into your website, right
                                before the closing{' '}
                                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                    &lt;/body&gt;
                                </code>{' '}
                                tag. A “Book online” button appears in the
                                corner and opens your booking page in a pop-up.
                            </p>

                            <div className="mt-4 flex items-stretch gap-2">
                                <pre className="min-w-0 flex-1 overflow-x-auto rounded-lg border bg-muted/50 px-3 py-2.5 text-xs leading-relaxed text-foreground">
                                    <code>{snippet}</code>
                                </pre>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-none"
                                    onClick={() => copy(snippet)}
                                    aria-label="Copy snippet"
                                >
                                    {isCopied ? (
                                        <Check className="size-4 text-emerald-600" />
                                    ) : (
                                        <Copy className="size-4" />
                                    )}
                                    {isCopied ? 'Copied' : 'Copy'}
                                </Button>
                            </div>

                            <a
                                href={widget.bookingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                            >
                                <ExternalLink className="size-3.5" />
                                Preview your booking page
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

BrandIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Company',
            href: companyIndex(),
        },
        {
            title: 'Brand',
            href: props.currentTeam ? brandIndex() : '/',
        },
    ],
});
