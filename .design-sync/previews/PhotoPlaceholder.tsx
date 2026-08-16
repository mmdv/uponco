import { Check } from 'lucide-react';
import { PhotoPlaceholder } from 'uponco';

/** Stands in for salon photography without reaching outside the bundle. */
const SALON_PHOTO =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">
            <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#0063ff"/>
                    <stop offset="1" stop-color="#9bd0ff"/>
                </linearGradient>
            </defs>
            <rect width="240" height="240" fill="url(#g)"/>
            <circle cx="80" cy="86" r="42" fill="#ffffff" opacity="0.35"/>
            <rect x="0" y="150" width="240" height="90" fill="#ffffff" opacity="0.2"/>
        </svg>`,
    );

const SERVICES = [
    {
        id: 1,
        title: 'Deep Tissue Massage',
        meta: '60 min · ₼80',
        description: 'Firm pressure for shoulders, back and neck.',
        selected: true,
    },
    {
        id: 2,
        title: 'Gel Manicure',
        meta: '45 min · ₼35',
        description: 'Shape, cuticle care and a two-week gel finish.',
        selected: false,
    },
    {
        id: 3,
        title: 'Beard Trim',
        meta: '30 min · ₼20',
        description: 'Line-up, hot towel and beard oil.',
        selected: false,
    },
];

export function InTheServicePicker() {
    return (
        <div className="max-w-md space-y-2">
            <p className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Massage &amp; nails
            </p>
            {SERVICES.map((service) => (
                <div
                    key={service.id}
                    className={
                        service.selected
                            ? 'flex w-full items-center gap-3 rounded-xl border border-primary p-2.5 text-left'
                            : 'flex w-full items-center gap-3 rounded-xl border border-border p-2.5 text-left'
                    }
                >
                    <PhotoPlaceholder className="size-14 shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                            {service.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {service.meta}
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/80">
                            {service.description}
                        </p>
                    </div>
                    <span
                        className={
                            service.selected
                                ? 'flex size-5 shrink-0 items-center justify-center rounded-full border border-primary bg-primary text-primary-foreground'
                                : 'flex size-5 shrink-0 items-center justify-center rounded-full border border-muted-foreground/30'
                        }
                    >
                        {service.selected && <Check className="size-3" />}
                    </span>
                </div>
            ))}
        </div>
    );
}

export function WithARealPhoto() {
    return (
        <div className="flex max-w-md items-center gap-3 rounded-xl border border-border p-2.5">
            <PhotoPlaceholder
                src={SALON_PHOTO}
                alt="Treatment room at Nizami Street Studio"
                className="size-14 shrink-0 rounded-lg"
            />
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                    Hot Stone Therapy
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    90 min · ₼120
                </p>
            </div>
        </div>
    );
}

export function CoverAndAvatarShapes() {
    return (
        <div className="max-w-md space-y-4">
            <PhotoPlaceholder className="h-32 w-full rounded-2xl" />
            <div className="flex items-center gap-4">
                <PhotoPlaceholder className="size-16 rounded-full" />
                <PhotoPlaceholder className="size-16 rounded-lg" />
                <PhotoPlaceholder
                    src={SALON_PHOTO}
                    alt="Aurora Beauty Studio"
                    className="size-16 rounded-full"
                />
            </div>
        </div>
    );
}
