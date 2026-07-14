import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { useTranslation } from '@/hooks/use-translation';

export function ThemeSwitcher() {
    const { t } = useTranslation('nav');
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const isDark = resolvedAppearance === 'dark';
    const Icon = isDark ? Moon : Sun;

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            className="group h-9 w-9 cursor-pointer"
        >
            <Icon className="size-5! opacity-80 group-hover:opacity-100" />
            <span className="sr-only">{t('toggleTheme')}</span>
        </Button>
    );
}
