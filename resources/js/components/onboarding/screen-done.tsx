import { Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { dashboard } from '@/routes';

import { ScreenBody, ScreenFooterBar } from './onboarding-screen';

export default function ScreenDone() {
    const { t } = useTranslation('onboard');

    return (
        <div className="flex min-h-full flex-1 flex-col">
            <ScreenBody className="items-center text-center">
                <CheckCircle2 className="size-14 text-primary" />

                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground md:text-3xl">
                        {t('done.title')}
                    </h1>
                    <p className="text-base text-pretty text-muted-foreground">
                        {t('done.description')}
                    </p>
                </div>
            </ScreenBody>

            <ScreenFooterBar>
                <div className="flex justify-center">
                    <Button
                        asChild
                        size="lg"
                        className="w-full sm:w-auto sm:min-w-40"
                    >
                        <Link href={dashboard()} data-test="onboarding-done">
                            {t('done.goToDashboard')}
                        </Link>
                    </Button>
                </div>
            </ScreenFooterBar>
        </div>
    );
}
