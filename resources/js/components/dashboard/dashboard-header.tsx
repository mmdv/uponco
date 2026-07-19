import { useTranslation } from '@/hooks/use-translation';

type Props = {
    firstName: string;
};

export default function DashboardHeader({ firstName }: Props) {
    const { t } = useTranslation('dashboard');

    return (
        <div className="space-y-0.5">
            <h2 className="text-xl font-semibold tracking-tight">
                {t('header.welcomeBack')}{' '}
                <span className="bg-gradient-to-r from-[#0063ff] to-[#3884fe] bg-clip-text text-transparent">
                    {firstName}
                </span>
            </h2>
            <p className="text-sm text-muted-foreground">
                {t('header.subtitle')}
            </p>
        </div>
    );
}
