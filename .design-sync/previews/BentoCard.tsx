import { Building2, MapPin, Palette, Wrench } from 'lucide-react';
import {
    BentoCard,
    BrandGraphic,
    BusinessGraphic,
    LocationsGraphic,
    ServicesGraphic,
} from 'uponco';

/**
 * Mirrors `ACCENTS` from `@/components/accents` — every company tile is a
 * shade of the brand blue rather than its own hue.
 */
const ACCENTS = {
    ink: {
        gradient: 'from-[#00307f] to-[#0052d6]',
        shadow: 'shadow-[0_8px_18px_-8px_rgba(0,48,127,0.75)]',
        soft: 'bg-[#00307f]/10',
        text: 'text-[#00307f] dark:text-[#8fbaff]',
        ring: 'hover:border-[#00307f]/40',
        wash: 'from-[#00307f]/[0.08] dark:from-[#3884fe]/[0.09]',
        graphic: 'text-[#00307f] dark:text-[#6aa6ff]',
    },
    deep: {
        gradient: 'from-[#0047b8] to-[#0063ff]',
        shadow: 'shadow-[0_8px_18px_-8px_rgba(0,71,184,0.75)]',
        soft: 'bg-[#0047b8]/10',
        text: 'text-[#0047b8] dark:text-[#8fbaff]',
        ring: 'hover:border-[#0047b8]/40',
        wash: 'from-[#0047b8]/[0.09] dark:from-[#3884fe]/[0.1]',
        graphic: 'text-[#0047b8] dark:text-[#6aa6ff]',
    },
    brand: {
        gradient: 'from-[#0063ff] to-[#3884fe]',
        shadow: 'shadow-[0_8px_18px_-8px_rgba(0,99,255,0.75)]',
        soft: 'bg-[#0063ff]/10',
        text: 'text-[#0063ff] dark:text-[#8fbaff]',
        ring: 'hover:border-[#0063ff]/40',
        wash: 'from-[#0063ff]/[0.09] dark:from-[#3884fe]/[0.11]',
        graphic: 'text-[#0063ff] dark:text-[#5b9bff]',
    },
    soft: {
        gradient: 'from-[#4d8dff] to-[#8fbaff]',
        shadow: 'shadow-[0_8px_18px_-8px_rgba(77,141,255,0.75)]',
        soft: 'bg-[#4d8dff]/10',
        text: 'text-[#0063ff] dark:text-[#a5c8ff]',
        ring: 'hover:border-[#4d8dff]/50',
        wash: 'from-[#4d8dff]/[0.11] dark:from-[#3884fe]/[0.13]',
        graphic: 'text-[#4d8dff] dark:text-[#8fbaff]',
    },
};

export function Default() {
    return (
        <div className="w-72">
            <BentoCard
                href="/company/services"
                mounted
                delay={0}
                icon={Wrench}
                accent={ACCENTS.deep}
                graphic={<ServicesGraphic />}
                title="Services"
                description="What clients can book and what it costs."
            />
        </div>
    );
}

export function WithBodyContent() {
    return (
        <div className="w-72">
            <BentoCard
                href="/company/business"
                mounted
                delay={0}
                icon={Building2}
                accent={ACCENTS.ink}
                graphic={<BusinessGraphic />}
                title="Business"
                description="Name, category and the people who work here."
            >
                <div className="mt-auto">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tracking-tight tabular-nums">
                            6
                        </span>
                        <span className="text-sm font-medium text-foreground/70">
                            members across 3 roles
                        </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            Owner
                        </span>
                        <span className="inline-flex items-center rounded-full border border-black/10 px-2.5 py-0.5 text-xs font-medium text-foreground/80 dark:border-border">
                            Specialist · 4
                        </span>
                        <span className="inline-flex items-center rounded-full border border-black/10 px-2.5 py-0.5 text-xs font-medium text-foreground/80 dark:border-border">
                            Front desk
                        </span>
                    </div>
                </div>
            </BentoCard>
        </div>
    );
}

export function Compact() {
    return (
        <div className="w-72">
            <BentoCard
                href="/company/brand"
                mounted
                delay={0}
                compact
                icon={Palette}
                accent={ACCENTS.soft}
                graphic={<BrandGraphic />}
                title="Brand"
                description="Logo and colour on your booking page."
            />
        </div>
    );
}

export function AccentGrid() {
    return (
        <div className="grid w-full max-w-3xl grid-cols-2 gap-4">
            <BentoCard
                href="/company/business"
                mounted
                delay={0}
                icon={Building2}
                accent={ACCENTS.ink}
                graphic={<BusinessGraphic />}
                title="Business"
                description="Name, category and team."
            />
            <BentoCard
                href="/company/services"
                mounted
                delay={60}
                icon={Wrench}
                accent={ACCENTS.deep}
                graphic={<ServicesGraphic />}
                title="Services"
                description="12 bookable services."
            />
            <BentoCard
                href="/company/locations"
                mounted
                delay={120}
                icon={MapPin}
                accent={ACCENTS.brand}
                graphic={<LocationsGraphic />}
                title="Locations"
                description="Nizami Street Studio + 1 more."
            />
            <BentoCard
                href="/company/brand"
                mounted
                delay={180}
                icon={Palette}
                accent={ACCENTS.soft}
                graphic={<BrandGraphic />}
                title="Brand"
                description="Logo and colour."
            />
        </div>
    );
}
