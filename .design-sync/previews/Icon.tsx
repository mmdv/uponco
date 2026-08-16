import { CalendarDays, Clock, Scissors, Sparkles, Users } from 'lucide-react';
import { Icon } from 'uponco';

/**
 * `Icon` renders whatever Lucide component a record carries — used for the
 * business-category and service icons resolved at runtime.
 */
export function Default() {
    return (
        <div className="flex max-w-md items-center gap-2 rounded-xl border px-3 py-2 text-sm">
            <Icon iconNode={Scissors} className="size-5 text-primary" />
            <span className="font-medium">Signature Cut &amp; Finish</span>
            <span className="ml-auto text-muted-foreground">₼ 60 · 45 min</span>
        </div>
    );
}

/** The same wrapper across the icons a service list resolves to. */
export function ServiceCategoryRow() {
    return (
        <div className="flex flex-wrap items-center gap-4">
            {[Scissors, Sparkles, CalendarDays, Users, Clock].map(
                (iconNode, index) => (
                    <span
                        key={index}
                        className="flex size-10 items-center justify-center rounded-xl bg-primary/10"
                    >
                        <Icon
                            iconNode={iconNode}
                            className="size-5 text-primary"
                        />
                    </span>
                ),
            )}
        </div>
    );
}

/** Sized and coloured by className, as service rows and stat tiles do. */
export function SizesAndTones() {
    return (
        <div className="flex items-center gap-4">
            <Icon iconNode={Sparkles} className="size-4 text-muted-foreground" />
            <Icon iconNode={Sparkles} className="size-5 text-foreground" />
            <Icon iconNode={Sparkles} className="size-6 text-primary" />
            <Icon iconNode={Sparkles} className="size-8 text-destructive" />
        </div>
    );
}

/**
 * A record with no icon resolves to `null`, so `Icon` renders nothing and the
 * row falls back to its label alone.
 */
export function NoIconFallback() {
    return (
        <div className="flex max-w-md items-center gap-2 rounded-xl border px-3 py-2 text-sm">
            <Icon iconNode={null} className="size-5" />
            <span className="font-medium">Gel Manicure</span>
            <span className="ml-auto text-muted-foreground">₼ 45 · 45 min</span>
        </div>
    );
}
