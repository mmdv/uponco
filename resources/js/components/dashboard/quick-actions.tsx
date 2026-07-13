import {
    Briefcase,
    CalendarPlus,
    MapPin,
    Plus,
    UserPlus,
    X,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { useEffect, useRef, useState } from 'react';

import { ACCENTS } from '@/components/dashboard/accents';
import type { Accent } from '@/components/dashboard/accents';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

type Props = {
    onAddAppointment: () => void;
    onAddCustomer: () => void;
    onAddService: () => void;
    onAddLocation: () => void;
};

export default function QuickActions({
    onAddAppointment,
    onAddCustomer,
    onAddService,
    onAddLocation,
}: Props) {
    const { t } = useTranslation('dashboard');
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handlePointerDown = (event: PointerEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    const actions: {
        icon: ComponentType<{ className?: string }>;
        label: string;
        accent: Accent;
        onClick: () => void;
    }[] = [
        {
            icon: CalendarPlus,
            label: t('quickActions.newAppointment'),
            accent: 'indigo',
            onClick: onAddAppointment,
        },
        {
            icon: UserPlus,
            label: t('quickActions.addCustomer'),
            accent: 'emerald',
            onClick: onAddCustomer,
        },
        {
            icon: Briefcase,
            label: t('quickActions.addService'),
            accent: 'sky',
            onClick: onAddService,
        },
        {
            icon: MapPin,
            label: t('quickActions.addLocation'),
            accent: 'rose',
            onClick: onAddLocation,
        },
    ];

    const runAction = (onClick: () => void) => {
        setOpen(false);
        onClick();
    };

    return (
        <div
            ref={containerRef}
            className="fixed right-[calc(1rem+env(safe-area-inset-right))] bottom-[calc(4rem+1rem+env(safe-area-inset-bottom))] z-50 flex flex-col items-end gap-3 lg:bottom-[1.5rem]"
        >
            {open && (
                <div className="flex w-60 origin-bottom-right animate-in flex-col gap-1 rounded-2xl border bg-popover p-2 text-popover-foreground shadow-xl duration-200 zoom-in-95 fade-in slide-in-from-bottom-2">
                    <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        {t('quickActions.label')}
                    </p>
                    {actions.map((action) => (
                        <QuickAction
                            key={action.label}
                            icon={action.icon}
                            label={action.label}
                            accent={action.accent}
                            onClick={() => runAction(action.onClick)}
                        />
                    ))}
                </div>
            )}

            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-label={
                    open
                        ? t('quickActions.closeAria')
                        : t('quickActions.openAria')
                }
                data-test="quick-actions-fab"
                className="flex size-14 items-center justify-center rounded-full bg-primary-gradient text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95"
            >
                <span
                    className={cn(
                        'transition-transform duration-300',
                        open && 'rotate-90',
                    )}
                >
                    {open ? (
                        <X className="size-6" />
                    ) : (
                        <Plus className="size-6" />
                    )}
                </span>
            </button>
        </div>
    );
}

function QuickAction({
    icon: Icon,
    label,
    accent,
    onClick,
}: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    accent: Accent;
    onClick: () => void;
}) {
    const styles = ACCENTS[accent];

    return (
        <button
            type="button"
            onClick={onClick}
            className="group flex items-center gap-3 rounded-xl px-2 py-2 text-left text-sm font-medium transition-colors hover:bg-accent"
        >
            <span
                className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm transition-transform duration-300 group-hover:scale-105',
                    styles.gradient,
                )}
            >
                <Icon className="size-4" />
            </span>
            {label}
        </button>
    );
}
