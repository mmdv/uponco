import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { Building2, ChevronLeft, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import OnboardController from '@/actions/App/Http/Controllers/OnboardController';
import InputError from '@/components/input-error';
import ChoiceCard from '@/components/services/service-wizard/choice-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectDialog } from '@/components/ui/select-dialog';
import { Spinner } from '@/components/ui/spinner';
import { businessCategoryIcon } from '@/lib/business-category-icons';
import { detectTimezone, timeInTimezone } from '@/lib/timezone-country';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslateFn } from '@/hooks/use-translation';
import type { SelectOption } from '@/types';

type TeamType = 'individual' | 'organisation';

type Props = {
    team: {
        name: string | null;
        type: TeamType | null;
        timezone: string | null;
        businessCategory: string | null;
        businessCategoryOther: string | null;
    };
    userName: string;
    timezones: SelectOption[];
    businessCategories: SelectOption[];
};

const OTHER_CATEGORY = 'other';

/**
 * The copy on the details step, which asks a solo practitioner for their own
 * name and a company for its trading name.
 */
function detailsCopy(t: TranslateFn, type: TeamType) {
    return {
        title: t(`gate.details.${type}.title`),
        description: t(`gate.details.${type}.description`),
        nameLabel: t(`gate.details.${type}.nameLabel`),
        namePlaceholder: t(`gate.details.${type}.namePlaceholder`),
        nameHint: t(`gate.details.${type}.nameHint`),
    };
}

/** How often the clock under the timezone picker catches up with itself. */
const CLOCK_INTERVAL = 30_000;

/**
 * The current instant. Read from a module function rather than inline so the
 * component itself stays free of impure reads.
 */
function clockTick(): number {
    return Date.now();
}

/**
 * Pick the timezone to start on: whatever the team already saved, otherwise the
 * browser's own zone as long as the server offers it as a choice.
 */
function initialTimezone(
    saved: string | null,
    options: SelectOption[],
): string {
    if (saved) {
        return saved;
    }

    const detected = detectTimezone();

    return detected && options.some((option) => option.value === detected)
        ? detected
        : '';
}

export default function Onboard({
    team,
    userName,
    timezones,
    businessCategories,
}: Props) {
    const { t } = useTranslation('onboard');

    /**
     * Teams created before this question existed were all backfilled as
     * organisations, so a stored type only counts as an answer once the team
     * has a name to go with it.
     */
    const [type, setType] = useState<TeamType | ''>(
        team.name && team.type ? team.type : '',
    );
    const [step, setStep] = useState<'type' | 'details'>('type');
    const [businessCategory, setBusinessCategory] = useState(
        team.businessCategory ?? '',
    );
    const [businessCategoryOther, setBusinessCategoryOther] = useState(
        team.businessCategoryOther ?? '',
    );
    const [timezone, setTimezone] = useState(() =>
        initialTimezone(team.timezone, timezones),
    );

    const copy = detailsCopy(t, type === '' ? 'organisation' : type);

    // The same icon the customer meets on the booking page, so picking a
    // category here shows what it will look like there.
    const categoryOptions = businessCategories.map((option) => ({
        ...option,
        icon: businessCategoryIcon(option.value),
    }));

    setLayoutProps(
        step === 'type'
            ? {
                  title: t('gate.type.title'),
                  description: t('gate.type.description'),
                  showAccountMenu: true,
              }
            : {
                  title: copy.title,
                  description: copy.description,
                  showAccountMenu: true,
              },
    );

    /**
     * Starts empty and is filled once the page is live, so the server never
     * renders a clock that the browser would immediately disagree with.
     */
    const [tick, setTick] = useState<number>();

    useEffect(() => {
        const start = window.setTimeout(() => setTick(clockTick()), 0);
        const interval = window.setInterval(
            () => setTick(clockTick()),
            CLOCK_INTERVAL,
        );

        return () => {
            window.clearTimeout(start);
            window.clearInterval(interval);
        };
    }, []);

    const localTime =
        timezone && tick ? timeInTimezone(timezone, new Date(tick)) : undefined;

    return (
        <>
            <Head title={t('headTitle')} />

            <Form
                {...OnboardController.update.form()}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <div className="grid gap-6">
                        <input type="hidden" name="type" value={type} />

                        {step === 'type' ? (
                            <>
                                <div
                                    role="radiogroup"
                                    aria-label={t('gate.type.title')}
                                    className="space-y-3"
                                >
                                    <ChoiceCard
                                        icon={User}
                                        title={t('gate.type.individual.title')}
                                        description={t(
                                            'gate.type.individual.description',
                                        )}
                                        selected={type === 'individual'}
                                        onSelect={() => setType('individual')}
                                        data-test="onboard-type-individual"
                                    />
                                    <ChoiceCard
                                        icon={Building2}
                                        title={t(
                                            'gate.type.organisation.title',
                                        )}
                                        description={t(
                                            'gate.type.organisation.description',
                                        )}
                                        selected={type === 'organisation'}
                                        onSelect={() => setType('organisation')}
                                        data-test="onboard-type-organisation"
                                    />
                                </div>
                                <InputError message={errors.type} />

                                <Button
                                    type="button"
                                    className="mt-2 w-full"
                                    disabled={type === ''}
                                    onClick={() => setStep('details')}
                                    data-test="onboard-type-continue"
                                >
                                    {t('gate.type.continue')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setStep('type')}
                                    className="-mt-2 -ml-2 flex w-fit items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
                                    data-test="onboard-back"
                                >
                                    <ChevronLeft className="size-4" />
                                    {t('gate.details.back')}
                                </button>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        {copy.nameLabel}
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        name="name"
                                        key={type}
                                        defaultValue={
                                            team.name ??
                                            (type === 'individual'
                                                ? userName
                                                : '')
                                        }
                                        placeholder={copy.namePlaceholder}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        {copy.nameHint}
                                    </p>
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <input
                                        type="hidden"
                                        name="business_category"
                                        value={businessCategory}
                                    />
                                    <input
                                        type="hidden"
                                        name="business_category_other"
                                        value={businessCategoryOther}
                                    />
                                    <Label htmlFor="business_category">
                                        {t('gate.details.category.label')}
                                    </Label>
                                    <SelectDialog
                                        id="business_category"
                                        title={t(
                                            'gate.details.category.dialogTitle',
                                        )}
                                        options={categoryOptions}
                                        value={businessCategory}
                                        onChange={setBusinessCategory}
                                        customTriggerValue={OTHER_CATEGORY}
                                        customValue={businessCategoryOther}
                                        onCustomChange={
                                            setBusinessCategoryOther
                                        }
                                        customLabel={t(
                                            'gate.details.category.customLabel',
                                        )}
                                        customPlaceholder={t(
                                            'gate.details.category.customPlaceholder',
                                        )}
                                        placeholder={t(
                                            'gate.details.category.placeholder',
                                        )}
                                        searchPlaceholder={t(
                                            'gate.details.category.searchPlaceholder',
                                        )}
                                        emptyMessage={t(
                                            'gate.details.category.emptyMessage',
                                        )}
                                        invalid={Boolean(
                                            errors.business_category ||
                                            errors.business_category_other,
                                        )}
                                    />
                                    <InputError
                                        message={
                                            errors.business_category ??
                                            errors.business_category_other
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <input
                                        type="hidden"
                                        name="timezone"
                                        value={timezone}
                                    />
                                    <Label htmlFor="timezone">
                                        {t('gate.details.timezone.label')}
                                    </Label>
                                    <SelectDialog
                                        id="timezone"
                                        title={t(
                                            'gate.details.timezone.dialogTitle',
                                        )}
                                        options={timezones}
                                        value={timezone}
                                        onChange={setTimezone}
                                        placeholder={t(
                                            'gate.details.timezone.placeholder',
                                        )}
                                        searchPlaceholder={t(
                                            'gate.details.timezone.searchPlaceholder',
                                        )}
                                        emptyMessage={t(
                                            'gate.details.timezone.emptyMessage',
                                        )}
                                        invalid={Boolean(errors.timezone)}
                                    />
                                    {localTime ? (
                                        <p
                                            className="text-sm text-muted-foreground"
                                            data-test="onboard-timezone-time"
                                        >
                                            {t(
                                                'gate.details.timezone.localTime',
                                                {
                                                    time: localTime,
                                                },
                                            )}
                                        </p>
                                    ) : null}
                                    <InputError message={errors.timezone} />
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-2 w-full"
                                    tabIndex={2}
                                    data-test="onboard-submit-button"
                                >
                                    {processing && <Spinner />}
                                    {t('gate.details.continue')}
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </Form>
        </>
    );
}
