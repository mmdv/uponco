import { Form, Head, usePage } from '@inertiajs/react';
import { Check, Code2, Copy, ExternalLink, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import BrandController from '@/actions/App/Http/Controllers/Company/BrandController';
import BrandPreview from '@/components/company/brand-preview';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import TeamLogoUploader from '@/components/team-logo-uploader';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClipboard } from '@/hooks/use-clipboard';
import { type AvailableLocale, useTranslation } from '@/hooks/use-translation';
import { accentFrom } from '@/lib/brand';
import { cn } from '@/lib/utils';
import { index as companyIndex } from '@/routes/company';
import { index as brandIndex } from '@/routes/company/brand';
import type { Team, TeamPermissions } from '@/types';

/** Brand-primary gradient reused across the company surfaces. */
const PRIMARY_GRADIENT = 'from-[#0063ff] to-[#3884fe]';

/**
 * One-tap starting points for the primary. The native colour input covers the
 * screen on a phone, so without these there is no way to change the colour and
 * watch the preview follow at the same time.
 */
const PRESET_COLORS = [
    '#0063FF',
    '#4F46E5',
    '#7C3AED',
    '#DB2777',
    '#E11D48',
    '#EA580C',
    '#B45309',
    '#16A34A',
    '#0D9488',
    '#0F172A',
] as const;

type Props = {
    team: Team & {
        defaultLocale: string;
        availableLocales: string[];
    };
    permissions: TeamPermissions;
    defaultPrimaryColor: string;
    widget: {
        scriptUrl: string;
        bookingUrl: string;
    };
};

/**
 * Colour one line of HTML the way an editor would: tags, attribute names and
 * quoted values each get their own token colour so the snippet reads as code
 * rather than a wall of grey text.
 */
function highlightHtml(code: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    // Ordered alternation: tag punctuation + name, `>`, attribute name (only
    // when followed by `=`), the `=`, a quoted string, then whitespace.
    const token =
        /(<\/?)([a-zA-Z][\w-]*)|(>)|([a-zA-Z-]+)(?==)|(=)|("[^"]*"|'[^']*')|(\s+)/g;

    let match: RegExpExecArray | null;
    let key = 0;
    const push = (text: string, className?: string) => {
        nodes.push(
            className ? (
                <span key={key++} className={className}>
                    {text}
                </span>
            ) : (
                <span key={key++}>{text}</span>
            ),
        );
    };

    while ((match = token.exec(code)) !== null) {
        if (match[1]) {
            push(match[1], 'text-zinc-500');
            push(match[2], 'text-sky-400');
        } else if (match[3]) {
            push(match[3], 'text-zinc-500');
        } else if (match[4]) {
            push(match[4], 'text-violet-300');
        } else if (match[5]) {
            push(match[5], 'text-zinc-500');
        } else if (match[6]) {
            push(match[6], 'text-emerald-300');
        } else if (match[7]) {
            push(match[7]);
        }
    }

    return nodes;
}

/**
 * A shadcn-style code block: a dark, framed snippet with a language label and a
 * copy button in the header, so copying feels native to the surrounding UI.
 */
function CodeBlock({
    code,
    label,
    isCopied,
    onCopy,
    copyLabel,
    copiedLabel,
    dataTest,
}: {
    code: string;
    label: string;
    isCopied: boolean;
    onCopy: () => void;
    copyLabel: string;
    copiedLabel: string;
    dataTest?: string;
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 py-1.5 pr-1.5 pl-4">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <Code2 className="size-3.5" />
                    <span className="font-mono tracking-tight">{label}</span>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    data-test={dataTest}
                    onClick={onCopy}
                    className="h-7 gap-1.5 px-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                    aria-label={isCopied ? copiedLabel : copyLabel}
                >
                    {isCopied ? (
                        <Check className="size-3.5 text-emerald-400" />
                    ) : (
                        <Copy className="size-3.5" />
                    )}
                    {isCopied ? copiedLabel : copyLabel}
                </Button>
            </div>

            <pre className="overflow-x-auto px-4 py-3.5 text-xs leading-relaxed">
                <code className="font-mono text-zinc-100">
                    {highlightHtml(code)}
                </code>
            </pre>
        </div>
    );
}

/** A titled card wrapping one branding concern. */
function Section({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border bg-card p-6">
            <Heading variant="small" title={title} description={description} />
            <div className="mt-6">{children}</div>
        </section>
    );
}

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

    // Every language the platform offers to choose from.
    const localeOptions =
        (usePage().props.availableLocales as AvailableLocale[]) ?? [];

    // The team's current selection, edited locally until saved.
    const [available, setAvailable] = useState<string[]>(team.availableLocales);
    const [defaultLocale, setDefaultLocale] = useState(team.defaultLocale);

    const toggleAvailable = (code: string, checked: boolean): void => {
        setAvailable((current) => {
            if (checked) {
                return [...current, code];
            }

            // Never leave the team with no languages.
            if (current.length === 1) {
                return current;
            }

            const next = current.filter((value) => value !== code);

            // The default must always be a language that's still offered.
            if (code === defaultLocale) {
                setDefaultLocale(next[0]);
            }

            return next;
        });
    };

    return (
        <>
            <Head title={t('brand.title')} />

            <div className="flex flex-col space-y-6 p-4">
                <Heading
                    variant="small"
                    title={t('brand.title')}
                    description={t('brand.description')}
                />

                {/*
                 * Settings on the left, the booking page they paint on the
                 * right. On a narrow screen the two columns collapse back into
                 * one and the preview lands under the settings that drive it.
                 */}
                <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
                    <div className="flex min-w-0 flex-col space-y-6 xl:col-start-1 xl:row-start-1">
                        {permissions.canUpdateTeam ? (
                            <Section
                                title={t('brand.logo.title')}
                                description={t('brand.logo.description')}
                            >
                                <TeamLogoUploader team={team} />
                            </Section>
                        ) : null}

                        {permissions.canUpdateTeam ? (
                            <Section
                                title={t('brand.color.title')}
                                description={t('brand.color.description')}
                            >
                                <Form
                                    {...BrandController.update.form()}
                                    options={{ preserveScroll: true }}
                                    className="space-y-6"
                                >
                                    {({ errors, processing }) => (
                                        <>
                                            <div className="grid gap-6 sm:grid-cols-2">
                                                <div className="grid content-start gap-2">
                                                    <Label htmlFor="brand_primary_color">
                                                        {t(
                                                            'brand.color.primaryLabel',
                                                        )}
                                                    </Label>

                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="color"
                                                            aria-label={t(
                                                                'brand.color.primaryLabel',
                                                            )}
                                                            value={
                                                                previewPrimary
                                                            }
                                                            data-test="brand-color-swatch"
                                                            onChange={(event) =>
                                                                setPrimary(
                                                                    event.target
                                                                        .value,
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
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <p className="text-xs text-muted-foreground">
                                                        {t('brand.color.hint')}
                                                    </p>

                                                    <InputError
                                                        message={
                                                            errors.brand_primary_color
                                                        }
                                                    />
                                                </div>

                                                {/*
                                                 * The accent is never chosen,
                                                 * only shown: it is the primary
                                                 * at 10%, which is what the
                                                 * booking page washes selected
                                                 * cards with.
                                                 */}
                                                <div className="grid content-start gap-2">
                                                    <Label>
                                                        {t(
                                                            'brand.color.accentLabel',
                                                        )}
                                                    </Label>

                                                    <div className="flex h-10 items-center gap-2">
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
                                                        {t(
                                                            'brand.color.accentHint',
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/*
                                             * A tap changes the colour without
                                             * the OS colour picker covering the
                                             * screen — on a phone that is the
                                             * only way to watch the preview
                                             * below follow the change as it
                                             * happens.
                                             */}
                                            <div className="grid gap-2">
                                                <Label>
                                                    {t('brand.color.presets')}
                                                </Label>

                                                <div className="flex flex-wrap gap-2">
                                                    {PRESET_COLORS.map(
                                                        (preset) => (
                                                            <button
                                                                key={preset}
                                                                type="button"
                                                                aria-label={
                                                                    preset
                                                                }
                                                                aria-pressed={
                                                                    previewPrimary.toLowerCase() ===
                                                                    preset.toLowerCase()
                                                                }
                                                                data-test={`brand-color-preset-${preset.slice(1).toLowerCase()}`}
                                                                onClick={() =>
                                                                    setPrimary(
                                                                        preset,
                                                                    )
                                                                }
                                                                style={{
                                                                    backgroundColor:
                                                                        preset,
                                                                }}
                                                                className={cn(
                                                                    'size-8 rounded-full ring-offset-2 ring-offset-card transition-[box-shadow]',
                                                                    previewPrimary.toLowerCase() ===
                                                                        preset.toLowerCase()
                                                                        ? 'ring-2 ring-foreground'
                                                                        : 'ring-1 ring-border hover:ring-foreground/40',
                                                                )}
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <Button
                                                    type="submit"
                                                    data-test="brand-color-save"
                                                    disabled={processing}
                                                >
                                                    {t('brand.color.save')}
                                                </Button>

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
                                        </>
                                    )}
                                </Form>
                            </Section>
                        ) : null}
                    </div>

                    {/*
                     * The preview follows the colour picker on a phone, where a
                     * right rail is not an option and a preview further down the
                     * page would never be on screen while the colour changes.
                     * On desktop it lifts into its own sticky column, spanning
                     * the settings above and below it.
                     */}
                    <div className="xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:self-stretch">
                        <div className="xl:sticky xl:top-4">
                            <BrandPreview
                                team={team}
                                primary={previewPrimary}
                                bookingUrl={widget.bookingUrl}
                            />
                        </div>
                    </div>

                    <div className="flex min-w-0 flex-col space-y-6 xl:col-start-1 xl:row-start-2">
                        {permissions.canUpdateTeam ? (
                            <Section
                                title={t('brand.languages.title')}
                                description={t('brand.languages.description')}
                            >
                                <Form
                                    {...BrandController.updateLanguages.form()}
                                    options={{ preserveScroll: true }}
                                    className="space-y-6"
                                >
                                    {({ errors, processing }) => (
                                        <>
                                            <div className="grid gap-3">
                                                <Label>
                                                    {t(
                                                        'brand.languages.availableLabel',
                                                    )}
                                                </Label>

                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    {localeOptions.map(
                                                        (locale) => {
                                                            const checked =
                                                                available.includes(
                                                                    locale.code,
                                                                );

                                                            return (
                                                                <label
                                                                    key={
                                                                        locale.code
                                                                    }
                                                                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm"
                                                                    data-test={`brand-language-${locale.code}`}
                                                                >
                                                                    <Checkbox
                                                                        checked={
                                                                            checked
                                                                        }
                                                                        disabled={
                                                                            checked &&
                                                                            available.length ===
                                                                                1
                                                                        }
                                                                        onCheckedChange={(
                                                                            value,
                                                                        ) =>
                                                                            toggleAvailable(
                                                                                locale.code,
                                                                                value ===
                                                                                    true,
                                                                            )
                                                                        }
                                                                    />
                                                                    <span className="font-medium">
                                                                        {
                                                                            locale.native
                                                                        }
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground uppercase">
                                                                        {
                                                                            locale.code
                                                                        }
                                                                    </span>
                                                                </label>
                                                            );
                                                        },
                                                    )}
                                                </div>

                                                {available.map((code) => (
                                                    <input
                                                        key={code}
                                                        type="hidden"
                                                        name="available_locales[]"
                                                        value={code}
                                                    />
                                                ))}

                                                <InputError
                                                    message={
                                                        errors.available_locales
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-3">
                                                <Label htmlFor="default_locale">
                                                    {t(
                                                        'brand.languages.defaultLabel',
                                                    )}
                                                </Label>

                                                <div className="flex flex-wrap gap-2">
                                                    {localeOptions
                                                        .filter((locale) =>
                                                            available.includes(
                                                                locale.code,
                                                            ),
                                                        )
                                                        .map((locale) => (
                                                            <button
                                                                key={
                                                                    locale.code
                                                                }
                                                                type="button"
                                                                data-test={`brand-default-${locale.code}`}
                                                                onClick={() =>
                                                                    setDefaultLocale(
                                                                        locale.code,
                                                                    )
                                                                }
                                                                className={cn(
                                                                    'rounded-lg border px-3 py-2 text-sm transition-colors',
                                                                    defaultLocale ===
                                                                        locale.code
                                                                        ? 'border-primary bg-primary/10 font-medium text-primary'
                                                                        : 'hover:bg-muted',
                                                                )}
                                                            >
                                                                {locale.native}
                                                            </button>
                                                        ))}
                                                </div>

                                                <input
                                                    type="hidden"
                                                    name="default_locale"
                                                    value={defaultLocale}
                                                />

                                                <p className="text-xs text-muted-foreground">
                                                    {t('brand.languages.hint')}
                                                </p>

                                                <InputError
                                                    message={
                                                        errors.default_locale
                                                    }
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                data-test="brand-languages-save"
                                                disabled={processing}
                                            >
                                                {t('brand.languages.save')}
                                            </Button>
                                        </>
                                    )}
                                </Form>
                            </Section>
                        ) : null}

                        {/* Embeddable booking widget */}
                        <section className="rounded-2xl border bg-card p-6">
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
                                        {t('brand.widget.title')}
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {t('brand.widget.description')}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <CodeBlock
                                    code={snippet}
                                    label="index.html"
                                    isCopied={isCopied}
                                    onCopy={() => copy(snippet)}
                                    copyLabel={t('brand.widget.copy')}
                                    copiedLabel={t('brand.widget.copied')}
                                    dataTest="brand-widget-copy"
                                />
                            </div>

                            <a
                                href={widget.bookingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                            >
                                <ExternalLink className="size-3.5" />
                                {t('brand.widget.preview')}
                            </a>
                        </section>
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
