import { Head } from '@inertiajs/react';
import {
    Check,
    Code2,
    Copy,
    ExternalLink,
    Image,
    Palette,
    Sparkles,
    Type,
} from 'lucide-react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/use-clipboard';
import { cn } from '@/lib/utils';
import { index as companyIndex } from '@/routes/company';
import { index as brandIndex } from '@/routes/company/brand';

/** Brand-primary gradient reused across the company surfaces. */
const PRIMARY_GRADIENT = 'from-[#0063ff] to-[#3884fe]';

const UPCOMING_FEATURES = [
    {
        icon: Palette,
        title: 'Brand colors',
        description: 'Pick the palette that shows up across your booking page.',
    },
    {
        icon: Image,
        title: 'Logo & imagery',
        description: 'Showcase your logo and cover photos to customers.',
    },
    {
        icon: Type,
        title: 'Typography',
        description: 'Choose fonts that match your brand personality.',
    },
];

type Props = {
    widget: {
        scriptUrl: string;
        bookingUrl: string;
    };
};

export default function BrandIndex({ widget }: Props) {
    const snippet = `<script type="text/javascript" src="${widget.scriptUrl}" charset="UTF-8"></script>`;

    const [copiedText, copy] = useClipboard();
    const isCopied = copiedText === snippet;

    return (
        <>
            <Head title="Brand" />

            <div className="flex flex-col space-y-6 p-4">
                <Heading
                    variant="small"
                    title="Brand"
                    description="Manage your company brand"
                />

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
                                tag. A “Book online” button appears in the corner
                                and opens your booking page in a pop-up.
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

                <div className="relative overflow-hidden rounded-2xl border bg-card">
                    {/* Ambient gradient glow */}
                    <div
                        aria-hidden
                        className={cn(
                            'pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-gradient-to-br opacity-15 blur-3xl',
                            PRIMARY_GRADIENT,
                        )}
                    />

                    <div className="relative flex flex-col items-center px-6 py-16 text-center">
                        <div
                            className={cn(
                                'flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg',
                                PRIMARY_GRADIENT,
                            )}
                        >
                            <Palette className="size-8" />
                        </div>

                        <span className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                            <Sparkles className="size-3.5" />
                            Coming soon
                        </span>

                        <h3 className="mt-4 text-xl font-semibold tracking-tight">
                            Brand customization is on the way
                        </h3>
                        <p className="mt-2 max-w-md text-sm text-muted-foreground">
                            Soon you'll be able to tailor how your business
                            looks to customers — colors, logo, and typography,
                            all in one place.
                        </p>

                        <div className="mt-10 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
                            {UPCOMING_FEATURES.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="flex flex-col items-center gap-3 rounded-xl border bg-muted/30 p-5 text-center"
                                >
                                    <div
                                        className={cn(
                                            'flex size-10 items-center justify-center rounded-lg bg-gradient-to-br text-white',
                                            PRIMARY_GRADIENT,
                                        )}
                                    >
                                        <feature.icon className="size-5" />
                                    </div>
                                    <div className="text-sm font-medium">
                                        {feature.title}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
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
            href: props.currentTeam
                ? companyIndex(props.currentTeam.slug)
                : '/',
        },
        {
            title: 'Brand',
            href: props.currentTeam ? brandIndex(props.currentTeam.slug) : '/',
        },
    ],
});
