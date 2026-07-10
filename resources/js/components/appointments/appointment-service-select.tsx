import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import type { ServiceCategoryGroup } from '@/lib/appointments';

type Props = {
    id?: string;
    groups: ServiceCategoryGroup[];
    value: string;
    onChange: (value: string) => void;
    invalid?: boolean;
    'data-test'?: string;
};

/**
 * A select control for choosing a service, with options grouped by category.
 */
export default function AppointmentServiceSelect({
    id,
    groups,
    value,
    onChange,
    invalid,
    ...props
}: Props) {
    const { t } = useTranslation('appointments');

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger
                id={id}
                aria-invalid={invalid}
                className="w-full"
                {...props}
            >
                <SelectValue placeholder={t('form.selectService')} />
            </SelectTrigger>
            <SelectContent>
                {groups.map((group) => (
                    <SelectGroup key={group.id}>
                        <SelectLabel>{group.name}</SelectLabel>
                        {group.services.map((service) => (
                            <SelectItem
                                key={service.id}
                                value={service.id.toString()}
                            >
                                {service.title}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                ))}
            </SelectContent>
        </Select>
    );
}
